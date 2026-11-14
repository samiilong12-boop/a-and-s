import { Product } from '@/types';

export const FRAGRANCE_FAMILIES = [
  'Woody',
  'Oriental',
  'Fresh Citrus',
  'Floral',
  'Leather & Spice',
  'Gourmand',
  'Aromatic',
] as const;

export const CONCENTRATIONS = [
  'EXTRAIT_DE_PARFUM',
  'EAU_DE_PARFUM',
  'PARFUM',
] as const;

export type FragranceFamily = typeof FRAGRANCE_FAMILIES[number];
export type Concentration = typeof CONCENTRATIONS[number];

export interface ShippingZone {
  governorateEn: string;
  governorateAr: string;
  rateInPiasters: number;
  estimatedDeliveryDays: string;
}

export const SHIPPING_ZONES: ShippingZone[] = [
  { governorateEn: 'Cairo', governorateAr: 'القاهرة', rateInPiasters: 6500, estimatedDeliveryDays: '1-2 days' },
  { governorateEn: 'Giza', governorateAr: 'الجيزة و 6 أكتوبر والشيخ زايد', rateInPiasters: 6500, estimatedDeliveryDays: '1-2 days' },
];

// Helper to generate elegant bottle SVG for ready-made luxury perfumes
export function getDemoBottleSvg(name: string, accentColor: string = '#54d1b2') {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%"><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%23161F1D"/><stop offset="100%" stop-color="%23080A0A"/></linearGradient><linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23FFFFFF" stop-opacity="0.15"/><stop offset="50%" stop-color="%23FFFFFF" stop-opacity="0.03"/><stop offset="100%" stop-color="%23000000" stop-opacity="0.3"/></linearGradient><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23F3E7C4"/><stop offset="50%" stop-color="%23D4AF37"/><stop offset="100%" stop-color="%238C6207"/></linearGradient></defs><rect width="400" height="500" fill="url(%23bg)"/><ellipse cx="200" cy="460" rx="120" ry="20" fill="%23000000" opacity="0.6"/><rect x="165" y="60" width="70" height="55" rx="6" fill="%231A2624" stroke="url(%23gold)" stroke-width="2"/><circle cx="200" cy="87" r="10" fill="${encodeURIComponent(accentColor)}"/><rect x="180" y="115" width="40" height="20" fill="url(%23gold)"/><path d="M 120 135 L 280 135 C 295 135, 305 145, 305 160 L 305 420 C 305 435, 295 445, 280 445 L 120 445 C 105 445, 95 435, 95 420 L 95 160 C 95 145, 105 135, 120 135 Z" fill="url(%23glass)" stroke="url(%23gold)" stroke-width="2.5"/><rect x="110" y="150" width="180" height="275" rx="10" fill="${encodeURIComponent(accentColor)}" opacity="0.12"/><rect x="135" y="230" width="130" height="120" rx="4" fill="%23080A0A" stroke="url(%23gold)" stroke-width="1.5"/><text x="200" y="260" font-family="serif" font-size="10" font-weight="bold" fill="url(%23gold)" text-anchor="middle" letter-spacing="3">RAHEEQ</text><text x="200" y="285" font-family="sans-serif" font-size="12" font-weight="bold" fill="%23FAF9F5" text-anchor="middle">${encodeURIComponent(name.substring(0, 18))}</text><text x="200" y="305" font-family="sans-serif" font-size="8" fill="${encodeURIComponent(accentColor)}" text-anchor="middle" letter-spacing="1.5">EXTRAIT DE PARFUM</text><circle cx="200" cy="328" r="3" fill="url(%23gold)"/></svg>`;
}

// 50 Famous World-Class Ready-Made Fragrances (15 Men, 15 Women, 10 Unisex Niche, 10 Oriental/Oud)
// RAHEEQ OFFICIAL 10 MASTER PERFUMES (With Verified WebP Photography)
export const OFFICIAL_10_PERFUMES: Product[] = [
  {
    "id": "dior-sauvage-elixir",
    "slug": "dior-sauvage-elixir",
    "nameEn": "Sauvage Elixir",
    "nameAr": "سوفاج إكسير",
    "brand": "RAHEEQ",
    "inspiredBy": "Dior Sauvage Elixir",
    "inspirationNoteAr": "عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمّي لـ Dior Sauvage Elixir. إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.",
    "inspirationNoteEn": "Independent artisan formulation by RAHEEQ inspired by the olfactory accord of Dior Sauvage Elixir. Not affiliated with or endorsed by original brand holders.",
    "gender": "MEN",
    "fragranceFamily": "Aromatic",
    "concentration": "EXTRAIT_DE_PARFUM",
    "descriptionEn": "An extraordinarily concentrated fragrance steeped in the iconic freshness of Sauvage with an intoxicating heart of spices, a custom lavender essence, and a blend of rich woods.",
    "descriptionAr": "تركيز استثنائي عميق يجمع بين نضارة سوفاج الأيقونية مع قلب آسر من التوابل الدافئة والخزامى وخشب الصندل الغني.",
    "topNotes": [
      "Cinnamon",
      "Nutmeg",
      "Cardamom",
      "Grapefruit"
    ],
    "heartNotes": [
      "Lavender",
      "Coumarin"
    ],
    "baseNotes": [
      "Licorice",
      "Sandalwood",
      "Amber",
      "Patchouli",
      "Haitian Vetiver"
    ],
    "isBestseller": true,
    "isNewArrival": false,
    "variants": [
      {
        "id": "sauvage-50",
        "sku": "AS-DIOR-SAV-50",
        "volumeMl": 50,
        "regularPriceEgp": 450,
        "costPriceEgp": 750,
        "stockQuantity": 45,
        "lowStockThreshold": 5
      },
      {
        "id": "sauvage-100",
        "sku": "AS-DIOR-SAV-100",
        "volumeMl": 100,
        "regularPriceEgp": 846,
        "costPriceEgp": 1100,
        "stockQuantity": 60,
        "lowStockThreshold": 5
      }
    ],
    "imageUrl": "/images/products/dior-sauvage-elixir.webp",
    "images": [
      {
        "id": "img-sauvage-elixir-1",
        "url": "/images/products/dior-sauvage-elixir.webp",
        "altTextAr": "عطر ديور سوفاج إليكسير من دار رحيق",
        "altTextEn": "Dior Sauvage Elixir by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-10-31T16:49:53.450Z",
    "updatedAt": "2026-10-31T16:49:53.450Z"
  },
  {
    "id": "bleu-de-chanel-parfum",
    "slug": "bleu-de-chanel-parfum",
    "nameEn": "Bleu de Chanel Parfum",
    "nameAr": "بلو دي شانيل بارفام",
    "brand": "RAHEEQ",
    "inspiredBy": "Chanel Bleu de Chanel Parfum",
    "inspirationNoteAr": "عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمّي لـ Chanel Bleu de Chanel Parfum. إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.",
    "inspirationNoteEn": "Independent artisan formulation by RAHEEQ inspired by the olfactory accord of Chanel Bleu de Chanel Parfum. Not affiliated with or endorsed by original brand holders.",
    "gender": "MEN",
    "fragranceFamily": "Woody",
    "concentration": "PARFUM",
    "descriptionEn": "The most intense of the Bleu de Chanel fragrances. Powerful and refined, Bleu de Chanel Parfum reveals the essence of determination with rich New Caledonian sandalwood.",
    "descriptionAr": "الأكثر كثافة وعمقاً بين عطور بلو دي شانيل. يجمع بين الانتعاش الحمضي وقوة خشب الصندل النيودوني الفاخر مع لمسات بخورية راقية.",
    "topNotes": [
      "Lemon Zest",
      "Bergamot",
      "Mint",
      "Artemisia"
    ],
    "heartNotes": [
      "Lavender",
      "Geranium",
      "Pineapple",
      "Green Notes"
    ],
    "baseNotes": [
      "Sandalwood",
      "Cedarwood",
      "Amberwood",
      "Tonka Bean"
    ],
    "isBestseller": true,
    "isNewArrival": false,
    "variants": [
      {
        "id": "bdc-50",
        "sku": "AS-CHN-BDC-50",
        "volumeMl": 50,
        "regularPriceEgp": 450,
        "costPriceEgp": 800,
        "stockQuantity": 35,
        "lowStockThreshold": 5
      },
      {
        "id": "bdc-100",
        "sku": "AS-CHN-BDC-100",
        "volumeMl": 100,
        "regularPriceEgp": 799,
        "costPriceEgp": 1200,
        "stockQuantity": 50,
        "lowStockThreshold": 5
      }
    ],
    "imageUrl": "/images/products/bleu-de-chanel.webp",
    "images": [
      {
        "id": "img-bdc-1",
        "url": "/images/products/bleu-de-chanel.webp",
        "altTextAr": "عطر بلو دي شانيل من دار رحيق",
        "altTextEn": "Bleu de Chanel by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-10-31T16:49:53.450Z",
    "updatedAt": "2026-10-31T16:49:53.450Z"
  },
  {
    "id": "jpg-le-male-le-parfum",
    "slug": "jpg-le-male-le-parfum",
    "nameEn": "Le Male Le Parfum",
    "nameAr": "لو مال لو بارفان",
    "brand": "RAHEEQ",
    "inspiredBy": "Jean Paul Gaultier Le Male Le Parfum",
    "inspirationNoteAr": "عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمّي لـ Jean Paul Gaultier Le Male Le Parfum. إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.",
    "inspirationNoteEn": "Independent artisan formulation by RAHEEQ inspired by the olfactory accord of Jean Paul Gaultier Le Male Le Parfum. Not affiliated with or endorsed by original brand holders.",
    "gender": "MEN",
    "fragranceFamily": "Oriental",
    "concentration": "EAU_DE_PARFUM",
    "descriptionEn": "The officer takes the helm. Dressed in a black officer jacket with gold trim, radiating commanding cardamom, noble lavender, and vanilla.",
    "descriptionAr": "عطر القائد البحري الأنيق. يفرض حضوره بنفحات الهيل الحار والخزامى الفرنسية ولمسة الفانيليا الداكنة الفاخرة.",
    "topNotes": [
      "Cardamom",
      "Citrus",
      "Lavender"
    ],
    "heartNotes": [
      "Iris",
      "Rich Leather",
      "Oud"
    ],
    "baseNotes": [
      "Vanilla",
      "Oriental Woods",
      "Amber"
    ],
    "isBestseller": true,
    "isNewArrival": false,
    "variants": [
      {
        "id": "jpg-50",
        "sku": "AS-JPG-LMP-50",
        "volumeMl": 50,
        "regularPriceEgp": 450,
        "costPriceEgp": 720,
        "stockQuantity": 30,
        "lowStockThreshold": 4
      },
      {
        "id": "jpg-100",
        "sku": "AS-JPG-LMP-100",
        "volumeMl": 100,
        "regularPriceEgp": 800,
        "costPriceEgp": 1100,
        "stockQuantity": 45,
        "lowStockThreshold": 4
      }
    ],
    "imageUrl": "/images/products/le-male-le-parfum.webp",
    "images": [
      {
        "id": "img-jpg-lmp-1",
        "url": "/images/products/le-male-le-parfum.webp",
        "altTextAr": "عطر لو مال لو بارفان من دار رحيق",
        "altTextEn": "Le Male Le Parfum by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-10-31T16:49:53.450Z",
    "updatedAt": "2026-10-31T16:49:53.450Z"
  },
  {
    "id": "tom-ford-ombre-leather",
    "slug": "tom-ford-ombre-leather",
    "nameEn": "Amber Leather",
    "nameAr": "أمبري ليذر",
    "brand": "RAHEEQ",
    "inspiredBy": "Tom Ford Ombré Leather",
    "inspirationNoteAr": "عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمّي لـ Tom Ford Ombré Leather. إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.",
    "inspirationNoteEn": "Independent artisan formulation by RAHEEQ inspired by the olfactory accord of Tom Ford Ombré Leather. Not affiliated with or endorsed by original brand holders.",
    "gender": "UNISEX",
    "fragranceFamily": "Leather & Spice",
    "concentration": "EAU_DE_PARFUM",
    "descriptionEn": "Vast, unconstrained, and driven. Floral leather and cool spices reveal an untethered scent for the independent spirit.",
    "descriptionAr": "عطر الجلد الفاخر الأكثر نقاءً في العالم من دار رحيق. يجسد الفخامة برائحة الجلد المدبوغ مع الهيل والياسمين والتفاح والعنبر.",
    "topNotes": [
      "Bergamot",
      "Cardamom",
      "Apple"
    ],
    "heartNotes": [
      "Black Leather",
      "Jasmine Sambac",
      "Cedarwood"
    ],
    "baseNotes": [
      "Amber",
      "Vanilla",
      "Musk"
    ],
    "isBestseller": true,
    "isNewArrival": false,
    "variants": [
      {
        "id": "ol-50",
        "sku": "AS-TF-OML-50",
        "volumeMl": 50,
        "regularPriceEgp": 400,
        "regularPriceInPiasters": 40000,
        "costPriceEgp": 900,
        "stockQuantity": 30,
        "lowStockThreshold": 4
      },
      {
        "id": "ol-100",
        "sku": "AS-TF-OML-100",
        "volumeMl": 100,
        "regularPriceEgp": 800,
        "regularPriceInPiasters": 80000,
        "costPriceEgp": 1350,
        "stockQuantity": 40,
        "lowStockThreshold": 4
      }
    ],
    "imageUrl": "/images/products/amber-leather.webp",
    "images": [
      {
        "id": "img-amber-leather-1",
        "url": "/images/products/amber-leather.webp",
        "altTextAr": "عطر أمبري ليذر من دار رحيق",
        "altTextEn": "Amber Leather by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-10-31T16:49:53.451Z",
    "updatedAt": "2026-10-31T16:49:53.451Z"
  },
  {
    "id": "savage-edp",
    "slug": "savage-edp",
    "nameEn": "Savage",
    "nameAr": "سوفاج",
    "brand": "RAHEEQ",
    "inspiredBy": "Dior Sauvage",
    "inspirationNoteAr": "عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمّي لـ Dior Sauvage. إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.",
    "inspirationNoteEn": "Independent artisan formulation by RAHEEQ inspired by the olfactory accord of Dior Sauvage. Not affiliated with or endorsed by original brand holders.",
    "gender": "MEN",
    "fragranceFamily": "Aromatic Citrus",
    "concentration": "EAU_DE_PARFUM",
    "descriptionEn": "An iconic aromatic fragrance by RAHEEQ inspired by Sauvage. Opening with sparkling bergamot and lemon, leading into a spicy heart of lavender and black pepper over deep woods and amber.",
    "descriptionAr": "عطر الانتعاش والجاذبية الأيقوني من دار رحيق مستوحى من طابع سوفاج. يفتتح بنفحات البرغموت والليمون المنعشة مع قلب حار من اللافندر والفلفل الأسود وقاعدة عنبرية خشبية ثابتة.",
    "topNotes": [
      "Bergamot",
      "Lemon"
    ],
    "heartNotes": [
      "Lavender",
      "Black Pepper"
    ],
    "baseNotes": [
      "Aromatic Woods",
      "Amber",
      "Musk"
    ],
    "isBestseller": true,
    "isNewArrival": false,
    "variants": [
      {
        "id": "savage-edp-50",
        "sku": "AS-RAH-SAV-50",
        "volumeMl": 50,
        "regularPriceEgp": 450,
        "costPriceEgp": 720,
        "stockQuantity": 45,
        "lowStockThreshold": 5
      },
      {
        "id": "savage-edp-100",
        "sku": "AS-RAH-SAV-100",
        "volumeMl": 100,
        "regularPriceEgp": 820,
        "costPriceEgp": 1100,
        "stockQuantity": 60,
        "lowStockThreshold": 5
      }
    ],
    "imageUrl": "/images/products/savage-edp.webp",
    "images": [
      {
        "id": "img-savage-edp-1",
        "url": "/images/products/savage-edp.webp",
        "altTextAr": "عطر سوفاج من دار رحيق",
        "altTextEn": "Savage by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-10-31T16:49:53.450Z",
    "updatedAt": "2026-10-31T16:49:53.450Z"
  },
  {
    "id": "azzaro-most-wanted",
    "slug": "azzaro-most-wanted",
    "nameEn": "The Most Wanted",
    "nameAr": "أزارو ذا موست وانتند",
    "brand": "RAHEEQ",
    "inspiredBy": "Azzaro The Most Wanted",
    "inspirationNoteAr": "عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمّي لـ Azzaro The Most Wanted. إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.",
    "inspirationNoteEn": "Independent artisan formulation by RAHEEQ inspired by the olfactory accord of Azzaro The Most Wanted. Not affiliated with or endorsed by original brand holders.",
    "gender": "MEN",
    "fragranceFamily": "Woody Oriental",
    "concentration": "EAU_DE_PARFUM",
    "descriptionEn": "The essence of daring charisma by RAHEEQ inspired by Azzaro The Most Wanted. Fiery cardamom and citrus meet a magnetic heart of toffee and leather on warm woods.",
    "descriptionAr": "عطر التحدي والجاذبية القصوى من دار رحيق بطابع أزارو ذا موست وانتند. يجمع بين التوابل الحارة كالهيل والفلفل الأسود مع لمسة خشب الأرز والجلد الفاخر.",
    "topNotes": [
      "Bergamot",
      "Lemon",
      "Black Pepper",
      "Cardamom"
    ],
    "heartNotes": [
      "Hot Spices",
      "Toffee",
      "Rich Leather"
    ],
    "baseNotes": [
      "Cedarwood",
      "Sandalwood",
      "Amber"
    ],
    "isBestseller": true,
    "isNewArrival": true,
    "variants": [
      {
        "id": "azzaro-50",
        "sku": "AS-AZZ-MW-50",
        "volumeMl": 50,
        "regularPriceEgp": 400,
        "costPriceEgp": 720,
        "stockQuantity": 35,
        "lowStockThreshold": 4
      },
      {
        "id": "azzaro-100",
        "sku": "AS-AZZ-MW-100",
        "volumeMl": 100,
        "regularPriceEgp": 820,
        "costPriceEgp": 1100,
        "stockQuantity": 50,
        "lowStockThreshold": 4
      }
    ],
    "imageUrl": "/images/products/azzaro-most-wanted.webp",
    "images": [
      {
        "id": "img-azzaro-1",
        "url": "/images/products/azzaro-most-wanted.webp",
        "altTextAr": "عطر أزارو ذا موست وانتند من دار رحيق",
        "altTextEn": "The Most Wanted by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-10-31T16:49:53.450Z",
    "updatedAt": "2026-10-31T16:49:53.450Z"
  },
  {
    "id": "khmrah-lattafa",
    "slug": "khmrah-lattafa",
    "nameEn": "Khmrah",
    "nameAr": "خمرة",
    "brand": "RAHEEQ",
    "inspiredBy": "Khmrah / Angels Share",
    "inspirationNoteAr": "عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمّي لـ Khmrah. إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.",
    "inspirationNoteEn": "Independent artisan formulation by RAHEEQ inspired by the olfactory accord of Khmrah. Not affiliated with or endorsed by original brand holders.",
    "gender": "UNISEX",
    "fragranceFamily": "Oriental Gourmand",
    "concentration": "EAU_DE_PARFUM",
    "descriptionEn": "A sumptuous warm oriental gourmand by RAHEEQ. Crisp apple and spicy cinnamon melt into an opulent heart of praline, rose, and jasmine over rich vanilla and sandalwood.",
    "descriptionAr": "عطر شرقي دافئ وغني من إبداع دار رحيق. يجمع بين حلاوة التفاح والقرفة الفاخرة مع لمسات الورد والبرالين والياسمين وخشب الصندل والعنبر الدافئ.",
    "topNotes": [
      "Bergamot",
      "Cinnamon",
      "Crisp Apple"
    ],
    "heartNotes": [
      "Rose",
      "Jasmine",
      "Praline Sweetness"
    ],
    "baseNotes": [
      "Vanilla",
      "Musk",
      "Amber",
      "Sandalwood"
    ],
    "isBestseller": true,
    "isNewArrival": true,
    "variants": [
      {
        "id": "khmrah-50",
        "sku": "AS-RAH-KHM-50",
        "volumeMl": 50,
        "regularPriceEgp": 450,
        "costPriceEgp": 720,
        "stockQuantity": 40,
        "lowStockThreshold": 5
      },
      {
        "id": "khmrah-100",
        "sku": "AS-RAH-KHM-100",
        "volumeMl": 100,
        "regularPriceEgp": 800,
        "costPriceEgp": 1100,
        "stockQuantity": 55,
        "lowStockThreshold": 5
      }
    ],
    "imageUrl": "/images/products/khmrah.webp",
    "images": [
      {
        "id": "img-khmrah-1",
        "url": "/images/products/khmrah.webp",
        "altTextAr": "عطر خمرة من دار رحيق",
        "altTextEn": "Khmrah by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-10-31T16:49:53.450Z",
    "updatedAt": "2026-10-31T16:49:53.450Z"
  },
  {
    "id": "misk-al-rumman",
    "slug": "misk-al-rumman",
    "nameEn": "Misk Al-Rumman",
    "nameAr": "مسك الرمان",
    "brand": "RAHEEQ",
    "inspiredBy": "مسك الرمان الفاخر (Signature Pomegranate Musk)",
    "inspirationNoteAr": "توليفة حصرية ملكية خاصة بدار رحيق للعطور تجمع بين نقاء المسك الأبيض وعصارة الرمان الطبيعي المنعش.",
    "inspirationNoteEn": "An exclusive signature formulation by RAHEEQ Haute Parfumerie, blending pure white musk with natural tart pomegranate and velvet florals.",
    "gender": "UNISEX",
    "fragranceFamily": "Fruity Floral Musk",
    "concentration": "EAU_DE_PARFUM",
    "descriptionEn": "An exclusive signature creation by RAHEEQ Haute Parfumerie. Lush crimson pomegranate and bergamot blend harmoniously with white musk, velvet rose, and airy woods.",
    "descriptionAr": "تحفة عطرية حصرية من دار رحيق. يمتزج فيها انتعاش حبيبات الرمان الأحمر مع فخامة المسك الأبيض ونعومة أزهار الياسمين والورد في تجربة نظافة وانتعاش لا تضاهى.",
    "topNotes": [
      "Pomegranate",
      "Bergamot"
    ],
    "heartNotes": [
      "Jasmine",
      "Rose"
    ],
    "baseNotes": [
      "White Musk",
      "Precious Woods"
    ],
    "isBestseller": true,
    "isNewArrival": true,
    "variants": [
      {
        "id": "rumman-50",
        "sku": "AS-RAH-RUM-50",
        "volumeMl": 50,
        "regularPriceEgp": 400,
        "costPriceEgp": 700,
        "stockQuantity": 50,
        "lowStockThreshold": 5
      },
      {
        "id": "rumman-100",
        "sku": "AS-RAH-RUM-100",
        "volumeMl": 100,
        "regularPriceEgp": 820,
        "costPriceEgp": 1050,
        "stockQuantity": 65,
        "lowStockThreshold": 5
      }
    ],
    "imageUrl": "/images/products/misk-al-rumman.webp",
    "images": [
      {
        "id": "img-misk-rumman-1",
        "url": "/images/products/misk-al-rumman.webp",
        "altTextAr": "عطر مسك الرمان من دار رحيق",
        "altTextEn": "Misk Al-Rumman by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-10-31T16:49:53.448Z",
    "updatedAt": "2026-10-31T16:49:53.450Z"
  },
  {
    "id": "shroty-cerruti",
    "slug": "shroty-cerruti",
    "nameEn": "Shroty",
    "nameAr": "شروتي",
    "brand": "RAHEEQ",
    "inspiredBy": "شروتي (Cerruti 1881)",
    "inspirationNoteAr": "عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمّي الكلاسيكي لـ Cerruti Shroty. إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.",
    "inspirationNoteEn": "Independent artisan formulation by RAHEEQ inspired by the olfactory accord of Cerruti Shroty. Not affiliated with or endorsed by original brand holders.",
    "gender": "MEN",
    "fragranceFamily": "Woody Floral",
    "concentration": "EAU_DE_PARFUM",
    "descriptionEn": "A timeless masculine classic reimagined by RAHEEQ. Bright orange and bergamot open into white florals anchored by rich oud, vanilla, and warm amber woods.",
    "descriptionAr": "عطر كلاسيكي ملكي بلمسة عصرية من دار رحيق. يتألق بنفحات البرتقال والبرغموت مع رقة الزهور البيضاء وعمق العود والأخشاب والعنبر الفاخر.",
    "topNotes": [
      "Orange",
      "Bergamot"
    ],
    "heartNotes": [
      "Jasmine",
      "White Flowers"
    ],
    "baseNotes": [
      "Oud",
      "Aromatic Woods",
      "Amber",
      "Vanilla"
    ],
    "isBestseller": true,
    "isNewArrival": false,
    "variants": [
      {
        "id": "shroty-50",
        "sku": "AS-CER-SHR-50",
        "volumeMl": 50,
        "regularPriceEgp": 420,
        "costPriceEgp": 720,
        "stockQuantity": 30,
        "lowStockThreshold": 4
      },
      {
        "id": "shroty-100",
        "sku": "AS-CER-SHR-100",
        "volumeMl": 100,
        "regularPriceEgp": 820,
        "costPriceEgp": 1100,
        "stockQuantity": 45,
        "lowStockThreshold": 4
      }
    ],
    "imageUrl": "/images/products/shroty.webp",
    "images": [
      {
        "id": "img-shroty-1",
        "url": "/images/products/shroty.webp",
        "altTextAr": "عطر شروتي من دار رحيق",
        "altTextEn": "Shroty by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-10-31T16:49:53.450Z",
    "updatedAt": "2026-10-31T16:49:53.450Z"
  },
  {
    "id": "phantom-paco-rabanne",
    "slug": "phantom-paco-rabanne",
    "nameEn": "Phantom",
    "nameAr": "فانتوم",
    "brand": "RAHEEQ",
    "inspiredBy": "Paco Rabanne Phantom",
    "inspirationNoteAr": "عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمّي لـ Paco Rabanne Phantom. إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.",
    "inspirationNoteEn": "Independent artisan formulation by RAHEEQ inspired by the olfactory accord of Paco Rabanne Phantom. Not affiliated with or endorsed by original brand holders.",
    "gender": "MEN",
    "fragranceFamily": "Aromatic Futuristic",
    "concentration": "EAU_DE_PARFUM",
    "descriptionEn": "A bold, futuristic aromatic fragrance by RAHEEQ inspired by Phantom. Zesty lemon and lavender fuse with clary sage, sweet vanilla, tobacco, and rich woods.",
    "descriptionAr": "عطر الحداثة والجاذبية المغناطيسية من دار رحيق بطابع فانتوم. يجمع بين انتعاش الليمون واللافندر ونفحات المرمية مع عمق الفانيليا الدافئة وأوراق التبغ والأخشاب.",
    "topNotes": [
      "Bergamot",
      "Lemon",
      "Black Pepper"
    ],
    "heartNotes": [
      "Lavender",
      "Clary Sage",
      "Jasmine"
    ],
    "baseNotes": [
      "Vanilla",
      "Tobacco Leaves",
      "Aromatic Woods"
    ],
    "isBestseller": true,
    "isNewArrival": true,
    "variants": [
      {
        "id": "phantom-50",
        "sku": "AS-PR-PHN-50",
        "volumeMl": 50,
        "regularPriceEgp": 450,
        "costPriceEgp": 720,
        "stockQuantity": 35,
        "lowStockThreshold": 4
      },
      {
        "id": "phantom-100",
        "sku": "AS-PR-PHN-100",
        "volumeMl": 100,
        "regularPriceEgp": 810,
        "costPriceEgp": 1100,
        "stockQuantity": 50,
        "lowStockThreshold": 4
      }
    ],
    "imageUrl": "/images/products/phantom.webp",
    "images": [
      {
        "id": "img-phantom-1",
        "url": "/images/products/phantom.webp",
        "altTextAr": "عطر فانتوم من دار رحيق",
        "altTextEn": "Phantom by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-10-31T16:49:53.450Z",
    "updatedAt": "2026-10-31T16:49:53.450Z"
  },
  {
    "id": "la-belle",
    "slug": "la-belle",
    "nameEn": "La Belle",
    "nameAr": "لا بيل",
    "brand": "RAHEEQ",
    "inspiredBy": "Jean Paul Gaultier La Belle",
    "inspirationNoteAr": "عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمّي لـ Jean Paul Gaultier La Belle. إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.",
    "inspirationNoteEn": "Independent artisan formulation by RAHEEQ inspired by the olfactory accord of Jean Paul Gaultier La Belle. Not affiliated with or endorsed by original brand holders.",
    "gender": "WOMEN",
    "fragranceFamily": "Gourmand",
    "concentration": "EAU_DE_PARFUM",
    "descriptionEn": "An extraordinarily sensual, addictive gourmand fragrance by RAHEEQ inspired by La Belle. Opening with juicy green pear and fresh bergamot, leading to an alluring heart of warm vanilla and spices, anchored by earthy vetiver.",
    "descriptionAr": "عطر الأنوثة الطاغية والجاذبية الإدمانية من دار رحيق بطابع لا بيل. يفتتح بانتعاش الكمثرى العصيرية والبرغموت، يليه قلب دافئ من الفانيليا والتوابل مع لمسات نجيل الهند والجاذبية الشرقية.",
    "topNotes": [
      "Green Pear",
      "Bergamot",
      "Cinnamon"
    ],
    "heartNotes": [
      "Warm Vanilla",
      "White Floral Accord",
      "Spices"
    ],
    "baseNotes": [
      "Vetiver",
      "Amber",
      "Tonka Bean"
    ],
    "isBestseller": true,
    "isNewArrival": true,
    "variants": [
      {
        "id": "labelle-50",
        "sku": "AS-JPG-LBL-50",
        "volumeMl": 50,
        "regularPriceEgp": 450,
        "costPriceEgp": 720,
        "stockQuantity": 35,
        "lowStockThreshold": 4
      },
      {
        "id": "labelle-100",
        "sku": "AS-JPG-LBL-100",
        "volumeMl": 100,
        "regularPriceEgp": 810,
        "costPriceEgp": 1100,
        "stockQuantity": 50,
        "lowStockThreshold": 4
      }
    ],
    "imageUrl": "/images/products/la-belle.webp",
    "images": [
      {
        "id": "img-la-belle-1",
        "url": "/images/products/la-belle.webp",
        "altTextAr": "عطر لا بيل من دار رحيق",
        "altTextEn": "La Belle by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-11-14T10:00:00.000Z",
    "updatedAt": "2026-11-14T10:00:00.000Z"
  },
  {
    "id": "musk-silk",
    "slug": "musk-silk",
    "nameEn": "Musk Silk",
    "nameAr": "مسك سيلك",
    "brand": "RAHEEQ",
    "inspiredBy": "Ajmal Musk Silk",
    "inspirationNoteAr": "عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمّي لـ Ajmal Musk Silk. إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.",
    "inspirationNoteEn": "Independent artisan formulation by RAHEEQ inspired by the olfactory accord of Ajmal Musk Silk. Not affiliated with or endorsed by original brand holders.",
    "gender": "UNISEX",
    "fragranceFamily": "Floral",
    "concentration": "EAU_DE_PARFUM",
    "descriptionEn": "A silky, smooth, and ultra-sensual musky creation by RAHEEQ. Delicate white flowers and luminous ylang ylang blend into velvety cashmere and creamy sandalwood, resting on a pure silk musk base.",
    "descriptionAr": "توليفة مسكية حريرية ناعمة وشديدة النقاء والجاذبية من دار رحيق. تمتزج فيها الزهور البيضاء الرقيقة وزهر اليلانج يلانج مع نعومة الكشمير وخشب الصندل الكريمي على قاعدة من أنقى مسك الحرير.",
    "topNotes": [
      "White Flowers",
      "Lily of the Valley",
      "Silk Accord"
    ],
    "heartNotes": [
      "Ylang Ylang",
      "Cashmere Wood",
      "White Rose"
    ],
    "baseNotes": [
      "Silk Musk",
      "Creamy Sandalwood",
      "White Amber"
    ],
    "isBestseller": true,
    "isNewArrival": true,
    "variants": [
      {
        "id": "musksilk-50",
        "sku": "AS-AJM-MSK-50",
        "volumeMl": 50,
        "regularPriceEgp": 450,
        "costPriceEgp": 720,
        "stockQuantity": 35,
        "lowStockThreshold": 4
      },
      {
        "id": "musksilk-100",
        "sku": "AS-AJM-MSK-100",
        "volumeMl": 100,
        "regularPriceEgp": 810,
        "costPriceEgp": 1100,
        "stockQuantity": 50,
        "lowStockThreshold": 4
      }
    ],
    "imageUrl": "/images/products/musk-silk.webp",
    "images": [
      {
        "id": "img-musk-silk-1",
        "url": "/images/products/musk-silk.webp",
        "altTextAr": "عطر مسك سيلك من دار رحيق",
        "altTextEn": "Musk Silk by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-11-14T10:00:00.000Z",
    "updatedAt": "2026-11-14T10:00:00.000Z"
  },
  {
    "id": "musk-noir-rose",
    "slug": "musk-noir-rose",
    "nameEn": "Musc Noir Rose",
    "nameAr": "مسك نوار روز",
    "brand": "RAHEEQ",
    "inspiredBy": "Narciso Rodriguez Musc Noir Rose",
    "inspirationNoteAr": "عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمّي لـ Narciso Rodriguez Musc Noir Rose. إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.",
    "inspirationNoteEn": "Independent artisan formulation by RAHEEQ inspired by the olfactory accord of Narciso Rodriguez Musc Noir Rose. Not affiliated with or endorsed by original brand holders.",
    "gender": "WOMEN",
    "fragranceFamily": "Floral",
    "concentration": "EAU_DE_PARFUM",
    "descriptionEn": "A sensual, mysterious, and romantic blooming harmony by RAHEEQ inspired by Musc Noir Rose. Rich voluptuous Damask rose meets intoxicating black musk, spiced bergamot, deep earthy patchouli, and warm amber.",
    "descriptionAr": "سيمفونية رومانسية غامضة وآسرة من دار رحيق بطابع مسك نوار روز. تلتقي بتلات الورد الدمشقي الغني مع سحر المسك الأسود ونفحات البرغموت والبتشولي الترابي والعنبر الدافئ.",
    "topNotes": [
      "Bergamot",
      "Plum",
      "Pink Pepper"
    ],
    "heartNotes": [
      "Damask Rose",
      "Black Musk",
      "Tuberose"
    ],
    "baseNotes": [
      "Patchouli",
      "Warm Amber",
      "Vanilla"
    ],
    "isBestseller": true,
    "isNewArrival": true,
    "variants": [
      {
        "id": "musknoirrose-50",
        "sku": "AS-NR-MNR-50",
        "volumeMl": 50,
        "regularPriceEgp": 450,
        "costPriceEgp": 720,
        "stockQuantity": 35,
        "lowStockThreshold": 4
      },
      {
        "id": "musknoirrose-100",
        "sku": "AS-NR-MNR-100",
        "volumeMl": 100,
        "regularPriceEgp": 810,
        "costPriceEgp": 1100,
        "stockQuantity": 50,
        "lowStockThreshold": 4
      }
    ],
    "imageUrl": "/images/products/musk-noir-rose.webp",
    "images": [
      {
        "id": "img-musk-noir-rose-1",
        "url": "/images/products/musk-noir-rose.webp",
        "altTextAr": "عطر مسك نوار روز من دار رحيق",
        "altTextEn": "Musc Noir Rose by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-11-14T10:00:00.000Z",
    "updatedAt": "2026-11-14T10:00:00.000Z"
  },
  {
    "id": "white-musk-montale",
    "slug": "white-musk-montale",
    "nameEn": "White Musk Montale",
    "nameAr": "وايت مسك مونتال",
    "brand": "RAHEEQ",
    "inspiredBy": "Montale White Musk",
    "inspirationNoteAr": "عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمّي لـ Montale White Musk. إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.",
    "inspirationNoteEn": "Independent artisan formulation by RAHEEQ inspired by the olfactory accord of Montale White Musk. Not affiliated with or endorsed by original brand holders.",
    "gender": "UNISEX",
    "fragranceFamily": "Floral",
    "concentration": "EAU_DE_PARFUM",
    "descriptionEn": "A clean, pure, and heavenly ethereal scent by RAHEEQ inspired by Montale White Musk. Crystal-clear white musk harmonizes with fresh lily of the valley, pure white flowers, creamy cashmere wood, and ambergris.",
    "descriptionAr": "عطر النقاء والصفاء السماوي من دار رحيق بطابع وايت مسك مونتال. يجمع بين كريستالات المسك الأبيض الناصع وزنبق الوادي والزهور البيضاء المنعشة مع لمسات خشب الكشمير الكريمي والعنبر الرمادي.",
    "topNotes": [
      "White Musk",
      "Lily of the Valley",
      "Crisp Bergamot"
    ],
    "heartNotes": [
      "White Flowers",
      "Delicate Rose",
      "Ylang Ylang"
    ],
    "baseNotes": [
      "Cashmere Wood",
      "Ambergris",
      "Dry Amber"
    ],
    "isBestseller": true,
    "isNewArrival": true,
    "variants": [
      {
        "id": "wmmontale-50",
        "sku": "AS-MON-WM-50",
        "volumeMl": 50,
        "regularPriceEgp": 450,
        "costPriceEgp": 720,
        "stockQuantity": 35,
        "lowStockThreshold": 4
      },
      {
        "id": "wmmontale-100",
        "sku": "AS-MON-WM-100",
        "volumeMl": 100,
        "regularPriceEgp": 810,
        "costPriceEgp": 1100,
        "stockQuantity": 50,
        "lowStockThreshold": 4
      }
    ],
    "imageUrl": "/images/products/white-musk-montale.webp",
    "images": [
      {
        "id": "img-white-musk-montale-1",
        "url": "/images/products/white-musk-montale.webp",
        "altTextAr": "عطر وايت مسك مونتال من دار رحيق",
        "altTextEn": "White Musk Montale by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-11-14T10:00:00.000Z",
    "updatedAt": "2026-11-14T10:00:00.000Z"
  },
  {
    "id": "white-musk",
    "slug": "white-musk",
    "nameEn": "White Musk",
    "nameAr": "وايت مسك",
    "brand": "RAHEEQ",
    "inspiredBy": "The Body Shop White Musk",
    "inspirationNoteAr": "عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمّي لـ Classic White Musk. إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.",
    "inspirationNoteEn": "Independent artisan formulation by RAHEEQ inspired by the classic olfactory accord of White Musk. Not affiliated with or endorsed by original brand holders.",
    "gender": "UNISEX",
    "fragranceFamily": "Floral",
    "concentration": "EAU_DE_PARFUM",
    "descriptionEn": "The quintessential essence of clean, comforting purity by RAHEEQ. Velvety white musk, tender lily of the valley, soft white roses, warm comforting amber, and sweet comforting vanilla.",
    "descriptionAr": "أيقونة النظافة والانتعاش البودري الهادئ من دار رحيق. توليفة ساحرة تجمع المسك الأبيض المخملي وزنبق الوادي والورد الأبيض النقي مع دفء العنبر ولمسات الفانيليا الرقيقة.",
    "topNotes": [
      "White Musk",
      "Lily of the Valley",
      "Cotton Flower"
    ],
    "heartNotes": [
      "White Rose",
      "Jasmine Petals",
      "Powdery Notes"
    ],
    "baseNotes": [
      "Sensual Amber",
      "Sweet Vanilla",
      "Clean Musk"
    ],
    "isBestseller": true,
    "isNewArrival": true,
    "variants": [
      {
        "id": "whitemusk-50",
        "sku": "AS-WM-CLS-50",
        "volumeMl": 50,
        "regularPriceEgp": 450,
        "costPriceEgp": 720,
        "stockQuantity": 35,
        "lowStockThreshold": 4
      },
      {
        "id": "whitemusk-100",
        "sku": "AS-WM-CLS-100",
        "volumeMl": 100,
        "regularPriceEgp": 810,
        "costPriceEgp": 1100,
        "stockQuantity": 50,
        "lowStockThreshold": 4
      }
    ],
    "imageUrl": "/images/products/white-musk.webp",
    "images": [
      {
        "id": "img-white-musk-1",
        "url": "/images/products/white-musk.webp",
        "altTextAr": "عطر وايت مسك من دار رحيق",
        "altTextEn": "White Musk by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-11-14T10:00:00.000Z",
    "updatedAt": "2026-11-14T10:00:00.000Z"
  },
  {
    "id": "original-musk",
    "slug": "original-musk",
    "nameEn": "Original Musk",
    "nameAr": "أوريجينال مسك",
    "brand": "RAHEEQ",
    "inspiredBy": "Kiehl's Original Musk",
    "inspirationNoteAr": "عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمّي لـ Kiehl's Original Musk. إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.",
    "inspirationNoteEn": "Independent artisan formulation by RAHEEQ inspired by the olfactory accord of Kiehl's Original Musk. Not affiliated with or endorsed by original brand holders.",
    "gender": "UNISEX",
    "fragranceFamily": "Oriental",
    "concentration": "EAU_DE_PARFUM",
    "descriptionEn": "A timeless, warm, and deeply sensual classic by RAHEEQ. Opulent musk accented with intoxicating ylang ylang, lily of the valley, velvety tonka bean, civet accord, and creamy sandalwood.",
    "descriptionAr": "العطر الكلاسيكي الدافئ ذو الطابع الحسي الراقي من دار رحيق. عبير المسك الأصيل المطعم بزهر اليلانج يلانج وزنبق الوادي مع حبوب التونكا الدافئة وخشب الصندل المعتق.",
    "topNotes": [
      "Bergamot Nectar",
      "Orange Blossom",
      "Warm Musk"
    ],
    "heartNotes": [
      "Ylang Ylang",
      "Lily of the Valley",
      "Neroli",
      "Rose"
    ],
    "baseNotes": [
      "Classic Musk",
      "Tonka Bean",
      "Sandalwood",
      "Patchouli"
    ],
    "isBestseller": true,
    "isNewArrival": true,
    "variants": [
      {
        "id": "origmusk-50",
        "sku": "AS-KHL-OM-50",
        "volumeMl": 50,
        "regularPriceEgp": 450,
        "costPriceEgp": 720,
        "stockQuantity": 35,
        "lowStockThreshold": 4
      },
      {
        "id": "origmusk-100",
        "sku": "AS-KHL-OM-100",
        "volumeMl": 100,
        "regularPriceEgp": 810,
        "costPriceEgp": 1100,
        "stockQuantity": 50,
        "lowStockThreshold": 4
      }
    ],
    "imageUrl": "/images/products/original-musk.webp",
    "images": [
      {
        "id": "img-original-musk-1",
        "url": "/images/products/original-musk.webp",
        "altTextAr": "عطر أوريجينال مسك من دار رحيق",
        "altTextEn": "Original Musk by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-11-14T10:00:00.000Z",
    "updatedAt": "2026-11-14T10:00:00.000Z"
  },
  {
    "id": "musk-al-tahara",
    "slug": "musk-al-tahara",
    "nameEn": "Musk Al Tahara",
    "nameAr": "مسك الطهارة",
    "brand": "RAHEEQ",
    "inspiredBy": "Arabian Musk Al Tahara",
    "inspirationNoteAr": "عطر تراثي مستقل من إبداع دار رحيق مستوحى من عبق مسك الطهارة العربي الأصيل. إنتاج وتوليف دار رحيق الخاصة.",
    "inspirationNoteEn": "Original heritage formulation by RAHEEQ inspired by traditional Arabian Musk Al Tahara. Handcrafted in RAHEEQ private ateliers.",
    "gender": "UNISEX",
    "fragranceFamily": "Oriental",
    "concentration": "EAU_DE_PARFUM",
    "descriptionEn": "Pure, serene, and purifying. The sacred essence of traditional White Musk fused with lotus flower, white amber, delicate jasmine, and soothing sandalwood.",
    "descriptionAr": "نقي ... هادئ ... مطهر. جوهر النقاء والسكينة من دار رحيق بعبير المسك الأبيض الصافي وزهرة اللوتس والعنبر الأبيض والياسمين الرقيق مع هدوء خشب الصندل.",
    "topNotes": [
      "Pure White Musk",
      "Lotus Flower",
      "Citrus Breeze"
    ],
    "heartNotes": [
      "Delicate Jasmine",
      "White Amber",
      "Lavender"
    ],
    "baseNotes": [
      "Subtle Sandalwood",
      "Soft Vanilla",
      "Touch of Oud"
    ],
    "isBestseller": true,
    "isNewArrival": true,
    "variants": [
      {
        "id": "musktahara-50",
        "sku": "AS-MSK-THR-50",
        "volumeMl": 50,
        "regularPriceEgp": 450,
        "costPriceEgp": 720,
        "stockQuantity": 35,
        "lowStockThreshold": 4
      },
      {
        "id": "musktahara-100",
        "sku": "AS-MSK-THR-100",
        "volumeMl": 100,
        "regularPriceEgp": 810,
        "costPriceEgp": 1100,
        "stockQuantity": 50,
        "lowStockThreshold": 4
      }
    ],
    "imageUrl": "/images/products/musk-al-tahara.webp",
    "images": [
      {
        "id": "img-musk-al-tahara-1",
        "url": "/images/products/musk-al-tahara.webp",
        "altTextAr": "عطر مسك الطهارة من دار رحيق",
        "altTextEn": "Musk Al Tahara by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-11-14T10:00:00.000Z",
    "updatedAt": "2026-11-14T10:00:00.000Z"
  },
  {
    "id": "ysl-libre",
    "slug": "ysl-libre",
    "nameEn": "Libre",
    "nameAr": "ليبر",
    "brand": "RAHEEQ",
    "inspiredBy": "Yves Saint Laurent Libre",
    "inspirationNoteAr": "عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمّي لـ YSL Libre. إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.",
    "inspirationNoteEn": "Independent artisan formulation by RAHEEQ inspired by the olfactory accord of Yves Saint Laurent Libre. Not affiliated with or endorsed by original brand holders.",
    "gender": "WOMEN",
    "fragranceFamily": "Floral",
    "concentration": "EAU_DE_PARFUM",
    "descriptionEn": "Sensual, captivating, and passionately free by RAHEEQ inspired by Libre. French aromatic lavender intertwines with luminous Moroccan orange blossom, warm Madagascar vanilla, and radiant musk.",
    "descriptionAr": "حسي ... آسر ... حر. عطر الحرية والأنوثة الجريئة من دار رحيق بطابع ليبر. يجمع بين انتعاش اللافندر الفرنسي وزهر البرتقال المغربي المشرق مع دفء الفانيليا والمسك الحسي.",
    "topNotes": [
      "French Lavender",
      "Mandarin Orange",
      "Blackcurrant"
    ],
    "heartNotes": [
      "Moroccan Orange Blossom",
      "Jasmine",
      "Lavender"
    ],
    "baseNotes": [
      "Madagascar Vanilla",
      "Clean Musk",
      "Cedarwood",
      "Ambergris"
    ],
    "isBestseller": true,
    "isNewArrival": true,
    "variants": [
      {
        "id": "ysllibre-50",
        "sku": "AS-YSL-LBR-50",
        "volumeMl": 50,
        "regularPriceEgp": 450,
        "costPriceEgp": 720,
        "stockQuantity": 35,
        "lowStockThreshold": 4
      },
      {
        "id": "ysllibre-100",
        "sku": "AS-YSL-LBR-100",
        "volumeMl": 100,
        "regularPriceEgp": 810,
        "costPriceEgp": 1100,
        "stockQuantity": 50,
        "lowStockThreshold": 4
      }
    ],
    "imageUrl": "/images/products/ysl-libre.webp",
    "images": [
      {
        "id": "img-ysl-libre-1",
        "url": "/images/products/ysl-libre.webp",
        "altTextAr": "عطر ليبر من دار رحيق",
        "altTextEn": "Libre by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-11-14T10:00:00.000Z",
    "updatedAt": "2026-11-14T10:00:00.000Z"
  },
  {
    "id": "la-vie-est-belle",
    "slug": "la-vie-est-belle",
    "nameEn": "La Vie Est Belle",
    "nameAr": "لافي إي بيل",
    "brand": "RAHEEQ",
    "inspiredBy": "Lancôme La Vie Est Belle",
    "inspirationNoteAr": "عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمّي لـ Lancôme La Vie Est Belle. إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.",
    "inspirationNoteEn": "Independent artisan formulation by RAHEEQ inspired by the olfactory accord of Lancôme La Vie Est Belle. Not affiliated with or endorsed by original brand holders.",
    "gender": "WOMEN",
    "fragranceFamily": "Gourmand",
    "concentration": "EAU_DE_PARFUM",
    "descriptionEn": "Joyful, elegant, and captivating by RAHEEQ inspired by La Vie Est Belle. Precious iris pallida harmonizes with indulgent sweet praline, creamy vanilla, and luminous orange blossom on an earthy patchouli foundation.",
    "descriptionAr": "مبهج ... أنيق ... آسر. ابتسامة الحياة والأناقة المشعة من دار رحيق بطابع لافي إي بيل. تلتقي زهرة السوسن النبيلة مع حلاوة البرالين والفانيليا الكريمية وزهر البرتقال على قاعدة غنية من الباتشولي.",
    "topNotes": [
      "Blackcurrant",
      "Ripe Pear",
      "Orange Blossom"
    ],
    "heartNotes": [
      "Iris Pallida",
      "Jasmine Sambac",
      "Orange Blossom"
    ],
    "baseNotes": [
      "Sweet Praline",
      "Warm Vanilla",
      "Patchouli",
      "Tonka Bean"
    ],
    "isBestseller": true,
    "isNewArrival": true,
    "variants": [
      {
        "id": "lavieestbelle-50",
        "sku": "AS-LAN-LVB-50",
        "volumeMl": 50,
        "regularPriceEgp": 450,
        "costPriceEgp": 720,
        "stockQuantity": 35,
        "lowStockThreshold": 4
      },
      {
        "id": "lavieestbelle-100",
        "sku": "AS-LAN-LVB-100",
        "volumeMl": 100,
        "regularPriceEgp": 810,
        "costPriceEgp": 1100,
        "stockQuantity": 50,
        "lowStockThreshold": 4
      }
    ],
    "imageUrl": "/images/products/la-vie-est-belle.webp",
    "images": [
      {
        "id": "img-la-vie-est-belle-1",
        "url": "/images/products/la-vie-est-belle.webp",
        "altTextAr": "عطر لافي إي بيل من دار رحيق",
        "altTextEn": "La Vie Est Belle by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-11-14T10:00:00.000Z",
    "updatedAt": "2026-11-14T10:00:00.000Z"
  },
  {
    "id": "good-girl",
    "slug": "good-girl",
    "nameEn": "Good Girl",
    "nameAr": "جود جيرل",
    "brand": "RAHEEQ",
    "inspiredBy": "Carolina Herrera Good Girl",
    "inspirationNoteAr": "عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمّي لـ Carolina Herrera Good Girl. إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.",
    "inspirationNoteEn": "Independent artisan formulation by RAHEEQ inspired by the olfactory accord of Carolina Herrera Good Girl. Not affiliated with or endorsed by original brand holders.",
    "gender": "WOMEN",
    "fragranceFamily": "Oriental",
    "concentration": "EAU_DE_PARFUM",
    "descriptionEn": "Sensual, daring, and unapologetically bold by RAHEEQ inspired by Good Girl. Intoxicating tuberose and fresh white jasmine clash with dark, seductive roasted cocoa, sweet tonka bean, rich coffee, and almond.",
    "descriptionAr": "حسي ... جريء ... غامض. تناقض الأنوثة الفاتنة والجرأة من دار رحيق بطابع جود جيرل. يجمع بين رقة مسك الروم والياسمين مع غموض الكاكاو الغني والقهوة المحمصة واللوز وحبوب التونكا الدافئة.",
    "topNotes": [
      "Almond",
      "Coffee",
      "Bergamot",
      "Lemon"
    ],
    "heartNotes": [
      "Tuberose",
      "Jasmine Sambac",
      "Orange Blossom",
      "Orris"
    ],
    "baseNotes": [
      "Tonka Bean",
      "Cacao",
      "Vanilla",
      "Praline",
      "Sandalwood"
    ],
    "isBestseller": true,
    "isNewArrival": true,
    "variants": [
      {
        "id": "goodgirl-50",
        "sku": "AS-CH-GG-50",
        "volumeMl": 50,
        "regularPriceEgp": 450,
        "costPriceEgp": 720,
        "stockQuantity": 35,
        "lowStockThreshold": 4
      },
      {
        "id": "goodgirl-100",
        "sku": "AS-CH-GG-100",
        "volumeMl": 100,
        "regularPriceEgp": 810,
        "costPriceEgp": 1100,
        "stockQuantity": 50,
        "lowStockThreshold": 4
      }
    ],
    "imageUrl": "/images/products/good-girl.webp",
    "images": [
      {
        "id": "img-good-girl-1",
        "url": "/images/products/good-girl.webp",
        "altTextAr": "عطر جود جيرل من دار رحيق",
        "altTextEn": "Good Girl by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-11-14T10:00:00.000Z",
    "updatedAt": "2026-11-14T10:00:00.000Z"
  },
  {
    "id": "jadore",
    "slug": "jadore",
    "nameEn": "J'adore",
    "nameAr": "جادور",
    "brand": "RAHEEQ",
    "inspiredBy": "Dior J'adore",
    "inspirationNoteAr": "عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمّي لـ Dior J'adore. إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.",
    "inspirationNoteEn": "Independent artisan formulation by RAHEEQ inspired by the olfactory accord of Dior J'adore. Not affiliated with or endorsed by original brand holders.",
    "gender": "WOMEN",
    "fragranceFamily": "Floral",
    "concentration": "EAU_DE_PARFUM",
    "descriptionEn": "Luminous, sensual, and exquisitely floral by RAHEEQ inspired by J'adore. An iconic golden floral bouquet blending exotic ylang ylang, romantic Damask rose, and radiant jasmine sambac with sweet melon and pear.",
    "descriptionAr": "مضيء ... حسي ... زهري. باقة الذهب والأنوثة الخالدة من دار رحيق بطابع جادور. مزيج مشرق يجمع أزهار اليلانج يلانج الاستوائية والورد الدمشقي والياسمين مع لمسات الكمثرى والشمام والمسك الفاخر.",
    "topNotes": [
      "Pear",
      "Melon",
      "Magnolia",
      "Peach",
      "Mandarin"
    ],
    "heartNotes": [
      "Ylang Ylang",
      "Damask Rose",
      "Jasmine Sambac",
      "Lily of the Valley",
      "Tuberose"
    ],
    "baseNotes": [
      "Sensual Musk",
      "Vanilla",
      "Cedarwood",
      "Blackberry"
    ],
    "isBestseller": true,
    "isNewArrival": true,
    "variants": [
      {
        "id": "jadore-50",
        "sku": "AS-DIOR-JAD-50",
        "volumeMl": 50,
        "regularPriceEgp": 450,
        "costPriceEgp": 720,
        "stockQuantity": 35,
        "lowStockThreshold": 4
      },
      {
        "id": "jadore-100",
        "sku": "AS-DIOR-JAD-100",
        "volumeMl": 100,
        "regularPriceEgp": 810,
        "costPriceEgp": 1100,
        "stockQuantity": 50,
        "lowStockThreshold": 4
      }
    ],
    "imageUrl": "/images/products/jadore.webp",
    "images": [
      {
        "id": "img-jadore-1",
        "url": "/images/products/jadore.webp",
        "altTextAr": "عطر جادور من دار رحيق",
        "altTextEn": "J'adore by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-11-14T10:00:00.000Z",
    "updatedAt": "2026-11-14T10:00:00.000Z"
  },
  {
    "id": "musk-kashmir",
    "slug": "musk-kashmir",
    "nameEn": "Musk Kashmir",
    "nameAr": "مسك كشمير",
    "brand": "RAHEEQ",
    "inspiredBy": "Attar Collection Musk Kashmir",
    "inspirationNoteAr": "عطر مستقل من إبداع دار رحيق مستوحى من الطابع الشمّي لـ Musk Kashmir. إنتاج وتوليف دار رحيق الخاصة دون أي تبعية أو ترخيص من العلامة الأصلية.",
    "inspirationNoteEn": "Independent artisan formulation by RAHEEQ inspired by the olfactory accord of Musk Kashmir. Not affiliated with or endorsed by original brand holders.",
    "gender": "UNISEX",
    "fragranceFamily": "Floral",
    "concentration": "EAU_DE_PARFUM",
    "descriptionEn": "Soft, clean, and ethereal by RAHEEQ inspired by Musk Kashmir. Second-skin elegance featuring cloud-like white musk, fresh white flowers, soft cashmere wood, amber, and delicate lily of the valley.",
    "descriptionAr": "ناعم ... نظيف ... سماوي. سحر النعومة المخملية وأناقة الصفاء من دار رحيق بطابع مسك كشمير. سحابة بيضاء من أنقى مسك مع خشب الكشمير والزهور البيضاء وزنبق الوادي والعنبر الشفاف.",
    "topNotes": [
      "White Musk",
      "White Pepper",
      "Clean Breeze"
    ],
    "heartNotes": [
      "White Flowers",
      "Lily of the Valley",
      "Gardenia"
    ],
    "baseNotes": [
      "Cashmere Wood",
      "Sandalwood",
      "Sensual Amber"
    ],
    "isBestseller": true,
    "isNewArrival": true,
    "variants": [
      {
        "id": "muskkashmir-50",
        "sku": "AS-ATT-MK-50",
        "volumeMl": 50,
        "regularPriceEgp": 450,
        "costPriceEgp": 720,
        "stockQuantity": 35,
        "lowStockThreshold": 4
      },
      {
        "id": "muskkashmir-100",
        "sku": "AS-ATT-MK-100",
        "volumeMl": 100,
        "regularPriceEgp": 810,
        "costPriceEgp": 1100,
        "stockQuantity": 50,
        "lowStockThreshold": 4
      }
    ],
    "imageUrl": "/images/products/musk-kashmir.webp",
    "images": [
      {
        "id": "img-musk-kashmir-1",
        "url": "/images/products/musk-kashmir.webp",
        "altTextAr": "عطر مسك كشمير من دار رحيق",
        "altTextEn": "Musk Kashmir by RAHEEQ",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-11-14T10:00:00.000Z",
    "updatedAt": "2026-11-14T10:00:00.000Z"
  }
];

export const FAMOUS_50_PERFUMES: Product[] = OFFICIAL_10_PERFUMES;
export const DEMO_PRODUCTS: Product[] = OFFICIAL_10_PERFUMES;
