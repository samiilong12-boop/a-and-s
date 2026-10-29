import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { Product } from '@/types';
import { FAMOUS_50_PERFUMES } from '@/lib/data/products';
import { verifyAdminSession } from '@/lib/serverAuth';
import { prisma, isDatabaseConnected } from '@/lib/prisma';

// Global memory container for serverless runtime continuity
declare global {
  var __PRODUCTS_CATALOG__: Product[] | undefined;
}

const tmpFilePath = path.join(os.tmpdir(), 'raheeq-products.json');
const publicFilePath = path.join(process.cwd(), 'public', 'data', 'products.json');

function loadPersistedProducts(): Product[] {
  // 1. In-memory hot cache
  if (globalThis.__PRODUCTS_CATALOG__ && Array.isArray(globalThis.__PRODUCTS_CATALOG__) && globalThis.__PRODUCTS_CATALOG__.length > 0) {
    return globalThis.__PRODUCTS_CATALOG__;
  }

  // 2. Check /tmp on serverless
  try {
    if (fs.existsSync(tmpFilePath)) {
      const data = fs.readFileSync(tmpFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__PRODUCTS_CATALOG__ = parsed;
        return parsed;
      }
    }
  } catch {}

  // 3. Check public/data/products.json
  try {
    if (fs.existsSync(publicFilePath)) {
      const data = fs.readFileSync(publicFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__PRODUCTS_CATALOG__ = parsed;
        return parsed;
      }
    }
  } catch {}

  // 4. Default to official 50 famous perfumes
  globalThis.__PRODUCTS_CATALOG__ = FAMOUS_50_PERFUMES;
  persistProducts(FAMOUS_50_PERFUMES);
  return FAMOUS_50_PERFUMES;
}

function persistProducts(list: Product[]) {
  globalThis.__PRODUCTS_CATALOG__ = list;

  // Write to /tmp (always writable in AWS Lambda / Vercel Serverless)
  try {
    fs.writeFileSync(tmpFilePath, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed writing products to tmp:', e);
  }

  // Write to public/data if writable
  try {
    const dir = path.dirname(publicFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(publicFilePath, JSON.stringify(list, null, 2), 'utf-8');
  } catch {}
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function persistToCloudSetting(list: Product[]) {
  try {
    const hasDb = await isDatabaseConnected();
    if (hasDb) {
      const jsonStr = JSON.stringify(list);
      await prisma.storeSetting.upsert({
        where: { key: 'catalog_products' },
        update: { value: jsonStr },
        create: {
          key: 'catalog_products',
          value: jsonStr,
          description: 'Cloud catalog of all perfumes and variants',
        },
      });
    }
  } catch (err) {
    console.warn('Cloud storeSetting sync warning:', err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    let products = loadPersistedProducts();

    // Sync with Prisma PostgreSQL Database if available
    try {
      const hasDb = await isDatabaseConnected();
      if (hasDb) {
        // Priority 1: Check storeSetting for full cloud catalog
        const setting = await prisma.storeSetting.findUnique({
          where: { key: 'catalog_products' },
        });
        if (setting && setting.value) {
          const parsed = JSON.parse(setting.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            products = parsed;
            globalThis.__PRODUCTS_CATALOG__ = parsed;
          }
        } else {
          // Priority 2: Check relational product table
          const dbProducts = await prisma.product.findMany({
            include: {
              variants: true,
              images: true,
            },
          });
          if (dbProducts && dbProducts.length > 0) {
            const formattedDbProducts: Product[] = dbProducts.map((p: any) => ({
              id: p.id,
              slug: p.slug,
              nameEn: p.nameEn,
              nameAr: p.nameAr || undefined,
              brand: p.brand || 'رحيق (Raheeq)',
              gender: p.gender || 'UNISEX',
              headlineEn: p.headlineEn || undefined,
              descriptionEn: p.descriptionEn,
              descriptionAr: p.descriptionAr || undefined,
              concentration: p.concentration as any,
              fragranceFamily: p.fragranceFamily,
              topNotes: p.topNotes || [],
              heartNotes: p.heartNotes || [],
              baseNotes: p.baseNotes || [],
              categoryId: p.categoryId || undefined,
              isFeatured: p.isFeatured,
              isNewArrival: p.isNewArrival,
              isBestseller: p.isBestseller,
              isPublished: p.isPublished,
              rating: p.rating || 5.0,
              reviewCount: p.reviewCount || 1,
              images: p.images.map((img: any) => ({
                id: img.id,
                url: img.url,
                altTextEn: img.altTextEn || p.nameEn || 'Raheeq Perfume',
                isPrimary: img.isPrimary,
                sortOrder: img.sortOrder,
              })),
              imageUrl: p.images[0]?.url,
              createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
              updatedAt: p.updatedAt ? p.updatedAt.toISOString() : undefined,
              variants: p.variants.map((v: any) => ({
                id: v.id,
                productId: v.productId,
                sku: v.sku,
                volumeMl: v.volumeMl,
                titleEn: v.titleEn || undefined,
                regularPriceInPiasters: v.regularPriceInPiasters,
                regularPriceEgp: Math.round(v.regularPriceInPiasters / 100),
                salePriceInPiasters: v.salePriceInPiasters,
                salePriceEgp: v.salePriceInPiasters ? Math.round(v.salePriceInPiasters / 100) : null,
                costPriceInPiasters: v.costPriceInPiasters,
                costPriceEgp: v.costPriceInPiasters ? Math.round(v.costPriceInPiasters / 100) : undefined,
                stockQuantity: v.stockQuantity,
                lowStockThreshold: v.lowStockThreshold,
                isActive: v.isActive,
              })),
            }));

            // Merge DB with local items
            const map = new Map<string, Product>();
            products.forEach((p) => map.set(p.id, p));
            formattedDbProducts.forEach((p) => map.set(p.id, p));
            products = Array.from(map.values());
            persistProducts(products);
            persistToCloudSetting(products).catch(() => {});
          }
        }
      }
    } catch {
      // Prisma offline, continue with JSON persistence
    }

    // Single item query
    if (slug || id) {
      const found = products.find(
        (p) =>
          (slug && p.slug?.toLowerCase() === slug.toLowerCase()) ||
          (id && p.id === id)
      );
      if (found) {
        return NextResponse.json({ success: true, product: found });
      }
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول. يتطلب هذا الإجراء جلسة إدارة نشطة.' },
        { status: 401 }
      );
    }

    const payload = await req.json();
    let currentList = loadPersistedProducts();

    // Mode A: Bulk import of full catalog array
    if (Array.isArray(payload.products)) {
      const validProducts: Product[] = payload.products.filter((p: any) => p && p.id && p.nameEn);
      if (validProducts.length === 0) {
        return NextResponse.json({ success: false, error: 'قائمة المنتجات غير صالحة' }, { status: 400 });
      }

      // Merge by ID
      const map = new Map<string, Product>();
      currentList.forEach((p) => map.set(p.id, p));
      validProducts.forEach((p) => map.set(p.id, p));
      const merged = Array.from(map.values());

      persistProducts(merged);
      await persistToCloudSetting(merged);
      return NextResponse.json({ success: true, count: merged.length, message: 'تم استيراد وحفظ الكتالوج بنجاح' });
    }

    // Mode B: Single product addition / upsert
    const newProduct: Product = payload.product || payload;
    if (!newProduct || !newProduct.id || !newProduct.nameEn) {
      return NextResponse.json({ success: false, error: 'بيانات العطر غير مكتملة' }, { status: 400 });
    }

    const updated = [newProduct, ...currentList.filter((p) => p.id !== newProduct.id)];
    persistProducts(updated);
    await persistToCloudSetting(updated);

    // Background Prisma sync if connected
    try {
      const hasDb = await isDatabaseConnected();
      if (hasDb) {
        await prisma.product.upsert({
          where: { id: newProduct.id },
          update: {
            nameEn: newProduct.nameEn,
            nameAr: newProduct.nameAr || null,
            descriptionEn: newProduct.descriptionEn || '',
            descriptionAr: newProduct.descriptionAr || null,
            concentration: newProduct.concentration as any,
            fragranceFamily: newProduct.fragranceFamily || 'Oriental',
            topNotes: newProduct.topNotes || [],
            heartNotes: newProduct.heartNotes || [],
            baseNotes: newProduct.baseNotes || [],
          },
          create: {
            id: newProduct.id,
            slug: newProduct.slug,
            nameEn: newProduct.nameEn,
            nameAr: newProduct.nameAr || null,
            categoryId: newProduct.categoryId || 'woody',
            descriptionEn: newProduct.descriptionEn || '',
            descriptionAr: newProduct.descriptionAr || null,
            concentration: newProduct.concentration as any,
            fragranceFamily: newProduct.fragranceFamily || 'Oriental',
            topNotes: newProduct.topNotes || [],
            heartNotes: newProduct.heartNotes || [],
            baseNotes: newProduct.baseNotes || [],
          },
        });
      }
    } catch {}

    return NextResponse.json({
      success: true,
      product: newProduct,
      totalCount: updated.length,
      message: 'تم حفظ العطر بنجاح في قاعدة البيانات الدائمة والسيرفر.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح بالوصول.' }, { status: 401 });
    }

    const { id, updatedFields, product } = await req.json();
    const targetId = id || product?.id;
    if (!targetId) {
      return NextResponse.json({ error: 'معرف العطر مفقود' }, { status: 400 });
    }

    let currentList = loadPersistedProducts();
    try {
      const hasDb = await isDatabaseConnected();
      if (hasDb) {
        const setting = await prisma.storeSetting.findUnique({
          where: { key: 'catalog_products' },
        });
        if (setting && setting.value) {
          const parsed = JSON.parse(setting.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            currentList = parsed;
          }
        }
      }
    } catch {}

    const updated = currentList.map((p) => {
      if (p.id !== targetId) return p;
      if (product) return { ...p, ...product };

      const merged: Product = { ...p, ...(updatedFields || {}) };

      // Update variant prices and stock if provided
      if (
        updatedFields &&
        (updatedFields.regularPriceEgp !== undefined ||
          updatedFields.salePriceEgp !== undefined ||
          updatedFields.costPriceEgp !== undefined ||
          updatedFields.stockQuantity !== undefined)
      ) {
        if (Array.isArray(merged.variants) && merged.variants.length > 0) {
          const v0 = { ...merged.variants[0] };
          if (updatedFields.regularPriceEgp !== undefined) {
            v0.regularPriceEgp = Number(updatedFields.regularPriceEgp);
            v0.regularPriceInPiasters = Math.round(Number(updatedFields.regularPriceEgp) * 100);
          }
          if (updatedFields.salePriceEgp !== undefined) {
            v0.salePriceEgp = updatedFields.salePriceEgp ? Number(updatedFields.salePriceEgp) : undefined;
            v0.salePriceInPiasters = updatedFields.salePriceEgp ? Math.round(Number(updatedFields.salePriceEgp) * 100) : null;
          }
          if (updatedFields.costPriceEgp !== undefined) {
            v0.costPriceEgp = Number(updatedFields.costPriceEgp);
            v0.costPriceInPiasters = Math.round(Number(updatedFields.costPriceEgp) * 100);
          }
          if (updatedFields.stockQuantity !== undefined) {
            v0.stockQuantity = Number(updatedFields.stockQuantity);
          }
          merged.variants = [v0, ...merged.variants.slice(1)];
        }
      }

      return merged;
    });

    persistProducts(updated);
    await persistToCloudSetting(updated);
    return NextResponse.json({ success: true, message: 'تم تحديث بيانات العطر بنجاح' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح بالوصول.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'معرف العطر مطلوب للحذف' }, { status: 400 });
    }

    const currentList = loadPersistedProducts();
    const updated = currentList.filter((p) => p.id !== id);
    persistProducts(updated);
    await persistToCloudSetting(updated);

    // Prisma delete in background if available
    try {
      const hasDb = await isDatabaseConnected();
      if (hasDb) {
        await prisma.product.delete({ where: { id } });
      }
    } catch {}

    return NextResponse.json({ success: true, count: updated.length, message: 'تم حذف العطر بنجاح' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
