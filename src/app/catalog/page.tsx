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

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F3EC] py-12">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {initialProducts.slice(0, 8).map((p) => (
              <div key={p.id} className="p-4 bg-white rounded-2xl border border-[#E6E1D5] animate-pulse h-80" />
            ))}
          </div>
        </div>
      }
    >
      <CatalogClientView initialProducts={initialProducts} />
    </Suspense>
  );
}
