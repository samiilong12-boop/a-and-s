import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllCategories } from '@/lib/catalog';
import {
  Sparkles,
  BookOpen,
  Layers,
  Droplets,
  ShieldCheck,
  Thermometer,
  Clock,
  Compass,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://a-and-s.vercel.app';

export const metadata: Metadata = {
  title: 'دليل النخبة لفنون العطور الملكية وتدرجات الثبات | دار رَحِيقْ',
  description:
    'دليل شامل من خبراء دار رحيق: الفرق الحقيقي بين تركيزات العطور (30% Extrait vs EDP)، كيفية معاينة العطر عند الاستلام، وفهم الهرم العطري وأسرار بقاء الرائحة لأكثر من 14 ساعة.',
  alternates: {
    canonical: `${SITE_URL}/fragrance-guide`,
  },
  openGraph: {
    title: 'دليل النخبة لفنون العطور الملكية والتركيزات | دار رَحِيقْ',
    description:
      'دليل تعليمي متكامل حول تركيزات العطور (30% Extrait)، الهرم العطري، وطريقة المعاينة الصحيحة عند الاستلام.',
    url: `${SITE_URL}/fragrance-guide`,
    siteName: 'دار رَحِيقْ للعطور الملكية',
    images: [{ url: '/images/raheeq-official-logo.png', width: 1200, height: 630 }],
    type: 'article',
    locale: 'ar_EG',
  },
};

export default function FragranceGuidePage() {
  const categories = getAllCategories();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'الرئيسية',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'دليل العطور',
            item: `${SITE_URL}/fragrance-guide`,
          },
        ],
      },
      {
        '@type': 'Article',
        headline: 'دليل النخبة لفنون العطور الملكية وتدرجات الثبات',
        description: 'دليل تعليمي متكامل حول تركيزات العطور 30% Extrait de Parfum والهرم العطري وفحص الطرد عند الاستلام.',
        author: {
          '@type': 'Organization',
          name: 'دار رَحِيقْ للعطور الملكية',
        },
        publisher: {
          '@type': 'Organization',
          name: 'دار رَحِيقْ للعطور الملكية',
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/images/raheeq-official-logo.png`,
          },
        },
        mainEntityOfPage: `${SITE_URL}/fragrance-guide`,
        datePublished: '2026-01-01',
        dateModified: '2026-10-31',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-[#576563]">
          <Link href="/" className="hover:text-[#080A0A] transition-colors">الرئيسية</Link>
          <span>/</span>
          <span className="text-[#0D9488] font-bold">دليل فنون العطور الملكية</span>
        </nav>

        {/* Hero Banner */}
        <div className="bg-[#080A0A] text-white rounded-3xl p-8 sm:p-14 border border-[#2DD4BF]/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#2DD4BF]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2DD4BF]/20 border border-[#2DD4BF]/40 text-[#2DD4BF] text-xs font-bold font-mono">
              <BookOpen className="w-3.5 h-3.5" />
              <span>موسوعة دار رَحِيقْ التعليمية</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              فن ترك الأثر الذي لا يُنسى: دليلك الشامل لعطور النيش الفاخرة
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              في دار رَحِيقْ، نؤمن بأن العطر ليس مجرد رائحة، بل هو توقيعك الشخصي وهويتك الخفية في أي مجلس تدخله. نقدم لك هذا الدليل لتتعرف على أسرار الهرم العطري، والفرق بين التركيزات، وكيف تختار العطر المناسب لشخصيتك.
            </p>
          </div>
        </div>

        {/* Section 1: Fragrance Concentrations */}
        <section className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E6E1D5] shadow-xs space-y-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-[#0D9488] font-bold font-mono">
              الفصل الأول • Concentration Science
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080A0A]">
              1. دليل تركيزات العطور: ما الفرق الحقيقي؟
            </h2>
          </div>

          <p className="text-sm text-[#576563] leading-relaxed">
            يحدد تركيز الزيوت العطرية النقية (Pure Fragrance Oil Absolutes) داخل الزجاجة كلاً من قوة الفوحان وساعات الثبات على الملابس والجلد. إليك المقارنة المعتمدة عالمياً:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 bg-[#FAF8F4] rounded-2xl border border-[#E6E1D5] space-y-3">
              <span className="text-xs font-mono font-bold text-[#788784] block">10% - 15%</span>
              <h3 className="font-serif font-bold text-base text-[#080A0A]">أو دو تواليت (Eau de Toilette)</h3>
              <p className="text-xs text-[#576563] leading-relaxed">
                عطور خفيفة جداً، سريعة التبخر، تمنح انتعاشاً لمدة 2 إلى 4 ساعات كحد أقصى. مناسبة للنوادي الرياضية والأوقات المنزلية.
              </p>
            </div>

            <div className="p-6 bg-[#FAF8F4] rounded-2xl border border-[#E6E1D5] space-y-3">
              <span className="text-xs font-mono font-bold text-[#788784] block">15% - 20%</span>
              <h3 className="font-serif font-bold text-base text-[#080A0A]">أو دو بارفان (Eau de Parfum)</h3>
              <p className="text-xs text-[#576563] leading-relaxed">
                التركيز التجاري الأكثر شيوعاً في المتاجر. يدوم ما بين 6 إلى 8 ساعات، ويتميز بتوازن جيد بين الفوحان المبدئي وساعات البقاء.
              </p>
            </div>

            <div className="p-6 bg-[#080A0A] text-white rounded-2xl border border-[#2DD4BF]/50 space-y-3 shadow-lg relative overflow-hidden">
              <div className="absolute top-2 left-2 bg-[#2DD4BF] text-[#080A0A] text-[10px] font-bold px-2 py-0.5 rounded">
                معيار دار رحيق
              </div>
              <span className="text-xs font-mono font-bold text-[#2DD4BF] block">30% Extrait خالص</span>
              <h3 className="font-serif font-bold text-base text-white">إكستري دو بارفان (Extrait de Parfum)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                أعلى درجات الفخامة النيش على الإطلاق. زيوت نقية وثقيلة تدوم لأكثر من 14 إلى 24 ساعة، مع فوحان أرستقراطي مهيب لا يختفي سريعاً.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: The Olfactory Pyramid */}
        <section className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E6E1D5] shadow-xs space-y-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-[#0D9488] font-bold font-mono">
              الفصل الثاني • The Olfactory Pyramid
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080A0A]">
              2. كيف تقرأ الهرم العطري للعطر الفاخر؟
            </h2>
          </div>

          <p className="text-sm text-[#576563] leading-relaxed">
            العطر الأصيل كالمقطوعة الموسيقية، يتغير على بشرتك بمرور الدقائق والساعات عبر ثلاثة أطوار متناغمة:
          </p>

          <div className="space-y-4">
            <div className="p-5 bg-[#FAF8F4] rounded-2xl border-r-4 border-r-[#0D9488] border border-[#E6E1D5] space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-sm text-[#080A0A]">القمة (Top Notes): الانطباع الأول</h3>
                <span className="text-xs font-mono font-bold text-[#0D9488]">أول 15 دقيقة</span>
              </div>
              <p className="text-xs text-[#576563] leading-relaxed">
                الجزيئات الخفيفة المنعشة كالبرغموت والليمون والتفاح واللافندر. هي أول ما تشمه فور رش العطر، وتمنحك شرارة الانتعاش الأولى.
              </p>
            </div>

            <div className="p-5 bg-[#FAF8F4] rounded-2xl border-r-4 border-r-[#D4AF37] border border-[#E6E1D5] space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-sm text-[#080A0A]">القلب (Heart Notes): روح وهوية العطر</h3>
                <span className="text-xs font-mono font-bold text-[#D4AF37]">من 30 دقيقة إلى 4 ساعات</span>
              </div>
              <p className="text-xs text-[#576563] leading-relaxed">
                جوهر التوليفة وشخصيتها الحقيقية كالورد الدمشقي، والياسمين، والتوابل الدافئة كالهيل والقرفة. يظهر هذا الطور بعد هدوء القمة.
              </p>
            </div>

            <div className="p-5 bg-[#FAF8F4] rounded-2xl border-r-4 border-r-[#8C6207] border border-[#E6E1D5] space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-sm text-[#080A0A]">القاعدة (Base Notes): الثبات والفوحان الأسطوري</h3>
                <span className="text-xs font-mono font-bold text-[#8C6207]">من 4 ساعات وحتى 24 ساعة</span>
              </div>
              <p className="text-xs text-[#576563] leading-relaxed">
                أثقل المكونات وأكثرها قيمة كخشب الصندل، ودهن العود، والباتشولي، والفانيليا، والعنبر الملكي. هذه هي الرائحة التي تلتصق بألياف ملابسك وتجعلك مميزاً.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: White Glove Inspection Protocol */}
        <section className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E6E1D5] shadow-xs space-y-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-[#0D9488] font-bold font-mono">
              الفصل الثالث • Inspection Guarantee
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080A0A]">
              3. البروتوكول الملكي لمعاينة العطر عند باب بيتك
            </h2>
          </div>

          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3 text-xs text-emerald-950">
            <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>حق المعاينة الكاملة قبل سداد أي مبلغ للمندوب:</span>
            </div>
            <p className="leading-relaxed">
              نحن في دار رَحِيقْ نضمن جودة زيوتنا وتطابقها التام مع أرقى المعايير. لذلك، نمنح عميلنا حق فتح كرتونة الشحن، فحص الزجاجة والتغليف ورش رشة اختبارية للتأكد التام من مطابقة العطر لذوقه قبل الدفع للمندوب.
            </p>
            <p className="leading-relaxed font-semibold">
              وفي حال عدم الرغبة في الاستلام أو إلغاء الطلب عند الباب، يلتزم العميل بسداد قيمة مصاريف الشحن والتوصيل المقررة للمندوب فقط، دون أي إلزام بشراء العطر.
            </p>
          </div>
        </section>

        {/* Section 4: Explore Fragrance Families */}
        <section className="space-y-6">
          <div className="space-y-1 text-center max-w-xl mx-auto">
            <span className="text-xs uppercase tracking-widest text-[#0D9488] font-bold font-mono">
              العائلات العطرية السبع
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080A0A]">
              استكشف تشكيلات دار رَحِيقْ حسب الطابع
            </h2>
            <p className="text-xs text-[#788784]">
              انقر على أي عائلة عطرية للتعرف على خصائصها وتصفح عطورها المتاحة للشحن الفوري:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="bg-white p-6 rounded-2xl border border-[#E6E1D5] hover:border-[#2DD4BF] hover:shadow-lg transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-[#0D9488] uppercase tracking-wider block">
                    {cat.titleEn}
                  </span>
                  <h3 className="font-serif font-bold text-base text-[#080A0A] group-hover:text-[#0D9488] transition-colors">
                    {cat.titleAr}
                  </h3>
                  <p className="text-xs text-[#576563] line-clamp-3 leading-relaxed">
                    {cat.descriptionAr}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E6E1D5]/60 flex items-center justify-between text-xs font-bold text-[#080A0A] group-hover:text-[#0D9488]">
                  <span>تصفح عطور القسم</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 duration-200" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="bg-[#080A0A] text-white rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold">
            جاهز لاكتشاف توقيعك العطري الملكي؟
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            تصفح أكثر من 50 عطراً مستوحاة من أعرق النفحات العالمية بتركيز 30% Extrait de Parfum مع خدمة المعاينة عند الاستلام.
          </p>
          <div className="pt-2">
            <Link
              href="/catalog"
              className="bg-gradient-to-r from-[#00bc7d] to-[#2DD4BF] text-slate-950 font-extrabold px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider inline-block shadow-lg hover:brightness-110 transition-transform hover:scale-105"
            >
              استكشف الكتالوج الكامل الآن
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
