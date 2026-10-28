import fs from 'fs';
import path from 'path';
import { FAMOUS_50_PERFUMES } from '../src/lib/data/products';

const targetPath = path.join(process.cwd(), 'public', 'data', 'products.json');
fs.writeFileSync(targetPath, JSON.stringify(FAMOUS_50_PERFUMES, null, 2), 'utf-8');
console.log(`Successfully generated public/data/products.json with ${FAMOUS_50_PERFUMES.length} perfumes.`);
