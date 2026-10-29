const { execSync } = require('child_process');

const url = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;

if (url && !url.includes('localhost') && !url.includes('127.0.0.1')) {
  console.log('[Prisma Postgres] Remote database detected. Synchronizing schema tables...');
  try {
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      timeout: 45000,
      env: {
        ...process.env,
        DATABASE_URL: url,
      },
    });
    console.log('[Prisma Postgres] All tables (Product, Order, Category, etc.) synchronized successfully!');
  } catch (err) {
    console.warn('[Prisma Postgres] Schema push warning (continuing build):', err.message);
  }
} else {
  console.log('[Prisma Postgres] No remote production database URL provided. Skipping db push.');
}
