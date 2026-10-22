'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Package, Clock, Truck, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { getOrderStatusLabel, getPaymentStatusLabel } from '@/lib/state-machines';
import { validateEgyptianPhone } from '@/lib/phone-validation';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';

  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNumber);
  const [phoneInput, setPhoneInput] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setHasSearched(true);

    if (!orderNumberInput.trim()) {
      setErrorMessage('Please enter your order reference number');
      return;
    }

    try {
      const stored = localStorage.getItem('a_and_s_demo_orders');
      const orders = stored ? JSON.parse(stored) : [];
      
      const found = orders.find(
        (o: any) => o.orderNumber.toLowerCase() === orderNumberInput.trim().toLowerCase()
      );

      if (found) {
        // If phone is entered, verify match
        if (phoneInput.trim()) {
          const normPhone = validateEgyptianPhone(phoneInput).normalizedPhone;
          if (found.customerPhone !== normPhone && !found.customerPhone.includes(phoneInput.trim())) {
            setErrorMessage('The mobile phone number does not match this order reference.');
            setSearchedOrder(null);
            return;
          }
        }
        setSearchedOrder(found);
      } else {
        setSearchedOrder(null);
        setErrorMessage('No order found with this reference number. Please check the code received upon checkout.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to search order records.');
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      handleSearch();
    }
  }, [initialOrderNumber]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="badge-gold px-3 py-1 rounded-sm font-semibold uppercase tracking-widest text-[11px]">
          Client Concierge
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#F5F2EB]">
          Track Your Fragrance Shipment
        </h1>
        <p className="text-xs text-[#9EABA7]">
          Enter your unique order number (e.g. AS-202610-1234) and mobile phone to view live fulfillment and courier updates.
        </p>
      </div>

      {/* Search Box */}
      <form onSubmit={handleSearch} className="bg-[#0E1212] p-6 rounded-xl border border-[#1A2624] space-y-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#D5D1C7] block">
              Order Reference Number
            </label>
            <input
              type="text"
              value={orderNumberInput}
              onChange={(e) => setOrderNumberInput(e.target.value)}
              placeholder="e.g. AS-202610-4589"
              className="w-full bg-[#111716] border border-[#1A2624] rounded-lg px-3.5 py-2.5 text-xs text-[#F5F2EB] uppercase placeholder-[#6C7A77] focus:outline-none focus:border-[#66D9C5]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#D5D1C7] block">
              Egyptian Mobile Phone <span className="text-[#6C7A77]">(Optional verification)</span>
            </label>
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="010XXXXXXXX"
              className="w-full bg-[#111716] border border-[#1A2624] rounded-lg px-3.5 py-2.5 text-xs text-[#F5F2EB] placeholder-[#6C7A77] focus:outline-none focus:border-[#66D9C5]"
            />
          </div>
        </div>

        {errorMessage && (
          <p className="text-xs text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </p>
        )}

        <button
          type="submit"
          className="w-full sm:w-auto btn-primary py-3 px-8 rounded-lg text-xs tracking-widest uppercase font-bold flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4 text-[#080A0A]" />
          <span>Lookup Order Status</span>
        </button>
      </form>

      {/* Search Result Display */}
      {searchedOrder && (
        <div className="bg-[#0E1212] rounded-xl border border-[#1A2624] overflow-hidden shadow-2xl space-y-6 p-6 sm:p-8">
          
          {/* Top Status Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#1A2624] gap-4">
            <div>
              <span className="text-xs text-[#9EABA7]">Order Reference</span>
              <h2 className="font-mono text-xl sm:text-2xl font-bold text-[#F5F2EB]">
                {searchedOrder.orderNumber}
              </h2>
              <p className="text-[11px] text-[#6C7A77] mt-0.5">
                Placed on {new Date(searchedOrder.createdAt).toLocaleDateString('en-EG', { dateStyle: 'long' })}
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5">
              <span className="text-[11px] text-[#9EABA7]">Fulfillment Status</span>
              {(() => {
                const statusMeta = getOrderStatusLabel(searchedOrder.status);
                return (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusMeta.colorClass}`}>
                    {statusMeta.labelEn} ({statusMeta.labelAr})
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Payment & COD Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#111716] rounded-lg border border-[#1A2624] text-xs">
            <div>
              <span className="text-[#9EABA7] block">Payment Method</span>
              <span className="font-bold text-[#F5F2EB] mt-0.5 block">Cash on Delivery (COD)</span>
            </div>

            <div>
              <span className="text-[#9EABA7] block">Cash Collection Status</span>
              {(() => {
                const payMeta = getPaymentStatusLabel(searchedOrder.paymentStatus);
                return (
                  <span className={`font-semibold mt-0.5 inline-block ${payMeta.colorClass}`}>
                    {payMeta.labelEn}
                  </span>
                );
              })()}
            </div>

            <div>
              <span className="text-[#9EABA7] block">Assigned Courier</span>
              <span className="font-semibold text-[#66D9C5] mt-0.5 block">
                {searchedOrder.courierName ? `${searchedOrder.courierName} (${searchedOrder.trackingNumber || 'Tracking Pending'})` : 'Awaiting Dispatch'}
              </span>
            </div>
          </div>

          {/* Ordered Items */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-sm text-[#F5F2EB]">
              Purchased Fragrances
            </h3>
            <div className="space-y-2">
              {searchedOrder.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-[#111716] rounded border border-[#1A2624] text-xs">
                  <div>
                    <p className="font-serif font-semibold text-[#F5F2EB]">{item.productNameSnapshot}</p>
                    <p className="text-[#C6A66B] mt-0.5">{item.variantTitleSnapshot} • SKU: {item.skuSnapshot}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#66D9C5]">{formatPrice(item.subtotalInPiasters)}</p>
                    <p className="text-[#9EABA7] text-[11px]">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Details & Financial Total */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#1A2624] text-xs">
            <div>
              <h4 className="font-semibold text-[#D5D1C7] mb-1">Destination Address:</h4>
              <p className="text-[#9EABA7] leading-relaxed">
                {searchedOrder.customerName} ({searchedOrder.customerPhone})<br />
                {searchedOrder.streetAddress}, {searchedOrder.buildingDetails && `${searchedOrder.buildingDetails}, `}{searchedOrder.city}<br />
                Governorate: <strong className="text-[#F5F2EB]">{searchedOrder.governorate}</strong>, Egypt
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="flex sm:justify-end gap-4 text-[#9EABA7]">
                <span>Items Subtotal:</span>
                <span className="text-[#F5F2EB] font-semibold">{formatPrice(searchedOrder.subtotalInPiasters)}</span>
              </div>
              <div className="flex sm:justify-end gap-4 text-[#9EABA7]">
                <span>Courier Shipping:</span>
                <span className="text-[#66D9C5] font-semibold">
                  {searchedOrder.shippingInPiasters === 0 ? 'COMPLIMENTARY' : formatPrice(searchedOrder.shippingInPiasters)}
                </span>
              </div>
              <div className="flex sm:justify-end gap-4 pt-2 border-t border-[#1A2624] font-serif text-base font-bold">
                <span className="text-[#F5F2EB]">Total Cash Due:</span>
                <span className="text-[#66D9C5] text-lg">{formatPrice(searchedOrder.totalInPiasters)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasSearched && !searchedOrder && !errorMessage && (
        <div className="p-12 text-center text-[#9EABA7] bg-[#0E1212] rounded-xl border border-[#1A2624]">
          <p>No orders matched your lookup details.</p>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto p-12 text-center text-[#9EABA7]">Loading order tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
