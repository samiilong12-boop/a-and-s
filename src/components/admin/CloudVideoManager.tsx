'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Upload,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Smartphone,
  Monitor,
  Image as ImageIcon,
  Shield,
  Sparkles,
  RefreshCw,
  Clock,
  HardDrive,
  Check,
  X,
  FileVideo,
  Key,
  ExternalLink,
  Info,
} from 'lucide-react';

interface CloudVideoItem {
  id: string;
  cloudinaryPublicId: string;
  cloudName: string;
  version: number;
  originalFilename: string;
  resourceType: string;
  format?: string;
  sourceSizeBytes?: number;
  durationSeconds?: number;
  width?: number;
  height?: number;
  originalUrl: string;
  mobileDeliveryUrl?: string;
  desktopDeliveryUrl?: string;
  posterUrl?: string;
  processingStatus: 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
  publishingStatus: 'DRAFT' | 'ACTIVE' | 'RETIRED' | 'DELETED';
  isShared: boolean;
  createdAt: string;
  publishedAt?: string;
  retiredAt?: string;
  scheduledDeletionAt?: string;
}

interface CloudinaryConfigState {
  isConfigured: boolean;
  cloudName: string;
  apiKeyMasked: string;
  hasSecret: boolean;
}

const getAdminAuthToken = (): string => {
  if (typeof window === 'undefined') return '';
  return (
    sessionStorage.getItem('a_and_s_admin_jwt_token') ||
    localStorage.getItem('a_and_s_admin_jwt_token') ||
    sessionStorage.getItem('raheeq_admin_token') ||
    localStorage.getItem('raheeq_admin_token') ||
    ''
  );
};

export function CloudVideoManager({
  onVideoPublished,
}: {
  onVideoPublished?: (newUrl: string, posterUrl?: string) => void;
}) {
  const [config, setConfig] = useState<CloudinaryConfigState>({
    isConfigured: false,
    cloudName: '',
    apiKeyMasked: '',
    hasSecret: false,
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customCloudName, setCustomCloudName] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [customApiSecret, setCustomApiSecret] = useState('');

  const [videos, setVideos] = useState<CloudVideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<CloudVideoItem | null>(null);
  const [draftVideo, setDraftVideo] = useState<CloudVideoItem | null>(null);

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<string>('');
  const [uploadStatusText, setUploadStatusText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Preview Mode
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile' | 'poster'>('desktop');
  const [previewPlaying, setPreviewPlaying] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4500);
  };

  // Fetch Cloudinary Config and Videos
  const loadData = async () => {
    try {
      setLoading(true);
      const token = getAdminAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Config check
      const configRes = await fetch('/api/admin/cloudinary/config', { headers });
      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData);
        setCustomCloudName(configData.cloudName || '');
      }

      // Videos list
      const videosRes = await fetch('/api/admin/cloudinary/videos', { headers });
      if (videosRes.ok) {
        const videosData = await videosRes.json();
        const list: CloudVideoItem[] = videosData.videos || [];
        setVideos(list);

        const currentActive = list.find((v) => v.publishingStatus === 'ACTIVE') || list[0] || null;
        setActiveVideo(currentActive);
      }
    } catch (err) {
      console.error('Failed loading cloud videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Cloudinary credentials
  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAdminAuthToken();
      const res = await fetch('/api/admin/cloudinary/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cloudName: customCloudName.trim(),
          apiKey: customApiKey.trim(),
          apiSecret: customApiSecret.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل حفظ الإعدادات');

      showToast('تم حفظ وتفعيل بيانات حساب Cloudinary بنجاح!');
      setShowConfigModal(false);
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Direct Browser-to-Cloudinary Upload via Signed API
  const handleStartUpload = async (file: File) => {
    if (!file) return;

    // Validation: Type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov)$/i)) {
      showToast('نوع الملف غير مدعوم. الصيغ المسموحة للفيديو: MP4, WebM, MOV', 'error');
      return;
    }

    // Validation: Size (Max 100MB)
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast('حجم الفيديو يتجاوز الحد الأقصى المسموح (100 ميجابايت).', 'error');
      return;
    }

    setSelectedFile(file);
    setUploadProgress(0);
    setUploadStatusText('جاري إنشاء التوقيع الأمني والاتصال بـ Cloudinary...');

    try {
      const token = getAdminAuthToken();

      // 1. Get Signed upload signature from Next.js server route
      const signRes = await fetch('/api/admin/cloudinary/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filename: file.name }),
      });

      const signData = await signRes.json();
      if (!signRes.ok || !signData.signature) {
        throw new Error(signData.error || 'فشل توليد توقيع الرفع السحابي');
      }

      setUploadStatusText('جاري رفع الفيديو مباشرة إلى Cloudinary دون المرور بسيرفر Vercel...');

      // 2. Perform direct browser-to-Cloudinary upload with progress tracking
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signData.apiKey);
      formData.append('timestamp', String(signData.timestamp));
      formData.append('signature', signData.signature);
      formData.append('folder', signData.folder);
      formData.append('public_id', signData.publicId);
      formData.append('eager', signData.eager);
      formData.append('overwrite', 'false');

      const startTime = Date.now();

      await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);

            const elapsedSec = (Date.now() - startTime) / 1000;
            if (elapsedSec > 0.5) {
              const speedKbps = Math.round(event.loaded / 1024 / elapsedSec);
              setUploadSpeed(`${speedKbps > 1024 ? (speedKbps / 1024).toFixed(1) + ' MB/s' : speedKbps + ' KB/s'}`);
            }
          }
        };

        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              reject(new Error('استجابة غير صالحة من خادم Cloudinary'));
            }
          } else {
            try {
              const errResp = JSON.parse(xhr.responseText);
              reject(new Error(errResp.error?.message || `خطأ الرفع السحابي (${xhr.status})`));
            } catch {
              reject(new Error(`فشل الرفع السحابي بكود: ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => reject(new Error('انقطع الاتصال بخادم Cloudinary أثناء الرفع'));
        xhr.onabort = () => reject(new Error('تم إلغاء عملية الرفع'));

        xhr.open('POST', signData.uploadUrl);
        xhr.send(formData);
      }).then(async (cldResult) => {
        setUploadStatusText('تم الرفع السحابي! جاري معالجة مشتقات الموبايل والبوستر وحفظ السجل...');

        // 3. Register completed upload in database
        const completeRes = await fetch('/api/admin/cloudinary/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            publicId: cldResult.public_id,
            version: cldResult.version,
            bytes: cldResult.bytes,
            duration: cldResult.duration,
            format: cldResult.format,
            width: cldResult.width,
            height: cldResult.height,
            secureUrl: cldResult.secure_url,
            originalFilename: file.name,
            eager: cldResult.eager,
          }),
        });

        const completeData = await completeRes.json();
        if (!completeRes.ok) throw new Error(completeData.error || 'فشل حفظ بيانات الفيديو في السجلات');

        setDraftVideo(completeData.video);
        showToast('تم رفع ومعالجة الفيديو الجديد بنجاح! يمكنك الآن معاينته ونشره فوراً.');
        loadData();
      });
    } catch (err: any) {
      if (err.message !== 'تم إلغاء عملية الرفع') {
        showToast(err.message || 'حدث خطأ أثناء رفع الفيديو', 'error');
      }
    } finally {
      setUploadProgress(null);
      setUploadSpeed('');
      setUploadStatusText('');
      setSelectedFile(null);
      xhrRef.current = null;
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Cancel in-progress upload
  const handleCancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
      setUploadProgress(null);
      setSelectedFile(null);
      showToast('تم إلغاء عملية الرفع.', 'error');
    }
  };

  // Publish video to live storefront
  const handlePublishVideo = async (videoId: string) => {
    try {
      const token = getAdminAuthToken();
      const res = await fetch('/api/admin/cloudinary/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ videoId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل نشر الفيديو');

      showToast(data.message || 'تم نشر الفيديو بنجاح في الواجهة الرئيسية للمتجر!');
      setDraftVideo(null);
      loadData();

      if (onVideoPublished && data.video) {
        onVideoPublished(
          data.video.desktopDeliveryUrl || data.video.originalUrl,
          data.video.posterUrl
        );
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Rollback to retired video
  const handleRollbackVideo = async (videoId: string) => {
    if (!confirm('هل تريد استعادة وتفعيل هذا الفيديو السابق كفيديو رئيسي لواجهة المتجر الآن؟')) return;

    try {
      const token = getAdminAuthToken();
      const res = await fetch('/api/admin/cloudinary/rollback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ videoId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل التراجع');

      showToast(data.message || 'تمت استعادة الفيديو بنجاح!');
      loadData();

      if (onVideoPublished && data.video) {
        onVideoPublished(
          data.video.desktopDeliveryUrl || data.video.originalUrl,
          data.video.posterUrl
        );
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Delete retired video safely
  const handleDeleteVideo = async (videoId: string, force = false) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفيديو نهائياً من خوادم Cloudinary وتحرير مساحة التخزين؟')) return;

    try {
      const token = getAdminAuthToken();
      const res = await fetch('/api/admin/cloudinary/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ videoId, force }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.inSafetyPeriod && confirm(`${data.error}\n\nهل ترغب في تجاوز فترة الأمان وتأكيد الحذف النهائي الآن؟`)) {
          return handleDeleteVideo(videoId, true);
        }
        throw new Error(data.error || 'فشل حذف الفيديو');
      }

      showToast(data.message || 'تم حذف الفيديو بأمان من السحابة.');
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const previewTarget = draftVideo || activeVideo;
  const currentVideoUrl = previewMode === 'mobile'
    ? (previewTarget?.mobileDeliveryUrl || previewTarget?.originalUrl)
    : (previewTarget?.desktopDeliveryUrl || previewTarget?.originalUrl);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border animate-in slide-in-from-top duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-900/95 text-white border-emerald-500'
              : 'bg-rose-900/95 text-white border-rose-500'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header & Cloud Health Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Film className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900">
                مدير الفيديوهات السحابي الذكي (Smart Cloud Video Manager)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                رفع سينمائي مباشر لسحابة Cloudinary، ضغط فوري متقدم لشاشات الموبايل والكمبيوتر، واستبدال آمن مع حفظ النسخ السابقة.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${
              config.isConfigured
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${config.isConfigured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <span>{config.isConfigured ? `Cloudinary نشط (${config.cloudName})` : 'إعداد Cloudinary مطلوب'}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-slate-600" />
            <span>إعدادات السحابة</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Upload & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Direct Upload Zone & Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Drag & Drop Upload Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
              <Upload className="w-4 h-4 text-teal-700" />
              <span>رفع فيديو جديد للبانر الرئيسي (Direct Cloud Upload)</span>
            </h3>

            {/* Hidden Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleStartUpload(file);
              }}
            />

            {/* Drop Target */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleStartUpload(file);
              }}
              onClick={() => {
                if (uploadProgress === null && fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-teal-500 bg-teal-50/60 scale-[1.01]'
                  : uploadProgress !== null
                  ? 'border-slate-300 bg-slate-50 cursor-default'
                  : 'border-slate-300 hover:border-teal-500 hover:bg-teal-50/20'
              }`}
            >
              {uploadProgress !== null ? (
                <div className="space-y-4 max-w-md mx-auto py-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-2">
                      <FileVideo className="w-4 h-4 text-teal-700" />
                      <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
                    </span>
                    <span className="text-teal-700 font-mono">{uploadProgress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-600 to-emerald-500 h-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{uploadSpeed && `السرعة: ${uploadSpeed}`}</span>
                    <span>{selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : ''}</span>
                  </div>

                  <p className="text-xs text-teal-800 font-medium animate-pulse">{uploadStatusText}</p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelUpload();
                    }}
                    className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    إلغاء الرفع
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 mx-auto flex items-center justify-center shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      اسحب وأفلت ملف الفيديو هنا، أو <span className="text-teal-700 underline">اضغط للاختيار من جهازك</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      صيغ MP4, WebM, MOV حتى 100 ميجابايت • يتم الرفع السحابي المباشر عبر قناة مشفرة
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-teal-600" /> توقيع أمني مؤقت
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> ضغط تلقائي للموبايل (230 KB)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Architecture Tip */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>حماية سرعة الموقع:</strong> عند رفع الفيديو يقوم النظام تلقائياً بإنشاء نسختين: نسخة للموبايل فائقة الخفة (~230KB) مع صيغة H.264، ونسخة للكمبيوتر عالية الدقة (720p)، مع توليد صورة الغلاف LCP بدقة عالية.
              </p>
            </div>
          </div>

          {/* Draft Preview / Publishing Action Card */}
          {draftVideo && (
            <div className="bg-gradient-to-br from-amber-50/80 to-teal-50/80 rounded-2xl border-2 border-amber-400 p-6 shadow-sm space-y-4 animate-in slide-in-from-top">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <h4 className="font-serif font-bold text-slate-900 text-sm">
                    مسودة الفيديو الجديد جاهزة للمعاينة والنشر!
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  DRAFT • مسودة غير منشورة
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white/80 p-3 rounded-xl border border-amber-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">الملف الأصلي</span>
                  <span className="font-bold text-slate-800 truncate block">{draftVideo.originalFilename}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">الحجم الأصلي</span>
                  <span className="font-bold text-slate-800">
                    {draftVideo.sourceSizeBytes ? `${(draftVideo.sourceSizeBytes / (1024 * 1024)).toFixed(2)} MB` : 'غير محدد'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">المدة</span>
                  <span className="font-bold text-slate-800">
                    {draftVideo.durationSeconds ? `${draftVideo.durationSeconds.toFixed(1)} ثانية` : 'تلقائي'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">الأبعاد</span>
                  <span className="font-bold text-slate-800">
                    {draftVideo.width && draftVideo.height ? `${draftVideo.width}x${draftVideo.height}` : 'HD'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDraftVideo(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer w-full sm:w-auto"
                >
                  إلغاء والاحتفاظ بالقديم
                </button>
                <button
                  type="button"
                  onClick={() => handlePublishVideo(draftVideo.id)}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto"
                >
                  <Check className="w-4 h-4" />
                  <span>اعتماد ونشر فوري بالمتجر العام 🚀</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Video Card Details */}
          {activeVideo && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="font-serif font-bold text-slate-900 text-sm">
                    الفيديو النشط حالياً في واجهة المتجر (Live Active Video)
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  LIVE • نشط بالمتجر
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">اسم الفيديو</span>
                  <span className="font-bold text-slate-800 truncate block">{activeVideo.originalFilename}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">حجم سحابة الموبايل</span>
                  <span className="font-bold text-teal-700 font-mono">~230 KB (Eco)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">حجم الكمبيوتر</span>
                  <span className="font-bold text-slate-800 font-mono">~1.8 MB (720p)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">تاريخ النشر</span>
                  <span className="font-bold text-slate-800 text-[11px]">
                    {activeVideo.publishedAt ? new Date(activeVideo.publishedAt).toLocaleDateString('ar-EG') : 'منشور'}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Live Simulated Device Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-teal-700" />
                <span>معاينة العرض حسب الجهاز:</span>
              </h3>

              {/* Device Selector Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                    previewMode === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="معاينة شاشات الكمبيوتر"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">كمبيوتر</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                    previewMode === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="معاينة شاشات الموبايل"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">موبايل</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('poster')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                    previewMode === 'poster' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="صورة الغلاف LCP"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">الغلاف</span>
                </button>
              </div>
            </div>

            {/* Frame Display */}
            <div className="flex justify-center items-center py-2 bg-slate-900 rounded-xl overflow-hidden min-h-[340px] relative">
              {previewMode === 'poster' ? (
                <div className="relative w-full h-[320px]">
                  <img
                    src={previewTarget?.posterUrl || '/images/campaign/as-signature-male-spray-mobile.webp'}
                    alt="Hero Poster Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                    <span className="px-3 py-1 bg-black/70 text-white rounded-full text-xs font-bold border border-white/20">
                      صورة الغلاف (LCP Anchor)
                    </span>
                  </div>
                </div>
              ) : previewMode === 'mobile' ? (
                /* Mobile Phone Simulated Shell */
                <div className="w-[200px] h-[320px] rounded-3xl border-4 border-slate-700 bg-black overflow-hidden relative shadow-2xl flex flex-col justify-center">
                  <div className="absolute top-1 inset-x-0 flex justify-center z-20">
                    <span className="w-16 h-3 bg-slate-800 rounded-full" />
                  </div>
                  <video
                    ref={videoPlayerRef}
                    key={currentVideoUrl}
                    src={currentVideoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 inset-x-0 flex justify-center z-20 pointer-events-none">
                    <span className="text-[9px] font-bold bg-black/70 text-teal-400 px-2 py-0.5 rounded-full border border-teal-500/30">
                      480p • 230 KB
                    </span>
                  </div>
                </div>
              ) : (
                /* Desktop Widescreen Frame */
                <div className="w-full h-[320px] relative">
                  <video
                    ref={videoPlayerRef}
                    key={currentVideoUrl}
                    src={currentVideoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/20 flex items-center gap-1.5 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>HD 720p • كمبيوتر</span>
                  </div>
                </div>
              )}
            </div>

            {/* Play / Pause Toggle Bar */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>{draftVideo ? 'معاينة المسودة المرفوعة حديثاً' : 'معاينة الفيديو المنشور حالياً'}</span>
              <button
                type="button"
                onClick={() => {
                  if (videoPlayerRef.current) {
                    if (previewPlaying) {
                      videoPlayerRef.current.pause();
                    } else {
                      videoPlayerRef.current.play();
                    }
                    setPreviewPlaying(!previewPlaying);
                  }
                }}
                className="text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                {previewPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{previewPlaying ? 'إيقاف مؤقت' : 'تشغيل'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Version History & Safe Retirement Manager */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-700" />
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-sm">
                سجل الفيديوهات السابقة وفترة الأمان (Version History & Safe Rollback)
              </h3>
              <p className="text-xs text-slate-500">
                الفيديوهات السابقة تُحفظ في فترة أمان (7 أيام) مع إمكانية استعادتها بضغطة زر واحدة قبل الحذف السحابي.
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            إجمالي النسخ: {videos.length}
          </span>
        </div>

        {videos.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
            لا توجد فيديوهات سابقة مسجلة حالياً في قاعدة البيانات.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">الفيديو</th>
                  <th className="py-2.5 px-3">الحالة</th>
                  <th className="py-2.5 px-3">الحجم الأصلي</th>
                  <th className="py-2.5 px-3">تاريخ النشر</th>
                  <th className="py-2.5 px-3">فترة الأمان المتبقية</th>
                  <th className="py-2.5 px-3 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {videos.map((v) => {
                  const isActive = v.publishingStatus === 'ACTIVE';
                  const isRetired = v.publishingStatus === 'RETIRED';
                  const isDraft = v.publishingStatus === 'DRAFT';

                  return (
                    <tr key={v.id} className={isActive ? 'bg-emerald-50/40 font-medium' : 'hover:bg-slate-50/60'}>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <FileVideo className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <div>
                            <span className="font-bold text-slate-800 block">{v.originalFilename}</span>
                            <span className="text-[10px] text-slate-400 font-mono truncate block max-w-[200px]">{v.cloudinaryPublicId}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {isActive ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            نشط حالياً (Live)
                          </span>
                        ) : isRetired ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            متقاعد محفوظ (Retired)
                          </span>
                        ) : isDraft ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            مسودة (Draft)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            محذوف
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-700">
                        {v.sourceSizeBytes ? `${(v.sourceSizeBytes / (1024 * 1024)).toFixed(1)} MB` : '—'}
                      </td>

                      <td className="py-3 px-3 text-slate-500">
                        {v.publishedAt ? new Date(v.publishedAt).toLocaleDateString('ar-EG') : 'لم ينشر'}
                      </td>

                      <td className="py-3 px-3">
                        {isRetired && v.scheduledDeletionAt ? (
                          <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>حتى {new Date(v.scheduledDeletionAt).toLocaleDateString('ar-EG')}</span>
                          </span>
                        ) : isActive ? (
                          <span className="text-[11px] text-emerald-700 font-bold">محمي بالكامل (نشط)</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-left">
                        <div className="flex items-center justify-end gap-2">
                          {isRetired && (
                            <button
                              type="button"
                              onClick={() => handleRollbackVideo(v.id)}
                              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="استعادة كفيديو رئيسي"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>استعادة (Rollback)</span>
                            </button>
                          )}

                          {isDraft && (
                            <button
                              type="button"
                              onClick={() => handlePublishVideo(v.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="نشر الآن"
                            >
                              <Check className="w-3 h-3" />
                              <span>نشر</span>
                            </button>
                          )}

                          {!isActive && (
                            <button
                              type="button"
                              onClick={() => handleDeleteVideo(v.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="حذف سحابي نهائي"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cloudinary Settings Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl text-slate-900">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-teal-700" />
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  إعدادات حساب Cloudinary الخاص بدار رحيق
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
              <p className="text-slate-500 text-xs leading-relaxed">
                يتم تخزين هذه البيانات بصورة مشفرة وآمنة في السيرفر لإنشاء التواقيع المؤقتة للرفع المباشر دون كشف الـ API Secret للجمهور.
              </p>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  اسم السحابة (Cloud Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customCloudName}
                  onChange={(e) => setCustomCloudName(e.target.value)}
                  placeholder="مثال: raheeq-perfumes أو sxafwhcs"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  مفتاح الـ API (API Key) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="مثال: 948123456789123"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  الرمز السري (API Secret) <span className="text-rose-500">* (يُحفظ بأمان في السيرفر فقط)</span>
                </label>
                <input
                  type="password"
                  required
                  value={customApiSecret}
                  onChange={(e) => setCustomApiSecret(e.target.value)}
                  placeholder="••••••••••••••••••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>حفظ وتفعيل الحساب</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
