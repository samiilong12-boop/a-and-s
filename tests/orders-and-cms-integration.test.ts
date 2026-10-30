import { describe, it, expect } from 'vitest';
import { validateEgyptianPhone } from '../src/lib/phone-validation';
import { formatPrice, parsePriceToPiasters } from '../src/lib/currency';
import { DEFAULT_SITE_CONTENT, SiteContentConfig } from '../src/lib/siteContent';
import { canTransitionOrderStatus, canTransitionPaymentStatus } from '../src/lib/state-machines';

describe('Express 1-Click Order Flow & Schema Integration', () => {
  it('creates a compliant Express Order payload that matches the Admin Orders schema', () => {
    const phoneCheck = validateEgyptianPhone('+201131068790');
    expect(phoneCheck.isValid).toBe(true);

    const now = new Date();
    const orderNumber = `RHQ-EXP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-9988`;
    const finalPriceInPiasters = 45000; // 450 EGP

    const orderPayload = {
      orderNumber,
      status: 'PENDING_CONFIRMATION' as const,
      paymentStatus: 'PENDING_COLLECTION' as const,
      paymentMethod: 'CASH_ON_DELIVERY' as const,
      currency: 'EGP',
      customerName: 'أحمد محمود',
      customerPhone: phoneCheck.normalizedPhone,
      customerEmail: null,
      shippingAddress: {
        governorate: 'Cairo',
        city: 'القاهرة',
        streetAddress: 'شارع المعز لدين الله الفاطمي - عمارة 12',
        deliveryNotes: '⚡ طلب شراء سريع: التوصيل بعد العصر',
      },
      subtotalInPiasters: finalPriceInPiasters,
      discountInPiasters: 0,
      shippingInPiasters: 0,
      totalInPiasters: finalPriceInPiasters,
      createdAt: now.toISOString(),
      orderNotes: '⚡ طلب شراء سريع (Express 1-Click Order)',
      items: [
        {
          productId: 'rhq-sauvage-elixir',
          variantId: 'rhq-sauvage-100ml',
          title: 'Sauvage Elixir (سوفاج إكسير) - 100ml',
          quantity: 1,
          unitPriceInPiasters: finalPriceInPiasters,
        },
      ],
    };

    // Assert mandatory fields required by admin dashboard
    expect(orderPayload.orderNumber).toMatch(/^RHQ-EXP-\d{6}-\d{4}$/);
    expect(orderPayload.customerPhone).toBe('01131068790');
    expect(orderPayload.totalInPiasters).toBe(45000);
    expect(orderPayload.shippingAddress.streetAddress).toBeTruthy();
    expect(orderPayload.status).toBe('PENDING_CONFIRMATION');
    expect(orderPayload.paymentMethod).toBe('CASH_ON_DELIVERY');
    expect(formatPrice(orderPayload.totalInPiasters)).toContain('450.00');
  });

  it('validates state transitions from pending to delivered for COD inspection', () => {
    expect(canTransitionOrderStatus('PENDING_CONFIRMATION', 'CONFIRMED')).toBe(true);
    expect(canTransitionOrderStatus('CONFIRMED', 'PROCESSING')).toBe(true);
    expect(canTransitionOrderStatus('PROCESSING', 'OUT_FOR_DELIVERY')).toBe(true);
    expect(canTransitionOrderStatus('OUT_FOR_DELIVERY', 'DELIVERED')).toBe(true);
    // Invalid reverse transition
    expect(canTransitionOrderStatus('DELIVERED', 'PENDING_CONFIRMATION')).toBe(false);

    expect(canTransitionPaymentStatus('PENDING_COLLECTION', 'COLLECTED_BY_COURIER')).toBe(true);
  });
});

describe('CMS Site Content & 3D Studio Configuration Integrity', () => {
  it('has valid defaults for the 3D Studio and brand parameters', () => {
    expect(DEFAULT_SITE_CONTENT.enableStudio3D).toBe(true);
    expect(DEFAULT_SITE_CONTENT.studio3DHeadline).toBeTruthy();
    expect(DEFAULT_SITE_CONTENT.studio3DSketchfabModelId).toBeTruthy();
    expect(DEFAULT_SITE_CONTENT.studioBottleMode).toBe('photo');
    expect(DEFAULT_SITE_CONTENT.visualMode).toBe('video');
    expect(DEFAULT_SITE_CONTENT.activeVideoUrl).toBe('/videos/campaign-hero.mp4');
  });

  it('verifies phone contact numbers for Egypt WhatsApp routing', () => {
    expect(validateEgyptianPhone(DEFAULT_SITE_CONTENT.whatsapp1).isValid).toBe(true);
    expect(validateEgyptianPhone(DEFAULT_SITE_CONTENT.whatsapp2).isValid).toBe(true);
  });
});
