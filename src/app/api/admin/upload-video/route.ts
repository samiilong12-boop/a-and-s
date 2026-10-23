import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('video') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'لم يتم اختيار ملف فيديو' }, { status: 400 });
    }

    // Limit check (e.g. up to 100MB)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: 'حجم الفيديو كبير جداً. الحد الأقصى 100 ميجابايت' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const videosDir = path.join(process.cwd(), 'public', 'videos');
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }

    // Determine extension or fallback to mp4
    const originalName = file.name || 'custom-hero.mp4';
    const ext = path.extname(originalName).toLowerCase() || '.mp4';
    const fileName = `custom-hero${ext}`;
    const filePath = path.join(videosDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/videos/${fileName}?v=${Date.now()}`;

    // Automatically update hero-config.json
    const configFilePath = path.join(videosDir, 'hero-config.json');
    const newConfig = {
      activeVideoUrl: relativeUrl,
      visualMode: 'video',
      videoTitle: `فيديو مرفوع من الجهاز (${originalName})`,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(configFilePath, JSON.stringify(newConfig, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      name: originalName,
      size: file.size,
      config: newConfig,
    });
  } catch (error: any) {
    console.error('Error handling video upload:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء حفظ الفيديو' }, { status: 500 });
  }
}
