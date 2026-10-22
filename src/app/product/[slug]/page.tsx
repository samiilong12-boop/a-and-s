'use client';

import React, { useState, useEffect, use } from 'react';
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
} from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/currency';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { products, getProductBySlug } = useProducts();
  const { t, isRtl } = useLanguage();
  const { addItem } = useCart();

  const product = getProductBySlug(resolvedParams.slug) || products[0];

  const [selectedVariant, setSelectedVariant] = useState(product?.variants[0]);
  const [selectedImage, setSelectedImage] = useState(product?.images[0]?.url);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!product || !selectedVariant) {
    return (
      <div className="max-w-7xl mx-auto p-16 text-center text-[#576563]">
        <p>{isRtl ? 'جاري تحميل تفاصيل العطر...' : 'Loading fragrance details...'}</p>
      </div>
    );
  }

  // Financials for selected variant
  const regularPrice = selectedVariant.regularPriceInPiasters;
  const salePrice = selectedVariant.salePriceInPiasters;
  const isSale = salePrice !== null && salePrice !== undefined && salePrice < regularPrice;
  const currentPrice = salePrice || regularPrice;

  // Stock status
  const isOutOfStock = selectedVariant.stockQuantity <= 0;
  const isLowStock = selectedVariant.stockQuantity > 0 && selectedVariant.stockQuantity <= selectedVariant.lowStockThreshold;

  // Related products
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.fragranceFamily === product.fragranceFamily)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, selectedVariant, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(product, selectedVariant, quantity);
    router.push('/checkout');
  };

  const whatsappInquiryUrl = `https://wa.me/201012345678?text=${encodeURIComponent(
    isRtl
      ? `مرحباً، أود الاستفسار وطلب عطر ${product.nameEn} حجم ${selectedVariant.volumeMl} مل بسعر ${formatPrice(currentPrice)}.`
      : `Hello, I want to inquire about ${product.nameEn} ${selectedVariant.volumeMl}ml priced at ${formatPrice(currentPrice)}.`
  )}`;

  return (
    <div className="min-h-screen bg-[#F6F3EC] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-[#576563]">
          <Link href="/" className="hover:text-[#080A0A] transition-colors">{isRtl ? 'الرئيسية' : 'Home'}</Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-[#080A0A] transition-colors">{t('nav.all_fragrances')}</Link>
          <span>/</span>
          <Link href={`/catalog?family=${encodeURIComponent(product.fragranceFamily)}`} className="hover:text-[#080A0A] transition-colors">
            {product.fragranceFamily}
          </Link>
          <span>/</span>
          <span className="text-[#0D9488] font-bold truncate max-w-xs">{product.nameEn}</span>
        </nav>

        {/* Main Product Showcase Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#E6E1D5] shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-start">
            
            {/* Left: Product Imagery & Gallery */}
            <div className="space-y-4">
              <div className="aspect-[4/5] bg-[#FAF8F4] rounded-2xl border border-[#E6E1D5] overflow-hidden relative shadow-lg group">
                <img
                  src={selectedImage || product.images[0]?.url}
                  alt={product.nameEn}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {product.isBestseller && (
                  <span className={`absolute top-4 ${isRtl ? 'right-4' : 'left-4'} badge-emerald px-3 py-1 rounded-sm font-bold shadow-md`}>
                    {isRtl ? 'الأكثر طلباً' : 'Bestseller'}
                  </span>
                )}
                <div className="absolute bottom-4 left-4 right-4 bg-[#080A0A]/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#2DD4BF]/40 text-[11px] text-[#F5F2EB] flex items-center justify-between">
                  <span className="font-mono text-[#C6A66B]">SKU: {selectedVariant.sku}</span>
                  <span className="text-[#2DD4BF] font-bold">{product.concentration.replace(/_/g, ' ')}</span>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setSelectedImage(img.url)}
                    className={`w-20 h-24 rounded-xl bg-[#FAF8F4] border overflow-hidden transition-all ${
                      (selectedImage || product.images[0]?.url) === img.url
                        ? 'border-[#2DD4BF] ring-2 ring-[#2DD4BF]/40 scale-105 shadow-md'
                        : 'border-[#E6E1D5] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Product Details & Actions */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold tracking-[0.2em] text-[#0D9488] uppercase">
                    {product.fragranceFamily}
                  </span>
                  <span className="text-[#A19D92]">•</span>
                  <span className="text-xs text-[#576563] tracking-wider uppercase font-semibold">
                    {product.concentration.replace(/_/g, ' ')}
                  </span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#080A0A] mt-2 tracking-tight">
                  {product.nameEn}
                </h1>

                {/* Ratings & Reviews */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex text-[#C6A66B]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C6A66B]" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-[#080A0A]">{product.rating.toFixed(1)}</span>
                  <span className="text-xs text-[#576563]">
                    ({product.reviewCount} {isRtl ? 'تقييم من عشاق العطور' : 'reviews'})
                  </span>
                </div>

                {/* Pricing */}
                <div className="mt-6 flex items-baseline gap-3">
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
                  {product.descriptionEn}
                </p>
              </div>

              {/* Dior Sauvage Performance & Intensity Radar */}
              <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-[#E6E1D5] space-y-3">
                <span className="text-[11px] font-bold text-[#080A0A] uppercase tracking-wider block">
                  {isRtl ? 'مقياس الأداء العطري (Dior Sauvage Benchmark):' : 'Scent Performance Radar:'}
                </span>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-white border border-[#E6E1D5]">
                    <span className="text-[10px] text-[#576563] block">{isRtl ? 'الفوحان' : 'Sillage'}</span>
                    <span className="text-sm font-bold text-[#0D9488]">9.8 / 10</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E6E1D5]">
                    <span className="text-[10px] text-[#576563] block">{isRtl ? 'الثبات' : 'Longevity'}</span>
                    <span className="text-sm font-bold text-[#0D9488]">+14 ساعة</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E6E1D5]">
                    <span className="text-[10px] text-[#576563] block">{isRtl ? 'التركيز' : 'Strength'}</span>
                    <span className="text-sm font-bold text-[#C6A66B]">Extrait 35%</span>
                  </div>
                </div>
              </div>

              {/* Size & Variant Selector */}
              <div className="space-y-3 pt-2 border-t border-[#E6E1D5]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#080A0A] uppercase tracking-wider">{t('product.select_size')}:</span>
                  <span className="text-[#0D9488] font-mono font-bold">{selectedVariant.volumeMl} ML Flacon</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariant.id === variant.id;
                    const vPrice = variant.salePriceInPiasters || variant.regularPriceInPiasters;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => {
                          setSelectedVariant(variant);
                          setQuantity(1);
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#FAF8F4] border-[#2DD4BF] ring-2 ring-[#2DD4BF]/30 shadow-sm'
                            : 'bg-white border-[#E6E1D5] hover:border-[#2DD4BF]'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-[#080A0A]">{variant.volumeMl} ml</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />}
                        </div>
                        <p className="text-xs text-[#576563] mt-1">{variant.titleEn}</p>
                        <p className="text-xs font-bold text-[#0D9488] mt-1.5">{formatPrice(vPrice)}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stock Indicator */}
              <div className="flex items-center gap-2 text-xs">
                {isOutOfStock ? (
                  <span className="text-rose-600 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    {t('product.out_of_stock')}
                  </span>
                ) : isLowStock ? (
                  <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    {isRtl
                      ? `إصدار نادر: تبقت ${selectedVariant.stockQuantity} عبوات فقط في معمل القاهرة`
                      : `Rare Edition: Only ${selectedVariant.stockQuantity} bottles remaining in Cairo atelier`}
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    {t('product.in_stock')}
                  </span>
                )}
              </div>

              {/* Quantity Selector & Action Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-[#E6E1D5] bg-[#FAF8F4] rounded-xl px-3 py-2 w-full sm:w-36 justify-between">
                    <span className="text-xs text-[#576563]">{isRtl ? 'الكمية:' : 'Qty:'}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1 || isOutOfStock}
                        className="text-[#576563] hover:text-[#080A0A] disabled:opacity-30 font-bold"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-[#080A0A]">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(selectedVariant.stockQuantity, q + 1))}
                        disabled={quantity >= selectedVariant.stockQuantity || isOutOfStock}
                        className="text-[#576563] hover:text-[#080A0A] disabled:opacity-30 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 btn-primary py-3.5 px-6 rounded-xl text-xs tracking-widest uppercase font-bold flex items-center justify-center gap-2 shadow-xl ${
                      addedAnimation ? '!bg-[#2DD4BF] !text-[#080A0A]' : ''
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{addedAnimation ? t('product.added_success') : t('product.add_to_bag')}</span>
                  </button>
                </div>

                {/* Instant Cash On Delivery */}
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full btn-emerald py-3.5 px-6 rounded-xl text-xs tracking-widest uppercase font-extrabold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Truck className="w-4 h-4 text-[#080A0A]" />
                  <span>{t('product.buy_now')}</span>
                </button>

                {/* Direct WhatsApp Ordering */}
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-6 rounded-xl text-xs tracking-wider font-bold flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <span>{isRtl ? 'طلب فوري ومحادثة واتساب مع الخبير' : 'Order via WhatsApp Concierge'}</span>
                </a>
              </div>

              {/* Value Assurances & Discovery Gifting */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E6E1D5] text-xs text-[#576563]">
                <div className="flex items-center gap-2.5 p-3 bg-[#FAF8F4] rounded-xl border border-[#E6E1D5]">
                  <Truck className="w-4 h-4 text-[#0D9488] flex-shrink-0" />
                  <span>{isRtl ? 'توصيل سريع: 24–48 ساعة' : 'Express: 24–48h delivery'}</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-[#FAF8F4] rounded-xl border border-[#E6E1D5]">
                  <ShieldCheck className="w-4 h-4 text-[#C6A66B] flex-shrink-0" />
                  <span>{isRtl ? 'معاينة وفحص قبل الدفع كاش' : 'Inspect before payment'}</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-[#FAF8F4] rounded-xl border border-[#E6E1D5]">
                  <Gift className="w-4 h-4 text-[#2DD4BF] flex-shrink-0" />
                  <span>{isRtl ? 'عينتان مجانيتان مع العبوة' : '2 Free discovery samples'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scent Architecture & Notes Pyramid (Haute Parfumerie Standard) */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E6E1D5] space-y-8 shadow-xl">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="badge-emerald px-3 py-1 rounded-sm">
              Olfactory Pyramid
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080A0A]">
              {t('product.pyramid_title')}
            </h2>
            <p className="text-xs text-[#576563]">
              {isRtl ? 'تطور متناغم عبر الزمن من الانطباع الأول إلى التوقيع العطري الدائم.' : 'Harmoniously evolving over time from initial impression to lingering signature.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Top Notes */}
            <div className="p-6 bg-[#FAF8F4] border border-[#E6E1D5] rounded-2xl space-y-3 text-center hover:border-[#2DD4BF] transition-colors">
              <div className="w-10 h-10 rounded-full bg-white border border-[#2DD4BF]/50 flex items-center justify-center mx-auto text-[#0D9488] shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#080A0A]">{t('product.top_notes')}</h3>
              <p className="text-[11px] text-[#C6A66B] uppercase tracking-wider font-bold">{isRtl ? 'الافتتاحية (أول 15–30 دقيقة)' : 'Opening (First 15–30 Mins)'}</p>
              <div className="pt-2 flex flex-wrap justify-center gap-1.5">
                {product.topNotes.map((note) => (
                  <span key={note} className="px-3 py-1 bg-white text-xs text-[#080A0A] font-semibold rounded-lg border border-[#E6E1D5] shadow-xs">
                    {note}
                  </span>
                ))}
              </div>
            </div>

            {/* Heart Notes */}
            <div className="p-6 bg-[#FAF8F4] border border-[#E6E1D5] rounded-2xl space-y-3 text-center hover:border-[#2DD4BF] transition-colors">
              <div className="w-10 h-10 rounded-full bg-white border border-[#C6A66B]/50 flex items-center justify-center mx-auto text-[#C6A66B] shadow-sm">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#080A0A]">{t('product.heart_notes')}</h3>
              <p className="text-[11px] text-[#C6A66B] uppercase tracking-wider font-bold">{isRtl ? 'قلب التكوين (2–6 ساعات)' : 'The Signature Core (2–6 Hours)'}</p>
              <div className="pt-2 flex flex-wrap justify-center gap-1.5">
                {product.heartNotes.map((note) => (
                  <span key={note} className="px-3 py-1 bg-white text-xs text-[#080A0A] font-semibold rounded-lg border border-[#E6E1D5] shadow-xs">
                    {note}
                  </span>
                ))}
              </div>
            </div>

            {/* Base Notes */}
            <div className="p-6 bg-[#FAF8F4] border border-[#E6E1D5] rounded-2xl space-y-3 text-center hover:border-[#2DD4BF] transition-colors">
              <div className="w-10 h-10 rounded-full bg-white border border-[#2DD4BF]/50 flex items-center justify-center mx-auto text-[#0D9488] shadow-sm">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#080A0A]">{t('product.base_notes')}</h3>
              <p className="text-[11px] text-[#C6A66B] uppercase tracking-wider font-bold">{isRtl ? 'القاعدة الثابتة (8–14+ ساعة)' : 'The Lingering Drydown (8–14+ Hours)'}</p>
              <div className="pt-2 flex flex-wrap justify-center gap-1.5">
                {product.baseNotes.map((note) => (
                  <span key={note} className="px-3 py-1 bg-white text-xs text-[#080A0A] font-semibold rounded-lg border border-[#E6E1D5] shadow-xs">
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Complementary & Related Fragrances */}
        {relatedProducts.length > 0 && (
          <div className="space-y-8 pt-4">
            <div className="flex justify-between items-end">
              <div>
                <span className="badge-emerald px-3 py-1 rounded-sm">
                  {isRtl ? 'تناغم العطور' : 'Harmonious Pairings'}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080A0A] mt-2">
                  {isRtl ? 'عطور مقترحة تناسب ذوقك' : 'Complementary Creations'}
                </h2>
              </div>
              <Link
                href={`/catalog?family=${encodeURIComponent(product.fragranceFamily)}`}
                className="text-xs font-bold tracking-widest text-[#0D9488] hover:text-[#080A0A] uppercase flex items-center gap-1"
              >
                <span>{isRtl ? 'استكشف العائلة' : 'Explore Family'}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
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

      {/* Dior Sauvage Sticky Purchase Bar */}
      <aside
        aria-label="Quick Purchase Bar"
        className={`fixed bottom-0 inset-x-0 z-40 bg-[#080A0A]/95 text-[#F5F2EB] backdrop-blur-xl border-t border-[#2DD4BF]/40 py-3.5 px-4 sm:px-8 shadow-2xl transition-transform duration-500 ease-out ${
          showStickyBar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={selectedImage || product.images[0]?.url}
              alt=""
              className="w-12 h-12 object-cover rounded-lg border border-[#2DD4BF]/40 bg-[#141A19]"
            />
            <div>
              <h4 className="font-serif font-bold text-sm text-white line-clamp-1">{product.nameEn}</h4>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#2DD4BF] font-mono font-bold">{formatPrice(currentPrice)}</span>
                <span className="text-[#576563]">•</span>
                <span className="text-[#C5CECB]">{selectedVariant.volumeMl} ML Extrait</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] hover:from-[#5EEAD4] hover:to-[#2DD4BF] text-[#080A0A] font-extrabold text-xs py-2.5 px-6 rounded-lg uppercase tracking-wider shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{addedAnimation ? t('product.added_success') : t('product.add_to_bag')}</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="hidden sm:flex bg-[#141A19] hover:bg-[#1A2624] text-white border border-[#2DD4BF]/40 font-bold text-xs py-2.5 px-5 rounded-lg uppercase tracking-wider transition-colors"
            >
              <span>{t('product.buy_now')}</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
