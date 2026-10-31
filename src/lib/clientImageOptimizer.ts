/**
 * RAHEEQ Haute Parfumerie — Smart Client-Side Image Optimizer
 * 
 * Safely inspects, downscales, and optimizes perfume product images
 * BEFORE upload, maintaining luxury flacon sharpness, gold foil details,
 * and transparent backgrounds.
 */

export type OptimizationMode = 'balanced' | 'max_quality' | 'max_savings';

export interface ImageOptimizationConfig {
  mode: OptimizationMode;
  maxDimension: number;
  quality: number;
  preserveTransparency: boolean;
}

export const OPTIMIZATION_PRESETS: Record<OptimizationMode, ImageOptimizationConfig> = {
  balanced: {
    mode: 'balanced',
    maxDimension: 1600,
    quality: 0.85,
    preserveTransparency: true,
  },
  max_quality: {
    mode: 'max_quality',
    maxDimension: 2048,
    quality: 0.92,
    preserveTransparency: true,
  },
  max_savings: {
    mode: 'max_savings',
    maxDimension: 1200,
    quality: 0.76,
    preserveTransparency: true,
  },
};

export interface ImageAnalysisResult {
  originalFile: File;
  optimizedFile: File;
  originalSize: number;
  optimizedSize: number;
  savedBytes: number;
  savedPercentage: number;
  originalWidth: number;
  originalHeight: number;
  optimizedWidth: number;
  optimizedHeight: number;
  hasTransparency: boolean;
  mimeType: string;
  previewUrl: string;
}

/**
 * Inspects a canvas image context to detect transparent pixels (alpha < 250).
 * Scans a sample grid of pixels for high performance even on 20MP photos.
 */
function detectTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    const stepX = Math.max(1, Math.floor(width / 50));
    const stepY = Math.max(1, Math.floor(height / 50));
    
    // Check border and cross-section pixels
    for (let y = 0; y < height; y += stepY) {
      for (let x = 0; x < width; x += stepX) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        if (pixel[3] < 250) {
          return true; // Found transparent or semi-transparent pixel
        }
      }
    }
  } catch {
    // Cross-origin or security restriction, fallback to checking file mime type
  }
  return false;
}

/**
 * Optimizes a product image file client-side before upload.
 */
export async function optimizeProductImage(
  file: File,
  mode: OptimizationMode = 'balanced'
): Promise<ImageAnalysisResult> {
  const config = OPTIMIZATION_PRESETS[mode] || OPTIMIZATION_PRESETS.balanced;
  const originalSize = file.size;

  // Non-image fallback
  if (!file.type.startsWith('image/')) {
    throw new Error('الملف المختار ليس صورة صالحة');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('فشل قراءة ملف الصورة'));
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        reject(new Error('محتوى ملف الصورة فارغ'));
        return;
      }

      const img = new Image();
      img.onerror = () => {
        // Fallback: return original file
        resolve({
          originalFile: file,
          optimizedFile: file,
          originalSize,
          optimizedSize: originalSize,
          savedBytes: 0,
          savedPercentage: 0,
          originalWidth: 800,
          originalHeight: 1000,
          optimizedWidth: 800,
          optimizedHeight: 1000,
          hasTransparency: file.type.includes('png'),
          mimeType: file.type,
          previewUrl: dataUrl,
        });
      };

      img.onload = async () => {
        const originalWidth = img.naturalWidth || img.width;
        const originalHeight = img.naturalHeight || img.height;

        let targetWidth = originalWidth;
        let targetHeight = originalHeight;

        // Never upscale smaller originals
        if (originalWidth > config.maxDimension || originalHeight > config.maxDimension) {
          if (originalWidth >= originalHeight) {
            targetHeight = Math.round((originalHeight * config.maxDimension) / originalWidth);
            targetWidth = config.maxDimension;
          } else {
            targetWidth = Math.round((originalWidth * config.maxDimension) / originalHeight);
            targetHeight = config.maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          // Fallback if canvas context fails
          resolve({
            originalFile: file,
            optimizedFile: file,
            originalSize,
            optimizedSize: originalSize,
            savedBytes: 0,
            savedPercentage: 0,
            originalWidth,
            originalHeight,
            optimizedWidth: targetWidth,
            optimizedHeight: targetHeight,
            hasTransparency: file.type.includes('png'),
            mimeType: file.type,
            previewUrl: dataUrl,
          });
          return;
        }

        // High quality bicubic rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Detect transparent background (e.g. perfume flacon cutout on transparent PNG)
        const isPng = file.type === 'image/png';
        const isWebp = file.type === 'image/webp';
        const hasTransparency = (isPng || isWebp) && detectTransparency(ctx, targetWidth, targetHeight);

        // Determine optimal export format:
        // If transparency is present, export to WebP (lossy with alpha) or PNG (lossless)
        // If opaque, export to WebP or JPEG
        let exportMime = 'image/webp';
        if (hasTransparency) {
          // Modern browsers support WebP with alpha at high quality
          exportMime = 'image/webp';
        } else {
          exportMime = 'image/webp';
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback to original
              resolve({
                originalFile: file,
                optimizedFile: file,
                originalSize,
                optimizedSize: originalSize,
                savedBytes: 0,
                savedPercentage: 0,
                originalWidth,
                originalHeight,
                optimizedWidth: targetWidth,
                optimizedHeight: targetHeight,
                hasTransparency,
                mimeType: file.type,
                previewUrl: dataUrl,
              });
              return;
            }

            // Quality gate: If optimized blob is larger than original file, use original!
            const useOriginal = blob.size >= originalSize && originalWidth <= config.maxDimension;
            const finalBlob = useOriginal ? file : blob;
            const optimizedSize = finalBlob.size;
            const savedBytes = Math.max(0, originalSize - optimizedSize);
            const savedPercentage = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

            const finalFile = new File(
              [finalBlob],
              useOriginal ? file.name : `${file.name.replace(/\.[^/.]+$/, '')}.webp`,
              { type: useOriginal ? file.type : exportMime }
            );

            const previewUrl = URL.createObjectURL(finalBlob);

            resolve({
              originalFile: file,
              optimizedFile: finalFile,
              originalSize,
              optimizedSize,
              savedBytes,
              savedPercentage,
              originalWidth,
              originalHeight,
              optimizedWidth: targetWidth,
              optimizedHeight: targetHeight,
              hasTransparency,
              mimeType: finalFile.type,
              previewUrl,
            });
          },
          exportMime,
          config.quality
        );
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}
