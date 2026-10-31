import fs from 'fs';
import path from 'path';

function findLinks(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (f.name !== 'node_modules' && f.name !== '.next') findLinks(full);
    } else if (f.name.endsWith('.tsx') || f.name.endsWith('.jsx')) {
      const content = fs.readFileSync(full, 'utf-8');
      const targetMatches = content.match(/<a[^>]*target=["']_blank["'][^>]*>/gi) || [];
      for (const m of targetMatches) {
        if (!m.includes('rel=') || !m.includes('noopener')) {
          console.log(`[Missing rel=noopener] ${path.relative(process.cwd(), full)}: ${m}`);
        }
      }
    }
  }
}

console.log('=== Checking target="_blank" without rel="noopener noreferrer" ===');
findLinks('src');
