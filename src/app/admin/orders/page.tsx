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
  PERMITTED_ORDER_TRANSITIONS,
  PERMITTED_PAYMENT_TRANSITIONS,
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
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-[#C6A66B] uppercase">
            Order Fulfillment & COD Operations
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5F2EB] mt-0.5">
            Orders & Cash Settlement
          </h1>
          <p className="text-xs text-[#9EABA7]">
            Phone verification, courier assignment, and remittance tracking for Egyptian Cash on Delivery orders.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0E1212] p-4 rounded-xl border border-[#1A2624] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 text-xs">
          {['All', 'PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                filterStatus === st
                  ? 'bg-[#66D9C5] text-[#080A0A] font-bold'
                  : 'bg-[#111716] text-[#9EABA7] hover:text-[#F5F2EB] border border-[#1A2624]'
              }`}
            >
              {st === 'All' ? 'All Orders' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#9EABA7] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order #, phone, or name..."
            className="w-full bg-[#111716] border border-[#1A2624] rounded-lg pl-9 pr-3 py-2 text-xs text-[#F5F2EB] placeholder-[#6C7A77] focus:outline-none focus:border-[#66D9C5]"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0E1212] rounded-xl border border-[#1A2624] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111716] text-[#9EABA7] uppercase tracking-wider text-[10px] border-b border-[#1A2624]">
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
            <tbody className="divide-y divide-[#1A2624]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#9EABA7]">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusMeta = getOrderStatusLabel(order.status);
                  const payMeta = getPaymentStatusLabel(order.paymentStatus);
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-[#141A19]/50 transition-colors cursor-pointer ${
                        selectedOrder?.id === order.id ? 'bg-[#141A19] border-l-2 border-[#66D9C5]' : ''
                      }`}
                      onClick={() => openOrderDetails(order)}
                    >
                      <td className="p-3.5 font-mono text-[#66D9C5] font-bold">
                        {order.orderNumber}
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold text-[#F5F2EB]">{order.customerName}</p>
                        <p className="text-[11px] text-[#C6A66B]">{order.customerPhone}</p>
                      </td>
                      <td className="p-3.5 text-[#D5D1C7]">{order.governorate}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${statusMeta.colorClass}`}>
                          {statusMeta.labelEn}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[11px] font-medium ${payMeta.colorClass}`}>
                          {payMeta.labelEn}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#9EABA7]">
                        {order.courierName ? (
                          <span className="text-[#66D9C5]">
                            {order.courierName} ({order.trackingNumber || 'No code'})
                          </span>
                        ) : (
                          <span className="text-[#6C7A77]">Unassigned</span>
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-[#F5F2EB]">
                        {formatPrice(order.totalInPiasters)}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openOrderDetails(order);
                          }}
                          className="px-2.5 py-1 bg-[#141A19] hover:bg-[#1C2624] text-[#66D9C5] rounded border border-[#1A2624] text-[11px] font-semibold"
                        >
                          Manage
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

      {/* Selected Order Detailed Management Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-[#0E1212] border-l border-[#1A2624] text-[#F5F2EB] flex flex-col shadow-2xl p-6 overflow-y-auto space-y-6">
              
              {/* Drawer Header */}
              <div className="flex justify-between items-start pb-4 border-b border-[#1A2624]">
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#C6A66B]">Order Operations</span>
                  <h2 className="font-mono text-xl font-bold text-[#66D9C5]">{selectedOrder.orderNumber}</h2>
                  <p className="text-xs text-[#9EABA7]">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-EG')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-[#9EABA7] hover:text-[#F5F2EB]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Contact & Quick Phone/WhatsApp action */}
              <div className="p-4 bg-[#111716] rounded-lg border border-[#1A2624] space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#D5D1C7]">Customer Verification (Egypt)</span>
                  <span className="text-[#C6A66B]">{selectedOrder.governorate}</span>
                </div>
                <div>
                  <p className="font-bold text-sm text-[#F5F2EB]">{selectedOrder.customerName}</p>
                  <p className="text-xs text-[#9EABA7]">Phone: {selectedOrder.customerPhone}</p>
                  <p className="text-xs text-[#6C7A77] mt-1">
                    {selectedOrder.streetAddress}, {selectedOrder.buildingDetails && `${selectedOrder.buildingDetails}, `}{selectedOrder.city}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <a
                    href={`tel:${selectedOrder.customerPhone}`}
                    className="flex-1 py-1.5 bg-[#141A19] hover:bg-[#1A2624] text-[#66D9C5] rounded text-center font-medium border border-[#1A2624] flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Customer</span>
                  </a>
                  <a
                    href={`https://wa.me/2${selectedOrder.customerPhone}?text=${encodeURIComponent(`Hello ${selectedOrder.customerName}, this is A AND S Perfumes regarding your order ${selectedOrder.orderNumber}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 rounded text-center font-medium border border-emerald-800/30 flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Status Update Controls (E2 Permitted Transitions) */}
              <div className="space-y-4 p-4 bg-[#111716] rounded-lg border border-[#1A2624] text-xs">
                <h3 className="font-serif font-bold text-sm text-[#F5F2EB]">
                  Order Fulfillment Status
                </h3>

                <div className="space-y-1">
                  <label className="text-[#9EABA7] block">Current Fulfillment State</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                    className="w-full bg-[#080A0A] border border-[#1A2624] rounded px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none focus:border-[#66D9C5]"
                  >
                    <option value="PENDING_CONFIRMATION">1. PENDING_CONFIRMATION (Initial COD)</option>
                    <option value="CONFIRMED">2. CONFIRMED (Verified with client)</option>
                    <option value="PROCESSING">3. PROCESSING (Packing in warehouse)</option>
                    <option value="OUT_FOR_DELIVERY">4. OUT_FOR_DELIVERY (Courier in transit)</option>
                    <option value="DELIVERED">5. DELIVERED (Delivered & accepted)</option>
                    <option value="CANCELLED">6. CANCELLED (Cancelled prior to dispatch)</option>
                    <option value="RETURNED">7. RETURNED (Customer refused / failed)</option>
                  </select>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-[#9EABA7] block">Cash Collection Status (COD Settlement)</label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full bg-[#080A0A] border border-[#1A2624] rounded px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none focus:border-[#66D9C5]"
                  >
                    <option value="PENDING_COLLECTION">PENDING_COLLECTION (Cash due from client)</option>
                    <option value="COLLECTED_BY_COURIER">COLLECTED_BY_COURIER (Courier holds cash)</option>
                    <option value="REMITTED_TO_STORE">REMITTED_TO_STORE (Cash remitted to store)</option>
                    <option value="FAILED_COLLECTION">FAILED_COLLECTION (Refused / unreachable)</option>
                  </select>
                </div>

                {/* Courier Assignment */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[#9EABA7] block">Courier Name</label>
                    <input
                      type="text"
                      value={editCourierName}
                      onChange={(e) => setEditCourierName(e.target.value)}
                      placeholder="e.g. Aramex, Bosta"
                      className="w-full bg-[#080A0A] border border-[#1A2624] rounded px-3 py-2 text-xs text-[#F5F2EB]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#9EABA7] block">Tracking Number</label>
                    <input
                      type="text"
                      value={editTrackingNumber}
                      onChange={(e) => setEditTrackingNumber(e.target.value)}
                      placeholder="e.g. BST-998811"
                      className="w-full bg-[#080A0A] border border-[#1A2624] rounded px-3 py-2 text-xs text-[#F5F2EB]"
                    />
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="space-y-1 pt-2">
                  <label className="text-[#9EABA7] block">Internal Staff Notes</label>
                  <textarea
                    value={editAdminNotes}
                    onChange={(e) => setEditAdminNotes(e.target.value)}
                    placeholder="e.g. Confirmed phone call on 23 Oct at 2 PM. Client requested evening delivery."
                    rows={2}
                    className="w-full bg-[#080A0A] border border-[#1A2624] rounded px-3 py-2 text-xs text-[#F5F2EB]"
                  />
                </div>
              </div>

              {/* Items List Snapshot */}
              <div className="space-y-2 text-xs">
                <h4 className="font-semibold text-[#D5D1C7]">Purchased Items Snapshot:</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="p-3 bg-[#111716] rounded border border-[#1A2624] flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-[#F5F2EB]">{item.productNameSnapshot}</p>
                        <p className="text-[11px] text-[#C6A66B]">{item.variantTitleSnapshot} • SKU: {item.skuSnapshot}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#66D9C5]">{formatPrice(item.subtotalInPiasters)}</p>
                        <p className="text-[#9EABA7] text-[10px]">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="p-4 bg-[#111716] rounded border border-[#1A2624] text-xs space-y-1.5">
                <div className="flex justify-between text-[#9EABA7]">
                  <span>Items Subtotal:</span>
                  <span className="text-[#F5F2EB]">{formatPrice(selectedOrder.subtotalInPiasters)}</span>
                </div>
                <div className="flex justify-between text-[#9EABA7]">
                  <span>Shipping Fee:</span>
                  <span className="text-[#66D9C5]">
                    {selectedOrder.shippingInPiasters === 0 ? 'FREE' : formatPrice(selectedOrder.shippingInPiasters)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#1A2624] font-bold text-sm">
                  <span>Total Cash Amount:</span>
                  <span className="text-[#66D9C5]">{formatPrice(selectedOrder.totalInPiasters)}</span>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  onClick={handleSaveChanges}
                  className="w-full btn-primary py-3 px-4 rounded text-xs tracking-wider uppercase font-bold flex items-center justify-center gap-2"
                >
                  <PackageCheck className="w-4 h-4 text-[#080A0A]" />
                  <span>{saveSuccess ? 'Changes Saved Successfully!' : 'Save Order Updates'}</span>
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
    <Suspense fallback={<div className="p-12 text-center text-[#9EABA7]">Loading order operations...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
