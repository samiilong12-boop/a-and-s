'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, Clock, Phone, MapPin, Mail, Lock, Sparkles, Gift } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function Footer() {
  const { t, isRtl } = useLanguage();

  return (
    <footer className="bg-[#080A0A] border-t border-[#1A2624] text-[#FAF9F5] mt-24">
      {/* Brand Values Bar (Faces Egypt + Chanel Standard) */}
      <div className="border-b border-[#1A2624] py-12 bg-[#0E1413]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-right">
            
            {/* Free Shipping */}
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#141A19] border border-[#2DD4BF]/40 flex items-center justify-center text-[#2DD4BF] flex-shrink-0 shadow-lg">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#FFFFFF]">
                  {isRtl ? 'شحن فاخر مجاني لجميع المحافظات' : 'Complimentary Egypt Shipping'}
                </h4>
                <p className="text-xs text-[#9EABA7] mt-0.5">
                  {isRtl ? 'توصيل مجاني لجميع الطلبات فوق 1,000 جنيه مصري.' : 'Free courier delivery on orders over 1,000 EGP.'}
                </p>
              </div>
            </div>

            {/* Cash on Delivery with Inspection */}
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#141A19] border border-[#2DD4BF]/40 flex items-center justify-center text-[#2DD4BF] flex-shrink-0 shadow-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#FFFFFF]">
                  {isRtl ? 'معاينة الطرد قبل الدفع كاش' : 'Cash on Delivery (COD)'}
                </h4>
                <p className="text-xs text-[#9EABA7] mt-0.5">
                  {isRtl ? 'عاين طردك الفاخر مع المندوب وافتح العينات قبل السداد.' : 'Inspect your package before handing cash payment.'}
                </p>
              </div>
            </div>

            {/* High Concentration Extrait */}
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#141A19] border border-[#2DD4BF]/40 flex items-center justify-center text-[#2DD4BF] flex-shrink-0 shadow-lg">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#FFFFFF]">
                  {isRtl ? 'تركيز زيوت نقية 35% Extrait' : 'Pure 35% Extrait de Parfum'}
                </h4>
                <p className="text-xs text-[#9EABA7] mt-0.5">
                  {isRtl ? 'ثبات استثنائي يتجاوز 14 ساعة وفوحان يملأ الأرجاء.' : 'Unmatched persistent sillage lasting over 14 hours.'}
                </p>
              </div>
            </div>

            {/* Art of Gifting & Samples */}
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#141A19] border border-[#C6A66B]/50 flex items-center justify-center text-[#C6A66B] flex-shrink-0 shadow-lg">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#FFFFFF]">
                  {isRtl ? 'عينتان مجانيتان مع كل طلب' : 'Complimentary Discovery Samples'}
                </h4>
                <p className="text-xs text-[#9EABA7] mt-0.5">
                  {isRtl ? 'علبة إهداء ملوكية مع عينتين لتجربة العطر أولاً.' : 'Bespoke luxury box with 2 discovery sample vials.'}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <div className="flex items-center">
                <span className="font-serif text-2xl font-bold tracking-[0.25em] text-[#FFFFFF]">
                  A AND S
                </span>
                <span className="w-2 h-2 rounded-full bg-[#2DD4BF] shadow-[0_0_8px_#2DD4BF] mx-1 mb-1" />
              </div>
              <p className="text-[10px] tracking-[0.35em] text-[#C6A66B] uppercase font-sans font-bold">
                Haute Parfumerie
              </p>
            </Link>
            <p className="text-sm text-[#9EABA7] max-w-sm leading-relaxed">
              &ldquo;{isRtl ? 'فن ترك الانطباع الذي لا يُنسى' : 'The art of leaving an impression'}.&rdquo; {isRtl ? 'دار عطور فاخرة تأسست في القاهرة لابتكار توليفات نادرة تضاهي أفخم الدور العالمية، مع خدمة الدفع عند الاستلام والمعاينة الكاملة.' : 'Bespoke perfume atelier crafted in Cairo to compete with world-class French houses.'}
            </p>
            <div className="space-y-2 text-xs text-[#9EABA7] pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2DD4BF] flex-shrink-0" />
                <span>{isRtl ? 'القاهرة الجديدة، مصر' : 'New Cairo, Egypt'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#2DD4BF] flex-shrink-0" />
                <a href="tel:+201012345678" className="hover:text-white transition-colors">010 1234 5678 (WhatsApp Concierge)</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#2DD4BF] flex-shrink-0" />
                <span>concierge@a-and-s.com</span>
              </div>
            </div>
          </div>

          {/* Fragrance Families */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#FFFFFF] tracking-wider uppercase">
              {isRtl ? 'العائلات العطرية' : 'Fragrance Families'}
            </h4>
            <ul className="space-y-2 text-xs text-[#9EABA7]">
              <li>
                <Link href="/catalog?family=Oriental+Woody" className="hover:text-[#2DD4BF] transition-colors">
                  {isRtl ? 'أخشاب شرقية وعود' : 'Oriental Woody'}
                </Link>
              </li>
              <li>
                <Link href="/catalog?family=Floral+Amber" className="hover:text-[#2DD4BF] transition-colors">
                  {isRtl ? 'عنبر وزهور نقية' : 'Floral Amber'}
                </Link>
              </li>
              <li>
                <Link href="/catalog?family=Fresh+Citrus" className="hover:text-[#2DD4BF] transition-colors">
                  {isRtl ? 'حمضيات برغموت منعشة' : 'Fresh Citrus'}
                </Link>
              </li>
              <li>
                <Link href="/catalog?family=Leather+Spice" className="hover:text-[#2DD4BF] transition-colors">
                  {isRtl ? 'جلود وتوابل ملكية' : 'Leather & Spice'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#FFFFFF] tracking-wider uppercase">
              {isRtl ? 'خدمة العملاء' : 'Client Care'}
            </h4>
            <ul className="space-y-2 text-xs text-[#9EABA7]">
              <li>
                <Link href="/track-order" className="hover:text-[#2DD4BF] transition-colors">
                  {t('nav.track_order')}
                </Link>
              </li>
              <li>
                <Link href="/#brand-story" className="hover:text-[#2DD4BF] transition-colors">
                  {t('nav.brand_story')}
                </Link>
              </li>
              <li>
                <Link href="/catalog?sort=bestselling" className="hover:text-[#2DD4BF] transition-colors">
                  {isRtl ? 'الأكثر طلباً في مصر' : 'Bestsellers in Egypt'}
                </Link>
              </li>
              <li>
                <a href="https://wa.me/201012345678" target="_blank" rel="noopener noreferrer" className="hover:text-[#2DD4BF] transition-colors">
                  {isRtl ? 'محادثة المستشار العطري' : 'WhatsApp Fragrance Advisor'}
                </a>
              </li>
            </ul>
          </div>

          {/* Guarantees */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#FFFFFF] tracking-wider uppercase">
              {isRtl ? 'الضمانات الملكية' : 'The Guarantees'}
            </h4>
            <ul className="space-y-2 text-xs text-[#9EABA7]">
              <li className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isRtl ? 'أصلي 100% معمل القاهرة' : '100% Authentic Cairo Atelier'}</span>
              </li>
              <li>{isRtl ? 'معاينة الطرد عند الباب' : 'Visual Inspection Upon Delivery'}</li>
              <li>{isRtl ? 'علبة إهداء ملوكية مجانية' : 'Complimentary Gifting Presentation'}</li>
              <li>{isRtl ? 'عينتان مع كل زجاجة' : '2 Free Testing Samples'}</li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar with Discreet Admin Portal Link */}
        <div className="mt-14 pt-8 border-t border-[#1A2624] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6C7A77] gap-4">
          <p>
            &copy; {new Date().getFullYear()} A AND S Haute Parfumerie (دار عطور إيه آند إس). جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[#9EABA7]">العملة: الجنيه المصري (EGP)</span>
            <span className="text-[#9EABA7]">التوصيل: جميع محافظات مصر</span>
            {/* Private discreet link for staff admin */}
            <Link
              href="/admin"
              className="text-[#3A4543] hover:text-[#2DD4BF] transition-colors flex items-center gap-1"
              title="Private Management Suite"
            >
              <Lock className="w-3 h-3" />
              <span className="text-[10px]">Staff Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
