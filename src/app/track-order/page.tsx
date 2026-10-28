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
  Lock,
  Phone,
  User,
  X,
  Sparkles,
} from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { getOrderStatusLabel } from '@/lib/state-machines';
import { useLanguage } from '@/context/LanguageContext';
import { BespokePerfumeRequest } from '@/types';
import { CUSTOM_REQUESTS_STORAGE_KEY } from '@/context/CustomRequestContext';

function TrackOrderContent() {
  const { t, isRtl } = useLanguage();
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';
  const initialPhone = searchParams.get('phone') || '';

  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNumber);
  const [phoneInput, setPhoneInput] = useState(initialPhone);
  const [searchedOrder, setSearchedOrder] = useState<any | null>(null);
  const [searchedBespoke, setSearchedBespoke] = useState<BespokePerfumeRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Clean strings helper
  const cleanStr = (s?: string) => (s || '').trim().toLowerCase().replace(/^#/, '');
  const cleanDigits = (s?: string) => (s || '').replace(/[^0-9]/g, '');

  const executeSearch = async (targetOrderCode?: string, targetPhone?: string) => {
    const rawCode = targetOrderCode !== undefined ? targetOrderCode : orderNumberInput;
    const rawPhone = targetPhone !== undefined ? targetPhone : phoneInput;

    const queryCode = cleanStr(rawCode);
    const queryPhone = cleanDigits(rawPhone);

    setErrorMessage('');
    setHasSearched(true);
    setSearchedOrder(null);
    setSearchedBespoke(null);

    if (!queryCode && !queryPhone) {
      setErrorMessage(
        isRtl
          ? 'يرجى إدخال رقم مرجع الطلب (مثل: REQ-... أو AS-...) أو رقم هاتفك المسجل.'
          : 'Please enter your order reference (REQ-... or AS-...) or registered phone number.'
      );
      return;
    }

    setIsLoading(true);

    try {
      // 1. Load standard orders
      let allOrders: any[] = [];
      try {
        const stored = localStorage.getItem('a_and_s_demo_orders');
        if (stored) allOrders = JSON.parse(stored);
        const archived = localStorage.getItem('a_and_s_archived_orders');
        if (archived) {
          const parsedArch = JSON.parse(archived);
          if (Array.isArray(parsedArch)) allOrders = [...allOrders, ...parsedArch];
        }
      } catch {}

      // 2. Load custom requests (Local + Fresh Server API)
      let allBespoke: BespokePerfumeRequest[] = [];
      try {
        const storedBespoke =
          localStorage.getItem(CUSTOM_REQUESTS_STORAGE_KEY) ||
          localStorage.getItem('a_and_s_custom_requests_cache');
        if (storedBespoke) allBespoke = JSON.parse(storedBespoke);
      } catch {}

      // 2. Query server for matching bespoke request (Secure Targeted Query without exposing other users)
      try {
        const params = new URLSearchParams();
        if (queryCode) params.set('id', queryCode);
        if (queryPhone) params.set('phone', queryPhone);

        const apiRes = await fetch(`/api/custom-requests?${params.toString()}`, { cache: 'no-store' });
        if (apiRes.ok) {
          const resJson = await apiRes.json();
          if (resJson.success && resJson.request) {
            allBespoke = [resJson.request, ...allBespoke.filter((r) => r.id !== resJson.request.id)];
          }
        }
      } catch (e) {
        console.warn('Custom requests targeted fetch error:', e);
      }

      // 3. Query server for matching catalog order (Secure Targeted Query)
      try {
        const params = new URLSearchParams();
        if (queryCode) params.set('orderNumber', queryCode);
        if (queryPhone) params.set('phone', queryPhone);

        const orderRes = await fetch(`/api/orders?${params.toString()}`, { cache: 'no-store' });
        if (orderRes.ok) {
          const resJson = await orderRes.json();
          if (resJson.success && resJson.order) {
            allOrders = [resJson.order, ...allOrders.filter((o) => o.orderNumber !== resJson.order.orderNumber)];
          }
        }
      } catch (e) {
        console.warn('Orders targeted fetch error:', e);
      }

      // Check ID Match helper
      const isIdMatch = (itemId: string, query: string) => {
        if (!query) return false;
        const cId = cleanStr(itemId);
        const cQuery = cleanStr(query);
        if (cId === cQuery) return true;
        const bareId = cId.replace(/^(req-|as-)/, '');
        const bareQuery = cQuery.replace(/^(req-|as-)/, '');
        if (bareId && bareQuery && (bareId === bareQuery || bareId.includes(bareQuery) || bareQuery.includes(bareId))) {
          return true;
        }
        return false;
      };

      const isPhoneMatch = (itemPhone: string, testDigits: string) => {
        if (!testDigits || testDigits.length < 4) return false;
        const cTarget = cleanDigits(itemPhone);
        return cTarget.includes(testDigits) || testDigits.includes(cTarget);
      };

      // Strict Privacy Matching:
      // If code is provided: find matching order by code
      if (queryCode) {
        // Check bespoke
        const bespokeMatch = allBespoke.find((r) => isIdMatch(r.id, queryCode));
        if (bespokeMatch) {
          // Verify phone if entered
          if (queryPhone && !isPhoneMatch(bespokeMatch.customerPhone, queryPhone)) {
            setErrorMessage(
              isRtl
                ? 'رقم الهاتف المدخل غير مطابق لهذا الطلب. تم قفل بيانات الشحنة لضمان الخصوصية.'
                : 'The entered phone number does not match this order. Data locked for privacy.'
            );
            setIsLoading(false);
            return;
          }
          setSearchedBespoke(bespokeMatch);
          setIsLoading(false);
          return;
        }

        // Check standard orders
        const orderMatch = allOrders.find((o) => isIdMatch(o.orderNumber, queryCode));
        if (orderMatch) {
          if (queryPhone && !isPhoneMatch(orderMatch.customerPhone, queryPhone)) {
            setErrorMessage(
              isRtl
                ? 'رقم الهاتف المدخل غير مطابق لهذا الطلب. تم قفل بيانات الشحنة لضمان الخصوصية.'
                : 'The entered phone number does not match this order. Data locked for privacy.'
            );
            setIsLoading(false);
            return;
          }
          setSearchedOrder(orderMatch);
          setIsLoading(false);
          return;
        }
      }

      // If only phone is provided:
      if (queryPhone && !queryCode) {
        const matchingBespoke = allBespoke.filter((r) => isPhoneMatch(r.customerPhone, queryPhone));
        const matchingOrders = allOrders.filter((o) => isPhoneMatch(o.customerPhone, queryPhone));

        if (matchingBespoke.length === 1 && matchingOrders.length === 0) {
          setSearchedBespoke(matchingBespoke[0]);
          setIsLoading(false);
          return;
        }

        if (matchingOrders.length === 1 && matchingBespoke.length === 0) {
          setSearchedOrder(matchingOrders[0]);
          setIsLoading(false);
          return;
        }

        if (matchingBespoke.length > 0 || matchingOrders.length > 0) {
          // If multiple exist under this phone, pick the latest one for privacy
          if (matchingBespoke.length > 0) {
            setSearchedBespoke(matchingBespoke[0]);
          } else {
            setSearchedOrder(matchingOrders[0]);
          }
          setIsLoading(false);
          return;
        }
      }

      setErrorMessage(
        isRtl
          ? 'لم يتم العثور على طلب بهذه البيانات. يرجى التأكد من كود الطلب ورقم الهاتف المسجل.'
          : 'No order found with these credentials. Please verify your order code and registered phone.'
      );
    } catch (err) {
      console.error(err);
      setErrorMessage(
        isRtl ? 'حدث خطأ أثناء فحص سجلات الشحن.' : 'An error occurred while tracking the shipment.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const handleClearSearch = () => {
    setSearchedBespoke(null);
    setSearchedOrder(null);
    setHasSearched(false);
    setErrorMessage('');
    setOrderNumberInput('');
    setPhoneInput('');
  };

  useEffect(() => {
    if (initialOrderNumber || initialPhone) {
      executeSearch(initialOrderNumber, initialPhone);
    }
  }, [initialOrderNumber, initialPhone]);

  return (
    <div className="min-h-screen bg-[#F7F5EE] py-12" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 badge-turquoise px-3.5 py-1 rounded-sm font-bold uppercase tracking-widest text-[11px]">
            <Lock className="w-3 h-3" />
            <span>{isRtl ? 'بوابة تتبع الشحنات الآمنة والخاصة' : 'Secure Private Shipment Tracking'}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#080A0A]">
            {isRtl ? 'تتبع مسار شحنتك العطرية' : 'Track Your Royal Fragrance'}
          </h1>
          <p className="text-xs text-[#4A5553] leading-relaxed">
            {isRtl
              ? 'أدخل كود طلبك ورقم هاتفك المسجل لعرض تفاصيل ومراحل تصنيع شحنتك بخصوصية تامة.'
              : 'Enter your order reference code and registered phone number to track your formulation with complete privacy.'}
          </p>
        </div>

        {/* Secure Search Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E3D6] shadow-sm max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#080A0A] block">
                  {isRtl ? 'رقم مرجع الطلب (Reference Code)' : 'Order / Request Code'} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={orderNumberInput}
                  onChange={(e) => setOrderNumberInput(e.target.value)}
                  placeholder={isRtl ? 'REQ-XXXXXX أو AS-XXXXXX' : 'REQ-XXXXXX or AS-XXXXXX'}
                  className="w-full bg-[#FAF9F5] border border-[#E7E3D6] rounded-xl px-3.5 py-2.5 text-xs text-[#080A0A] uppercase placeholder-[#788784] focus:outline-none focus:border-[#2DD4BF] font-mono font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#080A0A] block">
                  {isRtl ? 'رقم الهاتف المسجل بالطلب' : 'Registered Phone Number'} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="010XXXXXXXX"
                  className="w-full bg-[#FAF9F5] border border-[#E7E3D6] rounded-xl px-3.5 py-2.5 text-xs text-[#080A0A] placeholder-[#788784] focus:outline-none focus:border-[#2DD4BF] font-mono font-bold"
                  required
                />
              </div>
            </div>

            <p className="text-[11px] text-[#788784] flex items-center gap-1.5 pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>
                {isRtl
                  ? '🔒 نظام مشفر ومحمي: تظهر تفاصيل كل طلب فقط لصاحبه باستخدام كود الطلب ورقم الهاتف.'
                  : '🔒 Encrypted & Private: Order details are strictly restricted to the customer using their code and phone.'}
              </span>
            </p>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span className="font-bold">{errorMessage}</span>
                </div>
                <div className="pt-1 flex items-center gap-2">
                  <a
                    href={`https://wa.me/201131068790?text=${encodeURIComponent(
                      isRtl
                        ? `مرحباً دار رَحِيقْ، أحتاج مساعدة في تتبع طلبي رقم: ${orderNumberInput || 'غير محدد'}`
                        : `Hello Raheeq, I need assistance tracking my order code: ${orderNumberInput || 'N/A'}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg font-bold text-[11px] shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'تواصل مع كونسيرج الدار عبر واتساب لمساعدتك' : 'Chat with Fragrance Concierge on WhatsApp'}</span>
                  </a>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-turquoise py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 transition-all cursor-pointer"
            >
              <Search className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? (isRtl ? 'جارٍ فحص سجلات الشحن...' : 'Verifying & Tracking...') : (isRtl ? 'تحقق وتتبع الشحنة الآن 🔒' : 'Verify & Track Shipment 🔒')}</span>
            </button>
          </form>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Results Card 1: Bespoke Custom Perfume Request (REQ-...)       */}
        {/* ------------------------------------------------------------- */}
        {searchedBespoke && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#2DD4BF]/40 shadow-xl space-y-6 max-w-2xl mx-auto animate-in fade-in">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E3D6] gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#0D9488] bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                    #{searchedBespoke.id.toUpperCase()}
                  </span>
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FlaskConical className="w-3 h-3 text-amber-700" />
                    <span>{isRtl ? 'طلب عطر مخصص (Bespoke Formula)' : 'Bespoke Perfume Request'}</span>
                  </span>
                </div>
                <h3 className="font-serif font-bold text-xl text-[#080A0A]">
                  {isRtl ? `العميل: ${searchedBespoke.customerName}` : `Customer: ${searchedBespoke.customerName}`}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {isRtl ? `الهاتف المسجل: ${searchedBespoke.customerPhone}` : `Registered Phone: ${searchedBespoke.customerPhone}`}
                </p>
              </div>

              {/* Status Badge reflecting Admin choice */}
              <div>
                {searchedBespoke.status === 'NEW' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>{isRtl ? 'قيد المراجعة الفنية بالمعمل (طلب جديد)' : 'Under Technical Review (New Request)'}</span>
                  </span>
                )}
                {(searchedBespoke.status === 'CONTACTED' || searchedBespoke.status === 'PROCESSING') && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-300">
                    <Clock className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                    <span>{isRtl ? 'تم التواصل وجارٍ خلط الزيوت وتعتيقها' : 'Contacted & In Oil Formulation'}</span>
                  </span>
                )}
                {searchedBespoke.status === 'FULFILLED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isRtl ? 'تم التنفيذ والتجهيز — في الطريق للتوصيل' : 'Fulfilled — Out for Delivery'}</span>
                  </span>
                )}
                {searchedBespoke.status === 'CANCELLED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                    <span>{isRtl ? 'تم إلغاء الطلب (Cancelled)' : 'Cancelled'}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Request Summary */}
            <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E7E3D6] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#0D9488] uppercase tracking-wider">
                  {isRtl ? 'تفاصيل التركيبة العطرية المطلوبة:' : 'Requested Fragrance Accord Details:'}
                </span>
                <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-[#E7E3D6]">
                  {searchedBespoke.volumeMl}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-serif font-bold text-xl text-[#080A0A]">
                  {searchedBespoke.perfumeName}
                </h4>
                <p className="text-xs text-[#4A5553]">
                  {isRtl ? 'درجة التركيز المعتمدة: ' : 'Approved Concentration: '}
                  <strong className="text-[#0D9488] font-bold">
                    {searchedBespoke.concentration.replace(/_/g, ' ')} (25% Extrait de Parfum)
                  </strong>
                </p>
              </div>

              {searchedBespoke.notes && (
                <div className="p-3.5 bg-white rounded-xl border border-[#E7E3D6] text-xs text-[#4A5553]">
                  <span className="font-bold text-[#080A0A] block mb-0.5">
                    {isRtl ? 'ملاحظاتك المسجلة:' : 'Special Instructions & Notes:'}
                  </span>
                  <p className="italic">{searchedBespoke.notes}</p>
                </div>
              )}
            </div>

            {/* 3-Stage Progress Timeline */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-[#080A0A] block">
                {isRtl ? 'مسار تجهيز العطر المخصص:' : 'Bespoke Fragrance Milestone Progress:'}
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {/* Step 1 */}
                <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200">
                  <span className="w-6 h-6 rounded-full bg-teal-700 text-white mx-auto flex items-center justify-center text-xs font-bold mb-1">
                    ✓
                  </span>
                  <span className="font-bold text-teal-900 block text-xs">
                    {isRtl ? '1. استلام الطلب' : '1. Received'}
                  </span>
                  <span className="text-[10px] text-teal-700">
                    {isRtl ? 'تم التسجيل بالمعمل' : 'Registered at Atelier'}
                  </span>
                </div>

                {/* Step 2 */}
                <div
                  className={`p-3 rounded-2xl border ${
                    searchedBespoke.status === 'CONTACTED' ||
                    searchedBespoke.status === 'PROCESSING' ||
                    searchedBespoke.status === 'FULFILLED'
                      ? 'bg-teal-50 border-teal-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-xs font-bold mb-1 ${
                      searchedBespoke.status === 'CONTACTED' ||
                      searchedBespoke.status === 'PROCESSING' ||
                      searchedBespoke.status === 'FULFILLED'
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {searchedBespoke.status === 'FULFILLED' ? '✓' : '2'}
                  </span>
                  <span className="font-bold text-slate-800 block text-xs">
                    {isRtl ? '2. المعايرة والتعتيق' : '2. Formulation'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {isRtl ? 'خلط الزيوت بتركيز 25%' : 'Aged 25% Oils'}
                  </span>
                </div>

                {/* Step 3 */}
                <div
                  className={`p-3 rounded-2xl border ${
                    searchedBespoke.status === 'FULFILLED'
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-xs font-bold mb-1 ${
                      searchedBespoke.status === 'FULFILLED'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {searchedBespoke.status === 'FULFILLED' ? '✓' : '3'}
                  </span>
                  <span className="font-bold text-slate-800 block text-xs">
                    {isRtl ? '3. التوصيل إلى الباب' : '3. Door Delivery'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {isRtl ? 'معاينة قبل الاستلام' : 'Inspect Upon Delivery'}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Concierge Button */}
            <div className="pt-2 border-t border-[#E7E3D6] space-y-2">
              <a
                href={`https://wa.me/201131068790?text=${encodeURIComponent(
                  `مرحباً دار رَحِيقْ، أود متابعة حالة طلبي الخاص رقم #${searchedBespoke.id} لعطر: ${searchedBespoke.perfumeName}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isRtl ? 'متابعة الطلب مع كونسيرج الدار عبر واتساب (01131068790)' : 'Chat with Fragrance Concierge on WhatsApp'}</span>
              </a>

              <button
                type="button"
                onClick={handleClearSearch}
                className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                {isRtl ? 'إغلاق وتتبع شحنة أخرى' : 'Close and Track Another Shipment'}
              </button>
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
                  {isRtl ? `العميل: ${searchedOrder.customerName}` : `Customer: ${searchedOrder.customerName}`}
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
                <span className="text-[#788784] block">{isRtl ? 'المحافظة والعنوان' : 'Shipping Destination'}</span>
                <span className="font-bold text-[#080A0A] mt-0.5 block">
                  {searchedOrder.shippingAddress?.governorate} — {searchedOrder.shippingAddress?.city}
                </span>
              </div>

              <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E7E3D6]">
                <span className="text-[#788784] block">{isRtl ? 'إجمالي الدفع عند الاستلام' : 'Cash on Delivery Total'}</span>
                <span className="font-bold text-[#0D9488] font-mono text-sm mt-0.5 block">
                  {formatPrice(searchedOrder.totalInPiasters)}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs text-[#080A0A]">{isRtl ? 'القطع العطرية في الشحنة:' : 'Items in Shipment:'}</h4>
              <div className="divide-y divide-[#E7E3D6] border border-[#E7E3D6] rounded-2xl p-4 bg-[#FAF9F5]">
                {searchedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-serif font-bold text-[#080A0A] block">{item.productNameEn}</span>
                      <span className="text-[11px] text-[#788784]">{item.volumeMl} ML • {isRtl ? `الكمية: ${item.quantity}` : `Qty: ${item.quantity}`}</span>
                    </div>
                    <span className="font-mono font-bold text-[#0D9488]">{formatPrice(item.subtotalInPiasters)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#E7E3D6] space-y-2">
              <a
                href={`https://wa.me/201131068790?text=${encodeURIComponent(
                  `مرحباً دار رَحِيقْ، أود الاستفسار عن موعد وصول طلبي رقم ${searchedOrder.orderNumber}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isRtl ? 'الاستفسار عن موعد وصول المندوب عبر واتساب' : 'Inquire About Courier Delivery via WhatsApp'}</span>
              </a>

              <button
                type="button"
                onClick={handleClearSearch}
                className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                {isRtl ? 'إغلاق وتتبع شحنة أخرى' : 'Close and Track Another Shipment'}
              </button>
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
