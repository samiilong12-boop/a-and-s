import { describe, it, expect } from 'vitest';
import { formatPrice, egpToPiasters, piastersToEgp, calculateOrderTotals, FREE_SHIPPING_THRESHOLD_PIASTERS } from '../src/lib/currency';

describe('Financial Calculations & Currency Engine (E1)', () => {
  it('formats integer piasters into EGP string correctly', () => {
    expect(formatPrice(240000)).toBe('2,400.00 EGP');
    expect(formatPrice(100000)).toBe('1,000.00 EGP');
    expect(formatPrice(5500)).toBe('55.00 EGP');
    expect(formatPrice(0)).toBe('0.00 EGP');
  });

  it('converts EGP to piasters without float rounding errors', () => {
    expect(egpToPiasters(2400)).toBe(240000);
    expect(egpToPiasters(1850.5)).toBe(185050);
    expect(egpToPiasters('3500')).toBe(350000);
  });

  it('converts piasters to EGP decimal correctly', () => {
    expect(piastersToEgp(240000)).toBe(2400);
    expect(piastersToEgp(5500)).toBe(55);
  });

  it('qualifies for complimentary shipping when subtotal >= 1,000 EGP', () => {
    const result = calculateOrderTotals({
      subtotalInPiasters: 120000, // 1,200.00 EGP
      baseShippingInPiasters: 5500, // 55.00 EGP (Cairo)
    });

    expect(result.isEligibleForFreeShipping).toBe(true);
    expect(result.shippingInPiasters).toBe(0);
    expect(result.totalInPiasters).toBe(120000);
    expect(result.amountNeededForFreeShipping).toBe(0);
  });

  it('applies governorate shipping rate when subtotal < 1,000 EGP', () => {
    const result = calculateOrderTotals({
      subtotalInPiasters: 60000, // 600.00 EGP
      baseShippingInPiasters: 6500, // 65.00 EGP (Alexandria)
    });

    expect(result.isEligibleForFreeShipping).toBe(false);
    expect(result.shippingInPiasters).toBe(6500);
    expect(result.totalInPiasters).toBe(66500);
    expect(result.amountNeededForFreeShipping).toBe(40000); // 400.00 EGP needed
  });
});
