'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, ArrowUpDown, Sparkles, Filter, FlaskConical, Send } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCustomRequest } from '@/context/CustomRequestContext';
import { FRAGRANCE_FAMILIES, CONCENTRATIONS } from '@/lib/data/products';
import { ProductCard } from '@/components/ProductCard';
import {
  getLocalizedFragranceFamily,
  getLocalizedConcentration,
} from '@/lib/fragrance-translations';

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialFamily = searchParams.get('family') || 'All';
  const initialSort = searchParams.get('sort') || 'featured';

  const { products } = useProducts();
  const { t, isRtl } = useLanguage();
  const { openModal } = useCustomRequest();

  // State
  const [searchTerm, setSearchTerm] = useState('');
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
        const matchesSku = product.variants.some((v) => v.sku.toLowerCase().includes(term));
        const matchesNotes = [...product.topNotes, ...product.heartNotes, ...product.baseNotes].some((n) =>
          n.toLowerCase().includes(term)
        );
        const matchesFamily =
          product.fragranceFamily.toLowerCase().includes(term) ||
          getLocalizedFragranceFamily(product.fragranceFamily, true).toLowerCase().includes(term);
        if (!matchesName && !matchesBrand && !matchesSku && !matchesNotes && !matchesFamily) return false;
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
      const defaultPrice = product.variants[0]?.regularPriceInPiasters || 0;
      if (priceRange === 'under-2000' && defaultPrice > 200000) return false;
      if (priceRange === '2000-3000' && (defaultPrice < 200000 || defaultPrice > 300000)) return false;
      if (priceRange === '3000-4000' && (defaultPrice < 300000 || defaultPrice > 400000)) return false;
      if (priceRange === 'above-4000' && defaultPrice < 400000) return false;

      return true;
    }).sort((a, b) => {
      const priceA = a.variants[0]?.regularPriceInPiasters || 0;
      const priceB = b.variants[0]?.regularPriceInPiasters || 0;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'newest') return a.isNewArrival ? -1 : 1;
      if (sortBy === 'bestselling') return a.isBestseller ? -1 : 1;
      return 0;
    });
  }, [products, searchTerm, selectedGender, selectedFamily, selectedConcentration, priceRange, sortBy]);

  // Pagination calculation
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

  return (
    <div className="min-h-screen bg-[#F7F5EE] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Catalog Editorial Header (Chanel Style) */}
        <div className="border-b border-[#E7E3D6] pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 badge-turquoise px-3 py-1 rounded-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isRtl ? 'المجموعة الدائمة والأرشيف العطري' : 'The Permanent Collection'}</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#080A0A] mt-2.5">
                {t('catalog.title')}
              </h1>
              <p className="text-sm text-[#4A5553] mt-1.5 max-w-2xl leading-relaxed">
                {t('catalog.subtitle')}
              </p>
            </div>

            {/* Quick Metrics Tag */}
            <div className="flex items-center gap-2 text-xs text-[#0D9488] bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 px-3.5 py-1.5 rounded-full self-start md:self-auto font-bold font-mono">
              <span>{filteredProducts.length}</span>
              <span className="font-sans font-normal text-[#4A5553]">{isRtl ? 'إبداع عطري متوفر' : 'creations available'}</span>
            </div>
          </div>

          {/* Category / Gender Selection Tabs */}
          <div className="pt-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'ALL', labelAr: 'الكل (50 عطر جاهز)', labelEn: 'All 50 Fragrances' },
              { id: 'MEN', labelAr: 'رجالي (Men)', labelEn: "Men's Icons" },
              { id: 'WOMEN', labelAr: 'نسائي (Women)', labelEn: "Women's Icons" },
              { id: 'UNISEX', labelAr: 'يونيسكس ونيش (Niche)', labelEn: 'Unisex & Niche' },
              { id: 'OUD', labelAr: 'عود وشرقيات (Oud)', labelEn: 'Oud & Orientals' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedGender(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedGender === tab.id
                    ? 'bg-[#080A0A] text-[#54d1b2] border border-[#54d1b2] shadow-md'
                    : 'bg-white text-[#4A5553] hover:text-[#080A0A] border border-[#E7E3D6]'
                }`}
              >
                {isRtl ? tab.labelAr : tab.labelEn}
              </button>
            ))}
          </div>

          {/* Smooth Horizontal Family Scroll Chips */}
          <div className="pt-3 flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => {
                setSelectedFamily('All');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedFamily === 'All'
                  ? 'bg-teal-900 text-teal-100 font-bold'
                  : 'bg-white/80 text-[#788784] hover:text-[#080A0A] border border-[#E7E3D6]'
              }`}
            >
              {isRtl ? 'جميع العائلات' : 'All Families'}
            </button>
            {FRAGRANCE_FAMILIES.map((family) => (
              <button
                key={family}
                onClick={() => {
                  setSelectedFamily(family);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedFamily === family
                    ? 'bg-teal-900 text-teal-100 font-bold'
                    : 'bg-white/80 text-[#788784] hover:text-[#080A0A] border border-[#E7E3D6]'
                }`}
              >
                {getLocalizedFragranceFamily(family, isRtl)}
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
                  ? 'اكتب لينا اسم العطر وحجمه وبنوفره ليك بأعلى ثبات وتركيز 35% Extrait de Parfum مع التوصيل والمعاينة.'
                  : 'Tell us the name & size, and our master perfumers will blend and ship it to you.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => openModal()}
            className="w-full md:w-auto bg-gradient-to-r from-[#00bc7d] to-[#54d1b2] hover:brightness-110 text-[#080A0A] font-extrabold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-md shrink-0"
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
              className="w-full bg-[#FAF9F5] border border-[#E7E3D6] focus:border-[#2DD4BF] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#080A0A] placeholder-[#788784] focus:outline-none transition-colors"
            />
            <Search className="w-4 h-4 text-[#788784] absolute left-3 top-3" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-[#788784] hover:text-[#080A0A]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Desktop Filter Pickers */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Concentration */}
            <select
              value={selectedConcentration}
              onChange={(e) => {
                setSelectedConcentration(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#FAF9F5] border border-[#E7E3D6] hover:border-[#2DD4BF] text-[#080A0A] text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#2DD4BF] cursor-pointer"
            >
              <option value="All">{isRtl ? 'جميع درجات التركيز' : 'All Concentrations'}</option>
              {CONCENTRATIONS.map((c) => (
                <option key={c} value={c}>{getLocalizedConcentration(c, isRtl)}</option>
              ))}
            </select>

            {/* Price Range */}
            <select
              value={priceRange}
              onChange={(e) => {
                setPriceRange(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#FAF9F5] border border-[#E7E3D6] hover:border-[#2DD4BF] text-[#080A0A] text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#2DD4BF] cursor-pointer"
            >
              <option value="All">{isRtl ? 'نطاق السعر (بالجنيه)' : 'All Price Ranges'}</option>
              <option value="under-2000">{isRtl ? 'أقل من 2,000 ج.م' : 'Under 2,000 EGP'}</option>
              <option value="2000-3000">{isRtl ? '2,000 – 3,000 ج.م' : '2,000 – 3,000 EGP'}</option>
              <option value="3000-4000">{isRtl ? '3,000 – 4,000 ج.م' : '3,000 – 4,000 EGP'}</option>
              <option value="above-4000">{isRtl ? 'أكثر من 4,000 ج.م' : 'Above 4,000 EGP'}</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#FAF9F5] border border-[#E7E3D6] hover:border-[#2DD4BF] text-[#080A0A] text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#2DD4BF] cursor-pointer"
            >
              <option value="featured">{t('catalog.sort_featured')}</option>
              <option value="bestselling">{t('catalog.sort_bestselling')}</option>
              <option value="newest">{t('catalog.sort_newest')}</option>
              <option value="price-asc">{t('catalog.sort_price_low')}</option>
              <option value="price-desc">{t('catalog.sort_price_high')}</option>
            </select>

            {(searchTerm || selectedFamily !== 'All' || selectedConcentration !== 'All' || priceRange !== 'All' || sortBy !== 'featured') && (
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 underline"
              >
                {t('catalog.clear_filters')}
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle */}
          <div className="flex lg:hidden w-full items-center justify-between gap-3 pt-2 sm:pt-0">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex-1 btn-secondary py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4 text-[#2DD4BF]" />
              <span>{isRtl ? 'تصفية وترتيب العطور' : 'Filter & Sort'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Filters Modal */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-xs bg-[#F7F5EE] h-full p-6 space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#E7E3D6] pb-4">
                <h3 className="font-serif text-lg font-bold text-[#080A0A]">{isRtl ? 'خيارات الفلترة' : 'Filters'}</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="text-[#4A5553] p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#080A0A] block mb-2">{isRtl ? 'الترتيب حسب:' : 'Sort By:'}</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-white border border-[#E7E3D6] rounded-xl p-3 text-xs"
                  >
                    <option value="featured">{t('catalog.sort_featured')}</option>
                    <option value="bestselling">{t('catalog.sort_bestselling')}</option>
                    <option value="newest">{t('catalog.sort_newest')}</option>
                    <option value="price-asc">{t('catalog.sort_price_low')}</option>
                    <option value="price-desc">{t('catalog.sort_price_high')}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#080A0A] block mb-2">{isRtl ? 'درجة التركيز:' : 'Concentration:'}</label>
                  <select
                    value={selectedConcentration}
                    onChange={(e) => setSelectedConcentration(e.target.value)}
                    className="w-full bg-white border border-[#E7E3D6] rounded-xl p-3 text-xs"
                  >
                    <option value="All">{isRtl ? 'جميع التركيزات' : 'All'}</option>
                    {CONCENTRATIONS.map((c) => (
                      <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#080A0A] block mb-2">{isRtl ? 'نطاق السعر:' : 'Price Range:'}</label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full bg-white border border-[#E7E3D6] rounded-xl p-3 text-xs"
                  >
                    <option value="All">{isRtl ? 'الكل' : 'All'}</option>
                    <option value="under-2000">{isRtl ? 'أقل من 2,000 ج.م' : 'Under 2,000 EGP'}</option>
                    <option value="2000-3000">{isRtl ? '2,000 – 3,000 ج.م' : '2,000 – 3,000 EGP'}</option>
                    <option value="3000-4000">{isRtl ? '3,000 – 4,000 ج.م' : '3,000 – 4,000 EGP'}</option>
                    <option value="above-4000">{isRtl ? 'أكثر من 4,000 ج.م' : 'Above 4,000 EGP'}</option>
                  </select>
                </div>

                <div className="pt-4 flex flex-col gap-2">
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="btn-turquoise w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    {isRtl ? 'تطبيق الفلترة' : 'Apply Filters'}
                  </button>
                  <button
                    onClick={() => {
                      resetFilters();
                      setMobileFiltersOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl text-xs text-rose-600 font-bold"
                  >
                    {t('catalog.clear_filters')}
                  </button>
                </div>
              </div>
            </div>
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

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-[#788784]">Loading Collection...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
