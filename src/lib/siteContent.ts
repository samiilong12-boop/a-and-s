export interface SiteContentConfig {
  // 0. Official Brand Logo Customizer (شعار المتجر الرسمي)
  brandLogoUrl: string;
  brandLogoLightUrl: string;
  brandLogoShape: 'circle' | 'square' | 'rounded';
  brandLogoBorder: 'gold' | 'turquoise' | 'subtle' | 'none';

  // Contact WhatsApp Numbers (أرقام الواتساب المعتمدة للدار)
  whatsapp1: string;
  whatsapp2: string;

  // 1. Hero & Stats
  visualMode: 'video' | 'photo';
  activeVideoUrl: string;
  activePhotoUrl: string;
  videoTitle: string;
  heroBadge: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroBrightness: number;
  heroOverlayDarkness: number;

  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  stat4Value: string;
  stat4Label: string;

  // 2. Bespoke Blend Banner (بنر الخلطة الخاصة)
  bespokeBadge: string;
  bespokeHeadline: string;
  bespokeSubtitle: string;
  bespokePlaceholder: string;
  bespokeButtonText: string;
  bespokeFeature1: string;
  bespokeFeature2: string;
  bespokeFeature3: string;

  // 3. Brand Story & Atelier (قصة الدار والمعمل)
  storyBadge: string;
  storyTitle: string;
  storyParagraph1: string;
  storyParagraph2: string;
  storyImage: string;
  storyImageQuote: string;
  storyImageTag: string;
  storyBenefit1Title: string;
  storyBenefit1Desc: string;
  storyBenefit2Title: string;
  storyBenefit2Desc: string;

  // 4. Riviera Campaign Banner (بنر حملة الريفييرا الصيفية)
  rivieraImage: string;
  rivieraBadge: string;
  rivieraHeadline: string;
  rivieraDescription: string;
  rivieraBtn1Text: string;
  rivieraBtn2Text: string;

  // 5. Fragrance Mastery & Ritual Showcase (هندسة العطر الفاخر والزجاجة)
  showcaseBadge: string;
  showcaseHeadline: string;
  showcaseDescription: string;
  showcaseBottleImage: string;
  showcaseBottleTag: string;
  showcaseBottleName: string;
  showcaseBottleSubtitle: string;
  showcaseMeter1Title: string;
  showcaseMeter1Val: string;
  showcaseMeter1Sub: string;
  showcaseMeter2Title: string;
  showcaseMeter2Val: string;
  showcaseMeter2Sub: string;
  showcaseMeter3Title: string;
  showcaseMeter3Val: string;
  showcaseMeter3Sub: string;
  showcasePill1: string;
  showcasePill2: string;
  showcasePill3: string;

  // 6. Footer Values Bar (شريط مميزات المتجر والتوصيل)
  footerShippingTitle: string;
  footerShippingDesc: string;
  footerCodTitle: string;
  footerCodDesc: string;
  footerConcentrationTitle: string;
  footerConcentrationDesc: string;
  footerBottleTitle: string;
  footerBottleDesc: string;

  // 7. Social Media Links (روابط منصات التواصل الاجتماعي الرسمية)
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl?: string;
  snapchatUrl?: string;

  updatedAt?: string;
}

export const SITE_CONTENT_STORAGE_KEY = 'raheeq_site_content_v2';
export const LEGACY_HERO_KEY = 'raheeq_hero_config';

export const DEFAULT_SITE_CONTENT: SiteContentConfig = {
  // 0. Official Brand Logo Customizer
  brandLogoUrl: '/images/raheeq-official-logo.png',
  brandLogoLightUrl: '/images/raheeq-official-logo-light.png',
  brandLogoShape: 'circle',
  brandLogoBorder: 'gold',

  // Contact WhatsApp Numbers
  whatsapp1: '01131068790',
  whatsapp2: '01011800245',

  // 1. Hero & Stats
  visualMode: 'video',
  activeVideoUrl: '/videos/campaign-hero.mp4',
  activePhotoUrl: '/images/campaign/as-signature-male-spray.jpg',
  videoTitle: 'فيديو الحملة الإعلانية الأصلي — رحيق (Raheeq)',
  heroBadge: 'دار العطور الملكية الخاصة • رحيق (Raheeq)',
  heroHeadline: 'عِـطْـرٌ يَـسْـبِـقُ حُـضُـورَكَ.. وَأَثَـرٌ لَا يَـمْـحُـوهُ الـزَّمَـانْ',
  heroSubtitle:
    'سلطان الحضور ونفحات صيغت لأصحاب الذوق الملكي الرفيع. أندر زيوت الشرق المعتقة ممزوجة بأنقى خلاصات العطور الباريسية، لتمنحك هيبة آسرة وثباتاً يُخلّد حضورك أينما حللت.',
  heroBrightness: 1.0,
  heroOverlayDarkness: 25,

  stat1Value: '+51',
  stat1Label: 'تركيبة عطرية فريدة',
  stat2Value: '25%',
  stat2Label: 'نسبة الزيوت العطرية النقية (25% Extrait)',
  stat3Value: '100%',
  stat3Label: 'دفع عند الاستلام والمعاينة',
  stat4Value: '24–48h',
  stat4Label: 'التوصيل إلى الباب (القاهرة وجميع المحافظات)',

  // 2. Bespoke Blend Banner
  bespokeBadge: 'خدمة التفصيل العطري الملكي المخصص',
  bespokeHeadline: 'لو عاوز عطر معين أو خلطة خاصة... اكتب لينا اسمه وحجمه وبنوفرو ليك',
  bespokeSubtitle:
    'مهما كان العطر نادراً أو عالمياً، أو حتى تركيبة سرية تجمع بين نفحاتك المفضلة (عود، مسك، أمبرغريس، أو زهور نادرة)، خبراؤنا يركبونه لك بتركيز 25% Extrait de Parfum مع ضمان ثبات وفوحان يتجاوز 14 ساعة.',
  bespokePlaceholder: 'اكتب اسم العطر أو الخلطة المطلوبة هنا (مثلاً: Creed Aventus أو خلطة توم فورد)...',
  bespokeButtonText: 'اطلب الآن وحدد الحجم',
  bespokeFeature1: 'أحجام 50ml و 100ml و 200ml',
  bespokeFeature2: 'تركيز نيش Extrait de Parfum 25%',
  bespokeFeature3: 'التوصيل إلى الباب ومعاينة قبل الدفع',

  // 3. Brand Story & Atelier
  storyBadge: 'أصالة الحرفة والرؤية',
  storyTitle: 'صُنعت في القاهرة لأصحاب الذوق الرفيع.',
  storyParagraph1:
    'في دار رحيق (Raheeq) نرفض الروائح الاصطناعية العابرة ونعتمد على البناء العطري الأصيل. انطلقت دارنا من القاهرة لتمزج تراث النباتات والعطور المصرية العريقة مع أرقى أسرار صناعة العطور الفرنسية.',
  storyParagraph2:
    'يمر كل عطر بمرحلة تعتيق دقيقة تتجاوز 60 يوماً، لتمتزج نفحات الورد الدمشقي مع العود المدخن المعتق والعنبر النادر في توازن متناغم وساحر.',
  storyImage: '/images/campaign/couple-sunset-romance.jpg',
  storyImageQuote: '«العطر ليس مجرد لمسة تجميلية، بل هو هالتك غير المرئية التي تبقى في ذاكرة المكان.»',
  storyImageTag: 'دار رحيق (RAHEEQ) للعطور الفاخرة — القاهرة',
  storyBenefit1Title: 'تركيز إكستري خالص 25%',
  storyBenefit1Desc: 'تركيز زيوت عطرية نقي 25% لثبات استثنائي يتجاوز 14 ساعة.',
  storyBenefit2Title: 'التوصيل إلى الباب والمعاينة',
  storyBenefit2Desc: 'عاين طردك الفاخر وتأكد من زجاجتك عند باب بيتك قبل دفع أي مليم.',

  // 4. Riviera Campaign Banner
  rivieraImage: '/images/campaign/female-coastal-spray.jpg',
  rivieraBadge: 'حملة صيف الريفييرا المتوسطية',
  rivieraHeadline: 'رذاذ البحر الفيروزي.. وانتعاش الحمضيات الذهبية',
  rivieraDescription:
    'مستوحاة من دفء شمس الأصيل على شواطئ البحر المتوسط، حيث تلتقي نفحات البرغموت الإيطالي النادر برحيق أزهار البرتقال ورذاذ النسيم الفيروزي العليل.',
  rivieraBtn1Text: 'اكتشف عطور الريفييرا',
  rivieraBtn2Text: 'مشاهدة الكتالوج الكامل',

  // 5. Fragrance Mastery & Ritual Showcase (هندسة العطر الفاخر والزجاجة)
  showcaseBadge: 'معايير الفخامة العالمية المستوحاة من باريس',
  showcaseHeadline: 'هندسة العطر الفاخر.. ثباتٌ أسطوري وحضورٌ يأسر الحواس',
  showcaseDescription:
    'تم تصميم كل قطرة في معملنا بالقاهرة وفق أعلى معايير الدور العالمية كـ Dior و Creed، بتركيز Extrait de Parfum يصل إلى 25% من أندر الزيوت الطبيعية النقية لضمان بقاء أثرك العطري حياً لأكثر من 14 ساعة.',
  showcaseBottleImage: '/images/raheeq-official-logo.png',
  showcaseBottleTag: 'Signature Creation',
  showcaseBottleName: 'SAUVAGE ELIXIR / SULTAN OUD',
  showcaseBottleSubtitle: 'التوقيع العطري الأرقى في الشرق الأوسط',
  showcaseMeter1Title: 'الفوحان (Sillage)',
  showcaseMeter1Val: '9.8 / 10',
  showcaseMeter1Sub: 'هالة قوية تملأ الأرجاء',
  showcaseMeter2Title: 'الثبات (Longevity)',
  showcaseMeter2Val: '+14 ساعة',
  showcaseMeter2Sub: 'يدوم على الأقمشة لأيام',
  showcaseMeter3Title: 'نسبة الزيوت',
  showcaseMeter3Val: '25% خالص',
  showcaseMeter3Sub: 'Extrait de Parfum مغلظ',
  showcasePill1: 'زيوت فرنسية نقية 25% Extrait',
  showcasePill2: 'التوصيل إلى الباب ومعاينة قبل الدفع كاش',
  showcasePill3: 'زجاج بلوري ثقيل بغطاء مغناطيسي',

  // 6. Footer Values Bar (شريط مميزات المتجر والتوصيل)
  footerShippingTitle: 'التوصيل إلى الباب',
  footerShippingDesc: 'توصيل مخصص وسريع لباب بيتك في القاهرة والإسكندرية وجميع محافظات مصر.',
  footerCodTitle: 'معاينة الطرد قبل الدفع كاش',
  footerCodDesc: 'عاين طردك الفاخر وتأكد من سلامة الزجاجة عند بابك قبل السداد للمندوب.',
  footerConcentrationTitle: 'تركيز زيوت نقية 25% Extrait',
  footerConcentrationDesc: 'ثبات استثنائي يتجاوز 14 ساعة وفوحان يملأ الأرجاء.',
  footerBottleTitle: 'زجاج بلوري ثقيل بغطاء مغناطيسي',
  footerBottleDesc: 'زجاجة بلورية محكمة الإغلاق تحفظ كثافة ونقاء الزيوت العطرية النادرة.',

  // 7. Social Media Links (روابط منصات التواصل الاجتماعي الرسمية)
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  tiktokUrl: 'https://tiktok.com',
  youtubeUrl: '',
  snapchatUrl: '',
};
