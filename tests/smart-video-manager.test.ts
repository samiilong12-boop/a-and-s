import { describe, it, expect } from 'vitest';
import {
  generateUploadSignature,
  buildDeliveryUrls,
  verifyWebhookSignature,
  safeDeleteCloudinaryAsset,
} from '../src/lib/cloudinary';

describe('Smart Cloud Video Manager & Media Architecture', () => {
  it('generates deterministic HMAC-SHA1 upload signatures with sorted parameters', () => {
    const params = {
      folder: 'raheeq-hero-videos',
      eager: 'q_auto:eco,f_auto,w_480,vc_h264',
    };
    const apiSecret = 'test_secret_key_123';

    const { signature, timestamp } = generateUploadSignature(params, apiSecret);
    expect(typeof signature).toBe('string');
    expect(signature.length).toBe(40); // 40-character hex string for SHA1
    expect(typeof timestamp).toBe('number');
    expect(timestamp).toBeGreaterThan(0);
  });

  it('generates optimal delivery URLs for mobile (480p), desktop (720p), and poster', () => {
    const cloudName = 'raheeq-perfumes';
    const publicId = 'hero-video-luxury-2026';
    const urls = buildDeliveryUrls(publicId, cloudName, 1793450000);

    expect(urls.mobileDeliveryUrl).toContain('q_auto:eco,f_auto,w_480,vc_h264');
    expect(urls.desktopDeliveryUrl).toContain('q_auto,f_auto,w_720,vc_h264');
    expect(urls.posterUrl).toContain('so_0,f_auto,q_auto,w_1024');
    expect(urls.mobileDeliveryUrl).toContain(`https://res.cloudinary.com/${cloudName}/video/upload/`);
    expect(urls.posterUrl).toContain('.jpg');
  });

  it('verifies Cloudinary webhook signature using SHA-256 algorithm', () => {
    const rawBody = JSON.stringify({ notification_type: 'eager', asset_id: 'test_123' });
    const timestamp = '1793450000';
    const secret = 'webhook_secret_key_777';

    // Compute expected hash manually
    const crypto = require('crypto');
    const expectedSig = crypto
      .createHash('sha256')
      .update(rawBody + timestamp + secret)
      .digest('hex');

    const isValid = verifyWebhookSignature(rawBody, timestamp, expectedSig, secret);
    expect(isValid).toBe(true);

    const isInvalid = verifyWebhookSignature(rawBody, timestamp, 'tampered_signature', secret);
    expect(isInvalid).toBe(false);
  });

  it('strictly protects third-party or demo assets (sxafwhcs) from cloud deletion', async () => {
    const result = await safeDeleteCloudinaryAsset('sxafwhcs-demo-video', 'sxafwhcs');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('لا يمكن حذف هذا الملف السحابي لأنه يتبع حساب (sxafwhcs)');
  });
});
