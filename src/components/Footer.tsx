'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, Clock, Phone, MapPin, Mail, Lock, Sparkles, Gift } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteContent } from '@/context/SiteContentContext';

export function Footer() {
  const { t, isRtl } = useLanguage();
  const { siteContent: content } = useSiteContent();

  return (
    <footer className="bg-[#080A0A] border-t border-[#1A2624] text-[#FAF9F5] mt-24">
      {/* Brand Values Bar (Faces Egypt + Chanel Standard) */}
      <div className="border-b border-[#1A2624] py-12 bg-[#0E1413]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-right">
            
            {/* Express Shipping */}
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#141A19] border border-[#2DD4BF]/40 flex items-center justify-center text-[#2DD4BF] flex-shrink-0 shadow-lg">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#FFFFFF]">
                  {isRtl ? (content.footerShippingTitle || 'التوصيل إلى الباب') : 'Door-to-Door Delivery Across Egypt'}
                </h4>
                <p className="text-xs text-[#9EABA7] mt-0.5">
                  {isRtl ? (content.footerShippingDesc || 'توصيل مخصص وسريع لباب بيتك في القاهرة والإسكندرية وجميع محافظات مصر.') : 'Dedicated express door-to-door courier delivery across Egypt.'}
                </p>
              </div>
            </div>

            {/* Cash on Delivery with Inspection */}
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#141A19] border border-[#2DD4BF]/40 flex items-center justify-center text-[#2DD4BF] flex-shrink-0 shadow-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#FFFFFF]">
                  {isRtl ? (content.footerCodTitle || 'معاينة الطرد قبل الدفع كاش') : 'Cash on Delivery (COD)'}
                </h4>
                <p className="text-xs text-[#9EABA7] mt-0.5">
                  {isRtl ? (content.footerCodDesc || 'عاين طردك الفاخر وتأكد من سلامة الزجاجة عند بابك قبل السداد للمندوب.') : 'Inspect your package and flacon upon arrival before handing cash payment.'}
                </p>
              </div>
            </div>

            {/* High Concentration Extrait */}
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#141A19] border border-[#2DD4BF]/40 flex items-center justify-center text-[#2DD4BF] flex-shrink-0 shadow-lg">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#FFFFFF]">
                  {isRtl ? (content.footerConcentrationTitle || 'تركيز زيوت نقية 25% Extrait') : 'Pure 25% Extrait de Parfum'}
                </h4>
                <p className="text-xs text-[#9EABA7] mt-0.5">
                  {isRtl ? (content.footerConcentrationDesc || 'ثبات استثنائي يتجاوز 14 ساعة وفوحان يملأ الأرجاء.') : 'Unmatched persistent sillage lasting over 14 hours.'}
                </p>
              </div>
            </div>

            {/* Crystal Flacon & Magnetic Cap */}
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#141A19] border border-[#C6A66B]/50 flex items-center justify-center text-[#C6A66B] flex-shrink-0 shadow-lg">
                <Sparkles className="w-6 h-6 text-[#54d1b2]" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#FFFFFF]">
                  {isRtl ? (content.footerBottleTitle || 'زجاج بلوري ثقيل بغطاء مغناطيسي') : 'Weighted Crystal & Magnetic Cap'}
                </h4>
                <p className="text-xs text-[#9EABA7] mt-0.5">
                  {isRtl ? (content.footerBottleDesc || 'زجاجة بلورية محكمة الإغلاق تحفظ كثافة ونقاء الزيوت العطرية النادرة.') : 'Heavy beveled crystal flacon sealing the density of rare perfume oils.'}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className={`w-12 h-12 ${content.brandLogoShape === 'square' ? 'rounded-none' : content.brandLogoShape === 'rounded' ? 'rounded-xl' : 'rounded-full'} border ${content.brandLogoBorder === 'turquoise' ? 'border-[#54d1b2]' : content.brandLogoBorder === 'none' ? 'border-transparent' : 'border-[#D4AF37]/50'} bg-[#080A0A] flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden`}>
                <img
                  src={content.brandLogoUrl || '/images/raheeq-official-logo.png'}
                  alt="Raheeq Royal Crest"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center">
                  <span className="font-serif text-2xl font-bold tracking-[0.18em] text-[#FFFFFF]">
                    رَحِـيـقْ
                  </span>
                  <span className="font-sans text-xs tracking-[0.25em] text-[#C6A66B] font-extrabold mx-1.5 uppercase">
                    RAHEEQ
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#54d1b2] shadow-[0_0_8px_#54d1b2] mb-1" />
                </div>
                <p className="text-[10px] tracking-[0.35em] text-[#C6A66B] uppercase font-sans font-bold">
                  Haute Parfumerie
                </p>
              </div>
            </Link>
            <p className="text-sm text-[#9EABA7] max-w-sm leading-relaxed">
              &ldquo;{isRtl ? 'فن ترك الانطباع الذي لا يُنسى' : 'The art of leaving an impression'}.&rdquo; {isRtl ? 'دار رحيق للعطور الفاخرة — توليفات نادرة بأرقى الزيوت المعتقة تضاهي أفخم الدور العالمية، مع خدمة الدفع عند الاستلام والمعاينة الكاملة.' : 'Bespoke perfume atelier crafted to compete with world-class French houses.'}
            </p>
            <div className="space-y-2 text-xs text-[#9EABA7] pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2DD4BF] flex-shrink-0" />
                <span>{isRtl ? 'القاهرة الجديدة، مصر' : 'New Cairo, Egypt'}</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#2DD4BF] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <a href="https://wa.me/201131068790" target="_blank" rel="noopener noreferrer" className="hover:text-[#2DD4BF] transition-colors font-mono">
                    01131068790 {isRtl ? '(واتساب ومكالمات 1)' : '(WhatsApp & Line 1)'}
                  </a>
                  <a href="https://wa.me/201011800245" target="_blank" rel="noopener noreferrer" className="hover:text-[#2DD4BF] transition-colors font-mono">
                    01011800245 {isRtl ? '(واتساب ومكالمات 2)' : '(WhatsApp & Line 2)'}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#2DD4BF] flex-shrink-0" />
                <span>concierge@raheeq-parfums.com</span>
              </div>
            </div>
          </div>

          {/* Fragrance Families */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#FFFFFF] tracking-wider uppercase">
              {isRtl ? 'العائلات العطرية' : 'Fragrance Families'}
            </h4>
            <ul className="space-y-2 text-xs text-[#9EABA7]">
              <li>
                <Link href="/catalog?family=Oriental+Woody" className="hover:text-[#2DD4BF] transition-colors">
                  {isRtl ? 'أخشاب شرقية وعود' : 'Oriental Woody'}
                </Link>
              </li>
              <li>
                <Link href="/catalog?family=Floral+Amber" className="hover:text-[#2DD4BF] transition-colors">
                  {isRtl ? 'عنبر وزهور نقية' : 'Floral Amber'}
                </Link>
              </li>
              <li>
                <Link href="/catalog?family=Fresh+Citrus" className="hover:text-[#2DD4BF] transition-colors">
                  {isRtl ? 'حمضيات برغموت منعشة' : 'Fresh Citrus'}
                </Link>
              </li>
              <li>
                <Link href="/catalog?family=Leather+Spice" className="hover:text-[#2DD4BF] transition-colors">
                  {isRtl ? 'جلود وتوابل ملكية' : 'Leather & Spice'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#FFFFFF] tracking-wider uppercase">
              {isRtl ? 'خدمة العملاء والسياسات' : 'Client Care & Policies'}
            </h4>
            <ul className="space-y-2 text-xs text-[#9EABA7]">
              <li>
                <Link href="/terms#delivery" className="hover:text-[#2DD4BF] transition-colors flex items-center gap-1.5 font-medium text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'شروط المعاينة عند الاستلام' : 'Doorstep Inspection Policy'}</span>
                </Link>
              </li>
              <li>
                <Link href="/terms#terms" className="hover:text-[#2DD4BF] transition-colors">
                  {isRtl ? 'شروط الاستخدام والطلب' : 'Terms of Use'}
                </Link>
              </li>
              <li>
                <Link href="/terms#privacy" className="hover:text-[#2DD4BF] transition-colors">
                  {isRtl ? 'سياسة الخصوصية وأمان البيانات' : 'Privacy & Security'}
                </Link>
              </li>
              <li>
                <Link href="/terms#returns" className="hover:text-[#2DD4BF] transition-colors">
                  {isRtl ? 'الاستبدال والاسترجاع والضمان' : 'Returns & Warranty'}
                </Link>
              </li>
              <li>
                <Link href="/terms#ai" className="hover:text-[#2DD4BF] transition-colors flex items-center gap-1.5 text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'إشعار محتوى الذكاء الاصطناعي (AI)' : 'AI Content Notice'}</span>
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-[#2DD4BF] transition-colors">
                  {t('nav.track_order')}
                </Link>
              </li>
              <li>
                <Link href="/#brand-story" className="hover:text-[#2DD4BF] transition-colors">
                  {t('nav.brand_story')}
                </Link>
              </li>
              <li>
                <a href="https://wa.me/201131068790" target="_blank" rel="noopener noreferrer" className="hover:text-[#2DD4BF] transition-colors">
                  {isRtl ? 'واتساب 1: 01131068790' : 'WhatsApp 1: 01131068790'}
                </a>
              </li>
            </ul>
          </div>

          {/* Guarantees & QR Code */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold text-[#FFFFFF] tracking-wider uppercase">
              {isRtl ? 'كود المتجر الرسمي' : 'Official Store QR'}
            </h4>
            <div className="bg-[#121817] p-3 rounded-2xl border border-[#2DD4BF]/30 inline-flex flex-col items-center space-y-2">
              <div className="w-24 h-24 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https%3A%2F%2Fa-and-s.vercel.app%2F"
                  alt="Raheeq Official Storefront QR"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[10px] text-[#2DD4BF] font-bold text-center">
                {isRtl ? 'امسح للزيارة والمشاركة' : 'Scan to Visit'}
              </span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-[#9EABA7]">
              <li className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{isRtl ? 'أصلي 100% دار رحيق' : '100% Authentic Raheeq'}</span>
              </li>
              <li>{isRtl ? 'معاينة الطرد عند الباب قبل السداد' : 'Visual Inspection Upon Delivery'}</li>
            </ul>
          </div>

        </div>

        {/* AI Transparency & Accuracy Legal Notice Banner */}
        <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-[#0E1413] border border-[#2DD4BF]/25 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#A2ADA9]">
          <div className="flex items-start sm:items-center gap-3">
            <span className="p-2.5 rounded-xl bg-[#141A19] border border-[#2DD4BF]/30 text-[#54d1b2] flex-shrink-0 mt-0.5 sm:mt-0 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </span>
            <div className="space-y-1">
              <p className="leading-relaxed text-[11px] sm:text-xs">
                <strong className="text-white font-bold ml-1">
                  {isRtl ? 'إشعار الشفافية ومحتوى الذكاء الاصطناعي (AI Disclosure):' : 'AI Transparency & Legal Notice:'}
                </strong>
                {isRtl
                  ? 'جميع البيانات والأوصاف الإبداعية وتوليفات النوتات العطرية المعروضة على هذا الموقع تم توليدها وصياغتها بالاستعانة بتقنيات الذكاء الاصطناعي وتحتمل نسبة من السهو أو الخطأ غير المقصود. المواصفات المعتمدة هي المنتج الفعلي مع حقك الكامل في المعاينة عند الاستلام قبل السداد.'
                  : 'Creative fragrance narratives, accords, and pyramids on this site are synthesized using Artificial Intelligence and may contain unintentional inaccuracies. Delivered flacons verified at your doorstep represent the binding specification.'}
              </p>
            </div>
          </div>
          <Link
            href="/terms"
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-[#141A19] hover:bg-[#1A2624] text-[#54d1b2] hover:text-white border border-[#2DD4BF]/40 transition-colors font-bold text-xs whitespace-nowrap"
          >
            {isRtl ? 'وثيقة الشروط والسياسات ←' : 'Read Terms & Policies ←'}
          </Link>
        </div>

        {/* Bottom Bar: Copyright and National Service Badges */}
        <div className="mt-8 pt-8 border-t border-[#1A2624] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6C7A77] gap-4">
          <p>
            &copy; {new Date().getFullYear()} {isRtl ? 'رَحِـيـقْ | RAHEEQ Haute Parfumerie (دار رحيق للعطور الفاخرة). جميع الحقوق محفوظة.' : 'RAHEEQ Haute Parfumerie Cairo. All rights reserved.'}
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[#9EABA7]">{isRtl ? 'العملة: الجنيه المصري (EGP)' : 'Currency: Egyptian Pound (EGP)'}</span>
            <span className="text-[#9EABA7]">{isRtl ? 'التوصيل: جميع محافظات مصر' : 'Delivery: Across All Egypt Governorates'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
