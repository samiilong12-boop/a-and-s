import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminSession } from '@/lib/serverAuth';
import { prisma, isDatabaseConnected } from '@/lib/prisma';
import { DEFAULT_SITE_CONTENT } from '@/lib/siteContent';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح بنشر الفيديو للجمهور' }, { status: 401 });
    }

    const body = await req.json();
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json({ error: 'معرّف الفيديو (videoId) مطلوب' }, { status: 400 });
    }

    const hasDb = await isDatabaseConnected();
    const now = new Date();
    const safetyPeriodDays = 7;
    const scheduledDeletionAt = new Date(now.getTime() + safetyPeriodDays * 24 * 60 * 60 * 1000);

    let publishedVideo: any = null;

    if (hasDb) {
      // Execute atomic transaction
      await prisma.$transaction(async (tx) => {
        // 1. Fetch target video
        const target = await tx.cloudVideo.findUnique({
          where: { id: videoId },
        });

        if (!target) {
          throw new Error('الفيديو المطلوب نشره غير موجود في قاعدة البيانات');
        }

        if (target.publishingStatus === 'DELETED') {
          throw new Error('لا يمكن نشر فيديو تم حذفه مسبقاً');
        }

        // 2. Find currently active video and retire it safely
        const currentActive = await tx.cloudVideo.findFirst({
          where: { publishingStatus: 'ACTIVE', id: { not: videoId } },
        });

        if (currentActive) {
          await tx.cloudVideo.update({
            where: { id: currentActive.id },
            data: {
              publishingStatus: 'RETIRED',
              retiredAt: now,
              scheduledDeletionAt: scheduledDeletionAt,
            },
          });
        }

        // 3. Promote target to ACTIVE
        publishedVideo = await tx.cloudVideo.update({
          where: { id: videoId },
          data: {
            publishingStatus: 'ACTIVE',
            publishedAt: now,
            retiredAt: null,
            scheduledDeletionAt: null,
          },
        });

        // 4. Update StoreSetting active_hero_video_id
        await tx.storeSetting.upsert({
          where: { key: 'active_hero_video_id' },
          create: {
            key: 'active_hero_video_id',
            value: videoId,
            description: 'Currently Active Hero Cloud Video ID',
          },
          update: {
            value: videoId,
          },
        });

        // 5. Update site_content_config for public storefront sync
        const siteContentSetting = await tx.storeSetting.findUnique({
          where: { key: 'site_content_config' },
        });

        const currentConfig = siteContentSetting?.value
          ? JSON.parse(siteContentSetting.value)
          : DEFAULT_SITE_CONTENT;

        const updatedConfig = {
          ...currentConfig,
          activeVideoUrl: publishedVideo.desktopDeliveryUrl || publishedVideo.originalUrl,
          activePhotoUrl: publishedVideo.posterUrl || currentConfig.activePhotoUrl,
          visualMode: 'video',
          updatedAt: now.toISOString(),
        };

        await tx.storeSetting.upsert({
          where: { key: 'site_content_config' },
          create: {
            key: 'site_content_config',
            value: JSON.stringify(updatedConfig),
          },
          update: {
            value: JSON.stringify(updatedConfig),
          },
        });
      });
    } else {
      // In-memory fallback
      publishedVideo = {
        id: videoId,
        publishingStatus: 'ACTIVE',
        publishedAt: now.toISOString(),
      };
    }

    // Invalidate homepage cache immediately
    try {
      revalidatePath('/');
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'تم نشر وتفعيل الفيديو الجديد بنجاح في الواجهة الرئيسية للمتجر! 🎉',
      video: publishedVideo,
    });
  } catch (err: any) {
    console.error('Publish video error:', err);
    return NextResponse.json({ error: err.message || 'فشل نشر الفيديو' }, { status: 500 });
  }
}
