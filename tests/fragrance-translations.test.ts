import { describe, it, expect } from 'vitest';
import {
  getLocalizedProductName,
  getLocalizedProductDescription,
  getLocalizedFragranceFamily,
  getLocalizedConcentration,
  getLocalizedOlfactoryNote,
  getLocalizedNotesList,
} from '../src/lib/fragrance-translations';

describe('Fragrance Arabic Localization Suite', () => {
  it('localizes perfume name accurately based on language mode', () => {
    const product = {
      nameEn: 'Sauvage Elixir',
      nameAr: 'سوفاج إكسير',
    };

    // Arabic RTL mode
    expect(getLocalizedProductName(product, true)).toBe('سوفاج إكسير');

    // English LTR mode
    expect(getLocalizedProductName(product, false)).toBe('Sauvage Elixir');

    // Fallback when Arabic name is missing or empty
    expect(getLocalizedProductName({ nameEn: 'Creed Aventus', nameAr: '' }, true)).toBe('Creed Aventus');
  });

  it('localizes fragrance descriptions correctly', () => {
    const product = {
      descriptionEn: 'Iconic fragrance with spicy notes.',
      descriptionAr: 'عطر أسطوري بنفحات توابل دافئة.',
    };

    expect(getLocalizedProductDescription(product, true)).toBe('عطر أسطوري بنفحات توابل دافئة.');
    expect(getLocalizedProductDescription(product, false)).toBe('Iconic fragrance with spicy notes.');
  });

  it('translates fragrance families and concentrations to luxury Arabic equivalents', () => {
    expect(getLocalizedFragranceFamily('Woody', true)).toBe('خشبي فاخر');
    expect(getLocalizedFragranceFamily('Aromatic', true)).toBe('أروماتيك منعش');
    expect(getLocalizedFragranceFamily('Fresh Citrus', true)).toBe('حمضيات منعشة');
    expect(getLocalizedFragranceFamily('Woody', false)).toBe('Woody');

    expect(getLocalizedConcentration('EXTRAIT_DE_PARFUM', true)).toBe('إكستري دي بارفام (Extrait de Parfum)');
    expect(getLocalizedConcentration('EXTRAIT_DE_PARFUM', false)).toBe('EXTRAIT DE PARFUM');
  });

  it('translates complex olfactory notes into authentic Arabic perfumery terms', () => {
    expect(getLocalizedOlfactoryNote('Lavender', true)).toBe('خزامى فرنسية (لافندر)');
    expect(getLocalizedOlfactoryNote('Cinnamon', true)).toBe('قرفة سيلانية');
    expect(getLocalizedOlfactoryNote('Cardamom', true)).toBe('هيل أخضر');
    expect(getLocalizedOlfactoryNote('Sandalwood', true)).toBe('خشب الصندل الميسوري');
    expect(getLocalizedOlfactoryNote('Ambergris', true)).toBe('عنبر الحوت الرمادي النادر');

    // English passthrough
    expect(getLocalizedOlfactoryNote('Lavender', false)).toBe('Lavender');

    // Array batch translation
    const notes = ['Bergamot', 'Saffron', 'Rose'];
    const localized = getLocalizedNotesList(notes, true);
    expect(localized).toEqual(['برغموت كالابريا', 'زعفران أصيل', 'ورد دمشقي نقي']);
  });
});
