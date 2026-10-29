'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  Sparkles,
  AlertTriangle,
  Lock,
  RotateCcw,
  Bot,
  FileText,
  CheckCircle2,
  Phone,
  MessageSquare,
  ArrowRight,
  Clock,
  Eye,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function TermsAndPoliciesPage() {
  const { t, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<'ai' | 'delivery' | 'terms' | 'privacy' | 'returns'>('ai');

  const lastUpdatedDate = '29 أكتوبر 2026';
  const lastUpdatedDateEn = 'October 29, 2026';

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#080A0A] font-sans pb-24 selection:bg-[#2DD4BF] selection:text-[#080A0A]">
      {/* Top Breadcrumb & Header */}
      <section className="bg-[#080A0A] text-[#FAF9F5] border-b border-[#2DD4BF]/20 pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#2DD4BF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121817] border border-[#2DD4BF]/40 text-xs font-mono text-[#54d1b2]">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {isRtl
                ? `آخر تحديث رسمي: ${lastUpdatedDate}`
                : `Official Last Update: ${lastUpdatedDateEn}`}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {isRtl ? 'وثيقة الشروط والسياسات الرسمية' : 'Official Terms & Store Policies'}
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-[#A2ADA9] leading-relaxed">
            {isRtl
              ? 'دار رَحِـيـقْ للعطور الملكية الفاخرة — ميثاق الشفافية الكاملة، شروط المعاينة والاستلام عند باب بيتك، وضمانات الخصوصية والذكاء الاصطناعي المحدثة.'
              : 'Raheeq Haute Parfumerie Cairo — Complete transparency charter, doorstep inspection terms, privacy guarantees, and AI disclosure.'}
          </p>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#54d1b2] hover:text-white transition-colors font-bold"
            >
              <span>{isRtl ? '← العودة إلى المتجر الرئيسي' : '← Return to Storefront'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-[#E5E0D3] flex flex-wrap gap-1.5 justify-center sm:justify-start">
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'ai'
                ? 'bg-[#080A0A] text-[#54d1b2] shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Bot className="w-4 h-4 text-[#54d1b2]" />
            <span>{isRtl ? 'إشعار الذكاء الاصطناعي (AI)' : 'AI Disclosure'}</span>
          </button>

          <button
            onClick={() => setActiveTab('delivery')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'delivery'
                ? 'bg-[#080A0A] text-[#54d1b2] shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Truck className="w-4 h-4 text-[#2DD4BF]" />
            <span>{isRtl ? 'شروط الاستلام والمعاينة' : 'Inspection Terms'}</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'terms'
                ? 'bg-[#080A0A] text-[#54d1b2] shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-500" />
            <span>{isRtl ? 'شروط الاستخدام والطلب' : 'Terms of Use'}</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'privacy'
                ? 'bg-[#080A0A] text-[#54d1b2] shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Lock className="w-4 h-4 text-emerald-500" />
            <span>{isRtl ? 'الخصوصية وأمان البيانات' : 'Privacy Policy'}</span>
          </button>

          <button
            onClick={() => setActiveTab('returns')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'returns'
                ? 'bg-[#080A0A] text-[#54d1b2] shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-indigo-500" />
            <span>{isRtl ? 'الاستبدال والاسترجاع' : 'Returns & Refund'}</span>
          </button>
        </div>

        {/* Tab 1: AI Transparency & Disclaimer */}
        {activeTab === 'ai' && (
          <div className="mt-8 bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E0D3] shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 flex-shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  شفافية التقنية والذكاء الاصطناعي (AI Transparency)
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  {isRtl
                    ? 'إخلاء مسؤولية محتوى الذكاء الاصطناعي ودقة البيانات'
                    : 'AI Content Generation & Accuracy Disclaimer'}
                </h2>
              </div>
            </div>

            <div className="bg-amber-50/80 border border-amber-200/80 p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 text-xs text-amber-950 leading-relaxed">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <strong className="block font-bold text-amber-900 text-sm">
                  {isRtl ? 'تنبيه صريح لجميع عملاء وزوار الموقع:' : 'Important Notice to All Visitors & Clients:'}
                </strong>
                <p>
                  {isRtl
                    ? 'نحيطكم علماً بأن أجزاء من المحتوى النصي، الأوصاف الإبداعية، النوتات العطرية الاقتراحية، واللوحات البصرية المعروضة على هذا الموقع قد تم توليدها أو تحسينها وصياغتها باستخدام نماذج الذكاء الاصطناعي التوليدي (Artificial Intelligence).'
                    : 'Please be advised that descriptive texts, creative fragrance stories, suggested olfactory pyramids, and artistic visual impressions on this website have been generated or enhanced using generative Artificial Intelligence (AI) models.'}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h3 className="font-serif text-base font-bold text-slate-900">
                {isRtl ? '1. احتمالية الخطأ وعدم العصمة:' : '1. Possibility of Discrepancies & Errors:'}
              </h3>
              <p>
                {isRtl
                  ? 'رغم حرصنا الشديد على مراجعة المحتوى وتدقيقه، فإن البيانات المولدة عن طريق أنظمة الذكاء الاصطناعي تحتمل نسبة من الخطأ البشري أو التقني، والسهو غير المقصود في سرد بعض التفاصيل الدقيقة كالهرم العطري أو الأصول التاريخية لبعض التركيبات.'
                  : 'Despite rigorous reviews, data synthesized via artificial intelligence may contain occasional inaccuracies, oversights, or poetic interpretations regarding scent pyramids, accords, or fragrance origins.'}
              </p>

              <h3 className="font-serif text-base font-bold text-slate-900 pt-2">
                {isRtl ? '2. المرجع النهائي المعتمد:' : '2. Binding Specifications & Final Authority:'}
              </h3>
              <p>
                {isRtl
                  ? 'المواصفات الملزمة والنهائية هي المنتج العطري الملموس، والزجاجة الفعلية، والفاتورة وبوليصة الشحن المسلمة إليك عند باب منزلك مع خدمة المعاينة الحية قبل الدفع. في حال وجود أي تباين بين الوصف المكتوب وتفضيلك الشخصي، فإن حقك مضمون في المعاينة ورفض الاستلام فوراً.'
                  : 'Binding specifications are represented by the tangible physical perfume bottle, concentration, volume, and dispatch slip verified during your doorstep delivery inspection.'}
              </p>

              <h3 className="font-serif text-base font-bold text-slate-900 pt-2">
                {isRtl ? '3. التواصل للاستفسارات الدقيقة:' : '3. Inquiries with Master Perfumer Concierge:'}
              </h3>
              <p>
                {isRtl
                  ? 'إذا كنت تريد التأكد من مكون أو نوتة معينة أو لديك حساسية من خلاصة معينة، يمكنك التواصل المباشر مع مستشارنا العطري في القاهرة عبر أرقام الواتساب المعتمدة قبل إتمام الطلب.'
                  : 'If you have specific ingredient inquiries, allergies, or questions, please consult our Cairo master perfumer concierge via official WhatsApp before placing your order.'}
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Delivery & Doorstep Inspection */}
        {activeTab === 'delivery' && (
          <div className="mt-8 bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E0D3] shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 flex-shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  خدمة المعاينة عند الباب (Doorstep Inspection)
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  {isRtl ? 'شروط التوصيل والدفع عند الاستلام والمعاينة' : 'Cash on Delivery & Visual Inspection Terms'}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{isRtl ? 'حقك الكامل في الفحص قبل الدفع' : 'Complete Right of Doorstep Inspection'}</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {isRtl
                    ? 'يحق لكل عميل في أي مكان في مصر فتح كرتونة الشحن الخارجية بحضور مندوب شركة التوصيل وفحص الزجاجة والتأكد من سلامتها من الكسر أو التسريب قبل دفع أي مليم نقداً.'
                    : 'Every customer across Egypt holds the absolute right to inspect the parcel packaging and bottle in the courier’s presence prior to paying cash.'}
                </p>
              </div>

              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <span>{isRtl ? 'رفض الاستلام المجاني الفوري' : 'Zero-Fee Immediate Refusal'}</span>
                </div>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  {isRtl
                    ? 'في حال وصلت الشحنة تالفة أو غير مطابقة للطلب، يحق للعميل رفض استلام الطرد فوراً مع المندوب دون دفع أي مليم أو أتعاب نقل.'
                    : 'If damaged or mismatched upon arrival, you may refuse acceptance on the spot with zero courier charges.'}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed pt-2">
              <h3 className="font-serif text-base font-bold text-slate-900">
                {isRtl ? 'مواعيد التوصيل في محافظات مصر:' : 'Delivery Lead Times in Egypt:'}
              </h3>
              <ul className="list-disc list-inside space-y-2 text-slate-600">
                <li>
                  <strong className="text-slate-900">{isRtl ? 'القاهرة الكبرى والجيزة:' : 'Greater Cairo & Giza:'}</strong>{' '}
                  {isRtl ? 'خلال 24 إلى 48 ساعة كحد أقصى.' : 'Within 24 to 48 hours maximum.'}
                </li>
                <li>
                  <strong className="text-slate-900">{isRtl ? 'الإسكندرية والوجه البحري والدلتا:' : 'Alexandria & Delta:'}</strong>{' '}
                  {isRtl ? 'خلال 48 إلى 72 ساعة عمل.' : 'Within 48 to 72 business hours.'}
                </li>
                <li>
                  <strong className="text-slate-900">{isRtl ? 'محافظات الصعيد والقناة والبحر الأحمر:' : 'Upper Egypt & Coastal:'}</strong>{' '}
                  {isRtl ? 'خلال 3 إلى 4 أيام عمل.' : 'Within 3 to 4 business days.'}
                </li>
              </ul>

              <h3 className="font-serif text-base font-bold text-slate-900 pt-2">
                {isRtl ? 'سياسة العينات وتجربة الرائحة:' : 'Perfume Testing & Sealed Packaging:'}
              </h3>
              <p>
                {isRtl
                  ? 'العطور منتجات كوزماتكس شخصية ذات خصوصية عالية؛ المعاينة المتاحة عند الباب هي للمنتج وتغليفه وسلامته. بعد إزالة السلوفان الشفاف واستخدام الرشاش، لا يقبل الإرجاع إلا في حال وجود عيب فني مثبت في مضخة الرش (Atomizer).'
                  : 'Perfumes are personal luxury cosmetic goods. Inspection is visual for packaging integrity. Once the cellophane seal is broken and the atomizer triggered, hygiene standards preclude returns unless an atomizer defect is verified.'}
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Terms of Use */}
        {activeTab === 'terms' && (
          <div className="mt-8 bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E0D3] shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  اتفاقية المستخدم (User Agreement)
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  {isRtl ? 'شروط استخدام الموقع وتقديم الطلبات' : 'Terms of Use & Order Agreement'}
                </h2>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                {isRtl
                  ? 'باستخدامك لموقع دار رَحِيقْ للعطور أو تسجيل طلب شراء، فإنك تقر وتوافق على الالتزام بالأحكام والشروط الآتية:'
                  : 'By browsing Raheeq Haute Parfumerie or submitting an order, you confirm adherence to the following terms and regulations:'}
              </p>

              <h3 className="font-serif text-base font-bold text-slate-900">
                {isRtl ? '1. صحة بيانات العميل والاتصال:' : '1. Accuracy of Customer Phone & Address:'}
              </h3>
              <p>
                {isRtl
                  ? 'يلتزم العميل بتقديم رقم هاتف محمول مصري صحيح ومفعل (11 رقماً يبدأ بـ 01) وعنوان دقيق يشمل المحافظة والحي والشارع لتمكين مندوب الشحن من التواصل المسبق لتسليم الطرد.'
                  : 'Customers must furnish a valid, active 11-digit Egyptian mobile number (starting with 01) and accurate street details for delivery coordination.'}
              </p>

              <h3 className="font-serif text-base font-bold text-slate-900 pt-2">
                {isRtl ? '2. تأكيد الطلبات هاتفياً أو عبر واتساب:' : '2. Order Confirmation Prior to Dispatch:'}
              </h3>
              <p>
                {isRtl
                  ? 'يحتفظ فريق كونسيرج المتجر بحقه في إجراء اتصال هاتفي أو إرسال رسالة واتساب للعميل لتأكيد تفاصيل الشحنة والعنوان قبل تسليمها إلى شركة الشحن لمنع الطلبات غير المقصودة.'
                  : 'Raheeq concierge reserves the right to confirm order details via call or WhatsApp prior to carrier handover.'}
              </p>

              <h3 className="font-serif text-base font-bold text-slate-900 pt-2">
                {isRtl ? '3. الأسعار والعملة الرسمية:' : '3. Pricing & Currency:'}
              </h3>
              <p>
                {isRtl
                  ? 'جميع الأسعار المعروضة على الموقع هي بالجنيه المصري (EGP) ومحددة بوضوح شاملة التغليف الفاخر. في حال تقديم عروض أو تخفيضات، تكون سارية خلال المدة المعلنة فقط.'
                  : 'All prices are denominated in Egyptian Pounds (EGP), inclusive of luxury packaging and presentation.'}
              </p>

              <h3 className="font-serif text-base font-bold text-slate-900 pt-2">
                {isRtl ? '4. حقوق الملكية الفكرية والعلامة التجارية:' : '4. Intellectual Property:'}
              </h3>
              <p>
                {isRtl
                  ? 'اسم "رَحِيقْ" (RAHEEQ)، وشعاراتها، وهويتها البصرية والتركيبات المخصصة هي علامات ملكية خاصة بدار رحيق. الإشارة إلى أسماء عطور عالمية في نوتات الاستئناس هي لأغراض المقارنة والتوجيه العطري للعملاء (Inspired by / Olfactory family) دون أي ادعاء بالتبعية للعلامات التجارية العالمية الأخرى.'
                  : 'All brand identity, logos, and formulations belong to Raheeq Atelier. Incidental references to international olfactory families are purely educational guideposts.'}
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Privacy Policy */}
        {activeTab === 'privacy' && (
          <div className="mt-8 bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E0D3] shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  سرية وأمان البيانات (Data Security)
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  {isRtl ? 'سياسة الخصوصية وحماية بيانات العملاء' : 'Client Privacy & Data Protection Charter'}
                </h2>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                {isRtl
                  ? 'نحن في دار رَحِيق نعتبر خصوصية عملائنا أمانة ومسؤولية عليا. نوضح هنا كيفية تعاملنا مع البيانات:'
                  : 'At Raheeq Haute Parfumerie, customer confidentiality is our highest trust. Here is how your data is treated:'}
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <span>{isRtl ? 'ما هي البيانات التي نجمعها؟' : 'What Data Do We Collect?'}</span>
                </div>
                <p className="text-slate-600 text-xs">
                  {isRtl
                    ? 'نجمع فقط البيانات الضرورية لتنفيذ وتوصيل طلبك: اسم العميل، رقم الهاتف للتواصل، وعنوان التوصيل التفصيلي في مصر، وسجل المنتجات المطلوبة.'
                    : 'We collect strictly essential data: Name, mobile contact for courier updates, Egyptian delivery address, and ordered item records.'}
                </p>
              </div>

              <h3 className="font-serif text-base font-bold text-slate-900 pt-2">
                {isRtl ? 'عدم بيع أو مشاركة البيانات:' : 'No Third-Party Commercial Sharing:'}
              </h3>
              <p>
                {isRtl
                  ? 'نتعهد تعهداً قاطعاً بعدم بيع أو تأجير أو مشاركة بياناتك الشخصية مع أي جهات إعلانية أو وسطاء تجاريين. تُشارك بيانات العنوان ورقم الهاتف فقط وبشكل مشفر مع شركة الشحن المسؤولة عن تسليم طردك حصرياً.'
                  : 'We strictly pledge never to sell, rent, or lease your personal data. Dispatch information is solely shared with our vetted courier partners for order fulfillment.'}
              </p>

              <h3 className="font-serif text-base font-bold text-slate-900 pt-2">
                {isRtl ? 'أمان التصفح والتشفير (SSL / HTTPS):' : 'Secure Encrypted Browsing:'}
              </h3>
              <p>
                {isRtl
                  ? 'يعمل الموقع بأحدث شهادات التشفير العالمية SSL لحماية كامل مسار البيانات، وتخضع جميع الجلسات لقواعد حماية صارمة لمنع التطفل أو التسريب.'
                  : 'All traffic is encrypted end-to-end via TLS/SSL certificates to safeguard interactions and orders.'}
              </p>
            </div>
          </div>
        )}

        {/* Tab 5: Return & Exchange */}
        {activeTab === 'returns' && (
          <div className="mt-8 bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E0D3] shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 flex-shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  ضمان الجودة الملكية (Quality Guarantee)
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  {isRtl ? 'سياسة الاستبدال والاسترجاع والضمان' : 'Exchange, Return & Defect Guarantees'}
                </h2>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h3 className="font-serif text-base font-bold text-slate-900">
                {isRtl ? '1. فترة الاستبدال الرسمية (14 يوماً):' : '1. 14-Day Official Exchange Window:'}
              </h3>
              <p>
                {isRtl
                  ? 'وفقاً لقانون حماية المستهلك المصري، يحق للعميل استبدال العطر خلال 14 يوماً من تاريخ الاستلام، بشرط أن يكون العطر في حالته الأصلية تماماً، غير مفتوح، وفي غلاف السلوفان الأصلي غير الممزق وبكامل محتويات العلبة.'
                  : 'In compliance with Egyptian Consumer Protection laws, exchanges are welcomed within 14 days of delivery provided the item is brand new, sealed in original intact cellophane, and unused.'}
              </p>

              <h3 className="font-serif text-base font-bold text-slate-900 pt-2">
                {isRtl ? '2. عيوب الصناعة والبخاخات (Atomizer Defects):' : '2. Manufacturing & Atomizer Defects:'}
              </h3>
              <p>
                {isRtl
                  ? 'إذا واجهتك أي مشكلة فنية نادرة في مضخة الرش (البخاخ) أو تلف في الغطاء المغناطيسي خلال 30 يوماً، يتم استبدال الزجاجة فوراً بزجاجة جديدة مجاناً وبدون أي رسوم شحن إضافية.'
                  : 'In the rare event of an atomizer or magnetic cap manufacturing defect within 30 days, we replace your bottle free of charge including shipping.'}
              </p>

              <h3 className="font-serif text-base font-bold text-slate-900 pt-2">
                {isRtl ? '3. خطوات طلب الاستبدال السريعة:' : '3. Quick Exchange Procedure:'}
              </h3>
              <p>
                {isRtl
                  ? 'تواصل ببساطة مع خدمة العملاء عبر الواتساب على 01131068790 أو 01011800245، واذكر رقم طلبك، وسيقوم المندوب بتسليمك القطعة البديلة واستلام القديمة خلال 48 ساعة.'
                  : 'Contact concierge WhatsApp on 01131068790 or 01011800245 with your order number for doorstep swap within 48 hours.'}
              </p>
            </div>
          </div>
        )}

        {/* Quick Contact Footer Card */}
        <div className="mt-12 bg-gradient-to-r from-[#080A0A] to-[#121A19] text-white p-6 sm:p-8 rounded-3xl border border-[#2DD4BF]/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-right">
            <span className="text-[10px] text-[#54d1b2] font-mono uppercase tracking-widest font-bold">
              {isRtl ? 'مستشار دار رحيق متاح لخدمتكم' : 'Raheeq Concierge Available'}
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
              {isRtl ? 'هل لديك أي استفسار حول السياسات أو المعاينة؟' : 'Have Questions on Delivery or Policies?'}
            </h3>
            <p className="text-xs text-[#A2ADA9]">
              {isRtl
                ? 'فريقنا متاح يومياً للمحادثة الفورية عبر الواتساب للرد على كافة أسئلتكم ومساعدتكم في اختيار عطرك المفضل.'
                : 'Our Cairo master concierge is available daily via WhatsApp to assist with questions and consultations.'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="https://wa.me/201131068790"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#2bf376] hover:to-[#25D366] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isRtl ? 'محادثة واتساب 1' : 'WhatsApp Line 1'}</span>
            </a>

            <a
              href="https://wa.me/201011800245"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-[#1A2624] hover:bg-[#253633] text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-[#2DD4BF]/30 transition-all hover:scale-105"
            >
              <Phone className="w-4 h-4 text-[#2DD4BF]" />
              <span>{isRtl ? 'واتساب 2' : 'WhatsApp Line 2'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
