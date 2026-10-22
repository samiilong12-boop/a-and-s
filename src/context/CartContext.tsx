'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product, ProductVariant } from '@/types';
import { FREE_SHIPPING_THRESHOLD_PIASTERS } from '@/lib/currency';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotalInPiasters: number;
  isCartOpen: boolean;
  freeShippingEligible: boolean;
  amountNeededForFreeShipping: number;
  freeShippingProgressPercentage: number;
  setIsCartOpen: (open: boolean) => void;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'a_and_s_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to storage', e);
      }
    }
  }, [items, isHydrated]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotalInPiasters = items.reduce(
    (sum, item) => sum + item.unitPriceInPiasters * item.quantity,
    0
  );

  const freeShippingEligible = subtotalInPiasters >= FREE_SHIPPING_THRESHOLD_PIASTERS;
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_PIASTERS - subtotalInPiasters);
  const freeShippingProgressPercentage = Math.min(
    100,
    Math.round((subtotalInPiasters / FREE_SHIPPING_THRESHOLD_PIASTERS) * 100)
  );

  const addItem = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.variantId === variant.id);
      const unitPrice = variant.salePriceInPiasters || variant.regularPriceInPiasters;
      const primaryImg = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || '';

      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, variant.stockQuantity);
        return prev.map((item) =>
          item.variantId === variant.id ? { ...item, quantity: newQty } : item
        );
      } else {
        return [
          ...prev,
          {
            variantId: variant.id,
            productId: product.id,
            productName: product.nameEn,
            variantTitle: variant.titleEn,
            volumeMl: variant.volumeMl,
            sku: variant.sku,
            unitPriceInPiasters: unitPrice,
            image: primaryImg,
            quantity: Math.min(quantity, variant.stockQuantity),
            maxStock: variant.stockQuantity,
          },
        ];
      }
    });
    setIsCartOpen(true);
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.variantId === variantId) {
          return { ...item, quantity: Math.min(quantity, item.maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotalInPiasters,
        isCartOpen,
        freeShippingEligible,
        amountNeededForFreeShipping,
        freeShippingProgressPercentage,
        setIsCartOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
