import { test } from '@playwright/test';

test('Measure Mobile Performance Metrics (Home, Shop, Product)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const pagesToTest = [
    { name: 'Home', url: 'http://localhost:4173/' },
    { name: 'Shop', url: 'http://localhost:4173/shop' },
    { name: 'Product', url: 'http://localhost:4173/product/sakshi-01' },
  ];

  const results: Record<string, any> = {};

  for (const p of pagesToTest) {
    await page.goto(p.url, { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    const perfMetrics = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint')?.startTime || 0;

      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const nav = navEntries[0] || {};

      return {
        fcp: Math.round(fcp),
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime || 0),
        loadComplete: Math.round(nav.loadEventEnd - nav.startTime || 0),
        domInteractive: Math.round(nav.domInteractive - nav.startTime || 0),
        duration: Math.round(nav.duration || 0),
      };
    });

    results[p.name] = perfMetrics;
  }

  console.log('PERF_METRICS_RESULTS:' + JSON.stringify(results));
});
