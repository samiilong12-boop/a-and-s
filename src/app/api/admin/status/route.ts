import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const detectedKeys: string[] = [];
  const possibleKeys = [
    'DATABASE_URL',
    'POSTGRES_PRISMA_URL',
    'PRISMA_DATABASE_URL',
    'POSTGRES_URL',
    'POSTGRES_URL_NON_POOLING',
    'DATABASE_PRISMA_URL',
  ];

  for (const k of possibleKeys) {
    if (process.env[k]) {
      detectedKeys.push(k);
    }
  }

  let dbConnected = false;
  let dbError: string | null = null;
  let hasStoreSettingTable = false;
  let siteContentStored = false;
  let catalogStored = false;
  let productTableCount = 0;

  try {
    const rawResult = await prisma.$queryRaw`SELECT 1 as ping`;
    dbConnected = Array.isArray(rawResult) && rawResult.length > 0;

    // Check storeSetting table
    try {
      const settings = await prisma.storeSetting.findMany({ select: { key: true } });
      hasStoreSettingTable = true;
      siteContentStored = settings.some((s) => s.key === 'site_content_config');
      catalogStored = settings.some((s) => s.key === 'catalog_products');
    } catch (e: any) {
      dbError = 'storeSetting table query error: ' + (e.message || String(e));
    }

    // Check product table
    try {
      productTableCount = await prisma.product.count();
    } catch {}
  } catch (err: any) {
    dbConnected = false;
    dbError = err.message || String(err);
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    detectedKeys,
    dbConnected,
    hasStoreSettingTable,
    siteContentStored,
    catalogStored,
    productTableCount,
    dbError,
  });
}
