'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
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

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0E1212] border-l border-[#1A2624] text-[#F5F2EB] flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-6 border-b border-[#1A2624] flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold tracking-wide">Your Fragrance Bag</h2>
              <p className="text-xs text-[#9EABA7] tracking-wider uppercase mt-0.5">
                {itemCount} {itemCount === 1 ? 'Item' : 'Items'} Selected
              </p>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-[#9EABA7] hover:text-[#F5F2EB] rounded-full hover:bg-[#141A19] transition-colors"
              aria-label="Close Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-6 py-3.5 bg-[#141A19] border-b border-[#1A2624]">
            {freeShippingEligible ? (
              <div className="flex items-center gap-2 text-xs text-[#66D9C5] font-medium">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>You unlocked complimentary luxury delivery across Egypt!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#D5D1C7]">Add {formatPrice(amountNeededForFreeShipping)} for free shipping</span>
                  <span className="text-[#66D9C5] font-semibold">{freeShippingProgressPercentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#080A0A] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0B665D] to-[#66D9C5] transition-all duration-300"
                    style={{ width: `${freeShippingProgressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-[#9EABA7]">
                <div className="w-16 h-16 rounded-full bg-[#141A19] flex items-center justify-center mb-4 border border-[#1A2624]">
                  <Sparkles className="w-8 h-8 text-[#66D9C5]/50" />
                </div>
                <p className="font-serif text-lg text-[#F5F2EB]">Your bag is currently empty</p>
                <p className="text-xs text-[#9EABA7] mt-1 max-w-xs">
                  Explore our collection of rare essences and artisanal compositions.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 px-6 py-2.5 text-xs font-semibold tracking-wider uppercase text-[#080A0A] bg-[#66D9C5] hover:bg-[#82E2D1] rounded transition-all"
                >
                  Discover Fragrances
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-4 p-3 bg-[#111716] border border-[#1A2624] rounded-lg relative group"
                >
                  <div className="w-20 h-24 bg-[#080A0A] rounded overflow-hidden flex-shrink-0 relative border border-[#1A2624]">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-sm font-semibold text-[#F5F2EB] line-clamp-1 pr-4">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-[#6C7A77] hover:text-rose-400 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-[#C6A66B] mt-0.5">{item.variantTitle}</p>
                      <p className="text-[11px] text-[#6C7A77] mt-0.5 font-mono">SKU: {item.sku}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1A2624]">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-[#1A2624] bg-[#080A0A] rounded">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1 text-[#9EABA7] hover:text-[#66D9C5] transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-medium text-[#F5F2EB]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="p-1 text-[#9EABA7] hover:text-[#66D9C5] transition-colors"
                          disabled={item.quantity >= item.maxStock}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total for item */}
                      <span className="text-sm font-semibold text-[#66D9C5]">
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
            <div className="p-6 bg-[#0B0E0E] border-t border-[#1A2624] space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-[#9EABA7]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#F5F2EB]">{formatPrice(subtotalInPiasters)}</span>
                </div>
                <div className="flex justify-between text-[#9EABA7] text-xs">
                  <span>Shipping across Egypt</span>
                  <span className={freeShippingEligible ? 'text-[#66D9C5] font-semibold' : 'text-[#D5D1C7]'}>
                    {freeShippingEligible ? 'COMPLIMENTARY' : 'Calculated at checkout'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1A2624] flex justify-between items-center">
                <span className="font-serif text-base font-bold text-[#F5F2EB]">Estimated Total</span>
                <span className="font-serif text-lg font-bold text-[#66D9C5]">
                  {formatPrice(subtotalInPiasters)}
                </span>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full btn-primary py-3.5 px-4 rounded text-xs tracking-widest uppercase flex items-center justify-center gap-2"
              >
                <span>Proceed to Cash-on-Delivery Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#6C7A77] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C6A66B]" />
                <span>Pay in Cash Upon Inspection & Delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
