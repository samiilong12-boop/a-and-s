async function checkAssets() {
  const res = await fetch('https://a-and-s.vercel.app/');
  const html = await res.text();
  const srcs = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m => m[1]);
  const localAssets = srcs.filter(s => s.startsWith('/') && !s.startsWith('/catalog') && !s.startsWith('/product') && !s.startsWith('/category'));
  const unique = [...new Set(localAssets)];
  console.log('Testing', unique.length, 'assets on live Vercel...');
  for (const asset of unique) {
    try {
      const aRes = await fetch('https://a-and-s.vercel.app' + asset, { method: 'HEAD' });
      if (aRes.status >= 400) {
        console.log(`[HTTP ${aRes.status}] https://a-and-s.vercel.app${asset}`);
      }
    } catch (e) {
      console.log(`[ERR] ${asset}:`, e.message);
    }
  }
  console.log('Done checking assets.');
}

checkAssets().catch(console.error);
