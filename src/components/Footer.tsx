'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, Clock, Phone, MapPin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#080A0A] border-t border-[#1A2624] text-[#F5F2EB] mt-20">
      {/* Brand Values / Value Proposition Bar */}
      <div className="border-b border-[#1A2624] py-10 bg-[#0E1212]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#141A19] border border-[#1A2624] flex items-center justify-center text-[#66D9C5] flex-shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#F5F2EB]">Complimentary Egypt Shipping</h4>
                <p className="text-xs text-[#9EABA7] mt-0.5">Free luxury courier delivery on orders over 1,000 EGP.</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#141A19] border border-[#1A2624] flex items-center justify-center text-[#C6A66B] flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#F5F2EB]">Cash on Delivery (COD)</h4>
                <p className="text-xs text-[#9EABA7] mt-0.5">Inspect your fragrance upon delivery before handing payment.</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#141A19] border border-[#1A2624] flex items-center justify-center text-[#66D9C5] flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#F5F2EB]">Precious Oil Formulations</h4>
                <p className="text-xs text-[#9EABA7] mt-0.5">High concentration extrait and EDP for unmatched sillage.</p>
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
              &ldquo;The art of leaving an impression.&rdquo; Discover a world of distinctive fragrances, crafted for those who make every moment unforgettable.
            </p>
            <div className="space-y-2 text-xs text-[#9EABA7] pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#66D9C5]" />
                <span>Cairo, Egypt</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#66D9C5]" />
                <span>+20 10 1234 5678 (WhatsApp Support)</span>
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
              Collections
            </h5>
            <ul className="space-y-2 text-xs text-[#9EABA7]">
              <li>
                <Link href="/catalog" className="hover:text-[#66D9C5] transition-colors">
                  All 120 Fragrances
                </Link>
              </li>
              <li>
                <Link href="/catalog?family=Oriental+Woody" className="hover:text-[#66D9C5] transition-colors">
                  Oriental Woody & Oud
                </Link>
              </li>
              <li>
                <Link href="/catalog?family=Floral+Amber" className="hover:text-[#66D9C5] transition-colors">
                  Floral Amber
                </Link>
              </li>
              <li>
                <Link href="/catalog?family=Smoky+Oud+%26+Leather" className="hover:text-[#66D9C5] transition-colors">
                  Smoky Leather
                </Link>
              </li>
              <li>
                <Link href="/catalog?family=Fresh+Citrus+%26+Aquatic" className="hover:text-[#66D9C5] transition-colors">
                  Fresh Citrus & Aquatic
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h5 className="font-serif text-sm font-semibold text-[#F5F2EB] tracking-wider uppercase">
              Client Care
            </h5>
            <ul className="space-y-2 text-xs text-[#9EABA7]">
              <li>
                <Link href="/track-order" className="hover:text-[#66D9C5] transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/#shipping-policy" className="hover:text-[#66D9C5] transition-colors">
                  Shipping Across Egypt
                </Link>
              </li>
              <li>
                <Link href="/#returns" className="hover:text-[#66D9C5] transition-colors">
                  Returns & Exchange Policy
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#C6A66B] transition-colors">
                  Staff & Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-3">
            <h5 className="font-serif text-sm font-semibold text-[#F5F2EB] tracking-wider uppercase">
              The Private Club
            </h5>
            <p className="text-xs text-[#9EABA7]">
              Subscribe to receive exclusive invitations to private launches and private batches.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-[#111716] border border-[#1A2624] rounded px-3 py-2 text-xs text-[#F5F2EB] placeholder-[#6C7A77] focus:outline-none focus:border-[#66D9C5]"
              />
              <button
                type="submit"
                className="w-full btn-primary text-xs py-2 rounded font-semibold tracking-wider uppercase"
              >
                Join Private List
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[#1A2624] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6C7A77] gap-4">
          <p>© {new Date().getFullYear()} A AND S Haute Parfumerie. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Egyptian Pound (EGP)</span>
            <span>•</span>
            <span>Cash on Delivery</span>
            <span>•</span>
            <span className="text-[#C6A66B]">Cairo, Egypt</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
