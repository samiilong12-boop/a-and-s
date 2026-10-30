'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, ArrowUpDown, Sparkles, Filter, FlaskConical, Send } from 'lucide-react';
import { Product } from '@/types';
import { useProducts } from '@/context/ProductContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCustomRequest } from '@/context/CustomRequestContext';
import { FRAGRANCE_FAMILIES, CONCENTRATIONS } from '@/lib/data/products';
import { ProductCard } from '@/components/ProductCard';
import {
  getLocalizedFragranceFamily,
  getLocalizedConcentration,
} from '@/lib/fragrance-translations';

interface CatalogClientViewProps {
  initialProducts: Product[];
}

export function CatalogClientView({ initialProducts }: CatalogClientViewProps) {
  const searchParams = useSearchParams();
  const initialFamily = searchParams.get('family') || 'All';
  const initialSort = searchParams.get('sort') || 'featured';
  const initialQuery = searchParams.get('search') || searchParams.get('q') || '';

  const { products: contextProducts } = useProducts();
  const products = contextProducts && contextProducts.length > 0 ? contextProducts : initialProducts;

  const { t, isRtl } = useLanguage();
  const { openModal } = useCustomRequest();

  // State
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [selectedFamily, setSelectedFamily] = useState(initialFamily);
  const [selectedConcentration, setSelectedConcentration] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const ITEMS_PER_PAGE = 12;

  // Filtering and Sorting
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName =
          product.nameEn.toLowerCase().includes(term) ||
          (product.nameAr && product.nameAr.toLowerCase().includes(term));
        const matchesBrand = product.brand?.toLowerCase().includes(term);
        const matchesInspired = (product.inspiredBy || '').toLowerCase().includes(term);
        const matchesSku = product.variants?.some((v) => v.sku.toLowerCase().includes(term));
        const matchesNotes = [...(product.topNotes || []), ...(product.heartNotes || []), ...(product.baseNotes || [])].some((n) =>
          n.toLowerCase().includes(term)
        );
        const matchesFamily =
          product.fragranceFamily?.toLowerCase().includes(term) ||
          getLocalizedFragranceFamily(product.fragranceFamily || '', true).toLowerCase().includes(term);
        if (!matchesName && !matchesBrand && !matchesInspired && !matchesSku && !matchesNotes && !matchesFamily) return false;
      }

      // Gender filter
      if (selectedGender !== 'ALL') {
        if (selectedGender === 'MEN' && product.gender !== 'MEN') return false;
        if (selectedGender === 'WOMEN' && product.gender !== 'WOMEN') return false;
        if (selectedGender === 'UNISEX' && product.gender !== 'UNISEX') return false;
        if (selectedGender === 'OUD') {
          const isOud =
            product.fragranceFamily.toLowerCase().includes('oud') ||
            product.fragranceFamily.toLowerCase().includes('oriental') ||
            product.nameEn.toLowerCase().includes('oud');
          if (!isOud) return false;
        }
      }

      // Fragrance family
      if (selectedFamily !== 'All' && product.fragranceFamily !== selectedFamily) {
        return false;
      }

      // Concentration
      if (selectedConcentration !== 'All' && product.concentration !== selectedConcentration) {
        return false;
      }

      // Price range
      const defaultPrice = product.variants?.[0]?.regularPriceInPiasters || ((product.variants?.[0]?.regularPriceEgp || 0) * 100);
      if (priceRange === 'under-2000' && defaultPrice > 200000) return false;
      if (priceRange === '2000-3000' && (defaultPrice < 200000 || defaultPrice > 300000)) return false;
      if (priceRange === '3000-4000' && (defaultPrice < 300000 || defaultPrice > 400000)) return false;
      if (priceRange === 'above-4000' && defaultPrice < 400000) return false;

      return true;
    }).sort((a, b) => {
      const priceA = a.variants?.[0]?.regularPriceInPiasters || ((a.variants?.[0]?.regularPriceEgp || 0) * 100);
      const priceB = b.variants?.[0]?.regularPriceInPiasters || ((b.variants?.[0]?.regularPriceEgp || 0) * 100);

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'newest') return a.isNewArrival ? -1 : 1;
      if (sortBy === 'bestselling') return a.isBestseller ? -1 : 1;
      return 0;
    });
  }, [products, searchTerm, selectedGender, selectedFamily, selectedConcentration, priceRange, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGender('ALL');
    setSelectedFamily('All');
    setSelectedConcentration('All');
    setPriceRange('All');
    setSortBy('featured');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedGender !== 'ALL' ||
    selectedFamily !== 'All' ||
    selectedConcentration !== 'All' ||
    priceRange !== 'All' ||
    sortBy !== 'featured';

  return (
    <div className="min-h-screen bg-[#F6F3EC] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="border-b border-[#E7E3D6] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 badge-turquoise px-3 py-1 rounded-sm mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRtl ? 'تركيز 30% Extrait de Parfum • معاينة عند الاستلام' : '30% Extrait de Parfum • White-Glove Inspection'}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#080A0A]">
              {t('catalog.title')}
            </h1>
            <p className="text-xs sm:text-sm text-[#788784] mt-2 max-w-xl">
              {t('catalog.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#0D9488] bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 px-3.5 py-1.5 rounded-full self-start md:self-auto font-bold">
            <span>{isRtl ? `${filteredProducts.length} عطر فاخر متاح` : `${filteredProducts.length} Creations Available`}</span>
          </div>
        </div>

        {/* Gender / Collection Quick Tabs */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 border-b border-[#E7E3D6]/60">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'ALL', labelAr: 'جميع العطور', labelEn: 'All Fragrances' },
              { id: 'MEN', labelAr: 'رجالي ملكي', labelEn: 'Men Selection' },
              { id: 'WOMEN', labelAr: 'نسائي فاخر', labelEn: 'Women Selection' },
              { id: 'UNISEX', labelAr: 'للجنسين (نيش)', labelEn: 'Unisex Niche' },
              { id: 'OUD', labelAr: 'العود والشرقيات', labelEn: 'Royal Oud & Oriental' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedGender(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedGender === tab.id
                    ? 'bg-[#080A0A] text-white shadow-md'
                    : 'bg-white text-[#576563] hover:text-[#080A0A] border border-[#E7E3D6]'
                }`}
              >
                {isRtl ? tab.labelAr : tab.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Bespoke Fragrance Concierge Strip */}
        <div className="bg-[#080A0A] border border-[#54d1b2]/40 rounded-2xl p-4 sm:p-5 text-[#FAF9F5] flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#54d1b2]/20 border border-[#54d1b2]/40 flex items-center justify-center text-[#54d1b2] shrink-0">
              <FlaskConical className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-serif text-white flex items-center gap-2">
                <span>{isRtl ? 'عطرك المفضل غير معروض؟ أو حابب خلطة خاصة؟' : 'Looking for a perfume not listed, or a custom blend?'}</span>
              </h3>
              <p className="text-xs text-[#A2ADA9]">
                {isRtl
                  ? 'اكتب لينا اسم العطر وحجمه وبنوفره ليك بأعلى ثبات وتركيز 30% Extrait de Parfum مع التوصيل والمعاينة.'
                  : 'Tell us the name & size, and our master perfumers will blend and ship it to you at 30% Extrait de Parfum.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => openModal()}
            className="w-full md:w-auto bg-gradient-to-r from-[#00bc7d] to-[#54d1b2] hover:brightness-110 text-[#080A0A] font-extrabold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-md shrink-0 cursor-pointer"
          >
            <FlaskConical className="w-4 h-4" />
            <span>{isRtl ? 'اطلب عطرك الخاص الآن' : 'Request Bespoke Scent'}</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E7E3D6] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t('catalog.search_placeholder')}
              className="w-full bg-[#FAF9F5] border border-[#E7E3D6] rounded-xl px-4 py-2.5 text-xs text-[#080A0A] placeholder-[#788784] focus:outline-none focus:border-[#2DD4BF]"
            />
            <Search className={`w-4 h-4 text-[#788784] absolute top-3 ${isRtl ? 'left-3.5' : 'right-3.5'}`} />
          </div>

          {/* Desktop Filter Selectors */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Family */}
            <select
              value={selectedFamily}
              onChange={(e) => {
                setSelectedFamily(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#FAF9F5] border border-[#E7E3D6] rounded-xl px-3 py-2 text-xs text-[#080A0A] font-bold focus:outline-none focus:border-[#2DD4BF]"
            >
              <option value="All">{t('catalog.filter_family')}: {t('catalog.all')}</option>
              {FRAGRANCE_FAMILIES.map((fam) => (
                <option key={fam} value={fam}>
                  {getLocalizedFragranceFamily(fam, isRtl)}
                </option>
              ))}
            </select>

            {/* Price Range */}
            <select
              value={priceRange}
              onChange={(e) => {
                setPriceRange(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#FAF9F5] border border-[#E7E3D6] rounded-xl px-3 py-2 text-xs text-[#080A0A] font-bold focus:outline-none focus:border-[#2DD4BF]"
            >
              <option value="All">{t('catalog.filter_price')}: {t('catalog.all')}</option>
              <option value="under-2000">{isRtl ? 'أقل من 2,000 ج.م' : 'Under 2,000 EGP'}</option>
              <option value="2000-3000">{isRtl ? '2,000 - 3,000 ج.م' : '2,000 - 3,000 EGP'}</option>
              <option value="3000-4000">{isRtl ? '3,000 - 4,000 ج.م' : '3,000 - 4,000 EGP'}</option>
              <option value="above-4000">{isRtl ? 'أكثر من 4,000 ج.م' : 'Above 4,000 EGP'}</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#FAF9F5] border border-[#E7E3D6] rounded-xl px-3 py-2 text-xs text-[#080A0A] font-bold focus:outline-none focus:border-[#2DD4BF]"
            >
              <option value="featured">{t('catalog.sort')}: {t('catalog.sort_featured')}</option>
              <option value="bestselling">{t('catalog.sort')}: {t('catalog.sort_bestselling')}</option>
              <option value="newest">{t('catalog.sort')}: {t('catalog.sort_newest')}</option>
              <option value="price-asc">{t('catalog.sort')}: {t('catalog.sort_price_low')}</option>
              <option value="price-desc">{t('catalog.sort')}: {t('catalog.sort_price_high')}</option>
            </select>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="flex lg:hidden items-center gap-2 w-full justify-between">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex-1 btn-neutral py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-[#E7E3D6]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{t('catalog.filters')}</span>
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#0D9488]" />}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 bg-[#FAF9F5] border border-[#E7E3D6] rounded-xl px-3 py-2 text-xs text-[#080A0A] font-bold"
            >
              <option value="featured">{t('catalog.sort_featured')}</option>
              <option value="bestselling">{t('catalog.sort_bestselling')}</option>
              <option value="newest">{t('catalog.sort_newest')}</option>
              <option value="price-asc">{t('catalog.sort_price_low')}</option>
              <option value="price-desc">{t('catalog.sort_price_high')}</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#788784] font-bold">{isRtl ? 'التصفيات النشطة:' : 'Active Filters:'}</span>
            {selectedFamily !== 'All' && (
              <span className="inline-flex items-center gap-1 text-xs bg-white border border-[#E7E3D6] px-3 py-1 rounded-full text-[#080A0A]">
                <span>{getLocalizedFragranceFamily(selectedFamily, isRtl)}</span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedFamily('All')} />
              </span>
            )}
            {selectedGender !== 'ALL' && (
              <span className="inline-flex items-center gap-1 text-xs bg-white border border-[#E7E3D6] px-3 py-1 rounded-full text-[#080A0A]">
                <span>{selectedGender}</span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedGender('ALL')} />
              </span>
            )}
            {priceRange !== 'All' && (
              <span className="inline-flex items-center gap-1 text-xs bg-white border border-[#E7E3D6] px-3 py-1 rounded-full text-[#080A0A]">
                <span>{priceRange}</span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange('All')} />
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 text-xs bg-white border border-[#E7E3D6] px-3 py-1 rounded-full text-[#080A0A]">
                <span>&quot;{searchTerm}&quot;</span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm('')} />
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-xs text-rose-600 font-bold hover:underline"
            >
              {t('catalog.clear_filters')}
            </button>
          </div>
        )}

        {/* Product Cards Grid */}
        {paginatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#E7E3D6] p-16 text-center space-y-4 shadow-sm">
            <h3 className="font-serif text-2xl font-bold text-[#080A0A]">
              {isRtl ? 'لم نعثر على عطور تطابق هذا البحث' : 'No Fragrances Found'}
            </h3>
            <p className="text-xs text-[#788784] max-w-md mx-auto">
              {isRtl
                ? 'جرب البحث باسم مكون عطري آخر (مثل: عود، عنبر، لافندر) أو قم بإعادة تعيين خيارات التصفية.'
                : 'Try refining your search keyword or clearing the active filters.'}
            </p>
            <button
              onClick={resetFilters}
              className="btn-turquoise px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              {t('catalog.clear_filters')}
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl border border-[#E7E3D6] bg-white text-xs font-bold text-[#080A0A] disabled:opacity-30 hover:border-[#2DD4BF]"
            >
              {isRtl ? 'السابق' : 'Previous'}
            </button>

            <span className="text-xs font-mono font-bold text-[#0D9488] px-4">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl border border-[#E7E3D6] bg-white text-xs font-bold text-[#080A0A] disabled:opacity-30 hover:border-[#2DD4BF]"
            >
              {isRtl ? 'التالي' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
