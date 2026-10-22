'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, ArrowUpDown, Sparkles } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { useLanguage } from '@/context/LanguageContext';
import { FRAGRANCE_FAMILIES, CONCENTRATIONS } from '@/lib/data/products';
import { ProductCard } from '@/components/ProductCard';

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialFamily = searchParams.get('family') || 'All';
  const initialSort = searchParams.get('sort') || 'featured';

  const { products } = useProducts();
  const { t, isRtl } = useLanguage();

  // State
  const [searchTerm, setSearchTerm] = useState('');
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
        const matchesName = product.nameEn.toLowerCase().includes(term);
        const matchesSku = product.variants.some((v) => v.sku.toLowerCase().includes(term));
        const matchesNotes = [...product.topNotes, ...product.heartNotes, ...product.baseNotes].some((n) =>
          n.toLowerCase().includes(term)
        );
        const matchesFamily = product.fragranceFamily.toLowerCase().includes(term);
        if (!matchesName && !matchesSku && !matchesNotes && !matchesFamily) return false;
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
  }, [products, searchTerm, selectedFamily, selectedConcentration, priceRange, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedFamily('All');
    setSelectedConcentration('All');
    setPriceRange('All');
    setSortBy('featured');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Catalog Header */}
      <div className="border-b border-[#1A2624] pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-[0.25em] text-[#C6A66B] uppercase">
              {isRtl ? 'المجموعة الدائمة والأرشيف العطري' : 'The Permanent Collection'}
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#F5F2EB] mt-1">
              {isRtl ? 'جميع العطور الملكية' : 'All Fragrances'}
            </h1>
            <p className="text-sm text-[#9EABA7] mt-1">
              {isRtl
                ? `عرض ${filteredProducts.length} عطر فاخر من إجمالي ${products.length} تركيبة في معمل القاهرة.`
                : `Showing ${filteredProducts.length} curated creations out of ${products.length} bespoke perfumes.`}
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className={`w-4 h-4 text-[#9EABA7] absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t('nav.search_placeholder')}
              className={`w-full bg-[#111716] border border-[#1A2624] rounded-lg ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-xs text-[#F5F2EB] placeholder-[#6C7A77] focus:outline-none focus:border-[#66D9C5] transition-colors`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-[#6C7A77] hover:text-[#F5F2EB]`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0E1212] p-4 rounded-lg border border-[#1A2624]">
        {/* Mobile filter toggle */}
        <div className="flex items-center justify-between lg:hidden">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="btn-secondary px-3.5 py-2 rounded text-xs flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#66D9C5]" />
            <span>{isRtl ? `فلترة العطور (${filteredProducts.length})` : `Filter Catalog (${filteredProducts.length})`}</span>
          </button>

          <span className="text-xs text-[#9EABA7]">
            {isRtl ? `صفحة ${currentPage} من ${totalPages || 1}` : `Page ${currentPage} of ${totalPages || 1}`}
          </span>
        </div>

        {/* Desktop Filter Pills */}
        <div className="hidden lg:flex items-center gap-3 flex-wrap">
          {/* Fragrance Family Select */}
          <select
            value={selectedFamily}
            onChange={(e) => {
              setSelectedFamily(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#111716] border border-[#1A2624] rounded px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none focus:border-[#66D9C5]"
          >
            <option value="All">{isRtl ? 'جميع العائلات العطرية' : 'All Fragrance Families'}</option>
            {FRAGRANCE_FAMILIES.map((fam) => (
              <option key={fam} value={fam}>{fam}</option>
            ))}
          </select>

          {/* Concentration Select */}
          <select
            value={selectedConcentration}
            onChange={(e) => {
              setSelectedConcentration(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#111716] border border-[#1A2624] rounded px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none focus:border-[#66D9C5]"
          >
            <option value="All">{isRtl ? 'جميع التركيزات' : 'All Concentrations'}</option>
            {CONCENTRATIONS.map((c) => (
              <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
            ))}
          </select>

          {/* Price Range Select */}
          <select
            value={priceRange}
            onChange={(e) => {
              setPriceRange(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#111716] border border-[#1A2624] rounded px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none focus:border-[#66D9C5]"
          >
            <option value="All">{isRtl ? 'جميع الأسعار (جنيه مصري)' : 'All Prices (EGP)'}</option>
            <option value="under-2000">{isRtl ? 'أقل من 2,000 ج.م' : 'Under 2,000 EGP'}</option>
            <option value="2000-3000">{isRtl ? '2,000 – 3,000 ج.م' : '2,000 – 3,000 EGP'}</option>
            <option value="3000-4000">{isRtl ? '3,000 – 4,000 ج.م' : '3,000 – 4,000 EGP'}</option>
            <option value="above-4000">{isRtl ? 'أكثر من 4,000 ج.م' : 'Above 4,000 EGP'}</option>
          </select>

          {(selectedFamily !== 'All' || selectedConcentration !== 'All' || priceRange !== 'All' || searchTerm) && (
            <button
              onClick={resetFilters}
              className="text-xs text-[#66D9C5] hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isRtl ? 'إعادة ضبط' : 'Reset'}</span>
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#9EABA7]" />
          <span className="text-xs text-[#9EABA7]">{isRtl ? 'الترتيب حسب:' : 'Sort By:'}</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#111716] border border-[#1A2624] rounded px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none focus:border-[#66D9C5]"
          >
            <option value="featured">{isRtl ? 'المميزة والمختارة' : 'Featured Masterpieces'}</option>
            <option value="bestselling">{isRtl ? 'الأكثر طلباً' : 'Bestsellers'}</option>
            <option value="newest">{isRtl ? 'أحدث الإصدارات' : 'Newest Releases'}</option>
            <option value="price-asc">{isRtl ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
            <option value="price-desc">{isRtl ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {paginatedProducts.length === 0 ? (
        <div className="py-24 text-center space-y-4 bg-[#0E1212] rounded-xl border border-[#1A2624]">
          <div className="w-16 h-16 rounded-full bg-[#141A19] flex items-center justify-center mx-auto text-[#66D9C5]/50 border border-[#1A2624]">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#F5F2EB]">
            {isRtl ? 'لم يتم العثور على عطور تطابق بحثك' : 'No fragrances matched your selection'}
          </h3>
          <p className="text-xs text-[#9EABA7] max-w-md mx-auto">
            {isRtl ? 'جرّب تعديل كلمات البحث أو تصفية العائلات لعرض جميع العطور.' : 'Try adjusting your search query, changing fragrance families, or resetting filters.'}
          </p>
          <button
            onClick={resetFilters}
            className="btn-primary text-xs py-2.5 px-6 rounded font-semibold uppercase tracking-wider"
          >
            {isRtl ? 'عرض جميع العطور' : 'Show All Fragrances'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination Controller */}
      {totalPages > 1 && (
        <div className="pt-8 border-t border-[#1A2624] flex items-center justify-between">
          <span className="text-xs text-[#9EABA7]">
            {isRtl
              ? `عرض ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} من إجمالي ${filteredProducts.length} عطر`
              : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of ${filteredProducts.length} fragrances`}
          </span>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded text-xs border border-[#1A2624] text-[#F5F2EB] hover:border-[#66D9C5] disabled:opacity-40 disabled:pointer-events-none"
            >
              {isRtl ? 'السابق' : 'Previous'}
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded text-xs font-semibold transition-colors ${
                  currentPage === page
                    ? 'bg-[#66D9C5] text-[#080A0A]'
                    : 'text-[#D5D1C7] hover:bg-[#141A19] border border-[#1A2624]'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded text-xs border border-[#1A2624] text-[#F5F2EB] hover:border-[#66D9C5] disabled:opacity-40 disabled:pointer-events-none"
            >
              {isRtl ? 'التالي' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-[#9EABA7]">Loading luxury catalogue...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
