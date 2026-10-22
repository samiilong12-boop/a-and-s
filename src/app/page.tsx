'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Compass,
  ShieldCheck,
  Star,
  Droplets,
  Play,
  Pause,
  VolumeX,
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
    <div className="space-y-24 sm:space-y-32">
      
      {/* 1. CINEMATIC HERO SECTION WITH FASHION MODEL PERFUME VIDEO BACKGROUND */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 border-b border-[#1A2624]">
        
        {/* Background Video Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1920&auto=format&fit=crop"
            className="w-full h-full object-cover scale-105 filter brightness-[0.4] contrast-125"
          >
            {/* High quality fashion model & luxury perfume mist video */}
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-perfume-bottle-and-rose-petals-falling-41589-large.mp4"
              type="video/mp4"
            />
            {/* Fallback secondary luxury spray clip */}
            <source
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
              type="video/mp4"
            />
          </video>

          {/* Luxury Gradient Dark Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080A0A] via-[#080A0A]/70 to-[#080A0A]/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#080A0A]/60 to-[#080A0A]" />
        </div>

        {/* Video Control Pill */}
        <div className={`absolute bottom-6 ${isRtl ? 'right-6' : 'left-6'} z-20 flex items-center gap-2 bg-[#080A0A]/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#1A2624] text-[11px] text-[#9EABA7]`}>
          <button
            onClick={toggleVideoPlayback}
            className="text-[#66D9C5] hover:text-[#82E2D1] flex items-center gap-1.5 font-medium"
            aria-label="Toggle Hero Background Video"
          >
            {isVideoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isVideoPlaying ? (isRtl ? 'إيقاف الفيديو' : 'Pause Video') : (isRtl ? 'تشغيل الفيديو' : 'Play Video')}</span>
          </button>
          <span className="text-[#6C7A77]">•</span>
          <span className="text-[10px] text-[#C6A66B]">Haute Couture Campaign</span>
        </div>

        {/* Hero Content */}
        <div className="relative max-w-5xl mx-auto text-center space-y-8 py-24 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C6A66B]/40 bg-[#080A0A]/80 backdrop-blur-md text-[#C6A66B] text-[11px] tracking-[0.25em] uppercase shadow-xl">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('hero.tag')}</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#F5F2EB] leading-[1.08] max-w-4xl mx-auto drop-shadow-2xl">
            {t('hero.title')}
          </h1>

          <p className="font-sans text-base sm:text-lg md:text-xl text-[#D5D1C7] max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
            {t('hero.subtitle')}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/catalog"
              className="w-full sm:w-auto btn-primary py-4 px-8 rounded-lg text-xs tracking-[0.2em] uppercase font-bold flex items-center justify-center gap-3 shadow-2xl"
            >
              <span>{t('hero.cta_explore')}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>

            <Link
              href="/#fragrance-families"
              className="w-full sm:w-auto btn-secondary py-4 px-8 rounded-lg text-xs tracking-[0.2em] uppercase font-semibold flex items-center justify-center gap-2 bg-[#080A0A]/60 backdrop-blur-md"
            >
              <Compass className="w-4 h-4 text-[#C6A66B]" />
              <span>{t('hero.cta_guide')}</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-[#1A2624]/80 max-w-3xl mx-auto text-center bg-[#080A0A]/40 backdrop-blur-sm p-4 rounded-xl">
            <div>
              <p className="font-serif text-2xl font-bold text-[#F5F2EB]">{products.length}+</p>
              <p className="text-[11px] tracking-wider text-[#9EABA7] uppercase mt-0.5">{t('stats.compositions')}</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-bold text-[#66D9C5]">35%</p>
              <p className="text-[11px] tracking-wider text-[#9EABA7] uppercase mt-0.5">{t('stats.oil_ratio')}</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-bold text-[#C6A66B]">100%</p>
              <p className="text-[11px] tracking-wider text-[#9EABA7] uppercase mt-0.5">{t('stats.cod')}</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-bold text-[#F5F2EB]">24–48h</p>
              <p className="text-[11px] tracking-wider text-[#9EABA7] uppercase mt-0.5">{t('stats.delivery_time')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BESTSELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-semibold tracking-[0.25em] text-[#C6A66B] uppercase">
              {t('section.bestsellers_tag')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F5F2EB] mt-2">
              {t('section.bestsellers_title')}
            </h2>
            <p className="text-sm text-[#9EABA7] mt-1">
              {t('section.bestsellers_desc')}
            </p>
          </div>
          <Link
            href="/catalog?sort=bestselling"
            className="text-xs font-bold tracking-widest text-[#66D9C5] hover:text-[#82E2D1] uppercase flex items-center gap-1.5 transition-colors"
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

      {/* 3. FRAGRANCE FAMILIES EXPLORER */}
      <section id="fragrance-families" className="bg-[#0E1212] py-20 border-y border-[#1A2624]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold tracking-[0.25em] text-[#66D9C5] uppercase">
              {t('section.families_tag')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F5F2EB]">
              {t('section.families_title')}
            </h2>
            <p className="text-sm text-[#9EABA7]">
              {t('section.families_desc')}
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
              {isRtl ? 'جميع العائلات' : 'All Families'}
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
            <span className="badge-gold px-3 py-1 rounded-sm font-semibold">
              {t('section.story_tag')}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#F5F2EB] leading-tight">
              {t('section.story_title')}
            </h2>
            <p className="text-sm sm:text-base text-[#9EABA7] leading-relaxed">
              {t('section.story_p1')}
            </p>
            <p className="text-sm sm:text-base text-[#9EABA7] leading-relaxed">
              {t('section.story_p2')}
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="p-4 bg-[#111716] border border-[#1A2624] rounded-lg">
                <Droplets className="w-5 h-5 text-[#66D9C5] mb-2" />
                <h4 className="font-serif font-bold text-sm text-[#F5F2EB]">
                  {isRtl ? 'تركيز إكستري خالص' : 'Pure Extrait Concentration'}
                </h4>
                <p className="text-xs text-[#6C7A77] mt-1">
                  {isRtl ? 'تركيز زيوت عطرية يصل إلى 35% لثبات يتجاوز 14 ساعة.' : 'Up to 35% concentration offering over 14 hours of persistent trail.'}
                </p>
              </div>

              <div className="p-4 bg-[#111716] border border-[#1A2624] rounded-lg">
                <ShieldCheck className="w-5 h-5 text-[#C6A66B] mb-2" />
                <h4 className="font-serif font-bold text-sm text-[#F5F2EB]">
                  {isRtl ? 'معاينة ودفع عند الاستلام' : 'Inspection Before Payment'}
                </h4>
                <p className="text-xs text-[#6C7A77] mt-1">
                  {isRtl ? 'عاين طردك الفاخر عند وصول المندوب قبل دفع أي مليم.' : 'Door-to-door insured delivery with visual inspection before cash payment.'}
                </p>
              </div>
            </div>
          </div>

          {/* Visual Showcase Block */}
          <div className="relative aspect-square sm:aspect-[4/3] bg-gradient-to-tr from-[#111716] via-[#141A19] to-[#0B665D]/30 rounded-2xl border border-[#1A2624] p-8 flex flex-col justify-end overflow-hidden shadow-2xl">
            <div className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'}`}>
              <span className="font-serif text-6xl text-[#66D9C5]/10 font-bold">A&S</span>
            </div>
            <div className="space-y-4 max-w-sm relative z-10">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#C6A66B] font-bold">
                {isRtl ? 'فلسفة العطر الفاخر' : 'Signature Philosophy'}
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#F5F2EB]">
                {isRtl
                  ? '«العطر ليس مجرد لمسة تجميلية، بل هو هالتك غير المرئية التي تبقى في ذاكرة المكان.»'
                  : '“A fragrance is not an accessory. It is your invisible aura.”'}
              </h3>
              <p className="text-xs text-[#9EABA7]">
                {isRtl ? 'خبير العطور والمؤسس، دار A AND S' : 'Master Perfumer & Founder, A AND S Fragrance House'}
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
              {t('section.new_arrivals_tag')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F5F2EB] mt-2">
              {t('section.new_arrivals_title')}
            </h2>
            <p className="text-sm text-[#9EABA7] mt-1">
              {t('section.new_arrivals_desc')}
            </p>
          </div>
          <Link
            href="/catalog?sort=newest"
            className="text-xs font-bold tracking-widest text-[#66D9C5] hover:text-[#82E2D1] uppercase flex items-center gap-1.5 transition-colors"
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
