'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant } from '@/types';
import { DEMO_PRODUCTS } from '@/lib/data/products';

interface ProductContextType {
  products: Product[];
  addProduct: (newProductData: {
    nameEn: string;
    nameAr?: string;
    fragranceFamily: string;
    concentration: any;
    descriptionEn: string;
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
  deleteProduct: (productId: string) => void;
  getProductBySlug: (slug: string) => Product | undefined;
  resetToDefault: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const PRODUCTS_STORAGE_KEY = 'a_and_s_catalog_v2';

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load merged products from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (stored) {
        setProducts(JSON.parse(stored));
      } else {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(DEMO_PRODUCTS));
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

  const addProduct = (data: {
    nameEn: string;
    nameAr?: string;
    fragranceFamily: string;
    concentration: any;
    descriptionEn: string;
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
    const id = `as-perfume-custom-${Date.now()}`;
    const slug = data.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const regularPriceInPiasters = Math.round(data.regularPriceEgp * 100);
    const salePriceInPiasters = data.salePriceEgp ? Math.round(data.salePriceEgp * 100) : null;
    const costPriceInPiasters = data.costPriceEgp ? Math.round(data.costPriceEgp * 100) : Math.round(regularPriceInPiasters * 0.35);

    const volume = data.volumeMl || 100;

    const newVariant: ProductVariant = {
      id: `${id}-var-${volume}`,
      productId: id,
      sku: `AS-${String(nextIndex).padStart(3, '0')}-${volume}ML`,
      volumeMl: volume,
      titleEn: `${volume}ml ${data.concentration.replace(/_/g, ' ')}`,
      regularPriceInPiasters,
      salePriceInPiasters,
      costPriceInPiasters,
      stockQuantity: data.stockQuantity || 20,
      lowStockThreshold: 5,
      isActive: true,
    };

    const newProduct: Product = {
      id,
      slug,
      nameEn: data.nameEn,
      headlineEn: 'Exclusive bespoke formulation created in Cairo.',
      descriptionEn: data.descriptionEn || `An opulent masterpiece by A AND S, blending ${data.topNotes.join(', ')} with a rich heart of ${data.heartNotes.join(', ')}.`,
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
    return products.find((p) => p.slug === slug);
  };

  const resetToDefault = () => {
    saveProducts(DEMO_PRODUCTS);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
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
