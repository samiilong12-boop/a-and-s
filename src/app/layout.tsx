import type { Metadata } from 'next';
import { Bodoni_Moda, Jost } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { ProductProvider } from '@/context/ProductContext';
import { CartProvider } from '@/context/CartContext';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { Footer } from '@/components/Footer';
import { FloatingContact } from '@/components/FloatingContact';

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
  title: 'A AND S — Haute Parfumerie | دار العطور الفاخرة',
  description: 'The art of leaving an impression. Discover handcrafted luxury fragrances and rare essences from A AND S, delivered across Egypt with cash on delivery. فن ترك الانطباع الذي لا يُنسى.',
  keywords: ['luxury perfume Egypt', 'A AND S fragrance', 'عطور فاخرة مصر', 'عود فاخر القاهرة', 'extrait de parfum Cairo', 'niche perfumes Egypt'],
  openGraph: {
    title: 'A AND S — Haute Parfumerie',
    description: 'The art of leaving an impression. Handcrafted luxury fragrances, delivered across Egypt with cash on delivery.',
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
      <body className="min-h-screen flex flex-col bg-white text-[#0A0D0D] font-sans antialiased selection:bg-[#B8934A] selection:text-white">
        <LanguageProvider>
          <ProductProvider>
            <CartProvider>
              <AnnouncementBar />
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <CartDrawer />
              <Footer />
              <FloatingContact />
            </CartProvider>
          </ProductProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
