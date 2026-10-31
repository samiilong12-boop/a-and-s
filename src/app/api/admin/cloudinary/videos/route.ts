import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/serverAuth';
import { prisma, isDatabaseConnected } from '@/lib/prisma';
import { getCloudinaryConfig } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح بعرض قائمة الفيديوهات' }, { status: 401 });
    }

    const config = await getCloudinaryConfig();
    const hasDb = await isDatabaseConnected();

    let videos: any[] = [];
    if (hasDb) {
      videos = await prisma.cloudVideo.findMany({
        where: {
          publishingStatus: { not: 'DELETED' },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Identify active video
    const activeVideo = videos.find((v) => v.publishingStatus === 'ACTIVE') || null;
    const drafts = videos.filter((v) => v.publishingStatus === 'DRAFT');
    const retired = videos.filter((v) => v.publishingStatus === 'RETIRED');

    // Aggregate statistics
    const totalSourceBytes = videos.reduce((acc, v) => acc + (v.sourceSizeBytes || 0), 0);

    return NextResponse.json({
      success: true,
      cloudName: config.cloudName,
      isConfigured: config.isConfigured,
      videos,
      summary: {
        totalVideos: videos.length,
        activeId: activeVideo?.id || null,
        draftsCount: drafts.length,
        retiredCount: retired.length,
        totalSourceBytes,
        totalSourceMb: (totalSourceBytes / (1024 * 1024)).toFixed(2),
      },
    });
  } catch (err: any) {
    console.error('Get videos error:', err);
    return NextResponse.json({ error: 'فشل استرجاع قائمة الفيديوهات' }, { status: 500 });
  }
}
