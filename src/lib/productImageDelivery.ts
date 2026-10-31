/**
 * RAHEEQ Haute Parfumerie — Pure Isomorphic Product Image Delivery Helpers
 * 
 * 100% Client-Safe (Zero Node.js 'fs', 'crypto', or server-only SDK dependencies).
 * Safe to import inside React Client Components, Storefront Cards, and Galleries.
 */

export interface ParsedCloudinaryUrl {
  cloudName: string;
  resourceType: 'image' | 'video';
  transformations?: string;
  version?: string;
  publicId: string;
  extension?: string;
}

/**
 * Checks if a string is a Cloudinary image or video delivery URL
 */
export function isCloudinaryUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('res.cloudinary.com') && (url.includes('/image/upload/') || url.includes('/video/upload/'));
}

/**
 * Parses a Cloudinary delivery URL into components cleanly without regex backtracking
 */
export function parseCloudinaryUrl(url: string): ParsedCloudinaryUrl | null {
  if (!isCloudinaryUrl(url)) return null;

  try {
    const prefixMatch = url.match(/^https?:\/\/res\.cloudinary\.com\/([^/]+)\/(image|video)\/upload\/(.+)$/);
    if (!prefixMatch) return null;

    const cloudName = prefixMatch[1];
    const resourceType = prefixMatch[2] as 'image' | 'video';
    const pathAfterUpload = prefixMatch[3];

    const parts = pathAfterUpload.split('/');
    let transformations: string | undefined;
    let version: string | undefined;
    let publicIdPartsStartIndex = 0;

    // Check if parts[0] is a version segment like v1793450000
    if (parts[0].startsWith('v') && /^\d+$/.test(parts[0].substring(1))) {
      version = parts[0];
      publicIdPartsStartIndex = 1;
    } else if (parts.length > 1 && (parts[0].includes(',') || parts[0].includes('_') || parts[0].includes(':'))) {
      transformations = parts[0];
      publicIdPartsStartIndex = 1;
      // Check if parts[1] is a version segment
      if (parts.length > 2 && parts[1].startsWith('v') && /^\d+$/.test(parts[1].substring(1))) {
        version = parts[1];
        publicIdPartsStartIndex = 2;
      }
    }

    let remainder = parts.slice(publicIdPartsStartIndex).join('/');
    let extension: string | undefined;
    const dotIdx = remainder.lastIndexOf('.');
    if (dotIdx !== -1 && dotIdx > remainder.lastIndexOf('/')) {
      extension = remainder.substring(dotIdx + 1);
      remainder = remainder.substring(0, dotIdx);
    }

    return {
      cloudName,
      resourceType,
      transformations,
      version,
      publicId: remainder,
      extension,
    };
  } catch {
    return null;
  }
}

/**
 * Returns an optimized delivery URL for a perfume product image at delivery time.
 * If the image is hosted on Cloudinary, applies automatic WebP/AVIF format (f_auto)
 * and intelligent perceptual quality (q_auto) along with non-upscaling dimension capping (c_limit,w_...).
 * If the image is local or external, returns it safely without modifying it.
 */
export function getOptimizedProductImageUrl(
  url: string | null | undefined,
  targetWidth: number = 800,
  qualityMode: 'balanced' | 'max_quality' | 'max_savings' = 'balanced'
): string {
  if (!url) return '';
  if (!isCloudinaryUrl(url)) return url;

  const parsed = parseCloudinaryUrl(url);
  if (!parsed || parsed.resourceType !== 'image') return url;

  // Select Cloudinary quality flag based on mode
  let qFlag = 'q_auto';
  if (qualityMode === 'max_quality') {
    qFlag = 'q_auto:best';
  } else if (qualityMode === 'max_savings') {
    qFlag = 'q_auto:eco';
  }

  // Build non-destructive delivery transformation
  // c_limit ensures small photos are NEVER upscaled while large ones are capped
  const transform = `c_limit,w_${targetWidth},${qFlag},f_auto`;
  const v = parsed.version ? `${parsed.version}/` : '';
  const ext = parsed.extension ? `.${parsed.extension}` : '';

  return `https://res.cloudinary.com/${parsed.cloudName}/image/upload/${transform}/${v}${parsed.publicId}${ext}`;
}

/**
 * Generates responsive srcset and sizes for product cards and detail galleries
 */
export function buildProductResponsiveImage(
  url: string | null | undefined,
  qualityMode: 'balanced' | 'max_quality' | 'max_savings' = 'balanced'
): {
  src: string;
  srcSet?: string;
  sizes?: string;
  thumbnailUrl: string;
  cardUrl: string;
  detailUrl: string;
  zoomUrl: string;
} {
  if (!url) {
    return {
      src: '',
      thumbnailUrl: '',
      cardUrl: '',
      detailUrl: '',
      zoomUrl: '',
    };
  }

  const defaultCard = getOptimizedProductImageUrl(url, 800, qualityMode);
  const thumb = getOptimizedProductImageUrl(url, 480, qualityMode);
  const detail = getOptimizedProductImageUrl(url, 1200, qualityMode);
  const zoom = getOptimizedProductImageUrl(url, 1800, qualityMode);

  if (!isCloudinaryUrl(url)) {
    return {
      src: url,
      thumbnailUrl: url,
      cardUrl: url,
      detailUrl: url,
      zoomUrl: url,
    };
  }

  const srcSet = `${thumb} 480w, ${defaultCard} 800w, ${detail} 1200w, ${zoom} 1800w`;
  const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  return {
    src: defaultCard,
    srcSet,
    sizes,
    thumbnailUrl: thumb,
    cardUrl: defaultCard,
    detailUrl: detail,
    zoomUrl: zoom,
  };
}
