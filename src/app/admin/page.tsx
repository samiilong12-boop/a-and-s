'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Truck,
  DollarSign,
  Package,
  Layers,
  Lock,
  Film,
} from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { useProducts } from '@/context/ProductContext';
import { getOrderStatusLabel, getPaymentStatusLabel } from '@/lib/state-machines';

export default function AdminOverviewPage() {
  const { products } = useProducts();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('a_and_s_demo_orders');
      if (stored) {
        setOrders(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Financial KPIs Calculations (E1)
  const totalOrders = orders.length;
  const grossSalesInPiasters = orders.reduce((sum, o) => sum + (o.subtotalInPiasters || 0), 0);
  const totalCogsInPiasters = orders.reduce((sum, o) => sum + (o.totalCostInPiasters || 0), 0);
  const estimatedGrossProfitInPiasters = grossSalesInPiasters - totalCogsInPiasters;
  const averageOrderValueInPiasters = totalOrders > 0 ? Math.round(grossSalesInPiasters / totalOrders) : 0;

  // Order status counts
  const pendingCount = orders.filter((o) => o.status === 'PENDING_CONFIRMATION').length;
  const confirmedCount = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PROCESSING').length;
  const outForDeliveryCount = orders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;

  // Inventory analysis
  const lowStockCount = products.filter((p) =>
    p.variants.some((v) => v.stockQuantity <= v.lowStockThreshold)
  ).length;

  return (
    <div className="space-y-8">
      {/* Header Banner (Clean White UI) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-teal-800 uppercase">
              لوحة الإدارة والتحليلات المالية المباشرة
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-300 font-mono">
              خاص بالمالك والإدارة فقط
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Store Performance & Financial Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            متابعة حية للأرباح والمبيعات بالجنيه المصري (EGP)، وتأكيدات الدفع عند الاستلام، وتنبيهات المخزون.
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs tracking-wider uppercase self-start sm:self-auto flex items-center gap-2 shadow-sm transition-all"
        >
          <span>إدارة ومتابعة الطلبات ({orders.length})</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Quick Hero Media & Video Management Card */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-teal-800/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400 flex-shrink-0 shadow-inner">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-teal-300 bg-teal-900/60 px-2 py-0.5 rounded border border-teal-700">
                الهوية البصرية للمتجر
              </span>
              <span className="text-xs text-slate-300">ميزة حصرية للمالك</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-white mt-0.5">
              إدارة الفيديو الرئيسي وخلفية الواجهة (Hero Media)
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              يمكنك رفع أي فيديو جديد من كمبيوترك أو هاتفك أو التبديل بين فيديوهات الحملات الإعلانية المعتمدة ليعمل كخلفية سينمائية للواجهة.
            </p>
          </div>
        </div>

        <Link
          href="/admin/media"
          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all self-start sm:self-auto flex-shrink-0"
        >
          <span>إدارة ورفع الفيديو</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Financial KPIs Matrix (E1 Financial Integrity - Clean High-Contrast Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
            <span>إجمالي المبيعات (Gross Sales)</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-teal-800">
            {formatPrice(grossSalesInPiasters)}
          </p>
          <p className="text-[10px] text-slate-400">إجمالي قيمة جميع الطلبات المستلمة</p>
        </div>

        {/* Estimated Gross Profit */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
            <span>صافي الربح التقديري (Gross Profit)</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-amber-800">
            {formatPrice(estimatedGrossProfitInPiasters)}
          </p>
          <p className="text-[10px] text-slate-400">بعد خصم التكلفة الباطنية للزيوت والزجاجات</p>
        </div>

        {/* Total Orders & AOV */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
            <span>الطلبات ومتوسط الفاتورة (AOV)</span>
            <ShoppingBag className="w-4 h-4 text-slate-700" />
          </div>
          <p className="font-serif text-2xl font-bold text-slate-900">
            {totalOrders} طلبات
          </p>
          <p className="text-[10px] text-slate-500">
            متوسط قيمة الطلب: <strong className="text-teal-700">{formatPrice(averageOrderValueInPiasters)}</strong>
          </p>
        </div>

        {/* Low Stock Watch */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
            <span>عطور قريبة من النفاد (Low Stock)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-amber-700">
            {lowStockCount} عطور
          </p>
          <p className="text-[10px] text-slate-400">من إجمالي {products.length} تركيبة مسجلة</p>
        </div>
      </div>

      {/* Cash on Delivery Fulfillment Pipeline (E10) */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-base font-bold text-slate-900">
            مسار دورة حياة طلبات الدفع عند الاستلام (Egypt COD Pipeline)
          </h3>
          <span className="text-xs text-slate-500">تحديث فوري</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
            <span className="text-amber-800 font-semibold block text-[11px]">1. بانتظار التأكيد الهاتفي</span>
            <span className="text-2xl font-bold text-amber-900 block mt-1">{pendingCount}</span>
            <span className="text-[10px] text-amber-700">مطلوب اتصال / واتساب</span>
          </div>

          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl">
            <span className="text-teal-800 font-semibold block text-[11px]">2. تم التأكيد وجاري التجهيز</span>
            <span className="text-2xl font-bold text-teal-900 block mt-1">{confirmedCount}</span>
            <span className="text-[10px] text-teal-700">تغليف بالمعمل</span>
          </div>

          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl">
            <span className="text-indigo-800 font-semibold block text-[11px]">3. مع المندوب للتوصيل</span>
            <span className="text-2xl font-bold text-indigo-900 block mt-1">{outForDeliveryCount}</span>
            <span className="text-[10px] text-indigo-700">جاري الشحن</span>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <span className="text-emerald-800 font-semibold block text-[11px]">4. تم التسليم وتحصيل النقد</span>
            <span className="text-2xl font-bold text-emerald-900 block mt-1">{deliveredCount}</span>
            <span className="text-[10px] text-emerald-700">تم التوريد للمتجر</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-serif text-base font-bold text-slate-900">
              أحدث طلبات العملاء (Recent Orders)
            </h3>
            <p className="text-xs text-slate-500">اضغط على أي طلب لتحديث حالته وتعيين شركة الشحن</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-teal-700 hover:text-teal-900"
          >
            عرض جميع الطلبات ({orders.length}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3">Order Ref</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Governorate</th>
                <th className="p-3">Order Status</th>
                <th className="p-3">COD Status</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 5).map((order) => {
                const statusMeta = getOrderStatusLabel(order.status);
                const payMeta = getPaymentStatusLabel(order.paymentStatus);
                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono text-teal-700 font-bold text-sm">
                      {order.orderNumber}
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{order.customerName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{order.customerPhone}</p>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">{order.governorate}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${statusMeta.colorClass}`}>
                        {statusMeta.labelEn}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-[11px] font-semibold ${payMeta.colorClass}`}>
                        {payMeta.labelEn}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {formatPrice(order.totalInPiasters)}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/admin/orders?highlight=${order.orderNumber}`}
                        className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded font-semibold text-xs border border-teal-200 transition-colors"
                      >
                        Manage Order
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
