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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className={`fixed inset-y-0 ${isRtl ? 'left-0 pr-10' : 'right-0 pl-10'} max-w-full flex`}>
        <div className={`w-screen max-w-md bg-[#F7F5EE] ${isRtl ? 'border-r' : 'border-l'} border-[#E7E3D6] text-[#080A0A] flex flex-col shadow-2xl`}>
          
          {/* Header */}
          <div className="p-6 border-b border-[#E7E3D6] bg-white flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold tracking-wide text-[#080A0A]">{t('cart.bag_title')}</h2>
              <p className="text-xs text-[#788784] tracking-wider uppercase mt-0.5 font-bold">
                {itemCount} {t('cart.items')}
              </p>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-[#788784] hover:text-[#080A0A] rounded-full hover:bg-[#FAF9F5] transition-colors"
              aria-label="Close Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Service & Delivery Reassurance */}
          <div className="px-6 py-2.5 bg-[#FAF9F5] border-b border-[#E7E3D6] flex items-center justify-between text-xs text-[#4A5553]">
            <span className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00bc7d]" />
              <span>{isRtl ? 'الدفع كاش عند الاستلام بعد المعاينة' : 'Cash on Delivery with Inspection'}</span>
            </span>
            <span className="text-[#00bc7d] font-bold text-[11px]">• {isRtl ? 'القاهرة وجميع المحافظات' : 'All Egypt'}</span>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                  className="mt-6 btn-turquoise px-6 py-3 text-xs font-bold tracking-wider uppercase rounded-xl shadow-lg"
                >
                  {isRtl ? 'استكشف تشكيلة العطور' : 'Discover Fragrances'}
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-4 p-3.5 bg-white border border-[#E7E3D6] rounded-2xl relative shadow-xs hover:border-[#2DD4BF] transition-colors"
                >
                  <div className="w-20 h-24 bg-[#FAF9F5] rounded-xl overflow-hidden flex-shrink-0 relative border border-[#E7E3D6]">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-sm font-bold text-[#080A0A] line-clamp-1 pr-4">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-[#788784] hover:text-rose-600 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-[#C6A66B] font-semibold mt-0.5">{item.variantTitle}</p>
                      <p className="text-[11px] text-[#788784] mt-0.5 font-mono">SKU: {item.sku}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E7E3D6]">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-[#E7E3D6] bg-[#FAF9F5] rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1 text-[#4A5553] hover:text-[#080A0A] transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#080A0A]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="p-1 text-[#4A5553] hover:text-[#080A0A] transition-colors"
                          disabled={item.quantity >= item.maxStock}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total for item */}
                      <span className="text-sm font-bold text-[#0D9488]">
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
            <div className="p-6 bg-white border-t border-[#E7E3D6] space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-[#4A5553] text-xs">
                  <span>{t('cart.subtotal')}</span>
                  <span className="font-mono font-bold text-[#080A0A]">{formatPrice(subtotalInPiasters)}</span>
                </div>
                <div className="flex justify-between text-[#4A5553] text-xs">
                  <span>{t('cart.shipping_egypt')}</span>
                  <span className="text-[#080A0A] font-semibold">
                    {isRtl ? 'حسب المحافظة عند إتمام الطلب' : 'Calculated at checkout'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E7E3D6] flex justify-between items-baseline">
                <span className="font-serif text-base font-bold text-[#080A0A]">
                  {isRtl ? 'المجموع التقديري' : 'Estimated Total'}
                </span>
                <span className="font-serif text-xl font-bold text-[#0D9488]">
                  {formatPrice(subtotalInPiasters)}
                </span>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full btn-turquoise py-4 px-4 rounded-2xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>{t('cart.checkout_cta')}</span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </Link>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#788784] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>{isRtl ? 'ادفع نقداً بعد المعاينة عند استلام الطرد' : 'Pay in Cash Upon Inspection & Delivery'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
