import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { loadCatalogProducts } from '@/lib/catalog';
import { CatalogClientView } from '@/components/CatalogClientView';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://a-and-s.vercel.app';

export const metadata: Metadata = {
  title: 'كتالوج العطور الملكية | تشكيلة عطور دار رَحِيقْ الكاملة',
  description:
    'استكشف تشكيلة عطور دار رحيق الفاخرة المستوحاة من أرقى الخطوط العطرية العالمية. تركيز 30% Extrait de Parfum مع ضمان فتح الطرد وفحص الزجاجة قبل الدفع كاش عند الباب.',
  alternates: {
    canonical: `${SITE_URL}/catalog`,
  },
  openGraph: {
    title: 'كتالوج عطور دار رَحِيقْ الملكية الفاخرة',
    description:
      'تصفح عطور دار رحيق الشرقية والخشبية والزهرية والحمضية بتركيز 30% Extrait وثبات عالي مع المعاينة عند الاستلام.',
    url: `${SITE_URL}/catalog`,
    siteName: 'دار رَحِيقْ للعطور الملكية',
    images: [{ url: '/images/raheeq-official-logo.png', width: 1200, height: 630 }],
    type: 'website',
    locale: 'ar_EG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'كتالوج عطور دار رَحِيقْ الملكية الفاخرة',
    description: 'تصفح تشكيلة العطور الكاملة بتركيز 30% Extrait de Parfum مع المعاينة عند الباب.',
    images: ['/images/raheeq-official-logo.png'],
  },
};

export default function CatalogPage() {
  const initialProducts = loadCatalogProducts();

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'كتالوج عطور دار رَحِيقْ الملكية الفاخرة',
    description: 'تشكيلة عطور دار رحيق الفاخرة المستقلة المستوحاة من أرقى الخطوط العطرية العالمية.',
    url: `${SITE_URL}/catalog`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: initialProducts.slice(0, 30).map((p, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/product/${p.slug}`,
        name: p.nameAr || p.nameEn,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-[#F6F3EC]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <Suspense
        fallback={
          <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="mb-10 text-right">
              <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#080A0A]">
                كتالوج عطور دار رَحِيقْ الملكية الفاخرة
              </h1>
              <p className="text-sm text-[#576563] mt-2">
                تشكيلة العطور الملكية المصنوعة بأرقى الزيوت العطرية النقية مع المعاينة عند الباب قبل السداد كاش.
              </p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {initialProducts.map((p) => {
                const price = p.variants?.[0]?.regularPriceEgp || 1850;
                return (
                  <article key={p.id} className="bg-white rounded-2xl border border-[#E6E1D5] p-5 flex flex-col justify-between">
                    <a href={`/product/${p.slug}`} className="block">
                      <img
                        src={p.images?.[0]?.url || p.imageUrl}
                        alt={p.nameEn}
                        className="w-full aspect-[4/5] object-cover rounded-xl mb-3"
                      />
                      <span className="text-[10px] text-teal-700 font-bold uppercase">{p.fragranceFamily}</span>
                      <h2 className="font-serif font-bold text-base text-[#080A0A] mt-1">{p.nameAr || p.nameEn}</h2>
                      <p className="text-xs text-slate-500 mt-1">{p.nameEn}</p>
                    </a>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-sm text-[#080A0A]">
                        {price.toLocaleString()} ج.م
                      </span>
                      <a href={`/product/${p.slug}`} className="text-xs font-bold text-teal-700 hover:underline">
                        عرض التفاصيل ←
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        }
      >
        <CatalogClientView initialProducts={initialProducts} />
      </Suspense>
    </main>
  );
}
