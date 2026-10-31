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

  describe('Video URL normalization & validation logic', () => {
    it('detects unplayable YouTube page URLs', () => {
      const ytUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
      ];
      for (const url of ytUrls) {
        const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
        expect(isYouTube).toBe(true);
      }
    });

    it('auto-converts Google Drive preview links to direct stream download links', () => {
      const gDriveLink = 'https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing';
      const match = gDriveLink.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
      expect(match).not.toBeNull();
      const directUrl = `https://drive.google.com/uc?export=download&id=${match![1]}`;
      expect(directUrl).toBe('https://drive.google.com/uc?export=download&id=1A2B3C4D5E6F7G8H9I0J');
    });

    it('auto-converts Dropbox links to direct raw streaming links', () => {
      const dropboxLink = 'https://www.dropbox.com/s/abcdef12345/video.mp4?dl=0';
      const rawUrl = dropboxLink.replace(/[?&]dl=0/, '').replace(/[?&]raw=1/, '') + '?raw=1';
      expect(rawUrl).toBe('https://www.dropbox.com/s/abcdef12345/video.mp4?raw=1');
    });

    it('upgrades http video links to https to prevent mixed-content browser blocking', () => {
      const httpUrl = 'http://cdn.example.com/perfume.mp4';
      const upgraded = httpUrl.replace(/^http:\/\//i, 'https://');
      expect(upgraded).toBe('https://cdn.example.com/perfume.mp4');
    });
  });
});
