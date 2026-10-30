'use client';

import React from 'react';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Sparkles, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/currency';

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotalInPiasters,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    freeShippingEligible,
    amountNeededForFreeShipping,
    freeShippingProgressPercentage,
  } = useCart();

  const { t, isRtl } = useLanguage();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Container (RTL / LTR responsive, full width on mobile, max-w-md on desktop) */}
      <div className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'right-0'} w-full max-w-full sm:max-w-md flex justify-end z-50 pointer-events-none`}>
        <div className="w-full sm:w-[440px] max-w-full bg-[#F7F5EE] border-s border-[#E7E3D6] text-[#080A0A] flex flex-col shadow-2xl relative pointer-events-auto h-full overflow-hidden">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-[#E7E3D6] bg-white flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold tracking-wide text-[#080A0A]">{t('cart.bag_title')}</h2>
              <p className="text-xs text-[#788784] tracking-wider uppercase mt-0.5 font-bold">
                {itemCount} {t('cart.items')}
              </p>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-[#788784] hover:text-[#080A0A] rounded-full hover:bg-[#FAF9F5] transition-colors cursor-pointer"
              aria-label="Close Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Service & Delivery Reassurance */}
          <div className="px-4 sm:px-6 py-2.5 bg-[#FAF9F5] border-b border-[#E7E3D6] flex items-center justify-between text-xs text-[#4A5553] flex-wrap gap-1">
            <span className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00bc7d] shrink-0" />
              <span>{isRtl ? 'الدفع كاش عند الاستلام بعد المعاينة' : 'Cash on Delivery with Inspection'}</span>
            </span>
            <span className="text-[#00bc7d] font-bold text-[11px] shrink-0">• {isRtl ? 'القاهرة وجميع المحافظات' : 'All Egypt'}</span>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-[#788784]">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 border border-[#E7E3D6] shadow-xs">
                  <ShoppingBag className="w-8 h-8 text-[#2DD4BF]" />
                </div>
                <p className="font-serif text-lg font-bold text-[#080A0A]">{t('cart.empty')}</p>
                <p className="text-xs text-[#4A5553] mt-1 max-w-xs leading-relaxed">
                  {t('cart.empty_desc')}
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 btn-turquoise px-6 py-3 text-xs font-bold tracking-wider uppercase rounded-xl shadow-lg cursor-pointer"
                >
                  {isRtl ? 'استكشف تشكيلة العطور' : 'Discover Fragrances'}
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-3 sm:gap-4 p-3 sm:p-3.5 bg-white border border-[#E7E3D6] rounded-2xl relative shadow-xs hover:border-[#2DD4BF] transition-colors"
                >
                  <div className="w-20 h-24 bg-[#FAF9F5] rounded-xl overflow-hidden flex-shrink-0 relative border border-[#E7E3D6]">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-serif text-sm font-bold text-[#080A0A] line-clamp-1 truncate">
                          {isRtl ? (item.productNameAr || item.productName) : item.productName}
                        </h4>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-[#788784] hover:text-rose-600 p-1 transition-colors shrink-0 cursor-pointer"
                          title="حذف العطر"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {isRtl && item.productNameAr && item.productNameAr !== item.productName && (
                        <p className="text-[10px] text-[#788784] font-mono -mt-0.5 truncate">
                          {item.productName}
                        </p>
                      )}
                      <p className="text-xs text-[#C6A66B] font-semibold mt-0.5">
                        {isRtl ? (item.variantTitleAr || `${item.volumeMl} مل إكستري دي بارفام`) : item.variantTitle}
                      </p>
                      <p className="text-[11px] text-[#788784] mt-0.5 font-mono truncate">SKU: {item.sku}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E7E3D6] gap-2">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-[#E7E3D6] bg-[#FAF9F5] rounded-lg shrink-0">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1.5 text-[#4A5553] hover:text-[#080A0A] transition-colors cursor-pointer"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-[#080A0A] font-mono">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="p-1.5 text-[#4A5553] hover:text-[#080A0A] transition-colors cursor-pointer"
                          disabled={item.quantity >= item.maxStock}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total for item */}
                      <span className="text-sm font-extrabold text-[#0D9488] font-mono shrink-0 whitespace-nowrap">
                        {formatPrice(item.unitPriceInPiasters * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 bg-white border-t border-[#E7E3D6] space-y-3.5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center text-[#4A5553] text-xs">
                  <span>{t('cart.subtotal')}</span>
                  <span className="font-mono font-bold text-sm text-[#080A0A]">{formatPrice(subtotalInPiasters)}</span>
                </div>
                <div className="flex justify-between items-center text-[#4A5553] text-xs">
                  <span>{t('cart.shipping_egypt')}</span>
                  <span className="text-[#00bc7d] font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {isRtl ? 'حسب المحافظة عند إتمام الطلب' : 'Calculated at checkout'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E7E3D6] flex justify-between items-baseline">
                <span className="font-serif text-base font-bold text-[#080A0A]">
                  {isRtl ? 'المجموع التقديري' : 'Estimated Total'}
                </span>
                <span className="font-serif text-xl font-extrabold text-[#0D9488] whitespace-nowrap shrink-0">
                  {formatPrice(subtotalInPiasters)}
                </span>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full bg-gradient-to-r from-[#00bc7d] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#5EEAD4] text-[#080A0A] py-3.5 sm:py-4 px-4 rounded-2xl text-xs font-extrabold tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>{t('cart.checkout_cta')}</span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#788784] pt-0.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00bc7d] shrink-0" />
                <span>{isRtl ? 'ادفع نقداً بعد المعاينة عند استلام الطرد' : 'Pay in Cash Upon Inspection & Delivery'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
