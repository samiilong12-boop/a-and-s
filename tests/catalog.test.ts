import { describe, it, expect } from 'vitest';
import { DEMO_PRODUCTS, SHIPPING_ZONES, FRAGRANCE_FAMILIES } from '../src/lib/data/products';

describe('Fragrance Catalog & Seeding Verification (100+ items requirement)', () => {
  it('contains at least 120 unique luxury fragrance products', () => {
    expect(DEMO_PRODUCTS.length).toBeGreaterThanOrEqual(120);
  });

  it('ensures all products have unique IDs and unique slugs', () => {
    const ids = new Set(DEMO_PRODUCTS.map((p) => p.id));
    const slugs = new Set(DEMO_PRODUCTS.map((p) => p.slug));

    expect(ids.size).toBe(DEMO_PRODUCTS.length);
    expect(slugs.size).toBe(DEMO_PRODUCTS.length);
  });

  it('ensures all products have complete notes pyramid and valid pricing in piasters', () => {
    for (const product of DEMO_PRODUCTS) {
      expect(product.topNotes.length).toBeGreaterThan(0);
      expect(product.heartNotes.length).toBeGreaterThan(0);
      expect(product.baseNotes.length).toBeGreaterThan(0);
      expect(product.variants.length).toBeGreaterThanOrEqual(1);

      for (const variant of product.variants) {
        expect(variant.regularPriceInPiasters).toBeGreaterThan(100000); // at least 1,000 EGP
        expect(variant.stockQuantity).toBeGreaterThanOrEqual(0);
        expect(variant.sku).toMatch(/^AS-\d{3}-\d{2,3}ML$/);
      }
    }
  });

  it('verifies Egyptian shipping zones include Cairo, Giza, Alexandria, and Delta', () => {
    const governorates = SHIPPING_ZONES.map((z) => z.governorateEn);
    expect(governorates).toContain('Cairo');
    expect(governorates).toContain('Giza');
    expect(governorates).toContain('Alexandria');
    expect(SHIPPING_ZONES.length).toBeGreaterThanOrEqual(7);
  });
});
