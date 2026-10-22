'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  ShieldCheck,
  Truck,
  Droplets,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { DEMO_PRODUCTS } from '@/lib/data/products';
import { formatPrice } from '@/lib/currency';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { addItem } = useCart();

  const product = DEMO_PRODUCTS.find((p) => p.slug === resolvedParams.slug) || DEMO_PRODUCTS[0];

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [selectedImage, setSelectedImage] = useState(product.images[0]?.url);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Financials for selected variant
  const regularPrice = selectedVariant.regularPriceInPiasters;
  const salePrice = selectedVariant.salePriceInPiasters;
  const isSale = salePrice !== null && salePrice !== undefined && salePrice < regularPrice;
  const currentPrice = salePrice || regularPrice;

  // Stock status
  const isOutOfStock = selectedVariant.stockQuantity <= 0;
  const isLowStock = selectedVariant.stockQuantity > 0 && selectedVariant.stockQuantity <= selectedVariant.lowStockThreshold;

  // Related products
  const relatedProducts = DEMO_PRODUCTS.filter(
    (p) => p.id !== product.id && p.fragranceFamily === product.fragranceFamily
  ).slice(0, 4);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-[#9EABA7]">
        <Link href="/" className="hover:text-[#F5F2EB] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-[#F5F2EB] transition-colors">Catalog</Link>
        <span>/</span>
        <Link href={`/catalog?family=${encodeURIComponent(product.fragranceFamily)}`} className="hover:text-[#F5F2EB] transition-colors">
          {product.fragranceFamily}
        </Link>
        <span>/</span>
        <span className="text-[#66D9C5] truncate max-w-xs">{product.nameEn}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-start">
        
        {/* Left: Product Imagery & Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-[#0E1212] rounded-xl border border-[#1A2624] overflow-hidden relative shadow-2xl">
            <img
              src={selectedImage}
              alt={product.nameEn}
              className="w-full h-full object-cover transition-all duration-500"
            />
            {product.isBestseller && (
              <span className="absolute top-4 left-4 badge-gold px-3 py-1 rounded-sm font-semibold shadow-lg">
                Bestseller
              </span>
            )}
            <div className="absolute bottom-4 left-4 right-4 bg-[#080A0A]/80 backdrop-blur-md px-3 py-2 rounded border border-[#1A2624] text-[11px] text-[#9EABA7] flex items-center justify-between">
              <span className="font-mono text-[#C6A66B]">SKU: {selectedVariant.sku}</span>
              <span className="text-[#66D9C5]">{product.concentration.replace(/_/g, ' ')}</span>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          <div className="flex gap-3">
            {product.images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(img.url)}
                className={`w-20 h-24 rounded-lg bg-[#0E1212] border overflow-hidden transition-all ${
                  selectedImage === img.url
                    ? 'border-[#66D9C5] ring-2 ring-[#66D9C5]/20 scale-105'
                    : 'border-[#1A2624] opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Details, Variant Selection & Actions */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold tracking-[0.2em] text-[#C6A66B] uppercase">
                {product.fragranceFamily}
              </span>
              <span className="text-[#6C7A77]">•</span>
              <span className="text-xs text-[#9EABA7] tracking-wider uppercase">
                {product.concentration.replace(/_/g, ' ')}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#F5F2EB] mt-2 tracking-tight">
              {product.nameEn}
            </h1>

            {/* Ratings & Reviews */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex text-[#C6A66B]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C6A66B]" />
                ))}
              </div>
              <span className="text-sm font-semibold text-[#F5F2EB]">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-[#9EABA7]">({product.reviewCount} customer reviews)</span>
            </div>

            {/* Pricing */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-serif font-bold text-[#66D9C5]">
                {formatPrice(currentPrice)}
              </span>
              {isSale && (
                <span className="text-lg text-[#6C7A77] line-through">
                  {formatPrice(regularPrice)}
                </span>
              )}
              <span className="text-xs text-[#C6A66B] bg-[#C6A66B]/10 border border-[#C6A66B]/20 px-2 py-0.5 rounded">
                EGP (Egyptian Pound)
              </span>
            </div>

            <p className="text-sm text-[#9EABA7] mt-3 leading-relaxed">
              {product.descriptionEn}
            </p>
          </div>

          {/* Size & Variant Selector */}
          <div className="space-y-3 pt-4 border-t border-[#1A2624]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#F5F2EB] uppercase tracking-wider">Select Bottle Volume:</span>
              <span className="text-[#66D9C5] font-mono">{selectedVariant.volumeMl} ML Flacon</span>
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
                    className={`p-3.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-[#141A19] border-[#66D9C5] ring-1 ring-[#66D9C5]/30'
                        : 'bg-[#111716] border-[#1A2624] hover:border-[#2D4843]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-[#F5F2EB]">{variant.volumeMl} ml</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#66D9C5]" />}
                    </div>
                    <p className="text-xs text-[#9EABA7] mt-1">{variant.titleEn}</p>
                    <p className="text-xs font-semibold text-[#66D9C5] mt-1.5">{formatPrice(vPrice)}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock Indicator */}
          <div className="flex items-center gap-2 text-xs">
            {isOutOfStock ? (
              <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Currently Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Rare Edition: Only {selectedVariant.stockQuantity} bottles remaining in Cairo atelier
              </span>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                In Stock — Ready for immediate dispatch across Egypt
              </span>
            )}
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Quantity */}
              <div className="flex items-center border border-[#1A2624] bg-[#111716] rounded-lg px-3 py-2 w-full sm:w-36 justify-between">
                <span className="text-xs text-[#9EABA7]">Qty:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="text-[#9EABA7] hover:text-[#66D9C5] disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-[#F5F2EB]">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(selectedVariant.stockQuantity, q + 1))}
                    disabled={quantity >= selectedVariant.stockQuantity || isOutOfStock}
                    className="text-[#9EABA7] hover:text-[#66D9C5] disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Bag Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 btn-primary py-3.5 px-6 rounded-lg text-xs tracking-widest uppercase font-bold flex items-center justify-center gap-2 shadow-xl ${
                  addedAnimation ? 'bg-emerald-400 !text-black' : ''
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-[#080A0A]" />
                <span>{addedAnimation ? 'Added To Your Bag!' : 'Add To Bag'}</span>
              </button>
            </div>

            {/* Buy Now / Quick Cash-on-Delivery */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full btn-secondary py-3.5 px-6 rounded-lg text-xs tracking-widest uppercase font-semibold flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4 text-[#66D9C5]" />
              <span>Instant Cash On Delivery Order</span>
            </button>
          </div>

          {/* Value Assurances */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#1A2624] text-xs text-[#9EABA7]">
            <div className="flex items-center gap-2.5 p-2.5 bg-[#0E1212] rounded border border-[#1A2624]">
              <Truck className="w-4 h-4 text-[#66D9C5] flex-shrink-0" />
              <span>Cairo & Giza: 24–48h delivery</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-[#0E1212] rounded border border-[#1A2624]">
              <ShieldCheck className="w-4 h-4 text-[#C6A66B] flex-shrink-0" />
              <span>Pay in Cash Upon Inspection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scent Architecture & Notes Pyramid */}
      <div className="bg-[#0E1212] p-8 sm:p-12 rounded-2xl border border-[#1A2624] space-y-8 shadow-2xl">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-semibold tracking-[0.25em] text-[#66D9C5] uppercase">
            Olfactory Pyramid
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5F2EB]">
            Scent Notes Architecture
          </h2>
          <p className="text-xs text-[#9EABA7]">
            Harmoniously evolving over time from initial impression to lingering signature.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Top Notes */}
          <div className="p-6 bg-[#111716] border border-[#1A2624] rounded-xl space-y-3 text-center">
            <div className="w-10 h-10 rounded-full bg-[#141A19] border border-[#1A2624] flex items-center justify-center mx-auto text-[#66D9C5]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#F5F2EB]">Top Notes</h3>
            <p className="text-[11px] text-[#C6A66B] uppercase tracking-wider">Opening (First 15–30 Mins)</p>
            <div className="pt-2 flex flex-wrap justify-center gap-1.5">
              {product.topNotes.map((note) => (
                <span key={note} className="px-2.5 py-1 bg-[#141A19] text-xs text-[#D5D1C7] rounded border border-[#1A2624]">
                  {note}
                </span>
              ))}
            </div>
          </div>

          {/* Heart Notes */}
          <div className="p-6 bg-[#111716] border border-[#1A2624] rounded-xl space-y-3 text-center">
            <div className="w-10 h-10 rounded-full bg-[#141A19] border border-[#1A2624] flex items-center justify-center mx-auto text-[#C6A66B]">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#F5F2EB]">Heart Notes</h3>
            <p className="text-[11px] text-[#C6A66B] uppercase tracking-wider">The Signature Core (2–6 Hours)</p>
            <div className="pt-2 flex flex-wrap justify-center gap-1.5">
              {product.heartNotes.map((note) => (
                <span key={note} className="px-2.5 py-1 bg-[#141A19] text-xs text-[#D5D1C7] rounded border border-[#1A2624]">
                  {note}
                </span>
              ))}
            </div>
          </div>

          {/* Base Notes */}
          <div className="p-6 bg-[#111716] border border-[#1A2624] rounded-xl space-y-3 text-center">
            <div className="w-10 h-10 rounded-full bg-[#141A19] border border-[#1A2624] flex items-center justify-center mx-auto text-[#66D9C5]">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#F5F2EB]">Base Notes</h3>
            <p className="text-[11px] text-[#C6A66B] uppercase tracking-wider">The Lingering Drydown (8–14+ Hours)</p>
            <div className="pt-2 flex flex-wrap justify-center gap-1.5">
              {product.baseNotes.map((note) => (
                <span key={note} className="px-2.5 py-1 bg-[#141A19] text-xs text-[#D5D1C7] rounded border border-[#1A2624]">
                  {note}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Complementary & Related Fragrances */}
      {relatedProducts.length > 0 && (
        <div className="space-y-8 pt-8 border-t border-[#1A2624]">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-semibold tracking-[0.25em] text-[#C6A66B] uppercase">
                Harmonious Pairings
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5F2EB] mt-1">
                Complementary Creations
              </h2>
            </div>
            <Link
              href={`/catalog?family=${encodeURIComponent(product.fragranceFamily)}`}
              className="text-xs font-bold tracking-widest text-[#66D9C5] uppercase flex items-center gap-1"
            >
              <span>Explore Family</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
  );
}
