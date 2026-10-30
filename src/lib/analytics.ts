/**
 * Google Analytics 4 (GA4) Standard Ecommerce Event Helpers
 * Strictly following Google Developers GA4 Ecommerce specification:
 * https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
 */

import { Product, ProductVariant } from '@/types';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

function safeGtag(eventName: string, params: Record<string, any>) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ecommerce: params,
      });
    }
  } catch (err) {
    // Non-blocking telemetry safe fallback
  }
}

/**
 * 1. view_item: Sent when a user views a product details page
 */
export function trackViewItem(product: Product, variant?: ProductVariant) {
  const activeVariant = variant || product.variants?.[0];
  const priceEgp = (activeVariant?.regularPriceInPiasters ? activeVariant.regularPriceInPiasters / 100 : activeVariant?.regularPriceEgp) || 1850;

  safeGtag('view_item', {
    currency: 'EGP',
    value: priceEgp,
    items: [
      {
        item_id: activeVariant?.sku || product.slug || product.id,
        item_name: product.nameEn,
        item_brand: 'RAHEEQ',
        item_category: product.fragranceFamily,
        item_variant: `${activeVariant?.volumeMl || 100}ml`,
        price: priceEgp,
        quantity: 1,
      },
    ],
  });
}

/**
 * 2. add_to_cart: Sent when a user adds a fragrance to their shopping bag
 */
export function trackAddToCart(product: Product, variant: ProductVariant, quantity: number = 1) {
  const priceEgp = (variant.regularPriceInPiasters ? variant.regularPriceInPiasters / 100 : variant.regularPriceEgp) || 1850;

  safeGtag('add_to_cart', {
    currency: 'EGP',
    value: priceEgp * quantity,
    items: [
      {
        item_id: variant.sku || `${product.id}-${variant.volumeMl}ml`,
        item_name: product.nameEn,
        item_brand: 'RAHEEQ',
        item_category: product.fragranceFamily,
        item_variant: `${variant.volumeMl}ml`,
        price: priceEgp,
        quantity,
      },
    ],
  });
}

/**
 * 3. begin_checkout: Sent when customer proceeds to checkout
 */
export function trackBeginCheckout(items: Array<{ product: Product; variant: ProductVariant; quantity: number }>, totalEgp: number) {
  safeGtag('begin_checkout', {
    currency: 'EGP',
    value: totalEgp,
    items: items.map(({ product, variant, quantity }) => {
      const priceEgp = (variant.regularPriceInPiasters ? variant.regularPriceInPiasters / 100 : variant.regularPriceEgp) || 0;
      return {
        item_id: variant.sku || `${product.id}-${variant.volumeMl}ml`,
        item_name: product.nameEn,
        item_brand: 'RAHEEQ',
        item_category: product.fragranceFamily,
        item_variant: `${variant.volumeMl}ml`,
        price: priceEgp,
        quantity,
      };
    }),
  });
}

/**
 * 4. purchase: Sent ONLY on the verified order confirmation receipt page
 */
export function trackPurchase(order: {
  orderNumber: string;
  totalInPiasters?: number;
  shippingInPiasters?: number;
  items?: any[];
}) {
  const totalEgp = (order.totalInPiasters ? order.totalInPiasters / 100 : 0);
  const shippingEgp = (order.shippingInPiasters ? order.shippingInPiasters / 100 : 0);

  safeGtag('purchase', {
    transaction_id: order.orderNumber,
    value: totalEgp,
    currency: 'EGP',
    shipping: shippingEgp,
    items: (order.items || []).map((item) => ({
      item_id: item.sku || item.variantId || item.productId || 'RHQ-ITEM',
      item_name: item.productNameEn || item.productNameAr || item.title || 'RAHEEQ Fragrance',
      item_brand: 'RAHEEQ',
      price: (item.unitPriceInPiasters ? item.unitPriceInPiasters / 100 : 0),
      quantity: item.quantity || 1,
    })),
  });
}
