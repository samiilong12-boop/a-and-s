import fs from 'fs';
import path from 'path';
import os from 'os';
import { Product } from '@/types';
import { FAMOUS_50_PERFUMES } from '@/lib/data/products';

declare global {
  var __PRODUCTS_CATALOG__: Product[] | undefined;
}

const tmpFilePath = path.join(os.tmpdir(), 'raheeq-products.json');
const publicFilePath = path.join(process.cwd(), 'public', 'data', 'products.json');

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
    metaDescAr: 'اكتشف تشكيلة العطور الخشبية من دار رحيق. تركيز 30% إكستري دو بارفان يدوم طويلاً، بمكونات الصندل والأرز والفيتيفر مع فحص الطرد عند الاستلام.',
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
    metaDescAr: 'تسوق أفخم العطور الشرقية المعتقة ودهن العود من دار رحيق. زيوت نقية بتركيز 30% وثبات استثنائي، مع خدمة المعاينة قبل الدفع عند الباب.',
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
    metaDescAr: 'أرقى العطور الزهرية والمخملية من دار رحيق. ورد دمشقي أصيل، فل وياسمين، ومسك أبيض نقي. تركيز 30% وثبات يدوم لأكثر من 14 ساعة.',
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
    metaDescAr: 'عطور الجلود الإيطالية والتوابل الحارة من دار رحيق. حضور رجالي ونيش قوي بتركيز 30% Extrait de Parfum يدوم طويلاً، مع الدفع بعد المعاينة.',
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
    metaDescAr: 'عطور أروماتيك منعشة وفوجير كلاسيكي بتركيز إكستري دو بارفان 30% من دار رحيق. ثبات عالي يرافقك طوال ساعات العمل واليوم، شحن ومعاينة بالباب.',
    olfactoryNotesHint: ['خزامى بروفانس', 'مريمية بيضاء', 'كومارين بلوري', 'إكليل الجبل'],
  },
];

/**
 * Normalizes an inspired product to guarantee legal compliance,
 * brand honesty, and unified 30% concentration.
 */
function normalizeCompliantProduct(p: any): Product {
  const brand = 'RAHEEQ';
  const originalBrand = (p.brand && p.brand !== 'RAHEEQ' && !p.brand.includes('رحيق')) ? p.brand : null;
  const originalName = p.nameEn || '';

  // Determine inspiration reference
  let inspiredBy = p.inspiredBy || '';
  if (!inspiredBy && originalBrand) {
    inspiredBy = `${originalBrand} ${originalName}`.trim();
  }

  // Ensure clear, non-misleading Arabic name
  let nameAr = p.nameAr || originalName;
  if (inspiredBy && !nameAr.includes('مستوحى') && !nameAr.includes('طابع')) {
    nameAr = `رحيق ${nameAr.replace(/^عطر\s+/, '')} (مستوحى من طابع ${inspiredBy})`;
  }

  let nameEn = p.nameEn || '';
  if (inspiredBy && !nameEn.includes('Inspired') && !nameEn.startsWith('Raheeq')) {
    nameEn = `Raheeq ${nameEn} (Inspired by ${inspiredBy})`;
  }

  const inspirationNoteAr =
    p.inspirationNoteAr ||
    (inspiredBy
      ? `توليفة عطرية خاصة ومستقلة تصنعها دار رَحِيقْ (RAHEEQ) بتركيز 30% Extrait de Parfum، مستوحاة من الهرم العطري لـ ${inspiredBy}. هذا العطر منتج مستقل تماماً ولا يمثل العلامة التجارية الأصلية أو يدعي أي تبعية لها.`
      : 'توليفة عطرية ملكية خاصة مصنوعة في معامل دار رَحِيقْ بالقاهرة بزيوت فرنسية نقية بتركيز 30% Extrait de Parfum.');

  const inspirationNoteEn =
    p.inspirationNoteEn ||
    (inspiredBy
      ? `An independent artisanal creation by RAHEEQ Haute Parfumerie, formulated at 30% Extrait de Parfum inspired by the olfactory profile of ${inspiredBy}. Not affiliated with or endorsed by the original brand trademark holders.`
      : 'Artisanal high-concentration Extrait de Parfum crafted with pure natural absolutes by RAHEEQ Haute Parfumerie.');

  // Normalize variants with honest pricing (no fake strikethrough multipliers)
  const variants = Array.isArray(p.variants) && p.variants.length > 0
    ? p.variants.map((v: any) => {
        const regEgp = Number(v.regularPriceEgp || (v.regularPriceInPiasters ? v.regularPriceInPiasters / 100 : 1850));
        const regPiasters = Number(v.regularPriceInPiasters || (regEgp * 100));
        return {
          ...v,
          regularPriceEgp: regEgp,
          regularPriceInPiasters: regPiasters,
          salePriceEgp: v.salePriceEgp ?? null,
          salePriceInPiasters: v.salePriceInPiasters ?? null,
        };
      })
    : [
        {
          id: `${p.id}-var-50`,
          sku: `RHQ-${(p.slug || p.id).toUpperCase().slice(0, 8)}-50`,
          volumeMl: 50,
          regularPriceEgp: 1850,
          regularPriceInPiasters: 185000,
          stockQuantity: 40,
          lowStockThreshold: 5,
        },
        {
          id: `${p.id}-var-100`,
          sku: `RHQ-${(p.slug || p.id).toUpperCase().slice(0, 8)}-100`,
          volumeMl: 100,
          regularPriceEgp: 2750,
          regularPriceInPiasters: 275000,
          stockQuantity: 50,
          lowStockThreshold: 5,
        },
      ];

  return {
    ...p,
    brand,
    inspiredBy,
    inspirationNoteAr,
    inspirationNoteEn,
    nameAr,
    nameEn,
    concentration: 'EXTRAIT_DE_PARFUM',
    variants,
  };
}

/**
 * Loads the authoritative products catalog on server with caching
 */
export function loadCatalogProducts(): Product[] {
  // 1. Memory cache
  if (globalThis.__PRODUCTS_CATALOG__ && Array.isArray(globalThis.__PRODUCTS_CATALOG__) && globalThis.__PRODUCTS_CATALOG__.length > 0) {
    return globalThis.__PRODUCTS_CATALOG__;
  }

  let list: any[] = [];

  // 2. /tmp
  try {
    if (fs.existsSync(tmpFilePath)) {
      const data = fs.readFileSync(tmpFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch {}

  // 3. public/data/products.json
  if (list.length === 0) {
    try {
      if (fs.existsSync(publicFilePath)) {
        const data = fs.readFileSync(publicFilePath, 'utf-8');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
    } catch {}
  }

  // 4. Fallback to FAMOUS_50_PERFUMES
  if (list.length === 0) {
    list = FAMOUS_50_PERFUMES;
  }

  const normalized = list.map(normalizeCompliantProduct);
  globalThis.__PRODUCTS_CATALOG__ = normalized;
  return normalized;
}

/**
 * Finds a single product by slug, id, or normalized name
 */
export function getProductBySlug(slugInput: string): Product | null {
  if (!slugInput) return null;
  const decoded = decodeURIComponent(slugInput).toLowerCase().trim();
  const raw = slugInput.toLowerCase().trim();

  const products = loadCatalogProducts();
  const found = products.find((p) => {
    const s = (p.slug || '').toLowerCase();
    const id = (p.id || '').toLowerCase();
    const en = (p.nameEn || '').toLowerCase();
    const ar = (p.nameAr || '').toLowerCase();
    return s === decoded || id === decoded || s === raw || id === raw || en === decoded || ar === decoded;
  });

  return found || null;
}

/**
 * Returns all products for a specific category slug
 */
export function getProductsByCategory(categorySlug: string): { category: CategoryMeta; products: Product[] } | null {
  const meta = CATEGORY_REGISTRY.find((c) => c.slug.toLowerCase() === categorySlug.toLowerCase());
  if (!meta) return null;

  const all = loadCatalogProducts();
  const matched = all.filter((p) => {
    const fam = (p.fragranceFamily || '').toLowerCase();
    const target = meta.family.toLowerCase();
    if (fam === target) return true;
    if (target === 'woody' && fam.includes('wood')) return true;
    if (target === 'oriental' && (fam.includes('oriental') || fam.includes('oud') || fam.includes('amber'))) return true;
    if (target === 'fresh citrus' && (fam.includes('citrus') || fam.includes('fresh') || fam.includes('aquatic'))) return true;
    if (target === 'floral' && fam.includes('floral')) return true;
    if (target === 'leather & spice' && (fam.includes('leather') || fam.includes('spice'))) return true;
    if (target === 'gourmand' && fam.includes('gourmand')) return true;
    if (target === 'aromatic' && (fam.includes('aromatic') || fam.includes('chypre'))) return true;
    return false;
  });

  return { category: meta, products: matched };
}

/**
 * Returns all registered categories
 */
export function getAllCategories(): CategoryMeta[] {
  return CATEGORY_REGISTRY;
}

/**
 * Returns a category by its slug
 */
export function getCategoryBySlug(slug: string): CategoryMeta | null {
  return CATEGORY_REGISTRY.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) || null;
}

/**
 * Returns all product slugs for static generation
 */
export function getAllProductSlugs(): string[] {
  const products = loadCatalogProducts();
  return products.map((p) => p.slug || p.id).filter(Boolean);
}
