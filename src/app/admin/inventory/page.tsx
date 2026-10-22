'use client';

import React, { useState } from 'react';
import { Layers, ArrowDownRight, ArrowUpRight, Plus, RefreshCw, ShieldCheck } from 'lucide-react';
import { DEMO_PRODUCTS } from '@/lib/data/products';

export default function AdminInventoryPage() {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-[#C6A66B] uppercase">
            Inventory Audit & Concurrency Log
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5F2EB] mt-0.5">
            Stock Movements & Adjustments
          </h1>
          <p className="text-xs text-[#9EABA7]">
            Every stock change is recorded with an immutable audit entry and reason code (E2).
          </p>
        </div>

        <button
          onClick={() => alert('Manual stock adjustment dialog will open here.')}
          className="btn-primary px-4 py-2 rounded text-xs tracking-wider uppercase font-bold self-start sm:self-auto flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#080A0A]" />
          <span>Record Stock Adjustment</span>
        </button>
      </div>

      <div className="bg-[#0E1212] rounded-xl border border-[#1A2624] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111716] text-[#9EABA7] uppercase tracking-wider text-[10px] border-b border-[#1A2624]">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Perfume & SKU</th>
                <th className="p-3.5">Change</th>
                <th className="p-3.5">Movement Type</th>
                <th className="p-3.5">Stock Before → After</th>
                <th className="p-3.5">Reason & Reference</th>
                <th className="p-3.5">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2624]">
              {movements.map((mov) => {
                const isNegative = mov.quantityChange < 0;
                return (
                  <tr key={mov.id} className="hover:bg-[#141A19]/50 transition-colors">
                    <td className="p-3.5 text-[#9EABA7] font-mono">{mov.timestamp}</td>
                    <td className="p-3.5">
                      <p className="font-serif font-bold text-[#F5F2EB]">{mov.productName}</p>
                      <p className="text-[10px] text-[#66D9C5] font-mono">{mov.variantSku}</p>
                    </td>
                    <td className="p-3.5 font-bold">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                          isNegative
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {isNegative ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        {isNegative ? mov.quantityChange : `+${mov.quantityChange}`}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#D5D1C7] font-medium">{mov.type}</td>
                    <td className="p-3.5 font-mono text-xs">
                      <span className="text-[#9EABA7]">{mov.previousStock}</span>
                      <span className="text-[#C6A66B] mx-2">→</span>
                      <span className="text-[#F5F2EB] font-bold">{mov.newStock}</span>
                    </td>
                    <td className="p-3.5 text-[#D5D1C7]">{mov.reason}</td>
                    <td className="p-3.5 text-[#6C7A77]">{mov.user}</td>
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
