import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function optimizeImages() {
  const images = [
    {
      src: 'public/images/campaign/as-signature-male-spray.jpg',
      outWebp: 'public/images/campaign/as-signature-male-spray.webp',
      outMobileWebp: 'public/images/campaign/as-signature-male-spray-mobile.webp',
    },
    {
      src: 'public/images/campaign/female-coastal-spray.jpg',
      outWebp: 'public/images/campaign/female-coastal-spray.webp',
    },
    {
      src: 'public/images/campaign/couple-sunset-romance.jpg',
      outWebp: 'public/images/campaign/couple-sunset-romance.webp',
    },
    {
      src: 'public/images/raheeq-official-logo.png',
      outWebp: 'public/images/raheeq-official-logo.webp',
      outPng: 'public/images/raheeq-official-logo-opt.png',
    },
  ];

  for (const img of images) {
    if (!fs.existsSync(img.src)) {
      console.warn(`File not found: ${img.src}`);
      continue;
    }
    const meta = await sharp(img.src).metadata();
    const origStat = fs.statSync(img.src);
    console.log(`\nOriginal: ${img.src} | ${meta.width}x${meta.height} | ${origStat.size} bytes`);

    // Standard high-quality WebP (quality: 82)
    await sharp(img.src)
      .webp({ quality: 82, effort: 6 })
      .toFile(img.outWebp);
    const webpStat = fs.statSync(img.outWebp);
    console.log(`-> WebP: ${img.outWebp} | ${webpStat.size} bytes (${Math.round((1 - webpStat.size / origStat.size) * 100)}% reduction)`);

    // If male spray, create a responsive mobile variant at 720w
    if (img.outMobileWebp) {
      await sharp(img.src)
        .resize({ width: 720, withoutEnlargement: true })
        .webp({ quality: 80, effort: 6 })
        .toFile(img.outMobileWebp);
      const mStat = fs.statSync(img.outMobileWebp);
      console.log(`-> Mobile WebP (720w): ${img.outMobileWebp} | ${mStat.size} bytes (${Math.round((1 - mStat.size / origStat.size) * 100)}% reduction)`);
    }

    // If logo, optimize PNG as well
    if (img.outPng) {
      await sharp(img.src)
        .resize({ width: 256, height: 256, fit: 'inside', withoutEnlargement: true })
        .png({ compressionLevel: 9, quality: 90 })
        .toFile(img.outPng);
      const pngStat = fs.statSync(img.outPng);
      console.log(`-> Optimized PNG: ${img.outPng} | ${pngStat.size} bytes (${Math.round((1 - pngStat.size / origStat.size) * 100)}% reduction)`);
    }
  }
}

optimizeImages().catch(console.error);
