'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  }) => Product;
  editProduct: (
    id: string,
    updatedFields: Partial<Product> & {
      regularPriceEgp?: number;
      salePriceEgp?: number;
      costPriceEgp?: number;
      stockQuantity?: number;
      imageUrl?: string;
    }
  ) => void;
  deleteProduct: (productId: string) => void;
  getProductBySlug: (slug: string) => Product | undefined;
  resetToDefault: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const PRODUCTS_STORAGE_KEY = 'a_and_s_ready_perfumes_v3';

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(FAMOUS_50_PERFUMES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load merged products from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 50) {
          setProducts(parsed);
        } else {
          // Upgrade to the full 50 famous perfumes
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
  }, []);

  const saveProducts = (updatedList: Product[]) => {
    setProducts(updatedList);
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
  };

  const editProduct = (
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
    saveProducts(updated);
  };

  const addProduct = (data: {
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
  }): Product => {
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
    saveProducts(updated);
    return newProduct;
  };

  const deleteProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    saveProducts(updated);
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

  const resetToDefault = () => {
    saveProducts(FAMOUS_50_PERFUMES);
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
