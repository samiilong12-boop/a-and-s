'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, X, Globe, Phone } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export function Navbar() {
  const { itemCount, setIsCartOpen } = useCart();
  const { language, toggleLanguage, t, isRtl } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E6DF] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#0A0D0D] hover:text-[#0B665D] p-2 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo (Regal Black & Gold) */}
          <div className="flex-1 md:flex-none flex justify-center md:justify-start">
            <Link href="/" className="group flex flex-col items-center md:items-start">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.25em] text-[#0A0D0D] group-hover:text-[#0B665D] transition-colors">
                A AND S
              </span>
              <span className="text-[9px] tracking-[0.35em] text-[#B8934A] uppercase font-sans font-bold -mt-1">
                Haute Parfumerie
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-xs lg:text-sm font-bold tracking-wider uppercase text-[#4A5553]">
            <Link
              href="/catalog"
              className="hover:text-[#0B665D] transition-colors py-2"
            >
              {t('nav.all_fragrances')}
            </Link>
            <Link
              href="/catalog?family=Oriental+Woody"
              className="hover:text-[#0B665D] transition-colors py-2"
            >
              {t('nav.oud_woods')}
            </Link>
            <Link
              href="/catalog?family=Floral+Amber"
              className="hover:text-[#0B665D] transition-colors py-2"
            >
              {t('nav.floral_amber')}
            </Link>
            <Link
              href="/#brand-story"
              className="hover:text-[#0B665D] transition-colors py-2"
            >
              {t('nav.brand_story')}
            </Link>
            <Link
              href="/track-order"
              className="hover:text-[#0B665D] transition-colors py-2 text-xs text-[#788784]"
            >
              {t('nav.track_order')}
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E8E6DF] hover:border-[#0B665D] text-xs font-bold text-[#0A0D0D] hover:text-[#0B665D] transition-all bg-[#FAFAF7]"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#B8934A]" />
              <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Catalog Search */}
            <Link
              href="/catalog"
              className="p-2 text-[#4A5553] hover:text-[#0B665D] transition-colors"
              title={t('nav.search_placeholder')}
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Shopping Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#0A0D0D] hover:text-[#0B665D] transition-colors"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#0A0D0D] text-[#FFFFFF] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E8E6DF] px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <Link
            href="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#0A0D0D] hover:text-[#0B665D] py-2 text-base font-bold tracking-wide"
          >
            {t('nav.all_fragrances')}
          </Link>
          <Link
            href="/catalog?family=Oriental+Woody"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#4A5553] hover:text-[#0B665D] py-2 text-sm font-semibold"
          >
            {t('nav.oud_woods')}
          </Link>
          <Link
            href="/catalog?family=Floral+Amber"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#4A5553] hover:text-[#0B665D] py-2 text-sm font-semibold"
          >
            {t('nav.floral_amber')}
          </Link>
          <Link
            href="/#brand-story"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#4A5553] hover:text-[#0B665D] py-2 text-sm font-semibold"
          >
            {t('nav.brand_story')}
          </Link>
          <div className="pt-3 border-t border-[#E8E6DF] flex items-center justify-between">
            <Link
              href="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-[#0B665D] font-bold"
            >
              {t('nav.track_order')}
            </Link>

            <button
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              className="text-xs font-bold text-[#B8934A] flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'English' : 'اللغة العربية'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
