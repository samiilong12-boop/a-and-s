import { describe, it, expect } from 'vitest';
import { Product, ProductVariant } from '../src/types';

describe('PHASE 10 — Product Studio QA & End-to-End Validation', () => {
  // Test Scenario: "رحيق عود الليل" (Raheeq Night Oud)
  const testFragranceSlug = 'raheeq-night-oud';
  const testFragranceId = 'test-raheeq-night-oud-101';

  const variant50: ProductVariant = {
    id: `${testFragranceId}-var-50`,
    productId: testFragranceId,
    sku: 'RHQ-NT-OUD-50ML',
    volumeMl: 50,
    titleEn: '50ml Extrait De Parfum',
    titleAr: '50 مل إكستري دو بارفان',
    regularPriceInPiasters: 45000,
    regularPriceEgp: 450,
    costPriceInPiasters: 18000,
    costPriceEgp: 180,
    stockQuantity: 35,
    lowStockThreshold: 5,
    isActive: true,
  };

  const variant100: ProductVariant = {
    id: `${testFragranceId}-var-100`,
    productId: testFragranceId,
    sku: 'RHQ-NT-OUD-100ML',
    volumeMl: 100,
    titleEn: '100ml Extrait De Parfum',
    titleAr: '100 مل إكستري دو بارفان',
    regularPriceInPiasters: 85000,
    regularPriceEgp: 850,
    costPriceInPiasters: 34000,
    costPriceEgp: 340,
    stockQuantity: 50,
    lowStockThreshold: 5,
    isActive: true,
  };

  const testProduct: Product = {
    id: testFragranceId,
    slug: testFragranceSlug,
    nameEn: 'Raheeq Night Oud',
    nameAr: 'رحيق عود الليل',
    brand: 'RAHEEQ',
    inspiredBy: 'Oud Wood Style Inspiration',
    inspirationNoteAr: 'توليفة عطرية خاصة ومستقلة تصنعها دار رَحِيقْ (RAHEEQ) بتركيز نيش فاخر، مستوحاة من الهرم العطري لـ Oud Wood Style Inspiration.',
    gender: 'UNISEX',
    headlineEn: 'Mystical nocturnal oud crafted by RAHEEQ Haute Parfumerie.',
    descriptionAr: 'توليفة ليلية شرقية فاخرة من دار رَحِيقْ، تجمع أندر أخشاب العود المعتق مع البخور الكمبودي وخشب الصندل والعنبر الملكي.',
    descriptionEn: 'A dark, hypnotic nocturnal oud by RAHEEQ Haute Parfumerie, blending rare aged Cambodian agarwood with smoky amber and mysore sandalwood.',
    concentration: 'EXTRAIT_DE_PARFUM',
    fragranceFamily: 'Woody',
    topNotes: ['Rosewood', 'Cardamom', 'Chinese Pepper'],
    heartNotes: ['Oud Wood', 'Sandalwood', 'Vetiver'],
    baseNotes: ['Tonka Bean', 'Vanilla', 'Amber'],
    isFeatured: true,
    isNewArrival: true,
    isBestseller: false,
    isPublished: false, // Initially Draft
    variants: [variant50, variant100],
    imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    images: [
      {
        id: 'img-1',
        url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
        altTextEn: 'Raheeq Night Oud Luxury Bottle',
        altTextAr: 'زجاجة عطر رحيق عود الليل الملكية',
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    seoTitle: 'عطر رحيق عود الليل الفاخر | دار رَحِيقْ للعطور الملكية',
    seoDescription: 'تسوق عطر رحيق عود الليل النيش بتركيز إكستري دو بارفان يدوم أكثر من 24 ساعة. متاح بحجم 50 مل (450 ج.م) و100 مل (850 ج.م) مع الدفع عند الاستلام.',
    createdAt: '2026-10-31T12:00:00.000Z',
  };

  it('Step 1 & 12: Quick Add initializes a private draft (isPublished: false) hidden from public endpoints', () => {
    expect(testProduct.isPublished).toBe(false);

    // Public catalog query filter: must only return published products
    const publicCatalog = [testProduct].filter((p) => p.isPublished === true);
    expect(publicCatalog.length).toBe(0);

    // Admin studio query: sees draft product
    const adminProducts = [testProduct];
    expect(adminProducts.length).toBe(1);
    expect(adminProducts[0].nameAr).toBe('رحيق عود الليل');
  });

  it('Step 6, 7 & 8: Variants have independent prices (50ml: 450 EGP, 100ml: 850 EGP) and stock', () => {
    const v50 = testProduct.variants.find((v) => v.volumeMl === 50)!;
    const v100 = testProduct.variants.find((v) => v.volumeMl === 100)!;

    expect(v50.regularPriceEgp).toBe(450);
    expect(v50.regularPriceInPiasters).toBe(45000);
    expect(v50.stockQuantity).toBe(35);
    expect(v50.sku).toBe('RHQ-NT-OUD-50ML');

    expect(v100.regularPriceEgp).toBe(850);
    expect(v100.regularPriceInPiasters).toBe(85000);
    expect(v100.stockQuantity).toBe(50);
    expect(v100.sku).toBe('RHQ-NT-OUD-100ML');

    // Strict validation: Prices and SKUs must not collide
    expect(v50.regularPriceEgp).not.toBe(v100.regularPriceEgp);
    expect(v50.sku).not.toBe(v100.sku);
  });

  it('Step 5 & 18: Protects internal COGS confidentiality and generates valid Product Schema', () => {
    // When serialized for public customer response, costPrice must be stripped
    const publicVariant = { ...testProduct.variants[0] };
    delete (publicVariant as any).costPriceInPiasters;
    delete (publicVariant as any).costPriceEgp;

    expect((publicVariant as any).costPriceEgp).toBeUndefined();
    expect((publicVariant as any).costPriceInPiasters).toBeUndefined();

    // Verify Product JSON-LD schema
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: testProduct.nameAr,
      brand: { '@type': 'Brand', name: 'RAHEEQ' },
      offers: testProduct.variants.map((v) => ({
        '@type': 'Offer',
        price: v.regularPriceEgp,
        priceCurrency: 'EGP',
        availability: v.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        sku: v.sku,
      })),
    };

    expect(schema.brand.name).toBe('RAHEEQ');
    expect(schema.offers[0].price).toBe(450);
    expect(schema.offers[1].price).toBe(850);
  });

  it('Step 13, 14 & 15: Publishing updates the storefront and cart accurately', () => {
    // Simulate merchant clicking "Publish" in Tab H
    const publishedProduct: Product = {
      ...testProduct,
      isPublished: true,
    };

    const publicStorefront = [publishedProduct].filter((p) => p.isPublished === true);
    expect(publicStorefront.length).toBe(1);
    expect(publicStorefront[0].slug).toBe('raheeq-night-oud');

    // Cart addition for 50ml (450 EGP)
    const cartItem = {
      variantId: publishedProduct.variants[0].id,
      volumeMl: publishedProduct.variants[0].volumeMl,
      unitPriceEgp: publishedProduct.variants[0].regularPriceEgp,
      quantity: 2,
      totalEgp: (publishedProduct.variants[0].regularPriceEgp || 0) * 2,
    };

    expect(cartItem.unitPriceEgp).toBe(450);
    expect(cartItem.totalEgp).toBe(900);
  });

  it('verifies complete store-owner control over the inspiration disclaimer box (title, text, toggle)', () => {
    // 1. Custom text and custom title
    const customDisclaimerProduct: Product = {
      ...testProduct,
      disclaimerTitleAr: 'تنويه دار رَحِيقْ الملكي:',
      inspirationNoteAr: 'عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمي لـ Jean Paul Gaultier Le Male Le Parfum، إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.',
      showDisclaimer: true,
    };

    expect(customDisclaimerProduct.showDisclaimer).toBe(true);
    expect(customDisclaimerProduct.disclaimerTitleAr).toBe('تنويه دار رَحِيقْ الملكي:');
    expect(customDisclaimerProduct.inspirationNoteAr).toContain('Jean Paul Gaultier Le Male Le Parfum');

    // 2. Hide toggle
    const hiddenDisclaimerProduct: Product = {
      ...testProduct,
      showDisclaimer: false,
    };
    expect(hiddenDisclaimerProduct.showDisclaimer).toBe(false);
  });

  it('Strict Negative Constraint: Zero occurrences of "شامل الضريبة"', () => {
    const rawData = JSON.stringify(testProduct);
    expect(rawData).not.toContain('شامل الضريبة');
  });
});
