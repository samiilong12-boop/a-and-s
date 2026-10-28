import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DEFAULT_SITE_CONTENT, SiteContentConfig } from '@/lib/siteContent';
import { verifyAdminSession } from '@/lib/serverAuth';

let inMemoryConfig: SiteContentConfig = {
  ...DEFAULT_SITE_CONTENT,
  updatedAt: new Date().toISOString(),
};

const configFilePath = path.join(process.cwd(), 'public', 'videos', 'hero-config.json');

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (fs.existsSync(configFilePath)) {
      const data = fs.readFileSync(configFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      inMemoryConfig = { ...inMemoryConfig, ...parsed };
      return NextResponse.json(inMemoryConfig);
    }
  } catch (error) {
    // Vercel serverless fallback
  }
  return NextResponse.json(inMemoryConfig);
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'غير مصرح بتعديل محتوى وتكوين الموقع بدون جلسة إدارة نشطة' },
        { status: 401 }
      );
    }

    const body = await req.json();
    inMemoryConfig = {
      ...inMemoryConfig,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    try {
      const dir = path.dirname(configFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(configFilePath, JSON.stringify(inMemoryConfig, null, 2), 'utf-8');
    } catch (fsErr) {
      // Gracefully continue on read-only serverless filesystems
      console.warn('Filesystem read-only (e.g. Vercel), maintained in memory:', fsErr);
    }

    return NextResponse.json({ success: true, config: inMemoryConfig });
  } catch (error: any) {
    console.error('Error updating site content config:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ في تحديث البيانات' }, { status: 500 });
  }
}
