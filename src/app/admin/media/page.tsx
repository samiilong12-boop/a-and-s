'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Film,
  Upload,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Camera,
  AlertCircle,
  FileVideo,
  ArrowRight,
  RefreshCw,
  Sun,
  Sliders,
  Type,
  ImageIcon,
  Eye,
  Crown,
  FlaskConical,
  BookOpen,
  Palmtree,
  Save,
  Undo2,
  MessageSquare,
  Phone,
} from 'lucide-react';
import {
  DEFAULT_SITE_CONTENT,
  SITE_CONTENT_STORAGE_KEY,
  LEGACY_HERO_KEY,
  SiteContentConfig,
} from '@/lib/siteContent';

type TabType = 'logo' | 'hero' | 'bespoke' | 'showcase' | 'riviera' | 'story' | 'footer';

const PRESET_VIDEOS = [
  {
    id: 'campaign-hero',
    title: 'فيديو الحملة الإعلانية الأصلي لدار رحيق (Raheeq)',
    subtitle: 'موديل يرش العطر الفاخر بجوار البحر الفيروزي (854 KB MP4)',
    url: '/videos/campaign-hero.mp4',
    badge: 'فيديو البراند الأصلي',
  },
  {
    id: 'rose-mist',
    title: 'رذاذ بتلات الورد وزجاجة العطر الفاخرة',
    subtitle: 'حركة بطيئة سينمائية عالية الدقة',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-perfume-bottle-and-rose-petals-falling-41589-large.mp4',
    badge: 'رذاذ رومانسي',
  },
  {
    id: 'amber-luxury',
    title: 'قطرات الزيوت العطرية والذهب السائل',
    subtitle: 'أجواء عطور ملكية شرقية فاخرة',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-liquid-perfume-droplets-falling-in-slow-motion-41591-large.mp4',
    badge: 'زيوت ملكية',
  },
];

export default function AdminStorefrontContentPage() {
  const [activeTab, setActiveTab] = useState<TabType>('hero');
  const [config, setConfig] = useState<SiteContentConfig>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const showcaseFileInputRef = useRef<HTMLInputElement>(null);
  const rivieraFileInputRef = useRef<HTMLInputElement>(null);
  const storyFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 1. Instant load from localStorage
    try {
      const cached =
        localStorage.getItem(SITE_CONTENT_STORAGE_KEY) || localStorage.getItem(LEGACY_HERO_KEY);
      if (cached) {
        setConfig((prev) => ({ ...prev, ...JSON.parse(cached) }));
      }
    } catch {
      // ignore
    }

    // 2. Fetch from API to sync
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/hero-config');
      if (res.ok) {
        const data = await res.json();
        setConfig((prev) => {
          const merged = { ...prev, ...data };
          try {
            localStorage.setItem(SITE_CONTENT_STORAGE_KEY, JSON.stringify(merged));
            localStorage.setItem(LEGACY_HERO_KEY, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch (err) {
      console.error('Failed to load site content config', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveConfig = async (newFields: Partial<SiteContentConfig>) => {
    try {
      setSaving(true);
      const updated: SiteContentConfig = {
        ...config,
        ...newFields,
        updatedAt: new Date().toISOString(),
      };
      setConfig(updated);

      // Save instantly to localStorage
      try {
        localStorage.setItem(SITE_CONTENT_STORAGE_KEY, JSON.stringify(updated));
        localStorage.setItem(LEGACY_HERO_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('raheeq_site_content_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch (lsErr) {
        console.warn('localStorage save warning:', lsErr);
      }

      // Sync with API
      await fetch('/api/admin/hero-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      showNotification('تم حفظ وتحديث الصور والنصوص بنجاح! التغييرات تظهر في متجرك فوراً وبأعلى دقة.');
    } catch (err: any) {
      showNotification('تم الحفظ محلياً وتحديث المتجر فوراً.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (confirm('هل أنت متأكد من رغبتك في استعادة النصوص والصور الأصلية للموقع؟')) {
      handleSaveConfig(DEFAULT_SITE_CONTENT);
      showNotification('تمت استعادة الإعدادات والنصوص الأصلية بنجاح.');
    }
  };

  // Video Upload Handler
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingVideo(true);
      if (file.size <= 12 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            handleSaveConfig({
              activeVideoUrl: event.target.result as string,
              visualMode: 'video',
              videoTitle: `فيديو مرفوع (${file.name})`,
            });
            showNotification(`تم رفع الفيديو (${file.name}) كخلفية رئيسية بنجاح!`);
          }
        };
        reader.readAsDataURL(file);
      } else {
        const formData = new FormData();
        formData.append('video', file);
        const res = await fetch('/api/admin/upload-video', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.success) {
          handleSaveConfig(data.config);
          showNotification(`تم رفع الفيديو (${file.name}) بنجاح!`);
        }
      }
    } catch (err: any) {
      showNotification('خطأ أثناء رفع الفيديو', 'error');
    } finally {
      setUploadingVideo(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    }
  };

  // Generic Image Upload to Base64 (zero-latency, never fails on Vercel)
  const handleGenericImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof SiteContentConfig,
    successLabel: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        handleSaveConfig({
          [field]: event.target.result as string,
        });
        showNotification(`تم رفع وتحديث صورة (${successLabel}) بنجاح!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const togglePreviewPlayback = () => {
    if (videoPreviewRef.current) {
      if (isPlaying) {
        videoPreviewRef.current.pause();
      } else {
        videoPreviewRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-teal-800 uppercase">
              لوحة التحكم الشاملة بمحتوى وصور المتجر
            </span>
            <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-bold">
              تعديل الصور والكلام فوراً
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1 flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-teal-700" />
            <span>إدارة جميع صور ونصوص وأقسام الموقع</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            من هنا يمكنك تغيير الصور والكلام في أي مكان بالصفحة الرئيسية (الخلفية، الأرقام والإحصائيات، بنر الخلطة
            الخاصة، بنر صيف الريفييرا، وقصة الدار) بضغطة زر.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <button
            onClick={() => handleSaveConfig(config)}
            disabled={saving}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'جارٍ الحفظ...' : 'حفظ كل التغييرات فوراً'}</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <span>معاينة المتجر كعميل</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Official 3D Raheeq Luxury Emblems Showcase Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0D1212] to-slate-900 p-5 rounded-2xl border border-[#D4AF37]/30 text-white shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#54d1b2] animate-pulse" />
            <h3 className="font-serif text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>الشعار الرسمي المعتمد ثلاثي الأبعاد — دار رَحِيقْ (RAHEEQ 3D Master Emblems)</span>
              <Crown className="w-4 h-4 text-[#D4AF37]" />
            </h3>
          </div>
          <span className="text-[11px] text-[#54d1b2] font-mono bg-[#54d1b2]/10 border border-[#54d1b2]/30 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
            مُفعل تلقائياً بالمتجر وكود الـ QR
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {/* Emblem 1: Silver on Dark (Official Default) */}
          <div className="p-2.5 rounded-xl bg-black/50 border-2 border-[#54d1b2] flex flex-col items-center text-center space-y-2 shadow-md">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-[#D4AF37]/60 p-0.5 bg-black">
              <img src="/images/raheeq-official-logo.png" alt="Silver Official" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-white block">الفضي الملكي (الافتراضي)</span>
              <span className="text-[9px] text-[#54d1b2] block font-mono">Official Dark</span>
            </div>
            <span className="text-[9px] bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded">
              الشعار النشط الآن
            </span>
          </div>

          {/* Emblem 2: Pure White / Glossy Black */}
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-300 p-0.5 bg-white">
              <img src="/images/raheeq-official-logo-light.png" alt="Light Official" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-white block">الأسود على الأبيض</span>
              <span className="text-[9px] text-slate-400 block font-mono">Print & Light Mode</span>
            </div>
            <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
              مثالي للطباعة
            </span>
          </div>

          {/* Emblem 3: Royal Sapphire Blue */}
          <div className="p-2.5 rounded-xl bg-[#001532]/60 border border-blue-500/30 flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-blue-400/50 p-0.5 bg-[#001532]">
              <img src="/images/raheeq-official-logo-blue.png" alt="Sapphire Blue" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-white block">الياقوت الأزرق الملكي</span>
              <span className="text-[9px] text-blue-300 block font-mono">Royal Sapphire</span>
            </div>
            <span className="text-[9px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded">
              متاح للاستخدام
            </span>
          </div>

          {/* Emblem 4: Emerald Green */}
          <div className="p-2.5 rounded-xl bg-[#09331f]/60 border border-emerald-500/30 flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-emerald-400/50 p-0.5 bg-[#09331f]">
              <img src="/images/raheeq-official-logo-emerald.png" alt="Emerald Green" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-white block">الزمرد الأخضر الإمبراطوري</span>
              <span className="text-[9px] text-emerald-300 block font-mono">Imperial Emerald</span>
            </div>
            <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded">
              متاح للاستخدام
            </span>
          </div>

          {/* Emblem 5: Ruby Red */}
          <div className="p-2.5 rounded-xl bg-[#4b0505]/60 border border-rose-500/30 flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-rose-400/50 p-0.5 bg-[#4b0505]">
              <img src="/images/raheeq-official-logo-ruby.png" alt="Ruby Red" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-white block">الياقوت الأحمر الأسطوري</span>
              <span className="text-[9px] text-rose-300 block font-mono">Legendary Ruby</span>
            </div>
            <span className="text-[9px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded">
              متاح للاستخدام
            </span>
          </div>
        </div>
      </div>
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2.5 border transition-all animate-in fade-in ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Navigation Tabs for All 7 Sections */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('logo')}
          className={`flex-1 min-w-[170px] py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'logo'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Crown className="w-4 h-4 text-[#D4AF37]" />
          <span>الشعار الرسمي (Logo Studio)</span>
        </button>

        <button
          onClick={() => setActiveTab('hero')}
          className={`flex-1 min-w-[170px] py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'hero'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>1. الواجهة والإحصائيات (Hero)</span>
        </button>

        <button
          onClick={() => setActiveTab('bespoke')}
          className={`flex-1 min-w-[170px] py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'bespoke'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>2. بنر الخلطة الخاصة (Bespoke)</span>
        </button>

        <button
          onClick={() => setActiveTab('showcase')}
          className={`flex-1 min-w-[170px] py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'showcase'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>3. هندسة العطر والزجاجة (Showcase)</span>
        </button>

        <button
          onClick={() => setActiveTab('riviera')}
          className={`flex-1 min-w-[170px] py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'riviera'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Palmtree className="w-4 h-4" />
          <span>4. بنر صيف الريفييرا (Riviera)</span>
        </button>

        <button
          onClick={() => setActiveTab('story')}
          className={`flex-1 min-w-[170px] py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'story'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>5. قصة الدار والمعمل (Story)</span>
        </button>

        <button
          onClick={() => setActiveTab('footer')}
          className={`flex-1 min-w-[170px] py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'footer'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>6. مميزات المتجر والتوصيل (Footer)</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 0: BRAND LOGO STUDIO & WHATSAPP (استوديو الشعار)      */}
      {/* ======================================================== */}
      {activeTab === 'logo' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Hidden File Input for Logo Upload */}
          <input
            ref={logoFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleGenericImageUpload(e, 'brandLogoUrl', 'الشعار الرسمي للمتجر')}
          />

          {/* Header Card */}
          <div className="bg-gradient-to-r from-slate-900 via-[#0D1212] to-slate-900 p-6 rounded-2xl border border-[#D4AF37]/40 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                  استوديو تخصيص واعتماد الشعار الرسمي
                </span>
                <span className="bg-[#54d1b2]/20 text-[#54d1b2] border border-[#54d1b2]/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  تحديث فوري لجميع الأجهزة
                </span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold mt-1 text-white">
                تغيير اللوغو وتنسيق شكله وأرقام الواتساب
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                ارفع أي صورة شعار جديدة من جهازك لتعمل فوراً في رأس الصفحة وتذييلها ولوحة التحكم وكود الـ QR، مع ضبط الإطار والشكل وتحديث خطوط الواتساب المعتمدة.
              </p>
            </div>

            <button
              type="button"
              onClick={() => logoFileInputRef.current?.click()}
              className="bg-gradient-to-r from-[#00bc7d] to-[#54d1b2] hover:opacity-95 text-[#080A0A] font-extrabold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>رفع شعار جديد من جهازك</span>
            </button>
          </div>

          {/* Live Coordinated Previews in Real Context */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <h3 className="font-bold text-sm text-slate-800 border-b pb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal-700" />
              <span>المعاينة الحية للشعار في مختلف أجزاء المتجر (Live Context Mockups):</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Preview 1: Header / Navbar */}
              <div className="bg-[#F7F5EE] p-5 rounded-2xl border border-[#E7E3D6] space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  1. المظهر في رأس المتجر (Navbar Header):
                </span>
                <div className="bg-white/90 p-3.5 rounded-xl border border-[#E7E3D6] flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 flex items-center justify-center bg-[#080A0A] overflow-hidden shadow-md ${
                        config.brandLogoShape === 'square'
                          ? 'rounded-none'
                          : config.brandLogoShape === 'rounded'
                          ? 'rounded-xl'
                          : 'rounded-full'
                      } ${
                        config.brandLogoBorder === 'turquoise'
                          ? 'border-2 border-[#54d1b2] shadow-[0_0_12px_rgba(84,209,178,0.3)]'
                          : config.brandLogoBorder === 'none'
                          ? 'border-0'
                          : config.brandLogoBorder === 'subtle'
                          ? 'border border-slate-300'
                          : 'border-2 border-[#D4AF37]/70'
                      }`}
                    >
                      <img
                        src={config.brandLogoUrl || '/images/raheeq-official-logo.png'}
                        alt="Logo Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-serif text-xl font-bold tracking-wider text-[#080A0A]">رَحِيقْ</span>
                        <span className="font-sans text-[10px] tracking-widest text-[#C6A66B] font-extrabold mx-1.5 uppercase">RAHEEQ</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#54d1b2] mb-0.5" />
                      </div>
                      <span className="text-[8px] tracking-widest text-[#C6A66B] uppercase font-bold block">
                        Haute Parfumerie
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-bold">
                    معاينة حية
                  </span>
                </div>
              </div>

              {/* Preview 2: Footer / Dark Section */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2 text-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  2. المظهر على الخلفيات الداكنة والفوتر (Dark Theme):
                </span>
                <div className="bg-[#080A0A] p-3.5 rounded-xl border border-white/10 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 flex items-center justify-center bg-[#080A0A] overflow-hidden shadow-lg ${
                        config.brandLogoShape === 'square'
                          ? 'rounded-none'
                          : config.brandLogoShape === 'rounded'
                          ? 'rounded-xl'
                          : 'rounded-full'
                      } ${
                        config.brandLogoBorder === 'turquoise'
                          ? 'border-2 border-[#54d1b2]'
                          : config.brandLogoBorder === 'none'
                          ? 'border-0'
                          : config.brandLogoBorder === 'subtle'
                          ? 'border border-white/20'
                          : 'border-2 border-[#D4AF37]/70'
                      }`}
                    >
                      <img
                        src={config.brandLogoUrl || '/images/raheeq-official-logo.png'}
                        alt="Logo Dark Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="font-serif text-lg font-bold tracking-wider text-white block">رَحِـيـقْ | RAHEEQ</span>
                      <span className="text-[8px] tracking-widest text-[#C6A66B] uppercase font-bold block">
                        Official Royal Crest
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Dark Match</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preset Emblems 1-Click Pickers */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>الشعارات الملكية الجاهزة ثلاثية الأبعاد (3D Official Presets):</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Preset 1: Silver 3D */}
              <div
                onClick={() => handleSaveConfig({ brandLogoUrl: '/images/raheeq-official-logo.png' })}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-2 ${
                  config.brandLogoUrl === '/images/raheeq-official-logo.png'
                    ? 'border-teal-600 bg-teal-50/50 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden border border-[#D4AF37]/60 bg-black">
                  <img src="/images/raheeq-official-logo.png" alt="Silver" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-bold text-slate-900 block">الفضي الملكي 3D</span>
                <span className="text-[9px] text-slate-500 block">الافتراضي الأساسي</span>
                {config.brandLogoUrl === '/images/raheeq-official-logo.png' && (
                  <span className="text-[9px] bg-teal-700 text-white px-2 py-0.5 rounded-full font-bold">نشط الآن</span>
                )}
              </div>

              {/* Preset 2: Sapphire Blue */}
              <div
                onClick={() => handleSaveConfig({ brandLogoUrl: '/images/raheeq-official-logo-blue.png' })}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-2 ${
                  config.brandLogoUrl === '/images/raheeq-official-logo-blue.png'
                    ? 'border-blue-600 bg-blue-50/50 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden border border-blue-400 bg-[#001532]">
                  <img src="/images/raheeq-official-logo-blue.png" alt="Blue" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-bold text-slate-900 block">الياقوت الأزرق 3D</span>
                <span className="text-[9px] text-slate-500 block">Royal Sapphire</span>
                {config.brandLogoUrl === '/images/raheeq-official-logo-blue.png' && (
                  <span className="text-[9px] bg-blue-700 text-white px-2 py-0.5 rounded-full font-bold">نشط الآن</span>
                )}
              </div>

              {/* Preset 3: Emerald Green */}
              <div
                onClick={() => handleSaveConfig({ brandLogoUrl: '/images/raheeq-official-logo-emerald.png' })}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-2 ${
                  config.brandLogoUrl === '/images/raheeq-official-logo-emerald.png'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden border border-emerald-400 bg-[#09331f]">
                  <img src="/images/raheeq-official-logo-emerald.png" alt="Emerald" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-bold text-slate-900 block">الزمرد الأخضر 3D</span>
                <span className="text-[9px] text-slate-500 block">Imperial Emerald</span>
                {config.brandLogoUrl === '/images/raheeq-official-logo-emerald.png' && (
                  <span className="text-[9px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold">نشط الآن</span>
                )}
              </div>

              {/* Preset 4: Ruby Red */}
              <div
                onClick={() => handleSaveConfig({ brandLogoUrl: '/images/raheeq-official-logo-ruby.png' })}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-2 ${
                  config.brandLogoUrl === '/images/raheeq-official-logo-ruby.png'
                    ? 'border-rose-600 bg-rose-50/50 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden border border-rose-400 bg-[#4b0505]">
                  <img src="/images/raheeq-official-logo-ruby.png" alt="Ruby" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-bold text-slate-900 block">الياقوت الأحمر 3D</span>
                <span className="text-[9px] text-slate-500 block">Legendary Ruby</span>
                {config.brandLogoUrl === '/images/raheeq-official-logo-ruby.png' && (
                  <span className="text-[9px] bg-rose-700 text-white px-2 py-0.5 rounded-full font-bold">نشط الآن</span>
                )}
              </div>

              {/* Preset 5: Pure White / Glossy Black */}
              <div
                onClick={() => handleSaveConfig({ brandLogoUrl: '/images/raheeq-official-logo-light.png' })}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-2 ${
                  config.brandLogoUrl === '/images/raheeq-official-logo-light.png'
                    ? 'border-slate-800 bg-slate-100 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-300 bg-white">
                  <img src="/images/raheeq-official-logo-light.png" alt="Light" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-bold text-slate-900 block">الأسود على الأبيض 3D</span>
                <span className="text-[9px] text-slate-500 block">Print & Minimalist</span>
                {config.brandLogoUrl === '/images/raheeq-official-logo-light.png' && (
                  <span className="text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-bold">نشط الآن</span>
                )}
              </div>
            </div>
          </div>

          {/* Logo Framing & Styling Controls */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <h3 className="font-bold text-sm text-slate-800 border-b pb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-700" />
              <span>تنسيق شكل وإطار الشعار ليتناسب مع ذوقك:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Shape Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">شكل إطار الشعار (Logo Shape):</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'circle', label: 'دائري ملكي', shape: 'rounded-full' },
                    { id: 'rounded', label: 'مربع ناعم', shape: 'rounded-xl' },
                    { id: 'square', label: 'مربع بالكامل', shape: 'rounded-none' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSaveConfig({ brandLogoShape: s.id as any })}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                        config.brandLogoShape === s.id
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Color & Style */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">لون ونمط الإطار (Border Accent):</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'gold', label: 'ذهبي ملكي' },
                    { id: 'turquoise', label: 'زمردي فيروزي' },
                    { id: 'subtle', label: 'إطار رمادي كلاسيكي' },
                    { id: 'none', label: 'بدون إطار (حر)' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSaveConfig({ brandLogoBorder: b.id as any })}
                      className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all ${
                        config.brandLogoBorder === b.id
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Official WhatsApp Numbers Customizer */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b pb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
              <span>أرقام واتساب المتجر المعتمدة (WhatsApp Concierge Lines):</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  رقم الواتساب الأول (الرئيسي):
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={config.whatsapp1 || '01131068790'}
                    onChange={(e) => setConfig({ ...config, whatsapp1: e.target.value })}
                    onBlur={() => handleSaveConfig({ whatsapp1: config.whatsapp1 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-4 py-2.5 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  رقم الواتساب الثاني (الاحتياطي / المبيعات):
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={config.whatsapp2 || '01011800245'}
                    onChange={(e) => setConfig({ ...config, whatsapp2: e.target.value })}
                    onBlur={() => handleSaveConfig({ whatsapp2: config.whatsapp2 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-4 py-2.5 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: HERO & QUICK STATS (القسم الأول)                   */}
      {/* ======================================================== */}
      {activeTab === 'hero' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Live Preview Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>معاينة حية لخلفية الواجهة والنصوص:</span>
              </span>
              <span className="text-[11px] text-teal-800 font-bold">
                {config.visualMode === 'video' ? 'فيديو سينمائي نشط' : 'صورة ثابتة نشطة'}
              </span>
            </div>

            <div className="p-6">
              <div className="relative aspect-video max-h-[380px] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-300 shadow-inner flex items-center justify-center">
                {config.visualMode === 'video' ? (
                  <video
                    ref={videoPreviewRef}
                    key={config.activeVideoUrl}
                    src={config.activeVideoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                      filter: `brightness(${config.heroBrightness ?? 1.0}) contrast(105%)`,
                    }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={config.activePhotoUrl || '/images/campaign/as-signature-male-spray.jpg'}
                    alt="Hero Photo"
                    style={{
                      filter: `brightness(${config.heroBrightness ?? 1.0}) contrast(105%)`,
                    }}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Dark Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(to top, rgba(8,10,10,${Math.min(
                      0.85,
                      ((config.heroOverlayDarkness ?? 25) + 30) / 100
                    )}) 0%, rgba(8,10,10,${(config.heroOverlayDarkness ?? 25) / 100}) 50%, rgba(8,10,10,${
                      ((config.heroOverlayDarkness ?? 25) * 0.7) / 100
                    }) 100%)`,
                  }}
                />

                {/* Simulated Live Storefront Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none text-white space-y-3 max-w-2xl mx-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-teal-400/50 bg-black/70 text-[#2DD4BF] text-[10px] tracking-widest uppercase font-bold">
                    <Crown className="w-3 h-3 text-[#2DD4BF]" />
                    <span>{config.heroBadge}</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold drop-shadow-2xl leading-tight">
                    {config.heroHeadline}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#E6E1D5] max-w-lg line-clamp-2 leading-relaxed font-light">
                    {config.heroSubtitle}
                  </p>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700">نوع الخلفية:</span>
                  <button
                    onClick={() => handleSaveConfig({ visualMode: 'video' })}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      config.visualMode === 'video'
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>فيديو سينمائي متحرك</span>
                  </button>
                  <button
                    onClick={() => handleSaveConfig({ visualMode: 'photo' })}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      config.visualMode === 'photo'
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>صورة فوتوغرافية ثابتة</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Clarity & Brightness Sliders */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              <span>التحكم في سطوع ووضوح الفيديو والصورة (Hero Clarity):</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">درجة السطوع والوضوح (Brightness):</span>
                  <span className="font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                    {Math.round((config.heroBrightness ?? 1.0) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.70"
                  max="1.30"
                  step="0.05"
                  value={config.heroBrightness ?? 1.0}
                  onChange={(e) => handleSaveConfig({ heroBrightness: parseFloat(e.target.value) })}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">شفافية الفلتر الداكن خلف الكلام:</span>
                  <span className="font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                    {config.heroOverlayDarkness ?? 25}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="65"
                  step="5"
                  value={config.heroOverlayDarkness ?? 25}
                  onChange={(e) => handleSaveConfig({ heroOverlayDarkness: parseInt(e.target.value) })}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Hero Copy (Text Controls) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
              <Type className="w-5 h-5 text-teal-700" />
              <span>تعديل النصوص والكلام المكتوب أمام الخلفية (Hero Text):</span>
            </h3>

            <div className="space-y-4 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  1. الشارة الملكية العلوية (Badge):
                </label>
                <input
                  type="text"
                  value={config.heroBadge}
                  onChange={(e) => setConfig({ ...config, heroBadge: e.target.value })}
                  onBlur={() => handleSaveConfig({ heroBadge: config.heroBadge })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  2. العنوان العريض الرئيسي (Headline):
                </label>
                <input
                  type="text"
                  value={config.heroHeadline}
                  onChange={(e) => setConfig({ ...config, heroHeadline: e.target.value })}
                  onBlur={() => handleSaveConfig({ heroHeadline: config.heroHeadline })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 font-serif font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  3. النص الوصفي والشرح (Subtitle):
                </label>
                <textarea
                  rows={3}
                  value={config.heroSubtitle}
                  onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                  onBlur={() => handleSaveConfig({ heroSubtitle: config.heroSubtitle })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar (الاحصائيات الأربعة تحت الهيرو) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
              <Sliders className="w-5 h-5 text-teal-700" />
              <span>تعديل أرقام وعبارات شريط الإحصائيات (Quick Stats):</span>
            </h3>
            <p className="text-xs text-slate-500">
              الشريط الأسود الشفاف أسفل الواجهة الرئيسية الذي يحتوي على 4 أرقام تسويقية مميزة:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {/* Stat 1 */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block">الإحصائية الأولى:</label>
                <input
                  type="text"
                  value={config.stat1Value}
                  onChange={(e) => setConfig({ ...config, stat1Value: e.target.value })}
                  onBlur={() => handleSaveConfig({ stat1Value: config.stat1Value })}
                  placeholder="+51"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900"
                />
                <input
                  type="text"
                  value={config.stat1Label}
                  onChange={(e) => setConfig({ ...config, stat1Label: e.target.value })}
                  onBlur={() => handleSaveConfig({ stat1Label: config.stat1Label })}
                  placeholder="تركيبة عطرية فريدة"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-[11px] text-slate-700"
                />
              </div>

              {/* Stat 2 */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="text-[11px] font-bold text-teal-800 block">الإحصائية الثانية (نسبة الزيوت):</label>
                <input
                  type="text"
                  value={config.stat2Value}
                  onChange={(e) => setConfig({ ...config, stat2Value: e.target.value })}
                  onBlur={() => handleSaveConfig({ stat2Value: config.stat2Value })}
                  placeholder="35%"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-teal-700"
                />
                <input
                  type="text"
                  value={config.stat2Label}
                  onChange={(e) => setConfig({ ...config, stat2Label: e.target.value })}
                  onBlur={() => handleSaveConfig({ stat2Label: config.stat2Label })}
                  placeholder="نسبة الزيوت العطرية النقية"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-[11px] text-slate-700"
                />
              </div>

              {/* Stat 3 */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="text-[11px] font-bold text-amber-800 block">الإحصائية الثالثة (الدفع):</label>
                <input
                  type="text"
                  value={config.stat3Value}
                  onChange={(e) => setConfig({ ...config, stat3Value: e.target.value })}
                  onBlur={() => handleSaveConfig({ stat3Value: config.stat3Value })}
                  placeholder="100%"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-amber-700"
                />
                <input
                  type="text"
                  value={config.stat3Label}
                  onChange={(e) => setConfig({ ...config, stat3Label: e.target.value })}
                  onBlur={() => handleSaveConfig({ stat3Label: config.stat3Label })}
                  placeholder="دفع عند الاستلام والمعاينة"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-[11px] text-slate-700"
                />
              </div>

              {/* Stat 4 */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block">الإحصائية الرابعة (التوصيل):</label>
                <input
                  type="text"
                  value={config.stat4Value}
                  onChange={(e) => setConfig({ ...config, stat4Value: e.target.value })}
                  onBlur={() => handleSaveConfig({ stat4Value: config.stat4Value })}
                  placeholder="24–48h"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900"
                />
                <input
                  type="text"
                  value={config.stat4Label}
                  onChange={(e) => setConfig({ ...config, stat4Label: e.target.value })}
                  onBlur={() => handleSaveConfig({ stat4Label: config.stat4Label })}
                  placeholder="توصيل القاهرة والجيزة"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-[11px] text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Upload New Video/Photo Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
              <Upload className="w-5 h-5 text-teal-700" />
              <span>رفع فيديو أو صورة جديدة لخلفية الواجهة من جهازك:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Video upload */}
              <div className="border-2 border-dashed border-teal-200 rounded-2xl p-6 text-center bg-teal-50/20 space-y-3">
                <FileVideo className="w-8 h-8 text-teal-700 mx-auto" />
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">رفع فيديو من جهازك (MP4 / WebM)</h4>
                <input
                  type="file"
                  ref={videoFileInputRef}
                  onChange={handleVideoUpload}
                  accept="video/mp4,video/webm,video/quicktime,video/m4v"
                  className="hidden"
                  id="hero-video-upload"
                />
                <label
                  htmlFor="hero-video-upload"
                  className="cursor-pointer inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold w-full py-2.5 rounded-xl text-xs shadow transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploadingVideo ? 'جارٍ المعالجة...' : 'اختر ملف فيديو'}</span>
                </label>
              </div>

              {/* Photo upload */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 space-y-3">
                <ImageIcon className="w-8 h-8 text-slate-700 mx-auto" />
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">رفع صورة ثابتة من جهازك</h4>
                <input
                  type="file"
                  ref={photoFileInputRef}
                  onChange={(e) => handleGenericImageUpload(e, 'activePhotoUrl', 'خلفية الواجهة')}
                  accept="image/*"
                  className="hidden"
                  id="hero-photo-upload"
                />
                <label
                  htmlFor="hero-photo-upload"
                  className="cursor-pointer inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-teal-700 text-white font-bold w-full py-2.5 rounded-xl text-xs shadow transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>اختر ملف صورة</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: BESPOKE BLEND BANNER (القسم الثاني: الخلطة الخاصة) */}
      {/* ======================================================== */}
      {activeTab === 'bespoke' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Live Preview Box of the Bespoke Banner */}
          <div className="bg-[#080A0A] border-2 border-[#54d1b2]/40 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 relative overflow-hidden shadow-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#54d1b2]/40 bg-[#141F1D] text-[#54d1b2] text-xs font-bold tracking-widest uppercase">
              <FlaskConical className="w-4 h-4 text-[#54d1b2] animate-pulse" />
              <span>{config.bespokeBadge}</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight max-w-3xl mx-auto">
              {config.bespokeHeadline}
            </h2>

            <p className="text-xs sm:text-sm text-[#D5D1C7] max-w-2xl mx-auto font-light leading-relaxed">
              {config.bespokeSubtitle}
            </p>

            <div className="pt-2 max-w-xl mx-auto">
              <div className="flex gap-2 bg-[#141B1A] p-2 rounded-2xl border border-[#54d1b2]/40">
                <div className="flex-1 px-4 py-2.5 text-xs text-slate-400 text-right truncate">
                  {config.bespokePlaceholder}
                </div>
                <button className="bg-teal-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex-shrink-0">
                  {config.bespokeButtonText}
                </button>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-[#A2ADA9]">
              <span className="flex items-center gap-1.5">
                <span className="text-[#54d1b2]">✓</span>
                <span>{config.bespokeFeature1}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#54d1b2]">✓</span>
                <span>{config.bespokeFeature2}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#54d1b2]">✓</span>
                <span>{config.bespokeFeature3}</span>
              </span>
            </div>
          </div>

          {/* Form to Edit the Bespoke Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-teal-700" />
              <span>تعديل عبارات ونصوص بنر طلب العطر والخلطة الخاصة:</span>
            </h3>

            <div className="space-y-4 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  الشارة العلوية (Badge):
                </label>
                <input
                  type="text"
                  value={config.bespokeBadge}
                  onChange={(e) => setConfig({ ...config, bespokeBadge: e.target.value })}
                  onBlur={() => handleSaveConfig({ bespokeBadge: config.bespokeBadge })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  العنوان الرئيسي للبنر (Main Headline):
                </label>
                <input
                  type="text"
                  value={config.bespokeHeadline}
                  onChange={(e) => setConfig({ ...config, bespokeHeadline: e.target.value })}
                  onBlur={() => handleSaveConfig({ bespokeHeadline: config.bespokeHeadline })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 font-serif font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  النص الوصفي والشرح (Subtitle Paragraph):
                </label>
                <textarea
                  rows={3}
                  value={config.bespokeSubtitle}
                  onChange={(e) => setConfig({ ...config, bespokeSubtitle: e.target.value })}
                  onBlur={() => handleSaveConfig({ bespokeSubtitle: config.bespokeSubtitle })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    نص الإرشاد داخل خانة البحث (Placeholder):
                  </label>
                  <input
                    type="text"
                    value={config.bespokePlaceholder}
                    onChange={(e) => setConfig({ ...config, bespokePlaceholder: e.target.value })}
                    onBlur={() => handleSaveConfig({ bespokePlaceholder: config.bespokePlaceholder })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    نص زر الطلب (Button Text):
                  </label>
                  <input
                    type="text"
                    value={config.bespokeButtonText}
                    onChange={(e) => setConfig({ ...config, bespokeButtonText: e.target.value })}
                    onBlur={() => handleSaveConfig({ bespokeButtonText: config.bespokeButtonText })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* 3 Feature Pills */}
              <div className="pt-2 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  المميزات الثلاث أسفل البنر (Features):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={config.bespokeFeature1}
                    onChange={(e) => setConfig({ ...config, bespokeFeature1: e.target.value })}
                    onBlur={() => handleSaveConfig({ bespokeFeature1: config.bespokeFeature1 })}
                    placeholder="الميزة 1 (الأحجام)"
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    value={config.bespokeFeature2}
                    onChange={(e) => setConfig({ ...config, bespokeFeature2: e.target.value })}
                    onBlur={() => handleSaveConfig({ bespokeFeature2: config.bespokeFeature2 })}
                    placeholder="الميزة 2 (التركيز)"
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    value={config.bespokeFeature3}
                    onChange={(e) => setConfig({ ...config, bespokeFeature3: e.target.value })}
                    onBlur={() => handleSaveConfig({ bespokeFeature3: config.bespokeFeature3 })}
                    placeholder="الميزة 3 (الدفع عند الاستلام)"
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: RIVIERA CAMPAIGN BANNER (بنر حملة الريفييرا الصيفية) */}
      {/* ======================================================== */}
      {activeTab === 'riviera' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Live Preview Box of the Riviera Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-300 shadow-xl bg-[#080A0A]">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              <div className="lg:col-span-6 relative min-h-[300px]">
                <img
                  src={config.rivieraImage || '/images/campaign/female-coastal-spray.jpg'}
                  alt="Riviera Preview"
                  className="absolute inset-0 w-full h-full object-cover filter brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/85 via-black/35 to-transparent" />
              </div>

              <div className="lg:col-span-6 p-6 sm:p-8 space-y-4 text-white relative z-10">
                <span className="bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40 px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-widest inline-block">
                  {config.rivieraBadge}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                  {config.rivieraHeadline}
                </h3>
                <p className="text-xs sm:text-sm text-[#C5CECB] leading-relaxed line-clamp-3">
                  {config.rivieraDescription}
                </p>
                <div className="pt-2 flex gap-3">
                  <span className="bg-[#2DD4BF] text-slate-950 font-bold px-4 py-2 rounded-lg text-xs">
                    {config.rivieraBtn1Text}
                  </span>
                  <span className="border border-white/40 text-white font-bold px-4 py-2 rounded-lg text-xs">
                    {config.rivieraBtn2Text}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form to Edit Riviera Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
              <Palmtree className="w-5 h-5 text-teal-700" />
              <span>تعديل صورة وكلام بنر حملة الريفييرا الصيفية:</span>
            </h3>

            {/* Image Upload for Riviera Banner */}
            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-800 block">
                1. صورة البنر (Banner Image) — يمكنك رفع أي صورة من هاتفك أو جهازك:
              </label>
              <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                <input
                  type="text"
                  value={config.rivieraImage}
                  onChange={(e) => setConfig({ ...config, rivieraImage: e.target.value })}
                  onBlur={() => handleSaveConfig({ rivieraImage: config.rivieraImage })}
                  placeholder="رابط الصورة أو اختر من جهازك..."
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                />
                <input
                  type="file"
                  ref={rivieraFileInputRef}
                  onChange={(e) => handleGenericImageUpload(e, 'rivieraImage', 'بنر الريفييرا')}
                  accept="image/*"
                  className="hidden"
                  id="riviera-photo-upload"
                />
                <label
                  htmlFor="riviera-photo-upload"
                  className="cursor-pointer bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors flex-shrink-0 shadow"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع صورة من جهازك</span>
                </label>
              </div>
            </div>

            {/* Text Inputs for Riviera */}
            <div className="space-y-4 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  2. الشارة العلوية (Badge):
                </label>
                <input
                  type="text"
                  value={config.rivieraBadge}
                  onChange={(e) => setConfig({ ...config, rivieraBadge: e.target.value })}
                  onBlur={() => handleSaveConfig({ rivieraBadge: config.rivieraBadge })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  3. العنوان الرئيسي (Headline):
                </label>
                <input
                  type="text"
                  value={config.rivieraHeadline}
                  onChange={(e) => setConfig({ ...config, rivieraHeadline: e.target.value })}
                  onBlur={() => handleSaveConfig({ rivieraHeadline: config.rivieraHeadline })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 font-serif font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  4. الشرح والوصف الشاعري (Description):
                </label>
                <textarea
                  rows={3}
                  value={config.rivieraDescription}
                  onChange={(e) => setConfig({ ...config, rivieraDescription: e.target.value })}
                  onBlur={() => handleSaveConfig({ rivieraDescription: config.rivieraDescription })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    5. نص الزر الأول (Button 1):
                  </label>
                  <input
                    type="text"
                    value={config.rivieraBtn1Text}
                    onChange={(e) => setConfig({ ...config, rivieraBtn1Text: e.target.value })}
                    onBlur={() => handleSaveConfig({ rivieraBtn1Text: config.rivieraBtn1Text })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    6. نص الزر الثاني (Button 2):
                  </label>
                  <input
                    type="text"
                    value={config.rivieraBtn2Text}
                    onChange={(e) => setConfig({ ...config, rivieraBtn2Text: e.target.value })}
                    onBlur={() => handleSaveConfig({ rivieraBtn2Text: config.rivieraBtn2Text })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: BRAND STORY & ATELIER (القسم الرابع: قصة الدار)    */}
      {/* ======================================================== */}
      {activeTab === 'story' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Live Preview Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded text-xs font-bold">
                  {config.storyBadge}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                  {config.storyTitle}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {config.storyParagraph1}
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-xl border text-xs">
                    <strong className="block text-slate-900 font-bold">{config.storyBenefit1Title}</strong>
                    <span className="text-[10px] text-slate-500">{config.storyBenefit1Desc}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border text-xs">
                    <strong className="block text-slate-900 font-bold">{config.storyBenefit2Title}</strong>
                    <span className="text-[10px] text-slate-500">{config.storyBenefit2Desc}</span>
                  </div>
                </div>
              </div>

              {/* Story Image Preview */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border p-6 flex flex-col justify-end text-white">
                <img
                  src={config.storyImage || '/images/campaign/couple-sunset-romance.jpg'}
                  alt="Story Preview"
                  className="absolute inset-0 w-full h-full object-cover filter brightness-[0.6]"
                />
                <div className="relative z-10 space-y-1 max-w-sm">
                  <h4 className="font-serif text-sm font-bold">{config.storyImageQuote}</h4>
                  <p className="text-[10px] text-slate-300">{config.storyImageTag}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form to Edit Brand Story */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-700" />
              <span>تعديل نصوص وصورة قسم قصة الدار والمعمل الحرفي:</span>
            </h3>

            {/* Image Upload for Story */}
            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-800 block">
                1. صورة قصة الدار (Story Image) — يمكنك رفع صورة جديدة من جهازك:
              </label>
              <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                <input
                  type="text"
                  value={config.storyImage}
                  onChange={(e) => setConfig({ ...config, storyImage: e.target.value })}
                  onBlur={() => handleSaveConfig({ storyImage: config.storyImage })}
                  placeholder="رابط الصورة أو اختر من جهازك..."
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                />
                <input
                  type="file"
                  ref={storyFileInputRef}
                  onChange={(e) => handleGenericImageUpload(e, 'storyImage', 'قصة الدار')}
                  accept="image/*"
                  className="hidden"
                  id="story-photo-upload"
                />
                <label
                  htmlFor="story-photo-upload"
                  className="cursor-pointer bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors flex-shrink-0 shadow"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع صورة من جهازك</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  2. الاقتباس المكتوب فوق الصورة (Image Quote):
                </label>
                <input
                  type="text"
                  value={config.storyImageQuote}
                  onChange={(e) => setConfig({ ...config, storyImageQuote: e.target.value })}
                  onBlur={() => handleSaveConfig({ storyImageQuote: config.storyImageQuote })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  3. التوقيع أسفل الاقتباس (Image Tag):
                </label>
                <input
                  type="text"
                  value={config.storyImageTag}
                  onChange={(e) => setConfig({ ...config, storyImageTag: e.target.value })}
                  onBlur={() => handleSaveConfig({ storyImageTag: config.storyImageTag })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  4. شارة القسم (Story Badge):
                </label>
                <input
                  type="text"
                  value={config.storyBadge}
                  onChange={(e) => setConfig({ ...config, storyBadge: e.target.value })}
                  onBlur={() => handleSaveConfig({ storyBadge: config.storyBadge })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  5. العنوان العريض للقصة (Story Headline):
                </label>
                <input
                  type="text"
                  value={config.storyTitle}
                  onChange={(e) => setConfig({ ...config, storyTitle: e.target.value })}
                  onBlur={() => handleSaveConfig({ storyTitle: config.storyTitle })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 font-serif font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  6. الفقرة الأولى (Paragraph 1):
                </label>
                <textarea
                  rows={3}
                  value={config.storyParagraph1}
                  onChange={(e) => setConfig({ ...config, storyParagraph1: e.target.value })}
                  onBlur={() => handleSaveConfig({ storyParagraph1: config.storyParagraph1 })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  7. الفقرة الثانية (Paragraph 2):
                </label>
                <textarea
                  rows={3}
                  value={config.storyParagraph2}
                  onChange={(e) => setConfig({ ...config, storyParagraph2: e.target.value })}
                  onBlur={() => handleSaveConfig({ storyParagraph2: config.storyParagraph2 })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 leading-relaxed"
                />
              </div>

              {/* Benefit Cards 1 & 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
                  <span className="text-[11px] font-bold text-teal-800 block">البطاقة الأولى (التركيز):</span>
                  <input
                    type="text"
                    value={config.storyBenefit1Title}
                    onChange={(e) => setConfig({ ...config, storyBenefit1Title: e.target.value })}
                    onBlur={() => handleSaveConfig({ storyBenefit1Title: config.storyBenefit1Title })}
                    placeholder="العنوان"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={config.storyBenefit1Desc}
                    onChange={(e) => setConfig({ ...config, storyBenefit1Desc: e.target.value })}
                    onBlur={() => handleSaveConfig({ storyBenefit1Desc: config.storyBenefit1Desc })}
                    placeholder="الوصف"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-[11px]"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
                  <span className="text-[11px] font-bold text-amber-800 block">البطاقة الثانية (المعاينة):</span>
                  <input
                    type="text"
                    value={config.storyBenefit2Title}
                    onChange={(e) => setConfig({ ...config, storyBenefit2Title: e.target.value })}
                    onBlur={() => handleSaveConfig({ storyBenefit2Title: config.storyBenefit2Title })}
                    placeholder="العنوان"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={config.storyBenefit2Desc}
                    onChange={(e) => setConfig({ ...config, storyBenefit2Desc: e.target.value })}
                    onBlur={() => handleSaveConfig({ storyBenefit2Desc: config.storyBenefit2Desc })}
                    placeholder="الوصف"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-[11px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SHOWCASE & FLACON RITUAL (هندسة العطر والزجاجة)    */}
      {/* ======================================================== */}
      {activeTab === 'showcase' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Live Preview Box */}
          <div className="bg-[#080A0A] rounded-3xl p-6 sm:p-10 border border-[#2DD4BF]/40 shadow-2xl relative overflow-hidden text-[#FAF9F5]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <span className="font-bold text-xs flex items-center gap-2 text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-[#54d1b2] animate-pulse" />
                <span>معاينة حية لبنر هندسة العطر والزجاجة (Showcase & Flacon Ritual):</span>
              </span>
              <span className="text-[10px] text-[#54d1b2] font-mono bg-[#54d1b2]/10 border border-[#54d1b2]/30 px-2 py-0.5 rounded">
                Section 3 في المتجر
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Texts & Meters */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2DD4BF]/50 bg-[#111716] text-[#2DD4BF] text-[10px] font-bold tracking-widest uppercase">
                  <Sparkles className="w-3 h-3" />
                  <span>{config.showcaseBadge}</span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {config.showcaseHeadline}
                </h3>

                <p className="text-xs sm:text-sm text-[#C5CECB] leading-relaxed">
                  {config.showcaseDescription}
                </p>

                {/* 3 Radar Meters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-[#141A19] border border-[#2DD4BF]/30">
                    <div className="flex items-center justify-between text-xs font-bold text-[#2DD4BF] mb-1">
                      <span>{config.showcaseMeter1Title}</span>
                      <span>{config.showcaseMeter1Val}</span>
                    </div>
                    <div className="w-full bg-[#080A0A] rounded-full h-1.5 overflow-hidden border border-[#1A2624]">
                      <div className="bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] h-full w-[98%]" />
                    </div>
                    <p className="text-[9px] text-[#9EABA7] mt-1">{config.showcaseMeter1Sub}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141A19] border border-[#2DD4BF]/30">
                    <div className="flex items-center justify-between text-xs font-bold text-[#2DD4BF] mb-1">
                      <span>{config.showcaseMeter2Title}</span>
                      <span>{config.showcaseMeter2Val}</span>
                    </div>
                    <div className="w-full bg-[#080A0A] rounded-full h-1.5 overflow-hidden border border-[#1A2624]">
                      <div className="bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] h-full w-[95%]" />
                    </div>
                    <p className="text-[9px] text-[#9EABA7] mt-1">{config.showcaseMeter2Sub}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141A19] border border-[#C6A66B]/30">
                    <div className="flex items-center justify-between text-xs font-bold text-[#C6A66B] mb-1">
                      <span>{config.showcaseMeter3Title}</span>
                      <span>{config.showcaseMeter3Val}</span>
                    </div>
                    <div className="w-full bg-[#080A0A] rounded-full h-1.5 overflow-hidden border border-[#1A2624]">
                      <div className="bg-gradient-to-r from-[#C6A66B] to-[#D4AF37] h-full w-[100%]" />
                    </div>
                    <p className="text-[9px] text-[#9EABA7] mt-1">{config.showcaseMeter3Sub}</p>
                  </div>
                </div>

                {/* 3 Pills */}
                <div className="pt-3 border-t border-[#1A2624] grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#141A19] flex items-center justify-center text-[#54d1b2] text-xs">✓</div>
                    <span className="text-[#D5D1C7]">{config.showcasePill1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#141A19] flex items-center justify-center text-[#54d1b2] text-xs">✓</div>
                    <span className="text-[#D5D1C7]">{config.showcasePill2}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#141A19] flex items-center justify-center text-[#C6A66B] text-xs">★</div>
                    <span className="text-[#D5D1C7]">{config.showcasePill3}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Flacon Display */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="w-full max-w-xs rounded-2xl bg-[#141A19] border border-[#2DD4BF]/50 p-6 flex flex-col items-center text-center shadow-xl">
                  <div className="h-48 flex items-center justify-center">
                    <img
                      src={config.showcaseBottleImage || '/images/raheeq-official-logo.png'}
                      alt="Flacon Preview"
                      className="max-h-44 object-contain rounded-xl drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)]"
                    />
                  </div>
                  <span className="text-[9px] font-mono tracking-widest text-[#2DD4BF] uppercase mt-3">
                    {config.showcaseBottleTag}
                  </span>
                  <h4 className="font-serif text-base font-bold text-white mt-0.5">
                    {config.showcaseBottleName}
                  </h4>
                  <p className="text-[11px] text-[#C6A66B] mt-0.5">
                    {config.showcaseBottleSubtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Controls Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 border-b pb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-teal-700" />
              <span>تعديل صورة زجاجة العطر، المقاييس، وكافة النصوص:</span>
            </h3>

            {/* Hidden Input for Bottle Image Upload */}
            <input
              ref={showcaseFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleGenericImageUpload(e, 'showcaseBottleImage', 'صورة زجاجة العطر الفاخرة')}
            />

            {/* Image Upload & Presets */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="text-xs font-bold text-slate-800 block">
                1. صورة زجاجة العطر الفاخرة (Showcase Bottle Image):
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => showcaseFileInputRef.current?.click()}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع صورة زجاجة من جهازك (PNG / JPG / WEBP)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveConfig({ showcaseBottleImage: '/images/raheeq-official-logo.png' })}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>استخدام شعار رحيق الفضي 3D</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveConfig({ showcaseBottleImage: '/images/raheeq-official-logo-blue.png' })}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>استخدام شعار رحيق الياقوتي الأزرق</span>
                </button>
              </div>
            </div>

            {/* Headline, Badge & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  2. الشارة العلوية (Badge):
                </label>
                <input
                  type="text"
                  value={config.showcaseBadge}
                  onChange={(e) => setConfig({ ...config, showcaseBadge: e.target.value })}
                  onBlur={() => handleSaveConfig({ showcaseBadge: config.showcaseBadge })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  3. اسم العطر المعروض أسفل الزجاجة:
                </label>
                <input
                  type="text"
                  value={config.showcaseBottleName}
                  onChange={(e) => setConfig({ ...config, showcaseBottleName: e.target.value })}
                  onBlur={() => handleSaveConfig({ showcaseBottleName: config.showcaseBottleName })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                4. العنوان الرئيسي العريض (Headline):
              </label>
              <input
                type="text"
                value={config.showcaseHeadline}
                onChange={(e) => setConfig({ ...config, showcaseHeadline: e.target.value })}
                onBlur={() => handleSaveConfig({ showcaseHeadline: config.showcaseHeadline })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold font-serif"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                5. فقرة الوصف الفلسفية ونسبة التركيز (25% Extrait):
              </label>
              <textarea
                rows={3}
                value={config.showcaseDescription}
                onChange={(e) => setConfig({ ...config, showcaseDescription: e.target.value })}
                onBlur={() => handleSaveConfig({ showcaseDescription: config.showcaseDescription })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 leading-relaxed"
              />
            </div>

            {/* 3 Meters Configuration */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                6. مقاييس القوة والثبات الثلاثة (Sillage, Longevity, Concentration):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Meter 1 */}
                <div className="p-3 bg-white rounded-lg border space-y-1.5">
                  <span className="text-[11px] font-bold text-teal-800 block">المقياس الأول (الفوحان):</span>
                  <input
                    type="text"
                    value={config.showcaseMeter1Title}
                    onChange={(e) => setConfig({ ...config, showcaseMeter1Title: e.target.value })}
                    onBlur={() => handleSaveConfig({ showcaseMeter1Title: config.showcaseMeter1Title })}
                    placeholder="العنوان"
                    className="w-full border rounded px-2.5 py-1 text-xs"
                  />
                  <input
                    type="text"
                    value={config.showcaseMeter1Val}
                    onChange={(e) => setConfig({ ...config, showcaseMeter1Val: e.target.value })}
                    onBlur={() => handleSaveConfig({ showcaseMeter1Val: config.showcaseMeter1Val })}
                    placeholder="القيمة (مثلاً 9.8 / 10)"
                    className="w-full border rounded px-2.5 py-1 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={config.showcaseMeter1Sub}
                    onChange={(e) => setConfig({ ...config, showcaseMeter1Sub: e.target.value })}
                    onBlur={() => handleSaveConfig({ showcaseMeter1Sub: config.showcaseMeter1Sub })}
                    placeholder="الوصف المختصر"
                    className="w-full border rounded px-2.5 py-1 text-[11px] text-slate-500"
                  />
                </div>

                {/* Meter 2 */}
                <div className="p-3 bg-white rounded-lg border space-y-1.5">
                  <span className="text-[11px] font-bold text-teal-800 block">المقياس الثاني (الثبات):</span>
                  <input
                    type="text"
                    value={config.showcaseMeter2Title}
                    onChange={(e) => setConfig({ ...config, showcaseMeter2Title: e.target.value })}
                    onBlur={() => handleSaveConfig({ showcaseMeter2Title: config.showcaseMeter2Title })}
                    placeholder="العنوان"
                    className="w-full border rounded px-2.5 py-1 text-xs"
                  />
                  <input
                    type="text"
                    value={config.showcaseMeter2Val}
                    onChange={(e) => setConfig({ ...config, showcaseMeter2Val: e.target.value })}
                    onBlur={() => handleSaveConfig({ showcaseMeter2Val: config.showcaseMeter2Val })}
                    placeholder="القيمة (مثلاً +14 ساعة)"
                    className="w-full border rounded px-2.5 py-1 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={config.showcaseMeter2Sub}
                    onChange={(e) => setConfig({ ...config, showcaseMeter2Sub: e.target.value })}
                    onBlur={() => handleSaveConfig({ showcaseMeter2Sub: config.showcaseMeter2Sub })}
                    placeholder="الوصف المختصر"
                    className="w-full border rounded px-2.5 py-1 text-[11px] text-slate-500"
                  />
                </div>

                {/* Meter 3 */}
                <div className="p-3 bg-white rounded-lg border space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-800 block">المقياس الثالث (نسبة التركيز):</span>
                  <input
                    type="text"
                    value={config.showcaseMeter3Title}
                    onChange={(e) => setConfig({ ...config, showcaseMeter3Title: e.target.value })}
                    onBlur={() => handleSaveConfig({ showcaseMeter3Title: config.showcaseMeter3Title })}
                    placeholder="العنوان"
                    className="w-full border rounded px-2.5 py-1 text-xs"
                  />
                  <input
                    type="text"
                    value={config.showcaseMeter3Val}
                    onChange={(e) => setConfig({ ...config, showcaseMeter3Val: e.target.value })}
                    onBlur={() => handleSaveConfig({ showcaseMeter3Val: config.showcaseMeter3Val })}
                    placeholder="القيمة (مثلاً 25% خالص)"
                    className="w-full border rounded px-2.5 py-1 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={config.showcaseMeter3Sub}
                    onChange={(e) => setConfig({ ...config, showcaseMeter3Sub: e.target.value })}
                    onBlur={() => handleSaveConfig({ showcaseMeter3Sub: config.showcaseMeter3Sub })}
                    placeholder="الوصف المختصر"
                    className="w-full border rounded px-2.5 py-1 text-[11px] text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* 3 Quality Pills */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                7. بطاقات المزايا الثلاث (Pills):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={config.showcasePill1}
                  onChange={(e) => setConfig({ ...config, showcasePill1: e.target.value })}
                  onBlur={() => handleSaveConfig({ showcasePill1: config.showcasePill1 })}
                  placeholder="الميزة 1 (الزيوت)"
                  className="bg-white border rounded px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  value={config.showcasePill2}
                  onChange={(e) => setConfig({ ...config, showcasePill2: e.target.value })}
                  onBlur={() => handleSaveConfig({ showcasePill2: config.showcasePill2 })}
                  placeholder="الميزة 2 (التوصيل والمعاينة)"
                  className="bg-white border rounded px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  value={config.showcasePill3}
                  onChange={(e) => setConfig({ ...config, showcasePill3: e.target.value })}
                  onBlur={() => handleSaveConfig({ showcasePill3: config.showcasePill3 })}
                  placeholder="الميزة 3 (الزجاجة والغطاء)"
                  className="bg-white border rounded px-3 py-2 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: FOOTER VALUES BAR (شريط مميزات المتجر والتوصيل)    */}
      {/* ======================================================== */}
      {activeTab === 'footer' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Live Preview Box */}
          <div className="bg-[#080A0A] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl text-[#FAF9F5]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
              <span className="font-bold text-xs flex items-center gap-2 text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>معاينة حية لشريط مميزات أسفل الموقع (Footer Values Bar):</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                أسفل كل صفحات المتجر
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-right">
              {/* Card 1 */}
              <div className="p-4 rounded-xl bg-[#141A19] border border-[#2DD4BF]/30 space-y-1">
                <span className="text-[10px] text-[#2DD4BF] font-bold block">1. الشحن والتوصيل</span>
                <h4 className="font-serif font-bold text-sm text-white">{config.footerShippingTitle}</h4>
                <p className="text-[11px] text-[#9EABA7]">{config.footerShippingDesc}</p>
              </div>

              {/* Card 2 */}
              <div className="p-4 rounded-xl bg-[#141A19] border border-[#2DD4BF]/30 space-y-1">
                <span className="text-[10px] text-[#2DD4BF] font-bold block">2. المعاينة والدفع</span>
                <h4 className="font-serif font-bold text-sm text-white">{config.footerCodTitle}</h4>
                <p className="text-[11px] text-[#9EABA7]">{config.footerCodDesc}</p>
              </div>

              {/* Card 3 */}
              <div className="p-4 rounded-xl bg-[#141A19] border border-[#2DD4BF]/30 space-y-1">
                <span className="text-[10px] text-[#2DD4BF] font-bold block">3. نسبة التركيز</span>
                <h4 className="font-serif font-bold text-sm text-white">{config.footerConcentrationTitle}</h4>
                <p className="text-[11px] text-[#9EABA7]">{config.footerConcentrationDesc}</p>
              </div>

              {/* Card 4 */}
              <div className="p-4 rounded-xl bg-[#141A19] border border-[#C6A66B]/30 space-y-1">
                <span className="text-[10px] text-[#C6A66B] font-bold block">4. الزجاجة والغطاء</span>
                <h4 className="font-serif font-bold text-sm text-white">{config.footerBottleTitle}</h4>
                <p className="text-[11px] text-[#9EABA7]">{config.footerBottleDesc}</p>
              </div>
            </div>
          </div>

          {/* Form Edit Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 border-b pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>تعديل نصوص وعناوين شريط مميزات المتجر والتوصيل:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Card 1: Shipping */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-teal-800 block">البطاقة 1: الشحن والتوصيل</span>
                <input
                  type="text"
                  value={config.footerShippingTitle}
                  onChange={(e) => setConfig({ ...config, footerShippingTitle: e.target.value })}
                  onBlur={() => handleSaveConfig({ footerShippingTitle: config.footerShippingTitle })}
                  placeholder="عنوان الشحن (مثلاً: التوصيل إلى الباب)"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs font-bold"
                />
                <textarea
                  rows={2}
                  value={config.footerShippingDesc}
                  onChange={(e) => setConfig({ ...config, footerShippingDesc: e.target.value })}
                  onBlur={() => handleSaveConfig({ footerShippingDesc: config.footerShippingDesc })}
                  placeholder="وصف الشحن"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700"
                />
              </div>

              {/* Card 2: COD */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-teal-800 block">البطاقة 2: المعاينة والدفع</span>
                <input
                  type="text"
                  value={config.footerCodTitle}
                  onChange={(e) => setConfig({ ...config, footerCodTitle: e.target.value })}
                  onBlur={() => handleSaveConfig({ footerCodTitle: config.footerCodTitle })}
                  placeholder="عنوان الدفع (مثلاً: معاينة الطرد قبل الدفع كاش)"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs font-bold"
                />
                <textarea
                  rows={2}
                  value={config.footerCodDesc}
                  onChange={(e) => setConfig({ ...config, footerCodDesc: e.target.value })}
                  onBlur={() => handleSaveConfig({ footerCodDesc: config.footerCodDesc })}
                  placeholder="وصف المعاينة"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700"
                />
              </div>

              {/* Card 3: Concentration */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-teal-800 block">البطاقة 3: نسبة التركيز</span>
                <input
                  type="text"
                  value={config.footerConcentrationTitle}
                  onChange={(e) => setConfig({ ...config, footerConcentrationTitle: e.target.value })}
                  onBlur={() => handleSaveConfig({ footerConcentrationTitle: config.footerConcentrationTitle })}
                  placeholder="عنوان التركيز (مثلاً: تركيز زيوت نقية 25% Extrait)"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs font-bold"
                />
                <textarea
                  rows={2}
                  value={config.footerConcentrationDesc}
                  onChange={(e) => setConfig({ ...config, footerConcentrationDesc: e.target.value })}
                  onBlur={() => handleSaveConfig({ footerConcentrationDesc: config.footerConcentrationDesc })}
                  placeholder="وصف الثبات والفوحان"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700"
                />
              </div>

              {/* Card 4: Bottle */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-amber-800 block">البطاقة 4: الزجاجة والغطاء المغناطيسي</span>
                <input
                  type="text"
                  value={config.footerBottleTitle}
                  onChange={(e) => setConfig({ ...config, footerBottleTitle: e.target.value })}
                  onBlur={() => handleSaveConfig({ footerBottleTitle: config.footerBottleTitle })}
                  placeholder="عنوان الزجاجة (مثلاً: زجاج بلوري ثقيل بغطاء مغناطيسي)"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs font-bold"
                />
                <textarea
                  rows={2}
                  value={config.footerBottleDesc}
                  onChange={(e) => setConfig({ ...config, footerBottleDesc: e.target.value })}
                  onBlur={() => handleSaveConfig({ footerBottleDesc: config.footerBottleDesc })}
                  placeholder="وصف الزجاجة وجودتها"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={handleResetToDefaults}
          className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline flex items-center gap-1.5"
        >
          <Undo2 className="w-4 h-4" />
          <span>استعادة النصوص والصور الافتراضية للدار</span>
        </button>

        <button
          onClick={() => handleSaveConfig(config)}
          disabled={saving}
          className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white font-bold px-8 py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'جارٍ الحفظ...' : 'حفظ كل التغييرات للمتجر فوراً'}</span>
        </button>
      </div>
    </div>
  );
}
