'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Trash2,
  Eye,
  AlertTriangle,
  X,
  CheckCircle2,
  Sparkles,
  Upload,
  Layers,
} from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { FRAGRANCE_FAMILIES, CONCENTRATIONS, getDemoBottleSvg } from '@/lib/data/products';
import { formatPrice } from '@/lib/currency';

export default function AdminProductsPage() {
  const { products, addProduct, deleteProduct } = useProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form State for Adding New Fragrance
  const [formData, setFormData] = useState({
    nameEn: '',
    fragranceFamily: FRAGRANCE_FAMILIES[0],
    concentration: 'EAU_DE_PARFUM',
    regularPriceEgp: 2500,
    costPriceEgp: 850,
    stockQuantity: 25,
    volumeMl: 100,
    topNotes: 'Bergamot, Saffron, Pink Pepper',
    heartNotes: 'Damask Rose, Oud Wood, Cinnamon',
    baseNotes: 'Ambergris, Sandalwood, Vanilla',
    imageUrl: '',
    descriptionEn: '',
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = products.filter((product) => {
    if (selectedFamily !== 'All' && product.fragranceFamily !== selectedFamily) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = product.nameEn.toLowerCase().includes(term);
      const matchSku = product.variants.some((v) => v.sku.toLowerCase().includes(term));
      if (!matchName && !matchSku) return false;
    }
    return true;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nameEn.trim()) {
      alert('Please enter a fragrance title');
      return;
    }

    const finalImage = formData.imageUrl.trim() || getDemoBottleSvg(formData.nameEn, '#66D9C5');

    const created = addProduct({
      nameEn: formData.nameEn.trim(),
      fragranceFamily: formData.fragranceFamily,
      concentration: formData.concentration as any,
      descriptionEn: formData.descriptionEn.trim(),
      regularPriceEgp: Number(formData.regularPriceEgp),
      costPriceEgp: Number(formData.costPriceEgp),
      stockQuantity: Number(formData.stockQuantity),
      volumeMl: Number(formData.volumeMl),
      topNotes: formData.topNotes.split(',').map((s) => s.trim()).filter(Boolean),
      heartNotes: formData.heartNotes.split(',').map((s) => s.trim()).filter(Boolean),
      baseNotes: formData.baseNotes.split(',').map((s) => s.trim()).filter(Boolean),
      imageUrl: finalImage,
    });

    setIsAddModalOpen(false);
    setToastMessage(`تم إضافة العطر بنجاح: ${created.nameEn}`);
    setTimeout(() => setToastMessage(''), 3500);

    // Reset Form
    setFormData({
      nameEn: '',
      fragranceFamily: FRAGRANCE_FAMILIES[0],
      concentration: 'EAU_DE_PARFUM',
      regularPriceEgp: 2500,
      costPriceEgp: 850,
      stockQuantity: 25,
      volumeMl: 100,
      topNotes: 'Bergamot, Saffron, Pink Pepper',
      heartNotes: 'Damask Rose, Oud Wood, Cinnamon',
      baseNotes: 'Ambergris, Sandalwood, Vanilla',
      imageUrl: '',
      descriptionEn: '',
    });
  };

  const handleDelete = (id: string, name: string) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
    setToastMessage(`تم حذف العطر: ${name}`);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold tracking-wider text-teal-800 uppercase">
            إدارة عطور الدار والتركيبات الحصرية
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Fragrance Formulations ({products.length} Products)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            أضف عطور جديدة بصورها وتفاصيلها، أو احذف أي عطر ليتم تحديث الموقع والمتجر فوراً.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs tracking-wider uppercase flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة عطر جديد (Add Fragrance)</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto text-xs">
          <span className="text-slate-500 font-semibold">Filter Family:</span>
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-teal-600"
          >
            <option value="All">All Fragrance Families (جميع العائلات)</option>
            {FRAGRANCE_FAMILIES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by perfume name or SKU..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3.5">Perfume & Visual</th>
                <th className="p-3.5">Family & Concentration</th>
                <th className="p-3.5">Variants & SKU</th>
                <th className="p-3.5">Retail Price (EGP)</th>
                <th className="p-3.5">Internal COGS (سري)</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5 text-right">Actions (إجراءات)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((product) => {
                const defaultVariant = product.variants[0];
                const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
                const isLow = totalStock <= 10;
                return (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img
                        src={product.images[0]?.url}
                        alt=""
                        className="w-11 h-14 object-cover bg-slate-900 rounded-lg border border-slate-200 shadow-sm flex-shrink-0"
                      />
                      <div>
                        <p className="font-serif font-bold text-slate-900 text-sm">{product.nameEn}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {product.id}</p>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <p className="text-teal-800 font-semibold">{product.fragranceFamily}</p>
                      <p className="text-[10px] text-slate-500">{product.concentration.replace(/_/g, ' ')}</p>
                    </td>
                    <td className="p-3.5 text-xs text-slate-700 font-mono">
                      {product.variants.map((v) => (
                        <p key={v.id} className="text-[11px]">
                          {v.volumeMl}ml: <span className="text-teal-700 font-bold">{v.sku}</span>
                        </p>
                      ))}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 text-sm">
                      {formatPrice(defaultVariant.regularPriceInPiasters)}
                    </td>
                    <td className="p-3.5 font-mono text-amber-800 font-semibold bg-amber-50/50 px-2 py-1 rounded">
                      {defaultVariant.costPriceInPiasters ? formatPrice(defaultVariant.costPriceInPiasters) : 'N/A'}
                    </td>
                    <td className="p-3.5">
                      {isLow ? (
                        <span className="text-amber-700 font-bold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>{totalStock} bottles</span>
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {totalStock} in stock
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/product/${product.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-500 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                          title="View on Storefront"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => setDeleteConfirmId(product.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors"
                          title="Delete Product"
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

      {/* Modal: Add New Fragrance (إضافة عطر جديد مع الصور والتفاصيل) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto my-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800">
                  New Formulation Creator
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                  إضافة عطر جديد إلى دار A AND S
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
              
              {/* Product Title */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  اسم العطر الفاخر (Perfume Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="e.g. A AND S — Imperial Royal Amber"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-semibold"
                />
              </div>

              {/* Fragrance Family & Concentration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">العائلة العطرية (Fragrance Family)</label>
                  <select
                    value={formData.fragranceFamily}
                    onChange={(e) => setFormData({ ...formData, fragranceFamily: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-medium"
                  >
                    {FRAGRANCE_FAMILIES.map((fam) => (
                      <option key={fam} value={fam}>{fam}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">درجة التركيز (Concentration)</label>
                  <select
                    value={formData.concentration}
                    onChange={(e) => setFormData({ ...formData, concentration: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-medium"
                  >
                    {CONCENTRATIONS.map((c) => (
                      <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Costs (E1) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">سعر البيع (EGP Retail Price) *</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={formData.regularPriceEgp}
                    onChange={(e) => setFormData({ ...formData, regularPriceEgp: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-600"
                  />
                  <span className="text-[10px] text-slate-500">جنيه مصري</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-amber-900 block">التكلفة الباطنية COGS (سري)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.costPriceEgp}
                    onChange={(e) => setFormData({ ...formData, costPriceEgp: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-600"
                  />
                  <span className="text-[10px] text-amber-800">لحساب صافي الربح الحقيقي</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">المخزون الأولي (Bottles) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-600"
                  />
                  <span className="text-[10px] text-slate-500">حجم العبوة: 100 مل</span>
                </div>
              </div>

              {/* Image URL with live preview */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  رابط صورة العطر (Image URL) <span className="text-slate-400 font-normal">(اتركه فارغاً لتوليد صورة زجاجة فاخرة تلقائياً)</span>
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/perfume-photo.jpg (أو اترك فارغاً للتوليد الفاخر)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                />
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

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">وصف العطر وإيحاء الرائحة (Description)</label>
                <textarea
                  rows={2}
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  placeholder="اكتب وصفاً شاعرياً يعبر عن حضور العطر وفوحانه..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                />
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
