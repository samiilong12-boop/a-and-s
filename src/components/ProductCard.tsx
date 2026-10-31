'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Eye, Star, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/currency';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  getLocalizedProductName,
  getLocalizedFragranceFamily,
  getLocalizedConcentration,
  getLocalizedOlfactoryNote,
} from '@/lib/fragrance-translations';

interface ProductCardProps {
  product: Product;
  onExpressOrder?: (product: Product) => void;
}

export function ProductCard({ product, onExpressOrder }: ProductCardProps) {
  const { addItem } = useCart();
  const { isRtl } = useLanguage();
  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    product.imageUrl ||
    '';
  const defaultVariant = product.variants[0];

  const regularPrice =
    defaultVariant?.regularPriceInPiasters ??
    ((defaultVariant?.regularPriceEgp ?? 0) * 100);
  const salePrice =
    defaultVariant?.salePriceInPiasters ??
    (defaultVariant?.salePriceEgp ? defaultVariant.salePriceEgp * 100 : null);
  const hasSale = salePrice !== null && salePrice !== undefined && salePrice < regularPrice;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (defaultVariant) {
      addItem(product, defaultVariant, 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col group relative border border-[#E6E1D5] hover:border-[#2DD4BF] shadow-sm hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-1.5">
      {/* Visual Image Container */}
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] bg-[#FAF8F4] overflow-hidden">
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
            <span className="shimmer-badge bg-[#080A0A] text-[#54d1b2] border border-[#54d1b2]/40 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm shadow-sm">
              {isRtl ? 'وصل حديثاً' : 'New Arrival'}
            </span>
          )}
          {hasSale && (
            <span className="bg-rose-700 text-white text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm shadow-sm">
              {isRtl ? 'عرض خاص' : 'Sale Offer'}
            </span>
          )}
        </div>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4 backdrop-blur-[2px]">
          <button
            onClick={handleQuickAdd}
            className="bg-[#080A0A] hover:bg-[#00bc7d] text-white hover:text-[#080A0A] p-3 rounded-full shadow-2xl hover:scale-110 transition-all border border-[#54d1b2]/40"
            title={`Quick add ${defaultVariant?.titleEn || 'Perfume'} to bag`}
            aria-label="Quick Add to Bag"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
          <span
            className="bg-white hover:bg-[#FAF8F4] text-[#080A0A] p-3 rounded-full shadow-2xl hover:scale-110 transition-all border border-[#E6E1D5]"
            title="View Details"
          >
            <Eye className="w-5 h-5" />
          </span>
        </div>
      </Link>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Concentration & Category */}
          <div className="flex items-center justify-between text-[11px] tracking-wider uppercase mb-1.5 font-bold">
            <span className="text-[#00bc7d] font-mono">{getLocalizedFragranceFamily(product.fragranceFamily, isRtl)}</span>
            <span className="text-[#576563] text-[10px]">{getLocalizedConcentration(product.concentration, isRtl)}</span>
          </div>

          {/* Fragrance Title */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#080A0A] group-hover:text-[#00bc7d] transition-colors line-clamp-1">
              {getLocalizedProductName(product, isRtl)}
            </h3>
            {isRtl && product.nameEn && product.nameAr && product.nameEn !== product.nameAr && (
              <span className="text-[11px] text-[#788784] font-mono block -mt-0.5 line-clamp-1">
                {product.nameEn}
              </span>
            )}
          </Link>

          {/* Key Notes Snippet */}
          <p className="text-xs text-[#576563] mt-1.5 line-clamp-1">
            <span className="font-semibold text-[#080A0A]">{isRtl ? 'النوتات:' : 'Notes:'}</span>{' '}
            {product.topNotes?.[0] ? getLocalizedOlfactoryNote(product.topNotes[0], isRtl) : ''}
            {product.heartNotes?.[0] ? `، ${getLocalizedOlfactoryNote(product.heartNotes[0], isRtl)}` : ''}
            {product.baseNotes?.[0] ? `، ${getLocalizedOlfactoryNote(product.baseNotes[0], isRtl)}` : ''}
          </p>

          {/* Quality & Longevity Trust Badge */}
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0D9488] bg-[#2DD4BF]/10 px-2 py-0.5 rounded">
              <Sparkles className="w-3 h-3 text-[#0D9488]" />
              <span>{getLocalizedConcentration(product.concentration, isRtl)}</span>
            </span>
            <span className="text-[11px] text-[#788784] font-medium">
              {isRtl ? '• معاينة عند الباب' : '• Doorstep COD'}
            </span>
          </div>
        </div>

        {/* Price & Size Selector Footer */}
        <div className="mt-3 pt-3 border-t border-[#E6E1D5] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-extrabold text-[#080A0A]">
                {formatPrice(salePrice || regularPrice)}
              </span>
              {salePrice && salePrice < regularPrice && (
                <span className="text-xs text-[#788784] line-through font-mono">
                  {formatPrice(regularPrice)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#00bc7d] font-bold tracking-wider block">
              {isRtl ? 'ثبات +14 ساعة • دفع بعد الفحص' : '+14h Sillage • Cash on Inspection'}
            </span>
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="text-xs tracking-wider uppercase text-[#080A0A] group-hover:text-[#00bc7d] transition-colors flex items-center gap-1 font-bold group-hover:translate-x-1 duration-200"
          >
            <span>{isRtl ? 'تفاصيل' : 'Details'}</span>
            <span>{isRtl ? '←' : '→'}</span>
          </Link>
        </div>

        {/* Commercial Fast Purchase Action Bar */}
        <div className="mt-2.5 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onExpressOrder) {
                onExpressOrder(product);
              } else if (defaultVariant) {
                addItem(product, defaultVariant, 1);
              }
            }}
            className="flex-1 bg-[#080A0A] hover:bg-[#00bc7d] text-white hover:text-[#080A0A] font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>⚡ {isRtl ? 'طلب سريع كاش' : 'Quick Order'}</span>
          </button>

          <button
            onClick={handleQuickAdd}
            className="p-2.5 rounded-xl border border-slate-300 hover:border-[#00bc7d] hover:bg-teal-50 text-slate-700 hover:text-teal-800 transition-colors cursor-pointer"
            title="أضف إلى سلة التسوق"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
