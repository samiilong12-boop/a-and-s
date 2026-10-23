'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const DICTIONARY: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.all_fragrances': { en: 'All Fragrances', ar: 'جميع العطور' },
  'nav.oud_woods': { en: 'Oud & Woods', ar: 'العود والأخشاب' },
  'nav.floral_amber': { en: 'Floral Amber', ar: 'عنبر وزهور' },
  'nav.brand_story': { en: 'Our Story', ar: 'قصة علامتنا' },
  'nav.track_order': { en: 'Track Order', ar: 'تتبع طلبك' },
  'nav.search_placeholder': { en: 'Search fragrance, notes, or SKU...', ar: 'ابحث عن عطر، نوتات، أو كود...' },
  'nav.bag': { en: 'Bag', ar: 'الحقيبة' },

  // Announcement Bar
  'announcement.free_shipping': {
    en: 'HAUTE PARFUMERIE • CASH ON DELIVERY & INSPECTION ACROSS EGYPT',
    ar: 'دار عطور ملكية خاصة • المعاينة الكاملة والدفع عند الاستلام بجميع المحافظات',
  },
  'announcement.cod': { en: 'Cash on Delivery Available', ar: 'الدفع عند الاستلام متاح' },
  'announcement.location': { en: 'Cairo, Egypt', ar: 'القاهرة، مصر' },

  // Hero Section - Royal Luxury Phrasing
  'hero.tag': {
    en: 'Royal Haute Parfumerie • Cairo Private Atelier',
    ar: 'دار العطور الملكية الخاصة • صُنعت في القاهرة',
  },
  'hero.title': {
    en: 'THE INVISIBLE CROWN OF UNFORGETTABLE PRESENCE.',
    ar: 'عِـطْـرٌ يَـسْـبِـقُ حُـضُـورَكَ.. وَأَثَـرٌ لَا يَـمْـحُـوهُ الـزَّمَـانْ',
  },
  'hero.subtitle': {
    en: 'Where majestic Egyptian botanical heritage meets French Haute Parfumerie. Masterfully formulated with up to 35% rare aged oils—crafted exclusively for those whose presence commands the room.',
    ar: 'سلطان الحضور ونفحات صيغت لأصحاب الذوق الملكي الرفيع. أندر زيوت الشرق المعتقة ممزوجة بأنقى خلاصات العطور الباريسية، لتمنحك هيبة آسرة وثباتاً يُخلّد حضورك أينما حللت.',
  },
  'hero.cta_explore': { en: 'Discover Royal Fragrances', ar: 'اكتشف التشكيلة الملكية' },
  'hero.cta_guide': { en: 'Scent Architecture Guide', ar: 'دليل النوتات والهرم العطري' },
  'hero.video_playing': { en: 'Atmospheric Video Active', ar: 'الفيديو السينمائي يعمل' },

  // Stats
  'stats.compositions': { en: 'Original Compositions', ar: 'تركيبة عطرية فريدة' },
  'stats.oil_ratio': { en: 'Precious Oil Concentration', ar: 'نسبة الزيوت العطرية النقية' },
  'stats.cod': { en: 'Cash On Delivery', ar: 'دفع عند الاستلام' },
  'stats.delivery_time': { en: 'Cairo & Giza Delivery', ar: 'توصيل القاهرة والجيزة خلال 24-48 ساعة' },

  // Sections
  'section.bestsellers_tag': { en: 'Curated Masterpieces', ar: 'روائع العطور الأكثر طلباً' },
  'section.bestsellers_title': { en: 'Bestselling Fragrances', ar: 'العطور الأكثر مبيعاً' },
  'section.bestsellers_desc': { en: 'Our most celebrated creations, acclaimed for their intoxicating complexity and longevity.', ar: 'أشهر ابتكاراتنا العطرية التي تميزت بفوحانها الاستثنائي وثباتها الطويل.' },
  
  'section.families_tag': { en: 'Olfactory Discovery', ar: 'رحلة استكشاف الحواس' },
  'section.families_title': { en: 'Explore by Fragrance Family', ar: 'استكشف العطور حسب العائلة العطرية' },
  'section.families_desc': { en: 'Each family represents an emotional journey. Filter through our catalogue to uncover scents that mirror your essence.', ar: 'كل عائلة عطرية تجربة شعورية فريدة. تصفح التشكيلة لتجد العطر الذي يمثلك.' },

  'section.new_arrivals_tag': { en: 'Fresh From The Atelier', ar: 'أحدث إصدارات المعمل' },
  'section.new_arrivals_title': { en: 'New Arrivals', ar: 'وصل حديثاً' },
  'section.new_arrivals_desc': { en: 'Newly bottled limited releases and contemporary scent profiles.', ar: 'إصدارات جديدة محدودة بنفحات عصرية فاخرة.' },

  'section.story_tag': { en: 'Artisanal Heritage & Vision', ar: 'أصالة الحرفة والرؤية' },
  'section.story_title': { en: 'Crafted in Cairo for the Discerning Connoisseur.', ar: 'صُنعت في القاهرة لأصحاب الذوق الرفيع.' },
  'section.story_p1': {
    en: 'At A AND S, we reject fleeting synthetic trends in favor of timeless perfume architecture. Founded in Cairo, our atelier unites ancient Egyptian botanical heritage with contemporary French Haute Parfumerie.',
    ar: 'في A AND S نرفض الروائح الاصطناعية العابرة ونعتمد على البناء العطري الأصيل. انطلقت دارنا من القاهرة لتمزج تراث النباتات والعطور المصرية العريقة مع أرقى أسرار صناعة العطور الفرنسية.',
  },
  'section.story_p2': {
    en: 'Every creation is aged through a meticulous maceration process of over 60 days, ensuring that rare Damascus roses, smoked aged agarwood, and ethically sourced ambergris marry in perfect equilibrium.',
    ar: 'يمر كل عطر بمرحلة تعتيق دقيقة تتجاوز 60 يوماً، لتمتزج نفحات الورد الدمشقي مع العود المدخن المعتق والعنبر النادر في توازن متناغم وساحر.',
  },

  // Cart & Drawer
  'cart.bag_title': { en: 'Your Fragrance Bag', ar: 'حقيبة العطور الخاصة بك' },
  'cart.items': { en: 'Items Selected', ar: 'عطور مختارة' },
  'cart.empty': { en: 'Your bag is currently empty', ar: 'حقيبة التسوق فارغة حالياً' },
  'cart.empty_desc': { en: 'Explore our collection of rare essences and artisanal compositions.', ar: 'استكشف مجموعتنا من الخلاصات النادرة والتركيبات الحرفية.' },
  'cart.free_unlocked': { en: 'You unlocked complimentary luxury delivery across Egypt!', ar: 'تهانينا! لقد حصلت على شحن مجاني فاخر لجميع أنحاء مصر!' },
  'cart.add_more_prefix': { en: 'Add', ar: 'أضف' },
  'cart.add_more_suffix': { en: 'for free luxury delivery', ar: 'للحصول على توصيل مجاني' },
  'cart.subtotal': { en: 'Subtotal', ar: 'المجموع الفرعي' },
  'cart.shipping_egypt': { en: 'Shipping across Egypt', ar: 'الشحن داخل جمهورية مصر العربية' },
  'cart.complimentary': { en: 'COMPLIMENTARY', ar: 'مجاني' },
  'cart.checkout_cta': { en: 'Proceed to Cash-on-Delivery Checkout', ar: 'المتابعة لإتمام الطلب (الدفع عند الاستلام)' },

  // Product Page & Actions
  'product.select_size': { en: 'Select Bottle Volume', ar: 'اختر حجم العبوة' },
  'product.in_stock': { en: 'In Stock — Ready for immediate dispatch', ar: 'متوفر — جاهز للشحن الفوري داخل مصر' },
  'product.low_stock': { en: 'Rare Edition: Limited bottles remaining', ar: 'إصدار نادر: تبقت عبوات قليلة في معمل القاهرة' },
  'product.out_of_stock': { en: 'Currently Out of Stock', ar: 'نفد من المخزون حالياً' },
  'product.add_to_bag': { en: 'Add To Bag', ar: 'إضافة إلى الحقيبة' },
  'product.added_success': { en: 'Added To Your Bag!', ar: 'تمت الإضافة بنجاح!' },
  'product.buy_now': { en: 'Instant Cash On Delivery Order', ar: 'طلب فوري بالدفع عند الاستلام' },
  'product.top_notes': { en: 'Top Notes', ar: 'القمة العطرية' },
  'product.heart_notes': { en: 'Heart Notes', ar: 'قلب العطر' },
  'product.base_notes': { en: 'Base Notes', ar: 'قاعدة العطر' },
  'product.pyramid_title': { en: 'Scent Notes Architecture', ar: 'الهرم العطري والتكوين' },

  // Checkout
  'checkout.title': { en: 'Cash On Delivery Checkout', ar: 'إتمام الطلب — الدفع عند الاستلام' },
  'checkout.customer_info': { en: 'Customer Contact Details', ar: 'بيانات العميل والتواصل' },
  'checkout.full_name': { en: 'Full Name', ar: 'الاسم الكامل' },
  'checkout.phone': { en: 'Egyptian Mobile Phone (11 digits)', ar: 'رقم الهاتف المحمول (11 رقماً)' },
  'checkout.email_optional': { en: 'Email (Optional)', ar: 'البريد الإلكتروني (اختياري)' },
  'checkout.address_section': { en: 'Delivery Address in Egypt', ar: 'عنوان التوصيل في مصر' },
  'checkout.governorate': { en: 'Governorate', ar: 'المحافظة' },
  'checkout.city': { en: 'City / District', ar: 'المدينة / الحي / المنطقة' },
  'checkout.street': { en: 'Street Address', ar: 'اسم الشارع وتفاصيل العنوان' },
  'checkout.building': { en: 'Building, Floor & Apt', ar: 'رقم العمارة / الدور / الشقة' },
  'checkout.notes': { en: 'Delivery Instructions', ar: 'ملاحظات لمندوب التوصيل' },
  'checkout.payment_method': { en: 'Payment Method', ar: 'طريقة الدفع' },
  'checkout.cod_badge': { en: 'Cash on Delivery (COD)', ar: 'الدفع نقداً عند الاستلام والمعاينة' },
  'checkout.cod_explain': {
    en: 'Pay the total order amount in cash directly to the courier upon delivery and visual inspection. No card required.',
    ar: 'ادفع إجمالي المبلغ نقداً للمندوب عند استلام الشحنة والتأكد منها. لا يلزم أي بطاقة بنكية.',
  },
  'checkout.place_order': { en: 'Place Cash-on-Delivery Order', ar: 'تأكيد طلب الشحن بالدفع عند الاستلام' },
  'checkout.submitting': { en: 'Confirming Order...', ar: 'جاري تأكيد الطلب...' },

  // Floating Contact
  'contact.whatsapp': { en: 'Chat on WhatsApp', ar: 'تواصل عبر واتساب' },
  'contact.call_us': { en: 'Call Atelier Concierge', ar: 'اتصل بخدمة العملاء' },
  'contact.available': { en: 'Available 24/7 in Egypt', ar: 'متاحون لخدمتكم يومياً داخل مصر' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar'); // Default to Arabic as primary target

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('a_and_s_lang') as Language;
      if (savedLang === 'en' || savedLang === 'ar') {
        setLanguageState(savedLang);
        document.documentElement.lang = savedLang;
        document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
      } else {
        document.documentElement.lang = 'ar';
        document.documentElement.dir = 'rtl';
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('a_and_s_lang', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const t = (key: string): string => {
    const entry = DICTIONARY[key];
    if (!entry) return key;
    return entry[language] || entry['en'] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isRtl: language === 'ar',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
