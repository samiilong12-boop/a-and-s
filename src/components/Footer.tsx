'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, Clock, Phone, MapPin, Mail, Lock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function Footer() {
  const { t, isRtl } = useLanguage();

  return (
    <footer className="bg-[#080A0A] border-t border-[#1A2624] text-[#F5F2EB] mt-20">
      {/* Brand Values Bar */}
      <div className="border-b border-[#1A2624] py-10 bg-[#0E1212]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#141A19] border border-[#1A2624] flex items-center justify-center text-[#66D9C5] flex-shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#F5F2EB]">
                  {isRtl ? 'شحن فاخر مجاني لجميع محافظات مصر' : 'Complimentary Egypt Shipping'}
                </h4>
                <p className="text-xs text-[#9EABA7] mt-0.5">
                  {isRtl ? 'توصيل مجاني لجميع الطلبات فوق 1,000 جنيه مصري.' : 'Free luxury courier delivery on orders over 1,000 EGP.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#141A19] border border-[#1A2624] flex items-center justify-center text-[#C6A66B] flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#F5F2EB]">
                  {isRtl ? 'الدفع نقداً عند الاستلام والمعاينة' : 'Cash on Delivery (COD)'}
                </h4>
                <p className="text-xs text-[#9EABA7] mt-0.5">
                  {isRtl ? 'عاين طردك الفاخر عند وصول المندوب قبل دفع أي مليم.' : 'Inspect your fragrance upon delivery before handing payment.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#141A19] border border-[#1A2624] flex items-center justify-center text-[#66D9C5] flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#F5F2EB]">
                  {isRtl ? 'تركيز زيوت عطرية نقية 35%' : 'Precious Oil Formulations'}
                </h4>
                <p className="text-xs text-[#9EABA7] mt-0.5">
                  {isRtl ? 'إكستري دي بارفان لثبات استثنائي يتجاوز 14 ساعة.' : 'High concentration extrait and EDP for unmatched sillage.'}
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
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-[0.25em] text-[#F5F2EB]">
                A AND S
              </span>
              <p className="text-[10px] tracking-[0.35em] text-[#C6A66B] uppercase font-sans">
                Haute Parfumerie
              </p>
            </Link>
            <p className="text-sm text-[#9EABA7] max-w-sm leading-relaxed">
              &ldquo;{isRtl ? 'فن ترك الانطباع الذي لا يُنسى' : 'The art of leaving an impression'}.&rdquo; {isRtl ? 'اكتشف عالماً من العطور الفاخرة المصنوعة في القاهرة لمن يبحثون عن التميز الدائم.' : 'Discover a world of distinctive fragrances, crafted for those who make every moment unforgettable.'}
            </p>
            <div className="space-y-2 text-xs text-[#9EABA7] pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#66D9C5]" />
                <span>{isRtl ? 'معمل العطور — القاهرة، جمهورية مصر العربية' : 'Cairo Atelier, Egypt'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#66D9C5]" />
                <a href="tel:+201012345678" className="hover:text-[#66D9C5]">
                  +20 10 1234 5678 (WhatsApp & Calls)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#66D9C5]" />
                <span>concierge@aandsfragrance.com</span>
              </div>
            </div>
          </div>

          {/* Catalog Links */}
          <div className="space-y-3">
            <h5 className="font-serif text-sm font-semibold text-[#F5F2EB] tracking-wider uppercase">
              {isRtl ? 'المجموعات العطرية' : 'Collections'}
            </h5>
            <ul className="space-y-2 text-xs text-[#9EABA7]">
              <li>
                <Link href="/catalog" className="hover:text-[#66D9C5] transition-colors">
                  {t('nav.all_fragrances')}
                </Link>
              </li>
              <li>
                <Link href="/catalog?family=Oriental+Woody" className="hover:text-[#66D9C5] transition-colors">
                  {t('nav.oud_woods')}
                </Link>
              </li>
              <li>
                <Link href="/catalog?family=Floral+Amber" className="hover:text-[#66D9C5] transition-colors">
                  {t('nav.floral_amber')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h5 className="font-serif text-sm font-semibold text-[#F5F2EB] tracking-wider uppercase">
              {isRtl ? 'خدمة العملاء والتوصيل' : 'Client Care'}
            </h5>
            <ul className="space-y-2 text-xs text-[#9EABA7]">
              <li>
                <Link href="/track-order" className="hover:text-[#66D9C5] transition-colors">
                  {t('nav.track_order')}
                </Link>
              </li>
              <li>
                <a href="https://wa.me/201012345678" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 text-emerald-400 font-semibold transition-colors">
                  {isRtl ? 'واتساب مباشر: 01012345678' : 'WhatsApp Concierge'}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-3">
            <h5 className="font-serif text-sm font-semibold text-[#F5F2EB] tracking-wider uppercase">
              {isRtl ? 'النادي الخاص' : 'The Private Club'}
            </h5>
            <p className="text-xs text-[#9EABA7]">
              {isRtl ? 'اشترك لتصلك دعوات إطلاق الدفعات العطرية المحدودة والخاصة.' : 'Subscribe to receive invitations to private launches.'}
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <input
                type="email"
                placeholder={isRtl ? 'بريدك الإلكتروني' : 'Your email address'}
                className="w-full bg-[#111716] border border-[#1A2624] rounded px-3 py-2 text-xs text-[#F5F2EB] placeholder-[#6C7A77] focus:outline-none focus:border-[#66D9C5]"
              />
              <button
                type="submit"
                className="w-full btn-primary text-xs py-2 rounded font-semibold tracking-wider uppercase"
              >
                {isRtl ? 'انضمام للقائمة الخاصة' : 'Join Private List'}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar with discrete owner access */}
        <div className="mt-16 pt-8 border-t border-[#1A2624] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6C7A77] gap-4">
          <p>© {new Date().getFullYear()} A AND S Haute Parfumerie. All rights reserved.</p>
          <div className="flex items-center gap-4 sm:gap-6">
            <span>Egyptian Pound (EGP)</span>
            <span>•</span>
            <span>Cash on Delivery</span>
            <span>•</span>
            <span className="text-[#C6A66B]">Cairo, Egypt</span>
            <span>•</span>
            {/* Discrete Private Admin Link - only known to owner */}
            <Link
              href="/admin"
              className="text-[#3A4543] hover:text-[#C6A66B] flex items-center gap-1 transition-colors"
              title="Staff & Owner Portal (خاص بالإدارة)"
            >
              <Lock className="w-3 h-3" />
              <span>Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
