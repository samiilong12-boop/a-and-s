import { PrismaClient } from '@prisma/client';

// If Vercel Postgres sets POSTGRES_PRISMA_URL, ensure DATABASE_URL is populated
if (!process.env.DATABASE_URL && process.env.POSTGRES_PRISMA_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
}

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
};

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

/**
 * Helper to check if a live database connection is operational
 */
export async function isDatabaseConnected(): Promise<boolean> {
  try {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
    if (!url) return false;
    if (process.env.NODE_ENV === 'production' && url.includes('localhost')) return false;
    // Fast ping query
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

