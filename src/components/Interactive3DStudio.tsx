'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Box,
  CheckCircle2,
  Crown,
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

  const [activeTheme, setActiveTheme] = useState<PerfumeTheme>(themes[0]);

  // Real bottle image: priority to custom uploaded bottle, then bottle label, then official logo
  const bottleImageUrl =
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
  const [isSpraying, setIsSpraying] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [sprayedCount, setSprayedCount] = useState<number>(0);

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
    if (!autoRotate || isDragging) return;
    const interval = setInterval(() => {
      setRotationY((prev) => (prev + 0.5) % 360);
    }, 28);
    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

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

  // Dynamic light reflection calculation based on rotation
  const reflectionOffset = Math.sin((rotationY * Math.PI) / 180) * 45;

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

        {/* Studio Controls: Auto-Rotate & Audio Toggles */}
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-[#141A19] border border-white/10 hover:border-[#2DD4BF]/50 text-slate-300 hover:text-white transition-all cursor-pointer"
            title={soundEnabled ? 'كتم صوت رذاذ العطر' : 'تشغيل المؤثرات الصوتية'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#2DD4BF]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Auto-rotate toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              autoRotate
                ? 'bg-[#2DD4BF]/15 border-[#2DD4BF]/50 text-[#54d1b2]'
                : 'bg-[#141A19] border-white/10 text-slate-400 hover:text-white'
            }`}
            title="تشغيل أو إيقاف الدوران التلقائي"
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{autoRotate ? 'إيقاف الدوران' : 'دوران تلقائي'}</span>
          </button>

          {/* Reset angle */}
          <button
            onClick={() => {
              setRotationX(-5);
              setRotationY(15);
            }}
            className="p-2 rounded-xl bg-[#141A19] border border-white/10 hover:border-white/30 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="إعادة ضبط زاوية الرؤية الأصلية"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Studio Viewport */}
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
          {/* Ambient Lighting Background Halos (Dynamically colored by active theme) */}
          <div
            className="absolute w-64 h-64 sm:w-96 sm:h-96 rounded-full blur-2xl sm:blur-3xl pointer-events-none transition-all duration-700"
            style={{
              backgroundColor: activeTheme.liquidGlow,
              opacity: 0.38,
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
          {/* THE REALISTIC 3D FLACON (CSS 3D TRANSFORMED PHOTO)       */}
          {/* ======================================================== */}
          <div
            className="relative transition-transform duration-75 ease-out select-none"
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

            {/* Floating Realistic Perfume Bottle */}
            <div className="relative w-64 sm:w-72 h-84 sm:h-96 flex flex-col items-center justify-center p-2 select-none group">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={bottleImageUrl}
                  alt="3D Perfume Bottle"
                  className="max-h-full max-w-full object-contain filter contrast-110 drop-shadow-[0_25px_40px_rgba(0,0,0,0.85)] pointer-events-none select-none transition-transform duration-75"
                />

                {/* Dynamic Specular Glass Glare Stripe across the bottle as it rotates */}
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
          </div>

          {/* Bottom In-Viewport Quick Action Strip */}
          <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={triggerSpray}
                className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 bg-gradient-to-r from-[#00bc7d] to-[#2DD4BF] text-[#080A0A] shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                title="اضغط لتجربة رذاذ العطر"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>بخ رذاذ العطر ({sprayedCount})</span>
              </button>
            </div>

            <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] text-slate-400 font-mono">
              زاوية الدوران: {Math.round(rotationY)}° أفقي / {Math.round(rotationX)}° رأسي
            </div>
          </div>
        </div>

        {/* Right Column: Theme Selector & Royal Specs */}
        <div className="lg:col-span-4 bg-[#0A0E0D] border-t lg:border-t-0 lg:border-r border-[#2DD4BF]/20 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5" />
                <span>اختر التوقيع العطري لتغيير هالة الزجاجة:</span>
              </div>
              <h4 className="font-serif text-lg font-bold text-white mt-1">
                توليفات رحيق الاستثنائية
              </h4>
              <p className="text-xs text-[#9EABA7] mt-0.5">
                اضغط على أي توليفة لرؤية تأثير انعكاس الزيوت الفاخرة وهالتها على الزجاجة:
              </p>
            </div>

            {/* Theme Selector Cards */}
            <div className="space-y-2.5">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setActiveTheme(theme)}
                  className={`w-full text-right p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
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
                  <span>نسبة التركيز:</span>
                  <strong className="text-[#2DD4BF] font-mono">25% Extrait de Parfum</strong>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="pt-4 border-t border-white/10">
            <a
              href="#bestsellers"
              className="w-full bg-gradient-to-r from-[#00bc7d] to-[#2DD4BF] hover:opacity-95 text-[#080A0A] font-extrabold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-transform hover:scale-[1.02] cursor-pointer"
            >
              <span>طلب عطور الدار بنفس المواصفات الملكية ←</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
