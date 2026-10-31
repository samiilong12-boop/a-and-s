'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useProducts } from '@/context/ProductContext';
import ProductStudioEditor from '@/components/admin/ProductStudioEditor';
import { Loader2 } from 'lucide-react';

export default function EditProductStudioPage() {
  const params = useParams();
  const idOrSlug = params?.id as string;
  const { products } = useProducts();

  const product = useMemo(() => {
    if (!idOrSlug) return null;
    const decoded = decodeURIComponent(idOrSlug).toLowerCase().trim();
    return (
      products.find(
        (p) =>
          p.id.toLowerCase() === decoded ||
          (p.slug && p.slug.toLowerCase() === decoded)
      ) || null
    );
  }, [products, idOrSlug]);

  if (!product && products.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0E0E] text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-teal-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-serif text-sm">جاري تحميل بيانات العطر من الاستوديو...</span>
        </div>
      </div>
    );
  }

  if (!product && products.length > 0) {
    return (
      <div className="min-h-screen bg-[#0A0E0E] text-slate-100 flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <h1 className="font-serif text-xl font-bold text-white">العطر غير موجود</h1>
        <p className="text-xs text-slate-400">لم يتم العثور على عطر يحمل المعرف أو الرابط المحدد.</p>
        <a
          href="/admin/products"
          className="bg-teal-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
        >
          العودة لقائمة العطور
        </a>
      </div>
    );
  }

  return <ProductStudioEditor mode="edit" initialProduct={product} />;
}
