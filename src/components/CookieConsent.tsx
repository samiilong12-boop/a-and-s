'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Cookie, X, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function CookieConsent() {
  const { t, isRtl } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('a_and_s_cookie_consent');
      if (!consent) {
        // Show after a brief delay for elegant UX
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('a_and_s_cookie_consent', 'accepted_all');
    } catch (e) {
      console.error(e);
    }
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('a_and_s_cookie_consent', 'declined_non_essential');
    } catch (e) {
      console.error(e);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie consent"
      className={`fixed bottom-4 sm:bottom-6 ${
        isRtl ? 'right-4 sm:right-6 left-4 sm:left-auto' : 'left-4 sm:left-6 right-4 sm:right-auto'
      } z-50 max-w-md w-full bg-[#080A0A]/95 text-[#F5F2EB] backdrop-blur-xl border border-[#2DD4BF]/40 rounded-2xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-500`}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-full bg-[#111716] border border-[#2DD4BF]/50 flex items-center justify-center flex-shrink-0 text-[#2DD4BF] shadow-lg">
          <Cookie className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-sm text-[#F5F2EB] flex items-center gap-1.5">
              <span>{isRtl ? 'خصوصيتك وتجربة التسوق الفاخرة' : 'Privacy & Bespoke Experience'}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#2DD4BF]" />
            </h4>
            <button
              onClick={handleDecline}
              className="text-[#9EABA7] hover:text-white p-1 rounded-md"
              aria-label="Dismiss cookie notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#C5CECB] leading-relaxed">
            {isRtl
              ? 'نستخدم ملفات تعريف الارتباط لضمان تجربة تسوق عطرية استثنائية، وحفظ سلة المشتريات، وتوفير خيارات دفع وتوصيل آمنة داخل مصر.'
              : 'We use cookies to tailor your olfactory journey, secure your bespoke shopping bag, and deliver seamless Cash on Delivery across Egypt.'}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={handleAcceptAll}
              className="w-full sm:w-auto flex-1 bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] hover:from-[#5EEAD4] hover:to-[#2DD4BF] text-[#080A0A] font-bold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isRtl ? 'قبول جميع الكوكيز' : 'Accept All'}</span>
            </button>

            <button
              onClick={handleDecline}
              className="w-full sm:w-auto px-3 py-2 rounded-lg text-xs font-semibold text-[#D5D1C7] hover:text-white hover:bg-[#141A19] border border-[#1A2624] transition-colors"
            >
              <span>{isRtl ? 'الضرورية فقط' : 'Essential Only'}</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
