import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { verifyAdminSession } from '@/lib/serverAuth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

// Global memory container for serverless runtime
declare global {
  var __CATALOG_ORDERS__: any[] | undefined;
}

const tmpFilePath = path.join(os.tmpdir(), 'raheeq-catalog-orders.json');
const publicFilePath = path.join(process.cwd(), 'public', 'data', 'orders.json');

function loadPersistedOrders(): any[] {
  if (globalThis.__CATALOG_ORDERS__ && Array.isArray(globalThis.__CATALOG_ORDERS__)) {
    return globalThis.__CATALOG_ORDERS__;
  }

  // Check /tmp
  try {
    if (fs.existsSync(tmpFilePath)) {
      const data = fs.readFileSync(tmpFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        globalThis.__CATALOG_ORDERS__ = parsed;
        return parsed;
      }
    }
  } catch {}

  // Check public/data/orders.json
  try {
    if (fs.existsSync(publicFilePath)) {
      const data = fs.readFileSync(publicFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        globalThis.__CATALOG_ORDERS__ = parsed;
        return parsed;
      }
    }
  } catch {}

  globalThis.__CATALOG_ORDERS__ = [];
  return [];
}

function persistOrders(list: any[]) {
  globalThis.__CATALOG_ORDERS__ = list;

  try {
    fs.writeFileSync(tmpFilePath, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed writing orders to tmp:', e);
  }

  try {
    const dir = path.dirname(publicFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(publicFilePath, JSON.stringify(list, null, 2), 'utf-8');
  } catch {}
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const cleanDigits = (s?: string) => (s || '').replace(/[^0-9]/g, '');
const cleanStr = (s?: string) => (s || '').trim().toLowerCase().replace(/^#/, '');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get('orderNumber');
  const phone = searchParams.get('phone');
  const orders = loadPersistedOrders();

  // Mode 1: Customer single order tracking lookup
  if (orderNumber || phone) {
    const cOrderNum = cleanStr(orderNumber || '');
    const cPhone = cleanDigits(phone || '');

    const found = orders.find((o) => {
      const oNum = cleanStr(o.orderNumber);
      const oPhone = cleanDigits(o.customerPhone);

      const numMatch = cOrderNum ? (oNum === cOrderNum || oNum.endsWith(cOrderNum) || cOrderNum.endsWith(oNum)) : false;
      const phoneMatch = cPhone.length >= 6 ? oPhone.endsWith(cPhone.slice(-8)) : false;

      if (cOrderNum && cPhone) return numMatch && phoneMatch;
      return numMatch || phoneMatch;
    });

    if (found) {
      const maskedPhone = found.customerPhone ? found.customerPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '';
      return NextResponse.json({
        success: true,
        order: {
          ...found,
          customerPhone: maskedPhone,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'لم يتم العثور على الطلب' }, { status: 404 });
  }

  // Mode 2: Admin list all orders (Protected by Admin Session)
  const isAdmin = await verifyAdminSession(req);
  if (!isAdmin) {
    return NextResponse.json({ error: 'غير مصرح بالوصول لقائمة الطلبات' }, { status: 401 });
  }

  // Merge with Cloud Database (Prisma PostgreSQL) when available
  try {
    const { prisma } = await import('@/lib/prisma');
    const dbOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    if (Array.isArray(dbOrders) && dbOrders.length > 0) {
      let archivedSet = new Set<string>();
      try {
        const archSetting = await prisma.storeSetting.findUnique({ where: { key: 'archived_order_numbers' } });
        if (archSetting && archSetting.value) {
          const parsed = JSON.parse(archSetting.value);
          if (Array.isArray(parsed)) archivedSet = new Set(parsed);
        }
      } catch {}

      const map = new Map<string, any>();
      orders.forEach((o) => map.set(o.orderNumber, o));
      dbOrders.forEach((dbo) => {
        if (!map.has(dbo.orderNumber)) {
          map.set(dbo.orderNumber, {
            ...dbo,
            isArchived: archivedSet.has(dbo.orderNumber),
          });
        }
      });
      const mergedList = Array.from(map.values()).map((o) => {
        if (archivedSet.has(o.orderNumber)) {
          return { ...o, isArchived: true };
        }
        return o;
      });
      return NextResponse.json(mergedList, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }
  } catch {}

  return NextResponse.json(orders, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    // Rate limit: max 10 orders per minute per IP
    const rateCheck = checkRateLimit(`order_checkout_${clientIp}`, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ success: false, error: 'يرجى الانتظار قبل إرسال طلب جديد' }, { status: 429 });
    }

    const orderData = await req.json();

    if (!orderData || !orderData.customerPhone) {
      return NextResponse.json({ success: false, error: 'بيانات الطلب غير مكتملة (رقم الهاتف مطلوب)' }, { status: 400 });
    }

    // Auto-generate missing fields for maximum reliability across Express and Cart checkout
    if (!orderData.orderNumber) {
      const now = new Date();
      orderData.orderNumber = `RHQ-EXP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!orderData.createdAt) {
      orderData.createdAt = new Date().toISOString();
    }
    if (!orderData.status) {
      orderData.status = 'PENDING_CONFIRMATION';
    }
    if (!orderData.paymentStatus) {
      orderData.paymentStatus = 'PENDING_COLLECTION';
    }
    if (!orderData.paymentMethod) {
      orderData.paymentMethod = 'CASH_ON_DELIVERY';
    }
    if (!orderData.totalInPiasters && orderData.totalAmountInPiasters) {
      orderData.totalInPiasters = orderData.totalAmountInPiasters;
    }
    if (!orderData.subtotalInPiasters && orderData.totalInPiasters) {
      orderData.subtotalInPiasters = orderData.totalInPiasters;
    }
    if (!orderData.shippingAddress && orderData.customerAddress) {
      orderData.shippingAddress = {
        governorate: 'Cairo',
        city: 'Cairo',
        streetAddress: orderData.customerAddress,
      };
    }

    const existing = loadPersistedOrders();
    const updated = [orderData, ...existing.filter((o) => o.orderNumber !== orderData.orderNumber)];
    persistOrders(updated);

    // Sync with Cloud Database (Prisma PostgreSQL) when available
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.order.upsert({
        where: { orderNumber: orderData.orderNumber },
        create: {
          orderNumber: orderData.orderNumber,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          customerEmail: orderData.customerEmail,
          governorate: orderData.shippingAddress?.governorate || 'Cairo',
          city: orderData.shippingAddress?.city || 'Cairo',
          streetAddress: orderData.shippingAddress?.streetAddress || '',
          buildingDetails: orderData.shippingAddress?.buildingDetails,
          deliveryNotes: orderData.shippingAddress?.deliveryNotes,
          subtotalInPiasters: orderData.subtotalInPiasters || 0,
          shippingInPiasters: orderData.shippingInPiasters || 0,
          discountInPiasters: orderData.discountInPiasters || 0,
          totalInPiasters: orderData.totalInPiasters || 0,
          status: 'PENDING_CONFIRMATION',
          paymentMethod: 'CASH_ON_DELIVERY',
          paymentStatus: 'PENDING_COLLECTION',
        },
        update: {},
      });
    } catch (dbErr) {
      // Gracefully continue with high-resilience in-memory/tmp persistence
    }

    return NextResponse.json({ success: true, order: orderData });
  } catch (error) {
    console.error('Failed to save order:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ في حفظ الطلب' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح بتعديل الطلبات' }, { status: 401 });
    }

    const body = await req.json();
    const { orderNumber, updates } = body;
    const existing = loadPersistedOrders();

    const updated = existing.map((o) =>
      o.orderNumber === orderNumber ? { ...o, ...updates } : o
    );
    persistOrders(updated);

    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.order.updateMany({
        where: { orderNumber },
        data: {
          ...(updates.status ? { status: updates.status } : {}),
          ...(updates.paymentStatus ? { paymentStatus: updates.paymentStatus } : {}),
        },
      });

      // Synchronize archived status in StoreSetting
      if (updates && updates.isArchived !== undefined && orderNumber) {
        const archSetting = await prisma.storeSetting.findUnique({ where: { key: 'archived_order_numbers' } }).catch(() => null);
        let currentArchived: string[] = [];
        if (archSetting && archSetting.value) {
          try { currentArchived = JSON.parse(archSetting.value); } catch {}
        }
        let updatedArchived: string[];
        if (updates.isArchived) {
          updatedArchived = Array.from(new Set([...currentArchived, orderNumber]));
        } else {
          updatedArchived = currentArchived.filter((id) => id !== orderNumber);
        }
        await prisma.storeSetting.upsert({
          where: { key: 'archived_order_numbers' },
          create: { key: 'archived_order_numbers', value: JSON.stringify(updatedArchived) },
          update: { value: JSON.stringify(updatedArchived) },
        }).catch(() => {});
      }
    } catch {}

    return NextResponse.json({ success: true, orders: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح بحذف الطلبات' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('orderNumber');
    const existing = loadPersistedOrders();

    const updated = existing.filter((o) => o.orderNumber !== orderNumber);
    persistOrders(updated);

    try {
      const { prisma } = await import('@/lib/prisma');
      if (orderNumber) {
        await prisma.order.deleteMany({ where: { orderNumber } }).catch(() => {});

        // Also clean from archived list if present
        const archSetting = await prisma.storeSetting.findUnique({ where: { key: 'archived_order_numbers' } }).catch(() => null);
        if (archSetting && archSetting.value) {
          try {
            const currentArchived: string[] = JSON.parse(archSetting.value);
            const filtered = currentArchived.filter((id) => id !== orderNumber);
            await prisma.storeSetting.update({
              where: { key: 'archived_order_numbers' },
              data: { value: JSON.stringify(filtered) },
            }).catch(() => {});
          } catch {}
        }
      }
    } catch {}

    return NextResponse.json({ success: true, orders: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete order' }, { status: 500 });
  }
}
