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
      return NextResponse.json({ error: 'غير مصرح باستعادة النسخ السابقة' }, { status: 401 });
    }

    const body = await req.json();
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json({ error: 'معرّف الفيديو (videoId) مطلوب للاستعادة' }, { status: 400 });
    }

    const hasDb = await isDatabaseConnected();
    const now = new Date();
    let restoredVideo: any = null;

    if (hasDb) {
      await prisma.$transaction(async (tx) => {
        const target = await tx.cloudVideo.findUnique({
          where: { id: videoId },
        });

        if (!target) {
          throw new Error('الفيديو المراد استعادته غير موجود');
        }

        if (target.publishingStatus === 'DELETED') {
          throw new Error('لا يمكن استعادة فيديو تم حذفه سحابياً بالكامل');
        }

        // Demote currently active video to RETIRED
        const currentActive = await tx.cloudVideo.findFirst({
          where: { publishingStatus: 'ACTIVE', id: { not: videoId } },
        });

        if (currentActive) {
          await tx.cloudVideo.update({
            where: { id: currentActive.id },
            data: {
              publishingStatus: 'RETIRED',
              retiredAt: now,
              scheduledDeletionAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Restore target to ACTIVE
        restoredVideo = await tx.cloudVideo.update({
          where: { id: videoId },
          data: {
            publishingStatus: 'ACTIVE',
            publishedAt: now,
            retiredAt: null,
            scheduledDeletionAt: null,
          },
        });

        // Update StoreSetting
        await tx.storeSetting.upsert({
          where: { key: 'active_hero_video_id' },
          create: {
            key: 'active_hero_video_id',
            value: videoId,
          },
          update: {
            value: videoId,
          },
        });

        // Update site_content_config
        const setting = await tx.storeSetting.findUnique({
          where: { key: 'site_content_config' },
        });

        const currentConfig = setting?.value ? JSON.parse(setting.value) : DEFAULT_SITE_CONTENT;
        const updatedConfig = {
          ...currentConfig,
          activeVideoUrl: restoredVideo.desktopDeliveryUrl || restoredVideo.originalUrl,
          activePhotoUrl: restoredVideo.posterUrl || currentConfig.activePhotoUrl,
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
      restoredVideo = { id: videoId, publishingStatus: 'ACTIVE' };
    }

    try {
      revalidatePath('/');
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'تم التراجع واستعادة الفيديو السابق بنجاح كفيديو نشط في واجهة المتجر!',
      video: restoredVideo,
    });
  } catch (err: any) {
    console.error('Rollback error:', err);
    return NextResponse.json({ error: err.message || 'فشل التراجع عن الفيديو' }, { status: 500 });
  }
}
