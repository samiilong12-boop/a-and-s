'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Phone,
  MapPin,
  Building,
  User,
  AlertCircle,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { SHIPPING_ZONES } from '@/lib/data/products';
import { formatPrice, calculateOrderTotals } from '@/lib/currency';
import { validateEgyptianPhone } from '@/lib/phone-validation';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalInPiasters, clearCart } = useCart();
  const { t, isRtl } = useLanguage();

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    governorate: 'Cairo',
    city: '',
    streetAddress: '',
    buildingDetails: '',
    deliveryNotes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected Shipping Zone
  const selectedZone = SHIPPING_ZONES.find((z) => z.governorateEn === formData.governorate) || SHIPPING_ZONES[0];

  // Financial calculations
  const financials = calculateOrderTotals({
    subtotalInPiasters,
    baseShippingInPiasters: selectedZone.rateInPiasters,
    pricesIncludeTax: true,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim() || formData.customerName.trim().length < 3) {
      newErrors.customerName = isRtl ? 'يرجى كتابة الاسم بالكامل (3 أحرف على الأقل)' : 'Please enter your full name (at least 3 characters)';
    }

    const phoneValidation = validateEgyptianPhone(formData.customerPhone);
    if (!phoneValidation.isValid) {
      newErrors.customerPhone = isRtl ? 'يرجى إدخال رقم محمول مصري صحيح مكون من 11 رقماً (مثال: 01012345678)' : (phoneValidation.errorMessage || 'Invalid Egyptian phone number');
    }

    if (!formData.city.trim()) {
      newErrors.city = isRtl ? 'المدينة أو الحي مطلوب (مثال: التجمع، المعادي، سموحة)' : 'City / District is required (e.g. Zamalek, Nasr City, Smouha)';
    }

    if (!formData.streetAddress.trim() || formData.streetAddress.trim().length < 5) {
      newErrors.streetAddress = isRtl ? 'يرجى إدخال اسم الشارع وتفاصيل العنوان' : 'Please enter your detailed street address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert(isRtl ? 'حقيبة المشتريات فارغة' : 'Your cart is empty');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `AS-${dateStr}-${randomSuffix}`;

      const orderPayload = {
        id: `order-${Date.now()}`,
        orderNumber,
        customerName: formData.customerName.trim(),
        customerPhone: validateEgyptianPhone(formData.customerPhone).normalizedPhone,
        customerEmail: formData.customerEmail.trim() || null,
        governorate: formData.governorate,
        city: formData.city.trim(),
        streetAddress: formData.streetAddress.trim(),
        buildingDetails: formData.buildingDetails.trim() || null,
        deliveryNotes: formData.deliveryNotes.trim() || null,
        status: 'PENDING_CONFIRMATION',
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentStatus: 'PENDING_COLLECTION',
        currency: 'EGP',
        subtotalInPiasters: financials.subtotalInPiasters,
        shippingInPiasters: financials.shippingInPiasters,
        discountInPiasters: financials.discountInPiasters,
        taxInPiasters: financials.taxInPiasters,
        totalInPiasters: financials.totalInPiasters,
        totalCostInPiasters: Math.round(financials.subtotalInPiasters * 0.35),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: items.map((item) => ({
          id: `item-${Date.now()}-${item.variantId}`,
          variantId: item.variantId,
          productNameSnapshot: item.productName,
          variantTitleSnapshot: item.variantTitle,
          skuSnapshot: item.sku,
          unitPriceInPiasters: item.unitPriceInPiasters,
          unitCostInPiasters: Math.round(item.unitPriceInPiasters * 0.35),
          quantity: item.quantity,
          subtotalInPiasters: item.unitPriceInPiasters * item.quantity,
          totalCostInPiasters: Math.round(item.unitPriceInPiasters * 0.35) * item.quantity,
        })),
      };

      const existingOrdersStr = localStorage.getItem('a_and_s_demo_orders');
      const existingOrders = existingOrdersStr ? JSON.parse(existingOrdersStr) : [];
      localStorage.setItem('a_and_s_demo_orders', JSON.stringify([orderPayload, ...existingOrders]));

      clearCart();
      router.push(`/order-confirmation/${orderNumber}`);
    } catch (err) {
      console.error(err);
      alert('Error placing order');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
        <h1 className="font-serif text-3xl font-bold text-[#F5F2EB]">
          {isRtl ? 'حقيبة المشتريات فارغة' : 'Your Bag is Empty'}
        </h1>
        <p className="text-sm text-[#9EABA7]">
          {isRtl ? 'يرجى اختيار عطرك المفضل قبل المتابعة لإتمام الطلب.' : 'Please select your desired fragrance before proceeding to checkout.'}
        </p>
        <Link href="/catalog" className="btn-primary py-3 px-8 rounded text-xs tracking-widest uppercase font-bold inline-block">
          {isRtl ? 'تصفح تشكيلة العطور' : 'Explore The Collection'}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Checkout Header */}
      <div className="border-b border-[#1A2624] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-[0.25em] text-[#C6A66B] uppercase">
            {isRtl ? 'إتمام الشراء الآمن' : 'Secure Checkout'}
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#F5F2EB] mt-1">
            {t('checkout.title')}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#66D9C5] bg-[#66D9C5]/10 border border-[#66D9C5]/20 px-3.5 py-1.5 rounded-full self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>{isRtl ? 'الدفع نقداً بعد المعاينة عند باب بيتك' : 'Pay in Cash Upon Hand Delivery'}</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Delivery Information */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Customer Contact */}
          <div className="bg-[#0E1212] p-6 rounded-xl border border-[#1A2624] space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#F5F2EB] flex items-center gap-2">
              <User className="w-4 h-4 text-[#66D9C5]" />
              <span>{t('checkout.customer_info')}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#D5D1C7] block">
                  {t('checkout.full_name')} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder={isRtl ? 'الاسم ثلاثي (مثال: د. عمر الشريف)' : 'e.g. Dr. Omar El-Sherif'}
                  className={`w-full bg-[#111716] border rounded-lg px-3.5 py-2.5 text-xs text-[#F5F2EB] placeholder-[#6C7A77] focus:outline-none focus:border-[#66D9C5] ${
                    errors.customerName ? 'border-rose-500' : 'border-[#1A2624]'
                  }`}
                />
                {errors.customerName && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.customerName}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#D5D1C7] block">
                  {t('checkout.phone')} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  placeholder="010XXXXXXXX, 011..., 012..."
                  className={`w-full bg-[#111716] border rounded-lg px-3.5 py-2.5 text-xs text-[#F5F2EB] placeholder-[#6C7A77] focus:outline-none focus:border-[#66D9C5] ${
                    errors.customerPhone ? 'border-rose-500' : 'border-[#1A2624]'
                  }`}
                />
                {errors.customerPhone ? (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.customerPhone}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-[#6C7A77]">
                    {isRtl ? 'سيتواصل معك معملنا هاتفياً أو عبر واتساب لتأكيد الشحن.' : 'Our concierge will call or WhatsApp you to confirm shipment.'}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D5D1C7] block">
                {t('checkout.email_optional')}
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#111716] border border-[#1A2624] rounded-lg px-3.5 py-2.5 text-xs text-[#F5F2EB] placeholder-[#6C7A77] focus:outline-none focus:border-[#66D9C5]"
              />
            </div>
          </div>

          {/* Delivery Address in Egypt */}
          <div className="bg-[#0E1212] p-6 rounded-xl border border-[#1A2624] space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#F5F2EB] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#66D9C5]" />
              <span>{t('checkout.address_section')}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Governorate Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#D5D1C7] block">
                  {t('checkout.governorate')} <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.governorate}
                  onChange={(e) => handleInputChange('governorate', e.target.value)}
                  className="w-full bg-[#111716] border border-[#1A2624] rounded-lg px-3.5 py-2.5 text-xs text-[#F5F2EB] focus:outline-none focus:border-[#66D9C5]"
                >
                  {SHIPPING_ZONES.map((zone) => (
                    <option key={zone.governorateEn} value={zone.governorateEn}>
                      {zone.governorateAr} ({zone.governorateEn}) — {financials.isEligibleForFreeShipping ? (isRtl ? 'شحن مجاني' : 'FREE') : formatPrice(zone.rateInPiasters)}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#66D9C5]">
                  {isRtl
                    ? `توصيل متوقع: خلال ${selectedZone.minDays}–${selectedZone.maxDays} أيام عمل`
                    : `Est. Delivery: ${selectedZone.minDays}–${selectedZone.maxDays} Business Days`}
                </p>
              </div>

              {/* City / District */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#D5D1C7] block">
                  {t('checkout.city')} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder={isRtl ? 'مثال: التجمع الخامس، الدقي، سيدي جابر' : 'e.g. New Cairo, Dokki, Maadi'}
                  className={`w-full bg-[#111716] border rounded-lg px-3.5 py-2.5 text-xs text-[#F5F2EB] placeholder-[#6C7A77] focus:outline-none focus:border-[#66D9C5] ${
                    errors.city ? 'border-rose-500' : 'border-[#1A2624]'
                  }`}
                />
                {errors.city && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.city}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Street Address */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D5D1C7] block">
                {t('checkout.street')} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.streetAddress}
                onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                placeholder={isRtl ? 'اسم الشارع، رقم العمارة أو الفيلا، علامة مميزة' : 'e.g. 14 El-Thawra Street, off Palestine Square'}
                className={`w-full bg-[#111716] border rounded-lg px-3.5 py-2.5 text-xs text-[#F5F2EB] placeholder-[#6C7A77] focus:outline-none focus:border-[#66D9C5] ${
                  errors.streetAddress ? 'border-rose-500' : 'border-[#1A2624]'
                }`}
              />
              {errors.streetAddress && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.streetAddress}</span>
                </p>
              )}
            </div>

            {/* Building / Floor / Apt */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D5D1C7] block">
                {t('checkout.building')}
              </label>
              <input
                type="text"
                value={formData.buildingDetails}
                onChange={(e) => handleInputChange('buildingDetails', e.target.value)}
                placeholder={isRtl ? 'مثال: عمارة 24، الدور الرابع، شقة 12' : 'e.g. Building 22, Floor 4, Apt 402'}
                className="w-full bg-[#111716] border border-[#1A2624] rounded-lg px-3.5 py-2.5 text-xs text-[#F5F2EB] placeholder-[#6C7A77] focus:outline-none focus:border-[#66D9C5]"
              />
            </div>

            {/* Delivery Notes */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D5D1C7] block">
                {t('checkout.notes')}
              </label>
              <textarea
                value={formData.deliveryNotes}
                onChange={(e) => handleInputChange('deliveryNotes', e.target.value)}
                placeholder={isRtl ? 'مثال: رن الجرس مرتين، التسليم بعد الساعة 4 عصراً' : 'e.g. Ring doorbell twice, deliver after 3 PM'}
                rows={2}
                className="w-full bg-[#111716] border border-[#1A2624] rounded-lg px-3.5 py-2 text-xs text-[#F5F2EB] placeholder-[#6C7A77] focus:outline-none focus:border-[#66D9C5]"
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-[#0E1212] p-6 rounded-xl border border-[#1A2624] space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#F5F2EB] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#66D9C5]" />
              <span>{t('checkout.payment_method')}</span>
            </h2>

            <div className="p-4 bg-[#141A19] border border-[#66D9C5] rounded-lg flex items-start gap-4">
              <div className="w-5 h-5 rounded-full border-2 border-[#66D9C5] flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#66D9C5]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#F5F2EB]">{t('checkout.cod_badge')}</span>
                  <span className="badge-gold px-2 py-0.2 rounded text-[10px]">100% Guaranteed</span>
                </div>
                <p className="text-xs text-[#9EABA7] leading-relaxed">
                  {t('checkout.cod_explain')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0E1212] p-6 rounded-xl border border-[#1A2624] space-y-6 sticky top-28 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-[#F5F2EB] pb-3 border-b border-[#1A2624]">
              {isRtl ? `ملخص الطلب (${items.length} عطور)` : `Order Summary (${items.length} items)`}
            </h3>

            {/* Item Mini Cards */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3 py-2 border-b border-[#1A2624]/60">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-14 h-16 object-cover bg-[#080A0A] rounded border border-[#1A2624]"
                  />
                  <div className="flex-1 text-xs">
                    <p className="font-serif font-semibold text-[#F5F2EB] line-clamp-1">{item.productName}</p>
                    <p className="text-[#C6A66B] mt-0.5">{item.variantTitle} × {item.quantity}</p>
                    <p className="text-[#66D9C5] font-semibold mt-1">
                      {formatPrice(item.unitPriceInPiasters * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Calculations Breakdown */}
            <div className="space-y-2 text-xs pt-2">
              <div className="flex justify-between text-[#9EABA7]">
                <span>{isRtl ? 'المجموع الفرعي للعطور' : 'Items Subtotal'}</span>
                <span className="font-semibold text-[#F5F2EB]">{formatPrice(financials.subtotalInPiasters)}</span>
              </div>

              <div className="flex justify-between text-[#9EABA7]">
                <span>{isRtl ? `الشحن إلى محافظة ${selectedZone.governorateAr}` : `Shipping to ${formData.governorate}`}</span>
                {financials.isEligibleForFreeShipping ? (
                  <span className="text-[#66D9C5] font-bold">{isRtl ? 'شحن فاخر مجاني' : 'COMPLIMENTARY'}</span>
                ) : (
                  <span className="font-semibold text-[#F5F2EB]">{formatPrice(financials.shippingInPiasters)}</span>
                )}
              </div>

              <div className="flex justify-between text-[#6C7A77] text-[11px]">
                <span>{isRtl ? 'ضريبة القيمة المضافة 14%' : 'Egyptian VAT (14%)'}</span>
                <span>{isRtl ? 'شاملة في الأسعار' : 'Included in prices'}</span>
              </div>

              <div className="pt-3 border-t border-[#1A2624] flex justify-between items-baseline">
                <div>
                  <span className="font-serif text-base font-bold text-[#F5F2EB]">{isRtl ? 'إجمالي المبلغ المطلوب نقداً' : 'Total Cash Due'}</span>
                  <p className="text-[10px] text-[#9EABA7]">{isRtl ? 'يدفع للمندوب عند استلام ومعاينة الشحنة' : 'Payable to courier upon delivery'}</p>
                </div>
                <span className="font-serif text-2xl font-bold text-[#66D9C5]">
                  {formatPrice(financials.totalInPiasters)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-4 px-6 rounded-lg text-xs tracking-widest uppercase font-bold flex items-center justify-center gap-2 shadow-2xl disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>{t('checkout.submitting')}</span>
              ) : (
                <>
                  <span>{t('checkout.place_order')}</span>
                  <ArrowRight className={`w-4 h-4 text-[#080A0A] ${isRtl ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            <div className="space-y-2 pt-2 border-t border-[#1A2624] text-[11px] text-[#6C7A77]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#66D9C5]" />
                <span>{isRtl ? 'تأكيد فوري للطلب عبر الهاتف أو واتساب' : 'Orders start as "Pending Confirmation"'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#C6A66B]" />
                <span>{isRtl ? 'تغليف فاخر محكم مع شمع ختم الأمان' : 'Concierge will verify delivery address prior to dispatch'}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
