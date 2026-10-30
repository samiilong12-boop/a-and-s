'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Layers,
  Box,
  Eye,
  Sliders,
  CheckCircle2,
  ExternalLink,
  Flame,
  Droplets,
  Share2,
} from 'lucide-react';
import { useSiteContent } from '@/context/SiteContentContext';

interface PerfumeTheme {
  id: string;
  nameAr: string;
  nameEn: string;
  liquidColor: string;
  liquidGlow: string;
  liquidGradient: string;
  labelBg: string;
  notes: string;
  accentColor: string;
}

const PERFUME_THEMES: PerfumeTheme[] = [
  {
    id: 'sultan-oud',
    nameAr: 'سلطان العود الملكي (Sultan Oud)',
    nameEn: 'Sultan Oud Royal Extrait',
    liquidColor: 'rgba(212, 175, 55, 0.45)',
    liquidGlow: 'rgba(212, 175, 55, 0.35)',
    liquidGradient: 'linear-gradient(180deg, rgba(243, 231, 196, 0.3) 0%, rgba(212, 175, 55, 0.65) 60%, rgba(140, 98, 7, 0.85) 100%)',
    labelBg: '#080A0A',
    notes: 'دهن عود كمبودي معتق • عنبر ملكي • خشب الصندل السريلانكي',
    accentColor: '#D4AF37',
  },
  {
    id: 'riviera-turquoise',
    nameAr: 'ريفييرا كوت دازور (Riviera Azure)',
    nameEn: 'Riviera Azure Mist',
    liquidColor: 'rgba(45, 212, 191, 0.45)',
    liquidGlow: 'rgba(45, 212, 191, 0.4)',
    liquidGradient: 'linear-gradient(180deg, rgba(94, 234, 212, 0.3) 0%, rgba(45, 212, 191, 0.65) 60%, rgba(13, 148, 136, 0.85) 100%)',
    labelBg: '#091514',
    notes: 'برغموت كالابريا • نسيم البحر الأبيض المتوسط • زهر البرتقال',
    accentColor: '#2DD4BF',
  },
  {
    id: 'damask-rose',
    nameAr: 'الورد الطائفي المخملي (Velvet Rose)',
    nameEn: 'Velvet Taif Rose',
    liquidColor: 'rgba(244, 63, 94, 0.4)',
    liquidGlow: 'rgba(244, 63, 94, 0.35)',
    liquidGradient: 'linear-gradient(180deg, rgba(253, 164, 175, 0.3) 0%, rgba(244, 63, 94, 0.6) 60%, rgba(159, 18, 57, 0.85) 100%)',
    labelBg: '#150A0E',
    notes: 'ورد طائفي ودمشقي قطفة أولى • مسك أبيض خالص • فانيليا بوربون',
    accentColor: '#FB7185',
  },
  {
    id: 'sauvage-obsidian',
    nameAr: 'إكسير الليل الأسود (Obsidian Noir)',
    nameEn: 'Obsidian Noir Intense',
    liquidColor: 'rgba(30, 41, 59, 0.75)',
    liquidGlow: 'rgba(56, 189, 248, 0.25)',
    liquidGradient: 'linear-gradient(180deg, rgba(51, 65, 85, 0.4) 0%, rgba(15, 23, 42, 0.85) 60%, rgba(2, 6, 23, 0.95) 100%)',
    labelBg: '#020617',
    notes: 'لافندر عضوي مقطر • هيل غواتيمالي • توابل حارة وخشب الأرز',
    accentColor: '#38BDF8',
  },
];

const SKETCHFAB_PRESETS = [
  {
    id: 'e6b54199c0174e92822a106fcebfa945',
    title: 'زجاجة عطر بلورية فاخرة (Crystal Glass Flacon)',
    author: 'Creative Frames Studio',
  },
  {
    id: '7b7ad9a4e8d3433fa6f20220cb95c808',
    title: 'زجاجة عطر نيش باريسية (Parisian Luxury Bottle)',
    author: 'Digital Artisans',
  },
  {
    id: '433146e29780447385ceb52b2dfbe97e',
    title: 'زجاجة عود شرقية بزخارف ملكية (Royal Flacon Design)',
    author: 'Haute Studio 3D',
  },
];

export function Interactive3DStudio() {
  const { siteContent } = useSiteContent();

  const themes: PerfumeTheme[] = useMemo(() => [
    {
      ...PERFUME_THEMES[0],
      nameAr: siteContent.studioTheme1NameAr || PERFUME_THEMES[0].nameAr,
      notes: siteContent.studioTheme1Notes || PERFUME_THEMES[0].notes,
    },
    {
      ...PERFUME_THEMES[1],
      nameAr: siteContent.studioTheme2NameAr || PERFUME_THEMES[1].nameAr,
      notes: siteContent.studioTheme2Notes || PERFUME_THEMES[1].notes,
    },
    {
      ...PERFUME_THEMES[2],
      nameAr: siteContent.studioTheme3NameAr || PERFUME_THEMES[2].nameAr,
      notes: siteContent.studioTheme3Notes || PERFUME_THEMES[2].notes,
    },
    {
      ...PERFUME_THEMES[3],
      nameAr: siteContent.studioTheme4NameAr || PERFUME_THEMES[3].nameAr,
      notes: siteContent.studioTheme4Notes || PERFUME_THEMES[3].notes,
    },
  ], [siteContent]);

  const [viewMode, setViewMode] = useState<'interactive' | 'sketchfab'>('interactive');
  const [flaconDisplayMode, setFlaconDisplayMode] = useState<'photo' | 'crystal'>('photo');
  const [activeTheme, setActiveTheme] = useState<PerfumeTheme>(themes[0]);

  // Sync display mode with site content
  useEffect(() => {
    if (siteContent.studioBottleMode) {
      setFlaconDisplayMode(siteContent.studioBottleMode === 'crystal' ? 'crystal' : 'photo');
    }
  }, [siteContent.studioBottleMode]);

  const customBottleImg =
    siteContent.studioCustomBottleImage ||
    siteContent.studioBottleLabelImage ||
    '/images/raheeq-official-logo.png';

  useEffect(() => {
    setActiveTheme((prev) => {
      const found = themes.find((t) => t.id === prev.id);
      return found || themes[0];
    });
  }, [themes]);

  // 3D Rotation State
  const [rotationX, setRotationX] = useState<number>(-5);
  const [rotationY, setRotationY] = useState<number>(15);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [capOpen, setCapOpen] = useState<boolean>(false);
  const [isSpraying, setIsSpraying] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [sprayedCount, setSprayedCount] = useState<number>(0);

  // Sketchfab State
  const [sketchfabModelId, setSketchfabModelId] = useState<string>(
    siteContent.studio3DSketchfabModelId || SKETCHFAB_PRESETS[0].id
  );
  const [customModelInput, setCustomModelInput] = useState<string>('');

  useEffect(() => {
    if (siteContent.studio3DSketchfabModelId) {
      setSketchfabModelId(siteContent.studio3DSketchfabModelId);
    }
  }, [siteContent.studio3DSketchfabModelId]);

  if (siteContent.enableStudio3D === false) {
    return null;
  }

  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play spray sound using Web Audio API synthesis (0 external asset dependency)
  const playSprayAudio = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Generate white noise for whoosh spray effect
      const bufferSize = ctx.sampleRate * 0.45;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      // Bandpass filter to sculpt the aerosol hiss
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, ctx.currentTime);
      filter.Q.setValueAtTime(1.8, ctx.currentTime);

      // Gain envelope
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.28, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.42);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      whiteNoise.start();
    } catch {
      // Audio autoplay policy fallback
    }
  }, [soundEnabled]);

  // Handle Spray Action
  const triggerSpray = () => {
    setIsSpraying(true);
    setSprayedCount((c) => c + 1);
    playSprayAudio();
    setTimeout(() => setIsSpraying(false), 900);
  };

  // Auto-rotation loop
  useEffect(() => {
    if (!autoRotate || isDragging || viewMode !== 'interactive') return;
    const interval = setInterval(() => {
      setRotationY((prev) => (prev + 0.5) % 360);
    }, 28);
    return () => clearInterval(interval);
  }, [autoRotate, isDragging, viewMode]);

  // Mouse & Touch drag rotation handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;

    setRotationY((prev) => (prev + deltaX * 0.65) % 360);
    setRotationX((prev) => Math.max(-45, Math.min(45, prev - deltaY * 0.5)));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Extract ID from user input if they paste a full URL
  const handleApplyCustomModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customModelInput.trim()) return;

    let id = customModelInput.trim();
    // Parse sketchfab url: https://sketchfab.com/3d-models/something-abc123def456
    const urlMatch = id.match(/\/([a-zA-Z0-9]{32})/);
    if (urlMatch && urlMatch[1]) {
      id = urlMatch[1];
    }
    setSketchfabModelId(id);
    setCustomModelInput('');
  };

  // Dynamic light reflection calculation based on rotation
  const reflectionOffset = Math.sin((rotationY * Math.PI) / 180) * 45;
  const backReflection = Math.cos((rotationY * Math.PI) / 180);

  return (
    <div
      id="3d-studio"
      className="bg-[#050707] rounded-3xl border border-[#D4AF37]/30 shadow-2xl overflow-hidden text-[#FAF9F5] my-12"
    >
      {/* Top Studio Bar */}
      <div className="bg-[#0D1211] border-b border-[#2DD4BF]/20 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#141A19] border border-[#2DD4BF]/40 flex items-center justify-center text-[#54d1b2] shadow-lg">
            <Box className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest uppercase bg-[#2DD4BF]/15 text-[#54d1b2] px-2.5 py-0.5 rounded-full font-mono font-bold border border-[#2DD4BF]/30">
                {siteContent.studio3DBadge || 'معمل رحيق 3D • عطور نيش ملكية'}
              </span>
              <span className="text-[10px] text-[#D4AF37] font-bold">360° Real-time WebGL</span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-white mt-0.5">
              {siteContent.studio3DHeadline || 'استوديو فحص وتحريك الزجاجة الملكية ثلاثي الأبعاد'}
            </h3>
            {siteContent.studio3DSubtitle && (
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                {siteContent.studio3DSubtitle}
              </p>
            )}
          </div>
        </div>

        {/* View Switcher: Real Photo 3D Flacon vs Crystal Flacon vs Sketchfab 3D Embed */}
        <div className="bg-[#141A19] p-1 rounded-xl border border-white/10 flex items-center gap-1 flex-wrap">
          <button
            onClick={() => {
              setViewMode('interactive');
              setFlaconDisplayMode('photo');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'interactive' && flaconDisplayMode === 'photo'
                ? 'bg-gradient-to-r from-[#00bc7d] to-[#2DD4BF] text-[#080A0A] shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>الزجاجة الواقعية 3D</span>
          </button>

          <button
            onClick={() => {
              setViewMode('interactive');
              setFlaconDisplayMode('crystal');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'interactive' && flaconDisplayMode === 'crystal'
                ? 'bg-gradient-to-r from-[#00bc7d] to-[#2DD4BF] text-[#080A0A] shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>الكريستال الأتيليه</span>
          </button>

          <button
            onClick={() => setViewMode('sketchfab')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'sketchfab'
                ? 'bg-[#D4AF37] text-[#080A0A] shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>سكتش فاب (Sketchfab)</span>
          </button>
        </div>
      </div>

      {/* Main Studio Viewport */}
      {viewMode === 'interactive' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          {/* 3D Canvas / Viewport Column */}
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="lg:col-span-8 relative flex items-center justify-center p-4 sm:p-8 select-none cursor-grab active:cursor-grabbing overflow-hidden contain-paint bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#131B19] via-[#090D0C] to-[#040606]"
            style={{ perspective: '1100px', touchAction: 'none' }}
          >
            {/* Ambient Lighting Background Halos */}
            <div
              className="absolute w-64 h-64 sm:w-96 sm:h-96 rounded-full blur-2xl sm:blur-3xl pointer-events-none transition-all duration-700"
              style={{
                backgroundColor: activeTheme.liquidGlow,
                opacity: 0.35,
                transform: `translate(${reflectionOffset * 0.8}px, 0px)`,
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(212,175,55,0.12),transparent_70%)] pointer-events-none" />

            {/* Instruction Floating Pill */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-[11px] text-[#A2ADA9] flex items-center gap-2">
              <RotateCcw className="w-3 h-3 text-[#2DD4BF] animate-spin" style={{ animationDuration: '6s' }} />
              <span>المس وحرّك الزجاجة في أي اتجاه 360°</span>
            </div>

            {/* Interactive Spray Particle Mist Container */}
            {isSpraying && (
              <div className="absolute top-1/4 z-30 pointer-events-none flex flex-col items-center">
                <div className="w-48 h-48 relative animate-ping">
                  <div
                    className="absolute inset-0 rounded-full blur-xl"
                    style={{ backgroundColor: activeTheme.accentColor, opacity: 0.7 }}
                  />
                </div>
                {/* Micro Particle Drops */}
                <div className="absolute -top-12 flex gap-4">
                  {[...Array(12)].map((_, i) => (
                    <span
                      key={i}
                      className="inline-block w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{
                        backgroundColor: activeTheme.accentColor,
                        boxShadow: `0 0 10px ${activeTheme.accentColor}`,
                        animationDelay: `${i * 45}ms`,
                        animationDuration: '600ms',
                        transform: `translate(${(i - 6) * 14}px, ${Math.sin(i) * -20}px)`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* THE 3D FLACON (CRAFTED WITH PRECISION CSS 3D TRANSFORM)  */}
            {/* ======================================================== */}
            <div
              className="relative transition-transform duration-75 ease-out"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
              }}
            >
              {/* Bottle Pedestal Shadow */}
              <div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-10 rounded-full bg-black/80 blur-md pointer-events-none"
                style={{
                  transform: `translateZ(-40px) scale(${1 - Math.abs(rotationX) * 0.01})`,
                }}
              />

              {/* ---------------------------------------------------- */}
              {/* DISPLAY MODE 1: REALISTIC PHOTO-BASED 3D BOTTLE VIEW */}
              {/* ---------------------------------------------------- */}
              {flaconDisplayMode === 'photo' && customBottleImg ? (
                <div className="relative w-60 sm:w-72 h-80 sm:h-96 flex flex-col items-center justify-center p-2 select-none group">
                  {/* Floating Realistic Perfume Bottle with Volumetric Lighting */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={customBottleImg}
                      alt="3D Perfume Bottle"
                      className="max-h-full max-w-full object-contain filter contrast-110 drop-shadow-[0_25px_40px_rgba(0,0,0,0.85)] pointer-events-none select-none transition-transform duration-75"
                    />

                    {/* Dynamic Specular Glass Glare Stripe across the real bottle */}
                    <div
                      className="absolute inset-y-2 w-28 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none mix-blend-overlay transition-transform duration-75 rounded-2xl"
                      style={{
                        transform: `translateX(${reflectionOffset * 1.5}px) skewX(-20deg)`,
                      }}
                    />

                    {/* Interactive Spray Nozzle Hotspot at Top */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerSpray();
                      }}
                      className="absolute top-2 w-8 h-8 rounded-full bg-white/10 hover:bg-[#2DD4BF]/30 border border-[#2DD4BF]/50 flex items-center justify-center text-[#2DD4BF] transition-all shadow-lg cursor-pointer"
                      title="اضغط هنا لرش رذاذ العطر من الزجاجة"
                    >
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </button>
                  </div>
                </div>
              ) : (
                /* ---------------------------------------------------- */
                /* DISPLAY MODE 2: HEAVY BEVELED CRYSTAL ATELIER FLACON */
                /* ---------------------------------------------------- */
                <>
                  {/* 1. MAGNETIC CAP */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setCapOpen(!capOpen);
                    }}
                    className={`relative mx-auto w-24 h-16 rounded-t-lg border-2 border-[#D4AF37] cursor-pointer transition-all duration-500 shadow-2xl flex flex-col items-center justify-center ${
                      capOpen ? '-translate-y-16 scale-105' : 'translate-y-0'
                    }`}
                    style={{
                      background:
                        'linear-gradient(135deg, #FAF0D7 0%, #D4AF37 35%, #8C6207 70%, #F5E6BE 100%)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.7)',
                    }}
                    title={capOpen ? 'اضغط لتركيب الغطاء المغناطيسي' : 'اضغط لنزع الغطاء المغناطيسي'}
                  >
                    {/* Crown Gem Ring */}
                    <div className="w-8 h-2 rounded-full bg-[#162220] border border-[#2DD4BF] shadow-[0_0_8px_#2DD4BF]" />
                    <span className="text-[8px] font-mono tracking-widest text-slate-900 font-extrabold mt-1 uppercase">
                      RAHEEQ
                    </span>

                    {/* Floating Tooltip When Hovered */}
                    <span className="absolute -top-7 px-2 py-0.5 rounded bg-black/80 text-[9px] text-[#D4AF37] font-bold border border-[#D4AF37]/40 opacity-0 hover:opacity-100 transition-opacity">
                      {capOpen ? 'تركيب الغطاء' : 'نزع الغطاء'}
                    </span>
                  </div>

                  {/* 2. SPRAY NOZZLE & ATOMIZER COLLAR */}
                  <div className="relative mx-auto w-12 h-6 bg-gradient-to-r from-[#D4AF37] via-[#FDF5E2] to-[#8C6207] border-x border-[#D4AF37] flex items-center justify-center shadow-inner">
                    {/* Nozzle Orifice */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerSpray();
                      }}
                      className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-[#D4AF37] cursor-pointer hover:scale-125 transition-transform shadow-xs"
                      title="اضغط هنا لرش رذاذ العطر"
                    />
                  </div>

                  {/* 3. HEAVY BEVELED CRYSTAL FLACON (BOTTLE BODY) */}
                  <div
                    className="relative w-56 h-80 rounded-2xl border-2 border-white/30 backdrop-blur-md overflow-hidden flex flex-col justify-between p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0.45) 100%)',
                      boxShadow:
                        'inset 0 0 25px rgba(255,255,255,0.2), 0 25px 60px rgba(0,0,0,0.85), inset 0 2px 2px rgba(255,255,255,0.6)',
                    }}
                  >
                    {/* Dynamic Specular Glass Glare Stripe */}
                    <div
                      className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none transition-transform duration-75"
                      style={{
                        transform: `translateX(${reflectionOffset + 90}px) skewX(-20deg)`,
                      }}
                    />

                    {/* Fragrance Liquid (Interactive Depth & Meniscus) */}
                    <div
                      className="absolute inset-x-2 bottom-2 rounded-b-xl transition-all duration-700 pointer-events-none overflow-hidden"
                      style={{
                        height: '84%',
                        background: activeTheme.liquidGradient,
                        boxShadow: `inset 0 10px 30px ${activeTheme.liquidColor}, 0 0 20px ${activeTheme.liquidGlow}`,
                      }}
                    >
                      {/* Internal Dip Tube (خرطوم السحب الشفاف) */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-full bg-white/25 rounded-full border-r border-white/20 shadow-xs" />

                      {/* Shimmering Liquid Bubbles */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.25),transparent_40%)]" />
                    </div>

                    {/* Beveled Luxury Front Metallic Crest & Label */}
                    <div
                      className="relative z-10 my-auto mx-auto w-40 py-6 px-4 rounded-xl border border-[#D4AF37]/70 text-center shadow-2xl backdrop-blur-lg flex flex-col items-center justify-center space-y-1.5"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(14,20,19,0.95) 0%, rgba(8,10,10,0.98) 100%)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.9), inset 0 0 15px rgba(212,175,55,0.15)',
                      }}
                    >
                      {/* Gold Royal Crest or Custom Bottle Image */}
                      {siteContent.studioBottleLabelImage ? (
                        <img
                          src={siteContent.studioBottleLabelImage}
                          alt="Bottle Label"
                          className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]/70 shadow-md mb-1"
                        />
                      ) : siteContent.brandLogoUrl ? (
                        <img
                          src={siteContent.brandLogoUrl}
                          alt="Brand Logo"
                          className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]/70 shadow-md mb-1"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full border border-[#D4AF37]/60 flex items-center justify-center text-[#D4AF37] mb-1">
                          <span className="font-serif font-extrabold text-xs">AS</span>
                        </div>
                      )}

                      <span className="font-serif text-sm tracking-[0.25em] text-[#D4AF37] font-extrabold uppercase">
                        R A H E E Q
                      </span>
                      <span className="text-[9px] tracking-[0.2em] text-[#FAF9F5] font-sans font-bold uppercase block">
                        {activeTheme.nameEn}
                      </span>
                      <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#2DD4BF] to-transparent my-1" />
                      <span className="text-[8px] tracking-[0.28em] text-[#2DD4BF] font-mono font-extrabold uppercase block">
                        25% EXTRAIT DE PARFUM
                      </span>
                    </div>

                    {/* Base Crystal Heavy Glass Bottom */}
                    <div className="relative z-10 w-full h-7 rounded-b-xl border-t border-white/20 bg-gradient-to-t from-white/10 to-transparent flex items-center justify-center">
                      <span className="text-[8px] font-mono tracking-widest text-slate-400 font-bold uppercase">
                        100ml • 3.4 FL. OZ • CAIRO
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bottom In-Viewport Quick Action Strip */}
            <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md border transition-all ${
                    autoRotate
                      ? 'bg-[#2DD4BF]/20 border-[#2DD4BF]/50 text-[#54d1b2]'
                      : 'bg-black/60 border-white/15 text-slate-300'
                  }`}
                  title="تشغيل أو إيقاف الدوران التلقائي"
                >
                  {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{autoRotate ? 'إيقاف الدوران' : 'دوران 360°'}</span>
                </button>

                <button
                  onClick={() => {
                    setRotationX(-5);
                    setRotationY(15);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-black/60 hover:bg-black/80 border border-white/15 text-slate-300 flex items-center gap-1.5 backdrop-blur-md transition-colors"
                  title="إعادة الزاوية الأصلية"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة الضبط</span>
                </button>
              </div>

              {/* Sound & Spray Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-xl bg-black/60 border border-white/15 text-slate-300 hover:text-white backdrop-blur-md transition-colors"
                  title={soundEnabled ? 'كتم صوت الرذاذ' : 'تشغيل صوت الرذاذ'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-[#2DD4BF]" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  onClick={triggerSpray}
                  className="bg-gradient-to-r from-[#D4AF37] to-[#F3E7C4] hover:opacity-95 text-[#080A0A] font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xl transition-transform active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>رش رذاذ العطر ({sprayedCount})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Control & Customization Sidebar */}
          <div className="lg:col-span-4 bg-[#090D0C] p-6 border-t lg:border-t-0 lg:border-r border-[#2DD4BF]/20 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold block">
                  Interactive Scent Palette
                </span>
                <h4 className="font-serif text-lg font-bold text-white mt-0.5">
                  تغيير تركيبة وسحر سائل العطر
                </h4>
                <p className="text-xs text-[#9EABA7] mt-1 leading-relaxed">
                  اختر بين التوليفات الحصرية لترى كيف يتغير لون الزجاجة وانعكاسات الضوء وكثافة الزيت:
                </p>
              </div>

              {/* Theme Selector Cards */}
              <div className="space-y-2.5">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setActiveTheme(theme)}
                    className={`w-full text-right p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      activeTheme.id === theme.id
                        ? 'bg-[#141A19] border-[#2DD4BF] shadow-lg shadow-[#2DD4BF]/10'
                        : 'bg-[#0E1413] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/30 flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: theme.accentColor }}
                        />
                        <strong className="text-xs text-white font-bold">{theme.nameAr}</strong>
                      </div>
                      <p className="text-[10px] text-[#869692]">{theme.notes}</p>
                    </div>

                    {activeTheme.id === theme.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Flacon Physics & Details Card */}
              <div className="p-4 rounded-2xl bg-[#0E1413] border border-white/10 space-y-2.5">
                <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest block">
                  مواصفات الزجاجة المعروضة:
                </span>
                <ul className="space-y-1.5 text-xs text-[#A2ADA9]">
                  <li className="flex items-center justify-between">
                    <span>الوزن الصافي للزجاج:</span>
                    <strong className="text-white font-mono">420g بلور ثقيل</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>الغطاء:</span>
                    <strong className="text-[#D4AF37]">مغناطيسي مطلي 24K</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>مضخة الرش (Atomizer):</span>
                    <strong className="text-white font-mono">رذاذ مخملي فائق النعومة</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>زاوية الدوران الحالية:</span>
                    <strong className="text-[#2DD4BF] font-mono">
                      {Math.round(rotationY)}° أفقي / {Math.round(rotationX)}° رأسي
                    </strong>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="pt-4 border-t border-white/10">
              <a
                href="#bestsellers"
                className="w-full bg-gradient-to-r from-[#00bc7d] to-[#2DD4BF] hover:opacity-95 text-[#080A0A] font-extrabold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-transform hover:scale-[1.02]"
              >
                <span>طلب عطور الدار بنفس المواصفات الملكية ←</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* SKETCHFAB 3D EMBED VIEWER MODE                           */
        /* ======================================================== */
        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0E1413] p-4 rounded-2xl border border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-[#D4AF37]" />
                <h4 className="font-bold text-sm text-white">
                  عارض سكتش فاب المباشر (Official Sketchfab 3D Embed)
                </h4>
              </div>
              <p className="text-xs text-[#9EABA7] mt-0.5">
                يمكنك التفاعل مع الموديل المرفوع على منصة Sketchfab بجميع خاماته وإضاءته، أو تجربة كود موديل عطر خاص بك:
              </p>
            </div>

            {/* Custom Model ID Form */}
            <form onSubmit={handleApplyCustomModel} className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                value={customModelInput}
                onChange={(e) => setCustomModelInput(e.target.value)}
                placeholder="الصق رابط أو معرف موديل من Sketchfab..."
                className="bg-[#141A19] border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 w-full md:w-72 focus:outline-none focus:border-[#D4AF37]"
              />
              <button
                type="submit"
                className="bg-[#D4AF37] hover:bg-[#C6A66B] text-slate-900 font-bold px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-colors"
              >
                تحميل الموديل
              </button>
            </form>
          </div>

          {/* Quick Preset Selector Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-bold">نماذج مقترحة:</span>
            {SKETCHFAB_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setSketchfabModelId(preset.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  sketchfabModelId === preset.id
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                    : 'bg-[#141A19] border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                {preset.title}
              </button>
            ))}
          </div>

          {/* Sketchfab iFrame Viewer */}
          <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
            <iframe
              title="Sketchfab 3D Perfume Model"
              className="w-full h-full border-0"
              src={`https://sketchfab.com/models/${sketchfabModelId}/embed?autostart=1&camera=0&preload=1&ui_theme=dark&ui_watermark=0`}
              allow="autoplay; fullscreen; xr-spatial-tracking"
              allowFullScreen
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
            <span>
              يمكنك البحث على موقع <strong className="text-white">Sketchfab.com</strong> عن أي زجاجة عطر، ونسخ الـ Model ID ووضعه في الخانة بالأعلى ليعمل فوراً.
            </span>
            <a
              href="https://sketchfab.com/search?q=perfume+bottle&type=models"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2DD4BF] hover:underline flex items-center gap-1 font-bold"
            >
              <span>تصفح موديلات العطور على Sketchfab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
