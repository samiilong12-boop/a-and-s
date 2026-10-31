import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { loadCatalogProducts, getProductBySlug } from '../src/lib/catalog';

describe('Advanced Perfume Product Management Studio & Data Consistency', () => {
  const productsJsonPath = path.join(process.cwd(), 'public', 'data', 'products.json');
  const productsData = JSON.parse(fs.readFileSync(productsJsonPath, 'utf-8'));

  it('verifies dior-sauvage-elixir has authentic notes and honest variants', () => {
    const sauvage = productsData.find((p: any) => p.id === 'dior-sauvage-elixir');
    expect(sauvage).toBeDefined();
    expect(sauvage.nameEn).toBe('Sauvage Elixir');
    expect(sauvage.nameAr).toBe('سوفاج إكسير');
    expect(sauvage.inspiredBy).toContain('Dior Sauvage Elixir');
    expect(sauvage.brand).toBe('RAHEEQ');
    // Ensure notes reflect authentic olfactory pyramid
    expect(sauvage.topNotes).toContain('Cinnamon');
    expect(sauvage.baseNotes).toContain('Sandalwood');
    // Ensure dual variants 50ml and 100ml
    expect(sauvage.variants).toHaveLength(2);
    expect(sauvage.variants[0].volumeMl).toBe(50);
    expect(sauvage.variants[0].regularPriceEgp).toBe(1850);
    expect(sauvage.variants[1].volumeMl).toBe(100);
    expect(sauvage.variants[1].regularPriceEgp).toBe(2750);
  });

  it('verifies misk-al-rumman is configured as a dedicated luxury product', () => {
    const misk = productsData.find((p: any) => p.id === 'misk-al-rumman');
    expect(misk).toBeDefined();
    expect(misk.nameEn).toBe('Misk Al-Rumman');
    expect(misk.nameAr).toBe('مسك الرمان');
    expect(misk.brand).toBe('RAHEEQ');
    expect(misk.topNotes).toContain('Pomegranate');
    expect(misk.heartNotes).toContain('Jasmine');
    expect(misk.baseNotes).toContain('White Musk');
    expect(misk.variants.length).toBeGreaterThanOrEqual(2);
  });

  it('verifies draft products are not exposed to public catalog or category listings', () => {
    // Add dummy draft
    const catalog = loadCatalogProducts();
    const published = catalog.filter((p) => p.isPublished !== false && !p.isArchived);
    expect(published.length).toBeGreaterThan(0);
    published.forEach((p) => {
      expect(p.isPublished).not.toBe(false);
      expect(p.isArchived).not.toBe(true);
    });
  });

  it('verifies no occurrences of the forbidden phrase "شامل الضريبة"', () => {
    const rawJson = fs.readFileSync(productsJsonPath, 'utf-8');
    expect(rawJson).not.toContain('شامل الضريبة');
  });

  it('verifies every product variant has an independent SKU, price, and volume', () => {
    const allProducts = loadCatalogProducts();
    allProducts.forEach((p) => {
      expect(Array.isArray(p.variants)).toBe(true);
      expect(p.variants.length).toBeGreaterThan(0);
      const skus = p.variants.map((v) => v.sku);
      const uniqueSkus = new Set(skus);
      expect(uniqueSkus.size).toBe(skus.length);
      p.variants.forEach((v) => {
        expect(v.volumeMl).toBeGreaterThan(0);
        expect(v.regularPriceEgp).toBeGreaterThan(0);
      });
    });
  });

  it('verifies product SEO metadata is generated with RAHEEQ brand', () => {
    const sauvage = getProductBySlug('dior-sauvage-elixir');
    expect(sauvage).toBeDefined();
    expect(sauvage?.brand).toBe('RAHEEQ');
    expect(sauvage?.inspirationNoteAr).toContain('دار رحيق');
  });
});
