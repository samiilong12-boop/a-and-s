import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/serverAuth';
import { getCloudinaryConfig } from '@/lib/cloudinary';
import { prisma, isDatabaseConnected } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح بعرض تكوين الوسائط' }, { status: 401 });
    }

    const config = await getCloudinaryConfig();

    return NextResponse.json({
      success: true,
      isConfigured: config.isConfigured,
      cloudName: config.cloudName,
      apiKeyMasked: config.apiKey ? `${config.apiKey.slice(0, 4)}••••${config.apiKey.slice(-3)}` : '',
      hasSecret: Boolean(config.apiSecret),
      hasWebhookSecret: Boolean(config.webhookSecret),
    });
  } catch (err: any) {
    console.error('Cloudinary config GET error:', err);
    return NextResponse.json({ error: 'فشل قراءة تكوين Cloudinary' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح بتعديل تكوين الوسائط' }, { status: 401 });
    }

    const body = await req.json();
    const { cloudName, apiKey, apiSecret, webhookSecret } = body;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'يرجى إدخال Cloud Name و API Key و API Secret معاً' },
        { status: 400 }
      );
    }

    const hasDb = await isDatabaseConnected();
    if (hasDb) {
      await prisma.storeSetting.upsert({
        where: { key: 'cloudinary_config' },
        create: {
          key: 'cloudinary_config',
          value: JSON.stringify({
            cloudName: cloudName.trim(),
            apiKey: apiKey.trim(),
            apiSecret: apiSecret.trim(),
            webhookSecret: (webhookSecret || '').trim(),
            updatedAt: new Date().toISOString(),
          }),
          description: 'Secure Cloudinary Credentials for RAHEEQ Video Management',
        },
        update: {
          value: JSON.stringify({
            cloudName: cloudName.trim(),
            apiKey: apiKey.trim(),
            apiSecret: apiSecret.trim(),
            webhookSecret: (webhookSecret || '').trim(),
            updatedAt: new Date().toISOString(),
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'تم حفظ وتفعيل بيانات حساب Cloudinary بنجاح!',
      cloudName: cloudName.trim(),
    });
  } catch (err: any) {
    console.error('Cloudinary config POST error:', err);
    return NextResponse.json({ error: 'فشل حفظ تكوين Cloudinary' }, { status: 500 });
  }
}
