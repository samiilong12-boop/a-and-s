// Arabic translation dictionaries and helpers for Perfumes, Notes, Families, and Concentrations

export const FRAGRANCE_FAMILY_ARABIC: Record<string, string> = {
  'Woody': 'خشبي فاخر',
  'Aromatic': 'أروماتيك منعش',
  'Fresh Citrus': 'حمضيات منعشة',
  'Citrus': 'حمضيات منعشة',
  'Oriental': 'شرقي ملكي',
  'Floral': 'زهري راقي',
  'Leather': 'جلدي نيش',
  'Chypre': 'تشيبر كلاسيكي',
  'Gourmand': 'جورماند شهي',
  'Spicy': 'توابل شرقية',
  'Aquatic': 'مائي منعش',
  'Amber': 'عنبري دافئ',
  'All': 'جميع العطور',
};

export const CONCENTRATION_ARABIC: Record<string, string> = {
  'EXTRAIT_DE_PARFUM': 'إكستري دي بارفام (تركيز 25–35%)',
  'EAU_DE_PARFUM': 'أو دو بارفام (Eau de Parfum)',
  'EAU_DE_TOILETTE': 'أو دو تواليت (Eau de Toilette)',
  'PARFUM': 'بارفام نقي (Pure Parfum)',
};

export const GENDER_ARABIC: Record<string, string> = {
  'MEN': 'رجالي ملكي',
  'WOMEN': 'نسائي فاخر',
  'UNISEX': 'للجنسين (نيش فاخر)',
};

// Rich French/Oriental Olfactory Notes mapping
export const OLFACTORY_NOTES_ARABIC: Record<string, string> = {
  // Spices & Warm notes
  'Cinnamon': 'قرفة سيلانية',
  'Nutmeg': 'جوزة الطيب',
  'Cardamom': 'هيل أخضر',
  'Pink Pepper': 'فلفل وردي',
  'Black Pepper': 'فلفل أسود',
  'Saffron': 'زعفران أصيل',
  'Clove': 'قرنفل دافئ',
  'Ginger': 'زنجبيل منعش',
  'Coriander': 'كزبرة عطرية',
  'Anise': 'يانسون نجمي',

  // Citrus & Fresh notes
  'Grapefruit': 'جريب فروت',
  'Bergamot': 'برغموت كالابريا',
  'Lemon': 'ليمون صقلي',
  'Lime': 'ليمون حامض',
  'Mandarin': 'يوسفي منعش',
  'Green Mandarin': 'يوسفي أخضر',
  'Orange': 'برتقال حلو',
  'Blood Orange': 'برتقال أحمر',
  'Neroli': 'نيرولي تونسي',
  'Petitgrain': 'بيتي غران',

  // Herbs & Aromatic
  'Lavender': 'خزامى فرنسية (لافندر)',
  'Mint': 'نعناع نقي',
  'Rosemary': 'إكليل الجبل',
  'Sage': 'مرمية',
  'Clary Sage': 'مريمية بيضاء',
  'Thyme': 'زعتر بري',
  'Basil': 'ريحان إيطالي',
  'Artemisia': 'شيح أروماتيك',
  'Eucalyptus': 'أوكالبتوس',

  // Flowers & Florals
  'Rose': 'ورد دمشقي نقي',
  'Turkish Rose': 'ورد تركي فاخر',
  'Bulgarian Rose': 'ورد بلغاري',
  'Damascena Rose': 'وردة دمشقية',
  'Jasmine': 'ياسمين بلدي',
  'Moroccan Jasmine': 'ياسمين مغربي ناصع',
  'Sambac Jasmine': 'فل وياسمين سامباك',
  'Orange Blossom': 'زهر البرتقال الملكي',
  'Iris': 'سوسن توسكاني ناعم',
  'Orris': 'جذور السوسن المخملية',
  'Violet': 'بنفسج بري',
  'Geranium': 'عطرشير (جيرانيوم)',
  'Ylang-Ylang': 'يلانج يلانج مدغشقر',
  'Tuberose': 'مسك الروم (توبيروز)',
  'Peony': 'بيوني زهري',
  'Magnolia': 'ماغنوليا بيضاء',
  'Lily of the Valley': 'زنبق الوادي',
  'Lotus': 'لوتس مصري',

  // Fruits
  'Apple': 'تفاح مقرمش',
  'Pineapple': 'أناناس ملكي',
  'Blackcurrant': 'كشمش أسود',
  'Peach': 'خوخ مخملي',
  'Plum': 'برقوق معتق',
  'Fig': 'تين دافئ',
  'Coconut': 'جوز هند استوائي',
  'Cherry': 'كرز أسود فاخر',
  'Raspberry': 'توت بري',
  'Red Berries': 'توت أحمر غابي',
  'Pomegranate': 'رمان شامي',

  // Woods & Resins
  'Oud': 'دهن عود كمبودي معتق',
  'Agarwood': 'خشب العود الفاخر',
  'Sandalwood': 'خشب الصندل الميسوري',
  'Cedarwood': 'خشب الأرز الأطلسي',
  'Cedar': 'خشب الأرز',
  'Birch': 'أخشاب البتولا المدخنة',
  'Guaiac Wood': 'خشب الغاياك المدخن',
  'Cashmere Wood': 'خشب الكشمير فائق النعومة',
  'Vetiver': 'نجيل الهند الهايتي (فيتيفر)',
  'Haitian Vetiver': 'فيتيفر هايتي أصيل',
  'Patchouli': 'باتشولي إندونيسي غني',
  'Oakmoss': 'طحلب البلوط النقي',
  'Amberwood': 'أخشاب عنبرية',
  'Cypriol': 'سيبريول (عشب الناغرموثا)',

  // Resins & Balsams
  'Amber': 'عنبر ملكي دافئ',
  'Ambergris': 'عنبر الحوت الرمادي النادر',
  'Incense': 'بخور ملكي فاخر',
  'Frankincense': 'لبان حوجري عماني',
  'Myrrh': 'مر عربي أصيل',
  'Benzoin': 'جاوي سيامي',
  'Labdanum': 'لابدانوم أندلسي',
  'Elemi': 'صمغ الإليمي',

  // Sweet & Gourmand & Leather
  'Vanilla': 'فانيليا مدغشقر البوربون',
  'Tonka Bean': 'حبوب التونكا الفاخرة',
  'Coumarin': 'كومارين بلوري',
  'Caramel': 'كراميل مملح',
  'Honey': 'عسل سدر نقي',
  'Cacao': 'كاكاو خام محمص',
  'Coffee': 'بن عربي محمص',
  'Almond': 'لوز حلو',
  'Praline': 'برالين شوكولاتة',
  'Leather': 'جلد إيطالي مدبوغ',
  'Suede': 'شامواه مخملي',
  'Musk': 'مسك أبيض ملكي',
  'White Musk': 'مسك أبيض حريري',
  'Tobacco': 'أوراق التبغ الكوبية',
  'Tobacco Leaf': 'تبغ بلدي مدخن ومتبل',
  'Licorice': 'عرق سوس ملكي',
  'Marine Notes': 'نسيم بحري منعش',
  'Sea Salt': 'بلورات ملح البحر',
};

/**
 * Returns translated Arabic perfume name when in RTL/Arabic mode
 */
export function getLocalizedProductName(
  product: { nameEn: string; nameAr?: string | null },
  isRtl: boolean
): string {
  if (isRtl && product.nameAr && product.nameAr.trim().length > 0) {
    return product.nameAr.trim();
  }
  return product.nameEn;
}

/**
 * Returns translated Arabic perfume description when in RTL/Arabic mode
 */
export function getLocalizedProductDescription(
  product: { descriptionEn: string; descriptionAr?: string | null },
  isRtl: boolean
): string {
  if (isRtl && product.descriptionAr && product.descriptionAr.trim().length > 0) {
    return product.descriptionAr.trim();
  }
  return product.descriptionEn;
}

/**
 * Returns localized Fragrance Family
 */
export function getLocalizedFragranceFamily(family: string, isRtl: boolean): string {
  if (!isRtl) return family;
  return FRAGRANCE_FAMILY_ARABIC[family] || family;
}

/**
 * Returns localized Concentration
 */
export function getLocalizedConcentration(concentration: string, isRtl: boolean): string {
  if (!isRtl) return concentration.replace(/_/g, ' ');
  return CONCENTRATION_ARABIC[concentration] || concentration.replace(/_/g, ' ');
}

/**
 * Returns localized Gender
 */
export function getLocalizedGender(gender: string, isRtl: boolean): string {
  if (!isRtl) return gender;
  return GENDER_ARABIC[gender] || gender;
}

/**
 * Translates a single olfactory note or returns the note itself
 */
export function getLocalizedOlfactoryNote(note: string, isRtl: boolean): string {
  if (!isRtl) return note;
  const clean = note.trim();
  if (OLFACTORY_NOTES_ARABIC[clean]) {
    return OLFACTORY_NOTES_ARABIC[clean];
  }

  // Substring matching for compound notes (e.g., 'Fresh Mint' -> 'نعناع منعش')
  for (const [enKey, arVal] of Object.entries(OLFACTORY_NOTES_ARABIC)) {
    if (clean.toLowerCase() === enKey.toLowerCase()) {
      return arVal;
    }
  }

  return clean;
}

/**
 * Translates an array of notes
 */
export function getLocalizedNotesList(notes: string[] | undefined, isRtl: boolean): string[] {
  if (!notes || !Array.isArray(notes)) return [];
  return notes.map((note) => getLocalizedOlfactoryNote(note, isRtl));
}
