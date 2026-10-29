'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  ArrowLeft,
  ShieldCheck,
  Menu,
  X,
  Lock,
  Eye,
  LogOut,
  Film,
  Sparkles,
  QrCode,
  BarChart3,
} from 'lucide-react';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';
import { useSiteContent } from '@/context/SiteContentContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { siteContent } = useSiteContent();
  const logoUrl = siteContent.brandLogoUrl || '/images/raheeq-official-logo.png';

  const navItems = [
    { label: 'نظرة عامة على الأرباح (Overview)', href: '/admin', icon: LayoutDashboard },
    { label: 'تحليل الزوار والنقرات والتحويل (Analytics)', href: '/admin/analytics', icon: BarChart3 },
    { label: 'طلبات العطور والخلطات (Bespoke)', href: '/admin/custom-requests', icon: Sparkles },
    { label: 'المنتجات والعطور (50+ Perfumes)', href: '/admin/products', icon: Package },
    { label: 'الواجهة والصور والكلام (CMS & Media)', href: '/admin/media', icon: Sparkles },
    { label: 'كود QR والتغليف (QR Packaging)', href: '/admin/qr', icon: QrCode },
    { label: 'الطلبات وفواتير الدفع (Orders & COD)', href: '/admin/orders', icon: ShoppingBag },
    { label: 'المخزون وحركة القطع (Inventory)', href: '/admin/inventory', icon: Layers },
  ];

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Admin Header Bar (Clean White) */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="Raheeq" className="w-8 h-8 object-cover rounded-full border border-[#D4AF37]/40 shadow-xs" />
            <span className="font-serif text-lg font-bold tracking-wider text-slate-900">رَحِيقْ | RAHEEQ</span>
            <span className="text-[10px] tracking-widest uppercase bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-bold font-mono">
              Staff Portal
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              <Lock className="w-3 h-3" />
              <span>قفل تلقائي 10 دقائق</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs text-slate-600 hover:text-teal-700 font-medium flex items-center gap-1.5 transition-colors bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </Link>

          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              AS
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-bold text-slate-900">Brand Owner & Admin</p>
              <p className="text-[10px] text-teal-700 font-medium">Full Access (إدارة المنتجات والأموال)</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Desktop Sidebar (Clean White & Slate) */}
        <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col p-4 space-y-6 shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-bold px-3">
              Management Sections
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 border border-teal-300'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-teal-700" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-slate-200 space-y-2 px-3">
            <span className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-bold block">
              Market Configuration
            </span>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-1.5">
              <div className="flex justify-between text-slate-700">
                <span>Currency:</span>
                <strong className="text-slate-900 font-bold">Egyptian Pound (EGP)</strong>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Payment:</span>
                <strong className="text-teal-700 font-bold">Cash on Delivery</strong>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Timezone:</span>
                <span className="text-slate-600">Africa/Cairo</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area (Clean High-Contrast White Background) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
    </AdminAuthGuard>
  );
}
