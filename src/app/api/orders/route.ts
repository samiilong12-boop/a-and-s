import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { verifyAdminSession } from '@/lib/serverAuth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

interface OrdersStorage {
  initialized: boolean;
  orders: any[];
  softDeletedOrderNumbers: string[];
}

declare global {
  var __ORDERS_STORE__: OrdersStorage | undefined;
}

const tmpFilePath = path.join(os.tmpdir(), 'raheeq-catalog-orders-v3.json');
const publicFilePath = path.join(process.cwd(), 'public', 'data', 'orders.json');

function getStore(): OrdersStorage {
  if (globalThis.__ORDERS_STORE__) {
    return globalThis.__ORDERS_STORE__;
  }

  // 1. Try reading /tmp
  try {
    if (fs.existsSync(tmpFilePath)) {
      const data = fs.readFileSync(tmpFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        if (parsed.initialized && Array.isArray(parsed.orders)) {
          globalThis.__ORDERS_STORE__ = {
            initialized: true,
            orders: parsed.orders,
            softDeletedOrderNumbers: Array.isArray(parsed.softDeletedOrderNumbers)
              ? parsed.softDeletedOrderNumbers
              : [],
          };
          return globalThis.__ORDERS_STORE__;
        } else if (Array.isArray(parsed)) {
          globalThis.__ORDERS_STORE__ = {
            initialized: true,
            orders: parsed,
            softDeletedOrderNumbers: [],
          };
          return globalThis.__ORDERS_STORE__;
        }
      }
    }
  } catch {}

  // 2. Try reading public/data/orders.json
  try {
    if (fs.existsSync(publicFilePath)) {
      const data = fs.readFileSync(publicFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        globalThis.__ORDERS_STORE__ = {
          initialized: true,
          orders: parsed,
          softDeletedOrderNumbers: [],
        };
        return globalThis.__ORDERS_STORE__;
      }
    }
  } catch {}

  const defaultStore: OrdersStorage = {
    initialized: true,
    orders: [],
    softDeletedOrderNumbers: [],
  };
  globalThis.__ORDERS_STORE__ = defaultStore;
  return defaultStore;
}

function persistStore(store: OrdersStorage) {
  globalThis.__ORDERS_STORE__ = store;

  try {
    fs.writeFileSync(tmpFilePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed writing orders store to tmp:', e);
  }

  try {
    const dir = path.dirname(publicFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // Write non-deleted orders
    const nonDeleted = store.orders.filter(
      (o) => !store.softDeletedOrderNumbers.includes(o.orderNumber) && !o.deletedAt
    );
    fs.writeFileSync(publicFilePath, JSON.stringify(nonDeleted, null, 2), 'utf-8');
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

  const store = getStore();
  const deletedSet = new Set(store.softDeletedOrderNumbers);
  const activeAndArchived = store.orders.filter(
    (o) => !deletedSet.has(o.orderNumber) && !o.deletedAt
  );

  // Mode 1: Customer single order tracking lookup
  if (orderNumber || phone) {
    const cOrderNum = cleanStr(orderNumber || '');
    const cPhone = cleanDigits(phone || '');

    // Check DB first if available
    try {
      const { prisma } = await import('@/lib/prisma');
      const dbOrder = await prisma.order.findFirst({
        where: {
          deletedAt: null,
          OR: [
            ...(cOrderNum ? [{ orderNumber: { contains: cOrderNum, mode: 'insensitive' as const } }] : []),
            ...(cPhone.length >= 6 ? [{ customerPhone: { contains: cPhone.slice(-8) } }] : []),
          ],
        },
        include: { items: true },
      });
      if (dbOrder) {
        const maskedPhone = dbOrder.customerPhone ? dbOrder.customerPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '';
        return NextResponse.json({
          success: true,
          order: {
            ...dbOrder,
            createdAt: dbOrder.createdAt.toISOString(),
            archivedAt: dbOrder.archivedAt?.toISOString() || null,
            customerPhone: maskedPhone,
          },
        });
      }
    } catch {}

    const found = activeAndArchived.find((o) => {
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

  // Authoritative Database Query (Prisma PostgreSQL)
  try {
    const { prisma } = await import('@/lib/prisma');
    const dbOrders = await prisma.order.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 300,
      include: { items: true },
    });

    if (Array.isArray(dbOrders) && dbOrders.length > 0) {
      const serialized = dbOrders.map((dbo) => ({
        id: dbo.id,
        orderNumber: dbo.orderNumber,
        customerName: dbo.customerName,
        customerPhone: dbo.customerPhone,
        customerEmail: dbo.customerEmail,
        governorate: dbo.governorate,
        city: dbo.city,
        streetAddress: dbo.streetAddress,
        buildingDetails: dbo.buildingDetails,
        deliveryNotes: dbo.deliveryNotes,
        status: dbo.status,
        paymentMethod: dbo.paymentMethod,
        paymentStatus: dbo.paymentStatus,
        subtotalInPiasters: dbo.subtotalInPiasters,
        shippingInPiasters: dbo.shippingInPiasters,
        discountInPiasters: dbo.discountInPiasters,
        taxInPiasters: dbo.taxInPiasters,
        totalInPiasters: dbo.totalInPiasters,
        courierName: dbo.courierName,
        trackingNumber: dbo.trackingNumber,
        adminNotes: dbo.adminNotes,
        isArchived: dbo.isArchived || dbo.status === 'DELIVERED',
        archivedAt: dbo.archivedAt?.toISOString() || null,
        deletedAt: dbo.deletedAt?.toISOString() || null,
        createdAt: dbo.createdAt.toISOString(),
        updatedAt: dbo.updatedAt.toISOString(),
        items: dbo.items || [],
        shippingAddress: {
          governorate: dbo.governorate,
          city: dbo.city,
          streetAddress: dbo.streetAddress,
          buildingDetails: dbo.buildingDetails,
          deliveryNotes: dbo.deliveryNotes,
        },
      }));

      // Keep fallback store aligned with database truth
      store.orders = serialized;
      persistStore(store);

      return NextResponse.json(serialized, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }
  } catch {}

  // Fallback Store Response (filtered against deleted orders)
  return NextResponse.json(activeAndArchived, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`order_checkout_${clientIp}`, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ success: false, error: 'يرجى الانتظار قبل إرسال طلب جديد' }, { status: 429 });
    }

    const orderData = await req.json();

    if (!orderData || !orderData.customerPhone) {
      return NextResponse.json({ success: false, error: 'بيانات الطلب غير مكتملة (رقم الهاتف مطلوب)' }, { status: 400 });
    }

    const now = new Date();
    if (!orderData.orderNumber) {
      orderData.orderNumber = `RHQ-EXP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!orderData.createdAt) {
      orderData.createdAt = now.toISOString();
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

    orderData.isArchived = false;
    orderData.archivedAt = null;
    orderData.deletedAt = null;

    const store = getStore();
    store.softDeletedOrderNumbers = store.softDeletedOrderNumbers.filter((n) => n !== orderData.orderNumber);
    store.orders = [orderData, ...store.orders.filter((o) => o.orderNumber !== orderData.orderNumber)];
    persistStore(store);

    // Sync with Cloud Database (Prisma PostgreSQL)
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
          taxInPiasters: orderData.taxInPiasters || 0,
          totalInPiasters: orderData.totalInPiasters || 0,
          status: 'PENDING_CONFIRMATION',
          paymentMethod: 'CASH_ON_DELIVERY',
          paymentStatus: 'PENDING_COLLECTION',
          isArchived: false,
        },
        update: {},
      });
    } catch {}

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

    if (!orderNumber || !updates) {
      return NextResponse.json({ error: 'Missing orderNumber or updates' }, { status: 400 });
    }

    const store = getStore();
    const target = store.orders.find((o) => o.orderNumber === orderNumber);

    let updatedIsArchived = updates.isArchived !== undefined
      ? Boolean(updates.isArchived)
      : (target?.isArchived || false);

    let updatedArchivedAt = updates.archivedAt !== undefined
      ? updates.archivedAt
      : target?.archivedAt || null;

    // Delivery completion automatically archives the order
    if (updates.status === 'DELIVERED' || updates.isArchived === true) {
      updatedIsArchived = true;
      updatedArchivedAt = updatedArchivedAt || new Date().toISOString();
    } else if (updates.isArchived === false) {
      updatedIsArchived = false;
      updatedArchivedAt = null;
    }

    const updatedOrder = {
      ...(target || { orderNumber }),
      ...updates,
      isArchived: updatedIsArchived,
      archivedAt: updatedArchivedAt,
      deletedAt: null,
      updatedAt: new Date().toISOString(),
    };

    store.orders = store.orders.map((o) =>
      o.orderNumber === orderNumber ? updatedOrder : o
    );
    if (!target) store.orders.unshift(updatedOrder);
    persistStore(store);

    // Persist to Authoritative Database
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.order.updateMany({
        where: { orderNumber },
        data: {
          ...(updates.status ? { status: updates.status } : {}),
          ...(updates.paymentStatus ? { paymentStatus: updates.paymentStatus } : {}),
          ...(updates.courierName !== undefined ? { courierName: updates.courierName } : {}),
          ...(updates.trackingNumber !== undefined ? { trackingNumber: updates.trackingNumber } : {}),
          ...(updates.adminNotes !== undefined ? { adminNotes: updates.adminNotes } : {}),
          isArchived: updatedIsArchived,
          archivedAt: updatedArchivedAt ? new Date(updatedArchivedAt) : null,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: updatedIsArchived ? 'ORDER_ARCHIVED' : 'ORDER_STATUS_UPDATE',
          entity: 'Order',
          entityId: orderNumber,
          details: { ...updates, isArchived: updatedIsArchived, archivedAt: updatedArchivedAt },
        },
      }).catch(() => {});
    } catch (dbErr) {
      console.warn('Database patch error on order:', dbErr);
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Failed to update order:', error);
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

    if (!orderNumber) {
      return NextResponse.json({ error: 'Missing orderNumber' }, { status: 400 });
    }

    const store = getStore();
    // Soft delete: record in softDeletedOrderNumbers and tag with deletedAt
    store.softDeletedOrderNumbers = Array.from(new Set([...store.softDeletedOrderNumbers, orderNumber]));
    store.orders = store.orders.map((o) =>
      o.orderNumber === orderNumber ? { ...o, deletedAt: new Date().toISOString() } : o
    );
    persistStore(store);

    // Authoritative Soft Delete in Database
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.order.updateMany({
        where: { orderNumber },
        data: { deletedAt: new Date() },
      });

      await prisma.auditLog.create({
        data: {
          action: 'ORDER_SOFT_DELETED',
          entity: 'Order',
          entityId: orderNumber,
        },
      }).catch(() => {});
    } catch (dbErr) {
      console.warn('Database delete error on order:', dbErr);
    }

    return NextResponse.json({ success: true, orderNumber });
  } catch (error) {
    console.error('Failed to delete order:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete order' }, { status: 500 });
  }
}
