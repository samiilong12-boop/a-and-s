import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { BespokePerfumeRequest } from '@/types';
import { verifyAdminSession } from '@/lib/serverAuth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

// Declare global in-memory container to survive within Node.js runtime
declare global {
  var __BESPOKE_REQUESTS__: BespokePerfumeRequest[] | undefined;
}

const tmpFilePath = path.join(os.tmpdir(), 'raheeq-custom-requests.json');
const publicFilePath = path.join(process.cwd(), 'public', 'data', 'custom-requests.json');

const INITIAL_REQUESTS: BespokePerfumeRequest[] = [
  {
    id: 'req-init-1',
    customerName: 'طارق عبد المنعم',
    customerPhone: '+201012345678',
    perfumeName: 'Tom Ford Tobacco Vanille + Oud Wood (خلطة مخصصة)',
    volumeMl: '100ml',
    concentration: 'EXTRAIT_DE_PARFUM',
    notes: 'أريد تركيز عالي وثبات ممتاز يدوم لأكثر من 24 ساعة للمناسبات الرسمية',
    status: 'CONTACTED',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'req-init-2',
    customerName: 'مريم الجندي',
    customerPhone: '+201123456789',
    perfumeName: 'Delina Exclusif de Marly (تركيز خاص)',
    volumeMl: '50ml',
    concentration: 'EAU_DE_PARFUM',
    notes: 'يفضل إضافة لمسة إضافية خفيفة من المسك الأبيض',
    status: 'NEW',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

function loadPersistedRequests(): BespokePerfumeRequest[] {
  // 1. Check global memory
  if (globalThis.__BESPOKE_REQUESTS__ && Array.isArray(globalThis.__BESPOKE_REQUESTS__)) {
    return globalThis.__BESPOKE_REQUESTS__;
  }

  // 2. Check /tmp on serverless
  try {
    if (fs.existsSync(tmpFilePath)) {
      const data = fs.readFileSync(tmpFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__BESPOKE_REQUESTS__ = parsed;
        return parsed;
      }
    }
  } catch (e) {
    // continue
  }

  // 3. Check public/data/custom-requests.json
  try {
    if (fs.existsSync(publicFilePath)) {
      const data = fs.readFileSync(publicFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__BESPOKE_REQUESTS__ = parsed;
        return parsed;
      }
    }
  } catch (e) {
    // continue
  }

  // 4. Default seed
  globalThis.__BESPOKE_REQUESTS__ = INITIAL_REQUESTS;
  return INITIAL_REQUESTS;
}

function persistRequests(list: BespokePerfumeRequest[]) {
  // 1. Global in-memory
  globalThis.__BESPOKE_REQUESTS__ = list;

  // 2. Write to /tmp (always writable in AWS Lambda / Vercel serverless)
  try {
    fs.writeFileSync(tmpFilePath, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed writing to tmp:', e);
  }

  // 3. Attempt local public file (works in local dev)
  try {
    const dir = path.dirname(publicFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(publicFilePath, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    // Expected on read-only serverless
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper to normalize digits for verification
const cleanDigits = (s?: string) => (s || '').replace(/[^0-9]/g, '');
const cleanStr = (s?: string) => (s || '').trim().toLowerCase().replace(/^#/, '');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get('id');
  const targetPhone = searchParams.get('phone');
  const requests = loadPersistedRequests();

  // Mode 1: Customer single-order secure tracking lookup
  if (targetId || targetPhone) {
    const cleanId = cleanStr(targetId || '');
    const phoneDigits = cleanDigits(targetPhone || '');

    const matched = requests.find((r) => {
      const rId = cleanStr(r.id);
      const rPhone = cleanDigits(r.customerPhone);

      const idMatch = cleanId ? (rId === cleanId || rId.endsWith(cleanId) || cleanId.endsWith(rId)) : false;
      const phoneMatch = phoneDigits.length >= 6 ? rPhone.endsWith(phoneDigits.slice(-8)) : false;

      if (cleanId && phoneDigits) {
        return idMatch && phoneMatch;
      }
      return idMatch || phoneMatch;
    });

    if (matched) {
      // Mask phone for customer privacy defense
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

  // Mode 2: Admin list all requests (Locked by server-side Admin Session)
  const isAdmin = await verifyAdminSession(req);
  if (!isAdmin) {
    return NextResponse.json(
      {
        error: 'غير مصرح بالوصول. يتطلب هذا الإجراء جلسة إدارة نشطة لمنع تسريب بيانات العملاء.',
        authenticated: false,
      },
      { status: 401 }
    );
  }

  return NextResponse.json(requests, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    // Rate limit: max 10 requests per minute per IP
    const rateCheck = checkRateLimit(`bespoke_req_${clientIp}`, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'تم إرسال طلبات متعددة، يرجى الانتظار قليلاً قبل إرسال طلب جديد.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const existing = loadPersistedRequests();

    // Input sanitization & validation
    const customerName = String(body.customerName || 'عميل رحيق').trim().slice(0, 100);
    const customerPhone = String(body.customerPhone || '').trim().slice(0, 25);
    const perfumeName = String(body.perfumeName || '').trim().slice(0, 150);
    const volumeMl = String(body.volumeMl || '100ml').trim().slice(0, 30);
    const concentration = String(body.concentration || 'EXTRAIT_DE_PARFUM').trim().slice(0, 50);
    const notes = String(body.notes || '').trim().slice(0, 500);

    if (!perfumeName || !customerPhone) {
      return NextResponse.json({ success: false, error: 'اسم العطر ورقم الهاتف مطلوبان' }, { status: 400 });
    }

    const newRequest: BespokePerfumeRequest = {
      id: body.id || `REQ-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      customerName,
      customerPhone,
      perfumeName,
      volumeMl,
      concentration,
      notes,
      status: 'NEW',
      createdAt: body.createdAt || new Date().toISOString(),
    };

    // Prevent duplicate IDs
    const updated = [newRequest, ...existing.filter((r) => r.id !== newRequest.id)];
    persistRequests(updated);

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
      return NextResponse.json({ error: 'غير مصرح بتعديل حالات الطلبات بدون مصادقة المدير' }, { status: 401 });
    }

    const body = await req.json();
    const { id, status } = body;
    const existing = loadPersistedRequests();

    const updated = existing.map((item) =>
      item.id === id ? { ...item, status } : item
    );
    persistRequests(updated);

    return NextResponse.json({ success: true, requests: updated });
  } catch (error) {
    console.error('Failed to update custom request:', error);
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح بحذف الطلبات بدون مصادقة المدير' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const clearFulfilled = searchParams.get('clearFulfilled');
    const existing = loadPersistedRequests();

    if (clearFulfilled === 'true') {
      const updated = existing.filter((r) => r.status !== 'FULFILLED');
      persistRequests(updated);
      return NextResponse.json({ success: true, requests: updated, deletedCount: existing.length - updated.length });
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing id or clearFulfilled' }, { status: 400 });
    }

    const updated = existing.filter((r) => r.id !== id);
    persistRequests(updated);

    return NextResponse.json({ success: true, requests: updated });
  } catch (error) {
    console.error('Failed to delete custom request:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
