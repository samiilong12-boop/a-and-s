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
      setErrorMessage('يرجى إدخال رقم مرجع الطلب (مثال: AS-202610-1234)');
      return;
    }

    try {
      const stored = localStorage.getItem('a_and_s_demo_orders');
      const orders = stored ? JSON.parse(stored) : [];
      
      const found = orders.find(
        (o: any) => o.orderNumber.toLowerCase() === orderNumberInput.trim().toLowerCase()
      );

      if (found) {
        if (phoneInput.trim()) {
          const normPhone = validateEgyptianPhone(phoneInput).normalizedPhone;
          if (found.customerPhone !== normPhone && !found.customerPhone.includes(phoneInput.trim())) {
            setErrorMessage('رقم الهاتف المحمول غير متطابق مع مرجع هذا الطلب.');
            setSearchedOrder(null);
            return;
          }
        }
        setSearchedOrder(found);
      } else {
        setSearchedOrder(null);
        setErrorMessage('لم يتم العثور على طلب بهذا الرقم المرجعي. يرجى مراجعة الكود المستلم.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('حدث خطأ أثناء فحص سجلات الشحن.');
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      handleSearch();
    }
  }, [initialOrderNumber]);

  return (
    <div className="min-h-screen bg-[#F7F5EE] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="badge-turquoise px-3.5 py-1 rounded-sm font-bold uppercase tracking-widest text-[11px]">
            خدمة كونسيرج تتبع الشحنات
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#080A0A]">
            تتبع مسار شحنتك العطرية
          </h1>
          <p className="text-xs text-[#4A5553]">
            أدخل رقم مرجع الطلب (مثل: AS-202610-1234) ورقم هاتفك المحمول لمتابعة حالة التجهيز والمندوب لحظة بلحظة.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E3D6] shadow-sm max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#080A0A] block">
                  رقم مرجع الطلب <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={orderNumberInput}
                  onChange={(e) => setOrderNumberInput(e.target.value)}
                  placeholder="AS-202610-XXXX"
                  className="w-full bg-[#FAF9F5] border border-[#E7E3D6] rounded-xl px-3.5 py-2.5 text-xs text-[#080A0A] uppercase placeholder-[#788784] focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#080A0A] block">
                  رقم الهاتف المسجل <span className="text-[#788784] font-normal">(اختياري)</span>
                </label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="010XXXXXXXX"
                  className="w-full bg-[#FAF9F5] border border-[#E7E3D6] rounded-xl px-3.5 py-2.5 text-xs text-[#080A0A] placeholder-[#788784] focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full btn-turquoise py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
            >
              <Search className="w-4 h-4" />
              <span>بحث عن الشحنة</span>
            </button>
          </form>
        </div>

        {/* Results Card */}
        {searchedOrder && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E3D6] shadow-sm space-y-6 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E3D6] gap-2">
              <div>
                <span className="text-[11px] font-mono text-[#0D9488] font-bold block">
                  {searchedOrder.orderNumber}
                </span>
                <h3 className="font-serif font-bold text-lg text-[#080A0A] mt-0.5">
                  العميل: {searchedOrder.customerName}
                </h3>
              </div>
              <div className="text-left">
                <span className="badge-turquoise px-3 py-1 rounded-sm font-bold text-xs inline-block">
                  {getOrderStatusLabel(searchedOrder.status)?.labelAr || searchedOrder.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E7E3D6]">
                <span className="text-[#788784] block">المحافظة والعنوان</span>
                <span className="font-bold text-[#080A0A] mt-0.5 block">
                  {searchedOrder.shippingAddress?.governorate} — {searchedOrder.shippingAddress?.city}
                </span>
              </div>

              <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E7E3D6]">
                <span className="text-[#788784] block">إجمالي الدفع عند الاستلام</span>
                <span className="font-bold text-[#0D9488] font-mono text-sm mt-0.5 block">
                  {formatPrice(searchedOrder.totalInPiasters)}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs text-[#080A0A]">القطع العطرية في الشحنة:</h4>
              <div className="divide-y divide-[#E7E3D6] border border-[#E7E3D6] rounded-2xl p-4 bg-[#FAF9F5]">
                {searchedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-serif font-bold text-[#080A0A] block">{item.productNameEn}</span>
                      <span className="text-[11px] text-[#788784]">{item.volumeMl} ML • الكمية: {item.quantity}</span>
                    </div>
                    <span className="font-mono font-bold text-[#0D9488]">{formatPrice(item.subtotalInPiasters)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-[#788784]">Loading Concierge...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
