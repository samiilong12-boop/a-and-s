'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Sparkles,
  Send,
  MessageCircle,
  CheckCircle2,
  Droplets,
  ShieldCheck,
  FlaskConical,
  Phone,
  User,
  Copy,
  Check,
  Search,
} from 'lucide-react';
import { useCustomRequest } from '@/context/CustomRequestContext';
import { useLanguage } from '@/context/LanguageContext';

export function CustomPerfumeRequestModal() {
  const { isModalOpen, closeModal, defaultPerfume, submitRequest } = useCustomRequest();
  const { isRtl } = useLanguage();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [perfumeName, setPerfumeName] = useState('');
  const [volumeMl, setVolumeMl] = useState('100ml');
  const [concentration, setConcentration] = useState('EXTRAIT_DE_PARFUM');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (defaultPerfume) {
      setPerfumeName(defaultPerfume);
    }
  }, [defaultPerfume]);

  if (!isModalOpen) return null;

  const handleSubmit = async (viaWhatsApp = false) => {
    if (!perfumeName.trim()) {
      alert(isRtl ? 'برجاء كتابة اسم العطر أو الخلطة المطلوبة' : 'Please specify the perfume or blend name');
      return;
    }
    if (!customerPhone.trim()) {
      alert(isRtl ? 'برجاء إدخال رقم الهاتف أو الواتساب للتواصل' : 'Please provide your phone/WhatsApp number');
      return;
    }

    setIsSubmitting(true);
    const result = await submitRequest({
      customerName: customerName.trim() || 'عميل A AND S',
      customerPhone: customerPhone.trim(),
      perfumeName: perfumeName.trim(),
      volumeMl,
      concentration,
      notes: notes.trim(),
    });

    setIsSubmitting(false);

    if (result.success && result.request) {
      setSubmittedRequestId(result.request.id);
      setIsSuccess(true);

      if (viaWhatsApp) {
        // Construct luxury WhatsApp pre-filled concierge message
        const concMessage = `*طلب عطر خاص / خلطة مخصصة — دار رَحِيقْ (RAHEEQ Haute Parfumerie)* 💎%0A%0A` +
          `• *الاسم:* ${encodeURIComponent(customerName || 'عميل محترم')}%0A` +
          `• *الهاتف:* ${encodeURIComponent(customerPhone)}%0A` +
          `• *العطر أو الخلطة المطلوبة:* ${encodeURIComponent(perfumeName)}%0A` +
          `• *الحجم:* ${encodeURIComponent(volumeMl)}%0A` +
          `• *التركيز المفضل:* ${encodeURIComponent(concentration.replace(/_/g, ' '))}%0A` +
          (notes ? `• *ملاحظات خاصة:* ${encodeURIComponent(notes)}%0A` : '') +
          `• *رقم الطلب:* ${encodeURIComponent(result.request.id)}%0A%0A` +
          `أرغب في الاستفسار عن التوافر والسعر وخيارات التوصيل السريع لباب البيت داخل مصر.`;

        const waUrl = `https://wa.me/201131068790?text=${concMessage}`;
        window.open(waUrl, '_blank');
      }
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setCustomerName('');
    setCustomerPhone('');
    setPerfumeName('');
    setNotes('');
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080A0A]/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-xl bg-[#0D1111] border border-[#54d1b2]/40 rounded-2xl shadow-[0_0_50px_rgba(84,209,178,0.15)] overflow-hidden text-[#FAF9F5]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Decorative Top Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#00bc7d] via-[#54d1b2] to-[#D4AF37]" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-white/10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00bc7d]/20 to-[#54d1b2]/10 border border-[#54d1b2]/30 flex items-center justify-center text-[#54d1b2]">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                <span>{isRtl ? 'طلب عطر معين أو تركيبة خاصة' : 'Request Bespoke Perfume / Blend'}</span>
                <Sparkles className="w-4 h-4 text-[#54d1b2] animate-pulse" />
              </h2>
              <p className="text-xs text-[#A2ADA9] mt-0.5 font-light">
                {isRtl
                  ? 'عطرك المفضل مش موجود؟ أو عندك تركيبة خاصة في بالك؟ اكتب لينا اسمها وحجمها وبنوفرو ليك بأعلى ثبات وتركيز.'
                  : 'Looking for a rare fragrance or a custom blend? Tell us the name and size, and our master perfumers will craft it for you.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="text-[#788784] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#00bc7d]/20 border border-[#00bc7d] mx-auto flex items-center justify-center text-[#54d1b2]">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-bold font-serif text-white">
                {isRtl ? 'تم استلام طلبك الملكي بنجاح!' : 'Your Bespoke Request Was Received!'}
              </h3>
              <p className="text-sm text-[#A2ADA9] max-w-md mx-auto leading-relaxed">
                {isRtl
                  ? `شكراً لك. طلبك للعطر (${perfumeName}) بحجم (${volumeMl}) مسجل تحت الكود `
                  : `Thank you. Your request for (${perfumeName}) [${volumeMl}] is registered with ID `}
                <span className="font-mono text-[#54d1b2] font-bold">#{submittedRequestId}</span>.
                {isRtl
                  ? ' سيقوم خبير العطور لدينا بالتواصل معك عبر الواتساب لتأكيد السعر وموعد الاستلام.'
                  : ' Our fragrance concierge will contact you via WhatsApp to finalize delivery.'}
              </p>

              <div className="bg-[#121818] p-4 rounded-xl border border-[#54d1b2]/30 max-w-md mx-auto space-y-2">
                <p className="text-xs text-[#A2ADA9]">
                  {isRtl ? 'كود المرجع الخاص بطلبك للمتابعة والتتبع:' : 'Your Tracking & Reference Code:'}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-base text-[#54d1b2] font-bold tracking-wider select-all">
                    {submittedRequestId}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(submittedRequestId);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#FAF9F5] transition-colors inline-flex items-center gap-1 text-[11px]"
                    title="نسخ الكود"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                {/* 1. Track Order Button */}
                <Link
                  href={`/track-order?orderNumber=${encodeURIComponent(submittedRequestId)}&phone=${encodeURIComponent(customerPhone)}`}
                  onClick={handleResetAndClose}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00bc7d] to-[#54d1b2] hover:opacity-95 text-[#080A0A] font-extrabold text-xs tracking-wider transition-transform hover:scale-105 shadow-[0_0_20px_rgba(84,209,178,0.3)]"
                >
                  <Search className="w-4 h-4" />
                  <span>{isRtl ? 'تتبع حالة طلبك ومسار التصنيع الآن' : 'Track Your Request Now'}</span>
                </Link>

                {/* 2. WhatsApp Button */}
                <a
                  href={`https://wa.me/201131068790?text=${encodeURIComponent(
                    `مرحباً دار رَحِيقْ (RAHEEQ)، بخصوص طلبي الخاص رقم ${submittedRequestId} للعطر (${perfumeName}) بحجم (${volumeMl}) - تركيز (${concentration})`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs tracking-wider transition-transform hover:scale-105 shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isRtl ? 'تأكيد عبر واتساب' : 'Confirm on WhatsApp'}</span>
                </a>

                {/* 3. Close */}
                <button
                  onClick={handleResetAndClose}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs tracking-wider transition-colors"
                >
                  {isRtl ? 'إغلاق والعودة' : 'Close'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Field 1: Desired Perfume / Formula */}
              <div>
                <label className="block text-xs font-bold text-[#E6E1D5] uppercase tracking-wider mb-1.5">
                  {isRtl ? 'اسم العطر أو مكونات الخلطة المطلوبة *' : 'Perfume Name or Custom Blend Formula *'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={perfumeName}
                    onChange={(e) => setPerfumeName(e.target.value)}
                    placeholder={
                      isRtl
                        ? 'مثال: Creed Aventus أو خلطة توم فورد مع مسك وأمبرغريس'
                        : 'e.g. Creed Aventus, Dior Sauvage Elixir, or custom Oud blend'
                    }
                    className="w-full bg-[#141A19] border border-white/15 focus:border-[#54d1b2] rounded-xl px-4 py-3 text-sm text-white placeholder-[#788784] focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Field 2 & 3: Volume & Concentration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#E6E1D5] uppercase tracking-wider mb-1.5">
                    {isRtl ? 'الحجم المطلوب' : 'Desired Volume'}
                  </label>
                  <select
                    value={volumeMl}
                    onChange={(e) => setVolumeMl(e.target.value)}
                    className="w-full bg-[#141A19] border border-white/15 focus:border-[#54d1b2] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  >
                    <option value="50ml">50 ml — حجم شخصي مدمج</option>
                    <option value="100ml">100 ml — الحجم القياسي الفاخر (الأكثر طلباً)</option>
                    <option value="150ml">150 ml — الحجم الملكي الكبير</option>
                    <option value="200ml">200 ml — عبوة اقتناء خاصة</option>
                    <option value="custom">حجم مخصص آخر (تواصل معنا)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#E6E1D5] uppercase tracking-wider mb-1.5">
                    {isRtl ? 'درجة التركيز' : 'Concentration Level'}
                  </label>
                  <select
                    value={concentration}
                    onChange={(e) => setConcentration(e.target.value)}
                    className="w-full bg-[#141A19] border border-white/15 focus:border-[#54d1b2] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  >
                    <option value="EXTRAIT_DE_PARFUM">Extrait de Parfum (تركيز نيش فائق 25% - ثبات أسطوري لأكثر من 14 ساعة)</option>
                    <option value="EXTRAIT_35">Extrait de Parfum مغلظ (تركيز 35% نيش ثقيل)</option>
                    <option value="EAU_DE_PARFUM">Eau de Parfum (تركيز راقي 20%)</option>
                    <option value="OIL_PERFUME">Pure Perfume Oil (زيت عطري نقي 100% خالٍ من الكحول)</option>
                  </select>
                </div>
              </div>

              {/* Field 4 & 5: Customer Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#E6E1D5] uppercase tracking-wider mb-1.5">
                    {isRtl ? 'اسمك الكريم' : 'Your Full Name'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={isRtl ? 'الاسم' : 'John Doe'}
                      className="w-full bg-[#141A19] border border-white/15 focus:border-[#54d1b2] rounded-xl px-4 py-3 text-sm text-white placeholder-[#788784] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#E6E1D5] uppercase tracking-wider mb-1.5">
                    {isRtl ? 'رقم الواتساب / الموبايل *' : 'WhatsApp / Mobile Number *'}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder={isRtl ? '01012345678 أو +20...' : '+20 10 1234 5678'}
                      className="w-full bg-[#141A19] border border-white/15 focus:border-[#54d1b2] rounded-xl px-4 py-3 text-sm text-white placeholder-[#788784] focus:outline-none transition-colors font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Field 6: Notes */}
              <div>
                <label className="block text-xs font-bold text-[#E6E1D5] uppercase tracking-wider mb-1.5">
                  {isRtl ? 'أي ملاحظات خاصة عن الرائحة أو الثبات (اختياري)' : 'Special Customization Notes (Optional)'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder={
                    isRtl
                      ? 'مثال: أفضل زيادة نفحات البخور، أو إرسال عينة صغيرة للتجربة أولاً...'
                      : 'e.g. Higher sillage, extra smokiness, or special delivery timing...'
                  }
                  className="w-full bg-[#141A19] border border-white/15 focus:border-[#54d1b2] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#788784] focus:outline-none transition-colors"
                />
              </div>

              {/* Value Badges */}
              <div className="p-3 bg-[#141A19] rounded-xl border border-white/5 flex items-center justify-between text-[11px] text-[#A2ADA9]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#54d1b2]" />
                  <span>{isRtl ? 'زيوت فرنسية وسويسرية نقية 100%' : '100% Pure Swiss/French Oils'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-[#54d1b2]" />
                  <span>{isRtl ? 'ضمان ثبات وفوحان يتجاوز 24 ساعة' : '24h+ Sillage Guarantee'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                {/* Primary Button: Direct WhatsApp Concierge */}
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#2bf376] hover:to-[#25D366] text-white font-extrabold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isRtl ? 'طلب فوري ومحادثة واتساب' : 'Submit & WhatsApp Concierge'}</span>
                </button>

                {/* Secondary Button: Website Record Submission */}
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-[#00bc7d] to-[#54d1b2] hover:opacity-95 text-[#080A0A] font-extrabold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(84,209,178,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Send className="w-4 h-4" />
                  <span>{isRtl ? 'إرسال الطلب وحفظه في الموقع' : 'Submit Request on Website'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
