import { PrismaClient } from '@prisma/client';

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
    if (!process.env.DATABASE_URL) return false;
    // Fast ping query
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
