import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('video') as File | null;
    const mediaType = (formData.get('type') as string) || 'video';

    if (!file) {
      return NextResponse.json({ error: 'لم يتم اختيار ملف' }, { status: 400 });
    }

    const originalName = file.name || 'custom-media';
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let relativeUrl = '';

    // Attempt local file write (works locally)
    try {
      const videosDir = path.join(process.cwd(), 'public', 'videos');
      if (!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir, { recursive: true });
      }
      const ext = path.extname(originalName).toLowerCase() || (mediaType === 'video' ? '.mp4' : '.jpg');
      const fileName = `custom-hero-${Date.now()}${ext}`;
      const filePath = path.join(videosDir, fileName);
      fs.writeFileSync(filePath, buffer);
      relativeUrl = `/videos/${fileName}`;
    } catch (fsErr) {
      // On Vercel / serverless (read-only filesystem): use base64 data URL
      const mime = file.type || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg');
      relativeUrl = `data:${mime};base64,${buffer.toString('base64')}`;
    }

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      name: originalName,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Error handling media upload:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء معالجة الملف' }, { status: 500 });
  }
}
