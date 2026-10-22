'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Phone,
  MessageSquare,
  AlertCircle,
  X,
  ShieldCheck,
  DollarSign,
  PackageCheck,
} from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { OrderStatus, PaymentStatus } from '@/types';
import {
  getOrderStatusLabel,
  getPaymentStatusLabel,
} from '@/lib/state-machines';

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const highlightedOrder = searchParams.get('highlight');

  const [orders, setOrders] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Edit fields for selected order
  const [editStatus, setEditStatus] = useState<OrderStatus>('PENDING_CONFIRMATION');
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>('PENDING_COLLECTION');
  const [editCourierName, setEditCourierName] = useState('');
  const [editTrackingNumber, setEditTrackingNumber] = useState('');
  const [editAdminNotes, setEditAdminNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('a_and_s_demo_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        setOrders(parsed);

        if (highlightedOrder) {
          const found = parsed.find((o: any) => o.orderNumber === highlightedOrder);
          if (found) {
            openOrderDetails(found);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [highlightedOrder]);

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditPaymentStatus(order.paymentStatus);
    setEditCourierName(order.courierName || '');
    setEditTrackingNumber(order.trackingNumber || '');
    setEditAdminNotes(order.adminNotes || '');
    setSaveSuccess(false);
  };

  const handleSaveChanges = () => {
    if (!selectedOrder) return;

    const updated = orders.map((o) => {
      if (o.id === selectedOrder.id) {
        return {
          ...o,
          status: editStatus,
          paymentStatus: editPaymentStatus,
          courierName: editCourierName.trim() || null,
          trackingNumber: editTrackingNumber.trim() || null,
          adminNotes: editAdminNotes.trim() || null,
          updatedAt: new Date().toISOString(),
        };
      }
      return o;
    });

    setOrders(updated);
    localStorage.setItem('a_and_s_demo_orders', JSON.stringify(updated));
    setSelectedOrder((prev: any) => ({
      ...prev,
      status: editStatus,
      paymentStatus: editPaymentStatus,
      courierName: editCourierName.trim() || null,
      trackingNumber: editTrackingNumber.trim() || null,
      adminNotes: editAdminNotes.trim() || null,
    }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'All' && o.status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchNumber = o.orderNumber.toLowerCase().includes(term);
      const matchName = o.customerName.toLowerCase().includes(term);
      const matchPhone = o.customerPhone.includes(term);
      if (!matchNumber && !matchName && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title (Clean White UI) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold tracking-wider text-teal-800 uppercase">
            إدارة طلبات الدفع عند الاستلام والشحن
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Orders & Cash Settlement ({orders.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            تأكيد الطلبات بالاتصال أو الواتساب، وتعيين شركة الشحن، ومتابعة توريد الأموال المحصلة.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 text-xs">
          {['All', 'PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-colors ${
                filterStatus === st
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {st === 'All' ? 'جميع الطلبات' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order #, phone, or name..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 font-medium"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3.5">Order Ref</th>
                <th className="p-3.5">Customer & Phone</th>
                <th className="p-3.5">Governorate</th>
                <th className="p-3.5">Order Status</th>
                <th className="p-3.5">Payment / COD</th>
                <th className="p-3.5">Courier & Tracking</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    لا توجد طلبات تطابق معايير البحث.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusMeta = getOrderStatusLabel(order.status);
                  const payMeta = getPaymentStatusLabel(order.paymentStatus);
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        selectedOrder?.id === order.id ? 'bg-teal-50/40 border-l-4 border-teal-600' : ''
                      }`}
                      onClick={() => openOrderDetails(order)}
                    >
                      <td className="p-3.5 font-mono text-teal-800 font-bold text-sm">
                        {order.orderNumber}
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900">{order.customerName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{order.customerPhone}</p>
                      </td>
                      <td className="p-3.5 text-slate-700 font-semibold">{order.governorate}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${statusMeta.colorClass}`}>
                          {statusMeta.labelEn}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[11px] font-bold ${payMeta.colorClass}`}>
                          {payMeta.labelEn}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {order.courierName ? (
                          <span className="text-teal-700 font-semibold">
                            {order.courierName} ({order.trackingNumber || 'Pending'})
                          </span>
                        ) : (
                          <span className="text-slate-400">لم يتم التعيين</span>
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 text-sm">
                        {formatPrice(order.totalInPiasters)}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openOrderDetails(order);
                          }}
                          className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded font-semibold text-xs border border-teal-200 transition-colors"
                        >
                          إدارة
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Order Detailed Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white text-slate-900 flex flex-col shadow-2xl p-6 overflow-y-auto space-y-6 border-l border-slate-200">
              
              {/* Drawer Header */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-800">تفاصيل الطلب والتحصيل</span>
                  <h2 className="font-mono text-2xl font-bold text-teal-800">{selectedOrder.orderNumber}</h2>
                  <p className="text-xs text-slate-500">
                    تاريخ الطلب: {new Date(selectedOrder.createdAt).toLocaleString('en-EG')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Contact & Call/WhatsApp Action */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">بيانات العميل (التأكيد الهاتفي)</span>
                  <span className="text-teal-800 font-bold">{selectedOrder.governorate}</span>
                </div>
                <div>
                  <p className="font-bold text-base text-slate-900">{selectedOrder.customerName}</p>
                  <p className="text-xs font-mono text-slate-600 mt-0.5">الهاتف: {selectedOrder.customerPhone}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    العنوان: {selectedOrder.streetAddress}, {selectedOrder.buildingDetails && `${selectedOrder.buildingDetails}, `}{selectedOrder.city}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <a
                    href={`tel:${selectedOrder.customerPhone}`}
                    className="flex-1 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-center font-bold border border-slate-300 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                    <span>اتصال بالعميل</span>
                  </a>
                  <a
                    href={`https://wa.me/2${selectedOrder.customerPhone}?text=${encodeURIComponent(`مرحباً ${selectedOrder.customerName}، معكم دار A AND S للعطور بخصوص تأكيد طلبك رقم ${selectedOrder.orderNumber}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-center font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>مراسلة واتساب</span>
                  </a>
                </div>
              </div>

              {/* Status Update Controls */}
              <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <h3 className="font-serif font-bold text-sm text-slate-900">
                  تحديث حالة الشحن والتحصيل
                </h3>

                <div className="space-y-1">
                  <label className="text-slate-700 font-bold block">حالة الشحن والتجهيز</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-teal-600"
                  >
                    <option value="PENDING_CONFIRMATION">1. PENDING_CONFIRMATION (بانتظار التأكيد الهاتفي)</option>
                    <option value="CONFIRMED">2. CONFIRMED (تم التأكيد مع العميل هاتفياً)</option>
                    <option value="PROCESSING">3. PROCESSING (جاري التجهيز والتغليف بالمعمل)</option>
                    <option value="OUT_FOR_DELIVERY">4. OUT_FOR_DELIVERY (تم التسليم لشركة الشحن)</option>
                    <option value="DELIVERED">5. DELIVERED (تم الاستلام من العميل بنجاح)</option>
                    <option value="CANCELLED">6. CANCELLED (طلب ملغي)</option>
                    <option value="RETURNED">7. RETURNED (طرد مرتجع / لم يستلم)</option>
                  </select>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-slate-700 font-bold block">حالة تحصيل وتوريد النقد (COD Settlement)</label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-teal-600"
                  >
                    <option value="PENDING_COLLECTION">PENDING_COLLECTION (المبلغ لم يُحصل بعد)</option>
                    <option value="COLLECTED_BY_COURIER">COLLECTED_BY_COURIER (المندوب استلم الكاش)</option>
                    <option value="REMITTED_TO_STORE">REMITTED_TO_STORE (تم توريد الكاش لحساب الدار)</option>
                    <option value="FAILED_COLLECTION">FAILED_COLLECTION (تعذر التحصيل)</option>
                  </select>
                </div>

                {/* Courier Assignment */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold block">شركة الشحن (Courier Name)</label>
                    <input
                      type="text"
                      value={editCourierName}
                      onChange={(e) => setEditCourierName(e.target.value)}
                      placeholder="e.g. بوسطة، أرامكس"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold block">رقم التتبع (Tracking Number)</label>
                    <input
                      type="text"
                      value={editTrackingNumber}
                      onChange={(e) => setEditTrackingNumber(e.target.value)}
                      placeholder="e.g. BST-12345"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1 pt-2">
                  <label className="text-slate-700 font-bold block">ملاحظات داخلية لفريق العمل</label>
                  <textarea
                    value={editAdminNotes}
                    onChange={(e) => setEditAdminNotes(e.target.value)}
                    placeholder="مثال: تم الاتصال وتأكيد ميعاد التسليم غداً بعد الظهر..."
                    rows={2}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Items List Snapshot */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-700">العطور المطلوبة:</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900">{item.productNameSnapshot}</p>
                        <p className="text-[11px] text-teal-800 font-mono">{item.variantTitleSnapshot} • SKU: {item.skuSnapshot}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatPrice(item.subtotalInPiasters)}</p>
                        <p className="text-slate-500 text-[10px]">الكمية: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>مجموع العطور:</span>
                  <span className="font-semibold text-slate-900">{formatPrice(selectedOrder.subtotalInPiasters)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>تكلفة الشحن:</span>
                  <span className="text-teal-700 font-bold">
                    {selectedOrder.shippingInPiasters === 0 ? 'مجاني' : formatPrice(selectedOrder.shippingInPiasters)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm">
                  <span>إجمالي المبلغ المطلوب نقداً:</span>
                  <span className="text-teal-800 text-base">{formatPrice(selectedOrder.totalInPiasters)}</span>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  onClick={handleSaveChanges}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3.5 px-4 rounded-xl text-xs tracking-wider uppercase font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>{saveSuccess ? 'تم حفظ التعديلات بنجاح!' : 'حفظ التغييرات على الطلب'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading order operations...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
