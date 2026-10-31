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
    const resourceType = body.resourceType === 'image' ? 'image' : 'video';
    const isImage = resourceType === 'image';

    const defaultFolder = isImage ? 'raheeq/products' : 'raheeq/hero-videos';
    const folder = body.folder || defaultFolder;

    const prefix = isImage ? 'raheeq_prod' : 'raheeq_hero';
    const uniqueId = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const publicId = `${folder}/${uniqueId}`;

    // Cloudinary Eager Transformations (only for videos)
    const eager = isImage
      ? undefined
      : 'q_auto:eco,f_auto,w_480,vc_h264|q_auto,f_auto,w_720,vc_h264|so_0,f_auto,q_auto,w_1024';

    const paramsToSign: Record<string, string | number> = {
      folder,
      public_id: publicId,
      overwrite: 'false',
    };

    if (eager) {
      paramsToSign.eager = eager;
    }

    const { signature, timestamp } = generateUploadSignature(paramsToSign, config.apiSecret);

    return NextResponse.json({
      success: true,
      uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`,
      cloudName: config.cloudName,
      apiKey: config.apiKey,
      publicId,
      folder,
      eager,
      timestamp,
      signature,
      resourceType,
    });
  } catch (err: any) {
    console.error('Cloudinary sign error:', err);
    return NextResponse.json({ error: 'فشل إنشاء توقيع الرفع السحابي' }, { status: 500 });
  }
}
