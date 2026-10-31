export interface CategoryMeta {
  slug: string;
  family: string;
  titleAr: string;
  titleEn: string;
  badgeAr: string;
  descriptionAr: string;
  descriptionEn: string;
  metaTitleAr: string;
  metaDescAr: string;
  olfactoryNotesHint: string[];
}

export const CATEGORY_REGISTRY: CategoryMeta[] = [
  {
    slug: 'woody',
    family: 'Woody',
    titleAr: 'العطور الخشبية النبيلة',
    titleEn: 'Noble Woody Fragrances',
    badgeAr: 'أخشاب نادرة وثبات أسطوري',
    descriptionAr: 'توليفات راقية تعتمد على أندر أخشاب الصندل الميسوري، والأرز الأطلسي، ونجيل الهند الهايتي. تتميز بالطابع الهادئ، والجاذبية العميقة، والفوحان الدائم الذي يناسب الاجتماعات والمناسبات الرسمية.',
    descriptionEn: 'Sophisticated compositions crafted around rare Mysore sandalwood, Atlas cedar, and Haitian vetiver for enduring quiet luxury.',
    metaTitleAr: 'عطور خشبية فاخرة | صندل وأرز معتق | دار رَحِيقْ',
    metaDescAr: 'اكتشف تشكيلة العطور الخشبية من دار رحيق. تركيز نيش فاخر (Extrait de Parfum) يدوم طويلاً، بمكونات الصندل والأرز والفيتيفر مع فحص الطرد عند الاستلام.',
    olfactoryNotesHint: ['صندل ميسوري', 'خشب الأرز', 'فيتيفر هايتي', 'أخشاب البتولا المدخنة'],
  },
  {
    slug: 'oriental',
    family: 'Oriental',
    titleAr: 'العطور الشرقية الملكية والعود',
    titleEn: 'Royal Oriental & Oud Collection',
    badgeAr: 'دهن عود معتق وعنبر ملكي',
    descriptionAr: 'نفحات شرقية آسرة مستخلصة من دهن العود الكمبودي المعتق، والعنبر الملكي، واللبان الحوجري. هيبة كلاسيكية متجددة تعكس دفء الشرق وسحر لياليه الفاخرة.',
    descriptionEn: 'Intense oriental extracts featuring aged Cambodian oud, warm royal amber, and frankincense, embodying majestic warmth and sillage.',
    metaTitleAr: 'عطور شرقية ملكية وعود معتق | دار رَحِيقْ',
    metaDescAr: 'تسوق أفخم العطور الشرقية المعتقة ودهن العود من دار رحيق. زيوت نقية بتركيز إكستري فاخر وثبات استثنائي، مع خدمة المعاينة قبل الدفع عند الباب.',
    olfactoryNotesHint: ['دهن عود معتق', 'عنبر ملكي', 'لبان حوجري', 'زعفران أصيل'],
  },
  {
    slug: 'fresh-citrus',
    family: 'Fresh Citrus',
    titleAr: 'العطور الحمضية والبحرية المنعشة',
    titleEn: 'Fresh Citrus & Aquatic Fragrances',
    badgeAr: 'انتعاش كالابريا ونسيم البحر',
    descriptionAr: 'إشراقة يومية تجمع بين برغموت كالابريا الإيطالي، والليمون الصقلي، ونفحات البحر المنعشة مع قاعدة خشبية نظيفة تمنحك طاقة وحيوية طوال اليوم.',
    descriptionEn: 'Vibrant daytime fragrances blending sun-drenched Calabrian bergamot, Sicilian citrus, and marine accords over clean woody bases.',
    metaTitleAr: 'عطور حمضية وبحرية منعشة | برغموت كالابريا | دار رَحِيقْ',
    metaDescAr: 'تشكيلة العطور الحمضية المنعشة وعطور الصيف والعمل من دار رحيق. ثبات عالي مع برغموت وليمون ناصع وانتعاش بحري، شحن ومعاينة بجميع محافظات مصر.',
    olfactoryNotesHint: ['برغموت كالابريا', 'يوسفي إيطالي', 'نسيم بحري', 'زهر البرتقال'],
  },
  {
    slug: 'floral',
    family: 'Floral',
    titleAr: 'العطور الزهرية الأنيقة',
    titleEn: 'Graceful Floral Compositions',
    badgeAr: 'ورد دمشقي وياسمين مغربي',
    descriptionAr: 'باقة مخملية ساحرة من الورد الدمشقي والطائفي قطفة أولى، والياسمين البلدي، ومسك الروم. أنوثة راقية وعطور للجنسين تنبض بالرقة والجمال الطبيعي الخالص.',
    descriptionEn: 'Velvety floral bouquets crafted from first-harvest Damascena roses, Sambac jasmine, and tuberose wrapped in white musk.',
    metaTitleAr: 'عطور زهرية راقية | ورد دمشقي وياسمين | دار رَحِيقْ',
    metaDescAr: 'أرقى العطور الزهرية والمخملية من دار رحيق. ورد دمشقي أصيل، فل وياسمين، ومسك أبيض نقي. ثبات يدوم لأكثر من 14 ساعة.',
    olfactoryNotesHint: ['ورد دمشقي', 'ياسمين بلدي', 'مسك أبيض', 'سوسن توسكاني'],
  },
  {
    slug: 'leather-spice',
    family: 'Leather & Spice',
    titleAr: 'عطور الجلود والتوابل الدافئة',
    titleEn: 'Leather & Warm Spice Fragrances',
    badgeAr: 'شامواه إيطالي وقرفة سيلانية',
    descriptionAr: 'توليفات جريئة للشخصيات الواثقة تمزج بين دفء الجلود الإيطالية المدبوغة وتوابل الهيل والزعفران والقرفة. حضور قوي ومهيب يفرض نفسه في السهرات والأجواء الباردة.',
    descriptionEn: 'Bold signature scents combining artisanal Tuscan leather, Ceylon cinnamon, saffron, and cardamom for captivating magnetic presence.',
    metaTitleAr: 'عطور الجلود والتوابل الدافئة | دار رَحِيقْ',
    metaDescAr: 'عطور الجلود الإيطالية والتوابل الحارة من دار رحيق. حضور رجالي ونيش قوي بتركيز Extrait de Parfum يدوم طويلاً، مع الدفع بعد المعاينة.',
    olfactoryNotesHint: ['جلد إيطالي', 'هيل غواتيمالي', 'زعفران', 'قرفة سيلانية'],
  },
  {
    slug: 'gourmand',
    family: 'Gourmand',
    titleAr: 'عطور الفانيليا والجورماند المخملي',
    titleEn: 'Sensual Gourmand & Vanilla Fragrances',
    badgeAr: 'فانيليا بوربون وتونكا معتقة',
    descriptionAr: 'رحلة حسية دافئة تلتقي فيها فانيليا مدغشقر البوربون بحبوب التونكا المحمصة والكراميل والكاكاو الغني. عطور دافئة ومغرية تلف الحواس براحة ورقي لا يقاوم.',
    descriptionEn: 'Decadent sensory journeys blending Madagascar bourbon vanilla, roasted tonka bean, and salted praline for an irresistible warm embrace.',
    metaTitleAr: 'عطور جورماند وفانيليا بوربون فاخرة | دار رَحِيقْ',
    metaDescAr: 'أفخم عطور الفانيليا والتونكا والجورماند الدافئ من دار رحيق. تركيز غني وملمس مخملي يدوم طوال اليوم، مع فحص الشحنة عند الاستلام قبل الدفع.',
    olfactoryNotesHint: ['فانيليا بوربون', 'حبوب التونكا', 'كاكاو خام', 'عسل سدر'],
  },
  {
    slug: 'aromatic',
    family: 'Aromatic',
    titleAr: 'عطور الأروماتيك والفوجير الكلاسيكي',
    titleEn: 'Classic Aromatic & Fougère Fragrances',
    badgeAr: 'خزامى فرنسية وميرمية بيضاء',
    descriptionAr: 'توازن احترافي بين انتعاش الأعشاب العطرية، والخزامى الفرنسية، والكومارين، وعمق الأخشاب. العطر المثالي للرجل العصري الذي يجمع بين الانتعاش والوقار.',
    descriptionEn: 'The pinnacle of classic masculine elegance: French lavender, aromatic sage, crisp coumarin, and rich earthy oakmoss.',
    metaTitleAr: 'عطور أروماتيك وفوجير كلاسيكي للرجال | دار رَحِيقْ',
    metaDescAr: 'عطور أروماتيك منعشة وفوجير كلاسيكي بتركيز إكستري دو بارفان فاخر (Extrait de Parfum) من دار رحيق. ثبات عالي يرافقك طوال ساعات العمل واليوم، شحن ومعاينة بالباب.',
    olfactoryNotesHint: ['خزامى بروفانس', 'مريمية بيضاء', 'كومارين بلوري', 'إكليل الجبل'],
  },
];
