'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  ShoppingBag,
  FlaskConical,
  Heart,
  Droplets,
  Crown,
  Flame,
  Wind,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { FAMOUS_50_PERFUMES } from '@/lib/data/products';
import { Product } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useCustomRequest } from '@/context/CustomRequestContext';
import { formatPrice } from '@/lib/currency';

interface FragranceFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuizAnswers {
  gender: 'MEN' | 'WOMEN' | 'UNISEX' | 'ANY';
  occasion: 'DAILY' | 'FORMAL' | 'NIGHT' | 'SUMMER';
  vibe: 'BOLD' | 'ROYAL' | 'MYSTERIOUS' | 'FRESH';
  scentFamily: 'ORIENTAL_OUD' | 'SWEET_VANILLA' | 'WOODY_LEATHER' | 'CITRUS_FLORAL';
}

export function FragranceFinderModal({ isOpen, onClose }: FragranceFinderModalProps) {
  const { t, isRtl } = useLanguage();
  const { addItem, setIsCartOpen } = useCart();
  const { openModal: openBespokeModal } = useCustomRequest();

  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<QuizAnswers>({
    gender: 'ANY',
    occasion: 'FORMAL',
    vibe: 'ROYAL',
    scentFamily: 'ORIENTAL_OUD',
  });
  const [recommendations, setRecommendations] = useState<Array<{ product: Product; matchScore: number }>>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  if (!isOpen) return null;

  // Calculate intelligent matches
  const calculateMatches = (finalAnswers: QuizAnswers) => {
    setIsCalculating(true);
    setTimeout(() => {
      const scored = FAMOUS_50_PERFUMES.map((product) => {
        let score = 70; // baseline

        // Gender Match
        if (finalAnswers.gender !== 'ANY') {
          if (product.gender === finalAnswers.gender) score += 15;
          else if (product.gender === 'UNISEX') score += 10;
          else score -= 20;
        } else {
          score += 10;
        }

        // Scent Family & Notes Match
        const desc = `${product.descriptionEn} ${product.descriptionAr} ${product.fragranceFamily} ${product.topNotes.join(' ')} ${product.heartNotes.join(' ')} ${product.baseNotes.join(' ')}`.toLowerCase();

        if (finalAnswers.scentFamily === 'ORIENTAL_OUD') {
          if (desc.includes('oud') || desc.includes('عود') || desc.includes('amber') || desc.includes('عنبر') || desc.includes('oriental')) {
            score += 14;
          }
        } else if (finalAnswers.scentFamily === 'SWEET_VANILLA') {
          if (desc.includes('vanilla') || desc.includes('فانيلا') || desc.includes('tonka') || desc.includes('gourmand') || desc.includes('sweet') || desc.includes('tobacco')) {
            score += 14;
          }
        } else if (finalAnswers.scentFamily === 'WOODY_LEATHER') {
          if (desc.includes('wood') || desc.includes('leather') || desc.includes('خشب') || desc.includes('sandalwood') || desc.includes('cedar') || desc.includes('vetiver')) {
            score += 14;
          }
        } else if (finalAnswers.scentFamily === 'CITRUS_FLORAL') {
          if (desc.includes('bergamot') || desc.includes('citrus') || desc.includes('حمضيات') || desc.includes('rose') || desc.includes('jasmine') || desc.includes('fresh')) {
            score += 14;
          }
        }

        // Vibe Match
        if (finalAnswers.vibe === 'BOLD') {
          if (product.concentration === 'EXTRAIT_DE_PARFUM' || product.isBestseller) score += 5;
        } else if (finalAnswers.vibe === 'ROYAL') {
          if (desc.includes('royal') || desc.includes('ملكي') || desc.includes('فاخر') || desc.includes('iconic')) score += 5;
        }

        // Normalize between 88% and 99%
        const normalizedScore = Math.min(99, Math.max(88, score));
        return { product, matchScore: normalizedScore };
      });

      scored.sort((a, b) => b.matchScore - a.matchScore);
      setRecommendations(scored.slice(0, 2));
      setIsCalculating(false);
      setStep(5); // Show results
    }, 450);
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      calculateMatches(answers);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleReset = () => {
    setStep(1);
    setAnswers({
      gender: 'ANY',
      occasion: 'FORMAL',
      vibe: 'ROYAL',
      scentFamily: 'ORIENTAL_OUD',
    });
    setRecommendations([]);
  };

  const handleSelectBespokeFromMatch = (perfumeName: string) => {
    onClose();
    openBespokeModal(perfumeName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#080A0A]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0F1413] border border-[#54d1b2]/30 w-full max-w-2xl rounded-3xl shadow-[0_0_80px_rgba(84,209,178,0.15)] overflow-hidden flex flex-col max-h-[92vh] text-[#FAF9F5]">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#141B1A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00bc7d]/30 to-[#54d1b2]/30 flex items-center justify-center border border-[#54d1b2]/40 text-[#54d1b2]">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-white tracking-wide">
                {isRtl ? 'كاشف الذوق العطري الذكي (AI Fragrance Matcher)' : 'AI Luxury Fragrance Finder'}
              </h2>
              <p className="text-[10px] sm:text-xs text-[#788784] font-medium">
                {isRtl ? 'دار رَحِـيـقْ — تحليلات هرمية للرائحة الأكثر تناغماً مع حضورك' : 'Discover the signature scent that matches your royal aura'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#A2ADA9] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {step <= 4 && (
            <div className="space-y-6">
              {/* Progress Steps Header */}
              <div className="flex items-center justify-between text-xs text-[#788784] border-b border-white/10 pb-3">
                <span className="font-bold text-[#54d1b2]">
                  {isRtl ? `الخطوة ${step} من 4` : `Step ${step} of 4`}
                </span>
                <span className="text-[11px] tracking-wider uppercase">
                  {step === 1 && (isRtl ? 'التصنيف والشخصية' : 'Identity & Preference')}
                  {step === 2 && (isRtl ? 'المناسبة والأوقات' : 'Occasion & Timing')}
                  {step === 3 && (isRtl ? 'العائلة العطرية والنوتات' : 'Scent Family')}
                  {step === 4 && (isRtl ? 'طابع الفوحان والأثر' : 'Aura & Projection')}
                </span>
              </div>

              {/* Step 1: Gender / Preference */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="font-serif text-lg font-bold text-white">
                    {isRtl ? 'لمن تبحث عن هذا العطر الاستثنائي؟' : 'Who is this royal fragrance for?'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'MEN', titleAr: 'عطر رجالي مهيب', titleEn: 'Men’s Prestige', descAr: 'وقار، ثبات، وأخشاب عميقة' },
                      { key: 'WOMEN', titleAr: 'عطر أنثوي آسر', titleEn: 'Women’s Allure', descAr: 'أنوثة راقية وفانيلا ناعمة' },
                      { key: 'UNISEX', titleAr: 'نيش ملكي للجنسين', titleEn: 'Royal Unisex Niche', descAr: 'تميز فريد وتناغم متوازن' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setAnswers({ ...answers, gender: opt.key as any })}
                        className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between h-28 ${
                          answers.gender === opt.key
                            ? 'bg-[#54d1b2]/15 border-[#54d1b2] text-white shadow-[0_0_20px_rgba(84,209,178,0.2)]'
                            : 'bg-[#141B1A] border-white/10 text-[#A2ADA9] hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Crown className={`w-4 h-4 ${answers.gender === opt.key ? 'text-[#54d1b2]' : 'text-[#788784]'}`} />
                          {answers.gender === opt.key && <Check className="w-4 h-4 text-[#54d1b2]" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{isRtl ? opt.titleAr : opt.titleEn}</p>
                          <p className="text-[10px] text-[#788784] mt-0.5">{opt.descAr}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Occasion */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="font-serif text-lg font-bold text-white">
                    {isRtl ? 'في أي أوقات ومناسبات ترغب بارتدائه؟' : 'When do you plan to wear it?'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'FORMAL', titleAr: 'المناسبات الرسمية والأفراح', titleEn: 'Black-Tie & Formal Galas', descAr: 'حضور يلفت الأنظار ويترك بصمة ملكية' },
                      { key: 'DAILY', titleAr: 'العمل اليومي واللقاءات الراقية', titleEn: 'Daily Executive & Office', descAr: 'فخامة هادئة غير مزعجة ومريحة للأنف' },
                      { key: 'NIGHT', titleAr: 'السهرات الخاصة واللقاءات الدافئة', titleEn: 'Intimate Evenings & Dates', descAr: 'دفء جذاب ومغناطيسية تأسر الحواس' },
                      { key: 'SUMMER', titleAr: 'الصيف والأجواء المنعشة والحرارة', titleEn: 'Summer & Coastal Fresh', descAr: 'انتعاش نقي يدوم لساعات طويلة' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setAnswers({ ...answers, occasion: opt.key as any })}
                        className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between h-28 ${
                          answers.occasion === opt.key
                            ? 'bg-[#54d1b2]/15 border-[#54d1b2] text-white shadow-[0_0_20px_rgba(84,209,178,0.2)]'
                            : 'bg-[#141B1A] border-white/10 text-[#A2ADA9] hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Compass className={`w-4 h-4 ${answers.occasion === opt.key ? 'text-[#54d1b2]' : 'text-[#788784]'}`} />
                          {answers.occasion === opt.key && <Check className="w-4 h-4 text-[#54d1b2]" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{isRtl ? opt.titleAr : opt.titleEn}</p>
                          <p className="text-[10px] text-[#788784] mt-0.5">{opt.descAr}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Scent Family */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="font-serif text-lg font-bold text-white">
                    {isRtl ? 'ما هي النوتات الأكثر جذباً لحاستك الشمية؟' : 'Which scent profile captivates you most?'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'ORIENTAL_OUD', titleAr: 'العود المعتق والعنبر الملكي', titleEn: 'Oud & Amber Royalty', descAr: 'نوتات بخورية شرقية فاخرة وثقيلة' },
                      { key: 'SWEET_VANILLA', titleAr: 'الفانيلا والتوباكو والتوابل الدافئة', titleEn: 'Vanilla, Tobacco & Spices', descAr: 'حلاوة دافئة ومثيرة لا تُقاوم' },
                      { key: 'WOODY_LEATHER', titleAr: 'الأخشاب النبيلة والجلود والمسك', titleEn: 'Precious Woods & Leather', descAr: 'خشب الصندل، الباتشولي، والجلود الفخمة' },
                      { key: 'CITRUS_FLORAL', titleAr: 'الحمضيات الإيطالية والزهور المنعشة', titleEn: 'Citrus, Bergamot & Florals', descAr: 'انتعاش البرغموت والياسمين الراقي' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setAnswers({ ...answers, scentFamily: opt.key as any })}
                        className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between h-28 ${
                          answers.scentFamily === opt.key
                            ? 'bg-[#54d1b2]/15 border-[#54d1b2] text-white shadow-[0_0_20px_rgba(84,209,178,0.2)]'
                            : 'bg-[#141B1A] border-white/10 text-[#A2ADA9] hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Droplets className={`w-4 h-4 ${answers.scentFamily === opt.key ? 'text-[#54d1b2]' : 'text-[#788784]'}`} />
                          {answers.scentFamily === opt.key && <Check className="w-4 h-4 text-[#54d1b2]" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{isRtl ? opt.titleAr : opt.titleEn}</p>
                          <p className="text-[10px] text-[#788784] mt-0.5">{opt.descAr}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Aura & Projection */}
              {step === 4 && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="font-serif text-lg font-bold text-white">
                    {isRtl ? 'ما هو الانطباع والأثر الذي تود تركه؟' : 'What impression should your scent leave?'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'ROYAL', titleAr: 'هيبة ملكية ووقار راقي', titleEn: 'Regal Poise & Elegance', descAr: 'ثبات فائق يعكس المكانة الرفيعة' },
                      { key: 'BOLD', titleAr: 'فوحان ناري يلفت كل من في المكان', titleEn: 'Bold & Intoxicating Sillage', descAr: 'انتشار ساحق لا يمر دون سؤال عن اسم عطرك' },
                      { key: 'MYSTERIOUS', titleAr: 'غموض جذاب يثير الفضول', titleEn: 'Enigmatic & Seductive', descAr: 'نوتات غير مألوفة تتطور ببطء مع حرارة الجسم' },
                      { key: 'FRESH', titleAr: 'نقاء وحيوية وثقة متجددة', titleEn: 'Crisp & Invigorating', descAr: 'إشراقة يومية مريحة تشع بالحياة' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setAnswers({ ...answers, vibe: opt.key as any })}
                        className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between h-28 ${
                          answers.vibe === opt.key
                            ? 'bg-[#54d1b2]/15 border-[#54d1b2] text-white shadow-[0_0_20px_rgba(84,209,178,0.2)]'
                            : 'bg-[#141B1A] border-white/10 text-[#A2ADA9] hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Flame className={`w-4 h-4 ${answers.vibe === opt.key ? 'text-[#54d1b2]' : 'text-[#788784]'}`} />
                          {answers.vibe === opt.key && <Check className="w-4 h-4 text-[#54d1b2]" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{isRtl ? opt.titleAr : opt.titleEn}</p>
                          <p className="text-[10px] text-[#788784] mt-0.5">{opt.descAr}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Calculating Loading State */}
          {isCalculating && (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 border-2 border-[#54d1b2] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-serif text-lg font-bold text-white">
                {isRtl ? 'جاري تحليل الأهرام العطرية واختيار أفضل العطور لك...' : 'Analyzing scent pyramids & matching your royal profile...'}
              </p>
              <p className="text-xs text-[#788784]">
                {isRtl ? 'نبحث عبر تشكيلة رحيق المعتقة (تركيز 25% Extrait de Parfum)' : 'Scanning 50+ world-class Extrait formulas'}
              </p>
            </div>
          )}

          {/* Step 5: Recommendations Result Screen */}
          {step === 5 && recommendations.length > 0 && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1 rounded-full font-bold">
                  <Crown className="w-3.5 h-3.5" />
                  {isRtl ? 'اكتمل التحليل العطري بنجاح' : 'AI Match Complete'}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  {isRtl ? 'العطور الأكثر تناغماً مع حضورك الملكي' : 'Your Signature Fragrance Matches'}
                </h3>
                <p className="text-xs text-[#A2ADA9]">
                  {isRtl ? 'تم اختيار هذه التركيبات بدقة لتمنحك أقصى درجات الثبات والفوحان الفاخر.' : 'Curated specifically based on your selected notes and aura.'}
                </p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendations.map(({ product, matchScore }, idx) => (
                  <div
                    key={product.id}
                    className="bg-[#141B1A] border border-[#54d1b2]/40 rounded-2xl p-4 shadow-lg space-y-4 flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Top Match Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#00bc7d]/20 text-[#54d1b2] border border-[#54d1b2]/40">
                        {isRtl ? `تطابق ${matchScore}%` : `${matchScore}% Match`}
                      </span>
                      <span className="text-[10px] text-[#D4AF37] tracking-widest uppercase font-mono">
                        {idx === 0 ? (isRtl ? 'الترشيح الأول 👑' : 'Top Choice 👑') : (isRtl ? 'بديل ملكي ✨' : 'Alternative ✨')}
                      </span>
                    </div>

                    {/* Bottle Visual & Name */}
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-20 bg-[#080A0A] rounded-xl border border-white/10 overflow-hidden shrink-0 flex items-center justify-center p-1">
                        <img src={product.imageUrl} alt={product.nameEn} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-[#788784] uppercase font-bold tracking-wider">{product.brand}</span>
                        <h4 className="font-serif text-base font-bold text-white truncate">
                          {isRtl ? product.nameAr || product.nameEn : product.nameEn}
                        </h4>
                        <p className="text-xs text-[#54d1b2] font-bold mt-1">
                          {product.variants[0]?.regularPriceEgp ? `${product.variants[0].regularPriceEgp.toLocaleString()} ج.م` : '1,850 ج.م'}
                          <span className="text-[10px] text-[#788784] font-normal mr-1"> (100 مل معتق)</span>
                        </p>
                      </div>
                    </div>

                    {/* Notes Pyramid Snapshot */}
                    <div className="bg-[#080A0A]/70 rounded-xl p-2.5 text-[11px] space-y-1 border border-white/5">
                      <div className="flex items-center gap-1.5 text-[#A2ADA9]">
                        <span className="text-[#D4AF37] font-bold">القمة:</span>
                        <span className="truncate">{product.topNotes.slice(0, 2).join('، ')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#A2ADA9]">
                        <span className="text-[#54d1b2] font-bold">القلب:</span>
                        <span className="truncate">{product.heartNotes.slice(0, 2).join('، ')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#A2ADA9]">
                        <span className="text-[#00bc7d] font-bold">القاعدة:</span>
                        <span className="truncate">{product.baseNotes.slice(0, 2).join('، ')}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-1">
                      <button
                        onClick={() => {
                          const variant = product.variants[0];
                          if (variant) {
                            addItem(product, variant, 1);
                            setIsCartOpen(true);
                            onClose();
                          }
                        }}
                        className="w-full bg-gradient-to-r from-[#00bc7d] to-[#54d1b2] hover:from-[#54d1b2] hover:to-[#00bc7d] text-[#080A0A] font-extrabold py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01]"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'معاينة وطلب عند الاستلام' : 'Order With Inspection'}</span>
                      </button>

                      <button
                        onClick={() => handleSelectBespokeFromMatch(product.nameEn)}
                        className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-2 px-3 rounded-xl text-[11px] border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <FlaskConical className="w-3 h-3 text-[#D4AF37]" />
                        <span>{isRtl ? 'طلب خلطة خاصة بنفس الرائحة' : 'Request Bespoke Formula'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Notice */}
              <div className="text-center pt-2">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs text-[#788784] hover:text-[#54d1b2] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'إعادة تشغيل الاختبار لاختيار نمط آخر' : 'Retake Fragrance Quiz'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer (Step navigation) */}
        {step <= 4 && (
          <div className="px-6 py-4 border-t border-white/10 bg-[#141B1A] flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className="text-xs text-[#A2ADA9] hover:text-white disabled:opacity-40 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg border border-white/5"
            >
              {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              <span>{isRtl ? 'السابق' : 'Back'}</span>
            </button>

            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-[#00bc7d] to-[#54d1b2] hover:from-[#54d1b2] hover:to-[#00bc7d] text-[#080A0A] font-extrabold text-xs uppercase tracking-wider py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(84,209,178,0.25)] transition-all hover:scale-[1.02]"
            >
              <span>{step === 4 ? (isRtl ? 'كشف العطر المطابق ⚜️' : 'Reveal Matches ⚜️') : (isRtl ? 'التالي' : 'Next')}</span>
              {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
