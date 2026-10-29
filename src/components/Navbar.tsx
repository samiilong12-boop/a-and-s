'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, X, Globe, Phone, Sparkles, FlaskConical } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCustomRequest } from '@/context/CustomRequestContext';
import { useFragranceFinder } from '@/context/FragranceFinderContext';
import { useSiteContent } from '@/context/SiteContentContext';

export function Navbar() {
  const { itemCount, setIsCartOpen } = useCart();
  const { language, toggleLanguage, t, isRtl } = useLanguage();
  const { openModal } = useCustomRequest();
  const { openFinder } = useFragranceFinder();
  const { siteContent } = useSiteContent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoUrl = siteContent.brandLogoUrl || '/images/raheeq-official-logo.png';
  const shapeClass =
    siteContent.brandLogoShape === 'square'
      ? 'rounded-none'
      : siteContent.brandLogoShape === 'rounded'
      ? 'rounded-xl'
      : 'rounded-full';

  const borderClass =
    siteContent.brandLogoBorder === 'turquoise'
      ? 'border-[#54d1b2] shadow-[0_0_12px_rgba(84,209,178,0.3)]'
      : siteContent.brandLogoBorder === 'none'
      ? 'border-transparent'
      : siteContent.brandLogoBorder === 'subtle'
      ? 'border-white/20'
      : 'border-[#D4AF37]/60';

  return (
    <header className="sticky top-0 z-40 bg-[#F7F5EE]/95 backdrop-blur-md border-b border-[#E7E3D6] shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#080A0A] hover:text-[#0D9488] p-2 focus:outline-none transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo with Royal Crest & Signature Turquoise Gemstone Dot */}
          <div className="flex-1 md:flex-none flex justify-center md:justify-start">
            <Link href="/" className="group flex items-center gap-3">
              <div className={`w-11 h-11 ${shapeClass} border ${borderClass} bg-[#080A0A] flex items-center justify-center shadow-md group-hover:border-[#54d1b2] group-hover:shadow-[0_0_12px_rgba(84,209,178,0.3)] transition-all flex-shrink-0 overflow-hidden`}>
                <img
                  src={logoUrl}
                  alt="Raheeq Royal Emblem"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col items-start">
                <div className="flex items-center">
                  <span className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.18em] text-[#080A0A] group-hover:text-[#00bc7d] transition-colors">
                    رَحِيقْ
                  </span>
                  <span className="font-sans text-xs tracking-[0.25em] text-[#C6A66B] font-extrabold mx-1.5 uppercase">
                    RAHEEQ
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#54d1b2] shadow-[0_0_8px_#54d1b2] mb-1 animate-pulse" />
                </div>
                <span className="text-[9px] tracking-[0.35em] text-[#C6A66B] uppercase font-sans font-bold -mt-0.5">
                  Haute Parfumerie
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-xs lg:text-sm font-bold tracking-wider uppercase text-[#4A5553]">
            <Link
              href="/catalog"
              className="hover:text-[#080A0A] hover:border-b-2 hover:border-[#54d1b2] transition-all py-2"
            >
              {t('nav.all_fragrances')}
            </Link>
            <Link
              href="/catalog?family=Oriental+Woody"
              className="hover:text-[#080A0A] hover:border-b-2 hover:border-[#54d1b2] transition-all py-2"
            >
              {t('nav.oud_woods')}
            </Link>
            <Link
              href="/catalog?family=Floral+Amber"
              className="hover:text-[#080A0A] hover:border-b-2 hover:border-[#54d1b2] transition-all py-2"
            >
              {t('nav.floral_amber')}
            </Link>
            <Link
              href="/#brand-story"
              className="hover:text-[#080A0A] hover:border-b-2 hover:border-[#54d1b2] transition-all py-2"
            >
              {t('nav.brand_story')}
            </Link>
            <Link
              href="/track-order"
              className="hover:text-[#080A0A] transition-colors py-2 text-xs text-[#788784]"
            >
              {t('nav.track_order')}
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* AI Fragrance Finder Button */}
            <button
              onClick={() => openFinder()}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#00bc7d]/10 via-[#54d1b2]/15 to-[#D4AF37]/15 text-[#006e49] hover:text-[#080A0A] border border-[#00bc7d]/30 text-xs font-bold transition-all shadow-xs hover:border-[#54d1b2] hover:shadow-[0_0_12px_rgba(84,209,178,0.25)]"
              title={language === 'ar' ? 'اختبار العطر الذكي التفاعلي' : 'AI Fragrance Finder'}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00bc7d] animate-pulse" />
              <span>{isRtl ? 'كاشف العطر الذكي' : 'Fragrance Matcher'}</span>
            </button>

            {/* Custom Fragrance / Bespoke Blend Request Button */}
            <button
              onClick={() => openModal()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#080A0A] text-[#54d1b2] hover:text-white border border-[#54d1b2]/40 text-xs font-bold transition-all shadow-xs hover:border-[#54d1b2] hover:shadow-[0_0_12px_rgba(84,209,178,0.3)]"
              title={language === 'ar' ? 'اطلب عطر معين أو خلطة خاصة' : 'Request Bespoke Scent'}
            >
              <FlaskConical className="w-3.5 h-3.5 text-[#54d1b2]" />
              <span>{language === 'ar' ? 'اطلب عطرك الخاص' : 'Bespoke Blend'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D5CFBF] hover:border-[#54d1b2] text-xs font-bold text-[#080A0A] hover:text-[#00bc7d] transition-all bg-white/90 shadow-2xs"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#54d1b2]" />
              <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Catalog Search */}
            <Link
              href="/catalog"
              className="p-2 text-[#4A5553] hover:text-[#080A0A] transition-colors"
              title={t('nav.search_placeholder')}
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Shopping Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#080A0A] hover:text-[#00bc7d] transition-colors"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#080A0A] text-[#54d1b2] border border-[#54d1b2]/50 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F7F5EE] border-b border-[#E7E3D6] px-4 pt-3 pb-6 space-y-3 shadow-xl">
          {/* Bespoke Request Mobile Button */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openModal();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#080A0A] text-[#54d1b2] font-bold text-xs uppercase tracking-wider border border-[#54d1b2]/40 shadow-sm"
          >
            <FlaskConical className="w-4 h-4 text-[#54d1b2]" />
            <span>{language === 'ar' ? 'اطلب عطر معين أو خلطة خاصة' : 'Request Bespoke Perfume / Blend'}</span>
          </button>

          {/* Mobile AI Fragrance Finder Button */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openFinder();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00bc7d]/20 to-[#54d1b2]/20 text-[#006e49] font-bold text-xs uppercase tracking-wider border border-[#00bc7d]/40 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-[#00bc7d]" />
            <span>{language === 'ar' ? '✨ اختبار العطر الذكي (كاشف الذوق)' : '✨ AI Fragrance Finder Quiz'}</span>
          </button>

          <Link
            href="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#080A0A] hover:text-[#0D9488] py-2 text-base font-bold tracking-wide"
          >
            {t('nav.all_fragrances')}
          </Link>
          <Link
            href="/catalog?family=Oriental+Woody"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#4A5553] hover:text-[#080A0A] py-2 text-sm font-semibold"
          >
            {t('nav.oud_woods')}
          </Link>
          <Link
            href="/catalog?family=Floral+Amber"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#4A5553] hover:text-[#080A0A] py-2 text-sm font-semibold"
          >
            {t('nav.floral_amber')}
          </Link>
          <Link
            href="/#brand-story"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#4A5553] hover:text-[#080A0A] py-2 text-sm font-semibold"
          >
            {t('nav.brand_story')}
          </Link>
          <div className="pt-3 border-t border-[#E7E3D6] flex items-center justify-between">
            <Link
              href="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-[#0D9488] font-bold"
            >
              {t('nav.track_order')}
            </Link>

            <button
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              className="text-xs font-bold text-[#080A0A] flex items-center gap-1 hover:text-[#0D9488]"
            >
              <Globe className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>{language === 'ar' ? 'English' : 'اللغة العربية'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
