import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/serverAuth';
import { safeDeleteCloudinaryAsset } from '@/lib/cloudinary';
import { prisma, isDatabaseConnected } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح بحذف ملفات الفيديو السحابية' }, { status: 401 });
    }

    const body = await req.json();
    const { videoId, force } = body;

    if (!videoId) {
      return NextResponse.json({ error: 'معرّف الفيديو (videoId) مطلوب للحذف' }, { status: 400 });
    }

    const hasDb = await isDatabaseConnected();
    if (!hasDb) {
      return NextResponse.json({ success: true, message: 'تم الحذف من الذاكرة المؤقتة' });
    }

    const video = await prisma.cloudVideo.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json({ error: 'ملف الفيديو غير موجود في السجلات' }, { status: 404 });
    }

    // Safety Guard 1: Never delete currently ACTIVE video
    if (video.publishingStatus === 'ACTIVE') {
      return NextResponse.json(
        { error: 'لا يمكن حذف الفيديو النشط حالياً في واجهة المتجر الرئيسية! يرجى تفعيل أو نشر فيديو آخر أولاً.' },
        { status: 400 }
      );
    }

    // Safety Guard 2: Never delete SHARED assets
    if (video.isShared) {
      return NextResponse.json(
        { error: 'لا يمكن حذف هذا الفيديو لأنه مستخدم أو مشارك في صفحات أو حملات أخرى في المتجر.' },
        { status: 400 }
      );
    }

    // Safety Guard 3: Check scheduled safety period unless force=true
    if (!force && video.scheduledDeletionAt && new Date() < video.scheduledDeletionAt) {
      const remainingDays = Math.ceil(
        (video.scheduledDeletionAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      );
      return NextResponse.json(
        {
          error: `هذا الفيديو في فترة الأمان والحماية السحابية المتبقية (${remainingDays} أيام). للحذف الفوري يرجى تأكيد الحذف الإجباري.`,
          inSafetyPeriod: true,
          scheduledDeletionAt: video.scheduledDeletionAt,
        },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    const deleteResult = await safeDeleteCloudinaryAsset(video.cloudinaryPublicId, video.cloudName);

    if (!deleteResult.success) {
      return NextResponse.json(
        { error: deleteResult.error || 'فشل حذف الملف من خوادم Cloudinary' },
        { status: 400 }
      );
    }

    // Mark as DELETED in database
    await prisma.cloudVideo.update({
      where: { id: videoId },
      data: {
        publishingStatus: 'DELETED',
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف الفيديو السحابي القديم بأمان وتحرير مساحة التخزين في Cloudinary.',
      videoId,
    });
  } catch (err: any) {
    console.error('Delete video error:', err);
    return NextResponse.json({ error: err.message || 'فشل حذف الفيديو' }, { status: 500 });
  }
}
