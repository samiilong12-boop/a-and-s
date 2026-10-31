async function checkHeroConfig() {
  const res = await fetch('https://a-and-s.vercel.app/api/admin/hero-config');
  const json = await res.json();
  console.log('Keys:', Object.keys(json));
  for (const [k, v] of Object.entries(json)) {
    if (typeof v === 'string' && v.length > 500) {
      console.log(`Key ${k} length: ${v.length} characters (starts with: ${v.slice(0, 50)})`);
    }
  }
}
checkHeroConfig().catch(console.error);
