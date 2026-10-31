'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  Image as ImageIcon,
  HardDrive,
  Zap,
} from 'lucide-react';

interface AuditStats {
  totalProducts: number;
  totalImages: number;
  base64ImagesCount: number;
  unoptimizedCloudCount: number;
  optimizedCloudCount: number;
  localImagesCount: number;
  estimatedSavingsBytes: number;
  estimatedSavingsMB: string;
}

interface AuditedProduct {
  id: string;
  nameEn: string;
  nameAr?: string;
  imageUrl?: string;
  imagesCount: number;
  hasBase64: boolean;
  hasUnoptimizedCloud: boolean;
  isOptimized: boolean;
}

interface BulkImageOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCatalogUpdated?: () => void;
}

export function BulkImageOptimizerModal({ isOpen, onClose, onCatalogUpdated }: BulkImageOptimizerModalProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [products, setProducts] = useState<AuditedProduct[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/images/audit', {
        headers: {
          ...(sessionStorage.getItem('a_and_s_admin_jwt_token')
            ? { Authorization: `Bearer ${sessionStorage.getItem('a_and_s_admin_jwt_token')}` }
            : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setProducts(data.products || []);
      }
    } catch (err) {
      console.warn('Audit fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAudit();
    }
  }, [isOpen]);

  const handleApplyBulkOptimization = async (action: 'bulk_transform' | 'clean_base64') => {
    setIsApplying(true);
    setResultMessage('');
    try {
      const res = await fetch('/api/admin/images/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionStorage.getItem('a_and_s_admin_jwt_token')
            ? { Authorization: `Bearer ${sessionStorage.getItem('a_and_s_admin_jwt_token')}` }
            : {}),
        },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        const data = await res.json();
        setResultMessage(data.message || 'تم إتمام التحسين السحابي بنجاح!');
        await fetchAudit();
        if (onCatalogUpdated) onCatalogUpdated();
      } else {
        setResultMessage('تعذر استكمال التحسين السحابي.');
      }
    } catch {
      setResultMessage('خطأ في الاتصال بالخادم.');
    } finally {
      setIsApplying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#101414] border border-teal-500/40 rounded-2xl p-6 max-w-4xl w-full text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <span>أداة الفحص والتحسين الشامل لصور كتالوج العطور</span>
                <span className="text-[10px] bg-teal-500/20 border border-teal-400/30 text-teal-300 px-2 py-0.5 rounded-full font-mono">
                  Bulk Optimizer
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                فحص وتحسين جميع صور العطور السابقة غير الإتلافي مع تقليل استهلاك الباندويث وتسريع المتجر.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Result Notification */}
        {resultMessage && (
          <div className="p-3 bg-teal-900/80 border border-teal-400 text-teal-100 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-teal-300 flex-shrink-0" />
            <span>{resultMessage}</span>
          </div>
        )}

        {/* Audit Stats Cards */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-400" />
            <p className="text-xs">جاري فحص جميع صور العطور بالكتالوج...</p>
          </div>
        ) : (
          stats && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-400 block font-semibold">إجمالي العطور</span>
                  <span className="font-serif font-bold text-lg text-white">{stats.totalProducts}</span>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-400 block font-semibold">إجمالي الصور</span>
                  <span className="font-serif font-bold text-lg text-teal-300">{stats.totalImages}</span>
                </div>

                <div className="p-3 bg-teal-950/40 rounded-xl border border-teal-500/40">
                  <span className="text-[10px] text-teal-300 block font-semibold">محسّنة سحابياً (CDN)</span>
                  <span className="font-serif font-bold text-lg text-emerald-400">{stats.optimizedCloudCount}</span>
                </div>

                <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-500/40">
                  <span className="text-[10px] text-amber-300 block font-semibold">التوفير السحابي المتوقع</span>
                  <span className="font-serif font-bold text-lg text-amber-300">~{stats.estimatedSavingsMB} MB</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-teal-950/30 border border-teal-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-white block flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>التحسين السحابي الذكي غير الإتلافي (Cloud Delivery Transformations)</span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    يقوم بتطبيق تقنيات q_auto و f_auto على جميع روابط الصور بدون مساس بالصور الأصلية وبدون حذف أي ملف.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isApplying}
                  onClick={() => handleApplyBulkOptimization('bulk_transform')}
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-lg inline-flex items-center gap-2 cursor-pointer whitespace-nowrap transition-all"
                >
                  {isApplying ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-teal-200" />
                  )}
                  <span>تطبيق التحسين السحابي للجميع ⚡</span>
                </button>
              </div>

              {/* Product Audit Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-300">حالة صور العطور:</h4>
                <div className="max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-black/40 divide-y divide-white/5 text-xs">
                  {products.map((p) => (
                    <div key={p.id} className="p-2.5 flex items-center justify-between gap-3 hover:bg-white/5">
                      <div className="flex items-center gap-2.5 truncate">
                        {p.imageUrl && (
                          <img
                            src={p.imageUrl}
                            alt={p.nameEn}
                            className="w-8 h-8 rounded-md object-cover border border-white/10 flex-shrink-0"
                          />
                        )}
                        <div className="truncate">
                          <span className="font-bold text-white block truncate">{p.nameAr || p.nameEn}</span>
                          <span className="text-[10px] text-slate-400 font-mono block truncate">{p.nameEn}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {p.isOptimized ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>محسّن CDN ✓</span>
                          </span>
                        ) : p.hasUnoptimizedCloud ? (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>سحابي جاهز للتحسين</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                            صورة قياسية
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
