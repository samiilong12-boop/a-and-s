import type { Metadata } from 'next';
import { Bodoni_Moda, Jost } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { ProductProvider } from '@/context/ProductContext';
import { CartProvider } from '@/context/CartContext';
import { CustomRequestProvider } from '@/context/CustomRequestContext';
import { FragranceFinderProvider } from '@/context/FragranceFinderContext';
import { SiteContentProvider } from '@/context/SiteContentContext';
import { StorefrontShell } from '@/components/StorefrontShell';

const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni-moda',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'رَحِيق (RAHEEQ) — دار العطور الملكية الفاخرة | Haute Parfumerie',
  description:
    'دار رحيق للعطور الفاخرة — فن ترك الانطباع الذي لا يُنسى. أرقى العطور العالمية والتركيبات الخاصة المصنوعة بأندر الزيوت المعتقة، شحن سريع ومعاينة عند الاستلام في جميع أنحاء مصر.',
  keywords: [
    'عطور رحيق',
    'Raheeq perfume',
    'luxury perfume Egypt',
    'دار رحيق للعطور',
    'عطور فاخرة مصر',
    'تركيبات عطور خاصة',
    'extrait de parfum Cairo',
  ],
  openGraph: {
    title: 'رَحِيق (RAHEEQ) — دار العطور الملكية الفاخرة',
    description:
      'دار رحيق للعطور الفاخرة — فن ترك الانطباع الذي لا يُنسى. أرقى العطور والتركيبات الخاصة مع المعاينة عند الاستلام.',
    type: 'website',
    locale: 'ar_EG',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${bodoniModa.variable} ${jost.variable}`}>
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
