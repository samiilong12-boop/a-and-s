import { Product, FragranceConcentration, ShippingZone } from '@/types';

export const SHIPPING_ZONES: ShippingZone[] = [
  { governorateEn: 'Cairo', governorateAr: 'القاهرة', rateInPiasters: 5500, minDays: 1, maxDays: 2 },
  { governorateEn: 'Giza', governorateAr: 'الجيزة', rateInPiasters: 5500, minDays: 1, maxDays: 2 },
  { governorateEn: 'Alexandria', governorateAr: 'الإسكندرية', rateInPiasters: 6500, minDays: 2, maxDays: 3 },
  { governorateEn: 'Delta (Dakahlia, Gharbia, Sharqia, etc.)', governorateAr: 'محافظات الدلتا', rateInPiasters: 7500, minDays: 2, maxDays: 4 },
  { governorateEn: 'Canal Zone (Port Said, Ismailia, Suez)', governorateAr: 'مدن القناة', rateInPiasters: 7500, minDays: 2, maxDays: 4 },
  { governorateEn: 'Upper Egypt (Fayoum, Beni Suef, Minya, Asyut)', governorateAr: 'شمال ووسط الصعيد', rateInPiasters: 9000, minDays: 3, maxDays: 5 },
  { governorateEn: 'Far Upper Egypt (Sohag, Qena, Luxor, Aswan)', governorateAr: 'جنوب الصعيد', rateInPiasters: 11000, minDays: 4, maxDays: 6 },
  { governorateEn: 'Red Sea & South Sinai', governorateAr: 'البحر الأحمر وجنوب سيناء', rateInPiasters: 12000, minDays: 3, maxDays: 6 },
  { governorateEn: 'Matrouh & North Coast', governorateAr: 'مطروح والساحل الشمالي', rateInPiasters: 10000, minDays: 3, maxDays: 5 },
];

export const FRAGRANCE_FAMILIES = [
  'Oriental Woody',
  'Floral Amber',
  'Smoky Oud & Leather',
  'Fresh Citrus & Aquatic',
  'Aromatic Fougere',
  'Chypre Floral',
  'Gourmand Spice',
];

export const CONCENTRATIONS: FragranceConcentration[] = [
  'EXTRAIT_DE_PARFUM',
  'EAU_DE_PARFUM',
  'EAU_DE_TOILETTE',
];

// Helper to generate a clean luxury SVG bottle placeholder data URI
export function getDemoBottleSvg(name: string, colorHex: string = '#66D9C5'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#141A19"/>
        <stop offset="100%" stop-color="#080A0A"/>
      </linearGradient>
      <linearGradient id="bottle" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#1A2826"/>
        <stop offset="50%" stop-color="#233B37"/>
        <stop offset="100%" stop-color="#111B19"/>
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#D7BA80"/>
        <stop offset="50%" stop-color="#C6A66B"/>
        <stop offset="100%" stop-color="#9C7F45"/>
      </linearGradient>
    </defs>
    <rect width="400" height="500" fill="url(#bg)"/>
    <!-- Bottle Cap -->
    <rect x="175" y="80" width="50" height="60" rx="3" fill="url(#gold)" stroke="#C6A66B" stroke-width="1"/>
    <!-- Bottle Collar -->
    <rect x="170" y="140" width="60" height="15" rx="2" fill="url(#gold)"/>
    <!-- Bottle Shoulder & Body -->
    <path d="M 140 170 C 140 155, 170 155, 170 155 L 230 155 C 230 155, 260 155, 260 170 L 275 390 C 275 405, 260 415, 240 415 L 160 415 C 140 415, 125 405, 125 390 Z" fill="url(#bottle)" stroke="#2D4843" stroke-width="2"/>
    <!-- Luxury Label -->
    <rect x="155" y="220" width="90" height="120" rx="2" fill="#080A0A" stroke="#C6A66B" stroke-width="1"/>
    <text x="200" y="245" fill="#C6A66B" font-family="serif" font-size="10" font-weight="bold" letter-spacing="2" text-anchor="middle">A AND S</text>
    <line x1="170" y1="252" x2="230" y2="252" stroke="#C6A66B" stroke-width="0.5"/>
    <text x="200" y="275" fill="#F5F2EB" font-family="serif" font-size="9" text-anchor="middle">${name.substring(0, 14)}</text>
    <text x="200" y="315" fill="#66D9C5" font-family="sans-serif" font-size="7" letter-spacing="1" text-anchor="middle">EAU DE PARFUM</text>
    <!-- Demo Watermark -->
    <text x="200" y="460" fill="#6C7A77" font-family="sans-serif" font-size="9" letter-spacing="2" text-anchor="middle">[DEMO IMAGE]</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 120 curated demo luxury fragrance formulations for A AND S
const FRAGRANCE_NAMES = [
  'Royal Sovereign Oud', 'Saffron Mirage', 'Velvet Ambergris', 'Nile Midnight Blossom',
  'Alexandria Imperial', 'Smoked Incense & Vanilla', 'Desert Rose Extrait', 'Celestial Bergamot',
  'Golden Leather Reserve', 'Emerald Vetiver', 'Obsidian Musk', 'Cashmere Santal',
  'Damascus Dawn', 'Crimson Cardamom', 'Nocturne Patchouli', 'Arabian Cedarwood',
  'Solar Neroli', 'Grand Cypress', 'Oasis Iris', 'Pharaoh Amber',
  'Santal Majeste', 'Cuir Noir Prestige', 'Rose Royale Prive', 'Ambre Sublime',
  'Bois De Soie', 'Fleur D Orient', 'Tabac Imperial', 'Oud Renaissance',
  'Fumee Divine', 'Vetiver Mystique', 'Soleil De Louxor', 'Musc Eternel',
  'Iris Nomade', 'Jasmin De Nuit', 'Epices Precieuses', 'Cypres Royale',
  'Verveine D Or', 'Patchouli Sombre', 'Orangerie Privee', 'Vanille Boisee',
  'Cuir De Cordoue', 'Santal Imperial', 'Fleur De Coton', 'Rose Noire Absolue',
  'Oud Des Sultans', 'Ambre De Minuit', 'Encens Sacre', 'Cedre Noble',
  'Bergamote Celeste', 'Cardamome Royale', 'Fumee D Ambre', 'Vetiver Solaire',
  'Musc Blanc Divin', 'Lilas De Damas', 'Safran Sublime', 'Tabac Blond Reserve',
  'Cuir De Russie', 'Fleur De Tabac', 'Ambrette Celeste', 'Bois D Argent Prive',
  'Oud Noir Intense', 'Rose De Mai Royale', 'Patchouli De Java', 'Jasmin Eternel',
  'Vanille Bourbon D Or', 'Santal Austral', 'Iris Precieux', 'Cypres D Italie',
  'Neroli Portofino Reserve', 'Cuir De Marrakech', 'Encens D Arabie', 'Ambre Imperial Noir',
  'Oud Santal Elixir', 'Rose Musc Royale', 'Cedre Bleu De L Atlas', 'Verveine Solaire',
  'Fleur De Cuir', 'Tabac Noir Absolu', 'Santal Blanc Majeste', 'Bois De Cashmere',
  'Musc De Soie', 'Oud D Orient', 'Ambre Blanc Royale', 'Fumee De Bois',
  'Rose Oud Sublime', 'Cardamome De Ceylan', 'Patchouli Blanc', 'Jasmin De Grasse',
  'Vanille Noire De Madagascar', 'Santal Dore', 'Iris De Florence', 'Cypres Sauvage',
  'Neroli Blanc', 'Cuir De Venise', 'Encens De Kyoto', 'Ambre Rose Prive',
  'Oud Royal Extrait', 'Rose Sauvage', 'Cedre Des Dieux', 'Verveine Royale',
  'Fleur De Lys Noire', 'Tabac De Havane', 'Santal Des Indes', 'Bois De Cedre',
  'Musc Imperial', 'Oud Majestueux', 'Ambrette De Minuit', 'Fumee De Rose',
  'Rose Blanche Royale', 'Cardamome D Or', 'Patchouli Royal', 'Jasmin Des Sables',
  'Vanille Imperial', 'Santal Royal Prive', 'Iris Sauvage', 'Cypres Dor'
];

export const DEMO_PRODUCTS: Product[] = Array.from({ length: 120 }, (_, index) => {
  const id = `as-fragrance-${String(index + 1).padStart(3, '0')}`;
  const nameEn = `A AND S — ${FRAGRANCE_NAMES[index % FRAGRANCE_NAMES.length]} ${Math.floor(index / FRAGRANCE_NAMES.length) > 0 ? `Vol. ${Math.floor(index / FRAGRANCE_NAMES.length) + 1}` : ''}`.trim();
  const slug = nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const family = FRAGRANCE_FAMILIES[index % FRAGRANCE_FAMILIES.length];
  const concentration = CONCENTRATIONS[index % CONCENTRATIONS.length];

  // Base pricing: 1,600.00 EGP to 4,800.00 EGP in piasters
  const basePiasters = 160000 + ((index * 27000) % 320000);
  const regularPriceInPiasters = Math.round(basePiasters / 5000) * 5000;
  const hasDiscount = index % 5 === 0;
  const salePriceInPiasters = hasDiscount ? regularPriceInPiasters - 30000 : null;
  const costPriceInPiasters = Math.round(regularPriceInPiasters * 0.35); // 35% estimated COGS

  const demoImg = getDemoBottleSvg(nameEn);

  return {
    id,
    slug,
    nameEn,
    headlineEn: 'Handcrafted luxury fragrance crafted with high-percentage precious oils.',
    descriptionEn: `Experience the captivating aura of ${nameEn}. Masterfully blended in Cairo with rare essences, opening with luminous top notes that gracefully surrender to an opulent heart and a deep, lingering drydown that leaves an unforgettable signature.`,
    concentration,
    fragranceFamily: family,
    topNotes: [
      ['Bergamot', 'Bitter Orange', 'Saffron'][index % 3],
      ['Cardamom', 'Pink Pepper', 'Grapefruit'][(index + 1) % 3],
      ['Lavender', 'Nutmeg', 'Davana'][(index + 2) % 3],
    ],
    heartNotes: [
      ['Damask Rose', 'Turkish Rose', 'Night Jasmine'][index % 3],
      ['Smoky Birch', 'Oud Wood', 'Cedar'][(index + 1) % 3],
      ['Orris Butter', 'Geranium', 'Cinnamon'][(index + 2) % 3],
    ],
    baseNotes: [
      ['Grey Ambergris', 'Mysore Sandalwood', 'Madagascar Vanilla'][index % 3],
      ['Cured Leather', 'Indonesian Patchouli', 'Oakmoss'][(index + 1) % 3],
      ['White Musk', 'Benzoin Resin', 'Tonka Bean'][(index + 2) % 3],
    ],
    categoryId: family.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    categoryName: family,
    collectionIds: [index % 2 === 0 ? 'signature-collection' : 'prive-collection'],
    isFeatured: index < 8 || index % 12 === 0,
    isNewArrival: index >= 100 || index % 7 === 0,
    isBestseller: index < 5 || (index % 11 === 0 && index < 60),
    isPublished: true,
    rating: 4.8 + ((index % 3) * 0.1),
    reviewCount: 14 + (index * 3) % 45,
    images: [
      { id: `${id}-img-1`, url: demoImg, altTextEn: `${nameEn} Main Demo Bottle`, isPrimary: true, sortOrder: 0 },
      { id: `${id}-img-2`, url: demoImg, altTextEn: `${nameEn} Secondary View`, isPrimary: false, sortOrder: 1 },
    ],
    variants: [
      {
        id: `${id}-v50`,
        productId: id,
        sku: `AS-${String(index + 1).padStart(3, '0')}-50ML`,
        volumeMl: 50,
        titleEn: '50ml Eau De Parfum',
        regularPriceInPiasters,
        salePriceInPiasters,
        costPriceInPiasters,
        stockQuantity: 18 + ((index * 7) % 35),
        lowStockThreshold: 5,
        isActive: true,
      },
      {
        id: `${id}-v100`,
        productId: id,
        sku: `AS-${String(index + 1).padStart(3, '0')}-100ML`,
        volumeMl: 100,
        titleEn: '100ml Eau De Parfum',
        regularPriceInPiasters: Math.round(regularPriceInPiasters * 1.55 / 5000) * 5000,
        salePriceInPiasters: hasDiscount ? Math.round((regularPriceInPiasters * 1.55 - 40000) / 5000) * 5000 : null,
        costPriceInPiasters: Math.round(costPriceInPiasters * 1.5),
        stockQuantity: 12 + ((index * 5) % 25),
        lowStockThreshold: 4,
        isActive: true,
      },
    ],
    createdAt: new Date(Date.now() - index * 86400000).toISOString(),
  };
});
