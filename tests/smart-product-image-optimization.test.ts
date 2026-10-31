import { describe, it, expect } from 'vitest';
import {
  isCloudinaryUrl,
  parseCloudinaryUrl,
  getOptimizedProductImageUrl,
  buildProductResponsiveImage,
} from '../src/lib/cloudinary';
import { OPTIMIZATION_PRESETS } from '../src/lib/clientImageOptimizer';

describe('Smart Product Image Optimization & Delivery System', () => {
  it('correctly identifies and parses Cloudinary image delivery URLs', () => {
    const sampleUrl = 'https://res.cloudinary.com/raheeq-cloud/image/upload/v1793450000/raheeq/products/royal-oud-flacon.png';
    expect(isCloudinaryUrl(sampleUrl)).toBe(true);

    const parsed = parseCloudinaryUrl(sampleUrl);
    expect(parsed).not.toBeNull();
    expect(parsed?.cloudName).toBe('raheeq-cloud');
    expect(parsed?.resourceType).toBe('image');
    expect(parsed?.version).toBe('v1793450000');
    expect(parsed?.publicId).toBe('raheeq/products/royal-oud-flacon');
    expect(parsed?.extension).toBe('png');
  });

  it('generates non-destructive delivery-time transformations with c_limit, f_auto, and q_auto', () => {
    const rawCloudUrl = 'https://res.cloudinary.com/raheeq-cloud/image/upload/v1793450000/raheeq/products/aventus-inspired.jpg';

    const optimized800 = getOptimizedProductImageUrl(rawCloudUrl, 800, 'balanced');
    expect(optimized800).toContain('/image/upload/c_limit,w_800,q_auto,f_auto/v1793450000/raheeq/products/aventus-inspired.jpg');

    const maxQuality1200 = getOptimizedProductImageUrl(rawCloudUrl, 1200, 'max_quality');
    expect(maxQuality1200).toContain('/image/upload/c_limit,w_1200,q_auto:best,f_auto/');

    const maxSavings480 = getOptimizedProductImageUrl(rawCloudUrl, 480, 'max_savings');
    expect(maxSavings480).toContain('/image/upload/c_limit,w_480,q_auto:eco,f_auto/');
  });

  it('safely passes through non-Cloudinary local and static images without corruption', () => {
    const localSvg = 'data:image/svg+xml;base64,PHN2Z...';
    expect(isCloudinaryUrl(localSvg)).toBe(false);
    expect(getOptimizedProductImageUrl(localSvg, 800)).toBe(localSvg);

    const localStatic = '/images/campaign/as-signature-male-spray.jpg';
    expect(isCloudinaryUrl(localStatic)).toBe(false);
    expect(getOptimizedProductImageUrl(localStatic, 480)).toBe(localStatic);
  });

  it('builds responsive srcset and sizes for product card and detail flacon showcase', () => {
    const cloudUrl = 'https://res.cloudinary.com/raheeq-cloud/image/upload/raheeq/products/sauvage-elixir.webp';
    const responsive = buildProductResponsiveImage(cloudUrl, 'balanced');

    expect(responsive.src).toContain('c_limit,w_800,q_auto,f_auto');
    expect(responsive.thumbnailUrl).toContain('c_limit,w_480,q_auto,f_auto');
    expect(responsive.detailUrl).toContain('c_limit,w_1200,q_auto,f_auto');
    expect(responsive.zoomUrl).toContain('c_limit,w_1800,q_auto,f_auto');
    expect(responsive.srcSet).toContain('480w');
    expect(responsive.srcSet).toContain('800w');
    expect(responsive.srcSet).toContain('1200w');
    expect(responsive.srcSet).toContain('1800w');
    expect(responsive.sizes).toBe('(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw');
  });

  it('configures safe presets preventing upscaling and preserving luxury transparency', () => {
    expect(OPTIMIZATION_PRESETS.balanced.maxDimension).toBe(1600);
    expect(OPTIMIZATION_PRESETS.balanced.preserveTransparency).toBe(true);
    expect(OPTIMIZATION_PRESETS.max_quality.quality).toBeGreaterThanOrEqual(0.9);
    expect(OPTIMIZATION_PRESETS.max_savings.maxDimension).toBe(1200);
  });
});
