import { MetadataRoute } from 'next';
import { loadCatalogProducts, getAllCategories } from '@/lib/catalog';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://a-and-s.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const products = loadCatalogProducts();
  const categories = getAllCategories();
  const now = new Date();

  // Static high-value routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/catalog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/fragrance-guide`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/track-order`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Indexable category landing pages
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/category/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Product detail pages
  const productRoutes: MetadataRoute.Sitemap = products.map((prod) => ({
    url: `${SITE_URL}/product/${prod.slug || prod.id}`,
    lastModified: prod.updatedAt ? new Date(prod.updatedAt) : now,
    changeFrequency: 'weekly',
    priority: prod.isBestseller ? 0.9 : 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
