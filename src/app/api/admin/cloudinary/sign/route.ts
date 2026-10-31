import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/serverAuth';
import { getCloudinaryConfig, generateUploadSignature } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح بتوليد توقيع الرفع السحابي' }, { status: 401 });
    }

    const config = await getCloudinaryConfig();
    if (!config.isConfigured || !config.apiSecret) {
      return NextResponse.json(
        {
          error: 'حساب Cloudinary غير مهيأ بالكامل في لوحة التحكم أو ملف البيئة. يرجى إدخال Cloud Name و API Secret في تبويب الإعدادات.',
          isConfigured: false,
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const filename = (body.filename || 'hero-video').replace(/[^a-zA-Z0-9_-]/g, '_');
    const folder = 'raheeq/hero-videos';
    const uniqueId = `raheeq_hero_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const publicId = `${folder}/${uniqueId}`;

    // Cloudinary Eager Transformations to automatically generate lightweight mobile & desktop derivatives
    const eager = 'q_auto:eco,f_auto,w_480,vc_h264|q_auto,f_auto,w_720,vc_h264|so_0,f_auto,q_auto,w_1024';

    const paramsToSign: Record<string, string | number> = {
      folder,
      public_id: publicId,
      eager,
      overwrite: 'false',
    };

    const { signature, timestamp } = generateUploadSignature(paramsToSign, config.apiSecret);

    return NextResponse.json({
      success: true,
      uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudName}/video/upload`,
      cloudName: config.cloudName,
      apiKey: config.apiKey,
      publicId,
      folder,
      eager,
      timestamp,
      signature,
      resourceType: 'video',
    });
  } catch (err: any) {
    console.error('Cloudinary sign error:', err);
    return NextResponse.json({ error: 'فشل إنشاء توقيع الرفع السحابي' }, { status: 500 });
  }
}
