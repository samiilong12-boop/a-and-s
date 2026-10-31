'use client';

import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  Shield,
  Trash2,
  ArrowUp,
  ArrowDown,
  Crown,
  Layers,
  ZoomIn,
  Check,
  X,
  Sliders,
  FileCheck,
} from 'lucide-react';
import { ProductImage } from '@/types';
import {
  optimizeProductImage,
  OptimizationMode,
  ImageAnalysisResult,
  OPTIMIZATION_PRESETS,
} from '@/lib/clientImageOptimizer';
import { isCloudinaryUrl, buildProductResponsiveImage } from '@/lib/productImageDelivery';

interface SmartProductImageOptimizerProps {
  primaryImageUrl: string;
  images?: ProductImage[];
  productNameEn?: string;
  productNameAr?: string;
  onChange: (primaryUrl: string, galleryImages: ProductImage[]) => void;
  showGallery?: boolean;
}

export function SmartProductImageOptimizer({
  primaryImageUrl,
  images = [],
  productNameEn = 'Fragrance',
  productNameAr = 'عطر فاخر',
  onChange,
  showGallery = true,
}: SmartProductImageOptimizerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Optimization settings
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [qualityMode, setQualityMode] = useState<OptimizationMode>('balanced');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [replaceTargetIndex, setReplaceTargetIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showSideBySide, setShowSideBySide] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  /**
   * Upload file to Cloudinary directly via short-lived authenticated signature,
   * with automatic fallback if Cloudinary credentials are not configured.
   */
  const uploadToCloudinaryOrFallback = async (
    fileToUpload: File
  ): Promise<{ url: string; publicId?: string; format?: string; bytes?: number; width?: number; height?: number }> => {
    // Step 1: Request signed upload parameters
    try {
      const signRes = await fetch('/api/admin/cloudinary/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionStorage.getItem('a_and_s_admin_jwt_token')
            ? { Authorization: `Bearer ${sessionStorage.getItem('a_and_s_admin_jwt_token')}` }
            : {}),
        },
        body: JSON.stringify({
          resourceType: 'image',
          folder: 'raheeq/products',
          filename: fileToUpload.name,
        }),
      });

      if (signRes.ok) {
        const signData = await signRes.json();
        if (signData.success && signData.uploadUrl && signData.signature) {
          // Direct browser-to-Cloudinary upload via FormData
          const formData = new FormData();
          formData.append('file', fileToUpload);
          formData.append('api_key', signData.apiKey);
          formData.append('timestamp', String(signData.timestamp));
          formData.append('signature', signData.signature);
          formData.append('folder', signData.folder);
          formData.append('public_id', signData.publicId);
          formData.append('overwrite', 'false');

          const uploadRes = await new Promise<any>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', signData.uploadUrl);

            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                setUploadProgress(percent);
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  resolve(JSON.parse(xhr.responseText));
                } catch {
                  reject(new Error('رد غير صالح من خادم Cloudinary'));
                }
              } else {
                reject(new Error(`فشل الرفع السحابي (كود ${xhr.status})`));
              }
            };

            xhr.onerror = () => reject(new Error('خطأ في شبكة الاتصال بـ Cloudinary'));
            xhr.send(formData);
          });

          if (uploadRes && uploadRes.secure_url) {
            return {
              url: uploadRes.secure_url,
              publicId: uploadRes.public_id,
              format: uploadRes.format,
              bytes: uploadRes.bytes,
              width: uploadRes.width,
              height: uploadRes.height,
            };
          }
        }
      }
    } catch (err: any) {
      console.warn('Direct Cloudinary upload notice:', err.message);
    }

    // Step 2: Fallback to local Data URL (never crashes and works offline/unconfigured)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          bytes: fileToUpload.size,
        });
      };
      reader.readAsDataURL(fileToUpload);
    });
  };

  /**
   * Handles user file selection for adding new primary/gallery image
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadProgress(null);

    try {
      let finalFile = file;
      let analysis: ImageAnalysisResult | null = null;

      if (autoOptimize) {
        analysis = await optimizeProductImage(file, qualityMode);
        finalFile = analysis.optimizedFile;
        setLastAnalysis(analysis);
        setShowSideBySide(true);
      }

      setUploadProgress(10);
      const uploaded = await uploadToCloudinaryOrFallback(finalFile);
      setUploadProgress(100);

      const newImage: ProductImage = {
        id: `img-${Date.now()}`,
        productId: '',
        url: uploaded.url,
        altTextEn: productNameEn,
        altTextAr: productNameAr,
        isPrimary: images.length === 0 || !primaryImageUrl,
        sortOrder: images.length,
      };

      const updatedGallery = [newImage, ...images.filter((img) => img.url !== uploaded.url)];
      const updatedPrimary = newImage.isPrimary ? uploaded.url : primaryImageUrl || uploaded.url;

      onChange(updatedPrimary, updatedGallery);
      showToast(
        analysis && analysis.savedPercentage > 0
          ? `✓ تم تحسين ورفع صورة العطر بنجاح! تم توفير ${analysis.savedPercentage}% من حجم الملف.`
          : '✓ تم رفع وتثبيت صورة العطر بنجاح.'
      );
    } catch (err: any) {
      showToast(`خطأ: ${err.message || 'فشلت معالجة الصورة'}`);
    } finally {
      setIsProcessing(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /**
   * Replace an existing image at specific index
   */
  const handleReplaceFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replaceTargetIndex === null) return;

    setIsProcessing(true);
    setUploadProgress(null);

    try {
      let finalFile = file;
      let analysis: ImageAnalysisResult | null = null;

      if (autoOptimize) {
        analysis = await optimizeProductImage(file, qualityMode);
        finalFile = analysis.optimizedFile;
        setLastAnalysis(analysis);
      }

      const uploaded = await uploadToCloudinaryOrFallback(finalFile);

      const updatedGallery = [...images];
      const target = updatedGallery[replaceTargetIndex];
      const wasPrimary = target?.isPrimary || primaryImageUrl === target?.url;

      updatedGallery[replaceTargetIndex] = {
        ...target,
        url: uploaded.url,
      };

      const newPrimary = wasPrimary ? uploaded.url : primaryImageUrl;
      onChange(newPrimary, updatedGallery);
      showToast('✓ تم استبدال وتحسين الصورة بنجاح.');
    } catch (err: any) {
      showToast(`خطأ أثناء الاستبدال: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setReplaceTargetIndex(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  /**
   * Set specific image as primary flacon visual
   */
  const handleSetPrimary = (index: number) => {
    const target = images[index];
    if (!target) return;

    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
      sortOrder: i === index ? 0 : i + 1,
    }));

    onChange(target.url, updated);
    showToast(`✓ تم تعيين هذه الصورة كصورة رئيسية للعطر: ${productNameAr}`);
  };

  /**
   * Move image up in gallery order
   */
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;

    const newPrimary = updated[0]?.url || primaryImageUrl;
    onChange(newPrimary, updated);
  };

  /**
   * Move image down in gallery order
   */
  const handleMoveDown = (index: number) => {
    if (index >= images.length - 1) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;

    const newPrimary = updated[0]?.url || primaryImageUrl;
    onChange(newPrimary, updated);
  };

  /**
   * Remove an image from gallery
   */
  const handleDeleteImage = (index: number) => {
    if (images.length <= 1) {
      if (!confirm('هل تريد بالتأكيد حذف الصورة الوحيدة للعطر؟')) return;
    }

    const target = images[index];
    const updated = images.filter((_, i) => i !== index);
    const newPrimary = target.url === primaryImageUrl ? updated[0]?.url || '' : primaryImageUrl;

    onChange(newPrimary, updated);
    showToast('تم إزالة الصورة من المعرض.');
  };

  return (
    <div className="space-y-4 p-5 bg-gradient-to-b from-[#141A1A] to-[#0D1212] border border-teal-500/30 rounded-2xl text-slate-100 shadow-xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-teal-900/90 border border-teal-400 text-teal-100 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-teal-300 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-sm sm:text-base flex items-center gap-2">
              <span>التحسين الذكي لصور العطور</span>
              <span className="text-[10px] bg-teal-500/20 border border-teal-400/40 text-teal-300 px-2 py-0.5 rounded-full font-mono">
                Smart Image Studio
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              ضغط تلقائي فائق السرعة يحافظ على ألوان الزجاجة ووضوح الملصق والخلفية الشفافة (Alpha).
            </p>
          </div>
        </div>

        {/* Master Auto-Optimize Toggle */}
        <label className="inline-flex items-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 text-xs font-bold transition-all">
          <input
            type="checkbox"
            checked={autoOptimize}
            onChange={(e) => setAutoOptimize(e.target.checked)}
            className="rounded text-teal-500 focus:ring-teal-400"
          />
          <span className={autoOptimize ? 'text-teal-300' : 'text-slate-400'}>
            {autoOptimize ? 'التحسين التلقائي مفعّل ✓' : 'التحسين التلقائي متوقف'}
          </span>
        </label>
      </div>

      {/* Quality Mode Switcher */}
      {autoOptimize && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-black/40 rounded-xl border border-white/10 text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1.5 text-[11px]">
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            <span>نمط جودة الصورة:</span>
          </span>

          <button
            type="button"
            onClick={() => setQualityMode('balanced')}
            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              qualityMode === 'balanced'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            متوازن (Balanced) [مستحسن]
          </button>

          <button
            type="button"
            onClick={() => setQualityMode('max_quality')}
            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              qualityMode === 'max_quality'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            أقصى جودة ونقاء نيش (2048px)
          </button>

          <button
            type="button"
            onClick={() => setQualityMode('max_savings')}
            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              qualityMode === 'max_savings'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            أقصى توفير وسرعة (1200px)
          </button>
        </div>
      )}

      {/* Main Upload Zone */}
      <div className="border-2 border-dashed border-teal-500/40 hover:border-teal-400 rounded-2xl p-6 text-center bg-black/30 transition-all">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/jpeg,image/webp,image/avif,image/heic"
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-teal-500/20 border border-teal-400/50 flex items-center justify-center mx-auto text-teal-300">
            {isProcessing ? (
              <RefreshCw className="w-6 h-6 animate-spin text-teal-400" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          <div>
            <h4 className="font-bold text-white text-sm">
              {isProcessing ? 'جاري التحسين والرفع السحابي...' : 'اختر صورة العطر لضغطها ورفعها'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              يدعم PNG الشفاف، JPEG عالي الدقة، وWebP. يقوم النظام بضغط الصورة بنسبة تصل لـ 90% مع بقاء كامل حدة الزجاجة.
            </p>
          </div>

          {/* Upload Progress Bar */}
          {uploadProgress !== null && (
            <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-teal-500/30">
              <div
                className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-lg inline-flex items-center gap-2 cursor-pointer transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>{isProcessing ? 'جاري المعالجة...' : 'اختيار صورة من جهازك'}</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Optimization Analysis Report */}
      {lastAnalysis && showSideBySide && (
        <div className="p-4 bg-teal-950/40 border border-teal-500/40 rounded-xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-200 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-teal-400" />
              <span>تقرير نتائج التحسين الذكي للصورة:</span>
            </span>
            <button
              type="button"
              onClick={() => setShowSideBySide(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-2.5 bg-black/40 rounded-lg border border-white/10">
              <span className="text-[10px] text-slate-400 block font-semibold">الحجم الأصلي</span>
              <span className="font-mono font-bold text-rose-400">{formatFileSize(lastAnalysis.originalSize)}</span>
            </div>

            <div className="p-2.5 bg-black/40 rounded-lg border border-white/10">
              <span className="text-[10px] text-slate-400 block font-semibold">الحجم بعد التحسين</span>
              <span className="font-mono font-bold text-emerald-400">{formatFileSize(lastAnalysis.optimizedSize)}</span>
            </div>

            <div className="p-2.5 bg-black/40 rounded-lg border border-teal-500/30 bg-teal-500/10">
              <span className="text-[10px] text-teal-300 block font-semibold">نسبة التوفير</span>
              <span className="font-mono font-bold text-teal-300">
                {lastAnalysis.savedPercentage > 0 ? `-${lastAnalysis.savedPercentage}%` : 'مثالي'}
              </span>
            </div>

            <div className="p-2.5 bg-black/40 rounded-lg border border-white/10">
              <span className="text-[10px] text-slate-400 block font-semibold">حالة الشفافية (Alpha)</span>
              <span className="font-bold text-amber-300 text-[11px]">
                {lastAnalysis.hasTransparency ? '✓ شفافة محفوظة' : 'معتمة (Opaque)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Product Image Gallery Management */}
      {showGallery && images.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-400" />
              <span>معرض صور العطر ({images.length} صور)</span>
            </h4>
            <span className="text-[11px] text-slate-400">اسحب أو رتب لضبط ترتيب العرض بالمتجر</span>
          </div>

          {/* Hidden input for replace */}
          <input
            type="file"
            ref={replaceInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleReplaceFileSelect}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((img, index) => {
              const isPrimary = img.url === primaryImageUrl || img.isPrimary;
              return (
                <div
                  key={img.id || index}
                  className={`relative group rounded-xl overflow-hidden border-2 bg-black/50 transition-all flex flex-col justify-between ${
                    isPrimary ? 'border-teal-400 shadow-md shadow-teal-500/20' : 'border-white/15 hover:border-white/30'
                  }`}
                >
                  {/* Image Display */}
                  <div className="aspect-[4/5] overflow-hidden relative flex items-center justify-center bg-[#FAF8F4]/5">
                    <img
                      src={img.url}
                      alt={img.altTextAr || `صورة ${index + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />

                    {isPrimary && (
                      <span className="absolute top-1.5 right-1.5 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                        <Crown className="w-3 h-3 text-amber-300" />
                        <span>رئيسية</span>
                      </span>
                    )}

                    {isCloudinaryUrl(img.url) && (
                      <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-teal-300 text-[9px] font-mono px-1.5 py-0.5 rounded">
                        CDN ✓
                      </span>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="p-1.5 bg-black/80 flex items-center justify-between text-slate-300 border-t border-white/10">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="تحريك لأعلى"
                        disabled={index === 0}
                        onClick={() => handleMoveUp(index)}
                        className="p-1 hover:text-white disabled:opacity-30 rounded hover:bg-white/10 cursor-pointer"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        title="تحريك لأسفل"
                        disabled={index === images.length - 1}
                        onClick={() => handleMoveDown(index)}
                        className="p-1 hover:text-white disabled:opacity-30 rounded hover:bg-white/10 cursor-pointer"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {!isPrimary && (
                        <button
                          type="button"
                          title="تعيين كصورة رئيسية للعطر"
                          onClick={() => handleSetPrimary(index)}
                          className="text-[10px] bg-teal-500/20 hover:bg-teal-500/40 text-teal-300 px-1.5 py-0.5 rounded cursor-pointer font-bold"
                        >
                          رئيسية
                        </button>
                      )}

                      <button
                        type="button"
                        title="استبدال هذه الصورة بملف جديد"
                        onClick={() => {
                          setReplaceTargetIndex(index);
                          replaceInputRef.current?.click();
                        }}
                        className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10 cursor-pointer text-[10px]"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        title="حذف الصورة"
                        onClick={() => handleDeleteImage(index)}
                        className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-white/10 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
