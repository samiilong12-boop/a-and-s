'use client';

import React, { use } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  Package,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const resolvedParams = use(params);
  const orderNumber = resolvedParams.orderNumber;

  const whatsappMessage = encodeURIComponent(
    `مرحباً دار رَحِيقْ (RAHEEQ) للعطور الفاخرة 💎، قمت بطلب العطر برقم المرجع #${orderNumber}. أود تأكيد تفاصيل الشحن والتوصيل للباب.`
  );
  const whatsappUrl = `https://wa.me/201131068790?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-[#F7F5EE] py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-10">
        
        {/* Confirmation Badge */}
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-full bg-white border-2 border-[#2DD4BF] flex items-center justify-center mx-auto text-[#0D9488] shadow-xl">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="badge-turquoise px-3 py-1 rounded-sm font-bold uppercase tracking-widest text-[11px]">
            تم تسجيل طلبك بنجاح في معمل القاهرة
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#080A0A] tracking-tight">
            شكراً لاختيارك دار رَحِـيـقْ للعطور الفاخرة
          </h1>

          <div className="inline-block bg-white border border-[#E7E3D6] px-8 py-4 rounded-2xl shadow-sm mt-2">
            <span className="text-xs text-[#788784] uppercase tracking-wider block font-semibold">رقم مرجع طلبك الحصري</span>
            <span className="font-mono text-2xl sm:text-3xl font-bold text-[#0D9488] tracking-wider mt-1 block">
              {orderNumber}
            </span>
          </div>
        </div>

        {/* Cash on Delivery Notice */}
        <div className="p-6 sm:p-8 bg-white border border-[#E7E3D6] rounded-3xl text-right space-y-5 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-[#E7E3D6]">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-serif font-bold text-base text-[#080A0A]">
                حالة الطلب: قيد التأكيد الهاتفي (Pending Confirmation)
              </h3>
              <p className="text-xs text-[#4A5553] mt-0.5">
                وفقاً لبروتوكول الفخامة المتبع، يقوم خبير خدمة العملاء بالتواصل معك لتأكيد موعد التسليم وعنوان الشحن.
              </p>
            </div>
          </div>

          {/* 3 Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#E7E3D6] space-y-2">
              <span className="w-7 h-7 rounded-full bg-[#2DD4BF]/20 text-[#0D9488] font-bold flex items-center justify-center text-xs">
                1
              </span>
              <p className="font-bold text-[#080A0A]">تأكيد هاتفي أو واتساب</p>
              <p className="text-[#4A5553] text-[11px] leading-relaxed">
                سيتواصل معك خبيرنا لتأكيد تفاصيل العنوان والموعد المناسب لاستلام الطرد.
              </p>
            </div>

            <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#E7E3D6] space-y-2">
              <span className="w-7 h-7 rounded-full bg-[#2DD4BF]/20 text-[#0D9488] font-bold flex items-center justify-center text-xs">
                2
              </span>
              <p className="font-bold text-[#080A0A]">الشحن السريع المؤمن</p>
              <p className="text-[#4A5553] text-[11px] leading-relaxed">
                تغليف ملوكي داخل علبة مغناطيسية مبطنة وشحن مبرد للحفاظ على الزيوت العطرية.
              </p>
            </div>

            <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#E7E3D6] space-y-2">
              <span className="w-7 h-7 rounded-full bg-[#2DD4BF]/20 text-[#0D9488] font-bold flex items-center justify-center text-xs">
                3
              </span>
              <p className="font-bold text-[#080A0A]">معاينة قبل الدفع كاش</p>
              <p className="text-[#4A5553] text-[11px] leading-relaxed">
                عاين طردك الفاخر مع المندوب وافتح العينات المجانية قبل سداد القيمة نقداً.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto btn-turquoise py-4 px-8 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl"
          >
            <MessageSquare className="w-4 h-4" />
            <span>تأكيد الطلب فوراً عبر واتساب</span>
          </a>

          <Link
            href="/track-order"
            className="w-full sm:w-auto btn-secondary py-4 px-8 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
          >
            <Package className="w-4 h-4 text-[#0D9488]" />
            <span>تتبع مسار شحنتك</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
