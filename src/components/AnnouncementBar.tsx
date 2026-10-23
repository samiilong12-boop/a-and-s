'use client';

import React from 'react';
import { Truck, Sparkles, Phone, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function AnnouncementBar() {
  const { t, isRtl } = useLanguage();

  return (
    <div className="bg-[#080A0A] text-[#FAF9F5] text-xs py-2 px-4 border-b border-[#2DD4BF]/20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
        {/* Signature Free Shipping Offer with Turquoise Sparkle */}
        <div className="flex items-center justify-center gap-2 font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-[#2DD4BF] animate-pulse" />
          <span className="font-bold text-[#FFFFFF]">{t('announcement.free_shipping')}</span>
          <span className="hidden lg:inline text-[10px] text-[#2DD4BF] font-mono tracking-wider bg-[#2DD4BF]/10 px-2 py-0.5 rounded-full border border-[#2DD4BF]/20">
            {isRtl ? 'بصمة الفخامة المصرية' : 'Egypt Haute Parfumerie'}
          </span>
        </div>

        {/* COD & Concierge Helpline */}
        <div className="flex items-center justify-center gap-3 text-[11px] text-[#D5D1C7]">
          <span className="flex items-center gap-1 font-semibold text-[#2DD4BF]">
            <Truck className="w-3.5 h-3.5 text-[#2DD4BF]" />
            {t('announcement.cod')}
          </span>
          <span className="hidden md:inline text-[#4A5553]">•</span>
          <a
            href="tel:+201012345678"
            className="hidden md:flex items-center gap-1 text-[#FFFFFF] hover:text-[#2DD4BF] font-bold transition-colors"
          >
            <Phone className="w-3 h-3 text-[#2DD4BF]" />
            <span>010 1234 5678</span>
          </a>
        </div>
      </div>
    </div>
  );
}
