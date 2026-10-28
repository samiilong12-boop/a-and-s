'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
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
  History,
  ArrowRight,
  Check,
  Copy,
} from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { getOrderStatusLabel } from '@/lib/state-machines';
import { validateEgyptianPhone } from '@/lib/phone-validation';
import { BespokePerfumeRequest } from '@/types';
import { CUSTOM_REQUESTS_STORAGE_KEY } from '@/context/CustomRequestContext';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';
  const initialPhone = searchParams.get('phone') || '';

  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNumber);
  const [phoneInput, setPhoneInput] = useState(initialPhone);
  const [searchedOrder, setSearchedOrder] = useState<any | null>(null);
  const [searchedBespoke, setSearchedBespoke] = useState<BespokePerfumeRequest | null>(null);
  const [multipleResults, setMultipleResults] = useState<{
    orders: any[];
    bespoke: BespokePerfumeRequest[];
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentLocalItems, setRecentLocalItems] = useState<{
    orders: any[];
    bespoke: BespokePerfumeRequest[];
  }>({ orders: [], bespoke: [] });

  // Clean and normalize strings
  const cleanStr = (s?: string) => (s || '').trim().toLowerCase().replace(/^#/, '');
  const cleanDigits = (s?: string) => (s || '').replace(/[^0-9]/g, '');

  // Load any local requests/orders on mount to give the customer instant 1-click access
  useEffect(() => {
    try {
      const storedOrders = localStorage.getItem('a_and_s_demo_orders');
      const orders = storedOrders ? JSON.parse(storedOrders) : [];

      const storedBespoke =
        localStorage.getItem(CUSTOM_REQUESTS_STORAGE_KEY) ||
        localStorage.getItem('a_and_s_custom_requests_cache');
      const bespoke = storedBespoke ? JSON.parse(storedBespoke) : [];

      setRecentLocalItems({
        orders: Array.isArray(orders) ? orders.slice(0, 3) : [],
        bespoke: Array.isArray(bespoke) ? bespoke.slice(0, 3) : [],
      });
    } catch {}
  }, []);

  const executeSearch = async (targetOrderCode?: string, targetPhone?: string) => {
    const rawCode = targetOrderCode !== undefined ? targetOrderCode : orderNumberInput;
    const rawPhone = targetPhone !== undefined ? targetPhone : phoneInput;

    const queryCode = cleanStr(rawCode);
    const queryPhone = cleanDigits(rawPhone);

    setErrorMessage('');
    setHasSearched(true);
    setSearchedOrder(null);
    setSearchedBespoke(null);
    setMultipleResults(null);

    // If both empty
    if (!queryCode && !queryPhone) {
      setErrorMessage('يرجى إدخال رقم مرجع الطلب (مثل: REQ-... أو AS-...) أو رقم الهاتف المحمول.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Gather all standard store orders
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

      // 2. Gather all bespoke perfume requests (Local + Remote API)
      let allBespoke: BespokePerfumeRequest[] = [];
      try {
        const storedBespoke =
          localStorage.getItem(CUSTOM_REQUESTS_STORAGE_KEY) ||
          localStorage.getItem('a_and_s_custom_requests_cache');
        if (storedBespoke) allBespoke = JSON.parse(storedBespoke);
      } catch {}

      try {
        const apiRes = await fetch('/api/custom-requests', { cache: 'no-store' });
        if (apiRes.ok) {
          const remoteList: BespokePerfumeRequest[] = await apiRes.json();
          const map = new Map<string, BespokePerfumeRequest>();
          allBespoke.forEach((r) => map.set(r.id, r));
          remoteList.forEach((r) => map.set(r.id, r));
          allBespoke = Array.from(map.values());
        }
      } catch (e) {
        console.warn('Custom requests API fetch warning:', e);
      }

      // 3. Match Checker Functions
      const isIdMatch = (itemId: string, query: string) => {
        if (!query) return false;
        const cId = cleanStr(itemId);
        const cQuery = cleanStr(query);
        if (cId === cQuery) return true;
        // Strip common prefixes (req-, as-)
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

      // If queryCode is actually numeric (like a phone number typed in the first box)
      const isCodeNumericOnly = /^[0-9+ ]+$/.test(rawCode.trim()) && cleanDigits(rawCode).length >= 4;
      const effectivePhoneDigits = queryPhone || (isCodeNumericOnly ? cleanDigits(rawCode) : '');

      // Check matches for Bespoke
      const matchedBespoke = allBespoke.filter((r) => {
        if (queryCode && isIdMatch(r.id, queryCode)) return true;
        if (effectivePhoneDigits && isPhoneMatch(r.customerPhone, effectivePhoneDigits)) return true;
        return false;
      });

      // Check matches for Standard Orders
      const matchedOrders = allOrders.filter((o) => {
        if (queryCode && isIdMatch(o.orderNumber, queryCode)) return true;
        if (effectivePhoneDigits && isPhoneMatch(o.customerPhone, effectivePhoneDigits)) return true;
        return false;
      });

      const totalMatches = matchedBespoke.length + matchedOrders.length;

      if (totalMatches === 0) {
        setErrorMessage(
          'لم يتم العثور على طلب بهذا الرقم المرجعي أو رقم الهاتف. يرجى مراجعة البيانات أو التواصل مع خدمة العملاء.'
        );
        setIsLoading(false);
        return;
      }

      // If exactly 1 Bespoke match and 0 orders:
      if (matchedBespoke.length === 1 && matchedOrders.length === 0) {
        setSearchedBespoke(matchedBespoke[0]);
        setIsLoading(false);
        return;
      }

      // If exactly 1 Order match and 0 bespoke:
      if (matchedOrders.length === 1 && matchedBespoke.length === 0) {
        setSearchedOrder(matchedOrders[0]);
        setIsLoading(false);
        return;
      }

      // If multiple results (e.g. searching by phone with multiple orders/requests):
      if (matchedBespoke.length > 0 && matchedOrders.length === 0) {
        setSearchedBespoke(matchedBespoke[0]);
        if (matchedBespoke.length > 1) {
          setMultipleResults({ orders: [], bespoke: matchedBespoke });
        }
        setIsLoading(false);
        return;
      }

      if (matchedOrders.length > 0 && matchedBespoke.length === 0) {
        setSearchedOrder(matchedOrders[0]);
        if (matchedOrders.length > 1) {
          setMultipleResults({ orders: matchedOrders, bespoke: [] });
        }
        setIsLoading(false);
        return;
      }

      // Both orders and bespoke matched
      setSearchedBespoke(matchedBespoke[0]);
      setMultipleResults({ orders: matchedOrders, bespoke: matchedBespoke });
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setErrorMessage('حدث خطأ أثناء فحص سجلات الشحن.');
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  // Auto search on mount if initial parameters are in URL
  useEffect(() => {
    if (initialOrderNumber || initialPhone) {
      executeSearch(initialOrderNumber, initialPhone);
    }
  }, [initialOrderNumber, initialPhone]);

  return (
    <div className="min-h-screen bg-[#F7F5EE] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="badge-turquoise px-3.5 py-1 rounded-sm font-bold uppercase tracking-widest text-[11px]">
            خدمة كونسيرج تتبع الشحنات والطلبات
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#080A0A]">
            تتبع مسار شحنتك العطرية
          </h1>
          <p className="text-xs text-[#4A5553] leading-relaxed">
            يمكنك تتبع شحنتك بسهولة بإدخال <strong>كود طلب العطر الخاص (REQ-...)</strong> أو <strong>رقم طلب المتجر (AS-...)</strong> أو <strong>رقم هاتفك المحمول</strong>.
          </p>
        </div>

        {/* Quick Access Card: Recent items found on this browser */}
        {(recentLocalItems.bespoke.length > 0 || recentLocalItems.orders.length > 0) && !hasSearched && (
          <div className="bg-gradient-to-r from-teal-50 via-emerald-50/60 to-amber-50/60 p-5 rounded-3xl border border-teal-200 shadow-sm max-w-2xl mx-auto space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-teal-900 font-bold text-xs">
              <History className="w-4 h-4 text-teal-700" />
              <span>طلباتك السابقة المسجلة على هذا الجهاز (اضغط للتتبع المباشر):</span>
            </div>
            <div className="space-y-2">
              {recentLocalItems.bespoke.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setOrderNumberInput(b.id);
                    executeSearch(b.id, b.customerPhone);
                  }}
                  className="w-full text-right p-3 rounded-2xl bg-white/90 hover:bg-white border border-teal-100 hover:border-teal-300 shadow-xs flex items-center justify-between transition-all group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-800">
                        #{b.id.toUpperCase()}
                      </span>
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                        طلب عطر خاص
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-semibold">{b.perfumeName}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-teal-700 font-bold group-hover:translate-x-[-4px] transition-transform">
                    <span>عرض مسار الطلب</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </div>
                </button>
              ))}

              {recentLocalItems.orders.map((o) => (
                <button
                  key={o.orderNumber}
                  type="button"
                  onClick={() => {
                    setOrderNumberInput(o.orderNumber);
                    executeSearch(o.orderNumber, o.customerPhone);
                  }}
                  className="w-full text-right p-3 rounded-2xl bg-white/90 hover:bg-white border border-teal-100 hover:border-teal-300 shadow-xs flex items-center justify-between transition-all group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-800">
                        {o.orderNumber}
                      </span>
                      <span className="text-[10px] bg-teal-100 text-teal-900 font-bold px-2 py-0.5 rounded-full">
                        طلب متجر
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-semibold">{formatPrice(o.totalInPiasters)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-teal-700 font-bold group-hover:translate-x-[-4px] transition-transform">
                    <span>عرض مسار الشحنة</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E3D6] shadow-sm max-w-2xl mx-auto">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#080A0A] block">
                  رقم المرجع (كود الطلب أو الهاتف)
                </label>
                <input
                  type="text"
                  value={orderNumberInput}
                  onChange={(e) => setOrderNumberInput(e.target.value)}
                  placeholder="REQ-... أو AS-... أو 010..."
                  className="w-full bg-[#FAF9F5] border border-[#E7E3D6] rounded-xl px-3.5 py-2.5 text-xs text-[#080A0A] uppercase placeholder-[#788784] focus:outline-none focus:border-[#2DD4BF] font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#080A0A] block">
                  رقم الهاتف المسجل بالطلب
                </label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="01131068790 أو 01011800245"
                  className="w-full bg-[#FAF9F5] border border-[#E7E3D6] rounded-xl px-3.5 py-2.5 text-xs text-[#080A0A] placeholder-[#788784] focus:outline-none focus:border-[#2DD4BF] font-mono font-bold"
                />
              </div>
            </div>

            <p className="text-[11px] text-[#788784]">
              💡 يمكنك البحث برقم الطلب وحده، أو برقم هاتفك وحده، أو بالاثنين معاً.
            </p>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span className="font-bold">{errorMessage}</span>
                </div>
                <div className="pt-1 flex items-center gap-2">
                  <a
                    href={`https://wa.me/201131068790?text=${encodeURIComponent(
                      `مرحباً دار رَحِيقْ، قمت بطلب ولم أتمكن من تتبعه برقم المرجع: ${orderNumberInput || phoneInput || 'غير محدد'}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg font-bold text-[11px] shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>تواصل مع كونسيرج المتجر عبر واتساب لمساعدتك فوراً</span>
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
              <span>{isLoading ? 'جارٍ فحص سجلات الشحن...' : 'تتبع الشحنة الآن'}</span>
            </button>
          </form>
        </div>

        {/* Selector if multiple results matched for phone number */}
        {multipleResults && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 max-w-2xl mx-auto space-y-3 shadow-xs">
            <span className="text-xs font-bold text-slate-800 block">
              عثرنا على أكثر من طلب مرتبط برقم الهاتف، اختر الطلب الذي تود تتبعه:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {multipleResults.bespoke.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSearchedBespoke(b);
                    setSearchedOrder(null);
                  }}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                    searchedBespoke?.id === b.id
                      ? 'border-teal-500 bg-teal-50/70 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-mono text-xs font-bold text-teal-800 block">#{b.id.toUpperCase()}</span>
                  <span className="text-xs text-slate-800 font-bold block">{b.perfumeName}</span>
                  <span className="text-[10px] text-slate-500">عطر خاص • {b.volumeMl}</span>
                </button>
              ))}

              {multipleResults.orders.map((o) => (
                <button
                  key={o.orderNumber}
                  onClick={() => {
                    setSearchedOrder(o);
                    setSearchedBespoke(null);
                  }}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                    searchedOrder?.orderNumber === o.orderNumber
                      ? 'border-teal-500 bg-teal-50/70 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-mono text-xs font-bold text-teal-800 block">{o.orderNumber}</span>
                  <span className="text-xs text-slate-800 font-bold block">{formatPrice(o.totalInPiasters)}</span>
                  <span className="text-[10px] text-slate-500">طلب متجر • {o.items?.length || 1} منتجات</span>
                </button>
              ))}
            </div>
          </div>
        )}

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
                <p className="text-xs text-slate-500 font-mono">
                  الهاتف المسجل: {searchedBespoke.customerPhone}
                </p>
              </div>

              {/* Status Badge */}
              <div>
                {searchedBespoke.status === 'NEW' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>قيد المراجعة الفنية بالمعمل (Under Review)</span>
                  </span>
                )}
                {searchedBespoke.status === 'PROCESSING' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-300">
                    <Clock className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                    <span>جارٍ تركيب وتعتيق الزيوت بتركيز 25% (In Formulation)</span>
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
            <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E7E3D6] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#0D9488] uppercase tracking-wider">
                  تفاصيل التركيبة العطرية المطلوبة:
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
                  درجة التركيز المعتمدة:{' '}
                  <strong className="text-[#0D9488] font-bold">
                    {searchedBespoke.concentration.replace(/_/g, ' ')} (25% Extrait de Parfum)
                  </strong>
                </p>
              </div>

              {searchedBespoke.notes && (
                <div className="p-3.5 bg-white rounded-xl border border-[#E7E3D6] text-xs text-[#4A5553]">
                  <span className="font-bold text-[#080A0A] block mb-0.5">ملاحظاتك المسجلة:</span>
                  <p className="italic">{searchedBespoke.notes}</p>
                </div>
              )}
            </div>

            {/* Timeline Progress */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-[#080A0A] block">مسار تجهيز العطر المخصص:</span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200">
                  <span className="w-6 h-6 rounded-full bg-teal-700 text-white mx-auto flex items-center justify-center text-xs font-bold mb-1">
                    ✓
                  </span>
                  <span className="font-bold text-teal-900 block text-xs">1. استلام الطلب</span>
                  <span className="text-[10px] text-teal-700">تم التسجيل بالمعمل</span>
                </div>

                <div
                  className={`p-3 rounded-2xl border ${
                    searchedBespoke.status === 'PROCESSING' ||
                    searchedBespoke.status === 'CONTACTED' ||
                    searchedBespoke.status === 'FULFILLED'
                      ? 'bg-teal-50 border-teal-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-xs font-bold mb-1 ${
                      searchedBespoke.status === 'PROCESSING' ||
                      searchedBespoke.status === 'CONTACTED' ||
                      searchedBespoke.status === 'FULFILLED'
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    2
                  </span>
                  <span className="font-bold text-slate-800 block text-xs">2. المعايرة والتعتيق</span>
                  <span className="text-[10px] text-slate-500">خلط الزيوت بتركيز 25%</span>
                </div>

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
                    3
                  </span>
                  <span className="font-bold text-slate-800 block text-xs">3. التوصيل إلى الباب</span>
                  <span className="text-[10px] text-slate-500">معاينة قبل الاستلام</span>
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
                <span>متابعة الطلب وموعد الاستلام عبر واتساب (الخط 1: 01131068790)</span>
              </a>

              <a
                href={`https://wa.me/201011800245?text=${encodeURIComponent(
                  `مرحباً دار رَحِيقْ، أود متابعة حالة طلبي الخاص رقم #${searchedBespoke.id} لعطر: ${searchedBespoke.perfumeName}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>التواصل عبر خط المبيعات الثاني (01011800245)</span>
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
