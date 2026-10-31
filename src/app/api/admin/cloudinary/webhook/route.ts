import { NextRequest, NextResponse } from 'next/server';
import { getCloudinaryConfig, verifyWebhookSignature } from '@/lib/cloudinary';
import { prisma, isDatabaseConnected } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('X-Cld-Signature');
    const timestamp = req.headers.get('X-Cld-Timestamp');

    const config = await getCloudinaryConfig();
    const secret = config.webhookSecret || config.apiSecret;

    // Verify webhook signature if secret is configured
    if (secret && signature && timestamp) {
      const isValid = verifyWebhookSignature(rawBody, timestamp, signature, secret);
      if (!isValid) {
        console.warn('[Cloudinary Webhook] Invalid signature rejected');
        return NextResponse.json({ error: 'توقيع الـ Webhook غير صالح' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody || '{}');
    const publicId = payload.public_id;
    const notificationType = payload.notification_type;

    if (!publicId) {
      return NextResponse.json({ received: true, note: 'No public_id in payload' });
    }

    const hasDb = await isDatabaseConnected();
    if (!hasDb) {
      return NextResponse.json({ received: true });
    }

    // Find video in database
    const video = await prisma.cloudVideo.findUnique({
      where: { cloudinaryPublicId: publicId },
    });

    if (!video) {
      return NextResponse.json({ received: true, note: 'Video not tracked in database' });
    }

    // Handle eager transformation completion
    if (notificationType === 'eager' || Array.isArray(payload.eager)) {
      let mobileUrl = video.mobileDeliveryUrl;
      let desktopUrl = video.desktopDeliveryUrl;
      let posterUrl = video.posterUrl;

      if (Array.isArray(payload.eager)) {
        for (const item of payload.eager) {
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

      await prisma.cloudVideo.update({
        where: { id: video.id },
        data: {
          processingStatus: 'READY',
          mobileDeliveryUrl: mobileUrl,
          desktopDeliveryUrl: desktopUrl,
          posterUrl: posterUrl,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'تمت معالجة إشعار Cloudinary وتحديث حالة الفيديو بنجاح',
    });
  } catch (err: any) {
    console.error('[Cloudinary Webhook Error]:', err);
    return NextResponse.json({ error: 'خطأ أثناء معالجة الـ Webhook' }, { status: 500 });
  }
}
