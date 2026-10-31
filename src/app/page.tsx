'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Volume2,
  VolumeX,
  FlaskConical,
  Send,
  Truck,
} from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCustomRequest } from '@/context/CustomRequestContext';
import { useFragranceFinder } from '@/context/FragranceFinderContext';
import { useSiteContent } from '@/context/SiteContentContext';
import dynamic from 'next/dynamic';
import { FRAGRANCE_FAMILIES } from '@/lib/data/products';
import { ProductCard } from '@/components/ProductCard';
import { ExpressOrderModal } from '@/components/ExpressOrderModal';
import { Product } from '@/types';
import { getOptimizedVideoUrl } from '@/lib/videoOptimizer';

const Interactive3DStudio = dynamic(
  () => import('@/components/Interactive3DStudio').then((m) => m.Interactive3DStudio),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 flex items-center justify-center bg-[#080A0A] rounded-3xl border border-[#2DD4BF]/20 text-[#A2ADA9]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#2DD4BF] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono tracking-widest uppercase">جاري تحميل استوديو التجسيم ثلاثي الأبعاد...</p>
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  const { products } = useProducts();
  const { t, isRtl } = useLanguage();
  const { openModal } = useCustomRequest();
  const { openFinder } = useFragranceFinder();
  const [selectedFamily, setSelectedFamily] = useState('All');
  const [selectedGender, setSelectedGender] = useState<'ALL' | 'MEN' | 'WOMEN' | 'UNISEX'>('ALL');
  const [quickSearchPerfume, setQuickSearchPerfume] = useState('');
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Full Storefront Dynamic CMS Content & Media
  const { siteContent } = useSiteContent();
  const heroConfig = siteContent; // alias for backwards compatibility
  const [mountVideo, setMountVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoSource, setVideoSource] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Image-First Hero: Defer heavyweight video streaming until after critical LCP is locked
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobileDevice = window.innerWidth < 768;
    const activeUrl = heroConfig.activeVideoUrl || '/videos/campaign-hero.mp4';
    setVideoSource(getOptimizedVideoUrl(activeUrl, isMobileDevice));

    // Check user data-saver & reduced motion preferences
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nav = navigator as any;
    const isSaveData = Boolean(
      nav.connection?.saveData ||
      nav.connection?.effectiveType === 'slow-2g' ||
      nav.connection?.effectiveType === '2g'
    );

    if (isReducedMotion || isSaveData || heroConfig.visualMode === 'photo') {
      return;
    }

    // Schedule video element mounting after main thread is idle & initial paint is complete
    if ('requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(
        () => setMountVideo(true),
        { timeout: 2000 }
      );
      return () => (window as any).cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(() => setMountVideo(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [heroConfig.visualMode, heroConfig.activeVideoUrl]);

  // Handle video autoplay once mounted
  useEffect(() => {
    if (videoRef.current && mountVideo && heroConfig.visualMode === 'video') {
      videoRef.current.muted = isMuted;
      videoRef.current.playsInline = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, [mountVideo, heroConfig.visualMode, isMuted, videoSource]);

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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Express 1-Click Fast Checkout Modal State
  const [expressProduct, setExpressProduct] = useState<Product | null>(null);
  const [catalogCategory, setCatalogCategory] = useState<'ALL' | 'MEN' | 'WOMEN' | 'ORIENTAL' | 'FRESH'>('ALL');

  // Featured & Bestsellers Direct Commercial Catalog
  const displayedCatalogProducts = React.useMemo(() => {
    let list = products;
    if (catalogCategory === 'MEN') {
      list = list.filter((p) => p.gender === 'MEN' || p.gender === 'UNISEX');
    } else if (catalogCategory === 'WOMEN') {
      list = list.filter((p) => p.gender === 'WOMEN' || p.gender === 'UNISEX');
    } else if (catalogCategory === 'ORIENTAL') {
      list = list.filter(
        (p) =>
          (p.fragranceFamily || '').toLowerCase().includes('oriental') ||
          (p.fragranceFamily || '').toLowerCase().includes('woody')
      );
    } else if (catalogCategory === 'FRESH') {
      list = list.filter(
        (p) =>
          (p.fragranceFamily || '').toLowerCase().includes('citrus') ||
          (p.fragranceFamily || '').toLowerCase().includes('fresh') ||
          (p.fragranceFamily || '').toLowerCase().includes('aromatic')
      );
    }
    return list.slice(0, 12);
  }, [products, catalogCategory]);

  const bestsellers = products.filter((p) => p.isBestseller).slice(0, 4);
  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 4);

  // Filtered preview
  const familyProducts = selectedFamily === 'All'
    ? products.slice(0, 4)
    : products.filter((p) => p.fragranceFamily === selectedFamily).slice(0, 4);

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-24 sm:space-y-32 bg-[#F6F3EC]">
      
      {/* 1. CINEMATIC ROYAL HERO SECTION: MODEL SPRAYING A AND S PERFUME */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 border-b border-[#E6E1D5]">
        
        {/* Background Visual Layer: Real Raheeq Campaign Visuals & Ultra-Luxury HD Video */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Main Editorial Image (Hero LCP Anchor - Image-First Architecture) */}
          <img
            src={heroConfig.activePhotoUrl || '/images/campaign/as-signature-male-spray.jpg'}
            alt="Raheeq Haute Parfumerie Campaign"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            style={{
              filter: `brightness(${heroConfig.heroBrightness || 0.95}) contrast(105%)`,
            }}
            className="w-full h-full object-cover scale-105 opacity-100 transition-opacity duration-1000"
          />

          {/* Cinematic Background Video (Attached only after critical LCP is locked, single source) */}
          {mountVideo && heroConfig.visualMode === 'video' && (
            <video
              ref={videoRef}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              src={videoSource}
              onPlaying={() => setVideoReady(true)}
              onCanPlay={() => {
                if (videoRef.current) {
                  videoRef.current.play().catch(() => {});
                }
              }}
              onError={() => {
                // Reliable local fallback if remote video fails
                if (videoSource !== '/videos/campaign-hero.mp4') {
                  setVideoSource('/videos/campaign-hero.mp4');
                }
              }}
              style={{
                filter: `brightness(${heroConfig.heroBrightness || 1.0}) contrast(105%)`,
              }}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                videoReady ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          {/* Elegant Readable Overlay with Controlled Transparency */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-500"
            style={{
              background: `linear-gradient(to top, rgba(8,10,10,${Math.min(0.85, ((heroConfig.heroOverlayDarkness ?? 25) + 30) / 100)}) 0%, rgba(8,10,10,${(heroConfig.heroOverlayDarkness ?? 25) / 100}) 50%, rgba(8,10,10,${((heroConfig.heroOverlayDarkness ?? 25) * 0.7) / 100}) 100%)`,
            }}
          />
        </div>

        {/* Subtle Client Ambience Controls (Chanel / Dior Haute Parfumerie Standard) */}
        {heroConfig.visualMode === 'video' && (
          <div className={`absolute bottom-6 ${isRtl ? 'right-6' : 'left-6'} z-20 flex items-center gap-1.5 bg-[#080A0A]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-[#FAF9F5] shadow-2xl transition-opacity hover:opacity-100 opacity-75`}>
            {/* Play / Pause Toggle */}
            <button
              onClick={toggleVideoPlayback}
              className="text-[#54d1b2] hover:text-white p-1 rounded-full transition-colors"
              title={isVideoPlaying ? (isRtl ? 'إيقاف الفيديو مؤقتاً' : 'Pause Video') : (isRtl ? 'تشغيل الفيديو' : 'Play Video')}
              aria-label="Toggle Playback"
            >
              {isVideoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <span className="w-px h-3 bg-white/20" />

            {/* Sound Toggle */}
            <button
              onClick={toggleMute}
              className="text-[#54d1b2] hover:text-white p-1 rounded-full transition-colors"
              title={isMuted ? (isRtl ? 'تشغيل الصوت' : 'Unmute') : (isRtl ? 'كتم الصوت' : 'Mute')}
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#788784]" /> : <Volume2 className="w-3.5 h-3.5 text-[#54d1b2]" />}
            </button>
          </div>
        )}

        {/* Grand Royal Hero Content */}
        <div className="relative max-w-5xl mx-auto text-center space-y-8 py-20 sm:py-24 z-10 px-2 sm:px-4">
          
          {/* Royal Atelier Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#2DD4BF]/50 bg-[#080A0A]/85 backdrop-blur-md text-[#2DD4BF] text-[11px] tracking-[0.25em] uppercase shadow-2xl font-bold">
            <Crown className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>{isRtl ? (heroConfig.heroBadge || t('hero.tag')) : t('hero.tag')}</span>
          </div>

          {/* Regal Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#FFFFFF] leading-[1.18] max-w-4xl mx-auto drop-shadow-2xl">
            {isRtl ? (heroConfig.heroHeadline || t('hero.title')) : t('hero.title')}
          </h1>

          {/* Royal Subtitle */}
          <p className="font-sans text-sm sm:text-base md:text-lg text-[#E6E1D5] max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
            {isRtl ? (heroConfig.heroSubtitle || t('hero.subtitle')) : t('hero.subtitle')}
          </p>

          {/* Hero Action Buttons - Commercial Direct Sales Focus */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#bestsellers"
              className="w-full sm:w-auto bg-gradient-to-r from-[#00bc7d] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#5EEAD4] text-[#080A0A] font-extrabold py-4 px-8 rounded-2xl text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(45,212,191,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>🔥 {isRtl ? 'تسوق العطور الأكثر طلباً الآن (شحن ومعاينة كاش)' : 'Shop Bestsellers (COD)'}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </a>

            <button
              onClick={() => openModal()}
              className="w-full sm:w-auto bg-[#080A0A]/90 hover:bg-[#141A19] text-[#FFFFFF] border border-[#2DD4BF]/50 py-4 px-8 rounded-2xl text-xs tracking-wider uppercase font-bold flex items-center justify-center gap-2 backdrop-blur-md transition-all duration-300 hover:border-[#2DD4BF] cursor-pointer"
            >
              <FlaskConical className="w-4 h-4 text-[#2DD4BF]" />
              <span>{isRtl ? 'اطلب خلطتك أو عطرك الخاص (تفصيل) 🧪' : 'Bespoke Scent Request'}</span>
            </button>
          </div>

          {/* Direct Commercial Trust Proof Badges */}
          <div className="pt-1 flex items-center justify-center flex-wrap gap-x-6 gap-y-2 text-[11px] text-[#D5D1C7] font-medium">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isRtl ? 'معاينة الطرد عند الباب قبل دفع أي مليم' : 'Doorstep Inspection Before Payment'}</span>
            </span>
            <span className="hidden sm:inline text-white/30">•</span>
            <span className="flex items-center gap-1.5 text-teal-300 font-bold">
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span>{isRtl ? 'تركيزات نيش Extrait de Parfum ثبات فائق' : 'Pure Extrait de Parfum Sillage'}</span>
            </span>
            <span className="hidden sm:inline text-white/30">•</span>
            <span className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Truck className="w-4 h-4 text-amber-300" />
              <span>{isRtl ? 'توصيل سريع 24–48h لجميع محافظات مصر' : 'Fast Delivery Across Egypt'}</span>
            </span>
          </div>

          {/* Quick Metrics Bar (Fully Editable via Admin) */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-[#2DD4BF]/30 max-w-3xl mx-auto text-center bg-[#080A0A]/75 backdrop-blur-md p-5 rounded-2xl shadow-2xl">
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#FFFFFF]">
                {siteContent.stat1Value || `${products.length}+`}
              </p>
              <p className="text-[11px] tracking-wider text-[#D5D1C7] uppercase mt-0.5">
                {isRtl ? (siteContent.stat1Label || t('stats.compositions')) : t('stats.compositions')}
              </p>
            </div>
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#2DD4BF]">
                {siteContent.stat2Value || '30%'}
              </p>
              <p className="text-[11px] tracking-wider text-[#D5D1C7] uppercase mt-0.5">
                {isRtl ? (siteContent.stat2Label || t('stats.oil_ratio')) : t('stats.oil_ratio')}
              </p>
            </div>
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#C6A66B]">
                {siteContent.stat3Value || '100%'}
              </p>
              <p className="text-[11px] tracking-wider text-[#D5D1C7] uppercase mt-0.5">
                {isRtl ? (siteContent.stat3Label || t('stats.cod')) : t('stats.cod')}
              </p>
            </div>
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#FFFFFF]">
                {siteContent.stat4Value || '24–48h'}
              </p>
              <p className="text-[11px] tracking-wider text-[#D5D1C7] uppercase mt-0.5">
                {isRtl ? (siteContent.stat4Label || t('stats.delivery_time')) : t('stats.delivery_time')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BESTSELLERS & DIRECT SALES CATALOG (Commercial Core Section) */}
      <section id="bestsellers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
              <span>🔥 {isRtl ? 'الأكثر طلباً ومبيعاً في مصر' : 'Most Popular in Egypt'}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#080A0A] mt-2">
              {isRtl ? 'قائمة عطور النيش الأكثر طلباً (الدفع عند الاستلام)' : 'Curated Masterpiece Fragrances'}
            </h2>
            <p className="text-xs sm:text-sm text-[#576563] mt-1 max-w-xl leading-relaxed">
              {isRtl
                ? 'توليفات نقية بتركيزات إكستري دو بارفان نيش وثبات يدوم طويلاً، مع ميزة فتح الطرد وفحص الزجاجة قبل الدفع كاش.'
                : 'Artisanal Extrait de Parfum formulations with full doorstep cash inspection.'}
            </p>
          </div>
          <Link
            href="/catalog"
            prefetch={false}
            className="text-xs font-extrabold tracking-wider text-[#00bc7d] hover:text-[#080A0A] uppercase flex items-center gap-1.5 transition-colors self-start md:self-auto bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl shadow-xs"
          >
            <span>{isRtl ? 'عرض الكتالوج الكامل (50+ عطر) ←' : 'View Full Catalog (50+) ←'}</span>
          </Link>
        </div>

        {/* Commercial Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          <button
            onClick={() => setCatalogCategory('ALL')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              catalogCategory === 'ALL'
                ? 'bg-[#080A0A] text-[#2DD4BF] shadow-lg border border-[#2DD4BF]/40'
                : 'bg-white border border-[#E6E1D5] text-slate-700 hover:bg-slate-50'
            }`}
          >
            🔥 {isRtl ? 'جميع العطور الأكثر طلباً' : 'All Bestsellers'} ({products.length})
          </button>
          <button
            onClick={() => setCatalogCategory('MEN')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              catalogCategory === 'MEN'
                ? 'bg-[#080A0A] text-[#2DD4BF] shadow-lg border border-[#2DD4BF]/40'
                : 'bg-white border border-[#E6E1D5] text-slate-700 hover:bg-slate-50'
            }`}
          >
            👔 {isRtl ? 'عطور رجالية فخمة (Men)' : 'Men Collection'}
          </button>
          <button
            onClick={() => setCatalogCategory('WOMEN')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              catalogCategory === 'WOMEN'
                ? 'bg-[#080A0A] text-[#2DD4BF] shadow-lg border border-[#2DD4BF]/40'
                : 'bg-white border border-[#E6E1D5] text-slate-700 hover:bg-slate-50'
            }`}
          >
            🌸 {isRtl ? 'عطور نسائية ساحرة (Women)' : 'Women Collection'}
          </button>
          <button
            onClick={() => setCatalogCategory('ORIENTAL')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              catalogCategory === 'ORIENTAL'
                ? 'bg-[#080A0A] text-[#2DD4BF] shadow-lg border border-[#2DD4BF]/40'
                : 'bg-white border border-[#E6E1D5] text-slate-700 hover:bg-slate-50'
            }`}
          >
            🪵 {isRtl ? 'عود وأخشاب شرقية' : 'Oud & Woods'}
          </button>
          <button
            onClick={() => setCatalogCategory('FRESH')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              catalogCategory === 'FRESH'
                ? 'bg-[#080A0A] text-[#2DD4BF] shadow-lg border border-[#2DD4BF]/40'
                : 'bg-white border border-[#E6E1D5] text-slate-700 hover:bg-slate-50'
            }`}
          >
            🍋 {isRtl ? 'حمضيات وانتعاش صيفي' : 'Fresh & Citrus'}
          </button>
        </div>

        {/* Category Landing Pages & Educational Fragrance Guide Quick Bar */}
        <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-teal-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-teal-900 font-bold">
            <Compass className="w-4 h-4 text-teal-600" />
            <span>{isRtl ? 'استكشف تصنيفات العطور المستقلة لدار رحيق:' : 'Explore RAHEEQ Independent Fragrance Families:'}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/category/oriental" className="px-2.5 py-1 rounded-lg bg-white/90 border border-teal-200 text-teal-900 font-medium hover:bg-teal-600 hover:text-white transition-colors">
              {isRtl ? 'العطور الشرقية' : 'Oriental'}
            </Link>
            <Link href="/category/woody" className="px-2.5 py-1 rounded-lg bg-white/90 border border-teal-200 text-teal-900 font-medium hover:bg-teal-600 hover:text-white transition-colors">
              {isRtl ? 'الأخشاب الملكية' : 'Woody'}
            </Link>
            <Link href="/category/fresh-citrus" className="px-2.5 py-1 rounded-lg bg-white/90 border border-teal-200 text-teal-900 font-medium hover:bg-teal-600 hover:text-white transition-colors">
              {isRtl ? 'الانتعاش والحمضيات' : 'Fresh Citrus'}
            </Link>
            <Link href="/category/leather-spice" className="px-2.5 py-1 rounded-lg bg-white/90 border border-teal-200 text-teal-900 font-medium hover:bg-teal-600 hover:text-white transition-colors">
              {isRtl ? 'الجلود والتوابل' : 'Leather & Spice'}
            </Link>
            <Link href="/fragrance-guide" className="px-3 py-1 rounded-lg bg-[#080A0A] text-[#2DD4BF] font-bold hover:bg-black transition-colors flex items-center gap-1">
              <span>{isRtl ? 'دليل تركيز العطور والأهرام الشمية 📖' : 'Fragrance Guide 📖'}</span>
            </Link>
          </div>
        </div>

        {/* Product Cards Grid with 1-Click Fast Order Modal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedCatalogProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onExpressOrder={(p) => setExpressProduct(p)}
            />
          ))}
        </div>

        {/* Commercial Trust & Zero-Risk COD Bar */}
        <div className="mt-12 p-6 bg-white rounded-3xl border border-[#E6E1D5] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-slate-900">
                {isRtl ? 'المعاينة عند الباب مجاناً قبل الدفع' : 'Free Doorstep Inspection'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRtl ? 'افتح الكرتونة وتأكد من الزجاجة مع المندوب قبل دفع أي مليم كاش.' : 'Open and verify packaging with the courier prior to cash payment.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-slate-900">
                {isRtl ? 'تركيزات نيش Extrait de Parfum' : 'Pure Extrait de Parfum'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRtl ? 'زيوت نقية معتقة Extrait de Parfum تضاهي الدور الفرنسية الكبرى.' : 'Unadulterated rare oils lasting +14 hours on garments.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-slate-900">
                {isRtl ? 'توصيل سريع 24–48h لكل مصر' : 'Fast 24-48h Delivery'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRtl ? 'شحن مباشر لباب بيتك في القاهرة والجيزة وجميع محافظات مصر.' : 'Direct courier to your doorstep across all Egyptian governorates.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2.2 AI FRAGRANCE FINDER BANNER: DISCOVER YOUR SIGNATURE SCENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#080A0A] via-[#0E1514] to-[#080A0A] border-2 border-[#54d1b2]/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_35px_rgba(84,209,178,0.12)]">
          <div className="flex items-center gap-4 text-right">
            <div className="w-14 h-14 rounded-2xl bg-[#080A0A] border border-[#54d1b2]/50 flex items-center justify-center shrink-0 shadow-lg text-[#54d1b2]">
              <Sparkles className="w-7 h-7 animate-pulse text-[#54d1b2]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
                <Crown className="w-3.5 h-3.5" />
                <span>{isRtl ? 'مستشارك العطري الذكي الخاص' : 'AI Private Fragrance Concierge'}</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                {isRtl ? 'محتار تختار أي عطر؟ اكتشف توقيعك العطري الملكي في 30 ثانية' : 'Unsure which scent fits you? Discover your signature flacon in 30 seconds'}
              </h3>
              <p className="text-xs text-[#A2ADA9] mt-1 max-w-xl">
                {isRtl ? 'أجب عن 4 أسئلة سريعة لنحلل الأهرام العطرية ونكشف لك العطرين الأكثر تطابقاً مع شخصيتك ومناسبتك.' : 'Answer 4 quick questions and let our AI algorithm match your exact notes pyramid.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => openFinder()}
            className="shrink-0 bg-gradient-to-r from-[#00bc7d] to-[#54d1b2] hover:from-[#54d1b2] hover:to-[#00bc7d] text-[#080A0A] font-extrabold text-xs uppercase tracking-widest py-3.5 px-7 rounded-2xl flex items-center gap-2 shadow-[0_0_25px_rgba(84,209,178,0.3)] transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isRtl ? 'ابدأ اختبار العطر الآن ✨' : 'Start Fragrance Quiz ✨'}</span>
          </button>
        </div>
      </section>

      {/* 2.5 BESPOKE CONCIERGE BANNER: CUSTOM PERFUME & BLEND REQUEST */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#080A0A] via-[#0E1514] to-[#080A0A] border-2 border-[#54d1b2]/40 p-8 sm:p-12 lg:p-14 shadow-[0_0_50px_rgba(84,209,178,0.12)] overflow-hidden">
          {/* Ambient luminous glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#54d1b2]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#54d1b2]/40 bg-[#141F1D] text-[#54d1b2] text-xs font-bold tracking-widest uppercase shadow-md">
              <FlaskConical className="w-4 h-4 text-[#54d1b2] animate-pulse" />
              <span>{isRtl ? (siteContent.bespokeBadge || 'خدمة التفصيل العطري الملكي المخصص') : 'Bespoke Haute Concierge'}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              {isRtl ? (
                siteContent.bespokeHeadline || (
                  <>
                    لو عاوز عطر معين أو <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#54d1b2] to-[#00bc7d]">خلطة خاصة</span>... اكتب لينا اسمه وحجمه وبنوفرو ليك
                  </>
                )
              ) : (
                <>
                  Looking for a Specific Scent or a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#54d1b2] to-[#00bc7d]">Custom Blend</span>? We Craft It for You.
                </>
              )}
            </h2>

            <p className="text-sm sm:text-base text-[#D5D1C7] max-w-2xl mx-auto font-light leading-relaxed">
              {isRtl
                ? (siteContent.bespokeSubtitle || 'مهما كان العطر نادراً أو عالمياً، خبراؤنا يركبونه لك بتركيز 30% Extrait de Parfum مع ضمان ثبات وفوحان يتجاوز 24 ساعة.')
                : 'From rare vintage flacons to personal signature accords, tell us your desired perfume name and bottle volume. Our master perfumers craft and deliver it across Egypt.'}
            </p>

            {/* Quick Interactive Request Bar */}
            <div className="pt-2 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 bg-[#141B1A] p-2 sm:p-2.5 rounded-2xl border border-[#54d1b2]/40 shadow-xl">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={quickSearchPerfume}
                    onChange={(e) => setQuickSearchPerfume(e.target.value)}
                    placeholder={
                      isRtl
                        ? (siteContent.bespokePlaceholder || 'اكتب اسم العطر أو الخلطة المطلوبة هنا (مثلاً: Creed Aventus أو خلطة توم فورد)...')
                        : 'Type the perfume name or custom notes (e.g. Creed Aventus)...'
                    }
                    className="w-full bg-transparent border-0 px-4 py-3 text-sm text-white placeholder-[#788784] focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        openModal(quickSearchPerfume);
                      }
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => openModal(quickSearchPerfume)}
                  className="bg-gradient-to-r from-[#00bc7d] to-[#54d1b2] hover:brightness-110 text-[#080A0A] font-extrabold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-md shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>{isRtl ? (siteContent.bespokeButtonText || 'اطلب الآن وحدد الحجم') : 'Request & Choose Volume'}</span>
                </button>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-[#A2ADA9]">
              <span className="flex items-center gap-1.5">
                <span className="text-[#54d1b2]">✓</span>
                <span>{isRtl ? (siteContent.bespokeFeature1 || 'أحجام 50ml و 100ml و 200ml') : 'Volumes 50ml, 100ml, 200ml'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#54d1b2]">✓</span>
                <span>{isRtl ? (siteContent.bespokeFeature2 || 'تركيز نيش Extrait de Parfum 30%') : '30% Pure Extrait Sillage'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#54d1b2]">✓</span>
                <span>{isRtl ? (siteContent.bespokeFeature3 || 'الدفع عند الاستلام بعد المعاينة') : 'Inspect before Cash on Delivery'}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DIOR SAUVAGE BENCHMARK: THE SENSORY MASTERY & OLFACTORY RITUAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#080A0A] text-[#F5F2EB] rounded-3xl p-8 sm:p-14 lg:p-16 border border-[#2DD4BF]/40 shadow-2xl relative overflow-hidden">
          {/* Subtle luminous ambient backdrop */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#2DD4BF]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#C6A66B]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Fragrance Philosophy & Intensity Radar */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#2DD4BF]/50 bg-[#111716] text-[#2DD4BF] text-[11px] font-bold tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isRtl ? (siteContent.showcaseBadge || 'معايير الفخامة العالمية المستوحاة من باريس') : 'Haute Parfumerie Global Standards'}</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                {isRtl ? (siteContent.showcaseHeadline || 'هندسة العطر الفاخر.. ثباتٌ أسطوري وحضورٌ يأسر الحواس') : 'Olfactory Architecture & Unmatched Sillage'}
              </h2>

              <p className="text-sm sm:text-base text-[#C5CECB] leading-relaxed">
                {isRtl
                  ? (siteContent.showcaseDescription || 'تم تصميم كل توليفة في معمل دار رحيق بتركيز Extrait de Parfum خالص 30% من أندر الزيوت الطبيعية النقية لضمان بقاء أثرك العطري حياً لأكثر من 14 ساعة مع نقاء شمي استثنائي.')
                  : 'Engineered with rare natural absolutes and a 30% Extrait de Parfum concentration, crafted in RAHEEQ private atelier for persistent sillage and supreme olfactory clarity.'}
              </p>

              {/* Dior Sauvage Style Intensity & Radar Meters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#141A19] border border-[#2DD4BF]/30">
                  <div className="flex items-center justify-between text-xs font-bold text-[#2DD4BF] mb-1">
                    <span>{isRtl ? (siteContent.showcaseMeter1Title || 'الفوحان (Sillage)') : 'Sillage'}</span>
                    <span>{siteContent.showcaseMeter1Val || '9.8 / 10'}</span>
                  </div>
                  <div className="w-full bg-[#080A0A] rounded-full h-2 overflow-hidden border border-[#1A2624]">
                    <div className="bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] h-full w-[98%]" />
                  </div>
                  <p className="text-[10px] text-[#9EABA7] mt-1.5">{isRtl ? (siteContent.showcaseMeter1Sub || 'هالة قوية تملأ الأرجاء') : 'Dominant room-filling aura'}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#141A19] border border-[#2DD4BF]/30">
                  <div className="flex items-center justify-between text-xs font-bold text-[#2DD4BF] mb-1">
                    <span>{isRtl ? (siteContent.showcaseMeter2Title || 'الثبات (Longevity)') : 'Longevity'}</span>
                    <span>{siteContent.showcaseMeter2Val || '+14h'}</span>
                  </div>
                  <div className="w-full bg-[#080A0A] rounded-full h-2 overflow-hidden border border-[#1A2624]">
                    <div className="bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] h-full w-[95%]" />
                  </div>
                  <p className="text-[10px] text-[#9EABA7] mt-1.5">{isRtl ? (siteContent.showcaseMeter2Sub || 'يدوم على الأقمشة لأيام') : 'Lasts on fabrics for days'}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#141A19] border border-[#C6A66B]/30">
                  <div className="flex items-center justify-between text-xs font-bold text-[#C6A66B] mb-1">
                    <span>{isRtl ? (siteContent.showcaseMeter3Title || 'نسبة الزيوت') : 'Concentration'}</span>
                    <span>{siteContent.showcaseMeter3Val || '30%'}</span>
                  </div>
                  <div className="w-full bg-[#080A0A] rounded-full h-2 overflow-hidden border border-[#1A2624]">
                    <div className="bg-gradient-to-r from-[#C6A66B] to-[#D4AF37] h-full w-[100%]" />
                  </div>
                  <p className="text-[10px] text-[#9EABA7] mt-1.5">{isRtl ? (siteContent.showcaseMeter3Sub || 'Extrait de Parfum مغلظ') : 'Pure Extrait de Parfum'}</p>
                </div>
              </div>

              {/* Quality & Craftsmanship Trio */}
              <div className="pt-4 border-t border-[#1A2624] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#141A19] flex items-center justify-center text-[#54d1b2]">
                    ✓
                  </div>
                  <span className="text-[#D5D1C7]">{isRtl ? (siteContent.showcasePill1 || 'زيوت فرنسية نقية 30% Extrait') : 'Pure 30% Extrait French oils'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#141A19] flex items-center justify-center text-[#54d1b2]">
                    ✓
                  </div>
                  <span className="text-[#D5D1C7]">{isRtl ? (siteContent.showcasePill2 || 'التوصيل إلى الباب ومعاينة قبل الدفع كاش') : 'Door delivery & inspect before cash'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#141A19] flex items-center justify-center text-[#C6A66B]">
                    ★
                  </div>
                  <span className="text-[#D5D1C7]">{isRtl ? (siteContent.showcasePill3 || 'زجاج بلوري ثقيل بغطاء مغناطيسي') : 'Weighted glass flacon with magnetic cap'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Showcase Flacon with Luminous Glow */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl bg-gradient-to-b from-[#141A19] to-[#080A0A] border border-[#2DD4BF]/50 p-6 flex flex-col items-center justify-center shadow-2xl group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(45,212,191,0.15)_0%,_transparent_70%)]" />
                
                {/* Floating Bottle Art */}
                <div className="relative z-10 float-animation w-full flex flex-col items-center">
                  <img
                    src={siteContent.showcaseBottleImage || bestsellers[0]?.images?.[0]?.url || bestsellers[0]?.imageUrl || '/images/raheeq-official-logo.png'}
                    alt="Raheeq Flacon Showcase"
                    className="max-h-72 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] filter contrast-125 transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Flacon Shadow */}
                  <div className="w-36 h-4 bg-black/60 rounded-full blur-md -mt-2" />
                </div>

                <div className="mt-6 text-center z-10 space-y-1">
                  <span className="text-[10px] font-mono tracking-widest text-[#2DD4BF] uppercase">
                    {siteContent.showcaseBottleTag || 'Signature Creation'}
                  </span>
                  <h4 className="font-serif text-xl font-bold text-white">
                    {siteContent.showcaseBottleName || bestsellers[0]?.nameEn || 'SAUVAGE ELIXIR / SULTAN OUD'}
                  </h4>
                  <p className="text-xs text-[#C6A66B]">
                    {siteContent.showcaseBottleSubtitle || (isRtl ? 'التوقيع العطري الأرقى في الشرق الأوسط' : 'The Most Coveted Middle Eastern Scent')}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3D INTERACTIVE FLACON & SKETCHFAB STUDIO (Staging Preview Experience) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Interactive3DStudio />
      </section>

      {/* 4. MEDITERRANEAN RIVIERA & CITRUS COLLECTION (Fully Editable via Admin) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-[#E7E3D6] shadow-xl bg-[#080A0A]">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* Visual Image */}
            <div className="lg:col-span-7 relative min-h-[420px] lg:min-h-[500px]">
              <img
                src={siteContent.rivieraImage || '/images/campaign/female-coastal-spray.jpg'}
                alt="Raheeq Riviera Campaign"
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.9] contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/85 via-black/35 to-transparent" />
            </div>

            {/* Editorial Copy */}
            <div className="lg:col-span-5 p-8 sm:p-12 lg:p-14 space-y-6 text-white relative z-10">
              <span className="badge-turquoise px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-widest inline-block">
                {isRtl ? (siteContent.rivieraBadge || 'حملة صيف الريفييرا المتوسطية') : 'Mediterranean Summer Campaign'}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                {isRtl ? (siteContent.rivieraHeadline || 'رذاذ البحر الفيروزي.. وانتعاش الحمضيات الذهبية') : 'Turquoise Ocean Mist & Golden Citron'}
              </h2>
              <p className="text-sm text-[#C5CECB] leading-relaxed">
                {isRtl
                  ? (siteContent.rivieraDescription || 'مستوحاة من دفء شمس الأصيل على شواطئ البحر المتوسط، حيث تلتقي نفحات البرغموت الإيطالي النادر برحيق أزهار البرتقال ورذاذ النسيم الفيروزي العليل.')
                  : 'Inspired by golden hour sunlight on Mediterranean shores, combining rare Italian bergamot, neroli blossoms, and pure ocean mist.'}
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/catalog?family=Fresh+Citrus"
                  prefetch={false}
                  className="btn-turquoise py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider text-center"
                >
                  {isRtl ? (siteContent.rivieraBtn1Text || 'اكتشف عطور الريفييرا') : 'Explore Riviera Scents'}
                </Link>
                <Link
                  href="/catalog"
                  prefetch={false}
                  className="btn-secondary !bg-transparent !text-white !border-white/30 hover:!border-[#54d1b2] hover:!text-[#54d1b2] py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider text-center"
                >
                  {isRtl ? (siteContent.rivieraBtn2Text || 'مشاهدة الكتالوج الكامل') : 'View Full Catalog'}
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FRAGRANCE FAMILIES EXPLORER (Pearl Surface on Warm Beige) */}
      <section id="fragrance-families" className="bg-[#FAF8F4] py-20 border-y border-[#E6E1D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="badge-emerald px-3 py-1 rounded-sm">
              {t('section.families_tag')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#080A0A]">
              {t('section.families_title')}
            </h2>
            <p className="text-sm text-[#576563]">
              {t('section.families_desc')}
            </p>
          </div>

          {/* Family Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={() => setSelectedFamily('All')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider transition-all ${
                selectedFamily === 'All'
                  ? 'bg-[#080A0A] text-[#2DD4BF] border border-[#2DD4BF] shadow-lg'
                  : 'bg-white text-[#576563] hover:text-[#080A0A] border border-[#E6E1D5] hover:border-[#2DD4BF]'
              }`}
            >
              {isRtl ? 'جميع العائلات العطرية' : 'All Families'}
            </button>
            {FRAGRANCE_FAMILIES.map((family) => (
              <button
                key={family}
                onClick={() => setSelectedFamily(family)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider transition-all ${
                  selectedFamily === family
                    ? 'bg-[#080A0A] text-[#2DD4BF] border border-[#2DD4BF] shadow-lg'
                    : 'bg-white text-[#576563] hover:text-[#080A0A] border border-[#E6E1D5] hover:border-[#2DD4BF]'
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
              className="btn-primary px-8 py-3.5 rounded-lg text-xs tracking-widest uppercase font-bold inline-flex items-center gap-2"
            >
              <span>{isRtl ? 'تصفح المزيد من هذه المجموعة' : `Explore More in ${selectedFamily === 'All' ? 'Our Catalog' : selectedFamily}`}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. BRAND STORY & ARTISANAL ATELIER (Fully Editable via Admin) */}
      <section id="brand-story" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <span className="badge-emerald px-3 py-1 rounded-sm">
              {isRtl ? (siteContent.storyBadge || t('section.story_tag')) : t('section.story_tag')}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#080A0A] leading-tight">
              {isRtl ? (siteContent.storyTitle || t('section.story_title')) : t('section.story_title')}
            </h2>
            <p className="text-sm sm:text-base text-[#576563] leading-relaxed">
              {isRtl ? (siteContent.storyParagraph1 || t('section.story_p1')) : t('section.story_p1')}
            </p>
            <p className="text-sm sm:text-base text-[#576563] leading-relaxed">
              {isRtl ? (siteContent.storyParagraph2 || t('section.story_p2')) : t('section.story_p2')}
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="p-4 bg-white border border-[#E6E1D5] rounded-2xl shadow-sm hover:border-[#2DD4BF] transition-colors">
                <Droplets className="w-5 h-5 text-[#0D9488] mb-2" />
                <h4 className="font-serif font-bold text-sm text-[#080A0A]">
                  {isRtl ? (siteContent.storyBenefit1Title || 'تركيز إكستري خالص 30%') : 'Pure 30% Extrait Concentration'}
                </h4>
                <p className="text-xs text-[#576563] mt-1">
                  {isRtl ? (siteContent.storyBenefit1Desc || 'تركيز زيوت عطرية يصل إلى 30% لثبات يتجاوز 14 ساعة.') : 'Up to 30% concentration offering over 14 hours of persistent trail.'}
                </p>
              </div>

              <div className="p-4 bg-white border border-[#E6E1D5] rounded-2xl shadow-sm hover:border-[#2DD4BF] transition-colors">
                <ShieldCheck className="w-5 h-5 text-[#C6A66B] mb-2" />
                <h4 className="font-serif font-bold text-sm text-[#080A0A]">
                  {isRtl ? (siteContent.storyBenefit2Title || 'معاينة ودفع عند الاستلام') : 'Inspection Before Payment'}
                </h4>
                <p className="text-xs text-[#576563] mt-1">
                  {isRtl ? (siteContent.storyBenefit2Desc || 'عاين طردك الفاخر عند وصول المندوب قبل دفع أي مليم.') : 'Door-to-door insured delivery with visual inspection before cash payment.'}
                </p>
              </div>
            </div>
          </div>

          {/* Visual Showcase Block */}
          <div className="relative aspect-square sm:aspect-[4/3] bg-[#080A0A] rounded-2xl border border-[#2DD4BF]/40 p-8 flex flex-col justify-end overflow-hidden shadow-2xl text-white">
            <img
              src={siteContent.storyImage || '/images/campaign/couple-sunset-romance.jpg'}
              alt="Raheeq Artisanal Heritage"
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.55] contrast-110"
            />
            <div className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'}`}>
              <span className="font-serif text-5xl text-[#2DD4BF]/20 font-bold">RAHEEQ</span>
            </div>
            <div className="space-y-4 max-w-sm relative z-10">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#2DD4BF] font-bold">
                {isRtl ? 'فلسفة العطر الفاخر' : 'Signature Philosophy'}
              </span>
              <h3 className="font-serif text-2xl font-bold text-white">
                {isRtl
                  ? (siteContent.storyImageQuote || '«العطر ليس مجرد لمسة تجميلية، بل هو هالتك غير المرئية التي تبقى في ذاكرة المكان.»')
                  : '“A fragrance is not an accessory. It is your invisible aura.”'}
              </h3>
              <p className="text-xs text-[#D5D1C7]">
                {isRtl ? (siteContent.storyImageTag || 'دار رحيق (RAHEEQ) للعطور الفاخرة — القاهرة') : 'Raheeq Haute Parfumerie — Cairo'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="badge-emerald px-3 py-1 rounded-sm">
              {t('section.new_arrivals_tag')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#080A0A] mt-2">
              {t('section.new_arrivals_title')}
            </h2>
            <p className="text-sm text-[#576563] mt-1 max-w-xl">
              {t('section.new_arrivals_desc')}
            </p>
          </div>
          <Link
            href="/catalog?sort=newest"
            prefetch={false}
            className="text-xs font-bold tracking-widest text-[#0D9488] hover:text-[#080A0A] uppercase flex items-center gap-1.5 transition-colors"
          >
            <span>{isRtl ? 'عرض جميع العطور الجديدة' : 'View All New Releases'}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onExpressOrder={(p) => setExpressProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* Express Fast 1-Click Cash Order Modal */}
      <ExpressOrderModal
        isOpen={!!expressProduct}
        onClose={() => setExpressProduct(null)}
        product={expressProduct}
      />
    </div>
  );
}
