'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Trash2,
  Eye,
  Edit3,
  AlertTriangle,
  X,
  CheckCircle2,
  Sparkles,
  Upload,
  Layers,
  Crown,
  Download,
  RefreshCw,
  HardDrive,
} from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { Product } from '@/types';
import { FRAGRANCE_FAMILIES, CONCENTRATIONS, getDemoBottleSvg } from '@/lib/data/products';
import { formatPrice } from '@/lib/currency';
import { compressImageFile } from '@/lib/imageCompression';

export default function AdminProductsPage() {
  const {
    products,
    addProduct,
    editProduct,
    deleteProduct,
    syncWithServer,
    bulkImport,
    exportCatalogJson,
  } = useProducts();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportCatalogJson());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `raheeq-catalog-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setToastMessage('تم تحميل ملف النسخة الاحتياطية لجميع عطور الدار بنجاح ✓');
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const success = await bulkImport(parsed);
        if (success) {
          setToastMessage(`تم استيراد وحفظ ${parsed.length} عطر بنجاح في قاعدة البيانات والسيرفر ✓`);
        } else {
          setToastMessage(`تم استيراد ${parsed.length} عطر محلياً بنجاح ✓`);
        }
      } else {
        alert('الملف لا يحتوي على كتالوج عطور صالح.');
      }
    } catch {
      alert('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية.');
    }
    setTimeout(() => setToastMessage(''), 4000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSyncCloud = async () => {
    setIsSyncing(true);
    setToastMessage('جاري المزامنة مع السيرفر السحابي وقاعدة البيانات...');
    try {
      await syncWithServer();
      setToastMessage('تمت مزامنة جميع العطور مع السيرفر بنجاح ✓');
    } catch {
      setToastMessage('فشلت المزامنة مؤقتاً، تعمل النسخة المحلية بأمان.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  // Form State for Adding New Fragrance
  const [formData, setFormData] = useState({
    nameEn: '',
    nameAr: '',
    brand: 'رحيق (Raheeq)',
    gender: 'UNISEX' as 'MEN' | 'WOMEN' | 'UNISEX',
    fragranceFamily: FRAGRANCE_FAMILIES[0] as string,
    concentration: 'EAU_DE_PARFUM' as string,
    regularPriceEgp: 2500,
    salePriceEgp: '',
    costPriceEgp: 850,
    stockQuantity: 25,
    volumeMl: 100,
    topNotes: 'Bergamot, Saffron, Pink Pepper',
    heartNotes: 'Damask Rose, Oud Wood, Cinnamon',
    baseNotes: 'Ambergris, Sandalwood, Vanilla',
    imageUrl: '',
    descriptionEn: '',
    descriptionAr: '',
  });

  // Form State for Editing Existing Fragrance
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    nameEn: '',
    nameAr: '',
    brand: 'رحيق (Raheeq)',
    gender: 'UNISEX' as 'MEN' | 'WOMEN' | 'UNISEX',
    fragranceFamily: FRAGRANCE_FAMILIES[0] as string,
    concentration: 'EAU_DE_PARFUM' as string,
    regularPriceEgp: 2500,
    salePriceEgp: '',
    costPriceEgp: 850,
    stockQuantity: 25,
    volumeMl: 100,
    topNotes: '',
    heartNotes: '',
    baseNotes: '',
    imageUrl: '',
    descriptionEn: '',
    descriptionAr: '',
  });

  const safeProducts = Array.isArray(products) ? products.filter(Boolean) : [];

  const filtered = safeProducts.filter((product) => {
    if (!product) return false;
    if (selectedFamily !== 'All' && product.fragranceFamily !== selectedFamily) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = product.nameEn?.toLowerCase().includes(term);
      const matchNameAr = product.nameAr?.toLowerCase().includes(term);
      const matchBrand = product.brand?.toLowerCase().includes(term);
      const matchSku = Array.isArray(product.variants) && product.variants.some((v) => v?.sku?.toLowerCase().includes(term));
      if (!matchName && !matchNameAr && !matchBrand && !matchSku) return false;
    }
    return true;
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nameEn.trim()) {
      alert('يرجى إدخال اسم العطر');
      return;
    }

    const finalImage = formData.imageUrl.trim() || getDemoBottleSvg(formData.nameEn, '#66D9C5');

    const created = await addProduct({
      nameEn: formData.nameEn.trim(),
      nameAr: formData.nameAr.trim() || formData.nameEn.trim(),
      brand: formData.brand.trim() || 'رحيق (Raheeq)',
      gender: formData.gender,
      fragranceFamily: formData.fragranceFamily,
      concentration: formData.concentration as any,
      descriptionEn: formData.descriptionEn.trim(),
      descriptionAr: formData.descriptionAr.trim(),
      regularPriceEgp: Number(formData.regularPriceEgp),
      salePriceEgp: formData.salePriceEgp ? Number(formData.salePriceEgp) : undefined,
      costPriceEgp: Number(formData.costPriceEgp),
      stockQuantity: Number(formData.stockQuantity),
      volumeMl: Number(formData.volumeMl),
      topNotes: formData.topNotes.split(',').map((s) => s.trim()).filter(Boolean),
      heartNotes: formData.heartNotes.split(',').map((s) => s.trim()).filter(Boolean),
      baseNotes: formData.baseNotes.split(',').map((s) => s.trim()).filter(Boolean),
      imageUrl: finalImage,
    });

    setIsAddModalOpen(false);
    setToastMessage(`تم حفظ العطر وتثبيته في قاعدة البيانات والسيرفر بنجاح: ${created.nameEn} ✓`);
    setTimeout(() => setToastMessage(''), 3500);

    // Reset Form
    setFormData({
      nameEn: '',
      nameAr: '',
      brand: 'رحيق (Raheeq)',
      gender: 'UNISEX',
      fragranceFamily: FRAGRANCE_FAMILIES[0],
      concentration: 'EAU_DE_PARFUM',
      regularPriceEgp: 2500,
      salePriceEgp: '',
      costPriceEgp: 850,
      stockQuantity: 25,
      volumeMl: 100,
      topNotes: 'Bergamot, Saffron, Pink Pepper',
      heartNotes: 'Damask Rose, Oud Wood, Cinnamon',
      baseNotes: 'Ambergris, Sandalwood, Vanilla',
      imageUrl: '',
      descriptionEn: '',
      descriptionAr: '',
    });
  };

  const handleOpenEditModal = (product: Product) => {
    const defaultVariant = product.variants[0];
    const regularPrice =
      defaultVariant?.regularPriceEgp ??
      (defaultVariant?.regularPriceInPiasters ? Math.round(defaultVariant.regularPriceInPiasters / 100) : 2500);
    const salePrice =
      defaultVariant?.salePriceEgp ??
      (defaultVariant?.salePriceInPiasters ? String(Math.round(defaultVariant.salePriceInPiasters / 100)) : '');
    const costPrice =
      defaultVariant?.costPriceEgp ??
      (defaultVariant?.costPriceInPiasters ? Math.round(defaultVariant.costPriceInPiasters / 100) : 850);
    const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);

    setEditingId(product.id);
    setEditFormData({
      nameEn: product.nameEn,
      nameAr: product.nameAr || product.nameEn,
      brand: product.brand || 'رحيق (Raheeq)',
      gender: product.gender || 'UNISEX',
      fragranceFamily: product.fragranceFamily || FRAGRANCE_FAMILIES[0],
      concentration: product.concentration || 'EAU_DE_PARFUM',
      regularPriceEgp: regularPrice,
      salePriceEgp: salePrice ? String(salePrice) : '',
      costPriceEgp: costPrice,
      stockQuantity: totalStock,
      volumeMl: defaultVariant?.volumeMl || 100,
      topNotes: product.topNotes ? product.topNotes.join(', ') : '',
      heartNotes: product.heartNotes ? product.heartNotes.join(', ') : '',
      baseNotes: product.baseNotes ? product.baseNotes.join(', ') : '',
      imageUrl: product.images?.[0]?.url || product.imageUrl || '',
      descriptionEn: product.descriptionEn || '',
      descriptionAr: product.descriptionAr || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    if (!editFormData.nameEn.trim()) {
      alert('يرجى إدخال اسم العطر');
      return;
    }

    await editProduct(editingId, {
      nameEn: editFormData.nameEn.trim(),
      nameAr: editFormData.nameAr.trim() || editFormData.nameEn.trim(),
      brand: editFormData.brand.trim() || 'رحيق (Raheeq)',
      gender: editFormData.gender,
      fragranceFamily: editFormData.fragranceFamily,
      concentration: editFormData.concentration as any,
      regularPriceEgp: Number(editFormData.regularPriceEgp),
      salePriceEgp: editFormData.salePriceEgp ? Number(editFormData.salePriceEgp) : undefined,
      costPriceEgp: Number(editFormData.costPriceEgp),
      stockQuantity: Number(editFormData.stockQuantity),
      imageUrl: editFormData.imageUrl.trim() || undefined,
      topNotes: editFormData.topNotes.split(',').map((s) => s.trim()).filter(Boolean),
      heartNotes: editFormData.heartNotes.split(',').map((s) => s.trim()).filter(Boolean),
      baseNotes: editFormData.baseNotes.split(',').map((s) => s.trim()).filter(Boolean),
      descriptionEn: editFormData.descriptionEn.trim(),
      descriptionAr: editFormData.descriptionAr.trim(),
    });

    setIsEditModalOpen(false);
    setToastMessage(`تم حفظ وتحديث بيانات العطر في السيرفر بنجاح: ${editFormData.nameEn} ✓`);
    setTimeout(() => setToastMessage(''), 3500);
    setEditingId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    await deleteProduct(id);
    setDeleteConfirmId(null);
    setToastMessage(`تم حذف العطر من السيرفر وقاعدة البيانات: ${name} ✓`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-teal-500 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-teal-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-teal-800 uppercase">
              إدارة عطور الدار والكتالوج الرسمي
            </span>
            <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-bold">
              دار رحيق (RAHEEQ)
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Fragrance Formulations ({products.length} عطر مسجل)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            أضف عطور جديدة، أو عدّل الأسعار والمخزون والصور والنوتات، أو احذف أي عطر ليتم التحديث فوراً في المتجر.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Hidden File Input for Catalog Import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 border border-slate-300 transition-colors cursor-pointer shadow-xs"
            title="استيراد كتالوج محفوظ من ملف JSON"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>استيراد كتالوج</span>
          </button>

          <button
            onClick={handleExportBackup}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 border border-slate-300 transition-colors cursor-pointer shadow-xs"
            title="تصدير وحفظ نسخة احتياطية من كل العطور على جهازك"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>حفظ نسخة احتياطية</span>
          </button>

          <button
            onClick={handleSyncCloud}
            disabled={isSyncing}
            className="bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 border border-teal-300 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            title="مزامنة وتثبيت العطور مع السيرفر السحابي وقاعدة البيانات"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-700 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>مزامنة سحابية</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2 rounded-lg text-xs tracking-wider uppercase flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عطر جديد (Add Fragrance)</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto text-xs">
          <span className="text-slate-500 font-semibold">تصفية حسب العائلة:</span>
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-teal-600"
          >
            <option value="All">All Fragrance Families (جميع العائلات العطرية)</option>
            {FRAGRANCE_FAMILIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث باسم العطر، البراند، أو الكود..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3.5">Perfume & Visual (العطر والصورة)</th>
                <th className="p-3.5">Family & Concentration</th>
                <th className="p-3.5">Variants & SKU</th>
                <th className="p-3.5">Retail Price (سعر البيع)</th>
                <th className="p-3.5">Internal COGS (التكلفة)</th>
                <th className="p-3.5">Stock (المخزون)</th>
                <th className="p-3.5 text-right">Actions (إجراءات وتعديل)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((product) => {
                if (!product) return null;
                const safeVariants = Array.isArray(product.variants) ? product.variants.filter(Boolean) : [];
                const defaultVariant = safeVariants[0];
                const totalStock = safeVariants.reduce((sum, v) => sum + (v?.stockQuantity || 0), 0);
                const isLow = totalStock <= 10;
                return (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img
                        src={product.images?.[0]?.url || product.imageUrl || getDemoBottleSvg(product.nameEn || 'perfume')}
                        alt=""
                        className="w-12 h-14 object-cover bg-slate-900 rounded-lg border border-slate-200 shadow-xs flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-serif font-bold text-slate-900 text-sm">{product.nameEn}</p>
                          {product.nameAr && product.nameAr !== product.nameEn && (
                            <span className="text-xs text-slate-500 font-sans">({product.nameAr})</span>
                          )}
                          {product.brand && (
                            <span className="text-[10px] bg-teal-50 text-teal-800 font-bold px-1.5 py-0.2 rounded border border-teal-200">
                              {product.brand}
                            </span>
                          )}
                          {product.gender && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded">
                              {product.gender}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Slug: {product.slug}</p>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <p className="text-teal-800 font-semibold">{product.fragranceFamily}</p>
                      <p className="text-[10px] text-slate-500">{(product.concentration || 'EXTRAIT').replace(/_/g, ' ')}</p>
                    </td>
                    <td className="p-3.5 text-xs text-slate-700 font-mono">
                      {safeVariants.map((v) => (
                        <p key={v.id || v.sku} className="text-[11px]">
                          {v.volumeMl}ml: <span className="text-teal-700 font-bold">{v.sku}</span>
                        </p>
                      ))}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 text-sm">
                      {formatPrice(
                        defaultVariant?.regularPriceInPiasters ?? ((defaultVariant?.regularPriceEgp ?? 0) * 100)
                      )}
                      {defaultVariant?.salePriceEgp && (
                        <span className="block text-[10px] text-rose-600 font-semibold">
                          خصم: {defaultVariant.salePriceEgp} EGP
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-amber-800 font-semibold bg-amber-50/50 px-2 py-1 rounded">
                      {defaultVariant?.costPriceInPiasters
                        ? formatPrice(defaultVariant.costPriceInPiasters)
                        : defaultVariant?.costPriceEgp
                        ? formatPrice(defaultVariant.costPriceEgp * 100)
                        : 'N/A'}
                    </td>
                    <td className="p-3.5">
                      {isLow ? (
                        <span className="text-amber-700 font-bold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>{totalStock} عبوة متبقية</span>
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {totalStock} متوفر
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1. Edit Button (تعديل العطر) */}
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-1.5 text-teal-700 hover:text-white bg-teal-50 hover:bg-teal-700 rounded-md transition-colors flex items-center gap-1 font-bold text-[11px]"
                          title="تعديل بيانات وسعر وصورة العطر"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>

                        {/* 2. View on Storefront */}
                        <Link
                          href={`/product/${encodeURIComponent(product.slug)}`}
                          target="_blank"
                          className="p-1.5 text-slate-500 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                          title="معاينة صفحة العطر في المتجر"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* 3. Delete Product */}
                        <button
                          onClick={() => setDeleteConfirmId(product.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors"
                          title="حذف العطر"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-sm w-full space-y-4 shadow-2xl text-slate-900">
            <h3 className="font-serif font-bold text-lg text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>تأكيد حذف العطر</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذا العطر من كتالوج المتجر؟ سيتم حذفه فوراً ولن يتمكن العملاء من طلبه.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                إلغاء (Cancel)
              </button>
              <button
                onClick={() => {
                  const target = products.find((p) => p.id === deleteConfirmId);
                  if (target) handleDelete(target.id, target.nameEn);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold"
              >
                تأكيد الحذف (Delete)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Fragrance (تعديل العطر بالكامل) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto my-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل تفاصيل العطر والأسعار والمخزون</span>
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                  {editFormData.nameEn}
                </h2>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-4 text-xs">
              {/* Product Titles: English & Arabic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    اسم العطر بالإنجليزية (Name En) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.nameEn}
                    onChange={(e) => setEditFormData({ ...editFormData, nameEn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">اسم العطر بالعربية (Name Ar)</label>
                  <input
                    type="text"
                    value={editFormData.nameAr}
                    onChange={(e) => setEditFormData({ ...editFormData, nameAr: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-semibold"
                  />
                </div>
              </div>

              {/* Brand & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">الماركة / البراند (Brand)</label>
                  <input
                    type="text"
                    value={editFormData.brand}
                    onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
                    placeholder="مثال: رحيق، Dior، Chanel، Creed"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">الفئة (Gender)</label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-medium"
                  >
                    <option value="UNISEX">للجنسين (Unisex)</option>
                    <option value="MEN">رجالي (Men)</option>
                    <option value="WOMEN">نسائي (Women)</option>
                  </select>
                </div>
              </div>

              {/* Fragrance Family & Concentration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">العائلة العطرية (Fragrance Family)</label>
                  <select
                    value={editFormData.fragranceFamily}
                    onChange={(e) => setEditFormData({ ...editFormData, fragranceFamily: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-medium"
                  >
                    {FRAGRANCE_FAMILIES.map((fam) => (
                      <option key={fam} value={fam}>
                        {fam}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">درجة التركيز (Concentration)</label>
                  <select
                    value={editFormData.concentration}
                    onChange={(e) => setEditFormData({ ...editFormData, concentration: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-medium"
                  >
                    {CONCENTRATIONS.map((c) => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing, Cost & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">سعر البيع (EGP) *</label>
                  <input
                    type="number"
                    required
                    min={50}
                    value={editFormData.regularPriceEgp}
                    onChange={(e) => setEditFormData({ ...editFormData, regularPriceEgp: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-600"
                  />
                  <span className="text-[10px] text-slate-500">السعر الأساسي</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-rose-700 block">سعر الخصم (Sale EGP)</label>
                  <input
                    type="number"
                    min={0}
                    value={editFormData.salePriceEgp}
                    onChange={(e) => setEditFormData({ ...editFormData, salePriceEgp: e.target.value })}
                    placeholder="اختياري"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-rose-700 font-bold focus:outline-none focus:border-teal-600"
                  />
                  <span className="text-[10px] text-slate-500">اتركه فارغ إذا لا يوجد</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-amber-900 block">التكلفة COGS (سري)</label>
                  <input
                    type="number"
                    min={0}
                    value={editFormData.costPriceEgp}
                    onChange={(e) => setEditFormData({ ...editFormData, costPriceEgp: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-600"
                  />
                  <span className="text-[10px] text-amber-800">حساب صافي الأرباح</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">المخزون (Bottles) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editFormData.stockQuantity}
                    onChange={(e) => setEditFormData({ ...editFormData, stockQuantity: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-600"
                  />
                  <span className="text-[10px] text-slate-500">الكمية المتوفرة</span>
                </div>
              </div>

              {/* Image URL & File Upload */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  صورة العطر (Product Image) — يمكنك رفع صورة جديدة من جهازك مباشرة
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={editFormData.imageUrl}
                    onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                    placeholder="رابط الصورة أو اختر من جهازك..."
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                  <label className="cursor-pointer bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors flex-shrink-0">
                    <Upload className="w-3.5 h-3.5 text-teal-700" />
                    <span>رفع من جهازك</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressImageFile(file);
                            setEditFormData({ ...editFormData, imageUrl: compressed });
                          } catch {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setEditFormData({ ...editFormData, imageUrl: event.target.result as string });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                {editFormData.imageUrl && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <img
                      src={editFormData.imageUrl}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded-md border border-slate-300"
                    />
                    <span className="text-[11px] text-teal-800 font-bold">معاينة الصورة المعدلة</span>
                  </div>
                )}
              </div>

              {/* Scent Notes */}
              <div className="space-y-3 p-4 bg-teal-50/50 rounded-xl border border-teal-200">
                <h4 className="font-serif font-bold text-teal-900 text-xs">الهرم العطري والنوتات:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Top Notes (الافتتاحية)</label>
                    <input
                      type="text"
                      value={editFormData.topNotes}
                      onChange={(e) => setEditFormData({ ...editFormData, topNotes: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Heart Notes (القلب)</label>
                    <input
                      type="text"
                      value={editFormData.heartNotes}
                      onChange={(e) => setEditFormData({ ...editFormData, heartNotes: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Base Notes (القاعدة)</label>
                    <input
                      type="text"
                      value={editFormData.baseNotes}
                      onChange={(e) => setEditFormData({ ...editFormData, baseNotes: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">الوصف بالإنجليزية (Description En)</label>
                  <textarea
                    rows={2}
                    value={editFormData.descriptionEn}
                    onChange={(e) => setEditFormData({ ...editFormData, descriptionEn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">الوصف بالعربية (Description Ar)</label>
                  <textarea
                    rows={2}
                    value={editFormData.descriptionAr}
                    onChange={(e) => setEditFormData({ ...editFormData, descriptionAr: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ التعديلات فوراً</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Fragrance (إضافة عطر جديد) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto my-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800">
                  New Fragrance Creator
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                  إضافة عطر جديد إلى دار رحيق (RAHEEQ)
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              {/* Product Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    اسم العطر بالإنجليزية (Name En) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="e.g. Raheeq — Royal Blue Oud"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">اسم العطر بالعربية (Name Ar)</label>
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder="مثال: رحيق — رويال بلو عود"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-semibold"
                  />
                </div>
              </div>

              {/* Brand & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">الماركة / البراند</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="رحيق (Raheeq)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">الفئة (Gender)</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-medium"
                  >
                    <option value="UNISEX">للجنسين (Unisex)</option>
                    <option value="MEN">رجالي (Men)</option>
                    <option value="WOMEN">نسائي (Women)</option>
                  </select>
                </div>
              </div>

              {/* Fragrance Family & Concentration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">العائلة العطرية (Fragrance Family)</label>
                  <select
                    value={formData.fragranceFamily}
                    onChange={(e) => setFormData({ ...formData, fragranceFamily: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-medium"
                  >
                    {FRAGRANCE_FAMILIES.map((fam) => (
                      <option key={fam} value={fam}>
                        {fam}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">درجة التركيز (Concentration)</label>
                  <select
                    value={formData.concentration}
                    onChange={(e) => setFormData({ ...formData, concentration: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-medium"
                  >
                    {CONCENTRATIONS.map((c) => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing, Cost & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">سعر البيع (EGP) *</label>
                  <input
                    type="number"
                    required
                    min={50}
                    value={formData.regularPriceEgp}
                    onChange={(e) => setFormData({ ...formData, regularPriceEgp: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-600"
                  />
                  <span className="text-[10px] text-slate-500">جنيه مصري</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-rose-700 block">سعر الخصم (اختياري)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.salePriceEgp}
                    onChange={(e) => setFormData({ ...formData, salePriceEgp: e.target.value })}
                    placeholder="اختياري"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-rose-700 font-bold focus:outline-none focus:border-teal-600"
                  />
                  <span className="text-[10px] text-slate-500">EGP Sale</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-amber-900 block">التكلفة COGS (سري)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.costPriceEgp}
                    onChange={(e) => setFormData({ ...formData, costPriceEgp: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-600"
                  />
                  <span className="text-[10px] text-amber-800">حساب الأرباح</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">المخزون (Bottles) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-600"
                  />
                  <span className="text-[10px] text-slate-500">حجم 100 مل</span>
                </div>
              </div>

              {/* Image URL & File Upload */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  صورة العطر (Product Image) — يمكنك رفع صورة من جهازك أو وضع رابط
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="ضع رابط الصورة هنا أو اضغط زر الرفع من جهازك..."
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                  <label className="cursor-pointer bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors flex-shrink-0">
                    <Upload className="w-3.5 h-3.5 text-teal-700" />
                    <span>اختر من جهازك</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressImageFile(file);
                            setFormData({ ...formData, imageUrl: compressed });
                          } catch {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setFormData({ ...formData, imageUrl: event.target.result as string });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                {formData.imageUrl && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <img
                      src={formData.imageUrl}
                      alt="Product Preview"
                      className="w-12 h-12 object-cover rounded-md border border-slate-300"
                    />
                    <span className="text-[11px] text-teal-800 font-bold">تم تجهيز ومعاينة صورة العطر بنجاح</span>
                  </div>
                )}
              </div>

              {/* Scent Notes Pyramid */}
              <div className="space-y-3 p-4 bg-teal-50/50 rounded-xl border border-teal-200">
                <h4 className="font-serif font-bold text-teal-900 text-xs">الهرم العطري والنوتات:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Top Notes (الافتتاحية)</label>
                    <input
                      type="text"
                      value={formData.topNotes}
                      onChange={(e) => setFormData({ ...formData, topNotes: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Heart Notes (القلب)</label>
                    <input
                      type="text"
                      value={formData.heartNotes}
                      onChange={(e) => setFormData({ ...formData, heartNotes: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Base Notes (القاعدة)</label>
                    <input
                      type="text"
                      value={formData.baseNotes}
                      onChange={(e) => setFormData({ ...formData, baseNotes: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">وصف العطر بالإنجليزية (Description En)</label>
                  <textarea
                    rows={2}
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    placeholder="An opulent bespoke creation by Raheeq..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">وصف العطر بالعربية (Description Ar)</label>
                  <textarea
                    rows={2}
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    placeholder="تحفة عطرية استثنائية من دار رحيق للعطور..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>حفظ ونشر العطر بالمتجر فوراً</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
