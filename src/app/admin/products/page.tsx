'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Package, Eye, Star, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DEMO_PRODUCTS, FRAGRANCE_FAMILIES } from '@/lib/data/products';
import { formatPrice } from '@/lib/currency';

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');

  const filtered = DEMO_PRODUCTS.filter((product) => {
    if (selectedFamily !== 'All' && product.fragranceFamily !== selectedFamily) return false;
    
    const isLow = product.variants.some((v) => v.stockQuantity <= v.lowStockThreshold);
    if (stockFilter === 'low' && !isLow) return false;
    if (stockFilter === 'normal' && isLow) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = product.nameEn.toLowerCase().includes(term);
      const matchSku = product.variants.some((v) => v.sku.toLowerCase().includes(term));
      if (!matchName && !matchSku) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-[#C6A66B] uppercase">
            Fragrance Formulation Catalog
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5F2EB] mt-0.5">
            Products & Variants ({DEMO_PRODUCTS.length})
          </h1>
          <p className="text-xs text-[#9EABA7]">
            Manage all 120 luxury formulations, variants (50ml / 100ml), SKUs, and confidential production costs.
          </p>
        </div>

        <button
          onClick={() => alert('New fragrance creation form will open here.')}
          className="btn-primary px-4 py-2 rounded text-xs tracking-wider uppercase font-bold self-start sm:self-auto flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#080A0A]" />
          <span>Add New Fragrance</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#0E1212] p-4 rounded-xl border border-[#1A2624] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap text-xs">
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="bg-[#111716] border border-[#1A2624] rounded px-3 py-2 text-[#F5F2EB] focus:outline-none focus:border-[#66D9C5]"
          >
            <option value="All">All Fragrance Families</option>
            {FRAGRANCE_FAMILIES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="bg-[#111716] border border-[#1A2624] rounded px-3 py-2 text-[#F5F2EB] focus:outline-none focus:border-[#66D9C5]"
          >
            <option value="All">All Stock Levels</option>
            <option value="low">Low Inventory Only</option>
            <option value="normal">Normal Stock</option>
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#9EABA7] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full bg-[#111716] border border-[#1A2624] rounded-lg pl-9 pr-3 py-2 text-xs text-[#F5F2EB] placeholder-[#6C7A77] focus:outline-none focus:border-[#66D9C5]"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#0E1212] rounded-xl border border-[#1A2624] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111716] text-[#9EABA7] uppercase tracking-wider text-[10px] border-b border-[#1A2624]">
              <tr>
                <th className="p-3.5">Perfume & Image</th>
                <th className="p-3.5">Family & Concentration</th>
                <th className="p-3.5">Variants & SKUs</th>
                <th className="p-3.5">Retail Price (EGP)</th>
                <th className="p-3.5">Internal COGS (Confidential)</th>
                <th className="p-3.5">Stock Available</th>
                <th className="p-3.5 text-right">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2624]">
              {filtered.slice(0, 30).map((product) => {
                const defaultVariant = product.variants[0];
                const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
                const isLow = totalStock <= 10;
                return (
                  <tr key={product.id} className="hover:bg-[#141A19]/50 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img
                        src={product.images[0]?.url}
                        alt=""
                        className="w-10 h-12 object-cover bg-[#080A0A] rounded border border-[#1A2624]"
                      />
                      <div>
                        <p className="font-serif font-bold text-[#F5F2EB] line-clamp-1">{product.nameEn}</p>
                        <p className="text-[10px] text-[#6C7A77]">ID: {product.id}</p>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <p className="text-[#C6A66B] font-medium">{product.fragranceFamily}</p>
                      <p className="text-[10px] text-[#9EABA7]">{product.concentration.replace(/_/g, ' ')}</p>
                    </td>
                    <td className="p-3.5 text-xs text-[#D5D1C7] space-y-0.5 font-mono">
                      {product.variants.map((v) => (
                        <p key={v.id} className="text-[11px]">
                          {v.volumeMl}ml: <span className="text-[#66D9C5]">{v.sku}</span>
                        </p>
                      ))}
                    </td>
                    <td className="p-3.5 font-semibold text-[#66D9C5]">
                      {formatPrice(defaultVariant.regularPriceInPiasters)}
                    </td>
                    <td className="p-3.5 font-mono text-[#C6A66B]">
                      {defaultVariant.costPriceInPiasters ? formatPrice(defaultVariant.costPriceInPiasters) : 'N/A'}
                    </td>
                    <td className="p-3.5">
                      {isLow ? (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{totalStock} bottles</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium">{totalStock} bottles</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/product/${product.slug}`}
                        target="_blank"
                        className="p-1.5 text-[#9EABA7] hover:text-[#66D9C5] inline-block"
                        title="View on Storefront"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#111716] border-t border-[#1A2624] text-xs text-[#9EABA7] text-center">
          Showing first 30 of {filtered.length} products. Full catalog supports pagination and bulk operations.
        </div>
      </div>
    </div>
  );
}
