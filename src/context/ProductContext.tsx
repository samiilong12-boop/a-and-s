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
    gender?: 'MEN' | 'WOMEN' | 'UNISEX';
    fragranceFamily: string;
    concentration: any;
    descriptionEn: string;
    descriptionAr?: string;
    topNotes: string[];
    heartNotes: string[];
    baseNotes: string[];
    imageUrl: string;
    regularPriceEgp: number;
    salePriceEgp?: number;
    costPriceEgp?: number;
    stockQuantity: number;
    volumeMl?: number;
  }) => Promise<Product>;
  editProduct: (
    id: string,
    updatedFields: Partial<Product> & {
      regularPriceEgp?: number;
      salePriceEgp?: number;
      costPriceEgp?: number;
      stockQuantity?: number;
      imageUrl?: string;
    }
  ) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  resetToDefault: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  bulkImport: (importedProducts: Product[]) => Promise<boolean>;
  exportCatalogJson: () => string;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const PRODUCTS_STORAGE_KEY = 'a_and_s_ready_perfumes_v3';
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

  // Sync with /api/products server database
  const syncWithServer = useCallback(async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (res.ok) {
        const remoteProducts = await res.json();
        if (Array.isArray(remoteProducts) && remoteProducts.length > 0) {
          // Merge remote products with local cache
          const localStored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
          const localParsed: Product[] = localStored ? JSON.parse(localStored) : [];

          const map = new Map<string, Product>();
          // 1. Initial 50
          FAMOUS_50_PERFUMES.forEach((p) => map.set(p.id, p));
          // 2. Server products
          remoteProducts.forEach((p: Product) => map.set(p.id, p));
          // 3. Local custom products
          if (Array.isArray(localParsed)) {
            localParsed.forEach((p) => map.set(p.id, p));
          }

          const merged = Array.from(map.values());
          setProducts(merged);
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(merged));
        }
      }
    } catch (e) {
      console.warn('Could not sync products with server API, using local cache', e);
    }
  }, []);

  // Load merged products on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 50) {
          setProducts(parsed);
        } else {
          setProducts(FAMOUS_50_PERFUMES);
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(FAMOUS_50_PERFUMES));
        }
      } else {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(FAMOUS_50_PERFUMES));
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);

    // Immediate server sync
    syncWithServer();
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

      if (
        updatedFields.regularPriceEgp !== undefined ||
        updatedFields.salePriceEgp !== undefined ||
        updatedFields.costPriceEgp !== undefined ||
        updatedFields.stockQuantity !== undefined
      ) {
        const variants = merged.variants && merged.variants.length > 0 ? [...merged.variants] : [];
        if (variants.length > 0) {
          const v0 = { ...variants[0] };
          if (updatedFields.regularPriceEgp !== undefined) {
            v0.regularPriceEgp = updatedFields.regularPriceEgp;
            v0.regularPriceInPiasters = Math.round(updatedFields.regularPriceEgp * 100);
          }
          if (updatedFields.salePriceEgp !== undefined) {
            v0.salePriceEgp = updatedFields.salePriceEgp;
            v0.salePriceInPiasters = updatedFields.salePriceEgp ? Math.round(updatedFields.salePriceEgp * 100) : null;
          }
          if (updatedFields.costPriceEgp !== undefined) {
            v0.costPriceEgp = updatedFields.costPriceEgp;
            v0.costPriceInPiasters = updatedFields.costPriceEgp ? Math.round(updatedFields.costPriceEgp * 100) : undefined;
          }
          if (updatedFields.stockQuantity !== undefined) {
            v0.stockQuantity = updatedFields.stockQuantity;
          }
          variants[0] = v0;
          merged.variants = variants;
        }
      }

      return merged;
    });

    saveProductsLocally(updated);

    // Sync update to server
    try {
      await fetch('/api/products', {
        method: 'PUT',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ id, updatedFields }),
      });
    } catch (err) {
      console.warn('Server sync error on edit:', err);
    }
  };

  const addProduct = async (data: {
    nameEn: string;
    nameAr?: string;
    brand?: string;
    gender?: 'MEN' | 'WOMEN' | 'UNISEX';
    fragranceFamily: string;
    concentration: any;
    descriptionEn: string;
    descriptionAr?: string;
    topNotes: string[];
    heartNotes: string[];
    baseNotes: string[];
    imageUrl: string;
    regularPriceEgp: number;
    salePriceEgp?: number;
    costPriceEgp?: number;
    stockQuantity: number;
    volumeMl?: number;
  }): Promise<Product> => {
    const nextIndex = products.length + 1;
    const id = `raheeq-fragrance-${Date.now()}`;
    let slug = data.nameEn.toLowerCase().trim().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/(^-|-$)/g, '');
    if (!slug || slug === '-') {
      slug = `raheeq-${nextIndex}-${Date.now().toString().slice(-4)}`;
    }

    const regularPriceInPiasters = Math.round(data.regularPriceEgp * 100);
    const salePriceInPiasters = data.salePriceEgp ? Math.round(data.salePriceEgp * 100) : null;
    const costPriceInPiasters = data.costPriceEgp ? Math.round(data.costPriceEgp * 100) : Math.round(regularPriceInPiasters * 0.35);

    const volume = data.volumeMl || 100;

    const newVariant: ProductVariant = {
      id: `${id}-var-${volume}`,
      productId: id,
      sku: `RHQ-${String(nextIndex).padStart(3, '0')}-${volume}ML`,
      volumeMl: volume,
      titleEn: `${volume}ml ${data.concentration.replace(/_/g, ' ')}`,
      regularPriceInPiasters,
      regularPriceEgp: data.regularPriceEgp,
      salePriceInPiasters,
      salePriceEgp: data.salePriceEgp,
      costPriceInPiasters,
      costPriceEgp: data.costPriceEgp,
      stockQuantity: data.stockQuantity || 20,
      lowStockThreshold: 5,
      isActive: true,
    };

    const newProduct: Product = {
      id,
      slug,
      nameEn: data.nameEn,
      nameAr: data.nameAr || data.nameEn,
      brand: data.brand || 'رحيق (Raheeq)',
      gender: data.gender || 'UNISEX',
      headlineEn: 'Exclusive bespoke formulation crafted by Raheeq.',
      descriptionEn: data.descriptionEn || `An opulent masterpiece by Raheeq Haute Parfumerie, blending ${data.topNotes.join(', ')} with a rich heart of ${data.heartNotes.join(', ')}.`,
      descriptionAr: data.descriptionAr || `تحفة عطرية استثنائية من دار رحيق للعطور الفاخرة، تمزج أرقى الخلاصات العطرية لثبات وفوحان يدوم طويلاً.`,
      concentration: data.concentration,
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
      rating: 5.0,
      reviewCount: 1,
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
      variants: [newVariant],
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
