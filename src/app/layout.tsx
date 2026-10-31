import type { Metadata, Viewport } from 'next';
import { Bodoni_Moda, Jost, Cairo, Amiri } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { ProductProvider } from '@/context/ProductContext';
import { CartProvider } from '@/context/CartContext';
import { CustomRequestProvider } from '@/context/CustomRequestContext';
import { FragranceFinderProvider } from '@/context/FragranceFinderContext';
import { SiteContentProvider } from '@/context/SiteContentContext';
import { StorefrontShell } from '@/components/StorefrontShell';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#080A0A',
};

const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni-moda',
  display: 'swap',
  weight: ['600', '700'],
});

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
  display: 'swap',
  weight: ['400', '600'],
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['400', '700'],
});

const amiri = Amiri({
  subsets: ['arabic'],
  variable: '--font-amiri',
  display: 'swap',
  weight: ['700'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://a-and-s.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'رَحِيق (RAHEEQ) — دار العطور الملكية الفاخرة | Haute Parfumerie',
    template: '%s | دار رَحِيقْ للعطور',
  },
  description:
    'دار رحيق للعطور الفاخرة — توليفات نيش مستقلة بتركيز Extrait de Parfum مستوحاة من أرقى الخطوط العطرية العالمية بأندر الزيوت المعتقة، مع فتح الشحنة والمعاينة عند الاستلام في مصر.',
  keywords: [
    'عطور رحيق',
    'Raheeq perfume',
    'عطور مستوحاة مصر',
    'عطور نيش القاهرة',
    'دار رحيق للعطور',
    'عطور فاخرة مصر',
    'تركيبات عطور خاصة',
    'extrait de parfum Cairo',
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'رَحِيق (RAHEEQ) — دار العطور الملكية الفاخرة',
    description:
      'توليفات نيش مستقلة بتركيز Extrait de Parfum مع المعاينة عند الاستلام قبل الدفع.',
    url: SITE_URL,
    siteName: 'دار رَحِيقْ للعطور الملكية',
    images: [
      {
        url: '/images/raheeq-official-logo.png',
        width: 1200,
        height: 630,
        alt: 'شعار دار رَحِيقْ للعطور الملكية الفاخرة',
      },
    ],
    type: 'website',
    locale: 'ar_EG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'رَحِيق (RAHEEQ) — دار العطور الملكية الفاخرة',
    description: 'عطور نيش ملكية بتركيز Extrait de Parfum مع المعاينة عند الباب.',
    images: ['/images/raheeq-official-logo.png'],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'google-site-verification-raheeq',
  },
};

const organizationAndWebsiteSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'دار رَحِيقْ للعطور الملكية',
      alternateName: ['RAHEEQ Haute Parfumerie', 'Raheeq Perfumes', 'دار رحيق'],
      url: SITE_URL,
      logo: `${SITE_URL}/images/raheeq-official-logo.png`,
      description: 'دار عطور نيش مصرية مستقلة متخصصة في ابتكار توليفات عطرية بتركيز Extrait de Parfum مستوحاة من أرقى الخطوط العطرية العالمية مع فحص الشحنة عند الباب قبل السداد.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Cairo',
        addressRegion: 'Cairo Governorate',
        addressCountry: 'EG',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+201131068790',
        contactType: 'customer service',
        availableLanguage: ['Arabic', 'English'],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'دار رَحِيقْ للعطور الملكية',
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/catalog?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${amiri.variable} ${bodoniModa.variable} ${jost.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationAndWebsiteSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F6F3EC] text-[#080A0A] font-sans antialiased selection:bg-[#2DD4BF] selection:text-[#080A0A]">
        <LanguageProvider>
          <SiteContentProvider>
            <ProductProvider>
              <CartProvider>
                <CustomRequestProvider>
                  <FragranceFinderProvider>
                    <StorefrontShell>
                      {children}
                    </StorefrontShell>
                  </FragranceFinderProvider>
                </CustomRequestProvider>
              </CartProvider>
            </ProductProvider>
          </SiteContentProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
