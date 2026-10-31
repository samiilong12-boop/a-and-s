import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/serverAuth';
import { Product } from '@/types';
import { prisma, isDatabaseConnected } from '@/lib/prisma';
import { FAMOUS_50_PERFUMES, getDemoBottleSvg } from '@/lib/data/products';
import { isCloudinaryUrl, getOptimizedProductImageUrl } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    let products: Product[] = FAMOUS_50_PERFUMES;
    try {
      const hasDb = await isDatabaseConnected();
      if (hasDb) {
        const setting = await prisma.storeSetting.findUnique({
          where: { key: 'catalog_products' },
        });
        if (setting?.value) {
          const parsed = JSON.parse(setting.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            products = parsed;
          }
        }
      }
    } catch {}

    // Audit each product's images
    let totalImages = 0;
    let base64ImagesCount = 0;
    let unoptimizedCloudCount = 0;
    let optimizedCloudCount = 0;
    let localImagesCount = 0;
    let estimatedSavingsBytes = 0;

    const auditedProducts = products.map((p) => {
      const allUrls = [
        p.imageUrl,
        ...(p.images ? p.images.map((img) => img.url) : []),
      ].filter(Boolean) as string[];

      totalImages += allUrls.length;

      const hasBase64 = allUrls.some((u) => u.startsWith('data:image/'));
      const hasCloudinary = allUrls.some((u) => isCloudinaryUrl(u));
      const hasUnoptimizedCloud = allUrls.some(
        (u) => isCloudinaryUrl(u) && !u.includes('f_auto') && !u.includes('q_auto')
      );

      if (hasBase64) {
        base64ImagesCount += allUrls.filter((u) => u.startsWith('data:image/')).length;
        // Base64 images are typically 1-3MB in database
        estimatedSavingsBytes += 1.5 * 1024 * 1024;
      }
      if (hasUnoptimizedCloud) {
        unoptimizedCloudCount += allUrls.filter(
          (u) => isCloudinaryUrl(u) && !u.includes('f_auto') && !u.includes('q_auto')
        ).length;
        estimatedSavingsBytes += 350 * 1024; // estimated 350KB per raw image
      }
      if (hasCloudinary && !hasUnoptimizedCloud) {
        optimizedCloudCount += allUrls.filter((u) => isCloudinaryUrl(u)).length;
      }
      if (!hasCloudinary && !hasBase64) {
        localImagesCount += allUrls.length;
      }

      return {
        id: p.id,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        imageUrl: p.imageUrl,
        imagesCount: allUrls.length,
        hasBase64,
        hasUnoptimizedCloud,
        isOptimized: hasCloudinary && !hasUnoptimizedCloud && !hasBase64,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts: products.length,
        totalImages,
        base64ImagesCount,
        unoptimizedCloudCount,
        optimizedCloudCount,
        localImagesCount,
        estimatedSavingsBytes,
        estimatedSavingsMB: (estimatedSavingsBytes / (1024 * 1024)).toFixed(2),
      },
      products: auditedProducts,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'bulk_transform';

    let products: Product[] = FAMOUS_50_PERFUMES;
    let hasDb = false;
    try {
      hasDb = await isDatabaseConnected();
      if (hasDb) {
        const setting = await prisma.storeSetting.findUnique({
          where: { key: 'catalog_products' },
        });
        if (setting?.value) {
          const parsed = JSON.parse(setting.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            products = parsed;
          }
        }
      }
    } catch {}

    let transformedCount = 0;

    const updatedProducts = products.map((p) => {
      let modified = false;
      const updated = { ...p };

      // Transform primary image URL
      if (updated.imageUrl && isCloudinaryUrl(updated.imageUrl)) {
        const optimized = getOptimizedProductImageUrl(updated.imageUrl, 1200, 'balanced');
        if (optimized !== updated.imageUrl) {
          updated.imageUrl = optimized;
          modified = true;
        }
      }

      // If action is clean_base64 and imageUrl is base64, replace with lightweight vector bottle
      if (action === 'clean_base64' && updated.imageUrl?.startsWith('data:image/')) {
        updated.imageUrl = getDemoBottleSvg(updated.nameEn, '#2DD4BF');
        modified = true;
      }

      // Transform gallery images
      if (updated.images && updated.images.length > 0) {
        updated.images = updated.images.map((img) => {
          if (img.url && isCloudinaryUrl(img.url)) {
            const opt = getOptimizedProductImageUrl(img.url, 1200, 'balanced');
            if (opt !== img.url) {
              modified = true;
              return { ...img, url: opt };
            }
          }
          if (action === 'clean_base64' && img.url?.startsWith('data:image/')) {
            modified = true;
            return { ...img, url: getDemoBottleSvg(updated.nameEn, '#2DD4BF') };
          }
          return img;
        });
      }

      if (modified) transformedCount++;
      return updated;
    });

    // Save updated catalog to Cloud StoreSetting
    if (hasDb) {
      await prisma.storeSetting.upsert({
        where: { key: 'catalog_products' },
        update: { value: JSON.stringify(updatedProducts) },
        create: {
          key: 'catalog_products',
          value: JSON.stringify(updatedProducts),
          description: 'Cloud catalog with non-destructive image delivery transformations',
        },
      });
    }

    return NextResponse.json({
      success: true,
      transformedCount,
      totalCount: updatedProducts.length,
      message: `تم بنجاح تطبيق التحسين السحابي غير الإتلافي على ${transformedCount} عطر بالكتالوج!`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
