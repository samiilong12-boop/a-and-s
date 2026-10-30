const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.findMany();
    console.log('DB products count:', products.length);
    if (products.length > 0) {
      console.log('DB products:', products.map(p => ({ id: p.id, nameEn: p.nameEn, nameAr: p.nameAr })));
    }
    const cat = await prisma.storeSetting.findUnique({ where: { key: 'catalog_products' } });
    if (cat && cat.value) {
      const parsed = JSON.parse(cat.value);
      console.log('catalog_products setting count:', parsed.length);
      console.log('catalog_products names:', parsed.map(p => p.nameEn || p.nameAr));
    } else {
      console.log('No catalog_products setting in DB');
    }
  } catch (e) {
    console.error('DB Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
