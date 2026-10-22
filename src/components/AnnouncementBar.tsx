'use client';

import React from 'react';
import { Truck, Sparkles, Phone } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function AnnouncementBar() {
  const { t, isRtl } = useLanguage();

  return (
    <div className="bg-[#0A0D0D] text-[#FAFAF7] text-xs py-2 px-4 border-b border-[#B8934A]/30">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
        <div className="flex items-center justify-center gap-2 font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="font-bold text-[#FFFFFF]">{t('announcement.free_shipping')}</span>
        </div>
        <div className="flex items-center justify-center gap-3 text-[11px] text-[#D5D1C7]">
          <span className="flex items-center gap-1 font-semibold text-[#D4AF37]">
            <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
            {t('announcement.cod')}
          </span>
          <span className="hidden md:inline">•</span>
          <a
            href="tel:+201012345678"
            className="hidden md:flex items-center gap-1 text-[#FFFFFF] hover:text-[#D4AF37] font-bold"
          >
            <Phone className="w-3 h-3 text-[#D4AF37]" />
            <span>010 1234 5678</span>
          </a>
        </div>
      </div>
    </div>
  );
}
