'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Compass, ShieldCheck, Star, Heart, Droplets } from 'lucide-react';
import { DEMO_PRODUCTS, FRAGRANCE_FAMILIES } from '@/lib/data/products';
import { ProductCard } from '@/components/ProductCard';
import { formatPrice } from '@/lib/currency';

export default function HomePage() {
  const [selectedFamily, setSelectedFamily] = useState('All');

  // Featured & Bestsellers
  const bestsellers = DEMO_PRODUCTS.filter((p) => p.isBestseller).slice(0, 4);
  const newArrivals = DEMO_PRODUCTS.filter((p) => p.isNewArrival).slice(0, 4);

  // Filtered preview
  const familyProducts = selectedFamily === 'All'
    ? DEMO_PRODUCTS.slice(8, 12)
    : DEMO_PRODUCTS.filter((p) => p.fragranceFamily === selectedFamily).slice(0, 4);

  return (
    <div className="space-y-24 sm:space-y-32">
      {/* 1. HERO SECTION (Cinematic Editorial) */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-[#0E1212] via-[#080A0A] to-[#080A0A] overflow-hidden px-4 sm:px-6 lg:px-8 border-b border-[#1A2624]">
        {/* Subtle Luxury Ambient Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0B665D] rounded-full blur-[140px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#66D9C5]/30 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-8 py-20 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#C6A66B]/30 bg-[#C6A66B]/5 text-[#C6A66B] text-[11px] tracking-[0.25em] uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Haute Parfumerie • Cairo Edition</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#F5F2EB] leading-[1.1] max-w-4xl mx-auto">
            THE ART OF LEAVING AN IMPRESSION.
          </h1>

          <p className="font-sans text-base sm:text-lg md:text-xl text-[#9EABA7] max-w-2xl mx-auto font-light leading-relaxed">
            Discover a world of distinctive fragrances, crafted for those who make every moment unforgettable. Blended with exceptional oil concentrations for enduring sillage.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/catalog"
              className="w-full sm:w-auto btn-primary py-4 px-8 rounded text-xs tracking-[0.2em] uppercase font-bold flex items-center justify-center gap-3 shadow-2xl"
            >
              <span>Explore The 120 Fragrances</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/#fragrance-families"
              className="w-full sm:w-auto btn-secondary py-4 px-8 rounded text-xs tracking-[0.2em] uppercase font-semibold flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#C6A66B]" />
              <span>Fragrance Notes Guide</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-[#1A2624]/70 max-w-3xl mx-auto text-center">
            <div>
              <p className="font-serif text-2xl font-bold text-[#F5F2EB]">120+</p>
              <p className="text-[11px] tracking-wider text-[#9EABA7] uppercase mt-0.5">Original Compositions</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-bold text-[#66D9C5]">35%</p>
              <p className="text-[11px] tracking-wider text-[#9EABA7] uppercase mt-0.5">Precious Oil Ratio</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-bold text-[#C6A66B]">100%</p>
              <p className="text-[11px] tracking-wider text-[#9EABA7] uppercase mt-0.5">Cash On Delivery</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-bold text-[#F5F2EB]">24–48h</p>
              <p className="text-[11px] tracking-wider text-[#9EABA7] uppercase mt-0.5">Cairo & Giza Delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BESTSELLERS (The Signature Editions) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-semibold tracking-[0.25em] text-[#C6A66B] uppercase">
              Curated Masterpieces
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F5F2EB] mt-2">
              Bestselling Fragrances
            </h2>
            <p className="text-sm text-[#9EABA7] mt-1">
              Our most celebrated creations, acclaimed for their intoxicating complexity and longevity.
            </p>
          </div>
          <Link
            href="/catalog?sort=bestselling"
            className="text-xs font-bold tracking-widest text-[#66D9C5] hover:text-[#82E2D1] uppercase flex items-center gap-1.5 transition-colors"
          >
            <span>View All Bestsellers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 3. FRAGRANCE FAMILIES & NOTES EXPLORER */}
      <section id="fragrance-families" className="bg-[#0E1212] py-20 border-y border-[#1A2624]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold tracking-[0.25em] text-[#66D9C5] uppercase">
              Olfactory Discovery
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F5F2EB]">
              Explore by Fragrance Family
            </h2>
            <p className="text-sm text-[#9EABA7]">
              Each family represents an emotional journey. Filter through our catalogue to uncover scents that mirror your essence.
            </p>
          </div>

          {/* Family Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={() => setSelectedFamily('All')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all ${
                selectedFamily === 'All'
                  ? 'bg-[#66D9C5] text-[#080A0A]'
                  : 'bg-[#141A19] text-[#D5D1C7] hover:text-[#F5F2EB] border border-[#1A2624]'
              }`}
            >
              All Families
            </button>
            {FRAGRANCE_FAMILIES.map((family) => (
              <button
                key={family}
                onClick={() => setSelectedFamily(family)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all ${
                  selectedFamily === family
                    ? 'bg-[#66D9C5] text-[#080A0A]'
                    : 'bg-[#141A19] text-[#D5D1C7] hover:text-[#F5F2EB] border border-[#1A2624]'
                }`}
              >
                {family}
              </button>
            ))}
          </div>

          {/* Products in selected family */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {familyProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center pt-6">
            <Link
              href={selectedFamily === 'All' ? '/catalog' : `/catalog?family=${encodeURIComponent(selectedFamily)}`}
              className="btn-secondary px-8 py-3 rounded text-xs tracking-widest uppercase font-semibold inline-flex items-center gap-2"
            >
              <span>Explore More in {selectedFamily === 'All' ? 'Our Catalog' : selectedFamily}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. BRAND STORY SECTION */}
      <section id="brand-story" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <span className="badge-gold px-3 py-1 rounded-sm font-semibold">
              Artisanal Heritage & Vision
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#F5F2EB] leading-tight">
              Crafted in Cairo for the Discerning Connoisseur.
            </h2>
            <p className="text-sm sm:text-base text-[#9EABA7] leading-relaxed">
              At **A AND S**, we reject fleeting synthetic trends in favor of timeless perfume architecture. Founded in Cairo, our atelier unites ancient Egyptian botanical heritage—where fragrance was first revered as a sacred art—with contemporary French Haute Parfumerie.
            </p>
            <p className="text-sm sm:text-base text-[#9EABA7] leading-relaxed">
              Every creation is aged through a meticulous maceration process of over 60 days, ensuring that rare Damascus roses, smoked aged agarwood, and ethically sourced ambergris marry in perfect equilibrium.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="p-4 bg-[#111716] border border-[#1A2624] rounded">
                <Droplets className="w-5 h-5 text-[#66D9C5] mb-2" />
                <h4 className="font-serif font-bold text-sm text-[#F5F2EB]">Pure Extrait Concentration</h4>
                <p className="text-xs text-[#6C7A77] mt-1">Up to 35% concentration offering over 14 hours of persistent trail.</p>
              </div>

              <div className="p-4 bg-[#111716] border border-[#1A2624] rounded">
                <ShieldCheck className="w-5 h-5 text-[#C6A66B] mb-2" />
                <h4 className="font-serif font-bold text-sm text-[#F5F2EB]">Direct To Doorstep in Egypt</h4>
                <p className="text-xs text-[#6C7A77] mt-1">Door-to-door temperature controlled shipping with cash on delivery.</p>
              </div>
            </div>
          </div>

          {/* Visual Showcase Block */}
          <div className="relative aspect-square sm:aspect-[4/3] bg-gradient-to-tr from-[#111716] via-[#141A19] to-[#0B665D]/30 rounded-2xl border border-[#1A2624] p-8 flex flex-col justify-end overflow-hidden shadow-2xl">
            <div className="absolute top-6 right-6">
              <span className="font-serif text-6xl text-[#66D9C5]/10 font-bold">A&S</span>
            </div>
            <div className="space-y-4 max-w-sm relative z-10">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#C6A66B] font-bold">Signature Philosophy</span>
              <h3 className="font-serif text-2xl font-bold text-[#F5F2EB]">
                &ldquo;A fragrance is not an accessory. It is your invisible aura.&rdquo;
              </h3>
              <p className="text-xs text-[#9EABA7]">
                Master Perfumer & Founder, A AND S Fragrance House
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-semibold tracking-[0.25em] text-[#66D9C5] uppercase">
              Fresh From The Atelier
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F5F2EB] mt-2">
              New Arrivals
            </h2>
            <p className="text-sm text-[#9EABA7] mt-1">
              Newly bottled limited releases and contemporary scent profiles.
            </p>
          </div>
          <Link
            href="/catalog?sort=newest"
            className="text-xs font-bold tracking-widest text-[#66D9C5] hover:text-[#82E2D1] uppercase flex items-center gap-1.5 transition-colors"
          >
            <span>View All New Releases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. CLIENT TESTIMONIALS (Genuine Luxury Experience) */}
      <section className="bg-[#0E1212] py-20 border-t border-[#1A2624]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold tracking-[0.25em] text-[#C6A66B] uppercase">
              Client Testimonials
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#F5F2EB]">
              What Our Connoisseurs Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#111716] border border-[#1A2624] rounded-lg space-y-4">
              <div className="flex text-[#C6A66B]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C6A66B]" />
                ))}
              </div>
              <p className="text-sm text-[#D5D1C7] leading-relaxed italic">
                &ldquo;A AND S Royal Sovereign Oud is easily on par with international niche houses like Clive Christian or Roja, but with an authentic Egyptian warmth. Delivered in 24 hours to Zamalek with cash on delivery.&rdquo;
              </p>
              <div className="pt-2 border-t border-[#1A2624]">
                <p className="font-serif font-bold text-sm text-[#F5F2EB]">Dr. Kareem S.</p>
                <p className="text-xs text-[#6C7A77]">Cairo, Egypt</p>
              </div>
            </div>

            <div className="p-6 bg-[#111716] border border-[#1A2624] rounded-lg space-y-4">
              <div className="flex text-[#C6A66B]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C6A66B]" />
                ))}
              </div>
              <p className="text-sm text-[#D5D1C7] leading-relaxed italic">
                &ldquo;The Saffron Mirage smells intoxicating. The sillage lasts on my scarves for days. Being able to inspect the package before paying the courier gave me immense confidence.&rdquo;
              </p>
              <div className="pt-2 border-t border-[#1A2624]">
                <p className="font-serif font-bold text-sm text-[#F5F2EB]">Nourhan El-Alfy</p>
                <p className="text-xs text-[#6C7A77]">Alexandria, Egypt</p>
              </div>
            </div>

            <div className="p-6 bg-[#111716] border border-[#1A2624] rounded-lg space-y-4">
              <div className="flex text-[#C6A66B]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C6A66B]" />
                ))}
              </div>
              <p className="text-sm text-[#D5D1C7] leading-relaxed italic">
                &ldquo;Packaging is heavy, opulent, and unmistakably premium. Beautiful tactile experience. A AND S is redefining modern Egyptian luxury fragrance.&rdquo;
              </p>
              <div className="pt-2 border-t border-[#1A2624]">
                <p className="font-serif font-bold text-sm text-[#F5F2EB]">Tarek Mansour</p>
                <p className="text-xs text-[#6C7A77]">New Cairo, Egypt</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PROMOTIONAL CALLOUT (Complimentary Shipping in Egypt) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0B665D]/30 via-[#111716] to-[#080A0A] p-8 sm:p-12 rounded-2xl border border-[#1A2624] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <span className="badge-gold px-3 py-1 rounded-sm font-semibold">
              Complimentary Doorstep Delivery
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5F2EB]">
              Complimentary Luxury Shipping Across All Egyptian Governorates
            </h3>
            <p className="text-sm text-[#9EABA7] max-w-xl">
              Enjoy free courier delivery to Cairo, Giza, Alexandria, Delta, and Upper Egypt on every order over 1,000 EGP. Pay conveniently in cash when your order arrives.
            </p>
          </div>
          <Link
            href="/catalog"
            className="btn-primary py-3.5 px-8 rounded text-xs tracking-widest uppercase font-bold flex-shrink-0"
          >
            Shop The Catalog
          </Link>
        </div>
      </section>
    </div>
  );
}
