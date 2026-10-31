'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MessageCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Phone,
  User,
  FlaskConical,
  ExternalLink,
  RefreshCw,
  Archive,
  RotateCcw,
  Download,
  Check,
} from 'lucide-react';
import { useCustomRequest } from '@/context/CustomRequestContext';
import { BespokePerfumeRequest } from '@/types';
import { generateBespokeStatusWhatsapp } from '@/lib/whatsappNotifications';

type TabFilter = 'ACTIVE' | 'NEW' | 'CONTACTED' | 'ARCHIVE' | 'CANCELLED' | 'ALL';

export default function AdminCustomRequestsPage() {
  const {
    requests,
    updateRequestStatus,
    deleteRequest,
    clearFulfilledRequests,
    markAllActiveAsFulfilled,
    refreshRequests,
    openModal,
  } = useCustomRequest();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TabFilter>('ACTIVE');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Safe guarded requests list
  const safeRequests = Array.isArray(requests) ? requests.filter(Boolean) : [];

  // Counters for badges at the top
  const activeCount = safeRequests.filter((r) => r?.status === 'NEW' || r?.status === 'CONTACTED').length;
  const newCount = safeRequests.filter((r) => r?.status === 'NEW').length;
  const contactedCount = safeRequests.filter((r) => r?.status === 'CONTACTED').length;
  const fulfilledCount = safeRequests.filter((r) => r?.status === 'FULFILLED').length;
  const cancelledCount = safeRequests.filter((r) => r?.status === 'CANCELLED').length;

  useEffect(() => {
    refreshRequests();
    const interval = setInterval(() => {
      refreshRequests();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshRequests]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshRequests();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Filter logic: In 'ACTIVE', show only pending/in-progress. Fulfilled orders move to 'ARCHIVE' immediately.
  const filteredRequests = safeRequests.filter((req) => {
    if (!req) return false;
    if (statusFilter === 'ACTIVE') {
      if (req.status !== 'NEW' && req.status !== 'CONTACTED') return false;
    } else if (statusFilter === 'ARCHIVE') {
      if (req.status !== 'FULFILLED') return false;
    } else if (statusFilter !== 'ALL') {
      if (req.status !== statusFilter) return false;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = req.customerName?.toLowerCase().includes(term);
      const matchPhone = req.customerPhone?.toLowerCase().includes(term);
      const matchPerfume = req.perfumeName?.toLowerCase().includes(term);
      const matchId = req.id?.toLowerCase().includes(term);
      if (!matchName && !matchPhone && !matchPerfume && !matchId) return false;
    }
    return true;
  });

  // Action: Mark single request status
  const handleSetStatus = async (id: string, status: BespokePerfumeRequest['status']) => {
    const res = await updateRequestStatus(id, status);
    if (!res.success) {
      showToast(`فشل تحديث حالة الطلب: ${res.error || 'خطأ في الاتصال'}`);
      return;
    }
    if (status === 'FULFILLED' || status === 'COMPLETED') {
      showToast('تم إتمام الطلب ونقله فورياً إلى سجل الطلبات المنفذة (السجل) ✓');
    } else if (status === 'CONTACTED' || status === 'NEW') {
      showToast('تم تحديث حالة الطلب بنجاح ✓');
    }
  };

  // Action: Mark all active as fulfilled & move to log
  const handleMarkAllActiveAsDone = async () => {
    if (activeCount === 0) return;
    if (
      confirm(
        `هل تريد بالتأكيد تنفيذ كافة الطلبات النشطة (${activeCount} طلب) ونقلها فورياً إلى سجل الطلبات المنفذة؟`
      )
    ) {
      const res = await markAllActiveAsFulfilled();
      if (!res.success) {
        showToast(`فشل تنفيذ بعض الطلبات: ${res.error || 'يرجى المحاولة مجدداً'}`);
      } else {
        showToast(`تم تنفيذ كافة الطلبات النشطة (${activeCount}) ونقلها جميعاً للسجل بنجاح ✓`);
      }
    }
  };

  // Action: Export Fulfilled / All to CSV
  const handleExportCSV = () => {
    const listToExport = statusFilter === 'ARCHIVE' ? requests.filter((r) => r.status === 'FULFILLED') : requests;
    if (listToExport.length === 0) {
      alert('لا توجد طلبات لتصديرها.');
      return;
    }

    const headers = ['كود الطلب', 'اسم العميل', 'رقم الهاتف', 'العطر المطلوب', 'الحجم', 'التركيز', 'الحالة', 'تاريخ الطلب', 'ملاحظات'];
    const rows = listToExport.map((r) => [
      `#${r.id}`,
      `"${r.customerName.replace(/"/g, '""')}"`,
      `"${r.customerPhone}"`,
      `"${r.perfumeName.replace(/"/g, '""')}"`,
      `"${r.volumeMl}"`,
      `"${r.concentration}"`,
      `"${r.status}"`,
      `"${new Date(r.createdAt).toLocaleString('ar-EG')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `raheeq-bespoke-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: BespokePerfumeRequest['status']) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span>طلب جديد (New)</span>
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>تم التواصل وجارٍ التجهيز</span>
          </span>
        );
      case 'FULFILLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>تم التنفيذ (في السجل)</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span>ملغي (Cancelled)</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#080A0A] text-white px-5 py-3 rounded-2xl shadow-2xl border border-teal-500/50 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
              طلبات العطور المخصصة والخلطات (Bespoke Atelier)
            </h1>
            <span className="bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
              {requests.length} طلب إجمالي
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة طلبات العطور التي يطلبها الزوار عبر زر "عطرك المفضل مش موجود؟ اطلبه الآن أو اطلب خلطتك الخاصة".
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Action: Mark all active as fulfilled */}
          {activeCount > 0 && (
            <button
              onClick={handleMarkAllActiveAsDone}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
              title="تنفيذ كافة الطلبات النشطة ونقلها فوراً إلى السجل"
            >
              <Check className="w-4 h-4" />
              <span>تنفيذ الكل ونقله للسجل ({activeCount})</span>
            </button>
          )}

          {/* Action: Clear fulfilled log */}
          {fulfilledCount > 0 && statusFilter === 'ARCHIVE' && (
            <button
              onClick={() => {
                if (confirm(`هل تريد بالتأكيد مسح وتفريغ سجل الطلبات المنفذة (${fulfilledCount} طلب) نهائياً؟`)) {
                  clearFulfilledRequests();
                  showToast('تم تفريغ سجل الطلبات المنفذة بنجاح ✓');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors shadow-xs"
              title="تفريغ سجل الطلبات المنفذة"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>تفريغ السجل بالكامل ({fulfilledCount})</span>
            </button>
          )}

          {/* Action: Export CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
            title="تصدير السجل كملف Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير CSV</span>
          </button>

          {/* Action: Register Manual Request */}
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>تسجيل طلب جديد</span>
          </button>

          <button
            onClick={handleRefresh}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs Bar with Clear Counters for Every Category */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم، رقم الهاتف، أو كود الطلب..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 transition-colors font-medium"
          />
        </div>

        {/* Status Filter Tabs with Counts (يوريني عددها فوق) */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 sm:pb-0 scrollbar-none">
          {/* Tab 1: Active Workspace (Default) */}
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'ACTIVE'
                ? 'bg-teal-900 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>الطلبات النشطة والجارية</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                statusFilter === 'ACTIVE' ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {activeCount}
            </span>
          </button>

          {/* Tab 2: New Only */}
          <button
            onClick={() => setStatusFilter('NEW')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'NEW'
                ? 'bg-amber-800 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>الجديدة</span>
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded-full text-[10px] font-mono font-bold">
              {newCount}
            </span>
          </button>

          {/* Tab 3: Contacted Only */}
          <button
            onClick={() => setStatusFilter('CONTACTED')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'CONTACTED'
                ? 'bg-blue-800 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>تم التواصل</span>
            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-900 rounded-full text-[10px] font-mono font-bold">
              {contactedCount}
            </span>
          </button>

          {/* Tab 4: Archive / Fulfilled Log (السجل) */}
          <button
            onClick={() => setStatusFilter('ARCHIVE')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'ARCHIVE'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-emerald-600" />
            <span>سجل الطلبات المنفذة (السجل)</span>
            <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-950 rounded-full text-[10px] font-mono font-bold">
              {fulfilledCount}
            </span>
          </button>

          {/* Tab 5: Cancelled */}
          <button
            onClick={() => setStatusFilter('CANCELLED')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'CANCELLED'
                ? 'bg-rose-800 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>الملغية</span>
            <span className="px-1.5 py-0.2 bg-rose-100 text-rose-900 rounded-full text-[10px] font-mono font-bold">
              {cancelledCount}
            </span>
          </button>

          {/* Tab 6: All Requests */}
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>الكل</span>
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-800 rounded-full text-[10px] font-mono font-bold">
              {requests.length}
            </span>
          </button>
        </div>
      </div>

      {/* Banner when viewing Archive / Fulfilled Log */}
      {statusFilter === 'ARCHIVE' && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5 text-emerald-900 text-xs font-bold">
            <Archive className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <div>
              <p>سجل أرشيف الطلبات المنفذة المحفوظة ({fulfilledCount} طلب منفذ)</p>
              <p className="text-[11px] font-normal text-emerald-800">
                الطلبات التي تضغط عليها «تم التنفيذ» تنتقل تلقائياً إلى هذا السجل الآمن لإبقاء شاشة العمل اليومية منظمة.
              </p>
            </div>
          </div>
          {fulfilledCount > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  if (confirm(`هل تريد بالتأكيد تفريغ ومسح كافة الطلبات المنفذة (${fulfilledCount} طلب) نهائياً من السجل؟`)) {
                    const res = await clearFulfilledRequests();
                    if (!res.success) {
                      showToast(`فشل تفريغ السجل: ${res.error || 'يرجى المحاولة مجدداً'}`);
                    } else {
                      showToast('تم تفريغ السجل بالكامل بنجاح ✓');
                    }
                  }
                }}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>مسح وتفريغ السجل ({fulfilledCount})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Requests Grid / List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <FlaskConical className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {statusFilter === 'ACTIVE'
              ? 'لا توجد طلبات نشطة حالياً'
              : statusFilter === 'ARCHIVE'
              ? 'سجل الطلبات المنفذة فارغ حالياً'
              : 'لا توجد طلبات في هذا القسم'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {statusFilter === 'ACTIVE'
              ? 'رائع! كل الطلبات الواردة تم تنفيذها ونقلها تلقائياً إلى سجل الطلبات المنفذة.'
              : statusFilter === 'ARCHIVE'
              ? 'عندما تضغط على "تم التنفيذ" لأي طلب، سينتقل فورياً إلى هنا ويحفظ بأمان.'
              : 'الطلبات ستظهر هنا بمجرد وصولها أو تغيير حالتها.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRequests.map((req) => {
            const cleanPhone = (req.customerPhone || '').replace(/[^0-9]/g, '');
            const waNumber = cleanPhone.startsWith('0')
              ? `2${cleanPhone}`
              : cleanPhone.startsWith('20')
              ? cleanPhone
              : cleanPhone ? `20${cleanPhone}` : '201131068790';

            const waText = `مرحباً أستاذ ${req.customerName || 'عميل المتجر'}، معك إدارة دار رَحِيقْ (RAHEEQ Haute Parfumerie) 💎.%0Aبخصوص طلبك الخاص لعطر: *${req.perfumeName || ''}* (حجم: ${req.volumeMl || '100ml'} - تركيز: ${(req.concentration || 'EXTRAIT').replace(/_/g, ' ')})%0Aيسعدنا تأكيد إمكانية توفير التركيبة بأعلى درجات الثبات والفوحان والتوصيل لباب بيتك.`;

            const isArchived = req.status === 'FULFILLED';

            return (
              <div
                key={req.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-4 ${
                  isArchived ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200 hover:border-teal-300'
                }`}
              >
                {/* Header row: ID + Status + Delete */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">#{req.id}</span>
                    {getStatusBadge(req.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(req.createdAt).toLocaleString('ar-EG', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <button
                      onClick={async () => {
                        if (confirm(`هل تريد بالتأكيد حذف هذا الطلب (#${req.id}) نهائياً؟`)) {
                          const res = await deleteRequest(req.id);
                          if (!res.success) {
                            showToast(`فشل حذف الطلب: ${res.error || 'يرجى المحاولة'}`);
                          } else {
                            showToast('تم حذف الطلب نهائياً ✓');
                          }
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="حذف نهائي للطلب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Requested Perfume Highlight */}
                <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-wider uppercase font-bold text-teal-800">
                      العطر أو الخلطة المطلوبة
                    </span>
                    <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border border-teal-200 text-teal-900 font-mono">
                      {req.volumeMl}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    {req.perfumeName}
                  </h3>
                  <div className="text-[11px] text-slate-600 flex items-center gap-2">
                    <span>التركيز المفضل:</span>
                    <strong className="text-slate-800 font-bold">{req.concentration.replace(/_/g, ' ')}</strong>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>اسم العميل</span>
                    </span>
                    <p className="font-bold text-slate-800">{req.customerName || 'عميل المتجر'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>رقم الهاتف / الواتساب</span>
                    </span>
                    <p className="font-mono font-bold text-slate-800">{req.customerPhone}</p>
                  </div>
                </div>

                {/* Customer Notes */}
                {req.notes && (
                  <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-700 border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-0.5">ملاحظات العميل:</span>
                    <p className="italic">{req.notes}</p>
                  </div>
                )}

                {/* Actions: Direct WhatsApp Chat + Status Changer (طوالي تمشي السجل) */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  {/* WhatsApp Direct Chat & Status Alert Buttons */}
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://wa.me/${waNumber}?text=${waText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        if (req.status === 'NEW') {
                          handleSetStatus(req.id, 'CONTACTED');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs hover:scale-102"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>محادثة</span>
                    </a>

                    <a
                      href={generateBespokeStatusWhatsapp(req, req.status)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs"
                      title="إرسال إشعار رسمي بحالة الخلطة للعميل مع رابط التتبع"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-teal-700" />
                      <span>إشعار التتبع</span>
                    </a>
                  </div>

                  {/* Status Toggle & Move to Log Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Restore button if in archive */}
                    {isArchived ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSetStatus(req.id, 'CONTACTED')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                          title="استرجاع الطلب إلى قائمة الطلبات النشطة"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-teal-700" />
                          <span>استعادة للنشط</span>
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`هل تريد بالتأكيد حذف هذا الطلب المنفذ نهائياً من السجل؟`)) {
                              const res = await deleteRequest(req.id);
                              if (!res.success) {
                                showToast(`فشل حذف الطلب: ${res.error || 'يرجى المحاولة'}`);
                              } else {
                                showToast('تم حذف الطلب نهائياً من السجل ✓');
                              }
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                          title="حذف هذا الطلب من السجل"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>حذف</span>
                        </button>
                      </div>
                    ) : (
                      /* Active Buttons: جديد | تم التواصل | تم التنفيذ (Moves straight to log) */
                      <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                        <button
                          onClick={() => handleSetStatus(req.id, 'NEW')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                            req.status === 'NEW'
                              ? 'bg-amber-200 text-amber-900 font-black shadow-xs'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          جديد
                        </button>
                        <button
                          onClick={() => handleSetStatus(req.id, 'CONTACTED')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                            req.status === 'CONTACTED'
                              ? 'bg-blue-200 text-blue-900 font-black shadow-xs'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          تم التواصل
                        </button>
                        {/* Primary Action Button: Marks fulfilled and immediately moves it to the Log */}
                        <button
                          onClick={() => handleSetStatus(req.id, 'FULFILLED')}
                          className="px-3 py-1 text-[11px] font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer hover:scale-105"
                          title="إتمام الطلب ونقله فورياً إلى سجل الطلبات المنفذة"
                        >
                          <Check className="w-3 h-3" />
                          <span>تم التنفيذ (طوالي للسجل)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
