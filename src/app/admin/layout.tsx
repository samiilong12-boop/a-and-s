'use client';

import React, { useState } from 'react';
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
  Bell,
  Sparkles,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Overview Analytics', href: '/admin', icon: LayoutDashboard },
    { label: 'Orders & COD Settlement', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Product Catalog', href: '/admin/products', icon: Package },
    { label: 'Inventory Movements', href: '/admin/inventory', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-[#080A0A] text-[#F5F2EB] flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-[#0E1212] border-b border-[#1A2624] px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 text-[#9EABA7] hover:text-[#F5F2EB]"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold tracking-widest text-[#F5F2EB]">A AND S</span>
            <span className="text-[10px] tracking-widest uppercase bg-[#C6A66B]/10 text-[#C6A66B] border border-[#C6A66B]/30 px-2 py-0.5 rounded font-mono">
              Admin Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs text-[#9EABA7] hover:text-[#66D9C5] flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>

          <div className="flex items-center gap-2 pl-3 border-l border-[#1A2624]">
            <div className="w-7 h-7 rounded-full bg-[#141A19] border border-[#66D9C5]/40 flex items-center justify-center text-[#66D9C5] text-xs font-bold">
              AS
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-semibold text-[#F5F2EB]">Super Administrator</p>
              <p className="text-[10px] text-[#C6A66B]">Role: ADMIN</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 bg-[#0E1212] border-r border-[#1A2624] flex-col p-4 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#6C7A77] font-semibold px-3">
              Management
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#141A19] text-[#66D9C5] border border-[#66D9C5]/30'
                      : 'text-[#9EABA7] hover:text-[#F5F2EB] hover:bg-[#111716]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-[#1A2624] space-y-2 px-3">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#6C7A77] font-semibold block">
              Market Specifics
            </span>
            <div className="p-3 bg-[#111716] rounded border border-[#1A2624] text-[11px] space-y-1">
              <p className="text-[#F5F2EB] font-semibold">Store Currency: EGP</p>
              <p className="text-[#9EABA7]">Egypt Standard Time (Cairo)</p>
              <p className="text-[#66D9C5]">Cash on Delivery Only</p>
            </div>
          </div>
        </aside>

        {/* Main Admin Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
