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
  Upload,
  RotateCcw,
  Film,
  Camera,
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
  const [isMuted, setIsMuted] = useState(true);
  const [visualMode, setVisualMode] = useState<'video' | 'photo'>('video');
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure autoplay on mount
  useEffect(() => {
    if (videoRef.current && visualMode === 'video') {
      videoRef.current.play().catch(() => {
        // Autoplay may need user gesture on some strict browser policies
      });
    }
  }, [visualMode]);

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

  const toggleVisualMode = () => {
    const nextMode = visualMode === 'video' ? 'photo' : 'video';
    setVisualMode(nextMode);
    if (nextMode === 'video' && videoRef.current) {
      videoRef.current.play().catch(console.error);
      setIsVideoPlaying(true);
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      setVisualMode('video');
      setIsVideoPlaying(true);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.play().catch(console.error);
      }
    }
  };

  const resetToDefaultVideo = () => {
    setCustomVideoUrl(null);
    setVisualMode('video');
    if (videoRef.current) {
      videoRef.current.src = '/videos/campaign-hero.mp4';
      videoRef.current.load();
      videoRef.current.play().catch(console.error);
      setIsVideoPlaying(true);
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
    <div className="space-y-24 sm:space-y-32 bg-[#F6F3EC]">
      
      {/* 1. CINEMATIC ROYAL HERO SECTION: MODEL SPRAYING A AND S PERFUME */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 border-b border-[#E6E1D5]">
        
        {/* Background Visual Layer: Real A&S Campaign Visuals & Ultra-Luxury Cinematic Video */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Main Editorial Image (Fallback + Poster + Photo Mode) */}
          <img
            src="/images/campaign/as-signature-male-spray.jpg"
            alt="A AND S Campaign — Male Model spraying A&S Flacon by the Sea"
            className={`w-full h-full object-cover scale-105 transition-opacity duration-1000 ${
              visualMode === 'photo'
                ? 'opacity-100 filter brightness-[0.6] contrast-110'
                : 'opacity-40 filter brightness-[0.5] contrast-110'
            }`}
          />

          {/* Cinematic Background Video */}
          <video
            ref={videoRef}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            poster="/images/campaign/as-signature-male-spray.jpg"
            src={customVideoUrl || '/videos/campaign-hero.mp4'}
            onLoadedData={() => setVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              visualMode === 'video'
                ? 'opacity-85 filter contrast-105 brightness-95'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <source src={customVideoUrl || '/videos/campaign-hero.mp4'} type="video/mp4" />
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>

          {/* Luxury Gradient Dark & Golden Overlays for Flawless Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080A0A] via-[#080A0A]/60 to-[#080A0A]/30 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#080A0A]/40 to-[#080A0A] pointer-events-none" />
        </div>

        {/* Video & Media Control Bar (Status, Play/Pause, Mute/Unmute, Toggle Photo/Video, Upload) */}
        <div className={`absolute bottom-6 ${isRtl ? 'right-6' : 'left-6'} z-20 flex flex-wrap items-center gap-2 sm:gap-2.5 bg-[#080A0A]/90 backdrop-blur-md px-3.5 sm:px-4 py-2 rounded-2xl border border-[#54d1b2]/40 text-xs text-[#FAF9F5] shadow-2xl`}>
          {/* Live Video Indicator Badge */}
          <div className={`flex items-center gap-1.5 ${isRtl ? 'pl-2 border-l' : 'pr-2 border-r'} border-[#2C3835]`}>
            <span className={`w-2 h-2 rounded-full ${visualMode === 'video' && isVideoPlaying ? 'bg-[#54d1b2] animate-pulse shadow-[0_0_8px_#54d1b2]' : 'bg-[#788784]'}`} />
            <span className="text-[11px] font-medium text-[#D1ECE3]">
              {visualMode === 'video' 
                ? (isRtl ? 'فيديو سينمائي نشط' : 'Cinematic Video Live') 
                : (isRtl ? 'صورة الحملة' : 'Editorial Photo')}
            </span>
          </div>

          {/* Switch Mode: Video <-> Photo */}
          <button
            onClick={toggleVisualMode}
            className="hover:text-[#54d1b2] text-[#A6B7B2] flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-white/5 transition-colors font-semibold"
            title={visualMode === 'video' ? (isRtl ? 'التبديل إلى الصورة' : 'Switch to Photo') : (isRtl ? 'التبديل إلى الفيديو' : 'Switch to Video')}
          >
            {visualMode === 'video' ? <Camera className="w-3.5 h-3.5 text-[#54d1b2]" /> : <Film className="w-3.5 h-3.5 text-[#54d1b2]" />}
            <span>{visualMode === 'video' ? (isRtl ? 'عرض كصورة' : 'View Photo') : (isRtl ? 'عرض كفيديو' : 'View Video')}</span>
          </button>

          {visualMode === 'video' && (
            <>
              <span className="text-[#4A5553]">•</span>

              {/* Play / Pause Button */}
              <button
                onClick={toggleVideoPlayback}
                className="text-[#54d1b2] hover:text-white flex items-center gap-1 font-bold transition-colors"
                title={isVideoPlaying ? (isRtl ? 'إيقاف مؤقت' : 'Pause') : (isRtl ? 'تشغيل' : 'Play')}
              >
                {isVideoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isVideoPlaying ? (isRtl ? 'إيقاف' : 'Pause') : (isRtl ? 'تشغيل' : 'Play')}</span>
              </button>

              <span className="text-[#4A5553]">•</span>

              {/* Mute / Unmute Button */}
              <button
                onClick={toggleMute}
                className="text-[#54d1b2] hover:text-white flex items-center gap-1 font-bold transition-colors"
                title={isMuted ? (isRtl ? 'تشغيل الصوت' : 'Unmute') : (isRtl ? 'كتم الصوت' : 'Mute')}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#788784]" /> : <Volume2 className="w-3.5 h-3.5 text-[#54d1b2]" />}
                <span>{isMuted ? (isRtl ? 'صامت' : 'Muted') : (isRtl ? 'صوت' : 'Sound')}</span>
              </button>
            </>
          )}

          <span className="text-[#4A5553]">•</span>

          {/* Select Video from Device Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#00bc7d]/20 hover:bg-[#00bc7d]/35 text-[#54d1b2] hover:text-white border border-[#54d1b2]/40 px-2.5 py-1 rounded-xl flex items-center gap-1 font-bold transition-all hover:scale-105"
            title={isRtl ? 'اختر ملف فيديو MP4 من جهازك ليعمل في الخلفية فوراً' : 'Select MP4 video from device'}
          >
            <Upload className="w-3.5 h-3.5 text-[#54d1b2]" />
            <span>{isRtl ? 'رفع فيديو آخر' : 'Upload Video'}</span>
          </button>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleVideoFileChange}
            accept="video/mp4,video/webm,video/quicktime,video/m4v"
            className="hidden"
          />

          {/* Reset button if custom video loaded */}
          {customVideoUrl && (
            <button
              onClick={resetToDefaultVideo}
              className="text-[#788784] hover:text-rose-400 p-1 transition-colors"
              title={isRtl ? 'استعادة الفيديو الأصلي للبراند' : 'Reset to default campaign video'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Grand Royal Hero Content */}
        <div className="relative max-w-5xl mx-auto text-center space-y-8 py-24 z-10">
          
          {/* Royal Atelier Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#2DD4BF]/50 bg-[#080A0A]/85 backdrop-blur-md text-[#2DD4BF] text-[11px] tracking-[0.25em] uppercase shadow-2xl font-bold">
            <Crown className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>{t('hero.tag')}</span>
          </div>

          {/* Regal Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#FFFFFF] leading-[1.12] max-w-4xl mx-auto drop-shadow-2xl">
            {t('hero.title')}
          </h1>

          {/* Royal Subtitle */}
          <p className="font-sans text-base sm:text-lg md:text-xl text-[#E6E1D5] max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
            {t('hero.subtitle')}
          </p>

          {/* Hero Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/catalog"
              className="w-full sm:w-auto bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] hover:from-[#5EEAD4] hover:to-[#2DD4BF] text-[#080A0A] font-extrabold py-4 px-8 rounded-lg text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(45,212,191,0.4)] transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span>{t('hero.cta_explore')}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>

            <Link
              href="/#fragrance-families"
              className="w-full sm:w-auto bg-[#080A0A]/85 hover:bg-[#141A19] text-[#FFFFFF] border border-[#2DD4BF]/40 py-4 px-8 rounded-lg text-xs tracking-[0.2em] uppercase font-semibold flex items-center justify-center gap-2 backdrop-blur-md transition-all duration-300 hover:border-[#2DD4BF]"
            >
              <Compass className="w-4 h-4 text-[#2DD4BF]" />
              <span>{t('hero.cta_guide')}</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-[#2DD4BF]/30 max-w-3xl mx-auto text-center bg-[#080A0A]/75 backdrop-blur-md p-5 rounded-2xl shadow-2xl">
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#FFFFFF]">{products.length}+</p>
              <p className="text-[11px] tracking-wider text-[#D5D1C7] uppercase mt-0.5">{t('stats.compositions')}</p>
            </div>
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#2DD4BF]">35%</p>
              <p className="text-[11px] tracking-wider text-[#D5D1C7] uppercase mt-0.5">{t('stats.oil_ratio')}</p>
            </div>
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#C6A66B]">100%</p>
              <p className="text-[11px] tracking-wider text-[#D5D1C7] uppercase mt-0.5">{t('stats.cod')}</p>
            </div>
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#FFFFFF]">24–48h</p>
              <p className="text-[11px] tracking-wider text-[#D5D1C7] uppercase mt-0.5">{t('stats.delivery_time')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BESTSELLERS (White Luxury Cards on Warm Cashmere Beige Canvas) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="badge-emerald px-3 py-1 rounded-sm">
              {t('section.bestsellers_tag')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#080A0A] mt-2">
              {t('section.bestsellers_title')}
            </h2>
            <p className="text-sm text-[#576563] mt-1 max-w-xl">
              {t('section.bestsellers_desc')}
            </p>
          </div>
          <Link
            href="/catalog?sort=bestselling"
            className="text-xs font-bold tracking-widest text-[#0D9488] hover:text-[#080A0A] uppercase flex items-center gap-1.5 transition-colors"
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
                <span>{isRtl ? 'معايير الفخامة العالمية المستوحاة من باريس' : 'Haute Parfumerie Global Standards'}</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                {isRtl ? 'هندسة العطر الفاخر.. ثباتٌ أسطوري وحضورٌ يأسر الحواس' : 'Olfactory Architecture & Unmatched Sillage'}
              </h2>

              <p className="text-sm sm:text-base text-[#C5CECB] leading-relaxed">
                {isRtl
                  ? 'تم تصميم كل قطرة في معملنا بالقاهرة وفق أعلى معايير الدور العالمية كـ Dior و Creed، بتركيز Extrait de Parfum يصل إلى 35% من أندر الزيوت الطبيعية النقية لضمان بقاء أثرك العطري حياً لأكثر من 14 ساعة.'
                  : 'Engineered with rare natural absolutes and a 35% Extrait de Parfum concentration, mirroring the artisanal rigor of world-class Parisian perfume houses.'}
              </p>

              {/* Dior Sauvage Style Intensity & Radar Meters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#141A19] border border-[#2DD4BF]/30">
                  <div className="flex items-center justify-between text-xs font-bold text-[#2DD4BF] mb-1">
                    <span>{isRtl ? 'الفوحان (Sillage)' : 'Sillage'}</span>
                    <span>9.8 / 10</span>
                  </div>
                  <div className="w-full bg-[#080A0A] rounded-full h-2 overflow-hidden border border-[#1A2624]">
                    <div className="bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] h-full w-[98%]" />
                  </div>
                  <p className="text-[10px] text-[#9EABA7] mt-1.5">{isRtl ? 'هالة قوية تملأ الأرجاء' : 'Dominant room-filling aura'}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#141A19] border border-[#2DD4BF]/30">
                  <div className="flex items-center justify-between text-xs font-bold text-[#2DD4BF] mb-1">
                    <span>{isRtl ? 'الثبات (Longevity)' : 'Longevity'}</span>
                    <span>+14 ساعة</span>
                  </div>
                  <div className="w-full bg-[#080A0A] rounded-full h-2 overflow-hidden border border-[#1A2624]">
                    <div className="bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] h-full w-[95%]" />
                  </div>
                  <p className="text-[10px] text-[#9EABA7] mt-1.5">{isRtl ? 'يدوم على الأقمشة لأيام' : 'Lasts on fabrics for days'}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#141A19] border border-[#C6A66B]/30">
                  <div className="flex items-center justify-between text-xs font-bold text-[#C6A66B] mb-1">
                    <span>{isRtl ? 'نسبة الزيوت' : 'Concentration'}</span>
                    <span>35% خالص</span>
                  </div>
                  <div className="w-full bg-[#080A0A] rounded-full h-2 overflow-hidden border border-[#1A2624]">
                    <div className="bg-gradient-to-r from-[#C6A66B] to-[#D4AF37] h-full w-[100%]" />
                  </div>
                  <p className="text-[10px] text-[#9EABA7] mt-1.5">{isRtl ? 'Extrait de Parfum مغلظ' : 'Pure Extrait de Parfum'}</p>
                </div>
              </div>

              {/* The Art of Gifting & Guarantee Trio */}
              <div className="pt-4 border-t border-[#1A2624] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#141A19] flex items-center justify-center text-[#2DD4BF]">
                    ✓
                  </div>
                  <span className="text-[#D5D1C7]">{isRtl ? 'عينتان مجانيتان مع كل طلب' : '2 Free discovery samples'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#141A19] flex items-center justify-center text-[#2DD4BF]">
                    ✓
                  </div>
                  <span className="text-[#D5D1C7]">{isRtl ? 'معاينة الطرد قبل الدفع كاش' : 'Inspect before cash payment'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#141A19] flex items-center justify-center text-[#C6A66B]">
                    ★
                  </div>
                  <span className="text-[#D5D1C7]">{isRtl ? 'علبة إهداء ملوكية فاخرة' : 'Signature luxury gift box'}</span>
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
                    src={bestsellers[0]?.images[0]?.url || '/images/bottle-oriental.svg'}
                    alt="A AND S Flacon"
                    className="max-h-72 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] filter contrast-125 transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Flacon Shadow */}
                  <div className="w-36 h-4 bg-black/60 rounded-full blur-md -mt-2" />
                </div>

                <div className="mt-6 text-center z-10 space-y-1">
                  <span className="text-[10px] font-mono tracking-widest text-[#2DD4BF] uppercase">
                    Signature Creation
                  </span>
                  <h4 className="font-serif text-xl font-bold text-white">
                    {bestsellers[0]?.nameEn || 'SULTAN OUD EXTRAIT'}
                  </h4>
                  <p className="text-xs text-[#C6A66B]">
                    {isRtl ? 'التوقيع العطري الأرقى في الشرق الأوسط' : 'The Most Coveted Middle Eastern Scent'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. MEDITERRANEAN RIVIERA & CITRUS COLLECTION (Campaign Photo 1: Female Model with Turquoise Scarf) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-[#E7E3D6] shadow-xl bg-[#080A0A]">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* Visual Image */}
            <div className="lg:col-span-7 relative min-h-[420px] lg:min-h-[500px]">
              <img
                src="/images/campaign/female-coastal-spray.jpg"
                alt="A AND S Mediterranean Riviera Campaign"
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.9] contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/85 via-black/35 to-transparent" />
            </div>

            {/* Editorial Copy */}
            <div className="lg:col-span-5 p-8 sm:p-12 lg:p-14 space-y-6 text-white relative z-10">
              <span className="badge-turquoise px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-widest inline-block">
                {isRtl ? 'حملة صيف الريفييرا المتوسطية' : 'Mediterranean Summer Campaign'}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                {isRtl ? 'رذاذ البحر الفيروزي.. وانتعاش الحمضيات الذهبية' : 'Turquoise Ocean Mist & Golden Citron'}
              </h2>
              <p className="text-sm text-[#C5CECB] leading-relaxed">
                {isRtl
                  ? 'مستوحاة من دفء شمس الأصيل على شواطئ البحر المتوسط، حيث تلتقي نفحات البرغموت الإيطالي النادر برحيق أزهار البرتقال ورذاذ النسيم الفيروزي العليل.'
                  : 'Inspired by golden hour sunlight on Mediterranean shores, combining rare Italian bergamot, neroli blossoms, and pure ocean mist.'}
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/catalog?family=Fresh+Citrus"
                  className="btn-turquoise py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider text-center"
                >
                  {isRtl ? 'اكتشف عطور الريفييرا' : 'Explore Riviera Scents'}
                </Link>
                <Link
                  href="/catalog"
                  className="btn-secondary !bg-transparent !text-white !border-white/30 hover:!border-[#54d1b2] hover:!text-[#54d1b2] py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider text-center"
                >
                  {isRtl ? 'مشاهدة الكتالوج الكامل' : 'View Full Catalog'}
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

      {/* 5. BRAND STORY & ARTISANAL ATELIER */}
      <section id="brand-story" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <span className="badge-emerald px-3 py-1 rounded-sm">
              {t('section.story_tag')}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#080A0A] leading-tight">
              {t('section.story_title')}
            </h2>
            <p className="text-sm sm:text-base text-[#576563] leading-relaxed">
              {t('section.story_p1')}
            </p>
            <p className="text-sm sm:text-base text-[#576563] leading-relaxed">
              {t('section.story_p2')}
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="p-4 bg-white border border-[#E6E1D5] rounded-2xl shadow-sm hover:border-[#2DD4BF] transition-colors">
                <Droplets className="w-5 h-5 text-[#0D9488] mb-2" />
                <h4 className="font-serif font-bold text-sm text-[#080A0A]">
                  {isRtl ? 'تركيز إكستري خالص 35%' : 'Pure Extrait Concentration'}
                </h4>
                <p className="text-xs text-[#576563] mt-1">
                  {isRtl ? 'تركيز زيوت عطرية يصل إلى 35% لثبات يتجاوز 14 ساعة.' : 'Up to 35% concentration offering over 14 hours of persistent trail.'}
                </p>
              </div>

              <div className="p-4 bg-white border border-[#E6E1D5] rounded-2xl shadow-sm hover:border-[#2DD4BF] transition-colors">
                <ShieldCheck className="w-5 h-5 text-[#C6A66B] mb-2" />
                <h4 className="font-serif font-bold text-sm text-[#080A0A]">
                  {isRtl ? 'معاينة ودفع عند الاستلام' : 'Inspection Before Payment'}
                </h4>
                <p className="text-xs text-[#576563] mt-1">
                  {isRtl ? 'عاين طردك الفاخر عند وصول المندوب قبل دفع أي مليم.' : 'Door-to-door insured delivery with visual inspection before cash payment.'}
                </p>
              </div>
            </div>
          </div>

          {/* Visual Showcase Block */}
          <div className="relative aspect-square sm:aspect-[4/3] bg-[#080A0A] rounded-2xl border border-[#2DD4BF]/40 p-8 flex flex-col justify-end overflow-hidden shadow-2xl text-white">
            <img
              src="/images/campaign/couple-sunset-romance.jpg"
              alt="A AND S Haute Parfumerie Couple Campaign"
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.55] contrast-110"
            />
            <div className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'}`}>
              <span className="font-serif text-6xl text-[#2DD4BF]/20 font-bold">A&S</span>
            </div>
            <div className="space-y-4 max-w-sm relative z-10">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#2DD4BF] font-bold">
                {isRtl ? 'فلسفة العطر الفاخر' : 'Signature Philosophy'}
              </span>
              <h3 className="font-serif text-2xl font-bold text-white">
                {isRtl
                  ? '«العطر ليس مجرد لمسة تجميلية، بل هو هالتك غير المرئية التي تبقى في ذاكرة المكان.»'
                  : '“A fragrance is not an accessory. It is your invisible aura.”'}
              </h3>
              <p className="text-xs text-[#D5D1C7]">
                {isRtl ? 'دار A AND S للعطور الفاخرة — القاهرة' : 'A AND S Haute Parfumerie — Cairo'}
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
            className="text-xs font-bold tracking-widest text-[#0D9488] hover:text-[#080A0A] uppercase flex items-center gap-1.5 transition-colors"
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
