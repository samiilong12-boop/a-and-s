'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Phone,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Lock,
} from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { formatPrice } from '@/lib/currency';
import { validateEgyptianPhone } from '@/lib/phone-validation';

interface ExpressOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const EGYPT_GOVERNORATES = [
  'القاهرة (Cairo)',
  'الجيزة (Giza)',
  'الإسكندرية (Alexandria)',
  'القليوبية (Qalyubia)',
  'الدقهلية (Mansoura)',
  'الشرقية (Sharqia)',
  'الغربية (Tanta)',
  'المنوفية (Menofia)',
  'البحيرة (Beheira)',
  'كفر الشيخ (Kafr El Sheikh)',
  'دمياط (Damietta)',
  'بورسعيد (Port Said)',
  'الإسماعيلية (Ismailia)',
  'السويس (Suez)',
  'الفيوم (Fayoum)',
  'بني سويف (Beni Suef)',
  'المنيا (Minya)',
  'أسيوط (Asyut)',
  'سوهاج (Sohag)',
  'قنا (Qena)',
  'الأقصر (Luxor)',
  'أسوان (Aswan)',
  'البحر الأحمر (Hurghada)',
  'مطروح والساحل الشمالي (Matrouh)',
];

export function ExpressOrderModal({ isOpen, onClose, product }: ExpressOrderModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [governorate, setGovernorate] = useState(EGYPT_GOVERNORATES[0]);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<{
    orderNumber: string;
    totalAmount: string;
  } | null>(null);

  if (!isOpen || !product) return null;

  const variants = product.variants && product.variants.length > 0 ? product.variants : [];
  const activeVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    product.imageUrl ||
    '';

  const regularPrice =
    activeVariant?.regularPriceInPiasters ??
    ((activeVariant?.regularPriceEgp ?? 450) * 100);
  const salePrice =
    activeVariant?.salePriceInPiasters ??
    (activeVariant?.salePriceEgp ? activeVariant.salePriceEgp * 100 : null);
  const finalPriceInPiasters = salePrice || regularPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('يرجى إدخال اسمك الكريم لتسجيل الشحنة');
      return;
    }

    const phoneCheck = validateEgyptianPhone(customerPhone);
    if (!phoneCheck.isValid) {
      setErrorMessage('يرجى إدخال رقم هاتف مصري صحيح يبدأ بـ 01 (11 رقماً)');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('يرجى كتابة العنوان بالتفصيل ليصلك المندوب إلى الباب');
      return;
    }

    try {
      setIsSubmitting(true);
      const cleanPhone = phoneCheck.normalizedPhone;
      const now = new Date();
      const orderNumber = `RHQ-EXP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const orderPayload = {
        orderNumber,
        status: 'PENDING_CONFIRMATION',
        paymentStatus: 'PENDING_COLLECTION',
        paymentMethod: 'CASH_ON_DELIVERY',
        currency: 'EGP',
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: null,
        shippingAddress: {
          governorate: governorate,
          city: governorate,
          streetAddress: address.trim(),
          deliveryNotes: notes ? `⚡ طلب شراء سريع: ${notes.trim()}` : '⚡ طلب شراء سريع بنظام الدفع والمعاينة عند الاستلام',
        },
        subtotalInPiasters: finalPriceInPiasters,
        discountInPiasters: 0,
        shippingInPiasters: 0,
        totalInPiasters: finalPriceInPiasters,
        createdAt: now.toISOString(),
        orderNotes: notes ? `⚡ طلب شراء سريع: ${notes.trim()}` : '⚡ طلب شراء سريع (Express 1-Click Order)',
        items: [
          {
            productId: product.id,
            variantId: activeVariant?.id || `${product.id}-var-default`,
            title: `${product.nameEn} (${product.nameAr || ''}) - ${activeVariant?.titleEn || '100ml'}`,
            quantity: 1,
            unitPriceInPiasters: finalPriceInPiasters,
            image: product.images?.[0]?.url || product.imageUrl || '',
          },
        ],
      };

      // 1. Instantly persist to local orders store so admin sees it immediately
      try {
        const storedStr = localStorage.getItem('a_and_s_demo_orders');
        const existing = storedStr ? JSON.parse(storedStr) : [];
        localStorage.setItem('a_and_s_demo_orders', JSON.stringify([orderPayload, ...existing]));
        window.dispatchEvent(new Event('storage'));
      } catch (lsErr) {
        console.warn('Local storage order write error:', lsErr);
      }

      // 2. Persist to server API & Cloud Database
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        throw new Error('حدث خطأ أثناء معالجة الطلب، يرجى المحاولة مرة أخرى.');
      }

      setOrderSuccess({
        orderNumber,
        totalAmount: formatPrice(finalPriceInPiasters),
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ في الاتصال، يرجى المحاولة أو الطلب عبر الواتساب.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    if (!orderSuccess) return;
    const msg = `مرحباً دار رحيق للعطور 👑%0Aأرغب في تأكيد طلب الشراء السريع الخاص بي:%0A• رقم الطلب: ${orderSuccess.orderNumber}%0A• العطر: ${product.nameEn}%0A• الحجم: ${activeVariant?.titleEn || '100ml'}%0A• الاسم: ${customerName}%0A• الهاتف: ${customerPhone}%0A• العنوان: ${governorate} - ${address}%0A• القيمة المطلوبة كاش عند الاستلام: ${orderSuccess.totalAmount}%0Aشكراً لكم!`;
    window.open(`https://wa.me/201131068790?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#D4AF37]/40 max-h-[92vh] flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[#080A0A] text-white p-5 flex items-center justify-between border-b border-[#2DD4BF]/20 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#141A19] border border-[#2DD4BF] flex items-center justify-center text-[#54d1b2] font-bold text-xs">
              ⚡
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                  طلب شراء سريع (الدفع عند الاستلام)
                </h3>
              </div>
              <p className="text-[10px] text-[#2DD4BF] font-mono">
                عاين طردك الفاخر وتأكد من الزجاجة قبل سداد أي مليم
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {orderSuccess ? (
            /* Order Success View */
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  تم تسجيل حجزك بنجاح ✓
                </span>
                <h4 className="font-serif text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                  تهانينا! رقم طلبك: #{orderSuccess.orderNumber}
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  سيصلك مندوبنا خلال <strong className="text-slate-900">24 إلى 48 ساعة</strong>. يحق لك فتح الطرد ومعاينة الزجاجة وسلامتها بالكامل عند بابك قبل الدفع كاش ({orderSuccess.totalAmount}).
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={handleWhatsAppRedirect}
                  className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform"
                >
                  <Phone className="w-4 h-4" />
                  <span>تأكيد الطلب عبر الواتساب فوراً 📱</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl text-xs transition-colors"
                >
                  العودة لتصفح باقي العطور
                </button>
              </div>
            </div>
          ) : (
            /* Fast Order Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Preview Card */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#F7F5EE] border border-[#E5E0D3]">
                <img
                  src={primaryImage}
                  alt={product.nameEn}
                  className="w-16 h-20 object-cover rounded-xl border border-slate-300 flex-shrink-0 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-teal-800 font-bold block uppercase tracking-wider font-mono">
                    {product.fragranceFamily} • 25% Extrait
                  </span>
                  <h4 className="font-serif font-bold text-sm text-slate-900 truncate">
                    {product.nameEn} {product.nameAr ? `(${product.nameAr})` : ''}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-base font-extrabold text-[#080A0A]">
                      {formatPrice(finalPriceInPiasters)}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      EGP 1,850.00
                    </span>
                    <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-bold">
                      وفر 75%
                    </span>
                  </div>
                </div>
              </div>

              {/* Volume / Variant Selector */}
              {variants.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    اختر حجم الزجاجة:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {variants.map((v) => {
                      const isSelected = (activeVariant?.id || variants[0].id) === v.id;
                      const price = v.salePriceInPiasters || v.regularPriceInPiasters || 45000;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-bold text-xs">{v.titleEn || `${v.volumeMl}ml`}</span>
                          <span className="font-mono text-xs font-bold">{formatPrice(price)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Form Inputs */}
              <div className="space-y-3">
                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    الاسم ثلاثي الكريم: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="مثال: أحمد عبد الله"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition-colors"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    رقم الهاتف / الواتساب: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01xxxxxxxxx (11 رقم)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition-colors text-left"
                    dir="ltr"
                  />
                </div>

                {/* Governorate */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    المحافظة: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition-colors"
                  >
                    {EGYPT_GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    العنوان بالتفصيل (المنطقة، الشارع، العمارة): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="مثال: التجمع الخامس، شارع التسعين، عمارة 14 شقة 3"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1 text-emerald-950 text-[11px] leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>حق المعاينة الكامل عند الباب قبل السداد:</span>
                </div>
                <p className="text-emerald-800">
                  لا تدفع أي مليم إلا بعد استلام الطرد وفحص الزجاجة من الكسر أو التسريب بحضور المندوب.
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>
                  {isSubmitting
                    ? 'جاري تأكيد وتسجيل الشحنة...'
                    : `تأكيد الطلب كاش (${formatPrice(finalPriceInPiasters)}) ←`}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
