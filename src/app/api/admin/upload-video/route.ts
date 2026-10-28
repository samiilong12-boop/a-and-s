import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminSession } from '@/lib/serverAuth';

const ALLOWED_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.jpg', '.jpeg', '.png', '.webp', '.avif']);
const ALLOWED_MIME_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

const MAX_VIDEO_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;  // 8 MB

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Admin Session
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'غير مصرح برفع ملفات الميديا بدون جلسة إدارة معتمدة' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('video') as File | null;
    const mediaType = (formData.get('type') as string) || 'video';

    if (!file) {
      return NextResponse.json({ error: 'لم يتم اختيار ملف' }, { status: 400 });
    }

    const rawExt = path.extname(file.name || '').toLowerCase();
    const ext = rawExt || (mediaType === 'video' ? '.mp4' : '.jpg');

    // 2. Validate Whitelist Extension
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم أو غير آمن. الصيغ المسموحة: mp4, webm, jpg, png, webp' },
        { status: 400 }
      );
    }

    // 3. Validate MIME Type
    if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'نوع وسائط غير متطابق مع الامتداد المسموح' },
        { status: 400 }
      );
    }

    // 4. Validate File Size Limits (Anti-DoS)
    const isVideo = mediaType === 'video' || ext === '.mp4' || ext === '.webm' || ext === '.mov';
    const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `حجم الملف يتجاوز الحد الأقصى المسموح (${isVideo ? '25 ميجابايت للفيديو' : '8 ميجابايت للصور'}).`,
        },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let relativeUrl = '';

    // Safe sanitized random filename
    const safeFileName = `raheeq-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;

    // Attempt local file write (works in local Node dev)
    try {
      const videosDir = path.join(process.cwd(), 'public', 'videos');
      if (!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir, { recursive: true });
      }
      const filePath = path.join(videosDir, safeFileName);
      fs.writeFileSync(filePath, buffer);
      relativeUrl = `/videos/${safeFileName}`;
    } catch (fsErr) {
      // On Vercel / serverless (read-only filesystem): use base64 data URL
      const mime = file.type || (isVideo ? 'video/mp4' : 'image/jpeg');
      relativeUrl = `data:${mime};base64,${buffer.toString('base64')}`;
    }

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      name: safeFileName,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Error handling media upload:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء معالجة الملف' }, { status: 500 });
  }
}
