import { PrismaClient } from '@prisma/client';

// Detect all potential PostgreSQL connection strings injected by Vercel or Prisma Postgres
const possibleDatabaseUrls = [
  process.env.DATABASE_URL,
  process.env.POSTGRES_PRISMA_URL,
  process.env.PRISMA_DATABASE_URL,
  process.env.DATABASE_URL_POOLED,
  process.env.POSTGRES_URL,
  process.env.POSTGRES_URL_NON_POOLING,
  process.env.DIRECT_URL,
];

// Pick the first remote PostgreSQL URL (excluding localhost if in production)
const remoteUrl = possibleDatabaseUrls.find(
  (u) =>
    typeof u === 'string' &&
    u.startsWith('postgres') &&
    !(process.env.NODE_ENV === 'production' && (u.includes('localhost') || u.includes('127.0.0.1')))
);

if (remoteUrl) {
  process.env.DATABASE_URL = remoteUrl;
}

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  const activeUrl = remoteUrl || process.env.DATABASE_URL;
  return new PrismaClient({
    datasources: activeUrl ? { db: { url: activeUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
};

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

/**
 * Robust check if a live database connection is operational.
 * Automatically guarantees the StoreSetting table exists via raw SQL.
 */
export async function isDatabaseConnected(): Promise<boolean> {
  try {
    const url = remoteUrl || process.env.DATABASE_URL;
    if (!url || (process.env.NODE_ENV === 'production' && url.includes('localhost'))) {
      return false;
    }

    // Ping PostgreSQL
    await prisma.$queryRaw`SELECT 1 as ping`;

    // Ensure the StoreSetting table exists automatically in PostgreSQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "StoreSetting" (
        "key" TEXT PRIMARY KEY,
        "value" TEXT NOT NULL,
        "description" TEXT,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    return true;
  } catch (err) {
    console.warn('[Prisma] Database connection or init check failed:', err);
    return false;
  }
}
