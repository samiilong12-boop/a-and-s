import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { FAMOUS_50_PERFUMES } from '../src/lib/data/products';

describe('Sync Products Catalog to public/data/products.json', () => {
  it('syncs updated products without any base64 payloads', () => {
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'products.json');
    fs.writeFileSync(jsonPath, JSON.stringify(FAMOUS_50_PERFUMES, null, 2), 'utf-8');

    const fileContent = fs.readFileSync(jsonPath, 'utf-8');
    const parsed = JSON.parse(fileContent);

    expect(parsed.length).toBeGreaterThanOrEqual(56);
    expect(fileContent).not.toContain('data:image/jpeg;base64');
    console.log(`Successfully synced ${parsed.length} products to public/data/products.json!`);
  });
});
