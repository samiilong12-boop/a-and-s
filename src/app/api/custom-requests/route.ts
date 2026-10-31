import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { BespokePerfumeRequest } from '@/types';
import { verifyAdminSession } from '@/lib/serverAuth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

interface BespokeStorage {
  initialized: boolean;
  requests: BespokePerfumeRequest[];
  deletedIds: string[];
}

declare global {
  var __BESPOKE_STORE__: BespokeStorage | undefined;
}

const tmpFilePath = path.join(os.tmpdir(), 'raheeq-custom-requests-v3.json');
const publicFilePath = path.join(process.cwd(), 'public', 'data', 'custom-requests.json');

function getStore(): BespokeStorage {
  if (globalThis.__BESPOKE_STORE__) {
    return globalThis.__BESPOKE_STORE__;
  }

  // 1. Try reading /tmp storage
  try {
    if (fs.existsSync(tmpFilePath)) {
      const data = fs.readFileSync(tmpFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        if (parsed.initialized && Array.isArray(parsed.requests)) {
          globalThis.__BESPOKE_STORE__ = {
            initialized: true,
            requests: parsed.requests,
            deletedIds: Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [],
          };
          return globalThis.__BESPOKE_STORE__;
        } else if (Array.isArray(parsed)) {
          globalThis.__BESPOKE_STORE__ = {
            initialized: true,
            requests: parsed,
            deletedIds: [],
          };
          return globalThis.__BESPOKE_STORE__;
        }
      }
    }
  } catch {}

  // 2. Try reading public/data/custom-requests.json
  try {
    if (fs.existsSync(publicFilePath)) {
      const data = fs.readFileSync(publicFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        globalThis.__BESPOKE_STORE__ = {
          initialized: true,
          requests: parsed,
          deletedIds: [],
        };
        return globalThis.__BESPOKE_STORE__;
      }
    }
  } catch {}

  // Default empty store
  const defaultStore: BespokeStorage = {
    initialized: true,
    requests: [],
    deletedIds: [],
  };
  globalThis.__BESPOKE_STORE__ = defaultStore;
  return defaultStore;
}

function persistStore(store: BespokeStorage) {
  globalThis.__BESPOKE_STORE__ = store;
  try {
    fs.writeFileSync(tmpFilePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed writing bespoke store to tmp:', e);
  }

  try {
    const dir = path.dirname(publicFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // Write active & archived requests that are NOT deleted
    fs.writeFileSync(publicFilePath, JSON.stringify(store.requests.filter(r => !store.deletedIds.includes(r.id) && !r.deletedAt), null, 2), 'utf-8');
  } catch {}
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const cleanDigits = (s?: string) => (s || '').replace(/[^0-9]/g, '');
const cleanStr = (s?: string) => (s || '').trim().toLowerCase().replace(/^#/, '');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get('id');
  const targetPhone = searchParams.get('phone');

  const store = getStore();
  const deletedSet = new Set(store.deletedIds);
  const activeAndArchived = store.requests.filter(
    (r) => !deletedSet.has(r.id) && !r.deletedAt
  );

  // Mode 1: Customer tracking lookup
  if (targetId || targetPhone) {
    const cleanId = cleanStr(targetId || '');
    const phoneDigits = cleanDigits(targetPhone || '');

    // Check DB first if available
    try {
      const { prisma } = await import('@/lib/prisma');
      const dbMatched = await prisma.bespokeRequest.findFirst({
        where: {
          deletedAt: null,
          OR: [
            ...(cleanId ? [{ id: cleanId }] : []),
            ...(phoneDigits.length >= 6 ? [{ customerPhone: { contains: phoneDigits.slice(-8) } }] : []),
          ],
        },
      });
      if (dbMatched) {
        const maskedPhone = dbMatched.customerPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
        return NextResponse.json({
          success: true,
          request: {
            ...dbMatched,
            createdAt: dbMatched.createdAt.toISOString(),
            archivedAt: dbMatched.archivedAt?.toISOString() || null,
            customerPhone: maskedPhone,
          },
        });
      }
    } catch {}

    const matched = activeAndArchived.find((r) => {
      const rId = cleanStr(r.id);
      const rPhone = cleanDigits(r.customerPhone);
      const idMatch = cleanId ? (rId === cleanId || rId.endsWith(cleanId) || cleanId.endsWith(rId)) : false;
      const phoneMatch = phoneDigits.length >= 6 ? rPhone.endsWith(phoneDigits.slice(-8)) : false;
      if (cleanId && phoneDigits) return idMatch && phoneMatch;
      return idMatch || phoneMatch;
    });

    if (matched) {
      const maskedPhone = matched.customerPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
      return NextResponse.json({
        success: true,
        request: {
          ...matched,
          customerPhone: maskedPhone,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'لم يتم العثور على طلب مطابق' }, { status: 404 });
  }

  // Mode 2: Admin list all requests (Protected by server session)
  const isAdmin = await verifyAdminSession(req);
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'غير مصرح بالوصول لقائمة الطلبات الخاصة' },
      { status: 401 }
    );
  }

  // 1. Authoritative Database Query (Prisma PostgreSQL)
  try {
    const { prisma } = await import('@/lib/prisma');
    const dbRequests = await prisma.bespokeRequest.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    if (Array.isArray(dbRequests) && dbRequests.length > 0) {
      const serialized = dbRequests.map((r) => ({
        id: r.id,
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        perfumeName: r.perfumeName,
        volumeMl: r.volumeMl,
        concentration: r.concentration,
        notes: r.notes || '',
        status: (r.status as BespokePerfumeRequest['status']) || 'NEW',
        isArchived: r.isArchived || r.status === 'FULFILLED' || r.status === 'COMPLETED',
        archivedAt: r.archivedAt?.toISOString() || null,
        deletedAt: r.deletedAt?.toISOString() || null,
        createdAt: r.createdAt.toISOString(),
      }));

      // Keep fallback store synchronized with confirmed database items
      store.requests = serialized;
      persistStore(store);

      return NextResponse.json(serialized, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }
  } catch {}

  // 2. Resilient Fallback Store (when DB is offline or in local mock mode)
  return NextResponse.json(activeAndArchived, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`bespoke_req_${clientIp}`, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'تم إرسال طلبات متعددة، يرجى الانتظار قليلاً قبل إرسال طلب جديد.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const customerName = String(body.customerName || 'عميل رحيق').trim().slice(0, 100);
    const customerPhone = String(body.customerPhone || '').trim().slice(0, 25);
    const perfumeName = String(body.perfumeName || '').trim().slice(0, 150);
    const volumeMl = String(body.volumeMl || '100ml').trim().slice(0, 30);
    const concentration = String(body.concentration || 'EXTRAIT_DE_PARFUM').trim().slice(0, 50);
    const notes = String(body.notes || '').trim().slice(0, 500);

    if (!perfumeName || !customerPhone) {
      return NextResponse.json({ success: false, error: 'اسم العطر ورقم الهاتف مطلوبان' }, { status: 400 });
    }

    const id = body.id || `REQ-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const createdAt = body.createdAt || new Date().toISOString();

    const newRequest: BespokePerfumeRequest = {
      id,
      customerName,
      customerPhone,
      perfumeName,
      volumeMl,
      concentration,
      notes,
      status: 'NEW',
      isArchived: false,
      archivedAt: null,
      deletedAt: null,
      createdAt,
    };

    const store = getStore();
    store.deletedIds = store.deletedIds.filter((delId) => delId !== id);
    store.requests = [newRequest, ...store.requests.filter((r) => r.id !== id)];
    persistStore(store);

    // Persist to Prisma PostgreSQL
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.bespokeRequest.upsert({
        where: { id },
        create: {
          id,
          customerName,
          customerPhone,
          perfumeName,
          volumeMl,
          concentration,
          notes,
          status: 'NEW',
          isArchived: false,
        },
        update: {},
      });
    } catch {}

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error) {
    console.error('Failed to create custom request:', error);
    return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح بتعديل الطلبات بدون جلسة إدارة نشطة' }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, isArchived, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing request id' }, { status: 400 });
    }

    const store = getStore();
    const target = store.requests.find((r) => r.id === id);

    let updatedIsArchived = isArchived !== undefined ? Boolean(isArchived) : (target?.isArchived || false);
    let updatedArchivedAt = target?.archivedAt || null;

    // Transition rules: FULFILLED or COMPLETED moves to archive
    if (status === 'FULFILLED' || status === 'COMPLETED' || isArchived === true) {
      updatedIsArchived = true;
      updatedArchivedAt = new Date().toISOString();
    } else if (status === 'NEW' || status === 'CONTACTED') {
      if (isArchived === false) {
        updatedIsArchived = false;
        updatedArchivedAt = null;
      }
    }

    const updatedRequest: BespokePerfumeRequest = {
      ...(target || {
        id,
        customerName: 'عميل رحيق',
        customerPhone: '',
        perfumeName: 'طلب مخصص',
        volumeMl: '100ml',
        concentration: 'EXTRAIT_DE_PARFUM',
        createdAt: new Date().toISOString(),
      }),
      status: (status || target?.status || 'NEW') as BespokePerfumeRequest['status'],
      ...(notes !== undefined ? { notes } : {}),
      isArchived: updatedIsArchived,
      archivedAt: updatedArchivedAt,
      deletedAt: null,
    };

    store.requests = store.requests.map((r) => (r.id === id ? updatedRequest : r));
    if (!target) store.requests.unshift(updatedRequest);
    persistStore(store);

    // Persist to Authoritative Prisma Database
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.bespokeRequest.updateMany({
        where: { id },
        data: {
          ...(status ? { status } : {}),
          isArchived: updatedIsArchived,
          archivedAt: updatedArchivedAt ? new Date(updatedArchivedAt) : null,
          ...(notes !== undefined ? { notes } : {}),
        },
      });

      await prisma.auditLog.create({
        data: {
          action: updatedIsArchived ? 'BESPOKE_ARCHIVED' : 'BESPOKE_STATUS_UPDATE',
          entity: 'BespokeRequest',
          entityId: id,
          details: { status, isArchived: updatedIsArchived, archivedAt: updatedArchivedAt },
        },
      }).catch(() => {});
    } catch (dbErr) {
      console.warn('Database patch error on bespoke request:', dbErr);
    }

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error('Failed to update custom request:', error);
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح بحذف الطلبات بدون جلسة إدارة نشطة' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const clearFulfilled = searchParams.get('clearFulfilled');
    const store = getStore();

    if (clearFulfilled === 'true') {
      const fulfilledIds = store.requests
        .filter((r) => r.status === 'FULFILLED' || r.status === 'COMPLETED' || r.isArchived)
        .map((r) => r.id);

      store.deletedIds = Array.from(new Set([...store.deletedIds, ...fulfilledIds]));
      store.requests = store.requests.map((r) =>
        fulfilledIds.includes(r.id) ? { ...r, deletedAt: new Date().toISOString() } : r
      );
      persistStore(store);

      try {
        const { prisma } = await import('@/lib/prisma');
        await prisma.bespokeRequest.updateMany({
          where: {
            OR: [
              { status: { in: ['FULFILLED', 'COMPLETED'] } },
              { isArchived: true },
            ],
            deletedAt: null,
          },
          data: { deletedAt: new Date() },
        });

        await prisma.auditLog.create({
          data: {
            action: 'BESPOKE_CLEAR_FULFILLED',
            entity: 'BespokeRequest',
            entityId: 'ALL_FULFILLED',
            details: { count: fulfilledIds.length, ids: fulfilledIds },
          },
        }).catch(() => {});
      } catch {}

      return NextResponse.json({ success: true, deletedCount: fulfilledIds.length });
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing request id' }, { status: 400 });
    }

    // Soft delete target request
    store.deletedIds = Array.from(new Set([...store.deletedIds, id]));
    store.requests = store.requests.map((r) =>
      r.id === id ? { ...r, deletedAt: new Date().toISOString() } : r
    );
    persistStore(store);

    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.bespokeRequest.updateMany({
        where: { id },
        data: { deletedAt: new Date() },
      });

      await prisma.auditLog.create({
        data: {
          action: 'BESPOKE_SOFT_DELETED',
          entity: 'BespokeRequest',
          entityId: id,
        },
      }).catch(() => {});
    } catch {}

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Failed to delete custom request:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
