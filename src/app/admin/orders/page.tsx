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
  Trash2,
  Archive,
  RotateCcw,
  Download,
  History,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { OrderStatus, PaymentStatus } from '@/types';
import {
  getOrderStatusLabel,
  getPaymentStatusLabel,
} from '@/lib/state-machines';
import {
  generateOrderConfirmationWhatsapp,
  generateDispatchAlertWhatsapp,
  generateFulfilledReceiptWhatsapp,
  formatPhoneForWhatsApp,
} from '@/lib/whatsappNotifications';

const ACTIVE_ORDERS_KEY = 'a_and_s_demo_orders';
const ARCHIVE_ORDERS_KEY = 'a_and_s_archived_orders';
const TOKEN_KEY = 'a_and_s_admin_jwt_token';

function getAdminAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function formatOrderDate(dateInput: any): string {
  if (!dateInput) return 'تاريخ غير مسجل';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  } catch {
    return String(dateInput);
  }
}

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const highlightedOrder = searchParams.get('highlight');

  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');
  const [orders, setOrders] = useState<any[]>([]);
  const [archivedOrders, setArchivedOrders] = useState<any[]>([]);
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
  const [notification, setNotification] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const loadOrders = async () => {
    let localActive: any[] = [];
    let localArchive: any[] = [];
    try {
      const storedActive = localStorage.getItem(ACTIVE_ORDERS_KEY);
      if (storedActive) {
        localActive = JSON.parse(storedActive);
      }
      const storedArchive = localStorage.getItem(ARCHIVE_ORDERS_KEY);
      if (storedArchive) {
        localArchive = JSON.parse(storedArchive);
      }
    } catch (e) {
      console.error('Error loading orders from localStorage:', e);
    }

    // Set initial display immediately from local cache
    setOrders(localActive);
    setArchivedOrders(localArchive);

    if (highlightedOrder) {
      const found =
        localActive.find((o: any) => o.orderNumber === highlightedOrder) ||
        localArchive.find((o: any) => o.orderNumber === highlightedOrder);
      if (found) openOrderDetails(found);
    }

    // Server-side sync: Fetch all orders across Egypt
    try {
      const res = await fetch('/api/orders', {
        headers: getAdminAuthHeaders(),
        cache: 'no-store',
      });
      if (res.ok) {
        const remoteOrders: any[] = await res.json();
        if (Array.isArray(remoteOrders)) {
          const activeMap = new Map<string, any>();
          const archiveMap = new Map<string, any>();

          localActive.forEach((o) => {
            if (o && o.orderNumber) activeMap.set(o.orderNumber, o);
          });
          localArchive.forEach((o) => {
            if (o && o.orderNumber) archiveMap.set(o.orderNumber, o);
          });

          remoteOrders.forEach((ro) => {
            if (!ro || !ro.orderNumber) return;

            // If the order is archived on the server OR already archived locally:
            if (ro.isArchived || archiveMap.has(ro.orderNumber)) {
              const existing = archiveMap.get(ro.orderNumber) || {};
              archiveMap.set(ro.orderNumber, { ...ro, ...existing, isArchived: true });
              activeMap.delete(ro.orderNumber); // Never let it stay in active!
            } else {
              const existing = activeMap.get(ro.orderNumber) || {};
              activeMap.set(ro.orderNumber, { ...ro, ...existing, isArchived: false });
            }
          });

          const mergedActive = Array.from(activeMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          const mergedArchive = Array.from(archiveMap.values()).sort(
            (a, b) => new Date(b.archivedAt || b.createdAt).getTime() - new Date(a.archivedAt || a.createdAt).getTime()
          );

          setOrders(mergedActive);
          setArchivedOrders(mergedArchive);
          localStorage.setItem(ACTIVE_ORDERS_KEY, JSON.stringify(mergedActive));
          localStorage.setItem(ARCHIVE_ORDERS_KEY, JSON.stringify(mergedArchive));
        }
      }
    } catch (netErr) {
      // Gracefully continue with local orders
    }
  };

  useEffect(() => {
    loadOrders();
    const handleStorage = () => loadOrders();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
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

    const updates = {
      status: editStatus,
      paymentStatus: editPaymentStatus,
      courierName: editCourierName.trim() || null,
      trackingNumber: editTrackingNumber.trim() || null,
      adminNotes: editAdminNotes.trim() || null,
      updatedAt: new Date().toISOString(),
    };

    const isArchived = archivedOrders.some((o) => o.orderNumber === selectedOrder.orderNumber);

    if (isArchived) {
      const updated = archivedOrders.map((o) => {
        if (o.orderNumber === selectedOrder.orderNumber) {
          return {
            ...o,
            ...updates,
          };
        }
        return o;
      });
      setArchivedOrders(updated);
      localStorage.setItem(ARCHIVE_ORDERS_KEY, JSON.stringify(updated));
    } else {
      const updated = orders.map((o) => {
        if (o.orderNumber === selectedOrder.orderNumber) {
          return {
            ...o,
            ...updates,
          };
        }
        return o;
      });
      setOrders(updated);
      localStorage.setItem(ACTIVE_ORDERS_KEY, JSON.stringify(updated));
    }

    // Persist changes to server database immediately
    fetch('/api/orders', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeaders(),
      },
      body: JSON.stringify({
        orderNumber: selectedOrder.orderNumber,
        updates,
      }),
    }).catch(() => {});

    setSaveSuccess(true);
    showNotice('تم حفظ تعديلات الطلب بنجاح.');
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Archive an active order (Moves order to Archive so it NEVER returns to Active)
  const handleArchiveOrder = async (orderToArchive: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`هل تريد حذف الطلب #${orderToArchive.orderNumber} من الطلبات النشطة ونقله إلى سجل الأرشيف المحفوظ؟`)) return;

    const remainingActive = orders.filter((o) => o.orderNumber !== orderToArchive.orderNumber);
    const orderWithArchiveTag = {
      ...orderToArchive,
      isArchived: true,
      archivedAt: new Date().toISOString(),
    };
    const updatedArchive = [
      orderWithArchiveTag,
      ...archivedOrders.filter((o) => o.orderNumber !== orderToArchive.orderNumber),
    ];

    setOrders(remainingActive);
    setArchivedOrders(updatedArchive);
    localStorage.setItem(ACTIVE_ORDERS_KEY, JSON.stringify(remainingActive));
    localStorage.setItem(ARCHIVE_ORDERS_KEY, JSON.stringify(updatedArchive));

    if (selectedOrder?.orderNumber === orderToArchive.orderNumber) {
      setSelectedOrder(null);
    }

    // Persist archive flag to cloud server
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({
          orderNumber: orderToArchive.orderNumber,
          updates: {
            isArchived: true,
            archivedAt: new Date().toISOString(),
          },
        }),
      });
    } catch {}

    showNotice(`تم حذف الطلب #${orderToArchive.orderNumber} من الطلبات النشطة ونقله إلى سجل الأرشيف بنجاح.`);
  };

  // Restore order from archive back to active
  const handleRestoreOrder = async (orderToRestore: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`هل تريد استعادة الطلب #${orderToRestore.orderNumber} إلى قائمة الطلبات النشطة؟`)) return;

    const remainingArchive = archivedOrders.filter((o) => o.orderNumber !== orderToRestore.orderNumber);
    const restoredOrder = {
      ...orderToRestore,
      isArchived: false,
      archivedAt: null,
    };
    const updatedActive = [restoredOrder, ...orders.filter((o) => o.orderNumber !== orderToRestore.orderNumber)];

    setArchivedOrders(remainingArchive);
    setOrders(updatedActive);
    localStorage.setItem(ARCHIVE_ORDERS_KEY, JSON.stringify(remainingArchive));
    localStorage.setItem(ACTIVE_ORDERS_KEY, JSON.stringify(updatedActive));

    if (selectedOrder?.orderNumber === orderToRestore.orderNumber) {
      setSelectedOrder(null);
    }

    // Sync restored status to server
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({
          orderNumber: orderToRestore.orderNumber,
          updates: {
            isArchived: false,
            archivedAt: null,
          },
        }),
      });
    } catch {}

    showNotice(`تمت استعادة الطلب #${orderToRestore.orderNumber} إلى قائمة الطلبات النشطة.`);
  };

  // Delete Order: If in Active tab, moves to Archive. If in Archive, permanently deletes.
  const handleDeleteOrder = (order: any, isFromArchive = false, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!isFromArchive) {
      // In Active Orders tab: "حذف" moves the order to Archive!
      handleArchiveOrder(order);
      return;
    }

    // In Archive tab: permanent delete
    if (!confirm(`تحذير: هل أنت متأكد من مسح الطلب #${order.orderNumber} نهائياً من سجل الأرشيف والسيرفر؟ لن يمكن استرجاعه.`)) return;

    const updated = archivedOrders.filter((o) => o.orderNumber !== order.orderNumber);
    setArchivedOrders(updated);
    localStorage.setItem(ARCHIVE_ORDERS_KEY, JSON.stringify(updated));

    // Delete from server so it never returns on reload
    fetch(`/api/orders?orderNumber=${encodeURIComponent(order.orderNumber)}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    }).catch(() => {});

    if (selectedOrder?.orderNumber === order.orderNumber) {
      setSelectedOrder(null);
    }
    showNotice(`تم مسح الطلب #${order.orderNumber} نهائياً من الأرشيف والسيرفر.`);
  };

  // Clear entire archive
  const handleClearArchive = () => {
    if (archivedOrders.length === 0) return;
    if (!confirm(`هل أنت متأكد من مسح جميع الطلبات المؤرشفة (${archivedOrders.length} طلب) نهائياً؟`)) return;

    archivedOrders.forEach((o) => {
      fetch(`/api/orders?orderNumber=${encodeURIComponent(o.orderNumber)}`, {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
      }).catch(() => {});
    });

    setArchivedOrders([]);
    localStorage.setItem(ARCHIVE_ORDERS_KEY, JSON.stringify([]));
    showNotice('تم تفريغ سجل الأرشيف بالكامل.');
  };

  // Export orders to CSV
  const handleExportCSV = () => {
    const listToExport = activeTab === 'active' ? orders : archivedOrders;
    if (listToExport.length === 0) {
      alert('لا توجد طلبات لتصديرها.');
      return;
    }

    const headers = ['Order Ref', 'Date', 'Customer Name', 'Phone', 'Governorate', 'City', 'Status', 'Total EGP'];
    const rows = listToExport.map((o) => [
      o.orderNumber,
      o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB') : '',
      `"${o.customerName || ''}"`,
      o.customerPhone || '',
      o.shippingAddress?.governorate || o.governorate || '',
      `"${o.shippingAddress?.city || ''}"`,
      o.status,
      (o.totalInPiasters / 100).toFixed(2),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `raheeq-orders-${activeTab}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const safeOrders = Array.isArray(orders) ? orders.filter(Boolean) : [];
  const safeArchived = Array.isArray(archivedOrders) ? archivedOrders.filter(Boolean) : [];
  const currentDisplayList = activeTab === 'active' ? safeOrders : safeArchived;

  const filteredOrders = currentDisplayList.filter((o) => {
    if (!o) return false;
    if (filterStatus !== 'All' && o.status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchNumber = o.orderNumber?.toLowerCase().includes(term);
      const matchName = o.customerName?.toLowerCase().includes(term);
      const matchPhone = o.customerPhone?.includes(term);
      if (!matchNumber && !matchName && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-teal-500/50 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#54d1b2]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-teal-800 uppercase">
              إدارة وأرشفة طلبات الدفع عند الاستلام والشحن
            </span>
            <span className="bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
              Raheeq Order Management
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1 flex items-center gap-2.5">
            <span>إدارة وتاريخ وسجل الطلبات</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            يمكنك تأكيد ومتابعة الطلبات، نقل الطلبات المكتملة إلى سجل الأرشيف الدائم، أو حذف أي طلب نهائياً.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير السجل (CSV)</span>
          </button>

          {activeTab === 'archive' && archivedOrders.length > 0 && (
            <button
              onClick={handleClearArchive}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>تفريغ الأرشيف بالكامل</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs: Active vs Archive Log */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-2">
        <button
          onClick={() => {
            setActiveTab('active');
            setFilterStatus('All');
          }}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'active'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>الطلبات النشطة والجارية</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'}`}>
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('archive');
            setFilterStatus('All');
          }}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'archive'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>سجل أرشيف الطلبات المحفوظة (History Log)</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${activeTab === 'archive' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'}`}>
            {archivedOrders.length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 text-xs">
          {['All', 'PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-colors ${
                filterStatus === st
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {st === 'All' ? 'جميع الحالات' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث برقم الطلب، الهاتف، أو اسم العميل..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pr-9 pl-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 font-medium"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200 font-bold">
              <tr>
                <th className="p-4 text-right">رقم الطلب (Ref)</th>
                <th className="p-4 text-right">العميل والهاتف</th>
                <th className="p-4 text-right">المحافظة</th>
                <th className="p-4 text-right">حالة التجهيز</th>
                <th className="p-4 text-right">حالة التحصيل</th>
                <th className="p-4 text-right">شركة الشحن</th>
                <th className="p-4 text-right">إجمالي المبلغ</th>
                <th className="p-4 text-center">إجراءات التحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 space-y-2">
                    <History className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-700">
                      {activeTab === 'active'
                        ? 'لا توجد طلبات نشطة حالياً تطابق معايير البحث.'
                        : 'سجل الأرشيف فارغ حالياً. الطلبات المؤرشفة ستحفظ هنا بأمان.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusMeta = getOrderStatusLabel(order.status) || {
                    labelEn: 'Pending Confirmation',
                    labelAr: 'قيد التأكيد',
                    colorClass: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
                  };
                  const payMeta = getPaymentStatusLabel(order.paymentStatus) || {
                    labelEn: 'Cash Pending Collection',
                    labelAr: 'الدفع عند الاستلام (قيد التحصيل)',
                    colorClass: 'text-amber-400 bg-amber-400/10',
                  };
                  const isArchived = activeTab === 'archive';

                  return (
                    <tr
                      key={order.orderNumber}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        selectedOrder?.orderNumber === order.orderNumber ? 'bg-teal-50/50' : ''
                      }`}
                      onClick={() => openOrderDetails(order)}
                    >
                      <td className="p-4 font-mono text-teal-800 font-bold text-sm">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(order.orderNotes?.includes('سريع') || order.orderNumber?.includes('EXP')) && (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-2xs">
                              ⚡ سريع
                            </span>
                          )}
                          <span>{order.orderNumber}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{order.customerName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{order.customerPhone}</p>
                      </td>
                      <td className="p-4 text-slate-700 font-semibold">
                        {order.shippingAddress?.governorate || order.governorate || 'القاهرة'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusMeta?.colorClass || 'text-amber-400 bg-amber-400/10 border-amber-400/30'}`}>
                          {statusMeta?.labelAr || statusMeta?.labelEn || 'قيد التأكيد'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[11px] font-bold ${payMeta?.colorClass || 'text-amber-400 bg-amber-400/10'}`}>
                          {payMeta?.labelAr || payMeta?.labelEn || 'الدفع عند الاستلام'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">
                        {order.courierName ? (
                          <span className="text-teal-700 font-semibold">
                            {order.courierName} ({order.trackingNumber || 'Pending'})
                          </span>
                        ) : (
                          <span className="text-slate-400">لم يتم التعيين</span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-900 text-sm font-mono whitespace-nowrap">
                        {formatPrice(order.totalInPiasters || order.totalAmountInPiasters || 0)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openOrderDetails(order)}
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg font-bold text-xs border border-teal-200 transition-colors cursor-pointer"
                            title="عرض وتعديل التفاصيل"
                          >
                            عرض
                          </button>

                          {isArchived ? (
                            <button
                              onClick={(e) => handleRestoreOrder(order, e)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200 cursor-pointer"
                              title="استعادة إلى الطلبات النشطة"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleArchiveOrder(order, e)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors border border-amber-200 cursor-pointer"
                              title="نقل إلى سجل الأرشيف"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={(e) => handleDeleteOrder(order, isArchived, e)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-rose-200 cursor-pointer"
                            title={isArchived ? 'حذف نهائي من الأرشيف والسيرفر' : 'حذف ونقل للأرشيف'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Order Detailed Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white text-slate-900 flex flex-col shadow-2xl p-6 overflow-y-auto space-y-6 border-l border-slate-200">
              
              {/* Drawer Header */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-teal-800">تفاصيل الطلب والتحصيل</span>
                    {archivedOrders.some((o) => o.orderNumber === selectedOrder.orderNumber) && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        مؤرشف في السجل
                      </span>
                    )}
                  </div>
                  <h2 className="font-mono text-2xl font-bold text-teal-800">{selectedOrder.orderNumber}</h2>
                  <p className="text-xs text-slate-500">
                    تاريخ الطلب: {formatOrderDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Contact Card with Direct WhatsApp */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-serif font-bold text-base text-slate-900">{selectedOrder.customerName}</h3>
                    <p className="text-xs text-slate-600 font-mono mt-0.5">{selectedOrder.customerPhone}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedOrder.shippingAddress?.streetAddress || ''} — {selectedOrder.shippingAddress?.city || ''} ({selectedOrder.shippingAddress?.governorate || selectedOrder.governorate || ''})
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <a
                      href={`tel:${selectedOrder.customerPhone}`}
                      className="flex-1 bg-white hover:bg-slate-100 text-slate-800 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                      <span>اتصال هاتفي</span>
                    </a>

                    <a
                      href={`https://wa.me/${formatPhoneForWhatsApp(selectedOrder.customerPhone)}?text=${encodeURIComponent(
                        `مرحباً أستاذ ${selectedOrder.customerName || 'عميل المتجر'}، معك دار رَحِيقْ للعطور الفاخرة 💎 بخصوص طلبكم رقم ${selectedOrder.orderNumber || ''}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>محادثة واتساب مباشرة</span>
                    </a>
                  </div>

                  {/* Smart Automated Notification Buttons */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                      إشعارات واتساب الرسمية التلقائية (WhatsApp Automation)
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      <a
                        href={generateOrderConfirmationWhatsapp(selectedOrder)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white hover:bg-teal-50 text-teal-800 rounded-lg text-[11px] font-bold border border-teal-200 text-center transition-colors shadow-2xs flex items-center justify-center gap-1"
                        title="إرسال فاتورة وتأكيد الطلب للعميل عبر واتساب"
                      >
                        <span>📋 إرسال الفاتورة والتأكيد</span>
                      </a>

                      <a
                        href={generateDispatchAlertWhatsapp(selectedOrder, editCourierName, editTrackingNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white hover:bg-blue-50 text-blue-800 rounded-lg text-[11px] font-bold border border-blue-200 text-center transition-colors shadow-2xs flex items-center justify-center gap-1"
                        title="إرسال إشعار خروج الشحنة مع المندوب للمعاينة"
                      >
                        <span>🚚 إشعار خروج للمعاينة</span>
                      </a>

                      <a
                        href={generateFulfilledReceiptWhatsapp(selectedOrder)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white hover:bg-amber-50 text-amber-800 rounded-lg text-[11px] font-bold border border-amber-200 text-center transition-colors shadow-2xs flex items-center justify-center gap-1"
                        title="إرسال رسالة شكر وإرشادات الثبات الملكي"
                      >
                        <span>👑 شكر وإرشادات الثبات</span>
                      </a>
                    </div>
                  </div>
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
                  {selectedOrder.items?.map((item: any, idx: number) => {
                    const itemName =
                      item.productNameAr ||
                      item.productNameEn ||
                      item.title ||
                      item.productNameSnapshot ||
                      'عطر فاخر';
                    const itemVariant =
                      item.variantTitleAr ||
                      item.variantTitleEn ||
                      item.variantTitleSnapshot ||
                      '';
                    const itemPrice =
                      item.subtotalInPiasters ??
                      (item.unitPriceInPiasters
                        ? item.unitPriceInPiasters * (item.quantity || 1)
                        : selectedOrder.totalInPiasters || 0);

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{itemName}</p>
                          <p className="text-[11px] text-teal-800 font-mono">
                            {itemVariant} {item.volumeMl ? `• ${item.volumeMl}ml` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{formatPrice(itemPrice)}</p>
                          <p className="text-slate-500 text-[10px]">الكمية: {item.quantity || 1}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>مجموع العطور:</span>
                  <span className="font-semibold text-slate-900">
                    {formatPrice(selectedOrder.subtotalInPiasters || selectedOrder.totalInPiasters || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>تكلفة الشحن والتوصيل:</span>
                  <span className="text-teal-700 font-bold">
                    {(selectedOrder.shippingInPiasters || 0) === 0
                      ? 'مجاني'
                      : formatPrice(selectedOrder.shippingInPiasters)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm">
                  <span>إجمالي المبلغ المطلوب نقداً عند الباب:</span>
                  <span className="text-teal-800 text-base">
                    {formatPrice(selectedOrder.totalInPiasters || selectedOrder.totalAmountInPiasters || 0)}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Save, Archive, and Permanent Delete */}
              <div className="pt-2 space-y-2.5">
                <button
                  onClick={handleSaveChanges}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3.5 px-4 rounded-xl text-xs tracking-wider uppercase font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>{saveSuccess ? 'تم حفظ التعديلات بنجاح!' : 'حفظ التغييرات على الطلب'}</span>
                </button>

                <div className="flex gap-2">
                  {archivedOrders.some((o) => o.orderNumber === selectedOrder.orderNumber) ? (
                    <>
                      <button
                        onClick={() => handleRestoreOrder(selectedOrder)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>استعادة إلى الطلبات النشطة</span>
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(selectedOrder, true)}
                        className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>مسح نهائي من الأرشيف</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleArchiveOrder(selectedOrder)}
                        className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Archive className="w-4 h-4" />
                        <span>نقل إلى سجل الأرشيف</span>
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(selectedOrder, false)}
                        className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>حذف ونقل للأرشيف</span>
                      </button>
                    </>
                  )}
                </div>
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
