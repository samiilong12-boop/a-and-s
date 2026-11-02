import { describe, it, expect } from 'vitest';
import { getOptimizedVideoUrl, getOptimizedPosterUrl } from '../src/lib/videoOptimizer';

describe('Video Delivery Optimizer (Solutions 1 & 2)', () => {
  const sampleCloudinaryUrl =
    'https://res.cloudinary.com/sxafwhcs/video/upload/v1793560503/raheeq/hero-videos/raheeq/hero-videos/raheeq_hero_1793560497386_xjxr6.mp4';

  it('Solution 1: generates lightweight mobile stream with eco quality, 480p, and H.264', () => {
    const mobileUrl = getOptimizedVideoUrl(sampleCloudinaryUrl, true);
    expect(mobileUrl).toContain('/upload/q_auto:eco,f_auto,w_480,vc_h264/v1793560503/');
  });

  it('Solution 1: generates high-fidelity desktop stream with 720p and H.264', () => {
    const desktopUrl = getOptimizedVideoUrl(sampleCloudinaryUrl, false);
    expect(desktopUrl).toContain('/upload/q_auto,f_auto,w_720,vc_h264/v1793560503/');
  });

  it('Solution 1: leaves non-cloudinary URLs untouched', () => {
    const localVideo = '/videos/campaign-hero.mp4';
    expect(getOptimizedVideoUrl(localVideo, true)).toBe(localVideo);
    expect(getOptimizedVideoUrl(localVideo, false)).toBe(localVideo);
  });

  it('Solution 2: extracts instant poster snapshot at second 0 (so_0) in high-speed format (jpg/webp)', () => {
    const posterUrl = getOptimizedPosterUrl(sampleCloudinaryUrl);
    expect(posterUrl).toContain('/upload/so_0,f_auto,q_auto,w_1024/v1793560503/');
    expect(posterUrl.endsWith('.jpg')).toBe(true);
  });

  it('Solution 2: respects existing static images and posters without alteration', () => {
    const staticWebp = '/images/campaign/raheeq-hero-poster.webp';
    expect(getOptimizedPosterUrl(staticWebp)).toBe(staticWebp);

    const base64Data = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v39gAA=';
    expect(getOptimizedPosterUrl(base64Data)).toBe(base64Data);
  });
});
