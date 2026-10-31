import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DEFAULT_SITE_CONTENT, SiteContentConfig } from '@/lib/siteContent';
import { verifyAdminSession } from '@/lib/serverAuth';
import { prisma, isDatabaseConnected } from '@/lib/prisma';

let inMemoryConfig: SiteContentConfig = {
  ...DEFAULT_SITE_CONTENT,
  updatedAt: new Date().toISOString(),
};

const configFilePath = path.join(process.cwd(), 'public', 'videos', 'hero-config.json');

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function sanitizeConfigForPublic(config: SiteContentConfig): SiteContentConfig {
  const sanitized = { ...config };
  if (sanitized.brandLogoUrl && sanitized.brandLogoUrl.startsWith('data:image/') && sanitized.brandLogoUrl.length > 15000) {
    sanitized.brandLogoUrl = '/images/raheeq-official-logo.webp';
  }
  if (sanitized.studioBottleLabelImage && sanitized.studioBottleLabelImage.length > 5000) {
    sanitized.studioBottleLabelImage = '';
  }
  if (sanitized.studioCustomBottleImage && sanitized.studioCustomBottleImage.length > 5000) {
    sanitized.studioCustomBottleImage = '';
  }
  return sanitized;
}

export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdminSession(req);
  let resolvedConfig = inMemoryConfig;

  // 1. First priority: Cloud database (Prisma Postgres)
  try {
    const hasDb = await isDatabaseConnected();
    if (hasDb) {
      const setting = await prisma.storeSetting.findUnique({
        where: { key: 'site_content_config' },
      });
      if (setting && setting.value) {
        const parsed = JSON.parse(setting.value);
        inMemoryConfig = { ...inMemoryConfig, ...parsed };
        resolvedConfig = inMemoryConfig;
      }
    }
  } catch (dbErr) {
    console.warn('Prisma get hero-config warning:', dbErr);
  }

  // 2. Second priority: Local static config file if DB didn't return
  if (resolvedConfig === inMemoryConfig) {
    try {
      if (fs.existsSync(configFilePath)) {
        const data = fs.readFileSync(configFilePath, 'utf-8');
        const parsed = JSON.parse(data);
        inMemoryConfig = { ...inMemoryConfig, ...parsed };
        resolvedConfig = inMemoryConfig;
      }
    } catch {}
  }

  // Serve full config to authorized admin dashboard, but lightweight payload to public visitors
  const finalPayload = isAdmin ? resolvedConfig : sanitizeConfigForPublic(resolvedConfig);
  return NextResponse.json(finalPayload);
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

    // 1. Save to Cloud database (Prisma Postgres) for permanent multi-device sync
    try {
      const hasDb = await isDatabaseConnected();
      if (hasDb) {
        const payloadString = JSON.stringify(inMemoryConfig);
        await prisma.storeSetting.upsert({
          where: { key: 'site_content_config' },
          update: { value: payloadString },
          create: {
            key: 'site_content_config',
            value: payloadString,
            description: 'Global site content banners, logos, and promotional media',
          },
        });
      }
    } catch (dbErr) {
      console.warn('Prisma save hero-config warning:', dbErr);
    }

    // 2. Write to local file if environment allows
    try {
      const dir = path.dirname(configFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(configFilePath, JSON.stringify(inMemoryConfig, null, 2), 'utf-8');
    } catch {}

    return NextResponse.json({ success: true, config: inMemoryConfig });
  } catch (error: any) {
    console.error('Error updating site content config:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ في تحديث البيانات' }, { status: 500 });
  }
}
