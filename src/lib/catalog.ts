import fs from 'fs';
import path from 'path';
import os from 'os';
import { Product } from '../types';
import { FAMOUS_50_PERFUMES } from './data/products';
import { CategoryMeta, CATEGORY_REGISTRY } from './data/categories';

export { CATEGORY_REGISTRY };
export type { CategoryMeta };

declare global {
  var __PRODUCTS_CATALOG__: Product[] | undefined;
}

const tmpFilePath = path.join(os.tmpdir(), 'raheeq-products.json');
const publicFilePath = path.join(process.cwd(), 'public', 'data', 'products.json');

/**
 * Normalizes an inspired product to guarantee legal compliance,
 * brand honesty, and Extrait de Parfum craftsmanship.
 */
function normalizeCompliantProduct(p: any): Product {
  const brand = 'RAHEEQ';
  const originalBrand = (p.brand && p.brand !== 'RAHEEQ' && !p.brand.includes('رحيق')) ? p.brand : null;
  const originalName = p.nameEn || '';

  // Determine inspiration reference
  let inspiredBy = p.inspiredBy || '';
  if (!inspiredBy && originalBrand) {
    inspiredBy = `${originalBrand} ${originalName}`.trim();
  }

  // Ensure clear, non-misleading Arabic name
  let nameAr = p.nameAr || originalName;
  if (inspiredBy && !nameAr.includes('مستوحى') && !nameAr.includes('طابع')) {
    nameAr = `رحيق ${nameAr.replace(/^عطر\s+/, '')} (مستوحى من طابع ${inspiredBy})`;
  }

  let nameEn = p.nameEn || '';
  if (inspiredBy && !nameEn.includes('Inspired') && !nameEn.startsWith('Raheeq')) {
    nameEn = `Raheeq ${nameEn} (Inspired by ${inspiredBy})`;
  }

  const inspirationNoteAr =
    p.inspirationNoteAr ||
    (inspiredBy
      ? `توليفة عطرية خاصة ومستقلة تصنعها دار رَحِيقْ (RAHEEQ) بتركيز نيش فاخر، مستوحاة من الهرم العطري لـ ${inspiredBy}. هذا العطر منتج مستقل تماماً ولا يمثل العلامة التجارية الأصلية أو يدعي أي تبعية لها.`
      : 'توليفة عطرية ملكية خاصة مصنوعة في معامل دار رَحِيقْ بالقاهرة بزيوت فرنسية نقية.');

  const inspirationNoteEn =
    p.inspirationNoteEn ||
    (inspiredBy
      ? `An independent artisanal creation by RAHEEQ Haute Parfumerie inspired by the olfactory profile of ${inspiredBy}. Not affiliated with or endorsed by the original brand trademark holders.`
      : 'Artisanal high-concentration perfume crafted with pure natural absolutes by RAHEEQ Haute Parfumerie.');

  // Normalize variants with honest pricing (no fake strikethrough multipliers)
  const variants = Array.isArray(p.variants) && p.variants.length > 0
    ? p.variants.map((v: any) => {
        const regEgp = Number(v.regularPriceEgp || (v.regularPriceInPiasters ? v.regularPriceInPiasters / 100 : 1850));
        const regPiasters = Number(v.regularPriceInPiasters || (regEgp * 100));
        return {
          ...v,
          regularPriceEgp: regEgp,
          regularPriceInPiasters: regPiasters,
          salePriceEgp: v.salePriceEgp ?? null,
          salePriceInPiasters: v.salePriceInPiasters ?? null,
        };
      })
    : [
        {
          id: `${p.id}-var-50`,
          sku: `RHQ-${(p.slug || p.id).toUpperCase().slice(0, 8)}-50`,
          volumeMl: 50,
          regularPriceEgp: 1850,
          regularPriceInPiasters: 185000,
          stockQuantity: 40,
          lowStockThreshold: 5,
        },
        {
          id: `${p.id}-var-100`,
          sku: `RHQ-${(p.slug || p.id).toUpperCase().slice(0, 8)}-100`,
          volumeMl: 100,
          regularPriceEgp: 2750,
          regularPriceInPiasters: 275000,
          stockQuantity: 50,
          lowStockThreshold: 5,
        },
      ];

  return {
    ...p,
    brand,
    inspiredBy,
    inspirationNoteAr,
    inspirationNoteEn,
    nameAr,
    nameEn,
    concentration: p.concentration || 'EXTRAIT_DE_PARFUM',
    rating: undefined,
    reviewCount: undefined,
    variants,
  };
}

/**
 * Loads the authoritative products catalog on server with caching
 */
export function loadCatalogProducts(): Product[] {
  // 1. Memory cache
  if (globalThis.__PRODUCTS_CATALOG__ && Array.isArray(globalThis.__PRODUCTS_CATALOG__) && globalThis.__PRODUCTS_CATALOG__.length > 0) {
    return globalThis.__PRODUCTS_CATALOG__;
  }

  let list: any[] = [];

  // 2. /tmp
  try {
    if (fs.existsSync(tmpFilePath)) {
      const data = fs.readFileSync(tmpFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch {}

  // 3. public/data/products.json
  if (list.length === 0) {
    try {
      if (fs.existsSync(publicFilePath)) {
        const data = fs.readFileSync(publicFilePath, 'utf-8');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
    } catch {}
  }

  // 4. Fallback to FAMOUS_50_PERFUMES
  if (list.length === 0) {
    list = FAMOUS_50_PERFUMES;
  }

  const normalized = list.map(normalizeCompliantProduct);
  globalThis.__PRODUCTS_CATALOG__ = normalized;
  return normalized;
}

/**
 * Finds a single product by slug, id, or normalized name
 */
export function getProductBySlug(slugInput: string): Product | null {
  if (!slugInput) return null;
  const decoded = decodeURIComponent(slugInput).toLowerCase().trim();
  const raw = slugInput.toLowerCase().trim();

  const products = loadCatalogProducts();
  const found = products.find((p) => {
    const s = (p.slug || '').toLowerCase();
    const id = (p.id || '').toLowerCase();
    const en = (p.nameEn || '').toLowerCase();
    const ar = (p.nameAr || '').toLowerCase();
    return s === decoded || id === decoded || s === raw || id === raw || en === decoded || ar === decoded;
  });

  return found || null;
}

/**
 * Returns all products for a specific category slug
 */
export function getProductsByCategory(categorySlug: string): { category: CategoryMeta; products: Product[] } | null {
  const meta = CATEGORY_REGISTRY.find((c) => c.slug.toLowerCase() === categorySlug.toLowerCase());
  if (!meta) return null;

  const all = loadCatalogProducts();
  const matched = all.filter((p) => {
    const fam = (p.fragranceFamily || '').toLowerCase();
    const target = meta.family.toLowerCase();
    if (fam === target) return true;
    if (target === 'woody' && fam.includes('wood')) return true;
    if (target === 'oriental' && (fam.includes('oriental') || fam.includes('oud') || fam.includes('amber'))) return true;
    if (target === 'fresh citrus' && (fam.includes('citrus') || fam.includes('fresh') || fam.includes('aquatic'))) return true;
    if (target === 'floral' && fam.includes('floral')) return true;
    if (target === 'leather & spice' && (fam.includes('leather') || fam.includes('spice'))) return true;
    if (target === 'gourmand' && fam.includes('gourmand')) return true;
    if (target === 'aromatic' && (fam.includes('aromatic') || fam.includes('chypre'))) return true;
    return false;
  });

  return { category: meta, products: matched };
}

/**
 * Returns all registered categories
 */
export function getAllCategories(): CategoryMeta[] {
  return CATEGORY_REGISTRY;
}

/**
 * Returns a category by its slug
 */
export function getCategoryBySlug(slug: string): CategoryMeta | null {
  return CATEGORY_REGISTRY.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) || null;
}

/**
 * Returns all product slugs for static generation
 */
export function getAllProductSlugs(): string[] {
  const products = loadCatalogProducts();
  return products.map((p) => p.slug || p.id).filter(Boolean);
}
