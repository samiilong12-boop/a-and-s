'use client';

import React, { useState } from 'react';
import { Phone, MessageSquare, X, Sparkles, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function FloatingContact() {
  const { t, isRtl } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const phoneNumber = '+201012345678';
  const whatsappUrl = `https://wa.me/201012345678?text=${encodeURIComponent(
    isRtl
      ? 'مرحباً دار A AND S، أود الاستفسار عن ترشيحات العطور وخدمة التوصيل والدفع عند الاستلام.'
      : 'Hello A AND S, I would like to inquire about perfume recommendations and COD delivery.'
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
                {isRtl ? 'كونسيرج دار A AND S للعطور' : 'A AND S Fragrance Concierge'}
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
              ? 'تحدث مباشرة مع خبيرنا العطري في القاهرة لاختيار عطرك المناسب وترتيب المعاينة عند الاستلام.'
              : 'Direct consultation with our Cairo master perfumer for recommendations and express COD delivery.'}
          </p>

          <div className="space-y-2 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 btn-turquoise rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg"
            >
              <MessageSquare className="w-4 h-4 text-[#080A0A]" />
              <span>{isRtl ? 'محادثة المستشار عبر واتساب' : 'Chat on WhatsApp Concierge'}</span>
            </a>

            <a
              href={`tel:${phoneNumber}`}
              className="w-full py-2.5 px-4 bg-[#141A19] hover:bg-[#1A2624] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-[#2DD4BF]/30"
            >
              <Phone className="w-4 h-4 text-[#2DD4BF]" />
              <span>010 1234 5678 (اتصال مباشر)</span>
            </a>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#1A2624] text-[10px] text-center text-[#788784]">
            {isRtl ? 'متاحون يومياً • توصيل ومعاينة لجميع المحافظات' : 'Available Daily • Door-to-Door Inspection Across Egypt'}
          </div>
        </div>
      )}

      {/* Main Trigger Button with Signature Light Turquoise Halo */}
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
