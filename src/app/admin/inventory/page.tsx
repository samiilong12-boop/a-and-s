'use client';

import React, { useState } from 'react';
import { Layers, ArrowDownRight, ArrowUpRight, Plus, RefreshCw, ShieldCheck } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';

export default function AdminInventoryPage() {
  const { products } = useProducts();

  const [movements] = useState([
    {
      id: 'mov-001',
      variantSku: 'AS-001-100ML',
      productName: 'A AND S — Royal Sovereign Oud',
      quantityChange: -1,
      type: 'PURCHASE_DEDUCTION',
      previousStock: 19,
      newStock: 18,
      reason: 'Order AS-202610-1001 fulfillment',
      user: 'Automated Checkout',
      timestamp: new Date(Date.now() - 3600000).toLocaleString('en-EG'),
    },
    {
      id: 'mov-002',
      variantSku: 'AS-002-50ML',
      productName: 'A AND S — Saffron Mirage',
      quantityChange: -1,
      type: 'PURCHASE_DEDUCTION',
      previousStock: 25,
      newStock: 24,
      reason: 'Order AS-202610-1002 fulfillment',
      user: 'Automated Checkout',
      timestamp: new Date(Date.now() - 14400000).toLocaleString('en-EG'),
    },
    {
      id: 'mov-003',
      variantSku: 'AS-005-100ML',
      productName: 'A AND S — Alexandria Imperial',
      quantityChange: 15,
      type: 'MANUAL_RESTOCK',
      previousStock: 3,
      newStock: 18,
      reason: 'Cairo Atelier Batch #EG-2026-B4 Received',
      user: 'Super Administrator',
      timestamp: new Date(Date.now() - 86400000).toLocaleString('en-EG'),
    },
    {
      id: 'mov-004',
      variantSku: 'AS-011-50ML',
      productName: 'A AND S — Obsidian Musk',
      quantityChange: 1,
      type: 'RETURN_TO_STOCK',
      previousStock: 12,
      newStock: 13,
      reason: 'Delivery attempt failed — package inspected undamaged',
      user: 'Order Manager',
      timestamp: new Date(Date.now() - 172800000).toLocaleString('en-EG'),
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold tracking-wider text-teal-800 uppercase">
            سجل حركة المخزون والتدقيق الرقابي
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Stock Movements & Concurrency Log
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            توثيق كامل لكل خصم أو إضافة على المخزون مع السبب ورقم العملية لمنع البيع الزائد (E2).
          </p>
        </div>

        <button
          onClick={() => alert('إضافة كميات جديدة متاحة من خلال صفحة المنتجات')}
          className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs tracking-wider uppercase flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل وارد للمعمل (Receive Stock)</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3.5">التاريخ والوقت</th>
                <th className="p-3.5">العطر و كود SKU</th>
                <th className="p-3.5">الكمية</th>
                <th className="p-3.5">نوع الحركة</th>
                <th className="p-3.5">المخزون: قبل → بعد</th>
                <th className="p-3.5">السبب ورقم الإشارة</th>
                <th className="p-3.5">المسؤول</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.map((mov) => {
                const isNegative = mov.quantityChange < 0;
                return (
                  <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 text-slate-500 font-mono">{mov.timestamp}</td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{mov.productName}</p>
                      <p className="text-[10px] text-teal-700 font-mono font-semibold">{mov.variantSku}</p>
                    </td>
                    <td className="p-3.5 font-bold">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isNegative
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isNegative ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        {isNegative ? mov.quantityChange : `+${mov.quantityChange}`}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700 font-semibold">{mov.type}</td>
                    <td className="p-3.5 font-mono text-xs">
                      <span className="text-slate-500">{mov.previousStock}</span>
                      <span className="text-teal-600 mx-2 font-bold">→</span>
                      <span className="text-slate-900 font-bold">{mov.newStock}</span>
                    </td>
                    <td className="p-3.5 text-slate-700">{mov.reason}</td>
                    <td className="p-3.5 text-slate-500 font-medium">{mov.user}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
