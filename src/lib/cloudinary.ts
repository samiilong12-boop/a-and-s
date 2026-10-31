import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import { prisma, isDatabaseConnected } from './prisma';

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  webhookSecret?: string;
  isConfigured: boolean;
}

// Fallback default RAHEEQ cloud name for reading active assets
export const DEFAULT_RAHEEQ_CLOUD_NAME = 'raheeq-perfumes';

/**
 * Retrieve Cloudinary configuration from environment variables or database StoreSetting
 */
export async function getCloudinaryConfig(): Promise<CloudinaryConfig> {
  const envCloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
  const envApiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '';
  const envApiSecret = process.env.CLOUDINARY_API_SECRET || '';
  const envWebhookSecret = process.env.CLOUDINARY_WEBHOOK_SECRET || '';

  if (envCloudName && envApiKey && envApiSecret) {
    cloudinary.config({
      cloud_name: envCloudName,
      api_key: envApiKey,
      api_secret: envApiSecret,
      secure: true,
    });
    return {
      cloudName: envCloudName,
      apiKey: envApiKey,
      apiSecret: envApiSecret,
      webhookSecret: envWebhookSecret,
      isConfigured: true,
    };
  }

  // Check database StoreSetting
  try {
    const hasDb = await isDatabaseConnected();
    if (hasDb) {
      const setting = await prisma.storeSetting.findUnique({
        where: { key: 'cloudinary_config' },
      });
      if (setting && setting.value) {
        const parsed = JSON.parse(setting.value);
        if (parsed.cloudName && parsed.apiKey && parsed.apiSecret) {
          cloudinary.config({
            cloud_name: parsed.cloudName,
            api_key: parsed.apiKey,
            api_secret: parsed.apiSecret,
            secure: true,
          });
          return {
            cloudName: parsed.cloudName,
            apiKey: parsed.apiKey,
            apiSecret: parsed.apiSecret,
            webhookSecret: parsed.webhookSecret || envWebhookSecret,
            isConfigured: true,
          };
        }
      }
    }
  } catch (err) {
    console.warn('[Cloudinary] Could not read config from DB:', err);
  }

  return {
    cloudName: envCloudName || DEFAULT_RAHEEQ_CLOUD_NAME,
    apiKey: envApiKey,
    apiSecret: envApiSecret,
    webhookSecret: envWebhookSecret,
    isConfigured: Boolean(envCloudName && envApiKey && envApiSecret),
  };
}

/**
 * Generate authenticated signed upload parameters for browser direct upload
 * Avoids routing large video files through Vercel serverless functions.
 */
export function generateUploadSignature(
  paramsToSign: Record<string, string | number>,
  apiSecret: string
): { signature: string; timestamp: number } {
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string | number> = {
    ...paramsToSign,
    timestamp,
  };

  // Sort keys alphabetically as required by Cloudinary signature specification
  const sortedKeys = Object.keys(params).sort();
  const signatureString = sortedKeys
    .map((k) => `${k}=${params[k]}`)
    .join('&');

  const signature = crypto
    .createHash('sha1')
    .update(signatureString + apiSecret)
    .digest('hex');

  return { signature, timestamp };
}

/**
 * Constructs Cloudinary delivery URLs with performance transformations
 */
export function buildDeliveryUrls(
  publicId: string,
  cloudName: string,
  version?: number
): {
  originalUrl: string;
  mobileDeliveryUrl: string;
  desktopDeliveryUrl: string;
  posterUrl: string;
} {
  const v = version ? `v${version}/` : '';
  const base = `https://res.cloudinary.com/${cloudName}/video/upload`;
  const baseImage = `https://res.cloudinary.com/${cloudName}/video/upload`;

  return {
    originalUrl: `${base}/${v}${publicId}.mp4`,
    // Mobile: 480p width, eco auto quality, auto format, H.264 video codec
    mobileDeliveryUrl: `${base}/q_auto:eco,f_auto,w_480,vc_h264/${v}${publicId}.mp4`,
    // Desktop: 720p width, auto quality, auto format, H.264 video codec
    desktopDeliveryUrl: `${base}/q_auto,f_auto,w_720,vc_h264/${v}${publicId}.mp4`,
    // Poster: snapshot at second 0, auto quality, 1024 width, webp/jpg auto format
    posterUrl: `${baseImage}/so_0,f_auto,q_auto,w_1024/${v}${publicId}.jpg`,
  };
}

/**
 * Re-export pure isomorphic product image delivery helpers (Client-Safe)
 */
export * from './productImageDelivery';

/**
 * Verify Cloudinary webhook notification signature (X-Cld-Signature & X-Cld-Timestamp)
 */
export function verifyWebhookSignature(
  rawBody: string,
  timestamp: string | null,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !timestamp || !secret) return false;

  // Cloudinary Webhook Signature algorithm: sha256(body + timestamp + secret)
  const hash = crypto
    .createHash('sha256')
    .update(rawBody + timestamp + secret)
    .digest('hex');

  return hash === signature;
}

/**
 * Safely deletes a Cloudinary video asset
 * Strictly enforces ownership verification and shared-asset protection.
 */
export async function safeDeleteCloudinaryAsset(
  publicId: string,
  cloudName: string
): Promise<{ success: boolean; error?: string }> {
  const config = await getCloudinaryConfig();

  // Guard 1: Verify configured Cloudinary account owns this asset
  if (config.cloudName !== cloudName) {
    return {
      success: false,
      error: `لا يمكن حذف هذا الملف السحابي لأنه يتبع حساب (${cloudName}) وليس حساب المتجر المعتمد (${config.cloudName}). تم حفظ الملف بأمان دون حذفه.`,
    };
  }

  if (!config.isConfigured) {
    return {
      success: false,
      error: 'بيانات اعتماد Cloudinary API Secret غير مكتملة لتنفيذ عملية الحذف السحابي.',
    };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'video',
      invalidate: true, // request CDN cache invalidation
    });

    if (result.result === 'ok' || result.result === 'not found') {
      return { success: true };
    }

    return { success: false, error: `Cloudinary destroy returned: ${result.result}` };
  } catch (err: any) {
    console.error('[Cloudinary Destroy Error]:', err);
    return { success: false, error: err.message || 'فشل الاتصال بخوادم Cloudinary' };
  }
}
