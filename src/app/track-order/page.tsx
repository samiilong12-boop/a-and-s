'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FlaskConical,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Phone,
  User,
} from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { getOrderStatusLabel } from '@/lib/state-machines';
import { validateEgyptianPhone } from '@/lib/phone-validation';
import { BespokePerfumeRequest } from '@/types';
import { CUSTOM_REQUESTS_STORAGE_KEY } from '@/context/CustomRequestContext';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';

  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNumber);
  const [phoneInput, setPhoneInput] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<any | null>(null);
  const [searchedBespoke, setSearchedBespoke] = useState<BespokePerfumeRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const cleanQuery = (str: string) => str.trim().replace(/^#/, '').toLowerCase();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setHasSearched(true);
    setSearchedOrder(null);
    setSearchedBespoke(null);

    const query = cleanQuery(orderNumberInput);
    if (!query) {
      setErrorMessage('يرجى إدخال رقم مرجع الطلب (مثال: AS-202610-1234 أو REQ-...)');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Check Standard E-Commerce Orders (from Checkout: a_and_s_demo_orders)
      const storedOrders = localStorage.getItem('a_and_s_demo_orders');
      const orders = storedOrders ? JSON.parse(storedOrders) : [];
      
      const foundOrder = orders.find((o: any) => cleanQuery(o.orderNumber) === query);

      if (foundOrder) {
        if (phoneInput.trim()) {
          const normInputPhone = validateEgyptianPhone(phoneInput).normalizedPhone;
          const cleanPhone = phoneInput.replace(/[^0-9]/g, '');
          const matchPhone =
            foundOrder.customerPhone === normInputPhone ||
            foundOrder.customerPhone?.replace(/[^0-9]/g, '').includes(cleanPhone);

          if (!matchPhone) {
            setErrorMessage('رقم الهاتف المحمول غير متطابق مع مرجع هذا الطلب.');
            setIsLoading(false);
            return;
          }
        }
        setSearchedOrder(foundOrder);
        setIsLoading(false);
        return;
      }

      // 2. Check Custom / Bespoke Perfume Requests (REQ-...)
      let bespokeList: BespokePerfumeRequest[] = [];
      try {
        const storedBespoke =
          localStorage.getItem(CUSTOM_REQUESTS_STORAGE_KEY) ||
          localStorage.getItem('a_and_s_custom_requests_cache');
        if (storedBespoke) {
          bespokeList = JSON.parse(storedBespoke);
        }
      } catch (e) {
        // ignore
      }

      // If not in local cache or looking for a specific request, also query API
      try {
        const apiRes = await fetch('/api/custom-requests');
        if (apiRes.ok) {
          const remoteList: BespokePerfumeRequest[] = await apiRes.json();
          const map = new Map<string, BespokePerfumeRequest>();
          bespokeList.forEach((r) => map.set(r.id, r));
          remoteList.forEach((r) => map.set(r.id, r));
          bespokeList = Array.from(map.values());
        }
      } catch (e) {
        // continue with local list
      }

      const foundBespoke = bespokeList.find((r) => cleanQuery(r.id) === query);

      if (foundBespoke) {
        if (phoneInput.trim()) {
          const cleanInput = phoneInput.replace(/[^0-9]/g, '');
          const cleanTarget = foundBespoke.customerPhone?.replace(/[^0-9]/g, '');
          const match = cleanTarget?.includes(cleanInput) || cleanInput.includes(cleanTarget);
          if (!match && cleanInput.length >= 4) {
            setErrorMessage('رقم الهاتف المحمول غير متطابق مع مرجع هذا الطلب.');
            setIsLoading(false);
            return;
          }
        }
        setSearchedBespoke(foundBespoke);
        setIsLoading(false);
        return;
      }

      // If not found in either
      setErrorMessage(
        'لم يتم العثور على طلب بهذا الرقم المرجعي. يرجى مراجعة الكود المستلم أو التواصل مع كونسيرج خدمة العملاء.'
      );
    } catch (err) {
      console.error(err);
      setErrorMessage('حدث خطأ أثناء فحص سجلات الشحن.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      handleSearch();
    }
  }, [initialOrderNumber]);

  return (
    <div className="min-h-screen bg-[#F7F5EE] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="badge-turquoise px-3.5 py-1 rounded-sm font-bold uppercase tracking-widest text-[11px]">
            خدمة كونسيرج تتبع الشحنات والطلبات
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#080A0A]">
            تتبع مسار شحنتك العطرية
          </h1>
          <p className="text-xs text-[#4A5553]">
            أدخل رقم مرجع الطلب (مثل: AS-202610-XXXX أو كود طلب العطر الخاص REQ-XXXX) ورقم هاتفك المحمول لمتابعة حالة التجهيز والشحن لحظة بلحظة.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E3D6] shadow-sm max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#080A0A] block">
                  رقم مرجع الطلب <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={orderNumberInput}
                  onChange={(e) => setOrderNumberInput(e.target.value)}
                  placeholder="AS-202610-XXXX أو REQ-..."
                  className="w-full bg-[#FAF9F5] border border-[#E7E3D6] rounded-xl px-3.5 py-2.5 text-xs text-[#080A0A] uppercase placeholder-[#788784] focus:outline-none focus:border-[#2DD4BF] font-mono font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#080A0A] block">
                  رقم الهاتف المسجل <span className="text-[#788784] font-normal">(اختياري)</span>
                </label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="010XXXXXXXX"
                  className="w-full bg-[#FAF9F5] border border-[#E7E3D6] rounded-xl px-3.5 py-2.5 text-xs text-[#080A0A] placeholder-[#788784] focus:outline-none focus:border-[#2DD4BF] font-mono"
                />
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-turquoise py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 transition-all cursor-pointer"
            >
              <Search className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'جارٍ فحص سجلات الشحن...' : 'بحث عن الشحنة'}</span>
            </button>
          </form>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Results Card 1: Bespoke Custom Perfume Request (REQ-...)       */}
        {/* ------------------------------------------------------------- */}
        {searchedBespoke && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#2DD4BF]/40 shadow-xl space-y-6 max-w-2xl mx-auto animate-in fade-in">
            {/* Header with Luxury Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E3D6] gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#0D9488] bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                    #{searchedBespoke.id.toUpperCase()}
                  </span>
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FlaskConical className="w-3 h-3 text-amber-700" />
                    <span>طلب عطر مخصص (Bespoke Formula)</span>
                  </span>
                </div>
                <h3 className="font-serif font-bold text-xl text-[#080A0A]">
                  العميل: {searchedBespoke.customerName}
                </h3>
              </div>

              {/* Status Badge */}
              <div>
                {searchedBespoke.status === 'NEW' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>قيد المراجعة الفنية بالمعمل (Under Review)</span>
                  </span>
                )}
                {searchedBespoke.status === 'CONTACTED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-300">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>تم التواصل وجارٍ تحضير التركيبة (Preparing)</span>
                  </span>
                )}
                {searchedBespoke.status === 'FULFILLED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>جاهز وفي طريقه للتسليم (Out for Delivery)</span>
                  </span>
                )}
                {searchedBespoke.status === 'CANCELLED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                    <span>تم إلغاء الطلب (Cancelled)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Request Summary */}
            <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E7E3D6] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#0D9488] uppercase tracking-wider">
                  تفاصيل التركيبة العطرية المطلوبة:
                </span>
                <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-[#E7E3D6]">
                  {searchedBespoke.volumeMl}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-serif font-bold text-lg text-[#080A0A]">
                  {searchedBespoke.perfumeName}
                </h4>
                <p className="text-xs text-[#788784]">
                  درجة التركيز: <strong className="text-[#080A0A]">{searchedBespoke.concentration.replace(/_/g, ' ')}</strong>
                </p>
              </div>

              {searchedBespoke.notes && (
                <div className="p-3 bg-white rounded-xl border border-[#E7E3D6] text-xs text-[#4A5553]">
                  <span className="font-bold text-[#080A0A] block mb-0.5">ملاحظاتك المسجلة:</span>
                  <p className="italic">{searchedBespoke.notes}</p>
                </div>
              )}
            </div>

            {/* Timeline Progress */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-[#080A0A] block">مسار تجهيز العطر المخصص:</span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200">
                  <span className="w-5 h-5 rounded-full bg-teal-700 text-white mx-auto flex items-center justify-center text-[10px] font-bold mb-1">
                    ✓
                  </span>
                  <span className="font-bold text-teal-900 block text-[11px]">استلام الطلب</span>
                  <span className="text-[10px] text-teal-700">تم التسجيل بالمعمل</span>
                </div>

                <div className={`p-2.5 rounded-xl border ${searchedBespoke.status === 'CONTACTED' || searchedBespoke.status === 'FULFILLED' ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold mb-1 ${searchedBespoke.status === 'CONTACTED' || searchedBespoke.status === 'FULFILLED' ? 'bg-teal-700 text-white' : 'bg-slate-300 text-slate-700'}`}>
                    2
                  </span>
                  <span className="font-bold text-slate-800 block text-[11px]">المعايرة والتعتيق</span>
                  <span className="text-[10px] text-slate-500">خلط الزيوت النقية</span>
                </div>

                <div className={`p-2.5 rounded-xl border ${searchedBespoke.status === 'FULFILLED' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold mb-1 ${searchedBespoke.status === 'FULFILLED' ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'}`}>
                    3
                  </span>
                  <span className="font-bold text-slate-800 block text-[11px]">التسليم لباب بيتك</span>
                  <span className="text-[10px] text-slate-500">معاينة قبل الدفع</span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Concierge Button */}
            <div className="pt-2 border-t border-[#E7E3D6]">
              <a
                href={`https://wa.me/201131068790?text=${encodeURIComponent(
                  `مرحباً دار رَحِيقْ، أود متابعة حالة طلبي الخاص رقم #${searchedBespoke.id} لعطر: ${searchedBespoke.perfumeName}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>تواصل مع خبير المعمل عبر واتساب للمتابعة الفورية</span>
              </a>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Results Card 2: Standard Store Order (AS-202610-XXXX)         */}
        {/* ------------------------------------------------------------- */}
        {searchedOrder && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E3D6] shadow-sm space-y-6 max-w-2xl mx-auto animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E3D6] gap-2">
              <div>
                <span className="text-[11px] font-mono text-[#0D9488] font-bold block">
                  {searchedOrder.orderNumber}
                </span>
                <h3 className="font-serif font-bold text-lg text-[#080A0A] mt-0.5">
                  العميل: {searchedOrder.customerName}
                </h3>
              </div>
              <div className="text-left">
                <span className="badge-turquoise px-3 py-1 rounded-sm font-bold text-xs inline-block">
                  {getOrderStatusLabel(searchedOrder.status)?.labelAr || searchedOrder.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E7E3D6]">
                <span className="text-[#788784] block">المحافظة والعنوان</span>
                <span className="font-bold text-[#080A0A] mt-0.5 block">
                  {searchedOrder.shippingAddress?.governorate} — {searchedOrder.shippingAddress?.city}
                </span>
              </div>

              <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E7E3D6]">
                <span className="text-[#788784] block">إجمالي الدفع عند الاستلام</span>
                <span className="font-bold text-[#0D9488] font-mono text-sm mt-0.5 block">
                  {formatPrice(searchedOrder.totalInPiasters)}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs text-[#080A0A]">القطع العطرية في الشحنة:</h4>
              <div className="divide-y divide-[#E7E3D6] border border-[#E7E3D6] rounded-2xl p-4 bg-[#FAF9F5]">
                {searchedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-serif font-bold text-[#080A0A] block">{item.productNameEn}</span>
                      <span className="text-[11px] text-[#788784]">{item.volumeMl} ML • الكمية: {item.quantity}</span>
                    </div>
                    <span className="font-mono font-bold text-[#0D9488]">{formatPrice(item.subtotalInPiasters)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#E7E3D6]">
              <a
                href={`https://wa.me/201131068790?text=${encodeURIComponent(
                  `مرحباً دار رَحِيقْ، أود الاستفسار عن موعد وصول طلبي رقم ${searchedOrder.orderNumber}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>الاستفسار عن موعد وصول المندوب عبر واتساب</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-[#788784]">Loading Concierge...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
