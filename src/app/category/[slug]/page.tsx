import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getAllCategories,
  getCategoryBySlug,
  getProductsByCategory,
} from '@/lib/catalog';
import { ProductCard } from '@/components/ProductCard';
import { Sparkles, Compass, ShieldCheck, ArrowRight, Layers, Flame } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://a-and-s.vercel.app';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'قسم غير متوفر | دار رَحِيقْ للعطور',
      robots: { index: false, follow: true },
    };
  }

  const canonicalUrl = `${SITE_URL}/category/${category.slug}`;

  return {
    title: category.metaTitleAr,
    description: category.metaDescAr,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: category.metaTitleAr,
      description: category.metaDescAr,
      url: canonicalUrl,
      siteName: 'دار رَحِيقْ للعطور الملكية',
      images: [
        {
          url: '/images/raheeq-official-logo.png',
          width: 1200,
          height: 630,
          alt: category.titleAr,
        },
      ],
      type: 'website',
      locale: 'ar_EG',
    },
    twitter: {
      card: 'summary_large_image',
      title: category.metaTitleAr,
      description: category.metaDescAr,
      images: ['/images/raheeq-official-logo.png'],
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const result = getProductsByCategory(slug);

  if (!result) {
    notFound();
  }

  const { category, products } = result;
  const allCategories = getAllCategories().filter((c) => c.slug !== category.slug);
  const canonicalUrl = `${SITE_URL}/category/${category.slug}`;

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
            name: category.titleAr,
            item: canonicalUrl,
          },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}#collection`,
        name: category.titleAr,
        description: category.metaDescAr,
        url: canonicalUrl,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: products.length,
          itemListElement: products.map((prod, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_URL}/product/${prod.slug || prod.id}`,
            name: prod.nameAr || prod.nameEn,
          })),
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-[#576563]">
          <Link href="/" className="hover:text-[#080A0A] transition-colors">الرئيسية</Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-[#080A0A] transition-colors">كتالوج العطور</Link>
          <span>/</span>
          <span className="text-[#0D9488] font-bold">{category.titleAr}</span>
        </nav>

        {/* Category Hero & Educational Guide Banner */}
        <div className="bg-[#080A0A] text-white rounded-3xl p-8 sm:p-12 border border-[#2DD4BF]/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#2DD4BF]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2DD4BF]/20 border border-[#2DD4BF]/40 text-[#2DD4BF] text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{category.badgeAr}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              {category.titleAr}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {category.descriptionAr}
            </p>

            {/* Characteristic Notes Pills */}
            <div className="pt-2 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400">أبرز النوتات في هذا القسم:</span>
              {category.olfactoryNotesHint.map((note) => (
                <span
                  key={note}
                  className="bg-white/10 border border-white/20 text-white text-xs px-2.5 py-1 rounded-lg font-medium"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Value Prop Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E6E1D5] flex items-center gap-3">
            <Flame className="w-6 h-6 text-[#0D9488] flex-shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-[#080A0A]">تركيز 30% Extrait خالص</h4>
              <p className="text-[11px] text-[#788784]">زيوت عطرية فرنسية مركزة تدوم +14 ساعة</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E6E1D5] flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#0D9488] flex-shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-[#080A0A]">فحص الطرد قبل السداد كاش</h4>
              <p className="text-[11px] text-[#788784]">عاين الزجاجة والرائحة عند باب بيتك بأمان</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E6E1D5] flex items-center gap-3">
            <Compass className="w-6 h-6 text-[#0D9488] flex-shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-[#080A0A]">هوية نيش مستقلة</h4>
              <p className="text-[11px] text-[#788784]">توليفات خاصة مستوحاة من أعرق النفحات العالمية</p>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#E6E1D5] pb-4">
            <h2 className="font-serif text-2xl font-bold text-[#080A0A]">
              تشكيلة {category.titleAr} ({products.length} عطور)
            </h2>
            <Link href="/catalog" className="text-xs text-[#0D9488] font-bold hover:underline">
              عرض الكتالوج كاملاً ←
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E6E1D5] p-12 text-center space-y-3">
              <h3 className="font-serif text-xl font-bold text-[#080A0A]">جاري تجهيز توليفات جديدة في هذا القسم</h3>
              <p className="text-xs text-[#788784]">تفضل بتصفح بقية أقسام الكتالوج أو طلب خلطة خاصة عبر المعمل.</p>
              <Link href="/catalog" className="btn-turquoise px-6 py-2.5 rounded-xl text-xs font-bold inline-block">
                تصفح جميع العطور
              </Link>
            </div>
          )}
        </div>

        {/* Other Fragrance Families (Internal Linking) */}
        <div className="bg-white rounded-3xl p-8 border border-[#E6E1D5] space-y-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-[#0D9488] font-bold font-mono">
              استكشف العائلات العطرية الأخرى
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#080A0A]">
              تصفح حسب الطابع العطري المفضل
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {allCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="p-3.5 bg-[#FAF8F4] hover:bg-[#2DD4BF]/10 rounded-2xl border border-[#E6E1D5] hover:border-[#2DD4BF]/50 transition-all text-center group cursor-pointer"
              >
                <span className="font-serif font-bold text-xs text-[#080A0A] group-hover:text-[#0D9488] block transition-colors">
                  {cat.titleAr}
                </span>
                <span className="text-[10px] text-[#788784] mt-1 block">
                  {cat.titleEn}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
