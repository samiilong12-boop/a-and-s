async function testAllJsonLd() {
  const res = await fetch('https://a-and-s.vercel.app/product/jpg-le-male-le-parfum');
  const html = await res.text();
  const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
  console.log('Total JSON-LD scripts on product page:', matches.length);
  for (let i = 0; i < matches.length; i++) {
    const parsed = JSON.parse(matches[i]);
    console.log(`\n--- Script ${i + 1} ---`);
    if (parsed['@graph']) {
      for (const item of parsed['@graph']) {
        console.log(`Type: ${item['@type']} | Name: ${item.name} | Brand: ${item.brand?.name} | Manufacturer: ${item.manufacturer?.name}`);
        if (item.offers) {
          console.log(`Offers (${item.offers.length}):`, item.offers[0]?.price, item.offers[0]?.priceCurrency);
        }
      }
    }
  }
}
testAllJsonLd().catch(console.error);
