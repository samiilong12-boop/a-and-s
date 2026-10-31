'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, ProductVariant } from '@/types';
import { FAMOUS_50_PERFUMES } from '@/lib/data/products';

interface ProductContextType {
  products: Product[];
  addProduct: (newProductData: {
    nameEn: string;
    nameAr?: string;
    brand?: string;
    inspiredBy?: string;
    gender?: 'MEN' | 'WOMEN' | 'UNISEX';
    fragranceFamily: string;
    concentration: any;
    descriptionEn?: string;
    descriptionAr?: string;
    topNotes: string[];
    heartNotes: string[];
    baseNotes: string[];
    imageUrl: string;
    regularPriceEgp?: number;
    salePriceEgp?: number;
    costPriceEgp?: number;
    stockQuantity?: number;
    volumeMl?: number;
    regularPrice50Egp?: number;
    salePrice50Egp?: number;
    stock50?: number;
    regularPrice100Egp?: number;
    salePrice100Egp?: number;
    stock100?: number;
    variants?: ProductVariant[];
    inspirationNoteAr?: string;
    disclaimerTitleAr?: string;
    showDisclaimer?: boolean;
    longevityAr?: string;
    longevityEn?: string;
    sillageAr?: string;
    sillageEn?: string;
    guaranteeTitleAr?: string;
    guaranteeTextAr?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[] | string;
  }) => Promise<Product>;
  editProduct: (
    id: string,
    updatedFields: Partial<Product> & {
      regularPriceEgp?: number;
      salePriceEgp?: number;
      costPriceEgp?: number;
      stockQuantity?: number;
      imageUrl?: string;
      regularPrice50Egp?: number;
      salePrice50Egp?: number;
      stock50?: number;
      regularPrice100Egp?: number;
      salePrice100Egp?: number;
      stock100?: number;
      variants?: ProductVariant[];
      inspirationNoteAr?: string;
      disclaimerTitleAr?: string;
      showDisclaimer?: boolean;
      longevityAr?: string;
      longevityEn?: string;
      sillageAr?: string;
      sillageEn?: string;
      guaranteeTitleAr?: string;
      guaranteeTextAr?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (productId: string) => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  resetToDefault: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  syncLocalToCloud: () => Promise<{ success: boolean; message: string; count?: number }>;
  bulkImport: (importedProducts: Product[]) => Promise<boolean>;
  exportCatalogJson: () => string;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const PRODUCTS_STORAGE_KEY = 'raheeq_official_catalog_v6';
const CATALOG_VERSION_KEY = 'raheeq_catalog_version_sig';
const CURRENT_CATALOG_VERSION = '2026.10.31.v6_official_10_clean';
const TOKEN_KEY = 'a_and_s_admin_jwt_token';

function getAdminAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(FAMOUS_50_PERFUMES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync with /api/products server database (authoritative source of truth)
  const syncWithServer = useCallback(async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (res.ok) {
        const remoteProducts = await res.json();
        if (Array.isArray(remoteProducts) && remoteProducts.length > 0) {
          // Authoritative server database replaces memory & local cache
          // Safeguard: filter out test dummy items and sanitize heavy base64
          const cleaned = remoteProducts
            .filter((p: Product) => p && p.slug !== 'yyyyy' && p.nameEn !== 'yyyyy')
            .map((p: Product) => {
              if (p.imageUrl?.includes(';base64,') || (p.images && p.images[0]?.url?.includes(';base64,'))) {
                const official = FAMOUS_50_PERFUMES.find((f) => f.slug === p.slug || f.id === p.id);
                if (official) {
                  return {
                    ...p,
                    imageUrl: official.imageUrl,
                    images: official.images,
                  };
                }
              }
              return p;
            });

          setProducts(cleaned);
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(cleaned));
        }
      }
    } catch (e) {
      console.warn('Could not sync products with server API, using local cache', e);
    }
  }, []);

  // Load products on mount
  useEffect(() => {
    try {
      const storedVersion = localStorage.getItem(CATALOG_VERSION_KEY);
      if (storedVersion !== CURRENT_CATALOG_VERSION) {
        // Upgrade cache to official WebP version: purge stale v4 storage with heavy base64
        localStorage.removeItem('raheeq_official_catalog_v4');
        localStorage.removeItem(PRODUCTS_STORAGE_KEY);
        localStorage.setItem(CATALOG_VERSION_KEY, CURRENT_CATALOG_VERSION);
        setProducts(FAMOUS_50_PERFUMES);
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(FAMOUS_50_PERFUMES));
      } else {
        const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const sanitized = parsed.map((p: Product) => ({
              ...p,
              brand: 'RAHEEQ',
              rating: undefined,
              reviewCount: undefined,
            }));
            setProducts(sanitized);
          } else {
            setProducts(FAMOUS_50_PERFUMES);
            localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(FAMOUS_50_PERFUMES));
          }
        } else {
          setProducts(FAMOUS_50_PERFUMES);
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(FAMOUS_50_PERFUMES));
        }
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);

    // Defer server sync until after initial paint & critical asset loading
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      const delay = isMobile ? 3500 : 2000;
      const timer = setTimeout(() => {
        if ('requestIdleCallback' in window) {
          (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => syncWithServer());
        } else {
          syncWithServer();
        }
      }, delay);
      return () => clearTimeout(timer);
    } else {
      syncWithServer();
    }
  }, [syncWithServer]);

  const saveProductsLocally = (updatedList: Product[]) => {
    setProducts(updatedList);
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
  };

  const editProduct = async (
    id: string,
    updatedFields: Partial<Product> & {
      regularPriceEgp?: number;
      salePriceEgp?: number;
      costPriceEgp?: number;
      stockQuantity?: number;
      imageUrl?: string;
      regularPrice50Egp?: number;
      salePrice50Egp?: number;
      stock50?: number;
      regularPrice100Egp?: number;
      salePrice100Egp?: number;
      stock100?: number;
      variants?: ProductVariant[];
      inspirationNoteAr?: string;
      disclaimerTitleAr?: string;
      showDisclaimer?: boolean;
      longevityAr?: string;
      longevityEn?: string;
      sillageAr?: string;
      sillageEn?: string;
      guaranteeTitleAr?: string;
      guaranteeTextAr?: string;
    }
  ) => {
    const updated = products.map((p) => {
      if (p.id !== id) return p;
      const merged: Product = { ...p, ...updatedFields };

      if (updatedFields.imageUrl) {
        merged.imageUrl = updatedFields.imageUrl;
        merged.images = [
          {
            id: `${id}-img-primary`,
            url: updatedFields.imageUrl,
            altTextEn: merged.nameEn,
            isPrimary: true,
            sortOrder: 0,
          },
          ...(merged.images ? merged.images.filter((_, i) => i > 0) : []),
        ];
      }

      if (updatedFields.variants && updatedFields.variants.length > 0) {
        merged.variants = updatedFields.variants;
      } else if (
        updatedFields.regularPriceEgp !== undefined ||
        updatedFields.salePriceEgp !== undefined ||
        updatedFields.costPriceEgp !== undefined ||
        updatedFields.stockQuantity !== undefined ||
        updatedFields.regularPrice50Egp !== undefined ||
        updatedFields.regularPrice100Egp !== undefined
      ) {
        const variants = merged.variants && merged.variants.length > 0 ? [...merged.variants] : [];
        
        // Find or create 50ml and 100ml variants
        const p50 = updatedFields.regularPrice50Egp ?? (variants.find((v) => v.volumeMl === 50)?.regularPriceEgp || Math.round((updatedFields.regularPriceEgp || 2500) * 0.65));
        const p100 = updatedFields.regularPrice100Egp ?? updatedFields.regularPriceEgp ?? (variants.find((v) => v.volumeMl === 100)?.regularPriceEgp || 2500);

        if (variants.length >= 2) {
          variants.forEach((v) => {
            if (v.volumeMl === 50) {
              if (updatedFields.regularPrice50Egp !== undefined) {
                v.regularPriceEgp = updatedFields.regularPrice50Egp;
                v.regularPriceInPiasters = Math.round(updatedFields.regularPrice50Egp * 100);
              }
              if (updatedFields.salePrice50Egp !== undefined) {
                v.salePriceEgp = updatedFields.salePrice50Egp;
                v.salePriceInPiasters = updatedFields.salePrice50Egp ? Math.round(updatedFields.salePrice50Egp * 100) : null;
              }
              if (updatedFields.stock50 !== undefined) {
                v.stockQuantity = updatedFields.stock50;
              }
            } else if (v.volumeMl === 100) {
              if (p100 !== undefined) {
                v.regularPriceEgp = p100;
                v.regularPriceInPiasters = Math.round(p100 * 100);
              }
              if (updatedFields.salePrice100Egp !== undefined || updatedFields.salePriceEgp !== undefined) {
                const s = updatedFields.salePrice100Egp ?? updatedFields.salePriceEgp;
                v.salePriceEgp = s;
                v.salePriceInPiasters = s ? Math.round(s * 100) : null;
              }
              if (updatedFields.stock100 !== undefined || updatedFields.stockQuantity !== undefined) {
                v.stockQuantity = updatedFields.stock100 ?? updatedFields.stockQuantity!;
              }
            }
          });
          merged.variants = variants;
        } else if (variants.length === 1) {
          // Upgrade single-variant product to both 50ml and 100ml
          const v0 = variants[0];
          merged.variants = [
            {
              id: `${merged.id}-var-50`,
              productId: merged.id,
              sku: `${v0.sku || 'RHQ'}-50ML`,
              volumeMl: 50,
              titleEn: `50ml ${String(merged.concentration || 'EXTRAIT DE PARFUM').replace(/_/g, ' ')}`,
              titleAr: `50 مل إكستري دو بارفان`,
              regularPriceInPiasters: Math.round(p50 * 100),
              regularPriceEgp: p50,
              salePriceInPiasters: updatedFields.salePrice50Egp ? Math.round(updatedFields.salePrice50Egp * 100) : null,
              salePriceEgp: updatedFields.salePrice50Egp || null,
              costPriceInPiasters: Math.round(p50 * 0.35 * 100),
              costPriceEgp: Math.round(p50 * 0.35),
              stockQuantity: updatedFields.stock50 ?? 30,
              lowStockThreshold: 5,
              isActive: true,
            },
            {
              id: `${merged.id}-var-100`,
              productId: merged.id,
              sku: `${v0.sku || 'RHQ'}-100ML`,
              volumeMl: 100,
              titleEn: `100ml ${String(merged.concentration || 'EXTRAIT DE PARFUM').replace(/_/g, ' ')}`,
              titleAr: `100 مل إكستري دو بارفان`,
              regularPriceInPiasters: Math.round(p100 * 100),
              regularPriceEgp: p100,
              salePriceInPiasters: (updatedFields.salePrice100Egp ?? updatedFields.salePriceEgp) ? Math.round((updatedFields.salePrice100Egp ?? updatedFields.salePriceEgp!) * 100) : null,
              salePriceEgp: updatedFields.salePrice100Egp ?? updatedFields.salePriceEgp ?? null,
              costPriceInPiasters: updatedFields.costPriceEgp ? Math.round(updatedFields.costPriceEgp * 100) : Math.round(p100 * 0.35 * 100),
              costPriceEgp: updatedFields.costPriceEgp || Math.round(p100 * 0.35),
              stockQuantity: updatedFields.stock100 ?? updatedFields.stockQuantity ?? 25,
              lowStockThreshold: 5,
              isActive: true,
            },
          ];
        }
      }

      if (updatedFields.inspiredBy !== undefined) {
        merged.inspiredBy = updatedFields.inspiredBy.trim() || undefined;
      }
      if (updatedFields.inspirationNoteAr !== undefined) {
        merged.inspirationNoteAr = updatedFields.inspirationNoteAr.trim() || undefined;
      } else if (updatedFields.inspiredBy && !merged.inspirationNoteAr) {
        merged.inspirationNoteAr = `عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمي لـ ${merged.inspiredBy}، إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.`;
      }
      if (updatedFields.disclaimerTitleAr !== undefined) {
        merged.disclaimerTitleAr = updatedFields.disclaimerTitleAr.trim() || undefined;
      }
      if (updatedFields.showDisclaimer !== undefined) {
        merged.showDisclaimer = updatedFields.showDisclaimer;
      }
      if (updatedFields.longevityAr !== undefined) {
        merged.longevityAr = updatedFields.longevityAr.trim() || undefined;
      }
      if (updatedFields.longevityEn !== undefined) {
        merged.longevityEn = updatedFields.longevityEn.trim() || undefined;
      }
      if (updatedFields.sillageAr !== undefined) {
        merged.sillageAr = updatedFields.sillageAr.trim() || undefined;
      }
      if (updatedFields.sillageEn !== undefined) {
        merged.sillageEn = updatedFields.sillageEn.trim() || undefined;
      }
      if (updatedFields.guaranteeTitleAr !== undefined) {
        merged.guaranteeTitleAr = updatedFields.guaranteeTitleAr.trim() || undefined;
      }
      if (updatedFields.guaranteeTextAr !== undefined) {
        merged.guaranteeTextAr = updatedFields.guaranteeTextAr.trim() || undefined;
      }
      if (updatedFields.seoTitle !== undefined) merged.seoTitle = updatedFields.seoTitle.trim() || undefined;
      if (updatedFields.seoDescription !== undefined) merged.seoDescription = updatedFields.seoDescription.trim() || undefined;
      if (updatedFields.seoKeywords !== undefined) {
        merged.seoKeywords = typeof updatedFields.seoKeywords === 'string' ? (updatedFields.seoKeywords.trim() || undefined) : updatedFields.seoKeywords;
      }

      return merged;
    });

    const editedProduct = updated.find((p) => p.id === id);
    saveProductsLocally(updated);

    // Sync update to PostgreSQL server database with full product payload
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ id, updatedFields, product: editedProduct }),
      });
      if (res.ok) {
        return { success: true };
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.warn('Server sync error on edit:', errJson);
        return { success: false, error: errJson.error || `HTTP ${res.status}` };
      }
    } catch (err: any) {
      console.warn('Server sync network error on edit:', err);
      return { success: false, error: err.message || 'خطأ اتصال بالشبكة' };
    }
  };

  const addProduct = async (data: {
    nameEn: string;
    nameAr?: string;
    brand?: string;
    inspiredBy?: string;
    gender?: 'MEN' | 'WOMEN' | 'UNISEX';
    fragranceFamily: string;
    concentration: any;
    descriptionEn?: string;
    descriptionAr?: string;
    topNotes: string[];
    heartNotes: string[];
    baseNotes: string[];
    imageUrl: string;
    regularPriceEgp?: number;
    salePriceEgp?: number;
    costPriceEgp?: number;
    stockQuantity?: number;
    volumeMl?: number;
    regularPrice50Egp?: number;
    salePrice50Egp?: number;
    stock50?: number;
    regularPrice100Egp?: number;
    salePrice100Egp?: number;
    stock100?: number;
    variants?: ProductVariant[];
    inspirationNoteAr?: string;
    disclaimerTitleAr?: string;
    showDisclaimer?: boolean;
    longevityAr?: string;
    longevityEn?: string;
    sillageAr?: string;
    sillageEn?: string;
    guaranteeTitleAr?: string;
    guaranteeTextAr?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[] | string;
  }): Promise<Product> => {
    const nextIndex = products.length + 1;
    const id = `raheeq-fragrance-${Date.now()}`;
    let slug = data.nameEn.toLowerCase().trim().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/(^-|-$)/g, '');
    if (!slug || slug === '-') {
      slug = `raheeq-${nextIndex}-${Date.now().toString().slice(-4)}`;
    }

    const p50 = data.regularPrice50Egp || Math.round((data.regularPriceEgp || 2500) * 0.65);
    const p100 = data.regularPrice100Egp || data.regularPriceEgp || 2500;
    const concentrationName = data.concentration || 'EXTRAIT_DE_PARFUM';

    const variants: ProductVariant[] = data.variants && data.variants.length > 0
      ? data.variants.map((v) => ({ ...v, productId: id }))
      : [
          {
            id: `${id}-var-50`,
            productId: id,
            sku: `RHQ-${String(nextIndex).padStart(3, '0')}-50ML`,
            volumeMl: 50,
            titleEn: `50ml ${String(concentrationName).replace(/_/g, ' ')}`,
            titleAr: `50 مل إكستري دو بارفان`,
            regularPriceInPiasters: Math.round(p50 * 100),
            regularPriceEgp: p50,
            salePriceInPiasters: data.salePrice50Egp ? Math.round(data.salePrice50Egp * 100) : null,
            salePriceEgp: data.salePrice50Egp || null,
            costPriceInPiasters: Math.round(p50 * 0.35 * 100),
            costPriceEgp: Math.round(p50 * 0.35),
            stockQuantity: data.stock50 ?? 30,
            lowStockThreshold: 5,
            isActive: true,
          },
          {
            id: `${id}-var-100`,
            productId: id,
            sku: `RHQ-${String(nextIndex).padStart(3, '0')}-100ML`,
            volumeMl: 100,
            titleEn: `100ml ${String(concentrationName).replace(/_/g, ' ')}`,
            titleAr: `100 مل إكستري دو بارفان`,
            regularPriceInPiasters: Math.round(p100 * 100),
            regularPriceEgp: p100,
            salePriceInPiasters: (data.salePrice100Egp ?? data.salePriceEgp) ? Math.round((data.salePrice100Egp ?? data.salePriceEgp!) * 100) : null,
            salePriceEgp: data.salePrice100Egp ?? data.salePriceEgp ?? null,
            costPriceInPiasters: data.costPriceEgp ? Math.round(data.costPriceEgp * 100) : Math.round(p100 * 0.35 * 100),
            costPriceEgp: data.costPriceEgp || Math.round(p100 * 0.35),
            stockQuantity: data.stock100 ?? data.stockQuantity ?? 25,
            lowStockThreshold: 5,
            isActive: true,
          },
        ];

    const inspiredBy = data.inspiredBy?.trim() || undefined;
    const inspirationNoteAr = data.inspirationNoteAr?.trim() || (inspiredBy
      ? `عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمي لـ ${inspiredBy}، إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.`
      : undefined);
    const disclaimerTitleAr = data.disclaimerTitleAr?.trim() || undefined;
    const showDisclaimer = data.showDisclaimer !== undefined ? data.showDisclaimer : true;

    const seoTitle = data.seoTitle?.trim() || `${data.nameAr || data.nameEn} | دار رَحِيقْ للعطور الملكية`;
    const seoDescription = data.seoDescription?.trim() || (
      data.descriptionAr ||
      `عطر ${data.nameAr || data.nameEn} الفاخر من دار رَحِيقْ بتركيز نيش إكستري دو بارفان. تسوق مع ضمان المعاينة قبل الدفع عند الاستلام بجميع محافظات مصر.`
    );
    const seoKeywords = typeof data.seoKeywords === 'string'
      ? data.seoKeywords.trim()
      : (data.seoKeywords || `عطر ${data.nameAr || data.nameEn}, عطور رحيق, ${inspiredBy ? `بديل ${inspiredBy}` : ''}`);

    const newProduct: Product = {
      id,
      slug,
      nameEn: data.nameEn,
      nameAr: data.nameAr || data.nameEn,
      brand: data.brand || 'رحيق (Raheeq)',
      inspiredBy,
      inspirationNoteAr,
      disclaimerTitleAr,
      showDisclaimer,
      longevityAr: data.longevityAr?.trim() || undefined,
      longevityEn: data.longevityEn?.trim() || undefined,
      sillageAr: data.sillageAr?.trim() || undefined,
      sillageEn: data.sillageEn?.trim() || undefined,
      guaranteeTitleAr: data.guaranteeTitleAr?.trim() || undefined,
      guaranteeTextAr: data.guaranteeTextAr?.trim() || undefined,
      gender: data.gender || 'UNISEX',
      headlineEn: 'Exclusive bespoke formulation crafted by Raheeq.',
      descriptionEn: data.descriptionEn || `An opulent masterpiece by Raheeq Haute Parfumerie, blending ${data.topNotes.join(', ')} with a rich heart of ${data.heartNotes.join(', ')}.`,
      descriptionAr: data.descriptionAr || `تحفة عطرية استثنائية من دار رحيق للعطور الفاخرة، تمزج أرقى الخلاصات العطرية لثبات وفوحان يدوم طويلاً.`,
      concentration: concentrationName,
      fragranceFamily: data.fragranceFamily,
      topNotes: data.topNotes.length > 0 ? data.topNotes : ['Bergamot', 'Saffron'],
      heartNotes: data.heartNotes.length > 0 ? data.heartNotes : ['Damask Rose', 'Oud'],
      baseNotes: data.baseNotes.length > 0 ? data.baseNotes : ['Ambergris', 'Sandalwood'],
      categoryId: data.fragranceFamily.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryName: data.fragranceFamily,
      collectionIds: ['signature-collection'],
      isFeatured: true,
      isNewArrival: true,
      isBestseller: false,
      isPublished: true,
      seoTitle,
      seoDescription,
      seoKeywords,
      images: [
        {
          id: `${id}-img-1`,
          url: data.imageUrl,
          altTextEn: `${data.nameEn} Bottle`,
          isPrimary: true,
          sortOrder: 0,
        },
      ],
      imageUrl: data.imageUrl,
      variants,
      createdAt: new Date().toISOString(),
    };

    const updated = [newProduct, ...products];
    saveProductsLocally(updated);

    // Save permanently to server & cloud database
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ product: newProduct }),
      });
    } catch (err) {
      console.warn('Server sync error on addProduct:', err);
    }

    return newProduct;
  };

  const deleteProduct = async (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    saveProductsLocally(updated);

    try {
      await fetch(`/api/products?id=${encodeURIComponent(productId)}`, {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
      });
    } catch (err) {
      console.warn('Server sync error on delete:', err);
    }
  };

  const bulkImport = async (importedProducts: Product[]): Promise<boolean> => {
    if (!Array.isArray(importedProducts) || importedProducts.length === 0) return false;

    const map = new Map<string, Product>();
    products.forEach((p) => map.set(p.id, p));
    importedProducts.forEach((p) => {
      if (p && p.id && p.nameEn) map.set(p.id, p);
    });

    const merged = Array.from(map.values());
    saveProductsLocally(merged);

    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ products: merged }),
      });
      return true;
    } catch (err) {
      console.warn('Server bulk import error:', err);
      return false;
    }
  };

  // One-click manual or automatic push of entire local catalog (all prices + uploaded images) to PostgreSQL
  const syncLocalToCloud = async (): Promise<{ success: boolean; message: string; count?: number }> => {
    try {
      // 1. Get latest products from memory or localStorage
      let currentProducts = products;
      try {
        const localStored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (localStored) {
          const parsed = JSON.parse(localStored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            currentProducts = parsed;
          }
        }
      } catch {}

      if (!Array.isArray(currentProducts) || currentProducts.length === 0) {
        return { success: false, message: 'لا توجد منتجات محددة للمزامنة' };
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ action: 'replace_catalog', products: currentProducts }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setProducts(currentProducts);
        try {
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(currentProducts));
        } catch {}
        return {
          success: true,
          count: currentProducts.length,
          message: data.message || `تم تثبيت وحفظ ${currentProducts.length} عطر بالكامل في السحابة ككتالوج رسمي معتمد!`,
        };
      } else {
        const errJson = await res.json().catch(() => ({}));
        return {
          success: false,
          message: errJson.error || `فشلت المزامنة بالسيرفر (كود: ${res.status})`,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'خطأ في الاتصال بالسيرفر أثناء المزامنة السحابية',
      };
    }
  };

  const exportCatalogJson = (): string => {
    return JSON.stringify(products, null, 2);
  };

  const getProductBySlug = (slug: string): Product | undefined => {
    if (!slug) return undefined;
    const decoded = decodeURIComponent(slug).toLowerCase();
    const raw = slug.toLowerCase();
    return products.find(
      (p) =>
        p.slug?.toLowerCase() === decoded ||
        p.id?.toLowerCase() === decoded ||
        p.slug?.toLowerCase() === raw ||
        p.id?.toLowerCase() === raw
    );
  };

  const resetToDefault = async () => {
    saveProductsLocally(FAMOUS_50_PERFUMES);
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ products: FAMOUS_50_PERFUMES }),
      });
    } catch {}
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        editProduct,
        deleteProduct,
        getProductBySlug,
        resetToDefault,
        syncWithServer,
        syncLocalToCloud,
        bulkImport,
        exportCatalogJson,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
