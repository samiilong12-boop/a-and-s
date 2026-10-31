import fs from 'fs';

function parseReport() {
  const data = JSON.parse(fs.readFileSync('./scripts/lighthouse-report.json', 'utf-8'));
  const cats = data.categories;
  console.log('=== Lighthouse Mobile Scores ===');
  console.log('Performance:', Math.round(cats.performance.score * 100));
  console.log('Accessibility:', Math.round(cats.accessibility.score * 100));
  console.log('Best Practices:', Math.round(cats['best-practices'].score * 100));
  console.log('SEO:', Math.round(cats.seo.score * 100));

  console.log('\n=== Core Web Vitals (Mobile) ===');
  const audits = data.audits;
  console.log('FCP:', audits['first-contentful-paint'].displayValue, audits['first-contentful-paint'].numericValue, 'ms');
  console.log('LCP:', audits['largest-contentful-paint'].displayValue, audits['largest-contentful-paint'].numericValue, 'ms');
  console.log('TBT:', audits['total-blocking-time'].displayValue, audits['total-blocking-time'].numericValue, 'ms');
  console.log('CLS:', audits['cumulative-layout-shift'].displayValue, audits['cumulative-layout-shift'].numericValue);
  console.log('Speed Index:', audits['speed-index'].displayValue, audits['speed-index'].numericValue, 'ms');

  console.log('\n=== LCP Element ===');
  console.log(audits['largest-contentful-paint-element']?.details?.items?.[0]?.node?.snippet || 'None');

  console.log('\n=== Network & Total Transfer ===');
  console.log('Total Byte Weight:', audits['total-byte-weight']?.displayValue, audits['total-byte-weight']?.numericValue);
  
  if (audits['render-blocking-resources']?.details?.items?.length) {
    console.log('\n=== Render-blocking Resources ===');
    for (const item of audits['render-blocking-resources'].details.items) {
      console.log(item.url, item.wastedMs, 'ms');
    }
  } else {
    console.log('\n=== Render-blocking Resources: NONE! ===');
  }

  if (audits['network-requests']?.details?.items) {
    const items = audits['network-requests'].details.items;
    console.log('\n=== Total Network Requests:', items.length);
    const videos = items.filter(i => i.url.includes('.mp4') || i.resourceType === 'Media');
    console.log('Video requests during initial load:', videos.length);
    for (const v of videos) {
      console.log('Video transfer:', v.url, v.transferSize, 'bytes');
    }
  }
}

parseReport();
