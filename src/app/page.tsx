'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Sparkles,
  Compass,
  ShieldCheck,
  Star,
  Droplets,
  Play,
  Pause,
  Crown,
} from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { useLanguage } from '@/context/LanguageContext';
import { FRAGRANCE_FAMILIES } from '@/lib/data/products';
import { ProductCard } from '@/components/ProductCard';

export default function HomePage() {
  const { products } = useProducts();
  const { t, isRtl } = useLanguage();
  const [selectedFamily, setSelectedFamily] = useState('All');
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  // Featured & Bestsellers
  const bestsellers = products.filter((p) => p.isBestseller).slice(0, 4);
  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 4);

  // Filtered preview
  const familyProducts = selectedFamily === 'All'
    ? products.slice(0, 4)
    : products.filter((p) => p.fragranceFamily === selectedFamily).slice(0, 4);

  return (
    <div className="space-y-24 sm:space-y-32 bg-white">
      
      {/* 1. CINEMATIC ROYAL HERO SECTION: MODEL SPRAYING A AND S PERFUME */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 border-b border-[#E8E6DF]">
        
        {/* Background Visual Layer: Model spraying A AND S perfume image & video */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Main Visual: High-fashion Model in tuxedo spraying A AND S perfume */}
          <img
            src="/images/model-spray-perfume.svg"
            alt="Haute Couture Model spraying A AND S Luxury Perfume"
            className="w-full h-full object-cover scale-105 filter brightness-[0.45] contrast-125 transition-transform duration-1000"
          />

          {/* Video Overlay with ambient mist & lighting */}
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-35 filter contrast-150"
          >
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-perfume-bottle-and-rose-petals-falling-41589-large.mp4"
              type="video/mp4"
            />
          </video>

          {/* Luxury Gradient Dark & Golden Overlays for Flawless Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D0D] via-[#0A0D0D]/60 to-[#0A0D0D]/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0A0D0D]/40 to-[#0A0D0D]" />
        </div>

        {/* Video & Visual Control Badge */}
        <div className={`absolute bottom-6 ${isRtl ? 'right-6' : 'left-6'} z-20 flex items-center gap-2.5 bg-[#0A0D0D]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#B8934A]/40 text-[11px] text-[#F5F2EB] shadow-xl`}>
          <button
            onClick={toggleVideoPlayback}
            className="text-[#66D9C5] hover:text-[#82E2D1] flex items-center gap-1.5 font-bold"
            aria-label="Toggle Hero Background Video"
          >
            {isVideoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isVideoPlaying ? (isRtl ? 'إيقاف الرذاذ' : 'Pause Mist') : (isRtl ? 'تشغيل الرذاذ' : 'Play Mist')}</span>
          </button>
          <span className="text-[#6C7A77]">•</span>
          <span className="text-[10px] text-[#C6A66B] font-mono tracking-wider">A AND S Campaign Visual</span>
        </div>

        {/* Grand Royal Hero Content */}
        <div className="relative max-w-5xl mx-auto text-center space-y-8 py-24 z-10">
          
          {/* Royal Atelier Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#B8934A]/60 bg-[#0A0D0D]/80 backdrop-blur-md text-[#D4AF37] text-[11px] tracking-[0.25em] uppercase shadow-2xl font-bold">
            <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t('hero.tag')}</span>
          </div>

          {/* Regal Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#FFFFFF] leading-[1.12] max-w-4xl mx-auto drop-shadow-2xl">
            {t('hero.title')}
          </h1>

          {/* Royal Subtitle */}
          <p className="font-sans text-base sm:text-lg md:text-xl text-[#E8E6DF] max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
            {t('hero.subtitle')}
          </p>

          {/* Hero Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/catalog"
              className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#F2DFB3] text-[#0A0D0D] font-bold py-4 px-8 rounded-lg text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <span>{t('hero.cta_explore')}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>

            <Link
              href="/#fragrance-families"
              className="w-full sm:w-auto bg-[#0A0D0D]/80 hover:bg-[#1A2422] text-[#FFFFFF] border border-[#B8934A]/50 py-4 px-8 rounded-lg text-xs tracking-[0.2em] uppercase font-semibold flex items-center justify-center gap-2 backdrop-blur-md transition-all duration-300"
            >
              <Compass className="w-4 h-4 text-[#D4AF37]" />
              <span>{t('hero.cta_guide')}</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-[#B8934A]/30 max-w-3xl mx-auto text-center bg-[#0A0D0D]/60 backdrop-blur-md p-5 rounded-2xl shadow-2xl">
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#FFFFFF]">{products.length}+</p>
              <p className="text-[11px] tracking-wider text-[#D5D1C7] uppercase mt-0.5">{t('stats.compositions')}</p>
            </div>
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#66D9C5]">35%</p>
              <p className="text-[11px] tracking-wider text-[#D5D1C7] uppercase mt-0.5">{t('stats.oil_ratio')}</p>
            </div>
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#D4AF37]">100%</p>
              <p className="text-[11px] tracking-wider text-[#D5D1C7] uppercase mt-0.5">{t('stats.cod')}</p>
            </div>
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#FFFFFF]">24–48h</p>
              <p className="text-[11px] tracking-wider text-[#D5D1C7] uppercase mt-0.5">{t('stats.delivery_time')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BESTSELLERS (White Luxury Canvas) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="badge-gold px-3 py-1 rounded-sm">
              {t('section.bestsellers_tag')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0A0D0D] mt-2">
              {t('section.bestsellers_title')}
            </h2>
            <p className="text-sm text-[#52605D] mt-1 max-w-xl">
              {t('section.bestsellers_desc')}
            </p>
          </div>
          <Link
            href="/catalog?sort=bestselling"
            className="text-xs font-bold tracking-widest text-[#0B665D] hover:text-[#084942] uppercase flex items-center gap-1.5 transition-colors"
          >
            <span>{isRtl ? 'عرض جميع العطور الأكثر طلباً' : 'View All Bestsellers'}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 3. FRAGRANCE FAMILIES EXPLORER (Pearl Surface) */}
      <section id="fragrance-families" className="bg-[#FAFAF7] py-20 border-y border-[#E8E6DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="badge-gold px-3 py-1 rounded-sm">
              {t('section.families_tag')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0A0D0D]">
              {t('section.families_title')}
            </h2>
            <p className="text-sm text-[#52605D]">
              {t('section.families_desc')}
            </p>
          </div>

          {/* Family Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={() => setSelectedFamily('All')}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all ${
                selectedFamily === 'All'
                  ? 'bg-[#0A0D0D] text-white shadow-md'
                  : 'bg-white text-[#52605D] hover:text-[#0A0D0D] border border-[#E8E6DF]'
              }`}
            >
              {isRtl ? 'جميع العائلات' : 'All Families'}
            </button>
            {FRAGRANCE_FAMILIES.map((family) => (
              <button
                key={family}
                onClick={() => setSelectedFamily(family)}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all ${
                  selectedFamily === family
                    ? 'bg-[#0A0D0D] text-white shadow-md'
                    : 'bg-white text-[#52605D] hover:text-[#0A0D0D] border border-[#E8E6DF]'
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
              className="btn-secondary px-8 py-3 rounded-lg text-xs tracking-widest uppercase font-bold inline-flex items-center gap-2"
            >
              <span>{isRtl ? 'تصفح المزيد من هذه المجموعة' : `Explore More in ${selectedFamily === 'All' ? 'Our Catalog' : selectedFamily}`}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. BRAND STORY SECTION */}
      <section id="brand-story" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <span className="badge-gold px-3 py-1 rounded-sm">
              {t('section.story_tag')}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#0A0D0D] leading-tight">
              {t('section.story_title')}
            </h2>
            <p className="text-sm sm:text-base text-[#52605D] leading-relaxed">
              {t('section.story_p1')}
            </p>
            <p className="text-sm sm:text-base text-[#52605D] leading-relaxed">
              {t('section.story_p2')}
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="p-4 bg-[#FAFAF7] border border-[#E8E6DF] rounded-xl shadow-sm">
                <Droplets className="w-5 h-5 text-[#0B665D] mb-2" />
                <h4 className="font-serif font-bold text-sm text-[#0A0D0D]">
                  {isRtl ? 'تركيز إكستري خالص 35%' : 'Pure Extrait Concentration'}
                </h4>
                <p className="text-xs text-[#52605D] mt-1">
                  {isRtl ? 'تركيز زيوت عطرية يصل إلى 35% لثبات يتجاوز 14 ساعة.' : 'Up to 35% concentration offering over 14 hours of persistent trail.'}
                </p>
              </div>

              <div className="p-4 bg-[#FAFAF7] border border-[#E8E6DF] rounded-xl shadow-sm">
                <ShieldCheck className="w-5 h-5 text-[#B8934A] mb-2" />
                <h4 className="font-serif font-bold text-sm text-[#0A0D0D]">
                  {isRtl ? 'معاينة ودفع عند الاستلام' : 'Inspection Before Payment'}
                </h4>
                <p className="text-xs text-[#52605D] mt-1">
                  {isRtl ? 'عاين طردك الفاخر عند وصول المندوب قبل دفع أي مليم.' : 'Door-to-door insured delivery with visual inspection before cash payment.'}
                </p>
              </div>
            </div>
          </div>

          {/* Visual Showcase Block */}
          <div className="relative aspect-square sm:aspect-[4/3] bg-[#0A0D0D] rounded-2xl border border-[#B8934A]/40 p-8 flex flex-col justify-end overflow-hidden shadow-2xl text-white">
            <img
              src="/images/model-spray-perfume.svg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.4]"
            />
            <div className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'}`}>
              <span className="font-serif text-6xl text-[#D4AF37]/20 font-bold">A&S</span>
            </div>
            <div className="space-y-4 max-w-sm relative z-10">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] font-bold">
                {isRtl ? 'فلسفة العطر الفاخر' : 'Signature Philosophy'}
              </span>
              <h3 className="font-serif text-2xl font-bold text-white">
                {isRtl
                  ? '«العطر ليس مجرد لمسة تجميلية، بل هو هالتك غير المرئية التي تبقى في ذاكرة المكان.»'
                  : '“A fragrance is not an accessory. It is your invisible aura.”'}
              </h3>
              <p className="text-xs text-[#D5D1C7]">
                {isRtl ? 'خبير العطور والمؤسس، دار A AND S' : 'Master Perfumer & Founder, A AND S Fragrance House'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="badge-gold px-3 py-1 rounded-sm">
              {t('section.new_arrivals_tag')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0A0D0D] mt-2">
              {t('section.new_arrivals_title')}
            </h2>
            <p className="text-sm text-[#52605D] mt-1 max-w-xl">
              {t('section.new_arrivals_desc')}
            </p>
          </div>
          <Link
            href="/catalog?sort=newest"
            className="text-xs font-bold tracking-widest text-[#0B665D] hover:text-[#084942] uppercase flex items-center gap-1.5 transition-colors"
          >
            <span>{isRtl ? 'عرض جميع العطور الجديدة' : 'View All New Releases'}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
