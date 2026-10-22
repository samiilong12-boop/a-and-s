'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Eye, Star } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/currency';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isRtl } = useLanguage();
  const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url;
  const defaultVariant = product.variants[0];

  const regularPrice = defaultVariant?.regularPriceInPiasters || 0;
  const salePrice = defaultVariant?.salePriceInPiasters;
  const hasSale = salePrice !== null && salePrice !== undefined && salePrice < regularPrice;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (defaultVariant) {
      addItem(product, defaultVariant, 1);
    }
  };

  return (
    <div className="luxury-card rounded-xl overflow-hidden flex flex-col group relative border border-[#1A2624] hover:border-[#66D9C5]/50 transition-all duration-300">
      {/* Visual Image Container */}
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] bg-[#0E1212] overflow-hidden">
        <img
          src={primaryImage}
          alt={product.nameEn}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} flex flex-col gap-1.5 z-10`}>
          {product.isBestseller && (
            <span className="badge-gold px-2.5 py-0.5 rounded-sm font-semibold shadow-sm">
              {isRtl ? 'الأكثر طلباً' : 'Bestseller'}
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-[#66D9C5] text-[#080A0A] text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm shadow-sm">
              {isRtl ? 'وصل حديثاً' : 'New Arrival'}
            </span>
          )}
          {hasSale && (
            <span className="bg-rose-500/90 text-white text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm shadow-sm">
              {isRtl ? 'عرض خاص' : 'Sale Offer'}
            </span>
          )}
        </div>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4">
          <button
            onClick={handleQuickAdd}
            className="btn-primary p-3 rounded-full shadow-xl hover:scale-110 transition-transform"
            title={`Quick add ${defaultVariant?.titleEn || 'Perfume'} to bag`}
            aria-label="Quick Add to Bag"
          >
            <ShoppingBag className="w-5 h-5 text-[#080A0A]" />
          </button>
          <span
            className="bg-[#141A19]/90 hover:bg-[#141A19] text-[#F5F2EB] p-3 rounded-full shadow-xl hover:scale-110 transition-transform border border-[#1A2624]"
            title="View Details"
          >
            <Eye className="w-5 h-5" />
          </span>
        </div>
      </Link>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Concentration & Category */}
          <div className="flex items-center justify-between text-[11px] tracking-wider text-[#9EABA7] uppercase mb-1.5">
            <span className="text-[#C6A66B] font-medium">{product.fragranceFamily}</span>
            <span>{product.concentration.replace(/_/g, ' ')}</span>
          </div>

          {/* Fragrance Title */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#F5F2EB] group-hover:text-[#66D9C5] transition-colors line-clamp-1">
              {product.nameEn}
            </h3>
          </Link>

          {/* Key Notes Snippet */}
          <p className="text-xs text-[#6C7A77] mt-1.5 line-clamp-1">
            <span className="text-[#9EABA7]">{isRtl ? 'النوتات:' : 'Notes:'}</span> {product.topNotes.slice(0, 2).join(', ')}, {product.heartNotes[0]}, {product.baseNotes[0]}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex text-[#C6A66B]">
              <Star className="w-3.5 h-3.5 fill-[#C6A66B]" />
            </div>
            <span className="text-xs font-semibold text-[#F5F2EB]">{product.rating.toFixed(1)}</span>
            <span className="text-[11px] text-[#6C7A77]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Size Selector Footer */}
        <div className="mt-4 pt-3 border-t border-[#1A2624] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-[#66D9C5]">
                {formatPrice(salePrice || regularPrice)}
              </span>
              {hasSale && (
                <span className="text-xs text-[#6C7A77] line-through">
                  {formatPrice(regularPrice)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#9EABA7] tracking-wider">
              {defaultVariant?.titleEn || '100ml'}
            </span>
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="text-xs tracking-wider uppercase text-[#D5D1C7] group-hover:text-[#66D9C5] transition-colors flex items-center gap-1 font-semibold"
          >
            <span>{isRtl ? 'اكتشف' : 'Explore'}</span>
            <span>{isRtl ? '←' : '→'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
