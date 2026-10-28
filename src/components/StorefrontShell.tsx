'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { Footer } from '@/components/Footer';
import { FloatingContact } from '@/components/FloatingContact';
import { CustomPerfumeRequestModal } from '@/components/CustomPerfumeRequestModal';
import { CookieConsent } from '@/components/CookieConsent';
import { ClientAnalyticsTracker } from '@/components/ClientAnalyticsTracker';

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <CartDrawer />
      <Footer />
      <FloatingContact />
      <CustomPerfumeRequestModal />
      <CookieConsent />
      <ClientAnalyticsTracker />
    </>
  );
}
