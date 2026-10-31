import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';
import { getProductBySlug, loadCatalogProducts, getAllProductSlugs, CATEGORY_REGISTRY } from '@/lib/catalog';
import { ProductClientView } from '@/components/ProductClientView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://a-and-s.vercel.app';

export async function generateStaticParams() {
  const slugs = getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product || product.isPublished === false) {
    return {
      title: 'عطر غير متوفر | دار رَحِيقْ للعطور',
      description: 'هذا العطر غير متوفر حالياً في كتالوج دار رحيق للعطور الملكية.',
      robots: { index: false, follow: true },
    };
  }

  const title = product.seoTitle || `${product.nameAr || product.nameEn} | دار رَحِيقْ للعطور الملكية`;
  const description =
    product.seoDescription ||
    product.descriptionAr ||
    product.descriptionEn ||
    `عطر فاخر ومستقل من دار رحيق (RAHEEQ) بتركيز نيش فاخر (Extrait de Parfum). شحن سريع وضمان فحص ومعاينة الطرد عند الاستلام في مصر.`;

  const canonicalUrl = `${SITE_URL}/product/${product.slug || product.id}`;
  const imageUrl = product.images?.[0]?.url || product.imageUrl || `${SITE_URL}/images/raheeq-official-logo.png`;

  return {
    title,
    description: description.slice(0, 160),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'دار رَحِيقْ للعطور الملكية',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 1000,
          alt: product.nameAr || product.nameEn,
        },
      ],
      type: 'article',
      locale: 'ar_EG',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product || product.isPublished === false) {
    notFound();
  }

  const allProducts = loadCatalogProducts();
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.fragranceFamily === product.fragranceFamily)
    .slice(0, 4);

  const defaultVariant = product.variants?.[0] || {
    id: `${product.id}-default`,
    sku: `RHQ-${product.slug.toUpperCase().slice(0, 8)}`,
    volumeMl: 100,
    regularPriceEgp: 2750,
  };

  const priceEgp = defaultVariant.regularPriceEgp || (defaultVariant.regularPriceInPiasters ? defaultVariant.regularPriceInPiasters / 100 : 2750);
  const imageUrl = product.images?.[0]?.url || product.imageUrl || `${SITE_URL}/images/raheeq-official-logo.png`;
  const canonicalUrl = `${SITE_URL}/product/${product.slug || product.id}`;

  const matchedCat = CATEGORY_REGISTRY.find(
    (c) => c.family.toLowerCase() === (product.fragranceFamily || '').toLowerCase()
  );
  const categorySlug = matchedCat?.slug || 'oriental';
  const categoryTitle = matchedCat?.titleAr || 'عطور نيش ملكية';

  // Schema.org Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'الرئيسية',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'كتالوج العطور',
            item: `${SITE_URL}/catalog`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: categoryTitle,
            item: `${SITE_URL}/category/${categorySlug}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: product.nameAr || product.nameEn,
            item: canonicalUrl,
          },
        ],
      },
      {
        '@type': 'Product',
        '@id': `${canonicalUrl}#product`,
        name: product.nameAr || product.nameEn,
        description: product.descriptionAr || product.descriptionEn,
        image: [imageUrl],
        sku: defaultVariant.sku,
        brand: {
          '@type': 'Brand',
          name: 'RAHEEQ',
        },
        category: product.fragranceFamily,
        offers: (product.variants && product.variants.length > 0)
          ? product.variants.map((v) => {
              const vPrice = v.regularPriceEgp || (v.regularPriceInPiasters ? v.regularPriceInPiasters / 100 : priceEgp);
              return {
                '@type': 'Offer',
                url: `${canonicalUrl}?volume=${v.volumeMl || 100}ml`,
                name: `${product.nameAr || product.nameEn} - عبوة ${v.volumeMl || 100}ml`,
                sku: v.sku || `${product.slug}-${v.volumeMl || 100}`,
                priceCurrency: 'EGP',
                price: vPrice,
                priceValidUntil: '2027-12-31',
                itemCondition: 'https://schema.org/NewCondition',
                availability: (v.stockQuantity && v.stockQuantity > 0)
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/InStock',
                seller: {
                  '@type': 'Organization',
                  name: 'دار رَحِيقْ للعطور الملكية',
                },
              };
            })
          : [
              {
                '@type': 'Offer',
                url: canonicalUrl,
                priceCurrency: 'EGP',
                price: priceEgp,
                priceValidUntil: '2027-12-31',
                itemCondition: 'https://schema.org/NewCondition',
                availability: 'https://schema.org/InStock',
                seller: {
                  '@type': 'Organization',
                  name: 'دار رَحِيقْ للعطور الملكية',
                },
              },
            ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClientView product={product} relatedProducts={relatedProducts} />
    </>
  );
}
