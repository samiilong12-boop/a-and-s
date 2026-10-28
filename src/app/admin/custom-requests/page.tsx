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
} from 'lucide-react';
import { useCustomRequest } from '@/context/CustomRequestContext';
import { BespokePerfumeRequest } from '@/types';

export default function AdminCustomRequestsPage() {
  const { requests, updateRequestStatus, deleteRequest, clearFulfilledRequests, refreshRequests, openModal } = useCustomRequest();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'CONTACTED' | 'FULFILLED' | 'CANCELLED'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fulfilledCount = requests.filter((r) => r.status === 'FULFILLED').length;

  useEffect(() => {
    refreshRequests();
    const interval = setInterval(() => {
      refreshRequests();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshRequests]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshRequests();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredRequests = requests.filter((req) => {
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = req.customerName?.toLowerCase().includes(term);
      const matchPhone = req.customerPhone?.toLowerCase().includes(term);
      const matchPerfume = req.perfumeName?.toLowerCase().includes(term);
      if (!matchName && !matchPhone && !matchPerfume) return false;
    }
    return true;
  });

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
            <span>تم التواصل (Contacted)</span>
          </span>
        );
      case 'FULFILLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>تم التنفيذ والتجهيز (Fulfilled)</span>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
              طلبات العطور المخصصة والخلطات (Bespoke Requests)
            </h1>
            <span className="bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {requests.length} طلب إجمالي
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة طلبات العطور التي يطلبها الزوار عبر زر "عطرك المفضل مش موجود؟ اطلبه الآن أو اطلب خلطتك الخاصة".
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {fulfilledCount > 0 && (
            <button
              onClick={() => {
                if (confirm(`هل تريد بالتأكيد مسح وحذف كافة الطلبات التي تم تنفيذها (${fulfilledCount} طلب) نهائياً من السجل؟`)) {
                  clearFulfilledRequests();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-colors shadow-xs"
              title="مسح كافة الطلبات المنفذة"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>مسح الطلبات المنفذة ({fulfilledCount})</span>
            </button>
          )}

          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>تسجيل طلب عطر مخصص جديد</span>
          </button>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>تحديث الطلبات</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم، رقم الهاتف، أو اسم العطر..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-9 pl-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 transition-colors"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {(['ALL', 'NEW', 'CONTACTED', 'FULFILLED', 'CANCELLED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-teal-800 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st === 'ALL' && 'الكل'}
              {st === 'NEW' && 'الجديدة'}
              {st === 'CONTACTED' && 'تم التواصل'}
              {st === 'FULFILLED' && `تم التنفيذ (${fulfilledCount})`}
              {st === 'CANCELLED' && 'الملغية'}
            </button>
          ))}
        </div>
      </div>

      {/* Banner for Fulfilled Requests */}
      {statusFilter === 'FULFILLED' && fulfilledCount > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>لديك {fulfilledCount} طلب تم تنفيذه بالكامل. يمكنك حذفها نهائياً لتفريغ القائمة بعد التسليم.</span>
          </div>
          <button
            onClick={() => {
              if (confirm(`هل تريد بالتأكيد حذف ومسح جميع الطلبات التي تم تنفيذها (${fulfilledCount} طلب) نهائياً من السجل؟`)) {
                clearFulfilledRequests();
              }
            }}
            className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>مسح جميع الطلبات المنفذة الآن</span>
          </button>
        </div>
      )}

      {/* Requests Grid / List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <FlaskConical className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">لا توجد طلبات مطابقة</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            عندما يقوم أي عميل بإرسال طلب عطر مخصص أو خلطة خاصة من واجهة المتجر، سيظهر طلبه هنا فوراً مع بيانات التواصل.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRequests.map((req) => {
            const cleanPhone = req.customerPhone?.replace(/[^0-9]/g, '');
            const waNumber = cleanPhone.startsWith('0')
              ? `2${cleanPhone}`
              : cleanPhone.startsWith('20')
              ? cleanPhone
              : `20${cleanPhone}`;

            const waText = `مرحباً أستاذ ${req.customerName}، معك إدارة دار رَحِيقْ (RAHEEQ Haute Parfumerie) 💎.%0Aبخصوص طلبك الخاص لعطر: *${req.perfumeName}* (حجم: ${req.volumeMl} - تركيز: ${req.concentration.replace(/_/g, ' ')})%0Aيسعدنا تأكيد إمكانية توفير التركيبة بأعلى درجات الثبات والفوحان والتوصيل لباب بيتك.`;

            return (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-teal-300 transition-colors space-y-4"
              >
                {/* Header row: ID + Status + Delete */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">#{req.id}</span>
                    {getStatusBadge(req.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">
                      {new Date(req.createdAt).toLocaleDateString('ar-EG', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm('هل تريد بالتأكيد حذف هذا الطلب؟')) {
                          deleteRequest(req.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="حذف الطلب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Requested Perfume Highlight */}
                <div className="bg-teal-50/70 border border-teal-200/80 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-wider uppercase font-bold text-teal-800">
                      العطر أو الخلطة المطلوبة
                    </span>
                    <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border border-teal-200 text-teal-900">
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
                  <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-700 border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-0.5">ملاحظات العميل:</span>
                    <p className="italic">{req.notes}</p>
                  </div>
                )}

                {/* Actions: Direct WhatsApp Chat + Status Changer */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  {/* WhatsApp Direct Chat Button */}
                  <a
                    href={`https://wa.me/${waNumber}?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (req.status === 'NEW') {
                        updateRequestStatus(req.id, 'CONTACTED');
                      }
                    }}
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs hover:scale-105"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>محادثة العميل عبر واتساب</span>
                  </a>

                  {/* Status Toggle Buttons & Delete Actions */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {req.status === 'FULFILLED' && (
                      <button
                        onClick={() => {
                          if (confirm(`هل تريد بالتأكيد حذف هذا الطلب المنفذ (${req.perfumeName}) نهائياً؟`)) {
                            deleteRequest(req.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors ml-1"
                        title="حذف هذا الطلب المنفذ"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" />
                        <span>حذف الطلب المنفذ</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
                      <button
                        onClick={() => updateRequestStatus(req.id, 'NEW')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded ${
                          req.status === 'NEW'
                            ? 'bg-amber-100 text-amber-800 font-black shadow-xs'
                            : 'text-slate-600 hover:bg-slate-200/70'
                        }`}
                      >
                        جديد
                      </button>
                      <button
                        onClick={() => updateRequestStatus(req.id, 'CONTACTED')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded ${
                          req.status === 'CONTACTED'
                            ? 'bg-blue-100 text-blue-800 font-black shadow-xs'
                            : 'text-slate-600 hover:bg-slate-200/70'
                        }`}
                      >
                        تم التواصل
                      </button>
                      <button
                        onClick={() => updateRequestStatus(req.id, 'FULFILLED')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded ${
                          req.status === 'FULFILLED'
                            ? 'bg-emerald-100 text-emerald-800 font-black shadow-xs'
                            : 'text-slate-600 hover:bg-slate-200/70'
                        }`}
                      >
                        تم التنفيذ
                      </button>
                      <button
                        onClick={() => updateRequestStatus(req.id, 'CANCELLED')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded ${
                          req.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800 font-black shadow-xs'
                            : 'text-slate-600 hover:bg-slate-200/70'
                        }`}
                      >
                        ملغي
                      </button>
                    </div>
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
