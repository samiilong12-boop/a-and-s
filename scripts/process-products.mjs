import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const srcDir = 'C:/Users/same/.gemini/antigravity/brain/992f577b-36dd-4786-a627-aa62f7ffa108/scratch/extracted_products';
const outDir = path.join(process.cwd(), 'public', 'images', 'products');
const thumbDir = path.join(outDir, 'thumbnails');

if (!fs.existsSync(thumbDir)) {
  fs.mkdirSync(thumbDir, { recursive: true });
}

const mapping = [
  {
    src: 'WhatsApp Image 2026-10-28 at 10.47.51 PM.jpeg',
    dest: 'dior-sauvage-elixir.webp',
  },
  {
    src: 'WhatsApp Image 2026-10-28 at 10.47.50 PM.jpeg',
    dest: 'bleu-de-chanel.webp',
  },
  {
    src: 'WhatsApp Image 2026-10-28 at 10.47.49 PM.jpeg',
    dest: 'le-male-le-parfum.webp',
  },
  {
    src: 'WhatsApp Image 2026-10-28 at 10.47.51 PM (1).jpeg',
    dest: 'amber-leather.webp',
  },
  {
    src: 'WhatsApp Image 2026-10-26 at 10.05.02 PM (1).jpeg',
    dest: 'savage-edp.webp',
  },
  {
    src: 'WhatsApp Image 2026-10-28 at 10.47.50 PM (1).jpeg',
    dest: 'azzaro-most-wanted.webp',
  },
  {
    src: 'WhatsApp Image 2026-10-28 at 10.24.21 PM.jpeg',
    dest: 'khmrah.webp',
  },
  {
    src: 'WhatsApp Image 2026-10-26 at 11.08.48 PM (1).jpeg',
    dest: 'misk-al-rumman.webp',
  },
  {
    src: 'WhatsApp Image 2026-10-26 at 11.08.48 PM.jpeg',
    dest: 'shroty.webp',
  },
  {
    src: 'WhatsApp Image 2026-10-28 at 10.47.51 PM (2).jpeg',
    dest: 'phantom.webp',
  },
];

async function run() {
  for (const item of mapping) {
    const inputPath = path.join(srcDir, item.src);
    const thumbPath = path.join(thumbDir, item.dest);

    await sharp(inputPath)
      .resize({ width: 420, withoutEnlargement: true })
      .webp({ quality: 80, effort: 6, smartSubsample: true })
      .toFile(thumbPath);

    const thumbSize = (fs.statSync(thumbPath).size / 1024).toFixed(1);
    console.log(`[Thumb] ${item.dest}: ${thumbSize} KB`);
  }
}

run().catch(console.error);
