'use client';

import React, { useState } from 'react';
import { Phone, MessageSquare, X, Sparkles, ChevronUp, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function FloatingContact() {
  const { t, isRtl } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const phone1 = '01131068790';
  const phone2 = '01011800245';

  const waUrl1 = `https://wa.me/201131068790?text=${encodeURIComponent(
    isRtl
      ? 'مرحباً دار رَحِيقْ للعطور الفاخرة 💎، أود الاستفسار عن تشكيلة العطور وتفاصيل التوصيل والمعاينة عند الاستلام.'
      : 'Hello Raheeq Haute Parfumerie, I would like to inquire about fragrances and door delivery with inspection.'
  )}`;

  const waUrl2 = `https://wa.me/201011800245?text=${encodeURIComponent(
    isRtl
      ? 'مرحباً دار رَحِيقْ للعطور الفاخرة 💎، أود الاستفسار عن تشكيلة العطور وطلب عطر خاص.'
      : 'Hello Raheeq Haute Parfumerie, I would like to inquire about bespoke fragrances.'
  )}`;

  return (
    <div className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-50 flex flex-col items-end`}>
      {/* Expanded Quick Contact Card */}
      {isOpen && (
        <div className="mb-3 w-80 bg-[#080A0A]/95 backdrop-blur-xl border border-[#2DD4BF]/50 rounded-2xl p-5 shadow-2xl text-[#FAF9F5] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex justify-between items-start pb-3 border-b border-[#1A2624]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF] animate-pulse shadow-[0_0_8px_#2DD4BF]" />
              <span className="text-xs font-serif font-bold text-white">
                {isRtl ? 'كونسيرج دار رَحِيقْ الملكي' : 'Raheeq Fragrance Concierge'}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#9EABA7] hover:text-white p-0.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#C5CECB] my-3 leading-relaxed">
            {isRtl
              ? 'تحدث مباشرة مع مستشارنا العطري في القاهرة لاختيار عطرك المفضل أو طلب خلطة مخصصة مع خدمة المعاينة عند باب بيتك.'
              : 'Direct consultation with our Cairo master perfumer for recommendations and door-to-door delivery with inspection.'}
          </p>

          <div className="space-y-2 pt-1">
            {/* WhatsApp Line 1 */}
            <a
              href={waUrl1}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3.5 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#2bf376] hover:to-[#25D366] text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-md transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-white" />
                <span>{isRtl ? 'واتساب الخط الأول' : 'WhatsApp Line 1'}</span>
              </div>
              <span className="font-mono text-[11px] text-white font-extrabold">{phone1}</span>
            </a>

            {/* WhatsApp Line 2 */}
            <a
              href={waUrl2}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3.5 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#2bf376] hover:to-[#25D366] text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-md transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-white" />
                <span>{isRtl ? 'واتساب الخط الثاني' : 'WhatsApp Line 2'}</span>
              </div>
              <span className="font-mono text-[11px] text-white font-extrabold">{phone2}</span>
            </a>

            {/* Direct Phone Call Line */}
            <a
              href={`tel:${phone1}`}
              className="w-full py-2 px-3 bg-[#141A19] hover:bg-[#1A2624] text-white rounded-xl text-xs font-medium flex items-center justify-between transition-colors border border-[#2DD4BF]/30"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span className="text-[11px]">{isRtl ? 'اتصال هاتفي مباشر' : 'Direct Phone Call'}</span>
              </div>
              <span className="font-mono text-[11px] text-[#2DD4BF] font-bold">{phone1}</span>
            </a>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#1A2624] text-[10px] text-center text-[#788784]">
            {isRtl ? 'متاحون لخدمتكم يومياً • التوصيل إلى الباب والمعاينة' : 'Available Daily • Door-to-Door Delivery Across Egypt'}
          </div>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 bg-[#080A0A] hover:bg-[#111716] text-white py-3.5 px-5 rounded-full border border-[#2DD4BF]/60 shadow-[0_4px_25px_rgba(45,212,191,0.35)] transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Contact Concierge"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF] animate-ping absolute top-1 right-1" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF] absolute top-1 right-1" />
        <MessageSquare className="w-4 h-4 text-[#2DD4BF] group-hover:scale-110 transition-transform" />
        <span className="text-xs font-bold tracking-wide">
          {isOpen ? (isRtl ? 'إغلاق' : 'Close') : (isRtl ? 'المستشار العطري' : 'Fragrance Concierge')}
        </span>
      </button>
    </div>
  );
}
