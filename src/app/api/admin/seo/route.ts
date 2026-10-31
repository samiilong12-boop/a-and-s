import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminSession } from '@/lib/serverAuth';
import { prisma, isDatabaseConnected } from '@/lib/prisma';
import { CATEGORY_REGISTRY, loadCatalogProducts } from '@/lib/catalog';

const seoConfigPath = path.join(process.cwd(), 'public', 'data', 'seo-config.json');

export interface SeoGrowthConfig {
  productSeo: Record<string, {
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    ogImageUrl?: string;
  }>;
  categorySeo: Record<string, {
    titleAr?: string;
    descriptionAr?: string;
    metaTitleAr?: string;
    metaDescAr?: string;
    keywords?: string[];
  }>;
  googleVerificationCode?: string;
  articles: Array<{
    id: string;
    slug: string;
    title: string;
    summary: string;
    content: string;
    targetKeywords: string[];
    linkedPerfumes: string[];
    updatedAt: string;
  }>;
  updatedAt: string;
}

const DEFAULT_SEO_CONFIG: SeoGrowthConfig = {
  productSeo: {},
  categorySeo: {},
  googleVerificationCode: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  articles: [
    {
      id: 'guide-1',
      slug: 'fragrance-concentration-guide',
      title: 'دليل تركيزات العطور النيش: الفارق بين Extrait de Parfum و Eau de Parfum',
      summary: 'شرح علمي مفصل من خبراء دار رحيق حول كثافة الزيوت العطرية وثباتها على الأقمشة لأكثر من 14 ساعة.',
      content: 'يحدد تركيز الزيوت العطرية النقية قوة الفوحان وساعات الثبات. في دار رحيق نعتمد تركيزات إكستري فاخرة...',
      targetKeywords: ['تركيز العطور', 'ثبات العطور', 'Extrait de Parfum', 'عطور نيش مصر'],
      linkedPerfumes: ['dior-sauvage-elixir', 'creed-aventus', 'bleu-de-chanel-parfum'],
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'guide-2',
      slug: 'doorstep-inspection-guarantee',
      title: 'أصول تجربة العطور الملكية: بروتوكول المعاينة عند الباب قبل السداد كاش',
      summary: 'كيف تضمن دار رحيق حق العميل في فتح الصندوق والتأكد من الزجاجة والعبوة الفاخرة قبل دفع أي مليم.',
      content: 'حرصاً على أعلى معايير الشفافية، تتيح دار رحيق لكل عميل في القاهرة وجميع المحافظات حق فحص الطرد...',
      targetKeywords: ['معاينة عند الاستلام', 'الدفع عند الاستلام عطور', 'شراء عطور كاش'],
      linkedPerfumes: ['baccarat-rouge-540', 'tom-ford-tobacco-vanille'],
      updatedAt: new Date().toISOString(),
    },
  ],
  updatedAt: new Date().toISOString(),
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Prisma Postgres
    const hasDb = await isDatabaseConnected();
    if (hasDb) {
      const record = await prisma.storeSetting.findUnique({
        where: { key: 'seo_growth_config' },
      });
      if (record && record.value) {
        return NextResponse.json(JSON.parse(record.value));
      }
    }
  } catch (err) {
    console.warn('Prisma get seo-config error:', err);
  }

  // 2. Local JSON
  try {
    if (fs.existsSync(seoConfigPath)) {
      const data = fs.readFileSync(seoConfigPath, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    }
  } catch {}

  return NextResponse.json(DEFAULT_SEO_CONFIG);
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'غير مصرح بتعديل إعدادات السيو والظهور بدون صلاحيات الإدارة' },
        { status: 401 }
      );
    }

    const payload = await req.json();
    const mergedConfig: SeoGrowthConfig = {
      ...DEFAULT_SEO_CONFIG,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    // 1. Save to Prisma if available
    try {
      const hasDb = await isDatabaseConnected();
      if (hasDb) {
        await prisma.storeSetting.upsert({
          where: { key: 'seo_growth_config' },
          create: {
            key: 'seo_growth_config',
            value: JSON.stringify(mergedConfig),
          },
          update: {
            value: JSON.stringify(mergedConfig),
          },
        });
      }
    } catch (dbErr) {
      console.warn('Prisma save seo-config error:', dbErr);
    }

    // 2. Save locally
    try {
      const dir = path.dirname(seoConfigPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(seoConfigPath, JSON.stringify(mergedConfig, null, 2), 'utf-8');
    } catch (fsErr) {
      console.warn('Local save seo-config warning:', fsErr);
    }

    return NextResponse.json({
      success: true,
      message: 'تم حفظ وتحديث إعدادات السيو ومحركات البحث بنجاح ✓',
      config: mergedConfig,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'فشل في حفظ إعدادات السيو' },
      { status: 500 }
    );
  }
}
