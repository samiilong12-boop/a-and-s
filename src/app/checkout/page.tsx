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
  Gift,
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
      const now = new Date();
      const orderNumber = `AS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const orderPayload = {
        orderNumber,
        status: 'pending_confirmation',
        paymentStatus: 'pending',
        paymentMethod: 'cash_on_delivery',
        currency: 'EGP',
        customerName: formData.customerName.trim(),
        customerPhone: validateEgyptianPhone(formData.customerPhone).normalizedPhone,
        customerEmail: formData.customerEmail.trim() || null,
        shippingAddress: {
          governorate: formData.governorate,
          city: formData.city.trim(),
          streetAddress: formData.streetAddress.trim(),
          buildingDetails: formData.buildingDetails.trim() || undefined,
          deliveryNotes: formData.deliveryNotes.trim() || undefined,
        },
        subtotalInPiasters: financials.subtotalInPiasters,
        discountInPiasters: financials.discountInPiasters,
        shippingInPiasters: financials.shippingInPiasters,
        totalInPiasters: financials.totalInPiasters,
        createdAt: now.toISOString(),
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          productNameEn: item.productName,
          productNameAr: item.productName,
          variantTitleEn: item.variantTitle,
          variantTitleAr: item.variantTitle,
          volumeMl: item.volumeMl,
          sku: item.sku,
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
      <div className="min-h-screen bg-[#F7F5EE] py-24">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-6 bg-white p-12 rounded-3xl border border-[#E7E3D6] shadow-sm">
          <h1 className="font-serif text-3xl font-bold text-[#080A0A]">
            {isRtl ? 'حقيبة المشتريات فارغة' : 'Your Bag is Empty'}
          </h1>
          <p className="text-sm text-[#4A5553]">
            {isRtl ? 'يرجى اختيار عطرك المفضل قبل المتابعة لإتمام الطلب.' : 'Please select your desired fragrance before proceeding to checkout.'}
          </p>
          <Link href="/catalog" className="btn-turquoise py-3.5 px-8 rounded-xl text-xs tracking-widest uppercase font-bold inline-block shadow-lg">
            {isRtl ? 'تصفح تشكيلة العطور' : 'Explore The Collection'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5EE] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Checkout Header */}
        <div className="border-b border-[#E7E3D6] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 badge-turquoise px-3 py-1 rounded-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isRtl ? 'إتمام الشراء الآمن والمعاينة الفاخرة' : 'Secure Checkout & White-Glove Hand Delivery'}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#080A0A] mt-2">
              {t('checkout.title')}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#0D9488] bg-[#2DD4BF]/15 border border-[#2DD4BF]/40 px-3.5 py-1.5 rounded-full self-start sm:self-auto font-bold">
            <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
            <span>{isRtl ? 'الدفع نقداً بعد المعاينة عند باب بيتك' : 'Pay in Cash Upon Hand Delivery'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Delivery Information */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Customer Contact */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E3D6] shadow-sm space-y-5">
              <h2 className="font-serif text-lg font-bold text-[#080A0A] flex items-center gap-2">
                <User className="w-4 h-4 text-[#0D9488]" />
                <span>{t('checkout.customer_info')}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080A0A] block">
                    {t('checkout.full_name')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder={isRtl ? 'الاسم ثلاثي (مثال: د. عمر الشريف)' : 'e.g. Dr. Omar El-Sherif'}
                    className={`w-full bg-[#FAF9F5] border rounded-xl px-3.5 py-2.5 text-xs text-[#080A0A] placeholder-[#788784] focus:outline-none focus:border-[#2DD4BF] ${
                      errors.customerName ? 'border-rose-500' : 'border-[#E7E3D6]'
                    }`}
                  />
                  {errors.customerName && (
                    <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.customerName}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080A0A] block">
                    {t('checkout.phone')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    placeholder="010XXXXXXXX, 011..., 012..."
                    className={`w-full bg-[#FAF9F5] border rounded-xl px-3.5 py-2.5 text-xs text-[#080A0A] placeholder-[#788784] focus:outline-none focus:border-[#2DD4BF] ${
                      errors.customerPhone ? 'border-rose-500' : 'border-[#E7E3D6]'
                    }`}
                  />
                  {errors.customerPhone ? (
                    <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.customerPhone}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-[#788784]">
                      {isRtl ? 'سيتواصل معك معملنا هاتفياً أو عبر واتساب لتأكيد الشحن.' : 'Our concierge will call or WhatsApp you to confirm shipment.'}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#080A0A] block">
                  {t('checkout.email')} <span className="text-xs text-[#788784] font-normal">({isRtl ? 'اختياري لإرسال الفاتورة' : 'optional'})</span>
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#FAF9F5] border border-[#E7E3D6] rounded-xl px-3.5 py-2.5 text-xs text-[#080A0A] placeholder-[#788784] focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E3D6] shadow-sm space-y-5">
              <h2 className="font-serif text-lg font-bold text-[#080A0A] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0D9488]" />
                <span>{t('checkout.shipping_address')}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080A0A] block">
                    {t('checkout.governorate')} <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formData.governorate}
                    onChange={(e) => handleInputChange('governorate', e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#E7E3D6] rounded-xl px-3.5 py-2.5 text-xs text-[#080A0A] focus:outline-none focus:border-[#2DD4BF] cursor-pointer"
                  >
                    {SHIPPING_ZONES.map((zone) => (
                      <option key={zone.governorateEn} value={zone.governorateEn}>
                        {isRtl ? `${zone.governorateAr} (${zone.rateInPiasters === 0 ? 'شحن مجاني' : formatPrice(zone.rateInPiasters)})` : `${zone.governorateEn} (${formatPrice(zone.rateInPiasters)})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080A0A] block">
                    {t('checkout.city')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder={isRtl ? 'مثال: التجمع الخامس، المعادي، الشيخ زايد' : 'e.g. New Cairo, Maadi, Zayed'}
                    className={`w-full bg-[#FAF9F5] border rounded-xl px-3.5 py-2.5 text-xs text-[#080A0A] placeholder-[#788784] focus:outline-none focus:border-[#2DD4BF] ${
                      errors.city ? 'border-rose-500' : 'border-[#E7E3D6]'
                    }`}
                  />
                  {errors.city && (
                    <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.city}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#080A0A] block">
                  {t('checkout.street')} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.streetAddress}
                  onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                  placeholder={isRtl ? 'اسم الشارع، رقم العمارة أو الفيلا' : 'Street name, building or villa number'}
                  className={`w-full bg-[#FAF9F5] border rounded-xl px-3.5 py-2.5 text-xs text-[#080A0A] placeholder-[#788784] focus:outline-none focus:border-[#2DD4BF] ${
                    errors.streetAddress ? 'border-rose-500' : 'border-[#E7E3D6]'
                  }`}
                />
                {errors.streetAddress && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.streetAddress}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080A0A] block">
                    {t('checkout.building')} <span className="text-xs text-[#788784] font-normal">({isRtl ? 'اختياري' : 'optional'})</span>
                  </label>
                  <input
                    type="text"
                    value={formData.buildingDetails}
                    onChange={(e) => handleInputChange('buildingDetails', e.target.value)}
                    placeholder={isRtl ? 'رقم الشقة، الدور' : 'Floor, Apt'}
                    className="w-full bg-[#FAF9F5] border border-[#E7E3D6] rounded-xl px-3.5 py-2.5 text-xs text-[#080A0A] placeholder-[#788784] focus:outline-none focus:border-[#2DD4BF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080A0A] block">
                    {t('checkout.notes')} <span className="text-xs text-[#788784] font-normal">({isRtl ? 'اختياري' : 'optional'})</span>
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryNotes}
                    onChange={(e) => handleInputChange('deliveryNotes', e.target.value)}
                    placeholder={isRtl ? 'علامة مميزة أو توقيت التسليم المفضل' : 'Landmark, preferred time'}
                    className="w-full bg-[#FAF9F5] border border-[#E7E3D6] rounded-xl px-3.5 py-2.5 text-xs text-[#080A0A] placeholder-[#788784] focus:outline-none focus:border-[#2DD4BF]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Accordion */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E3D6] shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#080A0A] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0D9488]" />
                <span>{t('checkout.payment_method')}</span>
              </h2>

              <div className="p-4 bg-[#FAF9F5] rounded-2xl border-2 border-[#2DD4BF] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#0D9488] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <span className="text-sm font-bold text-[#080A0A]">
                      {t('checkout.cod_title')}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#0D9488] bg-[#2DD4BF]/20 px-2.5 py-0.5 rounded-full font-mono">
                    EGP Cash
                  </span>
                </div>
                <p className="text-xs text-[#4A5553] pr-6">
                  {t('checkout.cod_desc')}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs text-[#788784]">
                <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
                <span>{isRtl ? 'الدفع نقداً بالجنيه المصري للمندوب بعد التأكد التام من مطابقة العطر.' : 'Payment is collected in cash after full package inspection.'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Luxury Assurances */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E3D6] shadow-sm space-y-6 sticky top-28">
              <h2 className="font-serif text-lg font-bold text-[#080A0A]">
                {t('checkout.order_summary')}
              </h2>

              {/* Items List */}
              <div className="space-y-3.5 max-h-72 overflow-y-auto divide-y divide-[#E7E3D6] pr-1">
                {items.map((item) => (
                  <div key={item.variantId} className="pt-3.5 first:pt-0 flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-14 h-16 object-cover rounded-xl bg-[#FAF9F5] border border-[#E7E3D6]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-xs text-[#080A0A] truncate">
                        {item.productName}
                      </h4>
                      <p className="text-[11px] text-[#788784]">
                        {item.volumeMl} ML • Qty: {item.quantity}
                      </p>
                      <p className="text-xs font-bold text-[#0D9488] mt-0.5">
                        {formatPrice(item.unitPriceInPiasters * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Breakdown */}
              <div className="border-t border-[#E7E3D6] pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-[#4A5553]">
                  <span>{t('cart.subtotal')}</span>
                  <span className="font-mono font-semibold text-[#080A0A]">{formatPrice(financials.subtotalInPiasters)}</span>
                </div>

                <div className="flex justify-between text-[#4A5553]">
                  <span>{t('cart.shipping')} ({selectedZone.governorateEn})</span>
                  <span className="font-mono font-semibold text-[#080A0A]">
                    {financials.shippingInPiasters === 0 ? (
                      <span className="text-[#0D9488] font-bold">{isRtl ? 'شحن مجاني' : 'Free Shipping'}</span>
                    ) : (
                      formatPrice(financials.shippingInPiasters)
                    )}
                  </span>
                </div>

                <div className="border-t border-[#E7E3D6] pt-3 flex justify-between items-baseline text-sm">
                  <span className="font-serif font-bold text-[#080A0A] text-base">{t('cart.total')}</span>
                  <div className="text-right">
                    <span className="font-serif font-bold text-xl text-[#0D9488] block">
                      {formatPrice(financials.totalInPiasters)}
                    </span>
                    <span className="text-[10px] text-[#788784]">
                      {isRtl ? 'شامل ضريبة القيمة المضافة والتوصيل' : 'Inclusive of VAT and delivery'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gifting & Sample Guarantee Badge */}
              <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#E7E3D6] flex items-center gap-2.5 text-xs text-[#4A5553]">
                <Gift className="w-5 h-5 text-[#2DD4BF] flex-shrink-0" />
                <span className="text-[11px] leading-relaxed">
                  {isRtl ? 'يتضمن طلبك علبة إهداء ملوكية وعينتين مجانيتين لاختبار العطر قبل فتح الزجاجة الأصلية.' : 'Includes signature gift box and 2 free discovery samples.'}
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-turquoise py-4 px-6 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <span>{isSubmitting ? (isRtl ? 'جاري تأكيد حجز العطر...' : 'Processing Reservation...') : t('checkout.place_order')}</span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>

              <p className="text-[10px] text-center text-[#788784]">
                {isRtl ? 'بالضغط على تأكيد، توافق على معاينة الطرد الفاخر واستلامه كاش.' : 'By clicking place order, you agree to inspect and receive your COD delivery.'}
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
