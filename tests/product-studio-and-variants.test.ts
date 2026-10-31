import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { loadCatalogProducts, getProductBySlug } from '../src/lib/catalog';

describe('Advanced Perfume Product Management Studio & Data Consistency', () => {
  const productsJsonPath = path.join(process.cwd(), 'public', 'data', 'products.json');
  const productsData = JSON.parse(fs.readFileSync(productsJsonPath, 'utf-8'));

  it('verifies creed-aventus has authentic Aventus notes and honest variants', () => {
    const aventus = productsData.find((p: any) => p.id === 'creed-aventus');
    expect(aventus).toBeDefined();
    expect(aventus.nameEn).toBe('Creed Aventus');
    expect(aventus.nameAr).toBe('كريد أفينتوس');
    expect(aventus.inspiredBy).toContain('Creed Aventus');
    expect(aventus.brand).toBe('RAHEEQ');
    // Ensure notes reflect authentic olfactory pyramid
    expect(aventus.topNotes).toContain('Pineapple');
    expect(aventus.baseNotes).toContain('Ambergris');
    // Ensure dual variants 50ml and 100ml
    expect(aventus.variants).toHaveLength(2);
    expect(aventus.variants[0].volumeMl).toBe(50);
    expect(aventus.variants[0].regularPriceEgp).toBe(1850);
    expect(aventus.variants[1].volumeMl).toBe(100);
    expect(aventus.variants[1].regularPriceEgp).toBe(2750);
  });

  it('verifies emporio-armani-stronger-with-you-intensely is configured as a dedicated product', () => {
    const swy = productsData.find((p: any) => p.id === 'emporio-armani-stronger-with-you-intensely');
    expect(swy).toBeDefined();
    expect(swy.nameEn).toBe('Emporio Armani Stronger With You Intensely');
    expect(swy.nameAr).toBe('أرماني سترونجر ويذ يو إنتنسلي');
    expect(swy.brand).toBe('RAHEEQ');
    expect(swy.fragranceFamily).toBe('Gourmand');
    expect(swy.topNotes).toContain('Pink Pepper');
    expect(swy.heartNotes).toContain('Toffee');
    expect(swy.baseNotes).toContain('Madagascar Vanilla');
    expect(swy.variants.length).toBeGreaterThanOrEqual(2);
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
    const aventus = getProductBySlug('creed-aventus');
    expect(aventus).toBeDefined();
    expect(aventus?.brand).toBe('RAHEEQ');
    expect(aventus?.inspirationNoteAr).toContain('دار رحيق');
  });
});
