'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  ShieldCheck,
  Truck,
  Droplets,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Layers,
  MessageSquare,
  Gift,
  Scale,
  Award,
} from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/currency';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { trackViewItem, trackAddToCart, trackBeginCheckout } from '@/lib/analytics';
import {
  getLocalizedProductName,
  getLocalizedProductDescription,
  getLocalizedFragranceFamily,
  getLocalizedConcentration,
  getLocalizedOlfactoryNote,
} from '@/lib/fragrance-translations';

interface ProductClientViewProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductClientView({ product, relatedProducts }: ProductClientViewProps) {
  const router = useRouter();
  const { t, isRtl } = useLanguage();
  const { addItem } = useCart();

  const fallbackVariant = product.variants?.[0] || {
    id: `${product.id}-var-100`,
    productId: product.id,
    sku: `RHQ-100ML`,
    volumeMl: 100,
    titleEn: '100ml Extrait De Parfum',
    titleAr: '100 مل إكستري دو بارفان',
    regularPriceInPiasters: 275000,
    regularPriceEgp: 2750,
    stockQuantity: 20,
    lowStockThreshold: 5,
    isActive: true,
  };

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(fallbackVariant);
  const [selectedImage, setSelectedImage] = useState(product.images?.[0]?.url || product.imageUrl || '');
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    setSelectedVariant(product.variants?.[0] || fallbackVariant);
    setSelectedImage(product.images?.[0]?.url || product.imageUrl || '');
    // GA4: track view_item
    trackViewItem(product, product.variants?.[0] || fallbackVariant);
  }, [product]);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const regularPrice = selectedVariant.regularPriceInPiasters ?? ((selectedVariant.regularPriceEgp ?? 0) * 100);
  const salePrice = selectedVariant.salePriceInPiasters ?? (selectedVariant.salePriceEgp ? selectedVariant.salePriceEgp * 100 : null);
  const isSale = salePrice !== null && salePrice !== undefined && salePrice < regularPrice;
  const currentPrice = salePrice || regularPrice;

  const isOutOfStock = selectedVariant.stockQuantity <= 0;
  const isLowStock = selectedVariant.stockQuantity > 0 && selectedVariant.stockQuantity <= selectedVariant.lowStockThreshold;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, selectedVariant, quantity);
    trackAddToCart(product, selectedVariant, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(product, selectedVariant, quantity);
    trackAddToCart(product, selectedVariant, quantity);
    trackBeginCheckout([{ product, variant: selectedVariant, quantity }], (currentPrice * quantity) / 100);
    router.push('/checkout');
  };

  const whatsappInquiryUrl = `https://wa.me/201131068790?text=${encodeURIComponent(
    isRtl
      ? `مرحباً دار رَحِيقْ، أود الاستفسار وطلب عطر ${getLocalizedProductName(product, isRtl)} (${product.nameEn}) حجم ${selectedVariant.volumeMl} مل بسعر ${formatPrice(currentPrice)}.`
      : `Hello Raheeq, I want to inquire about ${product.nameEn} ${selectedVariant.volumeMl}ml priced at ${formatPrice(currentPrice)}.`
  )}`;

  return (
    <div className="min-h-screen bg-[#F6F3EC] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-[#576563] flex-wrap gap-y-2">
          <Link href="/" className="hover:text-[#080A0A] transition-colors">{isRtl ? 'الرئيسية' : 'Home'}</Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-[#080A0A] transition-colors">{t('nav.all_fragrances')}</Link>
          <span>/</span>
          <Link href={`/catalog?family=${encodeURIComponent(product.fragranceFamily)}`} className="hover:text-[#080A0A] transition-colors">
            {getLocalizedFragranceFamily(product.fragranceFamily, isRtl)}
          </Link>
          <span>/</span>
          <span className="text-[#0D9488] font-bold truncate max-w-xs">{getLocalizedProductName(product, isRtl)}</span>
        </nav>

        {/* Main Product Showcase Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#E6E1D5] shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-start">
            
            {/* Left: Product Imagery & Gallery */}
            <div className="space-y-4">
              <div className="aspect-[4/5] bg-[#FAF8F4] rounded-2xl border border-[#E6E1D5] overflow-hidden relative shadow-lg group">
                <img
                  src={selectedImage || product.images?.[0]?.url || product.imageUrl}
                  alt={getLocalizedProductName(product, isRtl)}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {product.isBestseller && (
                  <span className={`absolute top-4 ${isRtl ? 'right-4' : 'left-4'} badge-emerald px-3 py-1 rounded-sm font-bold shadow-md`}>
                    {isRtl ? 'الأكثر طلباً' : 'Bestseller'}
                  </span>
                )}
                <div className="absolute bottom-4 left-4 right-4 bg-[#080A0A]/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#2DD4BF]/40 text-[11px] text-[#F5F2EB] flex items-center justify-between">
                  <span className="font-mono text-[#C6A66B]">SKU: {selectedVariant.sku}</span>
                  <span className="text-[#2DD4BF] font-bold">{getLocalizedConcentration(product.concentration, isRtl)}</span>
                </div>
              </div>

              {/* Thumbnails if available */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.url)}
                      className={`relative w-20 h-24 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${
                        selectedImage === img.url ? 'border-[#0D9488] scale-105 shadow-md' : 'border-[#E6E1D5] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={img.altTextEn} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* White Glove Inspection Guarantee */}
              <div className="p-4 bg-[#F6F3EC] rounded-2xl border border-[#E6E1D5] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#0D9488] font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
                  <span>{isRtl ? 'ضمان المعاينة الملكية عند باب بيتك' : 'Doorstep Inspection & Authenticity Guarantee'}</span>
                </div>
                <p className="text-[#576563] text-[11px] leading-relaxed">
                  {isRtl
                    ? 'يحق لك فتح كرتونة الشحن والتأكد من مطابقة الزجاجة وسلامتها ورائحتها قبل دفع أي جنيه للمندوب. في حال عدم الرغبة في الاستلام، يلتزم العميل بسداد مصاريف الشحن والتوصيل للمندوب فقط.'
                    : 'Inspect your flacon upon arrival before settling cash payment with our white-glove courier.'}
                </p>
              </div>
            </div>

            {/* Right: Olfactory Details & Purchase Controls */}
            <div className="space-y-6">
              
              {/* Product Header & Inspiration Notice */}
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs uppercase tracking-widest font-mono font-bold text-[#0D9488] bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 px-2.5 py-0.5 rounded-full">
                    {getLocalizedFragranceFamily(product.fragranceFamily, isRtl)}
                  </span>
                  <span className="text-xs font-semibold text-[#8C6207] bg-[#F3E7C4] px-2.5 py-0.5 rounded-full">
                    دار رَحِيقْ • RAHEEQ
                  </span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#080A0A] tracking-tight leading-tight">
                  {getLocalizedProductName(product, isRtl)}
                </h1>
                {isRtl && product.nameEn && product.nameAr && product.nameEn !== product.nameAr && (
                  <p className="text-sm font-mono text-[#788784] mt-1">
                    {product.nameEn}
                  </p>
                )}

                {/* Inspiration & Commercial Integrity Disclosure */}
                {product.inspiredBy && (
                  <div className="mt-3.5 p-3.5 bg-amber-50 rounded-xl border border-amber-200/90 text-xs text-amber-950 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <Scale className="w-3.5 h-3.5 text-amber-700" />
                      <span>{isRtl ? 'إيضاح الطابع العطري وإخلاء المسؤولية:' : 'Inspiration Disclosure & Disclaimer:'}</span>
                    </div>
                    <p className="text-[11px] text-amber-900/90 leading-relaxed">
                      {product.inspirationNoteAr ||
                        `هذا العطر تركيبة مستقلة وخاصة صممتها دار رَحِيقْ (RAHEEQ) بتركيز ${getLocalizedConcentration(product.concentration, isRtl)} مستوحاة من الهرم العطري لـ ${product.inspiredBy}. هذا المنتج أصيل وخاص برحيق وغير تابع للعلامة التجارية المذكورة.`}
                    </p>
                  </div>
                )}

                {/* Honest Pricing (No Fake Strikethroughs) */}
                <div className="mt-5 flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-serif font-bold text-[#080A0A]">
                    {formatPrice(currentPrice)}
                  </span>
                  {isSale && (
                    <span className="text-lg text-[#788784] line-through">
                      {formatPrice(regularPrice)}
                    </span>
                  )}
                  <span className="text-xs text-[#0D9488] bg-[#2DD4BF]/15 border border-[#2DD4BF]/40 px-2.5 py-1 rounded-md font-bold">
                    {isRtl ? 'جنيه مصري (EGP)' : 'EGP (Egyptian Pound)'}
                  </span>
                </div>

                <p className="text-sm text-[#576563] mt-3 leading-relaxed">
                  {getLocalizedProductDescription(product, isRtl)}
                </p>
              </div>

              {/* Fragrance Performance Metrics */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-[#FAF8F4] rounded-2xl border border-[#E6E1D5] text-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-[#788784] uppercase tracking-wider block font-bold">{isRtl ? 'التركيز' : 'Concentration'}</span>
                  <span className="text-xs sm:text-sm font-bold text-[#0D9488]">{getLocalizedConcentration(product.concentration, isRtl)}</span>
                </div>
                <div className="space-y-0.5 border-x border-[#E6E1D5]">
                  <span className="text-[10px] text-[#788784] uppercase tracking-wider block font-bold">{isRtl ? 'الثبات' : 'Longevity'}</span>
                  <span className="text-xs sm:text-sm font-bold text-[#080A0A]">{isRtl ? '+14 ساعة' : '+14 Hours'}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-[#788784] uppercase tracking-wider block font-bold">{isRtl ? 'الفوحان' : 'Sillage'}</span>
                  <span className="text-xs sm:text-sm font-bold text-[#080A0A]">{isRtl ? 'قوي وملحوظ' : 'Heavy & Noticeable'}</span>
                </div>
              </div>

              {/* Olfactory Pyramid (Notes) */}
              <div className="space-y-3 p-5 bg-[#FAF8F4] rounded-2xl border border-[#E6E1D5]">
                <h3 className="font-serif font-bold text-xs uppercase tracking-widest text-[#080A0A] flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#0D9488]" />
                  <span>{isRtl ? 'الهرم العطري والمكونات النقية' : 'The Olfactory Pyramid'}</span>
                </h3>

                <div className="space-y-2.5 text-xs divide-y divide-[#E6E1D5]/60 pt-1">
                  <div className="pt-2 first:pt-0 flex items-start justify-between gap-4">
                    <span className="font-bold text-[#080A0A] whitespace-nowrap min-w-24">
                      {isRtl ? 'القمة (Top Notes):' : 'Top Notes:'}
                    </span>
                    <span className="text-[#576563] text-left leading-relaxed">
                      {product.topNotes.map((n) => getLocalizedOlfactoryNote(n, isRtl)).join(' • ')}
                    </span>
                  </div>

                  <div className="pt-2 flex items-start justify-between gap-4">
                    <span className="font-bold text-[#080A0A] whitespace-nowrap min-w-24">
                      {isRtl ? 'القلب (Heart Notes):' : 'Heart Notes:'}
                    </span>
                    <span className="text-[#576563] text-left leading-relaxed">
                      {product.heartNotes.map((n) => getLocalizedOlfactoryNote(n, isRtl)).join(' • ')}
                    </span>
                  </div>

                  <div className="pt-2 flex items-start justify-between gap-4">
                    <span className="font-bold text-[#080A0A] whitespace-nowrap min-w-24">
                      {isRtl ? 'القاعدة (Base Notes):' : 'Base Notes:'}
                    </span>
                    <span className="text-[#576563] text-left leading-relaxed">
                      {product.baseNotes.map((n) => getLocalizedOlfactoryNote(n, isRtl)).join(' • ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Size Selector */}
              <div className="space-y-3">
                <label className="font-bold text-xs text-[#080A0A] block">
                  {isRtl ? 'اختر الحجم:' : 'Select Size:'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((v) => {
                    const vPrice = v.salePriceInPiasters || v.regularPriceInPiasters || ((v.salePriceEgp || v.regularPriceEgp || 0) * 100);
                    const isSelected = selectedVariant.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`p-3.5 rounded-xl border-2 text-right transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'border-[#0D9488] bg-[#2DD4BF]/5 shadow-sm'
                            : 'border-[#E6E1D5] hover:border-[#080A0A]/30 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="font-serif font-bold text-sm text-[#080A0A]">
                            {v.volumeMl} {isRtl ? 'مل' : 'ml'}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />}
                        </div>
                        <span className="text-xs font-mono font-bold text-[#0D9488] mt-1">
                          {formatPrice(vPrice)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions: Add to Bag & Instant Doorstep Order */}
              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-[#E6E1D5] rounded-xl bg-white px-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-2 py-2 text-[#080A0A] font-bold text-sm hover:text-[#0D9488]"
                    >
                      -
                    </button>
                    <span className="px-2 font-mono font-bold text-xs">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-2 py-2 text-[#080A0A] font-bold text-sm hover:text-[#0D9488]"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to bag */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex-1 bg-white hover:bg-[#FAF8F4] text-[#080A0A] border border-[#080A0A] py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{addedAnimation ? (isRtl ? 'تمت الإضافة بنجاح ✓' : 'Added to Bag ✓') : t('product.add_to_cart')}</span>
                  </button>
                </div>

                {/* Direct Instant Order Button */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full bg-[#080A0A] hover:bg-teal-800 text-white py-4 px-6 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{isRtl ? 'طلب فوري ومعاينة عند الاستلام (الدفع كاش)' : 'Order Now & Pay on Delivery'}</span>
                  <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </button>

                {/* Direct WhatsApp Consultation */}
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-[#0D9488] bg-[#2DD4BF]/10 hover:bg-[#2DD4BF]/20 border border-[#2DD4BF]/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isRtl ? 'استفسار أو طلب عبر واتساب مباشرة' : 'Inquire on WhatsApp'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related Fragrances */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#E6E1D5] pb-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#0D9488] font-bold">
                  {isRtl ? 'توليفات من نفس العائلة العطرية' : 'Related Olfactory Creations'}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#080A0A] mt-1">
                  {isRtl ? 'عطور أخرى قد تروق لذوقك' : 'You May Also Appreciate'}
                </h3>
              </div>
              <Link href="/catalog" className="text-xs text-[#0D9488] font-bold hover:underline">
                {isRtl ? 'عرض الكتالوج كاملاً ←' : 'View Full Collection →'}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Buy Bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E6E1D5] p-3 sm:hidden shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom">
          <div className="min-w-0">
            <p className="font-serif font-bold text-xs text-[#080A0A] truncate">{getLocalizedProductName(product, isRtl)}</p>
            <p className="text-xs font-mono font-bold text-[#0D9488]">{formatPrice(currentPrice)}</p>
          </div>
          <button
            onClick={handleBuyNow}
            className="bg-[#080A0A] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md flex-shrink-0"
          >
            <span>{isRtl ? 'شراء الآن' : 'Buy Now'}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}
    </div>
  );
}
