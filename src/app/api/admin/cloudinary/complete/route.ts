import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/serverAuth';
import { getCloudinaryConfig, buildDeliveryUrls } from '@/lib/cloudinary';
import { prisma, isDatabaseConnected } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح بتسجيل بيانات الفيديو' }, { status: 401 });
    }

    const body = await req.json();
    const {
      publicId,
      version,
      bytes,
      duration,
      format,
      width,
      height,
      secureUrl,
      originalFilename,
      eager,
    } = body;

    if (!publicId) {
      return NextResponse.json({ error: 'معرّف الفيديو (publicId) مطلوب' }, { status: 400 });
    }

    const config = await getCloudinaryConfig();
    const cloudName = config.cloudName;

    // Build optimized delivery URLs
    const delivery = buildDeliveryUrls(publicId, cloudName, version);

    // If eager transformations were returned directly in upload response, extract them
    let mobileUrl = delivery.mobileDeliveryUrl;
    let desktopUrl = delivery.desktopDeliveryUrl;
    let posterUrl = delivery.posterUrl;

    if (Array.isArray(eager) && eager.length > 0) {
      for (const item of eager) {
        const secUrl = item.secure_url || item.url || '';
        if (secUrl.includes('w_480') || secUrl.includes('q_auto:eco')) {
          mobileUrl = secUrl;
        } else if (secUrl.includes('w_720') || secUrl.includes('w_1080')) {
          desktopUrl = secUrl;
        } else if (secUrl.includes('so_0') || secUrl.endsWith('.jpg') || secUrl.endsWith('.webp')) {
          posterUrl = secUrl;
        }
      }
    }

    const hasDb = await isDatabaseConnected();
    let videoRecord: any = null;

    if (hasDb) {
      videoRecord = await prisma.cloudVideo.create({
        data: {
          cloudinaryPublicId: publicId,
          cloudinaryAssetId: body.assetId || null,
          cloudName,
          version: typeof version === 'number' ? version : 1,
          originalFilename: originalFilename || publicId.split('/').pop() || 'hero-video',
          resourceType: 'video',
          format: format || 'mp4',
          sourceSizeBytes: typeof bytes === 'number' ? bytes : null,
          durationSeconds: typeof duration === 'number' ? duration : null,
          width: typeof width === 'number' ? width : null,
          height: typeof height === 'number' ? height : null,
          originalUrl: secureUrl || delivery.originalUrl,
          mobileDeliveryUrl: mobileUrl,
          desktopDeliveryUrl: desktopUrl,
          posterUrl: posterUrl,
          processingStatus: 'READY',
          publishingStatus: 'DRAFT',
        },
      });
    } else {
      // In-memory record
      videoRecord = {
        id: `local-${Date.now()}`,
        cloudinaryPublicId: publicId,
        cloudName,
        version: version || 1,
        originalFilename: originalFilename || 'hero-video',
        sourceSizeBytes: bytes,
        durationSeconds: duration,
        width,
        height,
        originalUrl: secureUrl || delivery.originalUrl,
        mobileDeliveryUrl: mobileUrl,
        desktopDeliveryUrl: desktopUrl,
        posterUrl: posterUrl,
        processingStatus: 'READY',
        publishingStatus: 'DRAFT',
        createdAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الفيديو ومعالجة مشتقات الموبايل والكمبيوتر بنجاح!',
      video: videoRecord,
    });
  } catch (err: any) {
    console.error('Cloudinary complete error:', err);
    return NextResponse.json({ error: 'فشل حفظ تفاصيل الفيديو السحابي' }, { status: 500 });
  }
}
