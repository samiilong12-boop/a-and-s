import { describe, it, expect } from 'vitest';
import { FAMOUS_50_PERFUMES, getDemoBottleSvg } from '../src/lib/data/products';
import { loadCatalogProducts, CATEGORY_REGISTRY } from '../src/lib/catalog';
import fs from 'fs';
import path from 'path';

describe('SEO & Product Consistency Quality Assurance', () => {
  it('every product in authoritative catalog has brand RAHEEQ and valid name', () => {
    const products = loadCatalogProducts();
    expect(products.length).toBeGreaterThanOrEqual(10);

    for (const p of products) {
      expect(p.brand).toBe('RAHEEQ');
      expect(p.nameEn).toBeTruthy();
      expect(p.slug).toBeTruthy();
      // Ensure no fake ratings are present
      expect(p.rating).toBeUndefined();
      expect(p.reviewCount).toBeUndefined();
    }
  });

  it('FAMOUS_50_PERFUMES source of truth has no designer brand violations and no fake ratings', () => {
    for (const p of FAMOUS_50_PERFUMES) {
      expect(p.brand).toBe('RAHEEQ');
      expect(p.rating).toBeUndefined();
      expect(p.reviewCount).toBeUndefined();
    }
  });

  it('demo bottle SVG does not contain A AND S or 35% EXTRAIT hardcoded strings', () => {
    const svg = getDemoBottleSvg('Test Perfume', '#54d1b2');
    expect(svg).toContain('RAHEEQ');
    expect(svg).not.toContain('A AND S');
    expect(svg).not.toContain('35% EXTRAIT');
  });

  it('translation dictionary includes product.add_to_cart and all catalog keys', () => {
    const langFilePath = path.join(__dirname, '../src/context/LanguageContext.tsx');
    const content = fs.readFileSync(langFilePath, 'utf8');

    expect(content).toContain("'product.add_to_cart'");
    expect(content).toContain("'catalog.title'");
    expect(content).toContain("'catalog.search_placeholder'");
    expect(content).toContain("'catalog.filter_family'");
    expect(content).toContain("'cart.shipping'");
    expect(content).toContain("'cart.total'");
  });

  it('codebase contains zero occurrences of "شامل الضريبة"', () => {
    const srcDir = path.join(__dirname, '../src');
    
    function scanDir(dir: string): string[] {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          results = results.concat(scanDir(fullPath));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const files = scanDir(srcDir);
    for (const f of files) {
      const code = fs.readFileSync(f, 'utf8');
      expect(code.includes('شامل الضريبة')).toBe(false);
      expect(code.includes('شامل ضريبة')).toBe(false);
    }
  });

  it('all 7 category definitions exist with rich metadata and valid slugs', () => {
    expect(CATEGORY_REGISTRY.length).toBe(7);
    const expectedSlugs = ['woody', 'oriental', 'fresh-citrus', 'floral', 'leather-spice', 'gourmand', 'aromatic'];
    for (const s of expectedSlugs) {
      const found = CATEGORY_REGISTRY.find(c => c.slug === s);
      expect(found).toBeDefined();
      expect(found?.titleAr).toBeTruthy();
      expect(found?.metaDescAr).toBeTruthy();
    }
  });
});
