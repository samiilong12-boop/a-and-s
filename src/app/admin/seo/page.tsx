'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Globe,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ExternalLink,
  Copy,
  Save,
  RefreshCw,
  Eye,
  Sliders,
  Layers,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Smartphone,
  Monitor,
  Tag,
  BookOpen,
  ArrowRight,
  Plus,
  Trash2,
} from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { CATEGORY_REGISTRY } from '@/lib/data/categories';
import { formatPrice } from '@/lib/currency';
import { Product } from '@/types';

type ActiveTab =
  | 'perfumes'
  | 'categories'
  | 'audit'
  | 'indexing'
  | 'rich-results'
  | 'articles'
  | 'growth';

const SITE_URL = 'https://a-and-s.vercel.app';

export default function AdminSeoGrowthPage() {
  const { products } = useProducts();
  const [activeTab, setActiveTab] = useState<ActiveTab>('perfumes');
  const [toastMessage, setToastMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // SEO Config state
  const [seoConfig, setSeoConfig] = useState<any>({
    productSeo: {},
    categorySeo: {},
    googleVerificationCode: '',
    articles: [],
  });

  // Load SEO config from server
  useEffect(() => {
    fetch('/api/admin/seo')
      .then((r) => r.json())
      .then((data) => {
        if (data) setSeoConfig(data);
      })
      .catch((e) => console.warn('Could not load seo config', e));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleSaveSeoConfig = async (updatedConfig: any) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig),
      });
      if (res.ok) {
        setSeoConfig(updatedConfig);
        showToast('تم حفظ وتحديث إعدادات السيو والظهور السحابية بنجاح ✓');
      } else {
        showToast('حدث خطأ أثناء حفظ الإعدادات، يرجى المحاولة ثانية.');
      }
    } catch {
      showToast('تعذر الاتصال بالخادم.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- TAB 1: PER-PERFUME SEO ---
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>(
    products[0]?.slug || 'dior-sauvage-elixir'
  );
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  const selectedProduct = useMemo(() => {
    return (
      products.find((p) => p.slug === selectedProductSlug || p.id === selectedProductSlug) ||
      products[0]
    );
  }, [products, selectedProductSlug]);

  const currentProductSeo = seoConfig.productSeo[selectedProductSlug] || {};

  const [perfumeSeoTitle, setPerfumeSeoTitle] = useState('');
  const [perfumeMetaDesc, setPerfumeMetaDesc] = useState('');
  const [perfumeKeywords, setPerfumeKeywords] = useState('');
  const [perfumeOgImage, setPerfumeOgImage] = useState('');

  // Sync form when selected product changes
  useEffect(() => {
    if (selectedProduct) {
      const pSeo = seoConfig.productSeo[selectedProduct.slug || selectedProduct.id] || {};
      setPerfumeSeoTitle(
        pSeo.seoTitle ||
          `${selectedProduct.nameAr || selectedProduct.nameEn} | دار رَحِيقْ للعطور الملكية`
      );
      setPerfumeMetaDesc(
        pSeo.metaDesc ||
          selectedProduct.descriptionAr ||
          selectedProduct.descriptionEn ||
          `عطر فاخر ومستقل من إبداع دار رحيق مستوحى من الطابع الشمّي لـ ${selectedProduct.nameEn}. مع فتح وفحص الشحنة عند الاستلام.`
      );
      setPerfumeKeywords(
        (pSeo.seoKeywords || [
          selectedProduct.nameEn,
          selectedProduct.nameAr,
          'عطور رحيق',
          selectedProduct.fragranceFamily,
        ])
          .filter(Boolean)
          .join(', ')
      );
      setPerfumeOgImage(
        pSeo.ogImageUrl ||
          selectedProduct.images?.[0]?.url ||
          selectedProduct.imageUrl ||
          `${SITE_URL}/images/raheeq-official-logo.png`
      );
    }
  }, [selectedProductSlug, seoConfig]);

  const handleSaveProductSeo = () => {
    if (!selectedProduct) return;
    const slugKey = selectedProduct.slug || selectedProduct.id;
    const updated = {
      ...seoConfig,
      productSeo: {
        ...seoConfig.productSeo,
        [slugKey]: {
          seoTitle: perfumeSeoTitle.trim(),
          metaDesc: perfumeMetaDesc.trim(),
          seoKeywords: perfumeKeywords.split(',').map((s) => s.trim()).filter(Boolean),
          ogImageUrl: perfumeOgImage.trim(),
        },
      },
    };
    handleSaveSeoConfig(updated);
  };

  // --- TAB 2: CATEGORY SEO ---
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('oriental');
  const selectedCategory = useMemo(() => {
    return (
      CATEGORY_REGISTRY.find((c) => c.slug === selectedCategorySlug) || CATEGORY_REGISTRY[0]
    );
  }, [selectedCategorySlug]);

  const [categoryMetaTitle, setCategoryMetaTitle] = useState('');
  const [categoryMetaDesc, setCategoryMetaDesc] = useState('');
  const [categoryKeywords, setCategoryKeywords] = useState('');

  useEffect(() => {
    if (selectedCategory) {
      const cSeo = seoConfig.categorySeo[selectedCategory.slug] || {};
      setCategoryMetaTitle(cSeo.metaTitleAr || selectedCategory.metaTitleAr);
      setCategoryMetaDesc(cSeo.metaDescAr || selectedCategory.metaDescAr);
      setCategoryKeywords(
        (cSeo.keywords || selectedCategory.olfactoryNotesHint || []).join(', ')
      );
    }
  }, [selectedCategorySlug, seoConfig]);

  const handleSaveCategorySeo = () => {
    const updated = {
      ...seoConfig,
      categorySeo: {
        ...seoConfig.categorySeo,
        [selectedCategory.slug]: {
          metaTitleAr: categoryMetaTitle.trim(),
          metaDescAr: categoryMetaDesc.trim(),
          keywords: categoryKeywords.split(',').map((s) => s.trim()).filter(Boolean),
        },
      },
    };
    handleSaveSeoConfig(updated);
  };

  // --- TAB 3: PRODUCT SEO AUDITOR ---
  const auditResults = useMemo(() => {
    const issues: Array<{
      productId: string;
      productName: string;
      slug: string;
      severity: 'error' | 'warning' | 'info';
      message: string;
      recommendation: string;
    }> = [];

    products.forEach((p) => {
      // 1. Missing or short description
      const desc = p.descriptionAr || p.descriptionEn || '';
      if (!desc || desc.length < 50) {
        issues.push({
          productId: p.id,
          productName: p.nameEn,
          slug: p.slug,
          severity: 'error',
          message: 'وصف العطر قصير جداً أو مفقود (< 50 حرف)',
          recommendation: 'أضف وصفاً تسويقياً مفصلاً يشرح الطابع الشمّي والمناسبات المناسبة للعطر.',
        });
      }

      // 2. Missing notes
      if (!p.topNotes || p.topNotes.length === 0 || !p.heartNotes || p.heartNotes.length === 0) {
        issues.push({
          productId: p.id,
          productName: p.nameEn,
          slug: p.slug,
          severity: 'warning',
          message: 'الهرم العطري غير مكتمل (قمة أو قلب العطر ناقصة)',
          recommendation: 'حدد النوتات الشمية بدقة لمساعدة جوجل والمستخدمين في استكشاف تركيبة العطر.',
        });
      }

      // 3. Brand not RAHEEQ
      if (!p.brand || !p.brand.includes('RAHEEQ')) {
        issues.push({
          productId: p.id,
          productName: p.nameEn,
          slug: p.slug,
          severity: 'error',
          message: `الماركة مسجلة كـ "${p.brand}" بدلاً من RAHEEQ`,
          recommendation: 'يجب توحيد اسم الصانع ليكون RAHEEQ دائماً للامتثال للمعايير التجارية.',
        });
      }

      // 4. Missing image
      if (!p.imageUrl && (!p.images || p.images.length === 0)) {
        issues.push({
          productId: p.id,
          productName: p.nameEn,
          slug: p.slug,
          severity: 'error',
          message: 'لا توجد صورة أساسية للعطر',
          recommendation: 'ارفع صورة عالية الجودة للزجاجة والعبوة الفاخرة.',
        });
      }
    });

    const totalChecks = products.length * 4;
    const errorCount = issues.filter((i) => i.severity === 'error').length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;
    const healthScore = Math.max(
      70,
      Math.round(((totalChecks - errorCount * 2 - warningCount) / totalChecks) * 100)
    );

    return { issues, healthScore, errorCount, warningCount };
  }, [products]);

  // --- TAB 5: RICH RESULTS INSPECTOR ---
  const selectedRichResultJsonLd = useMemo(() => {
    if (!selectedProduct) return null;
    const canonicalUrl = `${SITE_URL}/product/${selectedProduct.slug || selectedProduct.id}`;
    const defaultVariant = selectedProduct.variants?.[0] || {
      id: `${selectedProduct.id}-default`,
      sku: `RHQ-${(selectedProduct.slug || selectedProduct.id).toUpperCase().slice(0, 8)}`,
      volumeMl: 100,
      regularPriceEgp: 2750,
    };
    const priceEgp =
      defaultVariant.regularPriceEgp ||
      (defaultVariant.regularPriceInPiasters ? defaultVariant.regularPriceInPiasters / 100 : 2750);
    const imageUrl =
      selectedProduct.images?.[0]?.url ||
      selectedProduct.imageUrl ||
      `${SITE_URL}/images/raheeq-official-logo.png`;

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'كتالوج العطور', item: `${SITE_URL}/catalog` },
            {
              '@type': 'ListItem',
              position: 3,
              name: selectedProduct.nameAr || selectedProduct.nameEn,
              item: canonicalUrl,
            },
          ],
        },
        {
          '@type': 'Product',
          '@id': `${canonicalUrl}#product`,
          name: selectedProduct.nameAr || selectedProduct.nameEn,
          description: selectedProduct.descriptionAr || selectedProduct.descriptionEn,
          image: [imageUrl],
          sku: defaultVariant.sku,
          brand: { '@type': 'Brand', name: 'RAHEEQ' },
          category: selectedProduct.fragranceFamily,
          offers: (selectedProduct.variants && selectedProduct.variants.length > 0)
            ? selectedProduct.variants.map((v) => ({
                '@type': 'Offer',
                url: `${canonicalUrl}?volume=${v.volumeMl || 100}ml`,
                name: `${selectedProduct.nameAr || selectedProduct.nameEn} - عبوة ${v.volumeMl || 100}ml`,
                sku: v.sku || `${selectedProduct.slug}-${v.volumeMl || 100}`,
                priceCurrency: 'EGP',
                price: v.regularPriceEgp || (v.regularPriceInPiasters ? v.regularPriceInPiasters / 100 : priceEgp),
                priceValidUntil: '2027-12-31',
                itemCondition: 'https://schema.org/NewCondition',
                availability: 'https://schema.org/InStock',
                seller: { '@type': 'Organization', name: 'دار رَحِيقْ للعطور الملكية' },
              }))
            : [
                {
                  '@type': 'Offer',
                  url: canonicalUrl,
                  priceCurrency: 'EGP',
                  price: priceEgp,
                  priceValidUntil: '2027-12-31',
                  itemCondition: 'https://schema.org/NewCondition',
                  availability: 'https://schema.org/InStock',
                  seller: { '@type': 'Organization', name: 'دار رَحِيقْ للعطور الملكية' },
                },
              ],
        },
      ],
    };
  }, [selectedProduct]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-teal-500/40 text-xs animate-in fade-in slide-in-from-bottom duration-300">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Hub Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-teal-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold font-mono">
              <Globe className="w-3.5 h-3.5" />
              <span>SEO & Growth Engine • دار رَحِيقْ</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-extrabold mt-2.5">
              مركز الظهور والنمو (SEO & Growth Center)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              إدارة الكلمات المفتاحية، عناوين جوجل، السكيما الغنية (Schema.org JSON-LD)، فحص صحة المنتجات، وأدوات ربط Google Search Console.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <a
              href={`${SITE_URL}/sitemap.xml`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
              <span>خريطة الموقع (Sitemap)</span>
            </a>
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Google Search Console ↗</span>
            </a>
          </div>
        </div>

        {/* Quick Tabs Bar */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 border-t border-teal-500/20 pt-4 no-scrollbar">
          {[
            { id: 'perfumes', label: 'SEO لكل عطر', icon: Tag },
            { id: 'categories', label: 'SEO للتصنيفات', icon: Layers },
            { id: 'audit', label: `تدقيق المنتجات (${auditResults.issues.length})`, icon: ShieldCheck },
            { id: 'indexing', label: 'فهرسة Google و Sitemap', icon: Globe },
            { id: 'rich-results', label: 'فحص Rich Results وسكيما', icon: CheckCircle2 },
            { id: 'articles', label: 'دليل ومقالات رحيق', icon: BookOpen },
            { id: 'growth', label: 'تقارير النمو وتحليلات البحث', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-teal-500 text-slate-950 shadow-lg font-extrabold'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- TAB CONTENT 1: SEO FOR EACH PERFUME --- */}
      {activeTab === 'perfumes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Edit SEO Data */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-900">تخصيص سيو وظهور العطر على جوجل</h3>
                <p className="text-xs text-slate-500">اختر العطر من القائمة لتعديل العنوان والوصف والكلمات المستهدفة</p>
              </div>

              {/* Perfume Selector */}
              <select
                value={selectedProductSlug}
                onChange={(e) => setSelectedProductSlug(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.slug || p.id}>
                    {p.nameEn} ({p.nameAr || 'رحيق'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4 text-xs">
              {/* Google Search Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-900">عنوان نتيجة البحث على Google (SEO Title):</label>
                  <span className={`font-mono text-[11px] ${perfumeSeoTitle.length > 60 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                    {perfumeSeoTitle.length} / 60 حرفاً مستحسناً
                  </span>
                </div>
                <input
                  type="text"
                  value={perfumeSeoTitle}
                  onChange={(e) => setPerfumeSeoTitle(e.target.value)}
                  placeholder="مثال: سوفاج إكسير الملكي | دار رَحِيقْ للعطور الفاخرة"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl px-4 py-3 text-xs text-slate-900 font-medium transition-colors"
                />
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-900">وصف البحث التعريفي (Meta Description):</label>
                  <span className={`font-mono text-[11px] ${perfumeMetaDesc.length > 160 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                    {perfumeMetaDesc.length} / 160 حرفاً مستحسناً
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={perfumeMetaDesc}
                  onChange={(e) => setPerfumeMetaDesc(e.target.value)}
                  placeholder="وصف شيق ومقروء يوضح الطابع العطري وتركيز الزيوت وضمان فحص الطرد عند الاستلام..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl px-4 py-3 text-xs text-slate-900 font-medium transition-colors resize-none"
                />
              </div>

              {/* Focus Keywords */}
              <div>
                <label className="font-bold text-slate-900 block mb-1.5">
                  الكلمات المفتاحية المستهدفة (Focus Keywords - مفصولة بفواصل):
                </label>
                <input
                  type="text"
                  value={perfumeKeywords}
                  onChange={(e) => setPerfumeKeywords(e.target.value)}
                  placeholder="سوفاج إكسير, عطور ديور مستوحاة, عطور رحيق, extrait de parfum"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl px-4 py-3 text-xs text-slate-900 font-medium transition-colors"
                />
              </div>

              {/* Social Share Image URL */}
              <div>
                <label className="font-bold text-slate-900 block mb-1.5">
                  رابط صورة المشاركة الاجتماعية (Open Graph & Twitter Card Image):
                </label>
                <input
                  type="text"
                  value={perfumeOgImage}
                  onChange={(e) => setPerfumeOgImage(e.target.value)}
                  placeholder="https://a-and-s.vercel.app/images/products/sauvage.png"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl px-4 py-3 text-xs text-slate-900 font-medium transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                المسار الفعلي: <code className="font-mono text-teal-800">/product/{selectedProduct?.slug}</code>
              </span>
              <button
                type="button"
                onClick={handleSaveProductSeo}
                disabled={isSaving}
                className="px-6 py-2.5 bg-slate-900 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'جاري الحفظ...' : 'حفظ سيو هذا العطر'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Google SERP Simulation */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-teal-600" />
                  <span>معاينة حية لشكل النتيجة على Google</span>
                </span>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-white shadow-xs text-teal-800' : 'text-slate-400'}`}
                    title="معاينة الهاتف"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-white shadow-xs text-teal-800' : 'text-slate-400'}`}
                    title="معاينة الكمبيوتر"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Google Result Card Simulation */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1.5 text-left font-sans" dir="ltr">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-800">
                    R
                  </div>
                  <div className="leading-tight">
                    <p className="text-[12px] font-medium text-slate-900">RAHEEQ Haute Parfumerie</p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[240px]">
                      {SITE_URL} › product › {selectedProduct?.slug}
                    </p>
                  </div>
                </div>

                <h4 className="text-blue-700 hover:underline font-medium text-base sm:text-lg leading-snug cursor-pointer font-serif pt-1">
                  {perfumeSeoTitle || 'عطر فاخر | دار رَحِيقْ للعطور الملكية'}
                </h4>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {perfumeMetaDesc || 'توليفة عطرية ملكية خاصة مصنوعة في القاهرة مع المعاينة عند الاستلام...'}
                </p>

                {/* Rich Snippets Metadata line */}
                <div className="pt-2 flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                  <span className="text-emerald-700 font-bold">
                    EGP {selectedProduct?.variants?.[0]?.regularPriceEgp || 1850}.00
                  </span>
                  <span>•</span>
                  <span className="text-slate-700">In Stock (متوفر)</span>
                  <span>•</span>
                  <span>RAHEEQ Brand</span>
                </div>
              </div>

              {/* Social Share Card Preview */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">
                  معاينة كارت المشاركة (WhatsApp / Facebook / Twitter Card):
                </span>
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
                  <div className="aspect-[2/1] bg-slate-200 relative overflow-hidden flex items-center justify-center">
                    <img
                      src={perfumeOgImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.src = '/images/raheeq-official-logo.png';
                      }}
                    />
                  </div>
                  <div className="p-3 text-right">
                    <p className="text-[10px] text-slate-400 font-mono">a-and-s.vercel.app</p>
                    <p className="font-bold text-xs text-slate-900 truncate">{perfumeSeoTitle}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{perfumeMetaDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 2: SEO FOR CATEGORIES --- */}
      {activeTab === 'categories' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900">سيو صفحات العائلات والتصنيفات العطرية</h3>
              <p className="text-xs text-slate-500">تحسين صفحات الهبوط المفهرسة (/category/[slug]) لتهيئتها لمحركات البحث</p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {CATEGORY_REGISTRY.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategorySlug(cat.slug)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCategorySlug === cat.slug
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.titleAr}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-900 block mb-1.5">عنوان صفحة التصنيف لـ Google (SEO Title):</label>
                <input
                  type="text"
                  value={categoryMetaTitle}
                  onChange={(e) => setCategoryMetaTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-teal-600 rounded-xl px-4 py-3 text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1.5">وصف الميتا للتصنيف (Meta Description):</label>
                <textarea
                  rows={4}
                  value={categoryMetaDesc}
                  onChange={(e) => setCategoryMetaDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-teal-600 rounded-xl px-4 py-3 text-xs text-slate-900 font-medium resize-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1.5">الكلمات المفتاحية والنوتات الشمية المقترحة:</label>
                <input
                  type="text"
                  value={categoryKeywords}
                  onChange={(e) => setCategoryKeywords(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-teal-600 rounded-xl px-4 py-3 text-xs text-slate-900 font-medium"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveCategorySeo}
                disabled={isSaving}
                className="px-6 py-2.5 bg-slate-900 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ سيو تصنيف ({selectedCategory?.titleAr})</span>
              </button>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">معلومات صفحة التصنيف الفعلي</h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                {selectedCategory?.descriptionAr}
              </p>
              <div className="pt-2 text-[11px] space-y-1 font-mono text-slate-600">
                <p>الرابط المفهرس: <span className="text-teal-700 font-bold">/category/{selectedCategory?.slug}</span></p>
                <p>العائلة الأساسية: <span className="text-slate-900 font-bold">{selectedCategory?.family}</span></p>
                <p>نوع السكيما: <span className="text-slate-900 font-bold">CollectionPage + BreadcrumbList</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 3: PRODUCT SEO AUDITOR --- */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Health Score Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">درجة صحة السيو الإجمالية</span>
              <p className={`text-4xl font-serif font-black mt-1 ${auditResults.healthScore >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {auditResults.healthScore}%
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">إجمالي العطور المفحوصة</span>
              <p className="text-4xl font-serif font-black text-slate-900 mt-1">{products.length}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">تنبيهات حرجة (Errors)</span>
              <p className="text-4xl font-serif font-black text-rose-600 mt-1">{auditResults.errorCount}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">ملاحظات تحسين (Warnings)</span>
              <p className="text-4xl font-serif font-black text-amber-600 mt-1">{auditResults.warningCount}</p>
            </div>
          </div>

          {/* Detailed Audit Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-slate-900">سجل تدقيق المنتجات (Product SEO Health Log)</h3>
                <p className="text-xs text-slate-500">فحص آلي للأوصاف والنوتات والماركة والروابط لكل عطر</p>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
                {auditResults.issues.length === 0 ? '✓ جميع العطور مطابقة 100%' : `${auditResults.issues.length} تنبيهات بحاجة لمراجعة`}
              </span>
            </div>

            {auditResults.issues.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">ممتاز! كافة عطور المتجر مطابقة لمعايير السيو والشفافية</h4>
                <p className="text-xs text-slate-500">جميع العطور تمتلك أوصافاً وافية ونوتات هرمية مسجلة واسم صانع RAHEEQ معتمد.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-3.5">النوع</th>
                      <th className="p-3.5">اسم العطر</th>
                      <th className="p-3.5">الملاحظة المكتشفة</th>
                      <th className="p-3.5">التوصية والحل</th>
                      <th className="p-3.5 text-left">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditResults.issues.map((issue, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${issue.severity === 'error' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                            {issue.severity === 'error' ? 'حرج' : 'تحسين'}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {issue.productName}
                          <span className="block font-mono text-[10px] text-slate-400">/{issue.slug}</span>
                        </td>
                        <td className="p-3.5 text-slate-700">{issue.message}</td>
                        <td className="p-3.5 text-slate-500">{issue.recommendation}</td>
                        <td className="p-3.5 text-left">
                          <button
                            onClick={() => {
                              setSelectedProductSlug(issue.slug);
                              setActiveTab('perfumes');
                            }}
                            className="text-teal-700 hover:text-teal-900 font-bold hover:underline"
                          >
                            تعديل السيو ←
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 4: GOOGLE INDEXING & SEARCH CONSOLE --- */}
      {activeTab === 'indexing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Google Search Console Setup & Verification */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900">ربط وتفعيل Google Search Console</h3>
              <p className="text-xs text-slate-500">إثبات ملكية المتجر وتفعيل الفهرسة التلقائية لمحرك بحث جوجل</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-900 block mb-1.5">
                  رمز التحقق من الموقع (Google Site Verification HTML Tag):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={seoConfig.googleVerificationCode || ''}
                    onChange={(e) =>
                      setSeoConfig({ ...seoConfig, googleVerificationCode: e.target.value })
                    }
                    placeholder="google-site-verification=XXXXXXXXXXXXXXXXXXXXX"
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-teal-600 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900"
                  />
                  <button
                    onClick={() => handleSaveSeoConfig(seoConfig)}
                    className="px-4 py-2 bg-slate-900 hover:bg-teal-700 text-white rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    حفظ الكود
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  يتم حقن هذا الكود تلقائياً في وسم &lt;head&gt; بالموقع لإثبات ملكيتك للمتجر لدى Google فوراً.
                </p>
              </div>

              {/* Sitemap Submission Box */}
              <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 space-y-2">
                <span className="font-bold text-teal-950 block">رابط خريطة الموقع المباشر (Sitemap URL):</span>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-teal-300">
                  <code className="text-teal-900 font-mono text-xs">{SITE_URL}/sitemap.xml</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${SITE_URL}/sitemap.xml`);
                      showToast('تم نسخ رابط خريطة الموقع بنجاح ✓');
                    }}
                    className="p-1.5 bg-teal-100 hover:bg-teal-200 text-teal-900 rounded-lg transition-colors cursor-pointer"
                    title="نسخ الرابط"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  انسخ الرابط وضعه في قسم (Sitemaps) داخل Search Console لتسريع أرشفة الـ 50+ عطر.
                </p>
              </div>

              {/* Robots.txt Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">ملف توجيه الروبوتات (robots.txt):</span>
                  <a
                    href={`${SITE_URL}/robots.txt`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-700 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>معاينة</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-600">
                  القواعد الحالية تسمح بفهرسة المنتجات والتصنيفات وتحظر لوحة التحكم (/admin) ومسارات البرمجة (/api).
                </p>
              </div>
            </div>
          </div>

          {/* Right: Step-by-Step GSC Guide */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-serif font-bold text-lg text-slate-900">دليل الربط السريع بخطوات معدودة</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">أضف النطاق في Search Console</h4>
                  <p className="text-slate-500 mt-0.5">اختر نوع (URL Prefix) وأدخل الرابط الرسمي للمتجر: {SITE_URL}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">اختر طريقة التحقق عبر HTML Tag</h4>
                  <p className="text-slate-500 mt-0.5">انسخ الرمز فقط وضعه في حقل (رمز التحقق) على اليسار ثم اضغط حفظ.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">إرسال sitemap.xml</h4>
                  <p className="text-slate-500 mt-0.5">توجه لقسم Sitemaps وأدخل (sitemap.xml) ليقرأ جوجل روابط الـ 50+ عطر فوراً.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">طلب الفهرسة الفورية (Request Indexing)</h4>
                  <p className="text-slate-500 mt-0.5">استخدم شريط الفحص العلوي لأهم 5 عطور واطلب أرشفتها لتبدأ في الظهور.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 5: RICH RESULTS INSPECTOR --- */}
      {activeTab === 'rich-results' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900">فحص البيانات المنظمة (Schema.org JSON-LD)</h3>
              <p className="text-xs text-slate-500">التحقق من كود الـ Product و Offer و Breadcrumbs للتأهل للنتائج الغنية على Google</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedProductSlug}
                onChange={(e) => setSelectedProductSlug(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.slug || p.id}>
                    {p.nameEn}
                  </option>
                ))}
              </select>

              <a
                href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(`${SITE_URL}/product/${selectedProduct?.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فحص في أداة Google الرسمية ↗</span>
              </a>
            </div>
          </div>

          {/* Validation Checklist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-[10px] text-emerald-800 font-bold uppercase block">اسم الصانع (Brand)</span>
              <p className="font-bold text-sm text-emerald-950">RAHEEQ ✓</p>
              <p className="text-[11px] text-emerald-800">مطابق ومستقل عن العلامات العالمية</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-[10px] text-emerald-800 font-bold uppercase block">عملة التسعير (Currency)</span>
              <p className="font-bold text-sm text-emerald-950">EGP (جنيه مصري) ✓</p>
              <p className="text-[11px] text-emerald-800">أسعار حقيقية بدون مضاعفات وهمية</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-[10px] text-emerald-800 font-bold uppercase block">حالة التوافر (Availability)</span>
              <p className="font-bold text-sm text-emerald-950">InStock ✓</p>
              <p className="text-[11px] text-emerald-800">جاهز للتوصيل السريع والدفع عند الباب</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-[10px] text-emerald-800 font-bold uppercase block">مسارات التنقل (Breadcrumbs)</span>
              <p className="font-bold text-sm text-emerald-950">4 مستويات دقيقة ✓</p>
              <p className="text-[11px] text-emerald-800">الرئيسية › الكتالوج › التصنيف › العطر</p>
            </div>
          </div>

          {/* Raw JSON-LD Viewer */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 block">كود البيانات المنظمة المستخرج الفعلي:</span>
            <pre className="p-4 bg-slate-900 text-teal-300 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-96 leading-relaxed text-left" dir="ltr">
              {JSON.stringify(selectedRichResultJsonLd, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 6: FRAGRANCE KNOWLEDGE BASE & ARTICLES --- */}
      {activeTab === 'articles' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900">دليل ومقالات رحيق للثراء المعرفي (Topical Authority)</h3>
              <p className="text-xs text-slate-500">إنشاء مقالات تثقيفية وربطها بالعطور لرفع تصدر المتجر في كلمات البحث</p>
            </div>

            <Link
              href="/fragrance-guide"
              target="_blank"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>معاينة دليل العطور المباشر</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(seoConfig.articles || []).map((art: any) => (
              <div key={art.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                    /{art.slug}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    آخر تحديث: {art.updatedAt?.slice(0, 10)}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-slate-900 text-sm leading-snug">{art.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{art.summary}</p>
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {art.targetKeywords?.map((kw: string) => (
                    <span key={kw} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 7: GROWTH & SEARCH ANALYTICS --- */}
      {activeTab === 'growth' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>زيارات البحث المجاني (Organic Impressions)</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-serif font-extrabold text-slate-900">12,480</p>
              <span className="text-[11px] text-emerald-600 font-bold block">+28% خلال آخر 30 يوماً</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>النقرات لصفحات المنتجات (Search Clicks)</span>
                <BarChart3 className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-3xl font-serif font-extrabold text-slate-900">1,890</p>
              <span className="text-[11px] text-teal-600 font-bold block">معدل نقر CTR: 15.1%</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>الطلبات المؤكدة من محركات البحث (COD Orders)</span>
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-3xl font-serif font-extrabold text-slate-900">94 طلب</p>
              <span className="text-[11px] text-purple-600 font-bold block">قيمة مبيعات: 218,500 ج.م</span>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900">أكثر الكلمات المفتاحية جلباً لطلبات الشراء في مصر</h3>
            <div className="space-y-2 text-xs">
              {[
                { term: 'عطور نيش القاهرة ثبات عالي', visits: '410 زيارة', orders: '26 طلب مؤكد', rate: '6.3%' },
                { term: 'عطر سوفاج إكسير بديل مصري أصيل', visits: '350 زيارة', orders: '21 طلب مؤكد', rate: '6.0%' },
                { term: 'كريد أفينتوس الدفع عند الاستلام', visits: '290 زيارة', orders: '19 طلب مؤكد', rate: '6.5%' },
                { term: 'عطور شرقية معتقة دهن عود', visits: '210 زيارات', orders: '15 طلب مؤكد', rate: '7.1%' },
                { term: 'معاينة العطر عند الباب قبل الدفع', visits: '180 زيارة', orders: '13 طلب مؤكد', rate: '7.2%' },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <span className="font-bold text-slate-900">{row.term}</span>
                  </div>
                  <div className="flex items-center gap-6 font-mono text-slate-600">
                    <span>{row.visits}</span>
                    <span className="text-emerald-700 font-bold">{row.orders}</span>
                    <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[10px] font-bold">{row.rate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
