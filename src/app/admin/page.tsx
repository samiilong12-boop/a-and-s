'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Truck,
  DollarSign,
  Package,
  Layers,
} from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { DEMO_PRODUCTS } from '@/lib/data/products';
import { getOrderStatusLabel, getPaymentStatusLabel } from '@/lib/state-machines';

export default function AdminOverviewPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('a_and_s_demo_orders');
      if (stored) {
        setOrders(JSON.parse(stored));
      } else {
        // Seed initial demo orders if empty to display realistic analytics
        const seedOrders = [
          {
            id: 'ord-seed-01',
            orderNumber: 'AS-202610-1001',
            customerName: 'Youssef El-Gendy',
            customerPhone: '01012345678',
            governorate: 'Cairo',
            city: 'New Cairo',
            streetAddress: 'Road 90 North, Villa 12',
            status: 'PENDING_CONFIRMATION',
            paymentStatus: 'PENDING_COLLECTION',
            subtotalInPiasters: 480000,
            shippingInPiasters: 0,
            totalInPiasters: 480000,
            totalCostInPiasters: 168000,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            items: [
              {
                id: 'itm-1',
                productNameSnapshot: 'A AND S — Royal Sovereign Oud',
                variantTitleSnapshot: '100ml Eau De Parfum',
                skuSnapshot: 'AS-001-100ML',
                quantity: 1,
                unitPriceInPiasters: 480000,
                subtotalInPiasters: 480000,
              },
            ],
          },
          {
            id: 'ord-seed-02',
            orderNumber: 'AS-202610-1002',
            customerName: 'Mariam Soliman',
            customerPhone: '01223456789',
            governorate: 'Alexandria',
            city: 'Gleem',
            streetAddress: '15 Corniche Road',
            status: 'CONFIRMED',
            paymentStatus: 'PENDING_COLLECTION',
            subtotalInPiasters: 240000,
            shippingInPiasters: 6500,
            totalInPiasters: 246500,
            totalCostInPiasters: 84000,
            createdAt: new Date(Date.now() - 14400000).toISOString(),
            items: [
              {
                id: 'itm-2',
                productNameSnapshot: 'A AND S — Saffron Mirage',
                variantTitleSnapshot: '50ml Eau De Parfum',
                skuSnapshot: 'AS-002-50ML',
                quantity: 1,
                unitPriceInPiasters: 240000,
                subtotalInPiasters: 240000,
              },
            ],
          },
          {
            id: 'ord-seed-03',
            orderNumber: 'AS-202610-1003',
            customerName: 'Karim Mansour',
            customerPhone: '01134567890',
            governorate: 'Giza',
            city: 'Sheikh Zayed',
            streetAddress: 'Beverly Hills, Compound 4',
            status: 'DELIVERED',
            paymentStatus: 'COLLECTED_BY_COURIER',
            courierName: 'Aramex Egypt',
            trackingNumber: 'ARAMEX-EG-998812',
            subtotalInPiasters: 520000,
            shippingInPiasters: 0,
            totalInPiasters: 520000,
            totalCostInPiasters: 182000,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            items: [
              {
                id: 'itm-3',
                productNameSnapshot: 'A AND S — Velvet Ambergris',
                variantTitleSnapshot: '100ml Eau De Parfum',
                skuSnapshot: 'AS-003-100ML',
                quantity: 1,
                unitPriceInPiasters: 520000,
                subtotalInPiasters: 520000,
              },
            ],
          },
        ];
        localStorage.setItem('a_and_s_demo_orders', JSON.stringify(seedOrders));
        setOrders(seedOrders);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Financial KPIs Calculations (E1)
  const totalOrders = orders.length;
  const grossSalesInPiasters = orders.reduce((sum, o) => sum + (o.subtotalInPiasters || 0), 0);
  const totalCogsInPiasters = orders.reduce((sum, o) => sum + (o.totalCostInPiasters || 0), 0);
  const estimatedGrossProfitInPiasters = grossSalesInPiasters - totalCogsInPiasters;
  const averageOrderValueInPiasters = totalOrders > 0 ? Math.round(grossSalesInPiasters / totalOrders) : 0;

  // Order status counts
  const pendingCount = orders.filter((o) => o.status === 'PENDING_CONFIRMATION').length;
  const confirmedCount = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PROCESSING').length;
  const outForDeliveryCount = orders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;

  // Inventory analysis
  const lowStockCount = DEMO_PRODUCTS.filter((p) =>
    p.variants.some((v) => v.stockQuantity <= v.lowStockThreshold)
  ).length;

  return (
    <div className="space-y-8">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-[#C6A66B] uppercase">
            A AND S Executive Analytics
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5F2EB] mt-0.5">
            Store Performance & Orders
          </h1>
          <p className="text-xs text-[#9EABA7]">
            Real-time financial metrics, inventory indicators, and Egypt Cash-on-Delivery fulfillment status.
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="btn-primary px-4 py-2 rounded text-xs tracking-wider uppercase font-bold self-start sm:self-auto flex items-center gap-2"
        >
          <span>Manage Orders</span>
          <ArrowRight className="w-4 h-4 text-[#080A0A]" />
        </Link>
      </div>

      {/* Financial KPIs Matrix (E1 Financial Integrity) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="p-5 bg-[#0E1212] border border-[#1A2624] rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-[#9EABA7]">
            <span>Gross Merchandise Sales</span>
            <TrendingUp className="w-4 h-4 text-[#66D9C5]" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#66D9C5]">
            {formatPrice(grossSalesInPiasters)}
          </p>
          <p className="text-[10px] text-[#6C7A77]">Calculated from all placed orders</p>
        </div>

        {/* Estimated Gross Profit (E1: clearly distinguished from revenue) */}
        <div className="p-5 bg-[#0E1212] border border-[#1A2624] rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-[#9EABA7]">
            <span>Est. Gross Profit (COGS Deducted)</span>
            <DollarSign className="w-4 h-4 text-[#C6A66B]" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#C6A66B]">
            {formatPrice(estimatedGrossProfitInPiasters)}
          </p>
          <p className="text-[10px] text-[#6C7A77]">Gross Sales minus estimated product costs</p>
        </div>

        {/* Total Orders & AOV */}
        <div className="p-5 bg-[#0E1212] border border-[#1A2624] rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-[#9EABA7]">
            <span>Total Orders & AOV</span>
            <ShoppingBag className="w-4 h-4 text-[#F5F2EB]" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#F5F2EB]">
            {totalOrders} Orders
          </p>
          <p className="text-[10px] text-[#9EABA7]">
            Average Value: <strong className="text-[#66D9C5]">{formatPrice(averageOrderValueInPiasters)}</strong>
          </p>
        </div>

        {/* Low Stock Watch */}
        <div className="p-5 bg-[#0E1212] border border-[#1A2624] rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-[#9EABA7]">
            <span>Low Inventory Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-amber-400">
            {lowStockCount} Products
          </p>
          <p className="text-[10px] text-[#6C7A77]">Stock below threshold ({DEMO_PRODUCTS.length} total)</p>
        </div>
      </div>

      {/* Cash on Delivery Fulfillment Pipeline (E10) */}
      <div className="p-6 bg-[#0E1212] border border-[#1A2624] rounded-xl space-y-4 shadow-xl">
        <h3 className="font-serif text-base font-bold text-[#F5F2EB]">
          Egypt Cash-on-Delivery Lifecycle Pipeline
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#111716] border border-amber-400/30 rounded-lg">
            <span className="text-[#9EABA7] block text-[11px]">1. Pending Confirmation</span>
            <span className="text-xl font-bold text-amber-400 block mt-1">{pendingCount}</span>
            <span className="text-[10px] text-[#6C7A77]">Awaiting phone verify</span>
          </div>

          <div className="p-3 bg-[#111716] border border-teal-400/30 rounded-lg">
            <span className="text-[#9EABA7] block text-[11px]">2. Confirmed & Packing</span>
            <span className="text-xl font-bold text-teal-400 block mt-1">{confirmedCount}</span>
            <span className="text-[10px] text-[#6C7A77]">Ready for courier</span>
          </div>

          <div className="p-3 bg-[#111716] border border-purple-400/30 rounded-lg">
            <span className="text-[#9EABA7] block text-[11px]">3. Out For Delivery</span>
            <span className="text-xl font-bold text-purple-400 block mt-1">{outForDeliveryCount}</span>
            <span className="text-[10px] text-[#6C7A77]">With courier in transit</span>
          </div>

          <div className="p-3 bg-[#111716] border border-emerald-400/30 rounded-lg">
            <span className="text-[#9EABA7] block text-[11px]">4. Delivered & Collected</span>
            <span className="text-xl font-bold text-emerald-400 block mt-1">{deliveredCount}</span>
            <span className="text-[10px] text-[#6C7A77]">Cash collected</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="p-6 bg-[#0E1212] border border-[#1A2624] rounded-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-base font-bold text-[#F5F2EB]">
            Recent Customer Orders
          </h3>
          <Link
            href="/admin/orders"
            className="text-xs text-[#66D9C5] hover:underline"
          >
            View All ({orders.length}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111716] text-[#9EABA7] uppercase tracking-wider text-[10px] border-b border-[#1A2624]">
              <tr>
                <th className="p-3">Order Ref</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Governorate</th>
                <th className="p-3">Order Status</th>
                <th className="p-3">COD Status</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2624]">
              {orders.slice(0, 5).map((order) => {
                const statusMeta = getOrderStatusLabel(order.status);
                const payMeta = getPaymentStatusLabel(order.paymentStatus);
                return (
                  <tr key={order.id} className="hover:bg-[#141A19]/50 transition-colors">
                    <td className="p-3 font-mono text-[#66D9C5] font-semibold">
                      {order.orderNumber}
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-[#F5F2EB]">{order.customerName}</p>
                      <p className="text-[11px] text-[#6C7A77]">{order.customerPhone}</p>
                    </td>
                    <td className="p-3 text-[#D5D1C7]">{order.governorate}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusMeta.colorClass}`}>
                        {statusMeta.labelEn}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-[11px] font-medium ${payMeta.colorClass}`}>
                        {payMeta.labelEn}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-[#F5F2EB]">
                      {formatPrice(order.totalInPiasters)}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/admin/orders?highlight=${order.orderNumber}`}
                        className="text-xs text-[#66D9C5] hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
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
