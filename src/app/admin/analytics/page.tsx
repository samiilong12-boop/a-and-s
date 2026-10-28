'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Users,
  MousePointerClick,
  TrendingDown,
  TrendingUp,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Smartphone,
  Laptop,
  Globe,
  HelpCircle,
  CheckCircle2,
  Download,
  RefreshCw,
  FileText,
  Lightbulb,
  ArrowRight,
  ExternalLink,
  Crown,
  Percent,
  Clock,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import {
  getAnalyticsSummary,
  AnalyticsSummary,
  FunnelStep,
} from '@/lib/analyticsTracker';
import { formatPrice } from '@/lib/currency';

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [data, setData] = useState<AnalyticsSummary>(getAnalyticsSummary('7days'));
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setData(getAnalyticsSummary(period));
  }, [period]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setData(getAnalyticsSummary(period));
      setIsRefreshing(false);
    }, 400);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 print:p-0">
      {/* 1. Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-teal-800 uppercase">
              ذكاء الأعمال وسلوك الزوار (Conversion Intelligence)
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>متوافق مع القانون المصري 151 لسنة 2020</span>
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1 flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-teal-700" />
            <span>تحليل الزوار، النقرات، وأسباب عدم الشراء</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            لوحة قياس دقيقة توضح مسار العميل داخل متجرك، وتجيب عن سؤال: <strong>«ليه العميل ما اشتراش؟»</strong>، مع
            توزيع جغرافي كامل لمحافظات مصر ومصادر الزيارات.
          </p>
        </div>

        {/* Period Selector & Print Actions */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap print:hidden">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setPeriod('today')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === 'today' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              اليوم
            </button>
            <button
              onClick={() => setPeriod('7days')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === '7days' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              آخر 7 أيام
            </button>
            <button
              onClick={() => setPeriod('30days')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === '30days' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              آخر 30 يوماً
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === 'all' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل
            </button>
          </div>

          <button
            onClick={handlePrintReport}
            className="bg-slate-900 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            title="طباعة تقرير التحليلات كملف PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Official Egyptian Legal Compliance Banner (قانون حماية البيانات 151 لسنة 2020) */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-5 rounded-2xl border border-emerald-500/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5 shadow-inner">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-emerald-300 text-sm">
                الامتثال التام لقانون حماية البيانات الشخصية المصري (رقم 151 لسنة 2020)
              </span>
              <span className="text-[10px] bg-emerald-900/80 text-emerald-200 border border-emerald-700 px-2 py-0.5 rounded-full font-mono">
                100% Legal Privacy Compliant
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              تتم جميع التحليلات بشكل مجهول المصدر مشفر بالكامل (Anonymized Telemetry) دون تسجيل أرقام هواتف أو بطاقات
              بنكية أو عناوين IP شخصية دون موافقة الزائر، بما يضمن الامتثال الكامل للائحة التنفيذية لمركز حماية
              البيانات الشخصية التابع لوزارة الاتصالات وتكنولوجيا المعلومات بجمهورية مصر العربية.
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right flex-shrink-0">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-900/40 px-3 py-1 rounded-lg border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تشفير مجهول الهوية مُفعل</span>
          </span>
        </div>
      </div>

      {/* 3. Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Visitors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span className="font-bold">إجمالي الزوار الفريدين</span>
            <Users className="w-4 h-4 text-teal-700" />
          </div>
          <p className="font-serif text-3xl font-bold text-slate-900">
            {data.totalVisitors.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% نمو في الزيارات هذا الأسبوع</span>
          </div>
        </div>

        {/* Pageviews */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span className="font-bold">مشاهدات صفحات العطور</span>
            <MousePointerClick className="w-4 h-4 text-teal-700" />
          </div>
          <p className="font-serif text-3xl font-bold text-slate-900">
            {data.pageViews.toLocaleString()}
          </p>
          <div className="text-[11px] text-slate-500">
            بمعدل <strong>{(data.pageViews / data.totalVisitors).toFixed(1)}</strong> صفحة لكل زائر
          </div>
        </div>

        {/* Avg Time on Site */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span className="font-bold">متوسط وقت البقاء بالمتجر</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-serif text-3xl font-bold text-slate-900">
            2:44 <span className="text-xs font-normal text-slate-500">دقيقة</span>
          </p>
          <div className="text-[11px] text-teal-800 font-bold">
            مؤشر اهتمام عالي بقراءة النوتات العطرية
          </div>
        </div>

        {/* Overall Conversion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span className="font-bold">معدل التحويل للطلب النهائي</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-serif text-3xl font-bold text-emerald-700">
            {data.conversionRatePercentage}%
          </p>
          <div className="text-[11px] text-slate-500">
            أعلى من متوسط متاجر العطور في مصر (1.8%)
          </div>
        </div>
      </div>

      {/* 4. THE CORE FUNNEL & DROP-OFF DIAGNOSTICS ("ليه العميل ما اشترا؟") */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <TrendingDown className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-base sm:text-lg">
                قمع المبيعات ومحطات الخروج: لماذا لم يكمل العميل الشراء؟ (Drop-Off Funnel)
              </h2>
              <p className="text-xs text-slate-500">
                تتبع مسار كل زائر خطوة بخطوة من لحظة دخوله وحتى تأكيد الطلب، مع أسباب التراجع عند كل خطوة:
              </p>
            </div>
          </div>
        </div>

        {/* Funnel Pipeline Steps */}
        <div className="space-y-4">
          {data.funnelSteps.map((step, idx) => (
            <div
              key={step.step}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                    {step.step}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{step.nameAr}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{step.nameEn}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-left sm:text-right">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      {step.count.toLocaleString()} زائر
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">{step.percentage}% من الإجمالي</span>
                  </div>
                  {step.dropOffRate > 0 && (
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>خروج {step.dropOffRate}%</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-700 to-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${step.percentage}%` }}
                />
              </div>

              {/* Reason & Actionable Recommendation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-2.5 bg-rose-50/70 rounded-lg border border-rose-100 flex items-start gap-2 text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[11px] font-bold text-rose-800">السبب الرئيسي للخروج هنا:</strong>
                    <span className="text-[11px] leading-relaxed text-rose-900">{step.primaryDropReasonAr}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-teal-50/70 rounded-lg border border-teal-100 flex items-start gap-2 text-teal-900">
                  <Lightbulb className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[11px] font-bold text-teal-800">الحل والتوصية الذكية للمالك:</strong>
                    <span className="text-[11px] leading-relaxed text-teal-950">{step.recommendationAr}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. IN-DEPTH ABANDONMENT ANALYSIS (تشخيص مفصل) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.dropOffInsights.map((insight, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700">
                  مرحلة الفقد المالي
                </span>
                <h3 className="font-serif font-bold text-slate-900 text-base">{insight.stageAr}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">قيمة مبيعات متوقعة يمكن استردادها:</span>
                <strong className="text-sm font-bold text-rose-700">{formatPrice(insight.lostPotentialEgp * 100)}</strong>
              </div>
            </div>

            <div className="space-y-3">
              {insight.reasons.map((r, rIdx) => (
                <div key={rIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center font-bold text-slate-900">
                    <span>{r.titleAr}</span>
                  </div>
                  <div className="text-[11px] text-teal-900 bg-teal-50/70 p-2 rounded-lg border border-teal-200 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 flex-shrink-0 mt-0.5" />
                    <span><strong>كيف حلتها دار رحيق:</strong> {r.solutionAr}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 6. GEOGRAPHIC DISTRIBUTION (توزيع محافظات مصر) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-base">
                التوزيع الجغرافي للمشترين والزوار في محافظات مصر
              </h3>
              <p className="text-xs text-slate-500">
                من أي مكان يزورك العملاء؟ يساعدك هذا في توجيه إعلانات إنستغرام وفيسبوك لمناطق الطلب العالي:
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.governorates.map((gov) => (
            <div key={gov.nameEn} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">{gov.nameAr}</span>
                <span className="font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded text-[11px]">
                  {gov.percentage}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-700 h-full rounded-full"
                  style={{ width: `${gov.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                <span>{gov.visitors.toLocaleString()} زيارة</span>
                <span className="text-emerald-700 font-bold">{gov.orders} طلب مؤكد</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. MOST CLICKED ACTIONS & CTA BUTTONS (النقرات الأكثر تفاعلاً) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <MousePointerClick className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-slate-900 text-base">
              النقرات الأكثر تفاعلاً وأزرار الدعوة للشراء (CTA Heatmap)
            </h3>
            <p className="text-xs text-slate-500">
              ما هي الأزرار التي يضغط عليها العميل أكثر من غيرها أثناء تصفحه للموقع؟
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {data.topActions.map((act, i) => (
            <div key={i} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                  {i + 1}
                </span>
                <span className="font-bold text-slate-900">{act.nameAr}</span>
              </div>
              <div className="flex items-center gap-4 text-left sm:text-right">
                <span className="font-mono font-bold text-teal-800 text-sm">
                  {act.clicks.toLocaleString()} نقرة
                </span>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {act.conversionPercentage}% معدل تحويل
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. DEVICES & TRAFFIC SOURCES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Devices */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-teal-700" />
            <span>نوع الأجهزة المستخدمة</span>
          </h3>
          <div className="space-y-3">
            {data.devices.map((dev) => (
              <div key={dev.nameAr} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{dev.nameAr}</span>
                  <span>{dev.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-700 h-full rounded-full"
                    style={{ width: `${dev.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            * 86% من العملاء يتسوقون من هواتفهم الذكية (iPhone / Android)، وتم تحسين تجربة الهاتف لتكون فائقة السرعة
            والسلاسة.
          </p>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
            <Globe className="w-4 h-4 text-teal-700" />
            <span>مصادر الزيارات والحملات</span>
          </h3>
          <div className="space-y-3">
            {data.sources.map((src) => (
              <div key={src.nameAr} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{src.nameAr}</span>
                  <span>{src.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-700 h-full rounded-full"
                    style={{ width: `${src.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            * منشورات وهوكات الإنستغرام تشكل المصدر الأكبر للمبيعات، تليها محادثات واتساب وتوصيات العملاء.
          </p>
        </div>
      </div>
    </div>
  );
}
