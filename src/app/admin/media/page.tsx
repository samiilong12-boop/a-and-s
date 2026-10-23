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
} from 'lucide-react';

interface HeroConfig {
  activeVideoUrl: string;
  visualMode: 'video' | 'photo';
  videoTitle: string;
  updatedAt: string;
}

const PRESET_VIDEOS = [
  {
    id: 'campaign-hero',
    title: 'فيديو الحملة الإعلانية الأصلي لدار A AND S',
    subtitle: 'موديل يرش العطر بجوار البحر الفيروزي (854 KB MP4)',
    url: '/videos/campaign-hero.mp4',
    badge: 'فيديو البراند الأصلي المعتمد',
  },
  {
    id: 'rose-mist',
    title: 'رذاذ بتلات الورد وزجاجة العطر الفاخرة',
    subtitle: 'حركة بطيئة سينمائية عالية الدقة',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-perfume-bottle-and-rose-petals-falling-41589-large.mp4',
    badge: 'تأثير رذاذ رومانسي',
  },
];

export default function AdminMediaPage() {
  const [config, setConfig] = useState<HeroConfig>({
    activeVideoUrl: '/videos/campaign-hero.mp4',
    visualMode: 'video',
    videoTitle: 'الفيديو الإعلاني الأصلي لبراند A AND S',
    updatedAt: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch current config on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/hero-config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error('Failed to load hero config', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveConfig = async (newConfig: Partial<HeroConfig>) => {
    try {
      setSaving(true);
      const updated = { ...config, ...newConfig };
      const res = await fetch('/api/admin/hero-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        showNotification('تم حفظ وتحديث الفيديو بنجاح! سيظهر الآن لجميع زوار الموقع فوراً.');
      } else {
        showNotification('تعذر حفظ التغييرات. يرجى المحاولة مرة أخرى.', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'خطأ في الاتصال بالخادم', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('video', file);

      const res = await fetch('/api/admin/upload-video', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(data.config);
        showNotification(`تم رفع الفيديو (${file.name}) بنجاح وتم تعيينه كفيديو رئيسي للموقع!`);
        if (videoPreviewRef.current) {
          videoPreviewRef.current.load();
          videoPreviewRef.current.play().catch(console.error);
        }
      } else {
        showNotification(data.error || 'فشل رفع الفيديو', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'خطأ أثناء رفع ملف الفيديو', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyPreset = (preset: (typeof PRESET_VIDEOS)[0]) => {
    handleSaveConfig({
      activeVideoUrl: preset.url,
      visualMode: 'video',
      videoTitle: preset.title,
    });
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) {
      showNotification('يرجى كتابة رابط الفيديو أولاً', 'error');
      return;
    }
    handleSaveConfig({
      activeVideoUrl: customUrlInput.trim(),
      visualMode: 'video',
      videoTitle: 'فيديو خارجي من رابط مباشر',
    });
    setCustomUrlInput('');
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
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-teal-800 uppercase">
              إدارة الوسائط والهوية المرئية (خاص بالمالك)
            </span>
            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold">
              صفحة سرية غير مرئية للجمهور
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1 flex items-center gap-2.5">
            <Film className="w-7 h-7 text-teal-700" />
            <span>إدارة الفيديو الرئيسي وخلفية الواجهة (Hero Media)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            من هنا يمكنك رفع أي فيديو جديد من جهازك، أو اختيار فيديو من المكتبة الجاهزة، أو التبديل بين وضع الفيديو والصورة. التعديل هنا ينعكس فوراً على واجهة المتجر لجميع العملاء.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs self-start md:self-auto"
        >
          <span>معاينة الواجهة كعميل</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Alert Notifications */}
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

      {/* Section 1: Live Storefront Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" />
            <h2 className="font-bold text-slate-900 text-sm">
              معاينة حية: الفيديو النشط حالياً على الموقع
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">العنوان:</span>
            <strong className="text-teal-900 font-bold">{config.videoTitle}</strong>
          </div>
        </div>

        <div className="p-6">
          <div className="relative aspect-video max-h-[380px] w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-300 shadow-inner flex items-center justify-center">
            {config.visualMode === 'video' ? (
              <video
                ref={videoPreviewRef}
                key={config.activeVideoUrl}
                src={config.activeVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src="/images/campaign/as-signature-male-spray.jpg"
                alt="Editorial Photo"
                className="w-full h-full object-cover"
              />
            )}

            {/* Dark luxury overlay preview */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 pointer-events-none" />

            {/* Simulated Storefront Typography */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none text-white">
              <span className="text-[10px] tracking-[0.3em] uppercase text-emerald-300 font-bold bg-black/60 px-3 py-1 rounded-full border border-emerald-400/40 mb-2">
                A AND S HAUTE PARFUMERIE
              </span>
              <h3 className="font-serif text-xl sm:text-3xl font-bold drop-shadow-lg">
                بصمة لا تُنسى في كل قطرة
              </h3>
              <p className="text-xs text-slate-200 mt-1 max-w-md drop-shadow">
                هكذا يرى زوار الموقع وعملاؤك الفيديو في الخلفية خلف العبارات الملكية
              </p>
            </div>

            {/* Live Playback Controls */}
            {config.visualMode === 'video' && (
              <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-xs text-white">
                <button
                  onClick={togglePreviewPlayback}
                  className="hover:text-emerald-400 flex items-center gap-1 font-bold transition-colors"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Mode Switcher Buttons */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">الوضع المعروض حالياً للزوار:</span>
              <button
                onClick={() => handleSaveConfig({ visualMode: 'video' })}
                disabled={saving}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  config.visualMode === 'video'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>فيديو سينمائي متحرك (موصى به)</span>
              </button>
              <button
                onClick={() => handleSaveConfig({ visualMode: 'photo' })}
                disabled={saving}
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

            <div className="text-[11px] text-slate-400">
              آخر تحديث: {config.updatedAt ? new Date(config.updatedAt).toLocaleString('ar-EG') : 'الآن'}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Upload New Video from Computer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                رفع فيديو جديد من جهازك (كمبيوترك أو هاتفك)
              </h2>
              <p className="text-xs text-slate-500">
                اختر أي ملف فيديو بصيغة MP4 أو WebM أو MOV ليتم رفعه وحفظه في الموقع فوراً.
              </p>
            </div>
          </div>
        </div>

        <div className="border-2 border-dashed border-teal-200 hover:border-teal-500 rounded-2xl p-8 text-center bg-teal-50/30 transition-colors">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="video/mp4,video/webm,video/quicktime,video/m4v"
            className="hidden"
            id="admin-video-upload"
          />

          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-700 mx-auto flex items-center justify-center shadow-inner">
              <FileVideo className="w-7 h-7" />
            </div>

            <div>
              <label
                htmlFor="admin-video-upload"
                className={`cursor-pointer inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all ${
                  uploading ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جارٍ رفع ومعالجة الفيديو على السيرفر...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>اختر ملف فيديو من جهازك الآن</span>
                  </>
                )}
              </label>
            </div>

            <p className="text-xs text-slate-500">
              يدعم ملفات: MP4, MOV, WebM حتى 100 ميجابايت. يُفضل دقة 1080p أو 4K بنسبة عرض أفقية (16:9).
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Built-in Brand Library */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base">
              مكتبة فيديوهات الحملات المعتمدة الجاهزة
            </h2>
            <p className="text-xs text-slate-500">
              يمكنك التبديل بين أي من هذه الفيديوهات بنقرة زر واحدة دون الحاجة لإعادة الرفع:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {PRESET_VIDEOS.map((preset) => {
            const isCurrent = config.activeVideoUrl === preset.url;
            return (
              <div
                key={preset.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  isCurrent
                    ? 'border-teal-500 bg-teal-50/50 shadow-xs ring-1 ring-teal-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/70 px-2.5 py-0.5 rounded-full">
                      {preset.badge}
                    </span>
                    {isCurrent && (
                      <span className="text-[11px] font-bold text-teal-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>مفعل حالياً</span>
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{preset.title}</h4>
                  <p className="text-xs text-slate-500">{preset.subtitle}</p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleApplyPreset(preset)}
                    disabled={isCurrent || saving}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-teal-700 text-white opacity-70 cursor-default'
                        : 'bg-slate-100 hover:bg-teal-700 hover:text-white text-slate-800'
                    }`}
                  >
                    {isCurrent ? 'هذا الفيديو هو النشط الآن على الموقع' : 'تفعيل هذا الفيديو للواجهة فوراً'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4: Custom Video Link / URL */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <ExternalLink className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base">
              إدخال رابط فيديو خارجي مباشر (Custom URL)
            </h2>
            <p className="text-xs text-slate-500">
              إذا كان لديك فيديو مرفوع على سيرفر خارجي أو CDN أو استضافة خاصة، ضع رابطه المباشر هنا:
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <input
            type="url"
            value={customUrlInput}
            onChange={(e) => setCustomUrlInput(e.target.value)}
            placeholder="مثال: https://cdn.example.com/perfume-campaign.mp4"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs sm:text-sm font-mono text-slate-900"
          />
          <button
            onClick={handleApplyCustomUrl}
            disabled={saving || !customUrlInput.trim()}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>تطبيق الرابط</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Security Note for the Owner */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900">ملاحظة أمنية للمالك:</h4>
          <p>
            هذه الصفحة ولوحة تحكم الإدارة بالكامل (Admin Portal) تم إخفاؤها وحذف أي روابط تؤدي إليها من واجهة المتجر وقوائم الموقع والفوتر. فقط من يكتب الرابط السري <code className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono">/admin</code> مباشرة في المتصفح يستطيع الوصول إليها.
          </p>
        </div>
      </div>
    </div>
  );
}
