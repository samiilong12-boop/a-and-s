'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, X, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function Navbar() {
  const { itemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#080A0A]/95 backdrop-blur-md border-b border-[#1A2624]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#F5F2EB] hover:text-[#66D9C5] p-2 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 md:flex-none flex justify-center md:justify-start">
            <Link href="/" className="group flex flex-col items-center md:items-start">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.25em] text-[#F5F2EB] group-hover:text-[#66D9C5] transition-colors">
                A AND S
              </span>
              <span className="text-[9px] tracking-[0.35em] text-[#C6A66B] uppercase font-sans -mt-1">
                Haute Parfumerie
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wider uppercase text-[#D5D1C7]">
            <Link
              href="/catalog"
              className="hover:text-[#66D9C5] transition-colors py-2"
            >
              All Fragrances
            </Link>
            <Link
              href="/catalog?family=Oriental+Woody"
              className="hover:text-[#66D9C5] transition-colors py-2"
            >
              Oud & Woods
            </Link>
            <Link
              href="/catalog?family=Floral+Amber"
              className="hover:text-[#66D9C5] transition-colors py-2"
            >
              Floral Amber
            </Link>
            <Link
              href="/#brand-story"
              className="hover:text-[#66D9C5] transition-colors py-2"
            >
              Brand Story
            </Link>
            <Link
              href="/track-order"
              className="hover:text-[#66D9C5] transition-colors py-2 text-xs text-[#9EABA7]"
            >
              Track Order
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            <Link
              href="/catalog"
              className="p-2 text-[#D5D1C7] hover:text-[#66D9C5] transition-colors"
              title="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </Link>

            <Link
              href="/admin"
              className="hidden lg:flex items-center gap-1 text-xs text-[#9EABA7] hover:text-[#C6A66B] px-2.5 py-1 rounded border border-[#1A2624] hover:border-[#C6A66B]/40 transition-colors"
              title="Administration Dashboard"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#C6A66B]" />
              <span>Admin</span>
            </Link>

            {/* Shopping Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#F5F2EB] hover:text-[#66D9C5] transition-colors"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#66D9C5] text-[#080A0A] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0E1212] border-b border-[#1A2624] px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#F5F2EB] hover:text-[#66D9C5] py-2 text-base font-medium tracking-wide"
          >
            All Fragrances (120 Items)
          </Link>
          <Link
            href="/catalog?family=Oriental+Woody"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#D5D1C7] hover:text-[#66D9C5] py-2 text-sm"
          >
            Oriental Woody & Oud
          </Link>
          <Link
            href="/catalog?family=Floral+Amber"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#D5D1C7] hover:text-[#66D9C5] py-2 text-sm"
          >
            Floral & Amber
          </Link>
          <Link
            href="/catalog?family=Fresh+Citrus+%26+Aquatic"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#D5D1C7] hover:text-[#66D9C5] py-2 text-sm"
          >
            Fresh Citrus & Aquatic
          </Link>
          <Link
            href="/#brand-story"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#D5D1C7] hover:text-[#66D9C5] py-2 text-sm"
          >
            Our Brand Story
          </Link>
          <div className="pt-3 border-t border-[#1A2624] flex items-center justify-between">
            <Link
              href="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-[#66D9C5] font-medium"
            >
              Track Your Order
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-[#C6A66B]"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
