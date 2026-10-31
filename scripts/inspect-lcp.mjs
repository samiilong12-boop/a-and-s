import fs from 'fs';

function inspectLcp() {
  const data = JSON.parse(fs.readFileSync('./scripts/lighthouse-report.json', 'utf-8'));
  const audits = data.audits;
  console.log('LCP Audit details:');
  console.log(JSON.stringify(audits['largest-contentful-paint-element']?.details, null, 2));
  console.log('\nLCP Breakdown Insights:');
  console.log(JSON.stringify(audits['lcp-breakdown']?.details, null, 2));
  console.log('\nTop Byte Consumers:');
  const items = audits['network-requests']?.details?.items || [];
  items.sort((a, b) => b.transferSize - a.transferSize);
  for (const item of items.slice(0, 10)) {
    console.log(item.transferSize.toString().padStart(8), item.resourceType?.padEnd(10), item.url);
  }
}

inspectLcp();
