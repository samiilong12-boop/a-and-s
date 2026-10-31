'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Save,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  Layers,
  Globe,
  Share2,
  Smartphone,
  Monitor,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Tag,
  Clock,
  Flame,
  Award,
  DollarSign,
  HelpCircle,
  FileCheck,
  X,
  RefreshCw,
  Scale,
} from 'lucide-react';
import { Product, ProductVariant, ProductImage } from '@/types';
import { useProducts } from '@/context/ProductContext';
import { FRAGRANCE_FAMILIES, CONCENTRATIONS, getDemoBottleSvg } from '@/lib/data/products';
import { formatPrice } from '@/lib/currency';
import { compressImageFile } from '@/lib/imageCompression';
import { ProductClientView } from '@/components/ProductClientView';

interface ProductStudioEditorProps {
  mode: 'create' | 'edit';
  initialProduct?: Product | null;
}

type StudioTab =
  | 'identity'
  | 'media'
  | 'fragrance'
  | 'variants'
  | 'presentation'
  | 'seo'
  | 'marketing'
  | 'publishing';

type PreviewMode = 'desktop' | 'mobile' | 'serp';

const SITE_URL = 'https://a-and-s.vercel.app';

export default function ProductStudioEditor({ mode, initialProduct }: ProductStudioEditorProps) {
  const router = useRouter();
  const { products, addProduct, editProduct, syncLocalToCloud } = useProducts();

  // Generate stable default values
  const defaultId = useMemo(
    () => initialProduct?.id || `raheeq-fragrance-${Date.now()}`,
    [initialProduct]
  );

  // Form State
  const [nameEn, setNameEn] = useState(initialProduct?.nameEn || '');
  const [nameAr, setNameAr] = useState(initialProduct?.nameAr || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [brand, setBrand] = useState(initialProduct?.brand || 'RAHEEQ');
  const [inspiredBy, setInspiredBy] = useState(initialProduct?.inspiredBy || '');
  const [inspirationNoteAr, setInspirationNoteAr] = useState(initialProduct?.inspirationNoteAr || '');
  const [disclaimerTitleAr, setDisclaimerTitleAr] = useState(initialProduct?.disclaimerTitleAr || '');
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(initialProduct?.showDisclaimer ?? true);
  const [gender, setGender] = useState<'MEN' | 'WOMEN' | 'UNISEX'>(initialProduct?.gender || 'UNISEX');
  const [fragranceFamily, setFragranceFamily] = useState(initialProduct?.fragranceFamily || FRAGRANCE_FAMILIES[0]);
  const [concentration, setConcentration] = useState(initialProduct?.concentration || 'EXTRAIT_DE_PARFUM');
  const [isPublished, setIsPublished] = useState<boolean>(initialProduct?.isPublished ?? true);
  const [isFeatured, setIsFeatured] = useState<boolean>(initialProduct?.isFeatured ?? false);
  const [isNewArrival, setIsNewArrival] = useState<boolean>(initialProduct?.isNewArrival ?? true);
  const [isBestseller, setIsBestseller] = useState<boolean>(initialProduct?.isBestseller ?? false);

  // Media
  const [imageUrl, setImageUrl] = useState(initialProduct?.images?.[0]?.url || initialProduct?.imageUrl || '');
  const [images, setImages] = useState<ProductImage[]>(
    initialProduct?.images && initialProduct.images.length > 0
      ? initialProduct.images
      : []
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Descriptions & Notes
  const [headlineEn, setHeadlineEn] = useState(
    initialProduct?.headlineEn || 'Exclusive bespoke formulation crafted by Raheeq.'
  );
  const [descriptionAr, setDescriptionAr] = useState(initialProduct?.descriptionAr || '');
  const [descriptionEn, setDescriptionEn] = useState(initialProduct?.descriptionEn || '');
  const [topNotes, setTopNotes] = useState<string[]>(initialProduct?.topNotes || ['Bergamot', 'Saffron']);
  const [heartNotes, setHeartNotes] = useState<string[]>(initialProduct?.heartNotes || ['Damask Rose', 'Oud']);
  const [baseNotes, setBaseNotes] = useState<string[]>(initialProduct?.baseNotes || ['Ambergris', 'Sandalwood', 'Vanilla']);
  const [newTopNote, setNewTopNote] = useState('');
  const [newHeartNote, setNewHeartNote] = useState('');
  const [newBaseNote, setNewBaseNote] = useState('');

  // Variants (Bottle Sizes, Prices & Stock)
  const defaultVariants: ProductVariant[] = useMemo(() => {
    if (initialProduct?.variants && initialProduct.variants.length > 0) {
      return initialProduct.variants.map((v) => ({
        ...v,
        regularPriceEgp: v.regularPriceEgp || (v.regularPriceInPiasters ? Math.round(v.regularPriceInPiasters / 100) : 1850),
        salePriceEgp: v.salePriceEgp || (v.salePriceInPiasters ? Math.round(v.salePriceInPiasters / 100) : null),
        costPriceEgp: v.costPriceEgp || (v.costPriceInPiasters ? Math.round(v.costPriceInPiasters / 100) : 650),
      }));
    }
    return [
      {
        id: `${defaultId}-var-50`,
        productId: defaultId,
        sku: `RHQ-50ML`,
        volumeMl: 50,
        titleEn: '50ml Extrait De Parfum',
        titleAr: '50 مل إكستري دو بارفان',
        regularPriceInPiasters: 185000,
        regularPriceEgp: 1850,
        salePriceInPiasters: null,
        salePriceEgp: null,
        costPriceInPiasters: 65000,
        costPriceEgp: 650,
        stockQuantity: 40,
        lowStockThreshold: 5,
        isActive: true,
      },
      {
        id: `${defaultId}-var-100`,
        productId: defaultId,
        sku: `RHQ-100ML`,
        volumeMl: 100,
        titleEn: '100ml Extrait De Parfum',
        titleAr: '100 مل إكستري دو بارفان',
        regularPriceInPiasters: 275000,
        regularPriceEgp: 2750,
        salePriceInPiasters: null,
        salePriceEgp: null,
        costPriceInPiasters: 95000,
        costPriceEgp: 950,
        stockQuantity: 50,
        lowStockThreshold: 5,
        isActive: true,
      },
    ];
  }, [initialProduct, defaultId]);

  const [variants, setVariants] = useState<ProductVariant[]>(defaultVariants);

  // SEO & Growth
  const [seoTitle, setSeoTitle] = useState(initialProduct?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialProduct?.seoDescription || '');
  const [seoKeywords, setSeoKeywords] = useState(
    Array.isArray(initialProduct?.seoKeywords)
      ? initialProduct.seoKeywords.join(', ')
      : initialProduct?.seoKeywords || ''
  );

  // Performance & Guarantee
  const [longevityAr, setLongevityAr] = useState(initialProduct?.longevityAr || '+14 ساعة');
  const [sillageAr, setSillageAr] = useState(initialProduct?.sillageAr || 'قوي وملحوظ');
  const [guaranteeTitleAr, setGuaranteeTitleAr] = useState(
    initialProduct?.guaranteeTitleAr || 'ضمان المعاينة الملكية عند باب بيتك'
  );
  const [guaranteeTextAr, setGuaranteeTextAr] = useState(
    initialProduct?.guaranteeTextAr ||
      'يحق لك فتح كرتونة الشحن والتأكد من مطابقة الزجاجة وسلامتها ورائحتها قبل دفع أي جنيه للمندوب. في حال عدم الرغبة في الاستلام، يلتزم العميل بسداد مصاريف الشحن والتوصيل للمندوب فقط.'
  );

  // UI Navigation & View State
  const [activeTab, setActiveTab] = useState<StudioTab>('identity');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);
  const [mobileViewTab, setMobileViewTab] = useState<'editor' | 'preview'>('editor');
  const [toastMessage, setToastMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-slug generation from English name if empty
  useEffect(() => {
    if (mode === 'create' && !slug && nameEn.trim()) {
      const generated = nameEn
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  }, [nameEn, slug, mode]);

  // Mark changes
  const markDirty = () => setHasUnsavedChanges(true);

  // Real-time live Product object used by Storefront preview
  const livePreviewProduct: Product = useMemo(() => {
    const finalImage = imageUrl.trim() || getDemoBottleSvg(nameEn || 'perfume', '#2DD4BF');
    const allImages: ProductImage[] =
      images.length > 0
        ? images
        : [
            {
              id: 'primary-preview-img',
              url: finalImage,
              altTextEn: nameEn,
              altTextAr: nameAr,
              isPrimary: true,
              sortOrder: 0,
            },
          ];

    const effectiveInspirationNoteAr = inspirationNoteAr.trim()
      ? inspirationNoteAr.trim()
      : (inspiredBy
          ? `عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمي لـ ${inspiredBy}، إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.`
          : undefined);

    return {
      id: defaultId,
      slug: slug || 'preview-slug',
      nameEn: nameEn || 'Raheeq Fragrance Creation',
      nameAr: nameAr || nameEn || 'إبداع عطري جديد من دار رحيق',
      brand: brand || 'RAHEEQ',
      inspiredBy: inspiredBy || undefined,
      inspirationNoteAr: effectiveInspirationNoteAr,
      disclaimerTitleAr: disclaimerTitleAr.trim() || undefined,
      showDisclaimer,
      longevityAr: longevityAr.trim() || undefined,
      sillageAr: sillageAr.trim() || undefined,
      guaranteeTitleAr: guaranteeTitleAr.trim() || undefined,
      guaranteeTextAr: guaranteeTextAr.trim() || undefined,
      gender,
      headlineEn,
      descriptionAr: descriptionAr || 'توليفة عطرية ملكية خاصة مصنوعة في معامل دار رَحِيقْ بزيوت فرنسية نقية.',
      descriptionEn: descriptionEn || 'Artisanal high-concentration perfume crafted with pure natural absolutes by RAHEEQ Haute Parfumerie.',
      concentration: concentration as any,
      fragranceFamily,
      topNotes: topNotes.length > 0 ? topNotes : ['Bergamot', 'Saffron'],
      heartNotes: heartNotes.length > 0 ? heartNotes : ['Damask Rose', 'Oud'],
      baseNotes: baseNotes.length > 0 ? baseNotes : ['Ambergris', 'Sandalwood'],
      categoryId: fragranceFamily.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryName: fragranceFamily,
      collectionIds: ['signature-collection'],
      isFeatured,
      isNewArrival,
      isBestseller,
      isPublished,
      images: allImages,
      imageUrl: finalImage,
      variants: variants.length > 0 ? variants : defaultVariants,
      seoTitle,
      seoDescription,
      seoKeywords,
      createdAt: initialProduct?.createdAt || new Date().toISOString(),
    };
  }, [
    defaultId,
    slug,
    nameEn,
    nameAr,
    brand,
    inspiredBy,
    inspirationNoteAr,
    disclaimerTitleAr,
    showDisclaimer,
    gender,
    headlineEn,
    descriptionAr,
    descriptionEn,
    concentration,
    fragranceFamily,
    topNotes,
    heartNotes,
    baseNotes,
    isFeatured,
    isNewArrival,
    isBestseller,
    isPublished,
    images,
    imageUrl,
    variants,
    defaultVariants,
    seoTitle,
    seoDescription,
    seoKeywords,
    initialProduct,
  ]);

  // Preview related products
  const previewRelated = useMemo(() => {
    return products
      .filter((p) => p.id !== defaultId && p.fragranceFamily === fragranceFamily)
      .slice(0, 4);
  }, [products, defaultId, fragranceFamily]);

  // Publication checklist evaluation
  const checklist = useMemo(() => {
    const hasName = Boolean(nameEn.trim() && nameAr.trim());
    const hasImage = Boolean(imageUrl.trim() || images.length > 0);
    const hasNotes = topNotes.length > 0 && heartNotes.length > 0 && baseNotes.length > 0;
    const hasDescriptions = Boolean(descriptionAr.trim() && descriptionEn.trim());
    const hasVariants = variants.length > 0;
    const hasValidPrices = variants.every((v) => (v.regularPriceEgp || 0) > 0);
    const hasValidStock = variants.every((v) => (v.stockQuantity ?? 0) >= 0);
    const hasSeo = Boolean(seoTitle.trim() && seoDescription.trim());

    const blockers: string[] = [];
    if (!hasName) blockers.push('اسم العطر بالعربية والإنجليزية إلزامي.');
    if (!hasImage) blockers.push('يرجى رفع أو تعيين صورة العطر الرئيسية.');
    if (!hasVariants) blockers.push('يجب إضافة حجم زجاجة واحد على الأقل.');
    if (!hasValidPrices) blockers.push('تأكد من تحديد سعر بيع صالح لجميع الأحجام.');

    const isReadyToPublish = blockers.length === 0;

    return {
      hasName,
      hasImage,
      hasNotes,
      hasDescriptions,
      hasVariants,
      hasValidPrices,
      hasValidStock,
      hasSeo,
      blockers,
      isReadyToPublish,
    };
  }, [
    nameEn,
    nameAr,
    imageUrl,
    images,
    topNotes,
    heartNotes,
    baseNotes,
    descriptionAr,
    descriptionEn,
    variants,
    seoTitle,
    seoDescription,
  ]);

  // Auto-generate SEO tags with 1-click
  const handleAutoGenerateSeo = () => {
    const mainName = nameAr.trim() || nameEn.trim() || 'عطر فاخر';
    const inspirationNotice = inspiredBy ? `مستوحى من طابع ${inspiredBy}` : 'توليفة نيش ملكية مستقلة';
    const newTitle = `عطر ${mainName} | ${inspirationNotice} | دار رَحِيقْ`;
    const newDesc = `اكتشف عطر ${mainName} الفاخر من دار رَحِيقْ بتركيز إكستري دو بارفان نيش يدوم طويلاً، مع ضمان المعاينة قبل الدفع عند الاستلام بجميع أنحاء مصر.`;
    const newKeywords = `عطر ${mainName}, ${nameEn}, عطور رحيق, ${inspiredBy ? `بديل ${inspiredBy}, ` : ''}عطور نيش مصر, شراء عطور أونلاين`;

    setSeoTitle(newTitle);
    setSeoDescription(newDesc);
    setSeoKeywords(newKeywords);
    markDirty();
    setToastMessage('تم توليد بيانات محركات البحث وجوجل تلقائياً بنجاح ⚡');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const compressed = await compressImageFile(file);
      setImageUrl(compressed);
      setImages((prev) => [
        {
          id: `img-${Date.now()}`,
          url: compressed,
          altTextEn: nameEn || 'RAHEEQ Bottle',
          altTextAr: nameAr || 'زجاجة عطر دار رحيق',
          isPrimary: true,
          sortOrder: 0,
        },
        ...prev.filter((img) => img.isPrimary !== true),
      ]);
      markDirty();
      setToastMessage('تم رفع الصورة وضغطها بنجاح ✓');
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const res = event.target.result as string;
          setImageUrl(res);
          setImages((prev) => [
            {
              id: `img-${Date.now()}`,
              url: res,
              altTextEn: nameEn || 'RAHEEQ Bottle',
              altTextAr: nameAr || 'زجاجة عطر دار رحيق',
              isPrimary: true,
              sortOrder: 0,
            },
            ...prev,
          ]);
          markDirty();
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  // Add / Duplicate / Remove variant
  const handleAddVariant = (size: number) => {
    const newSku = `RHQ-${(slug || 'PERFUME').toUpperCase().slice(0, 6)}-${size}ML`;
    const newVar: ProductVariant = {
      id: `${defaultId}-var-${size}-${Date.now().toString().slice(-4)}`,
      productId: defaultId,
      sku: newSku,
      volumeMl: size,
      titleEn: `${size}ml Extrait De Parfum`,
      titleAr: `${size} مل إكستري دو بارفان`,
      regularPriceInPiasters: size === 30 ? 125000 : size === 50 ? 185000 : 275000,
      regularPriceEgp: size === 30 ? 1250 : size === 50 ? 1850 : 2750,
      costPriceEgp: size === 30 ? 450 : size === 50 ? 650 : 950,
      stockQuantity: 30,
      lowStockThreshold: 5,
      isActive: true,
    };
    setVariants((prev) => [...prev, newVar]);
    markDirty();
  };

  const handleDuplicateVariant = (v: ProductVariant) => {
    const dup: ProductVariant = {
      ...v,
      id: `${defaultId}-var-dup-${Date.now().toString().slice(-4)}`,
      sku: `${v.sku}-COPY`,
    };
    setVariants((prev) => [...prev, dup]);
    markDirty();
  };

  const handleRemoveVariant = (variantId: string) => {
    if (variants.length <= 1) {
      alert('يجب الإبقاء على حجم زجاجة واحد على الأقل للعطر.');
      return;
    }
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
    markDirty();
  };

  const handleUpdateVariantField = (id: string, field: keyof ProductVariant, value: any) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const updated = { ...v, [field]: value };
          if (field === 'regularPriceEgp') {
            updated.regularPriceInPiasters = Math.round(Number(value) * 100);
          }
          if (field === 'salePriceEgp') {
            updated.salePriceInPiasters = value ? Math.round(Number(value) * 100) : null;
          }
          if (field === 'costPriceEgp') {
            updated.costPriceInPiasters = value ? Math.round(Number(value) * 100) : undefined;
          }
          return updated;
        }
        return v;
      })
    );
    markDirty();
  };

  // Save / Publish execution
  const handleSaveProduct = async (shouldPublish: boolean) => {
    if (!nameEn.trim()) {
      alert('يرجى كتابة اسم العطر بالإنجليزية (Name En) أولاً.');
      setActiveTab('identity');
      return;
    }

    if (shouldPublish && !checklist.isReadyToPublish) {
      alert(`تعذر النشر لوجود نواقص إلزامية:\n- ${checklist.blockers.join('\n- ')}`);
      setActiveTab('publishing');
      return;
    }

    setIsSaving(true);
    setToastMessage(shouldPublish ? 'جاري نشر العطر في متجر دار رحيق ومحركات البحث...' : 'جاري حفظ المسودة...');

    const finalImage = imageUrl.trim() || getDemoBottleSvg(nameEn, '#2DD4BF');

    const v50 = variants.find((v) => v.volumeMl === 50) || variants[0];
    const v100 = variants.find((v) => v.volumeMl === 100) || variants[1] || variants[0];

    try {
      if (mode === 'create') {
        const created = await addProduct({
          nameEn: nameEn.trim(),
          nameAr: nameAr.trim() || nameEn.trim(),
          brand: brand.trim() || 'RAHEEQ',
          inspiredBy: inspiredBy.trim() || undefined,
          inspirationNoteAr: inspirationNoteAr.trim() || undefined,
          disclaimerTitleAr: disclaimerTitleAr.trim() || undefined,
          showDisclaimer,
          longevityAr: longevityAr.trim() || undefined,
          sillageAr: sillageAr.trim() || undefined,
          guaranteeTitleAr: guaranteeTitleAr.trim() || undefined,
          guaranteeTextAr: guaranteeTextAr.trim() || undefined,
          gender,
          fragranceFamily,
          concentration,
          descriptionEn: descriptionEn.trim(),
          descriptionAr: descriptionAr.trim(),
          variants,
          regularPrice50Egp: v50?.regularPriceEgp || 1850,
          salePrice50Egp: v50?.salePriceEgp ? Number(v50.salePriceEgp) : undefined,
          stock50: v50?.stockQuantity || 30,
          regularPrice100Egp: v100?.regularPriceEgp || 2750,
          salePrice100Egp: v100?.salePriceEgp ? Number(v100.salePriceEgp) : undefined,
          stock100: v100?.stockQuantity || 25,
          costPriceEgp: v100?.costPriceEgp || 850,
          topNotes,
          heartNotes,
          baseNotes,
          imageUrl: finalImage,
          seoTitle: seoTitle.trim() || undefined,
          seoDescription: seoDescription.trim() || undefined,
          seoKeywords: seoKeywords.trim() || undefined,
        });

        // If saved as draft, set publication status
        if (!shouldPublish && created) {
          await editProduct(created.id, { isPublished: false });
        }

        setHasUnsavedChanges(false);
        setToastMessage(
          shouldPublish
            ? `تم نشر العطر بنجاح في المتجر ومحركات البحث: ${created.nameEn} ✓`
            : `تم حفظ مسودة العطر بنجاح: ${created.nameEn} ✓`
        );
        setTimeout(() => {
          router.push(`/admin/products/${created.id}/edit`);
        }, 1200);
      } else if (initialProduct) {
        await editProduct(initialProduct.id, {
          nameEn: nameEn.trim(),
          nameAr: nameAr.trim() || nameEn.trim(),
          brand: brand.trim() || 'RAHEEQ',
          inspiredBy: inspiredBy.trim() || undefined,
          inspirationNoteAr: inspirationNoteAr.trim() || undefined,
          disclaimerTitleAr: disclaimerTitleAr.trim() || undefined,
          showDisclaimer,
          longevityAr: longevityAr.trim() || undefined,
          sillageAr: sillageAr.trim() || undefined,
          guaranteeTitleAr: guaranteeTitleAr.trim() || undefined,
          guaranteeTextAr: guaranteeTextAr.trim() || undefined,
          gender,
          fragranceFamily,
          concentration,
          descriptionEn: descriptionEn.trim(),
          descriptionAr: descriptionAr.trim(),
          variants,
          regularPrice50Egp: v50?.regularPriceEgp || 1850,
          salePrice50Egp: v50?.salePriceEgp ? Number(v50.salePriceEgp) : undefined,
          stock50: v50?.stockQuantity,
          regularPrice100Egp: v100?.regularPriceEgp || 2750,
          salePrice100Egp: v100?.salePriceEgp ? Number(v100.salePriceEgp) : undefined,
          stock100: v100?.stockQuantity,
          costPriceEgp: v100?.costPriceEgp || 850,
          topNotes,
          heartNotes,
          baseNotes,
          imageUrl: finalImage,
          seoTitle: seoTitle.trim() || undefined,
          seoDescription: seoDescription.trim() || undefined,
          seoKeywords: seoKeywords.trim() || undefined,
        });

        setIsPublished(shouldPublish);
        await editProduct(initialProduct.id, { isPublished: shouldPublish });

        setHasUnsavedChanges(false);
        setToastMessage(
          shouldPublish
            ? `تم تحديث ونشر العطر بنجاح: ${nameEn} ✓`
            : `تم تحديث مسودة العطر بنجاح: ${nameEn} ✓`
        );
      }

      // Sync to cloud store
      syncLocalToCloud().catch(() => {});
    } catch (err: any) {
      alert(`حدث خطأ أثناء حفظ العطر: ${err.message || 'خطأ غير معروف'}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMessage(''), 4500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E0E] text-slate-100 flex flex-col font-sans -m-6 sm:-m-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900/95 border border-teal-500 text-teal-300 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Sticky Command Bar */}
      <header className="sticky top-0 z-40 bg-[#0F1414]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors border border-white/10"
            title="العودة لقائمة العطور"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-teal-400">
                {mode === 'create' ? 'New Fragrance Studio' : 'Edit Fragrance Studio'}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isPublished
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}
              >
                {isPublished ? '● منشور للجمهور' : '○ مسودة داخلية'}
              </span>
              {hasUnsavedChanges && (
                <span className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full animate-pulse">
                  تغييرات غير محفوظة
                </span>
              )}
            </div>
            <h1 className="font-serif text-base sm:text-lg font-bold text-white truncate max-w-sm sm:max-w-md">
              {nameAr || nameEn || (mode === 'create' ? 'إنشاء عطر ملكي جديد' : 'تعديل العطر')}
            </h1>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setMobileViewTab('editor')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                mobileViewTab === 'editor' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400'
              }`}
            >
              التحرير
            </button>
            <button
              onClick={() => setMobileViewTab('preview')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                mobileViewTab === 'preview' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400'
              }`}
            >
              المعاينة الحية
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleSaveProduct(false)}
            disabled={isSaving}
            className="hidden sm:inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 px-3.5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-slate-400" />
            <span>حفظ كمسودة</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveProduct(true)}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 px-4 sm:px-5 py-2 rounded-xl text-xs font-extrabold shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>{isPublished ? 'تحديث ونشر العطر' : 'نشر العطر للجمهور'}</span>
          </button>
        </div>
      </header>

      {/* Main Studio Grid: Split Screen Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT PANEL: 8 Tabs Product Editor */}
        <div
          className={`${
            mobileViewTab === 'editor' ? 'block' : 'hidden lg:block'
          } ${
            isPreviewCollapsed ? 'lg:col-span-12' : 'lg:col-span-7 xl:col-span-6'
          } border-b lg:border-b-0 lg:border-l border-white/10 overflow-y-auto max-h-[calc(100vh-65px)] p-4 sm:p-8 space-y-6 transition-all duration-300`}
        >
          {/* Tab Navigation Pill Bar */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-white/10 text-xs">
            {[
              { id: 'identity', label: '1. الهوية الأساسية' },
              { id: 'media', label: '2. الصور والوسائط' },
              { id: 'fragrance', label: '3. الهرم العطري' },
              { id: 'variants', label: '4. الأحجام والأسعار' },
              { id: 'presentation', label: '5. واجهة العرض' },
              { id: 'seo', label: '6. محركات البحث (SEO)' },
              { id: 'marketing', label: '7. التسويق' },
              { id: 'publishing', label: '8. النشر والتدقيق' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as StudioTab)}
                className={`px-3.5 py-2 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB A: BASIC IDENTITY */}
          {activeTab === 'identity' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-white/10 pb-3">
                <h2 className="font-serif text-lg font-bold text-white">الهوية الأساسية للعطر</h2>
                <p className="text-xs text-slate-400">
                  تحديد اسم العطر باللغتين، الهوية المستقلة لدار رحيق، والعطر المستوحى منه للشفافية القانونية.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    اسم العطر بالعربية (Name Ar) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nameAr}
                    onChange={(e) => {
                      setNameAr(e.target.value);
                      markDirty();
                    }}
                    placeholder="مثال: رحيق سوفاج إكسير"
                    className="w-full bg-[#141A1A] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    اسم العطر بالإنجليزية (Name En) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => {
                      setNameEn(e.target.value);
                      markDirty();
                    }}
                    placeholder="e.g. Raheeq Sauvage Elixir"
                    className="w-full bg-[#141A1A] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 font-bold font-mono"
                  />
                </div>
              </div>

              {/* Inspiration Disclosure & Brand */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span>التحكم في صندوق إيضاح الطابع العطري وإخلاء المسؤولية (Disclaimer Box)</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer bg-[#121616] px-3 py-1.5 rounded-xl border border-amber-500/30">
                    <input
                      type="checkbox"
                      checked={showDisclaimer}
                      onChange={(e) => {
                        setShowDisclaimer(e.target.checked);
                        markDirty();
                      }}
                      className="accent-amber-500 rounded"
                    />
                    <span className="text-[11px] font-bold text-amber-300">
                      {showDisclaimer ? 'صندوق الإخلاء مفعّل' : 'صندوق الإخلاء مخفي'}
                    </span>
                  </label>
                </div>

                {showDisclaimer && (
                  <div className="space-y-3 pt-1 border-t border-amber-500/15">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-amber-300 block">
                        العطر العالمي المرجعي المستوحى منه (Inspired By Reference)
                      </label>
                      <input
                        type="text"
                        value={inspiredBy}
                        onChange={(e) => {
                          const val = e.target.value;
                          setInspiredBy(val);
                          markDirty();
                        }}
                        placeholder="مثال: Jean Paul Gaultier Le Male Le Parfum أو Dior Sauvage Elixir"
                        className="w-full bg-[#121616] border border-amber-500/30 rounded-xl px-3.5 py-2 text-xs text-amber-200 focus:outline-none focus:border-amber-400 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-amber-300 block">
                        عنوان الصندوق في صفحة العطر (Disclaimer Title)
                      </label>
                      <input
                        type="text"
                        value={disclaimerTitleAr}
                        onChange={(e) => {
                          setDisclaimerTitleAr(e.target.value);
                          markDirty();
                        }}
                        placeholder="افتراضي: إيضاح الطابع العطري وإخلاء المسؤولية:"
                        className="w-full bg-[#121616] border border-amber-500/30 rounded-xl px-3.5 py-2 text-xs text-amber-200 focus:outline-none focus:border-amber-400 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-amber-300 block">
                          النص المكتوب داخل الصندوق لكل عطر (Custom Disclaimer Text)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const refName = inspiredBy.trim() || 'العطر العالمي';
                            const generated = `عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمي لـ ${refName}، إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.`;
                            setInspirationNoteAr(generated);
                            markDirty();
                          }}
                          className="text-[10px] text-amber-400 hover:text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 px-2 py-0.5 rounded-lg border border-amber-500/30 transition-colors font-bold cursor-pointer"
                        >
                          توليد الصيغة التلقائية ⚡
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={inspirationNoteAr}
                        onChange={(e) => {
                          setInspirationNoteAr(e.target.value);
                          markDirty();
                        }}
                        placeholder="اكتب هنا النص المخصص الذي تريده أن يظهر بدقة في الصندوق الأصفر فوق السعر أمام العميل..."
                        className="w-full bg-[#121616] border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 focus:outline-none focus:border-amber-400 font-medium leading-relaxed"
                      />
                      <p className="text-[10px] text-amber-400/80 leading-relaxed">
                        💡 يمكنك التحكم في كل كلمة هنا بحرية تامة؛ سيظهر هذا النص تماماً داخل الصندوق الأصفر التوضيحي بالمتجر كما طلبت، ويمكنك معاينته مباشرة في شاشة المعاينة الحية باليسار.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">الفئة المستهدفة (Gender)</label>
                  <select
                    value={gender}
                    onChange={(e) => {
                      setGender(e.target.value as any);
                      markDirty();
                    }}
                    className="w-full bg-[#141A1A] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="UNISEX">للجنسين (Unisex)</option>
                    <option value="MEN">رجالي (Men)</option>
                    <option value="WOMEN">نسائي (Women)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">العائلة العطرية (Family)</label>
                  <select
                    value={fragranceFamily}
                    onChange={(e) => {
                      setFragranceFamily(e.target.value);
                      markDirty();
                    }}
                    className="w-full bg-[#141A1A] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    {FRAGRANCE_FAMILIES.map((fam) => (
                      <option key={fam} value={fam}>
                        {fam}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">رابط العطر (Slug)</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\-]+/g, '-'));
                      markDirty();
                    }}
                    className="w-full bg-[#141A1A] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB B: MEDIA LIBRARY */}
          {activeTab === 'media' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-white/10 pb-3">
                <h2 className="font-serif text-lg font-bold text-white">مكتبة صور العطر</h2>
                <p className="text-xs text-slate-400">
                  رفع الصورة الرئيسية وصور المعرض بجودة عالية مع ضغط تلقائي وحماية من تطابق الصور الخاطئة.
                </p>
              </div>

              {/* Main Image Uploader */}
              <div className="p-4 bg-[#141A1A] border border-white/10 rounded-2xl space-y-4">
                <label className="text-xs font-bold text-slate-200 block">
                  الصورة الرئيسية للعطر (Primary Flacon Visual)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-28 bg-black/50 border border-white/20 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                    <img
                      src={imageUrl || getDemoBottleSvg(nameEn || 'perfume')}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-teal-400 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        markDirty();
                      }}
                      placeholder="رابط الصورة أو اضغط على زر الرفع..."
                      className="w-full bg-[#0E1212] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                    />
                    <label className="inline-flex items-center gap-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صورة من جهازك مباشرة</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB C: FRAGRANCE SPECIFICATIONS */}
          {activeTab === 'fragrance' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-white/10 pb-3">
                <h2 className="font-serif text-lg font-bold text-white">الهرم العطري والتفاصيل الشمية</h2>
                <p className="text-xs text-slate-400">
                  تحديد تركيز الإكستري دو بارفان، وتوليفات القمة والقلب والقاعدة، ووصف الأثر العطري.
                </p>
              </div>

              {/* Concentration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">تركيز العطر (Concentration)</label>
                  <select
                    value={concentration}
                    onChange={(e) => {
                      setConcentration(e.target.value as any);
                      markDirty();
                    }}
                    className="w-full bg-[#141A1A] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-teal-300 font-bold focus:outline-none focus:border-teal-500"
                  >
                    {CONCENTRATIONS.map((c) => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">العنوان الترويجي (Headline)</label>
                  <input
                    type="text"
                    value={headlineEn}
                    onChange={(e) => {
                      setHeadlineEn(e.target.value);
                      markDirty();
                    }}
                    className="w-full bg-[#141A1A] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Olfactory Pyramid Tags */}
              <div className="p-4 bg-[#141A1A] border border-white/10 rounded-2xl space-y-4">
                <h3 className="font-serif text-sm font-bold text-teal-400">الهرم العطري والنوتات (Olfactory Pyramid)</h3>

                {/* Top Notes */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-300 block">Top Notes (قمة العطر - الافتتاحية)</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {topNotes.map((note, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full text-xs font-medium"
                      >
                        {note}
                        <button
                          type="button"
                          onClick={() => {
                            setTopNotes(topNotes.filter((_, i) => i !== idx));
                            markDirty();
                          }}
                          className="hover:text-rose-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTopNote}
                      onChange={(e) => setNewTopNote(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newTopNote.trim()) {
                          e.preventDefault();
                          setTopNotes([...topNotes, newTopNote.trim()]);
                          setNewTopNote('');
                          markDirty();
                        }
                      }}
                      placeholder="أضف نوتة (مثال: Bergamot) واضغط Enter..."
                      className="flex-1 bg-[#0E1212] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newTopNote.trim()) {
                          setTopNotes([...topNotes, newTopNote.trim()]);
                          setNewTopNote('');
                          markDirty();
                        }
                      }}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-xl"
                    >
                      إضافة
                    </button>
                  </div>
                </div>

                {/* Heart Notes */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-300 block">Heart Notes (قلب العطر)</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {heartNotes.map((note, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-medium"
                      >
                        {note}
                        <button
                          type="button"
                          onClick={() => {
                            setHeartNotes(heartNotes.filter((_, i) => i !== idx));
                            markDirty();
                          }}
                          className="hover:text-rose-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newHeartNote}
                      onChange={(e) => setNewHeartNote(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newHeartNote.trim()) {
                          e.preventDefault();
                          setHeartNotes([...heartNotes, newHeartNote.trim()]);
                          setNewHeartNote('');
                          markDirty();
                        }
                      }}
                      placeholder="أضف نوتة (مثال: Damask Rose) واضغط Enter..."
                      className="flex-1 bg-[#0E1212] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newHeartNote.trim()) {
                          setHeartNotes([...heartNotes, newHeartNote.trim()]);
                          setNewHeartNote('');
                          markDirty();
                        }
                      }}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-xl"
                    >
                      إضافة
                    </button>
                  </div>
                </div>

                {/* Base Notes */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-300 block">Base Notes (قاعدة العطر والثبات)</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {baseNotes.map((note, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full text-xs font-medium"
                      >
                        {note}
                        <button
                          type="button"
                          onClick={() => {
                            setBaseNotes(baseNotes.filter((_, i) => i !== idx));
                            markDirty();
                          }}
                          className="hover:text-rose-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBaseNote}
                      onChange={(e) => setNewBaseNote(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newBaseNote.trim()) {
                          e.preventDefault();
                          setBaseNotes([...baseNotes, newBaseNote.trim()]);
                          setNewBaseNote('');
                          markDirty();
                        }
                      }}
                      placeholder="أضف نوتة (مثال: Ambergris) واضغط Enter..."
                      className="flex-1 bg-[#0E1212] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newBaseNote.trim()) {
                          setBaseNotes([...baseNotes, newBaseNote.trim()]);
                          setNewBaseNote('');
                          markDirty();
                        }
                      }}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-xl"
                    >
                      إضافة
                    </button>
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    الوصف العربي للعطر (Arabic Description)
                  </label>
                  <textarea
                    rows={3}
                    value={descriptionAr}
                    onChange={(e) => {
                      setDescriptionAr(e.target.value);
                      markDirty();
                    }}
                    placeholder="اكتب وصفاً شاعرياً ودقيقاً يصف طابع العطر وأناقته وثباته..."
                    className="w-full bg-[#141A1A] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-teal-500 leading-relaxed"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    الوصف الإنجليزي للعطر (English Description)
                  </label>
                  <textarea
                    rows={2}
                    value={descriptionEn}
                    onChange={(e) => {
                      setDescriptionEn(e.target.value);
                      markDirty();
                    }}
                    placeholder="Artisanal composition crafted with natural oils..."
                    className="w-full bg-[#141A1A] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-teal-500 leading-relaxed font-sans"
                  />
                </div>
              </div>

              {/* Performance Metrics: Longevity & Sillage & Inspection Guarantee */}
              <div className="p-4 bg-[#141A1A] border border-white/10 rounded-2xl space-y-4">
                <div className="border-b border-white/10 pb-2">
                  <h3 className="font-serif text-sm font-bold text-teal-400">
                    الأداء العطري وضمان المعاينة المعروضة في المتجر (Performance & Guarantee)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    تحكم بالكلمات التي تظهر داخل مربعات الأداء (الثبات والفوحان) وفي بطاقة ضمان المعاينة عند باب البيت.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Longevity */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200 block">
                      مدة الثبات المعروضة للجمهور (Longevity)
                    </label>
                    <input
                      type="text"
                      value={longevityAr}
                      onChange={(e) => {
                        setLongevityAr(e.target.value);
                        markDirty();
                      }}
                      placeholder="مثال: +14 ساعة أو يدوم طوال اليوم"
                      className="w-full bg-[#0E1212] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 font-semibold"
                    />
                    <div className="flex gap-1.5 flex-wrap pt-1">
                      {['+12 ساعة', '+14 ساعة', '+16 ساعة', '+24 ساعة', 'يدوم يومين'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setLongevityAr(preset);
                            markDirty();
                          }}
                          className="text-[10px] bg-white/5 hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 px-2 py-0.5 rounded border border-white/10 transition-colors"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sillage */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200 block">
                      قوة الفوحان المعروضة للجمهور (Sillage)
                    </label>
                    <input
                      type="text"
                      value={sillageAr}
                      onChange={(e) => {
                        setSillageAr(e.target.value);
                        markDirty();
                      }}
                      placeholder="مثال: قوي وملحوظ أو فوحان ملكي ينتشر في المكان"
                      className="w-full bg-[#0E1212] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 font-semibold"
                    />
                    <div className="flex gap-1.5 flex-wrap pt-1">
                      {['قوي وملحوظ', 'فواح جداً', 'فوحان ملكي أسطوري', 'هادئ وأنيق'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setSillageAr(preset);
                            markDirty();
                          }}
                          className="text-[10px] bg-white/5 hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 px-2 py-0.5 rounded border border-white/10 transition-colors"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Doorstep Inspection Guarantee Card */}
                <div className="pt-2 border-t border-white/10 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-200 block mb-1">
                      عنوان بطاقة المعاينة عند باب البيت
                    </label>
                    <input
                      type="text"
                      value={guaranteeTitleAr}
                      onChange={(e) => {
                        setGuaranteeTitleAr(e.target.value);
                        markDirty();
                      }}
                      placeholder="ضمان المعاينة الملكية عند باب بيتك"
                      className="w-full bg-[#0E1212] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-teal-300 focus:outline-none focus:border-teal-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-200 block mb-1">
                      نص سياسة المعاينة قبل الدفع لكل عطر
                    </label>
                    <textarea
                      rows={2}
                      value={guaranteeTextAr}
                      onChange={(e) => {
                        setGuaranteeTextAr(e.target.value);
                        markDirty();
                      }}
                      placeholder="يحق لك فتح كرتونة الشحن والتأكد من مطابقة الزجاجة وسلامتها ورائحتها قبل دفع أي جنيه للمندوب..."
                      className="w-full bg-[#0E1212] border border-white/15 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-teal-500 leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB D: PRODUCT VARIANTS & SIZES */}
          {activeTab === 'variants' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <h2 className="font-serif text-lg font-bold text-white">الأحجام والأسعار والمخزون</h2>
                  <p className="text-xs text-slate-400">
                    إدارة مستقلة لكل حجم (50 مل، 100 مل، وغيرها) مع كود SKU وسعر البيع والتكلفة السرية وحساب صافي الأرباح.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddVariant(30)}
                    className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-[11px] font-bold rounded-lg border border-white/10"
                  >
                    + حجم 30 مل
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddVariant(50)}
                    className="px-2.5 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[11px] font-bold rounded-lg border border-teal-500/30"
                  >
                    + حجم 50 مل
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddVariant(100)}
                    className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold rounded-lg border border-emerald-500/30"
                  >
                    + حجم 100 مل
                  </button>
                </div>
              </div>

              {/* Variant Cards */}
              <div className="space-y-4">
                {variants.map((v, index) => {
                  const regEgp = Number(v.regularPriceEgp) || 0;
                  const costEgp = Number(v.costPriceEgp) || 0;
                  const profitEgp = regEgp - costEgp;
                  const marginPct = regEgp > 0 ? Math.round((profitEgp / regEgp) * 100) : 0;
                  const isBelowCost = regEgp > 0 && costEgp > 0 && regEgp < costEgp;

                  return (
                    <div
                      key={v.id || index}
                      className="p-4 bg-[#141A1A] border border-white/10 rounded-2xl space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-teal-400">
                            زجاجة حجم {v.volumeMl} مل
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/10">
                            SKU: {v.sku}
                          </span>
                          {marginPct > 0 && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              هامش ربح {marginPct}% (+{profitEgp} ج.م)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDuplicateVariant(v)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
                            title="تكرار الحجم"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(v.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/10"
                            title="حذف الحجم"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {isBelowCost && (
                        <div className="flex items-center gap-2 p-2 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                          <span>تحذير: سعر البيع أقل من التكلفة الفعلية للزجاجة!</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">
                            سعر البيع (EGP) *
                          </label>
                          <input
                            type="number"
                            required
                            min={50}
                            value={v.regularPriceEgp || ''}
                            onChange={(e) =>
                              handleUpdateVariantField(v.id, 'regularPriceEgp', Number(e.target.value))
                            }
                            className="w-full bg-[#0E1212] border border-white/15 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-rose-300 block mb-1">
                            سعر الخصم (اختياري)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={v.salePriceEgp || ''}
                            onChange={(e) =>
                              handleUpdateVariantField(
                                v.id,
                                'salePriceEgp',
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                            placeholder="اتركه فارغ إذا لا يوجد"
                            className="w-full bg-[#0E1212] border border-white/15 rounded-xl px-3 py-2 text-rose-400 font-bold focus:outline-none focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-amber-300 block mb-1">
                            التكلفة COGS (سري)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={v.costPriceEgp || ''}
                            onChange={(e) =>
                              handleUpdateVariantField(v.id, 'costPriceEgp', Number(e.target.value))
                            }
                            className="w-full bg-[#0E1212] border border-white/15 rounded-xl px-3 py-2 text-amber-200 font-mono focus:outline-none focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">
                            المخزون المتوفر (Bottles)
                          </label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={v.stockQuantity}
                            onChange={(e) =>
                              handleUpdateVariantField(v.id, 'stockQuantity', Number(e.target.value))
                            }
                            className="w-full bg-[#0E1212] border border-white/15 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB E: STOREFRONT PRESENTATION */}
          {activeTab === 'presentation' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-white/10 pb-3">
                <h2 className="font-serif text-lg font-bold text-white">واجهة العرض وتجربة العميل</h2>
                <p className="text-xs text-slate-400">
                  تنسيق البادجات الترويجية وضمان المعاينة عند الباب وسياسات التسوق المباشر.
                </p>
              </div>

              <div className="p-4 bg-[#141A1A] border border-white/10 rounded-2xl space-y-4">
                <h3 className="font-serif text-sm font-bold text-teal-400">شارات وتمييز العطر في المتجر</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2.5 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBestseller}
                      onChange={(e) => {
                        setIsBestseller(e.target.checked);
                        markDirty();
                      }}
                      className="rounded text-teal-500"
                    />
                    <span className="text-xs font-bold text-slate-200">الأكثر طلباً (Bestseller)</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNewArrival}
                      onChange={(e) => {
                        setIsNewArrival(e.target.checked);
                        markDirty();
                      }}
                      className="rounded text-teal-500"
                    />
                    <span className="text-xs font-bold text-slate-200">وصل حديثاً (New Arrival)</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => {
                        setIsFeatured(e.target.checked);
                        markDirty();
                      }}
                      className="rounded text-teal-500"
                    />
                    <span className="text-xs font-bold text-slate-200">عطر مميز في الواجهة (Featured)</span>
                  </label>
                </div>
              </div>

              {/* White Glove Doorstep Inspection Policy (Centrally Managed) */}
              <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-teal-300">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>سياسة فحص الطرد والمعاينة الملكية (مفعلة تلقائياً لجميع المحافظات)</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  يحق للعميل فتح كرتونة الشحن والتأكد من مطابقة الزجاجة ورائحتها وسلامتها قبل دفع أي جنيه للمندوب. في حال عدم الرغبة في الاستلام، يلتزم العميل بسداد مصاريف الشحن والتوصيل للمندوب فقط.
                </p>
              </div>
            </div>
          )}

          {/* TAB F: SEO MANAGEMENT */}
          {activeTab === 'seo' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h2 className="font-serif text-lg font-bold text-white">محركات البحث والظهور (Google SEO)</h2>
                  <p className="text-xs text-slate-400">
                    توليد الـ Title والـ Meta Description والـ Schema.org Product تلقائياً لضمان أعلى ظهور في Google.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoGenerateSeo}
                  className="inline-flex items-center gap-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>توليد تلقائي احترافي للـ SEO ⚡</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-slate-300">
                      عنوان محرك بحث جوجل (SEO Title)
                    </label>
                    <span
                      className={`text-[10px] font-mono ${
                        seoTitle.length >= 40 && seoTitle.length <= 65 ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {seoTitle.length} / 65 حرف موصى به
                    </span>
                  </div>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => {
                      setSeoTitle(e.target.value);
                      markDirty();
                    }}
                    placeholder="مثال: عطر رحيق سوفاج إكسير | مستوحى من طابع ديور | دار رَحِيقْ"
                    className="w-full bg-[#141A1A] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-slate-300">
                      وصف الميتا في جوجل (Meta Description)
                    </label>
                    <span
                      className={`text-[10px] font-mono ${
                        seoDescription.length >= 120 && seoDescription.length <= 160
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {seoDescription.length} / 160 حرف موصى به
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => {
                      setSeoDescription(e.target.value);
                      markDirty();
                    }}
                    placeholder="الوصف التسويقي الجذاب الذي يظهر أسفل الرابط في صفحة نتائج بحث Google..."
                    className="w-full bg-[#141A1A] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-teal-500 leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    الكلمات المفتاحية المستهدفة (SEO Keywords)
                  </label>
                  <input
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => {
                      setSeoKeywords(e.target.value);
                      markDirty();
                    }}
                    placeholder="عطر سوفاج, بديل سوفاج إكسير, عطور رحيق, عطور نيش رجالية"
                    className="w-full bg-[#141A1A] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Google SERP Card Preview */}
              <div className="p-4 bg-white text-slate-900 rounded-2xl shadow-xl space-y-2 border border-slate-200">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                  Google Search Snippet Preview (تقريبي)
                </span>
                <div className="text-xs text-slate-600 truncate font-mono">
                  {SITE_URL}/product/{slug || 'perfume-slug'}
                </div>
                <div className="text-blue-700 hover:underline font-medium text-base font-serif cursor-pointer leading-tight">
                  {seoTitle || `${nameAr || nameEn || 'عطر فاخر'} | دار رَحِيقْ للعطور`}
                </div>
                <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {seoDescription ||
                    'عطر فاخر ومستقل من دار رحيق بتركيز نيش إكستري دو بارفان وثبات عالي مع المعاينة قبل الدفع عند الباب في مصر.'}
                </div>
              </div>
            </div>
          )}

          {/* TAB G: MARKETING & MERCHANDISING */}
          {activeTab === 'marketing' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-white/10 pb-3">
                <h2 className="font-serif text-lg font-bold text-white">التسويق والمبيعات المتقاطعة</h2>
                <p className="text-xs text-slate-400">
                  اقتراح عطور مشابهة لزيادة متوسط قيمة الطلب (Cross-selling).
                </p>
              </div>

              <div className="p-4 bg-[#141A1A] border border-white/10 rounded-2xl space-y-3">
                <h3 className="font-serif text-sm font-bold text-teal-400">عطور مقترحة قد تعجب العميل</h3>
                <p className="text-xs text-slate-400">
                  يتم اختيار هذه العطور تلقائياً من نفس العائلة العطرية ({fragranceFamily}) لتعزيز بقاء الزائر في المتجر.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {previewRelated.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 bg-black/40 border border-white/10 rounded-xl text-center space-y-1"
                    >
                      <img
                        src={p.images?.[0]?.url || p.imageUrl}
                        alt=""
                        className="w-12 h-14 object-cover mx-auto rounded-lg"
                      />
                      <p className="text-[11px] font-bold text-slate-200 truncate">{p.nameAr || p.nameEn}</p>
                      <p className="text-[10px] text-teal-400 font-mono">
                        {formatPrice(p.variants[0]?.regularPriceInPiasters || 185000)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB H: PUBLISHING & AUDIT CHECKLIST */}
          {activeTab === 'publishing' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-white/10 pb-3">
                <h2 className="font-serif text-lg font-bold text-white">فحص الجاهزية والنشر في المتجر</h2>
                <p className="text-xs text-slate-400">
                  تدقيق إلزامي لكافة المتطلبات الشرائية والفنية قبل اعتماد ظهور العطر للجمهور.
                </p>
              </div>

              {/* Pre-publication Validation Checklist */}
              <div className="p-5 bg-[#141A1A] border border-white/10 rounded-2xl space-y-3">
                <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-teal-400" />
                  <span>قائمة التدقيق الإلزامي للنشر (Publication Readiness):</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-black/30 rounded-xl">
                    <span>1. اسم العطر بالعربية والإنجليزية</span>
                    {checklist.hasName ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> مكتمل
                      </span>
                    ) : (
                      <button
                        onClick={() => setActiveTab('identity')}
                        className="text-rose-400 font-bold underline"
                      >
                        ناقص (اضغط للإكمال)
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-black/30 rounded-xl">
                    <span>2. الصورة الرئيسية للعطر</span>
                    {checklist.hasImage ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> مكتمل
                      </span>
                    ) : (
                      <button
                        onClick={() => setActiveTab('media')}
                        className="text-rose-400 font-bold underline"
                      >
                        ناقص (اضغط للإكمال)
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-black/30 rounded-xl">
                    <span>3. الهرم العطري (القمة، القلب، القاعدة)</span>
                    {checklist.hasNotes ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> مكتمل
                      </span>
                    ) : (
                      <button
                        onClick={() => setActiveTab('fragrance')}
                        className="text-amber-400 font-bold underline"
                      >
                        نوتات افتراضية
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-black/30 rounded-xl">
                    <span>4. أحجام الزجاجة وتسعير البيع والمخزون</span>
                    {checklist.hasVariants && checklist.hasValidPrices ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> مكتمل ({variants.length} أحجام)
                      </span>
                    ) : (
                      <button
                        onClick={() => setActiveTab('variants')}
                        className="text-rose-400 font-bold underline"
                      >
                        ناقص (اضغط للإكمال)
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-black/30 rounded-xl">
                    <span>5. إعدادات محركات البحث وجوجل (SEO)</span>
                    {checklist.hasSeo ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> مكتمل ومُحسّن
                      </span>
                    ) : (
                      <button
                        onClick={handleAutoGenerateSeo}
                        className="text-teal-400 font-bold underline"
                      >
                        توليد تلقائي بضغطة زر ⚡
                      </button>
                    )}
                  </div>
                </div>

                {checklist.blockers.length > 0 && (
                  <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs space-y-1">
                    <p className="font-bold">الموانع الإلزامية التي تمنع النشر للجمهور حالياً:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {checklist.blockers.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Status Toggles & Publishing Execution */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveProduct(false)}
                  disabled={isSaving}
                  className="w-full sm:w-1/2 p-3.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  حفظ العطر كمسودة خاصة (غير مرئية للجمهور)
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveProduct(true)}
                  disabled={isSaving || !checklist.isReadyToPublish}
                  className="w-full sm:w-1/2 p-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 cursor-pointer"
                >
                  نشر العطر وتفعيله في الكتالوج ومحركات البحث ✓
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Live Interactive Storefront Preview */}
        <div
          className={`${
            mobileViewTab === 'preview' ? 'block' : 'hidden lg:block'
          } ${
            isPreviewCollapsed ? 'hidden' : 'lg:col-span-5 xl:col-span-6'
          } bg-[#101414] overflow-y-auto max-h-[calc(100vh-65px)] p-4 sm:p-6 transition-all duration-300`}
        >
          {/* Preview Controls Bar */}
          <div className="sticky top-0 z-20 bg-[#101414]/90 backdrop-blur-md pb-4 flex items-center justify-between border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-serif text-xs font-bold text-white">المعاينة الحية التفاعلية</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-lg border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={`p-1.5 rounded-md transition-colors ${
                  previewMode === 'desktop' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="معاينة شاشة الكمبيوتر"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={`p-1.5 rounded-md transition-colors ${
                  previewMode === 'mobile' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="معاينة شاشة الموبايل"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('serp')}
                className={`p-1.5 rounded-md transition-colors ${
                  previewMode === 'serp' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="معاينة مظهر جوجل"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* PREVIEW CONTAINER */}
          {previewMode === 'serp' ? (
            <div className="p-6 bg-white text-slate-900 rounded-3xl shadow-2xl space-y-3 max-w-lg mx-auto my-6 border border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span>Google Search Preview</span>
              </div>
              <div className="text-xs text-slate-600 truncate font-mono">
                {SITE_URL}/product/{slug || 'perfume-slug'}
              </div>
              <div className="text-blue-700 hover:underline font-medium text-lg font-serif cursor-pointer leading-tight">
                {seoTitle || `${nameAr || nameEn || 'عطر فاخر'} | دار رَحِيقْ`}
              </div>
              <div className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {seoDescription ||
                  'عطر فاخر ومستقل من دار رحيق بتركيز نيش إكستري دو بارفان وثبات عالي مع المعاينة قبل الدفع عند الباب في مصر.'}
              </div>
            </div>
          ) : previewMode === 'mobile' ? (
            <div className="max-w-[390px] mx-auto my-2 rounded-[40px] border-8 border-slate-800 shadow-2xl overflow-hidden bg-[#F6F3EC] relative">
              {/* iPhone Notch Simulator */}
              <div className="h-5 bg-slate-800 w-36 mx-auto rounded-b-xl mb-1 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700" />
              </div>
              <div className="overflow-y-auto max-h-[720px] p-2 text-slate-900 scale-[0.88] origin-top">
                <ProductClientView
                  product={livePreviewProduct}
                  relatedProducts={previewRelated}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-[#E6E1D5] bg-[#F6F3EC] text-slate-900 p-2 sm:p-4">
              <ProductClientView
                product={livePreviewProduct}
                relatedProducts={previewRelated}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
