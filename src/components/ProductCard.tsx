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
    <div className="bg-white rounded-xl overflow-hidden flex flex-col group relative border border-[#E8E6DF] hover:border-[#B8934A] shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Visual Image Container */}
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] bg-[#F7F6F2] overflow-hidden">
        <img
          src={primaryImage}
          alt={product.nameEn}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} flex flex-col gap-1.5 z-10`}>
          {product.isBestseller && (
            <span className="badge-gold px-2.5 py-0.5 rounded-sm font-bold shadow-sm">
              {isRtl ? 'الأكثر طلباً' : 'Bestseller'}
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-[#0A0D0D] text-[#FFFFFF] text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm shadow-sm">
              {isRtl ? 'وصل حديثاً' : 'New Arrival'}
            </span>
          )}
          {hasSale && (
            <span className="bg-rose-600 text-white text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm shadow-sm">
              {isRtl ? 'عرض خاص' : 'Sale Offer'}
            </span>
          )}
        </div>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4">
          <button
            onClick={handleQuickAdd}
            className="bg-[#0A0D0D] hover:bg-[#B8934A] text-white p-3 rounded-full shadow-xl hover:scale-110 transition-all"
            title={`Quick add ${defaultVariant?.titleEn || 'Perfume'} to bag`}
            aria-label="Quick Add to Bag"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
          <span
            className="bg-white hover:bg-slate-50 text-[#0A0D0D] p-3 rounded-full shadow-xl hover:scale-110 transition-all border border-[#E8E6DF]"
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
          <div className="flex items-center justify-between text-[11px] tracking-wider text-[#788784] uppercase mb-1.5 font-bold">
            <span className="text-[#8C6A23]">{product.fragranceFamily}</span>
            <span>{product.concentration.replace(/_/g, ' ')}</span>
          </div>

          {/* Fragrance Title */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#0A0D0D] group-hover:text-[#0B665D] transition-colors line-clamp-1">
              {product.nameEn}
            </h3>
          </Link>

          {/* Key Notes Snippet */}
          <p className="text-xs text-[#52605D] mt-1.5 line-clamp-1">
            <span className="font-semibold text-[#0A0D0D]">{isRtl ? 'النوتات:' : 'Notes:'}</span> {product.topNotes.slice(0, 2).join(', ')}, {product.heartNotes[0]}, {product.baseNotes[0]}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex text-[#B8934A]">
              <Star className="w-3.5 h-3.5 fill-[#B8934A]" />
            </div>
            <span className="text-xs font-bold text-[#0A0D0D]">{product.rating.toFixed(1)}</span>
            <span className="text-[11px] text-[#788784]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Size Selector Footer */}
        <div className="mt-4 pt-3 border-t border-[#E8E6DF] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-[#0A0D0D]">
                {formatPrice(salePrice || regularPrice)}
              </span>
              {hasSale && (
                <span className="text-xs text-[#788784] line-through">
                  {formatPrice(regularPrice)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#788784] font-medium tracking-wider">
              {defaultVariant?.titleEn || '100ml'}
            </span>
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="text-xs tracking-wider uppercase text-[#0B665D] group-hover:text-[#084942] transition-colors flex items-center gap-1 font-bold"
          >
            <span>{isRtl ? 'اكتشف' : 'Explore'}</span>
            <span>{isRtl ? '←' : '→'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
