import type { Metadata } from 'next';
import { Bodoni_Moda, Jost } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { Footer } from '@/components/Footer';

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
  title: 'A AND S — Haute Parfumerie | Luxury Fragrances',
  description: 'The art of leaving an impression. Discover handcrafted luxury fragrances and rare essences from A AND S, delivered across Egypt.',
  keywords: ['luxury perfume Egypt', 'A AND S fragrance', 'high concentration oud', 'extrait de parfum Cairo', 'niche perfumes Egypt'],
  openGraph: {
    title: 'A AND S — Haute Parfumerie',
    description: 'The art of leaving an impression. Handcrafted luxury fragrances, delivered across Egypt with cash on delivery.',
    type: 'website',
    locale: 'en_EG',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodoniModa.variable} ${jost.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#080A0A] text-[#F5F2EB] font-sans antialiased selection:bg-[#66D9C5] selection:text-[#080A0A]">
        <CartProvider>
          <AnnouncementBar />
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <CartDrawer />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
