'use client';

import React from 'react';
import { Printer, Download, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

export interface PrintableInvoiceProps {
  order: {
    orderNumber: string;
    createdAt?: string | Date;
    customerName?: string;
    customerPhone?: string;
    governorate?: string;
    city?: string;
    streetAddress?: string;
    buildingDetails?: string | null;
    deliveryNotes?: string | null;
    shippingAddress?: {
      streetAddress?: string;
      city?: string;
      governorate?: string;
      deliveryNotes?: string;
    };
    paymentMethod?: string;
    status?: string;
    subtotalInPiasters?: number;
    shippingInPiasters?: number;
    totalInPiasters?: number;
    totalAmountInPiasters?: number;
    items?: Array<{
      productNameAr?: string;
      productNameEn?: string;
      productNameSnapshot?: string;
      title?: string;
      variantTitleAr?: string;
      variantTitleEn?: string;
      variantTitleSnapshot?: string;
      volumeMl?: number;
      quantity?: number;
      unitPriceInPiasters?: number;
      subtotalInPiasters?: number;
      regularPriceEgp?: number;
    }>;
  };
  onClose?: () => void;
  isOpen?: boolean;
}

export function PrintableInvoice({ order, onClose, isOpen = true }: PrintableInvoiceProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const address =
    order.shippingAddress?.streetAddress ||
    order.streetAddress ||
    'العنوان مسجل هاتفياً مع العميل';

  const govAndCity = [
    order.shippingAddress?.city || order.city,
    order.shippingAddress?.governorate || order.governorate,
  ]
    .filter(Boolean)
    .join(' - ');

  const notes =
    order.shippingAddress?.deliveryNotes ||
    order.deliveryNotes ||
    order.buildingDetails;

  const dateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('ar-EG');

  const subtotal = order.subtotalInPiasters || 0;
  const shipping = order.shippingInPiasters ?? 6500;
  const total = order.totalInPiasters || order.totalAmountInPiasters || (subtotal + shipping);

  return (
    <div className="fixed inset-0 z-[999] overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Floating Action Bar (Hidden when printed) */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000] no-print flex items-center gap-3 bg-slate-900/90 text-white px-5 py-2.5 rounded-full shadow-2xl border border-white/20 backdrop-blur-md">
        <button
          onClick={handlePrint}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 transition-transform active:scale-95 shadow-md cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة الفاتورة / حفظ كـ PDF</span>
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Invoice Container - Styled for Clean A4 / Thermal Print */}
      <div className="bg-white text-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:w-full print:max-w-none print:text-black my-8 print:my-0 border border-slate-200 print:border-none p-6 sm:p-10 font-sans" dir="rtl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b-2 border-slate-900 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-serif font-black tracking-wider text-slate-900">
                دار رَحِـيـقْ للعطور الفاخرة
              </span>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300">
                RAHEEQ HAUTE PARFUMERIE
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              معمل التوليف الحرفي والزيوت الفرنسية النقية • القاهرة، جمهورية مصر العربية
            </p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              خدمة العملاء والواتساب: 01131068790 • المتجر الرسمي: a-and-s.vercel.app
            </p>
          </div>

          <div className="sm:text-left text-right">
            <span className="inline-block bg-slate-900 text-white font-mono font-bold text-xs px-3 py-1 rounded-sm uppercase tracking-wider mb-1">
              فاتورة مبيعات وبوليصة شحن
            </span>
            <div className="font-mono text-sm font-bold text-slate-800">
              رقم الفاتورة: <span className="text-teal-700">{order.orderNumber}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              التاريخ: {dateStr}
            </div>
          </div>
        </div>

        {/* Customer & Shipping Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-slate-200 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 print:bg-white print:border-slate-300">
            <h3 className="font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <span>👤 بيانات العميل المستلم:</span>
            </h3>
            <div className="space-y-1 text-slate-700">
              <p>
                <strong className="text-slate-900 font-medium">الاسم:</strong> {order.customerName || 'عميل المتجر'}
              </p>
              <p>
                <strong className="text-slate-900 font-medium">رقم الهاتف / واتساب:</strong>{' '}
                <span className="font-mono font-bold text-slate-900">{order.customerPhone || 'غير مسجل'}</span>
              </p>
              <p>
                <strong className="text-slate-900 font-medium">المدينة والمحافظة:</strong> {govAndCity || 'الجيزة / 6 أكتوبر'}
              </p>
              <p>
                <strong className="text-slate-900 font-medium">العنوان التفصيلي:</strong> {address}
              </p>
              {notes && (
                <p className="text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 text-[11px] mt-1 print:border-slate-300">
                  <strong>ملاحظات التسليم:</strong> {notes}
                </p>
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 print:bg-white print:border-slate-300">
            <h3 className="font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <span>📦 بيانات التوصيل وطريقة التحصيل:</span>
            </h3>
            <div className="space-y-1 text-slate-700">
              <p>
                <strong className="text-slate-900 font-medium">طريقة السداد:</strong>{' '}
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px] print:bg-white print:border print:border-slate-400">
                  {order.paymentMethod === 'VODAFONE_CASH' ? 'فودافون كاش' : 'الدفع نقداً عند الاستلام (COD)'}
                </span>
              </p>
              <p>
                <strong className="text-slate-900 font-medium">نطاق الشحن:</strong> التوصيل الخاص (6 أكتوبر والشيخ زايد والجيزة)
              </p>
              <p>
                <strong className="text-slate-900 font-medium">المدة المتوقعة:</strong> 24 - 48 ساعة من تأكيد المعمل
              </p>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-600 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>حق المعاينة مكفول: عاين الزجاجة مع المندوب قبل سداد القيمة.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="py-5">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-800 bg-slate-100 print:bg-slate-200">
                <th className="py-2.5 px-3 font-bold text-slate-900 w-12 text-center">#</th>
                <th className="py-2.5 px-3 font-bold text-slate-900">بيان العطر والمواصفات</th>
                <th className="py-2.5 px-3 font-bold text-slate-900 text-center">الحجم والتركيز</th>
                <th className="py-2.5 px-3 font-bold text-slate-900 text-center">الكمية</th>
                <th className="py-2.5 px-3 font-bold text-slate-900 text-left">سعر الوحدة</th>
                <th className="py-2.5 px-3 font-bold text-slate-900 text-left">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => {
                  const title =
                    item.productNameAr ||
                    item.productNameEn ||
                    item.productNameSnapshot ||
                    item.title ||
                    'عطر ملكي من دار رحيق';
                  const variant =
                    item.variantTitleAr ||
                    item.variantTitleEn ||
                    item.variantTitleSnapshot ||
                    (item.volumeMl ? `${item.volumeMl}ml` : '50ml');
                  const qty = item.quantity || 1;
                  const unitPrice = item.unitPriceInPiasters
                    ? item.unitPriceInPiasters
                    : Math.round((item.subtotalInPiasters || (order.subtotalInPiasters || 45000)) / qty);
                  const lineTotal = item.subtotalInPiasters || (unitPrice * qty);

                  return (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="py-3 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">دار رَحِيقْ • تركيب نيش فاخر</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                        {variant}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                        {qty}
                      </td>
                      <td className="py-3 px-3 text-left font-mono text-slate-700">
                        {formatPrice(unitPrice)}
                      </td>
                      <td className="py-3 px-3 text-left font-mono font-bold text-slate-900">
                        {formatPrice(lineTotal)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className="border-b border-slate-200">
                  <td className="py-3 px-3 text-center font-mono">1</td>
                  <td className="py-3 px-3 font-bold text-slate-900">طلب عطر فاخر من دار رحيق</td>
                  <td className="py-3 px-3 text-center font-mono">50ml / 100ml</td>
                  <td className="py-3 px-3 text-center font-mono font-bold">1</td>
                  <td className="py-3 px-3 text-left font-mono">{formatPrice(subtotal || 45000)}</td>
                  <td className="py-3 px-3 text-left font-mono font-bold">{formatPrice(subtotal || 45000)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Financial Totals Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t-2 border-slate-900 text-xs">
          <div className="space-y-1 text-slate-600 max-w-sm">
            <h4 className="font-bold text-slate-900">سياسة الفحص والتسليم عند الباب:</h4>
            <p className="text-[11px] leading-relaxed">
              • يحق للعميل معاينة الطرد والتأكد من سلامة الزجاجة وتطابق المواصفات قبل سداد القيمة نقداً.
            </p>
            <p className="text-[11px] leading-relaxed">
              • في حال رفض الاستلام لأي سبب غير عيوب الصناعة، يُلزم العميل فقط بسداد قيمة مصاريف الشحن المقررة (65 ج.م) للمندوب.
            </p>
          </div>

          <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 print:bg-white print:border-slate-400">
            <div className="flex justify-between text-slate-600">
              <span>المجموع الفرعي للمنتجات:</span>
              <span className="font-mono font-semibold text-slate-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>رسوم الشحن والتوصيل:</span>
              <span className="font-mono font-semibold text-teal-800">{formatPrice(shipping)}</span>
            </div>
            <div className="border-t border-slate-300 pt-2 flex justify-between font-bold text-sm text-slate-900">
              <span>المبلغ الإجمالي المطلوب تحصيله:</span>
              <span className="font-mono text-base text-teal-800">{formatPrice(total)}</span>
            </div>
            <div className="text-[10px] text-center text-slate-500 pt-1 border-t border-dashed border-slate-300">
              الدفع نقداً كاش عند الاستلام (COD)
            </div>
          </div>
        </div>

        {/* Signatures & Verification */}
        <div className="pt-10 mt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs text-slate-700">
          <div>
            <span className="block font-bold text-slate-900 mb-8">إعداد وتغليف المعمل</span>
            <span className="border-t border-slate-400 pt-1 block text-[11px] text-slate-500">معمل دار رحيق</span>
          </div>
          <div>
            <span className="block font-bold text-slate-900 mb-8">مندوب الشحن والتسليم</span>
            <span className="border-t border-slate-400 pt-1 block text-[11px] text-slate-500">التوقيع والتاريخ</span>
          </div>
          <div>
            <span className="block font-bold text-slate-900 mb-8">توقيع العميل المستلم</span>
            <span className="border-t border-slate-400 pt-1 block text-[11px] text-slate-500">تم الاستلام والفحص نقداً</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[10px] text-slate-400 mt-8 pt-4 border-t border-slate-100">
          دار رَحِيقْ للعطور الملكية الفاخرة • صُنعت بفخر في جمهورية مصر العربية بأعلى معايير النيش العالمية • شكراً لثقتكم
        </div>
      </div>

      {/* Print-specific style tag */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
