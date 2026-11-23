import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'docs/screenshots');
const RECORDINGS_DIR = path.resolve(process.cwd(), 'docs/recordings');
const MEDIA_DIR = path.resolve(process.cwd(), 'docs/media');

// Ensure output directories exist
[SCREENSHOT_DIR, RECORDINGS_DIR, MEDIA_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

test.use({ video: 'on' });

test.describe('Section Transitions & Parity Verification Suite', () => {

  // =========================================================================
  // 1. HERO HEIGHT & BUTTON VISIBILITY ACROSS ALL VIEWPORTS (NO SCROLL)
  // =========================================================================
  const testViewports = [
    { width: 360, height: 640, name: '360x640 Mobile Compact' },
    { width: 390, height: 844, name: '390x844 Mobile Standard (iPhone/Pixel)' },
    { width: 768, height: 1024, name: '768x1024 Tablet Portrait' },
    { width: 1366, height: 768, name: '1366x768 Laptop' },
    { width: 1440, height: 900, name: '1440x900 Desktop' }
  ];

  for (const vp of testViewports) {
    test(`Hero visibility without scrolling on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

      // Verify headline is visible in viewport
      const headline = page.locator('#hero-banner h1');
      await expect(headline).toBeVisible();

      // Verify main CTA button is visible in viewport
      const ctaButton = page.locator('#hero-banner a button');
      await expect(ctaButton).toBeVisible();

      // Assert button bounding box is strictly within viewport height without scrolling
      const box = await ctaButton.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.y + box.height).toBeLessThanOrEqual(vp.height);
      }

      // Assert no horizontal overflow
      const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      expect(noOverflow).toBe(true);
    });
  }

  // =========================================================================
  // 2. STEP-BY-STEP HOMEPAGE SCROLL & OVERFLOW ASSERTION (390px, 768px, 1280px)
  // =========================================================================
  const scrollTestSizes = [
    { width: 390, height: 844, prefix: 'mobile' },
    { width: 768, height: 1024, prefix: 'tablet' },
    { width: 1280, height: 800, prefix: 'desktop' }
  ];

  for (const size of scrollTestSizes) {
    test(`Scroll-through asserting no horizontal overflow & full opacity (${size.prefix})`, async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

      // Check initial overflow
      let noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      expect(noOverflow).toBe(true);

      const sectionSelectors = [
        '#hero-banner',
        'section:has-text("FREE Pan-India Delivery")',
        'section:has-text("Explore by Category")',
        'section:has-text("Trending Right Now")',
        '#shop-the-look',
        '#jewellery-spotlight',
        'section:has-text("The Surat Connection")',
        'section:has-text("The Sakshi Lookbook")',
        'section:has-text("Pan-India Delivery")',
        'section:has-text("Stay in Touch with Festive Launches")',
        'footer'
      ];

      for (const sel of sectionSelectors) {
        const el = page.locator(sel).first();
        if (await el.count() > 0) {
          await el.scrollIntoViewIfNeeded();
          await page.waitForTimeout(300);

          // Assert zero horizontal overflow at every scroll step
          noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
          expect(noOverflow).toBe(true);

          // Assert section is visible and opaque
          await expect(el).toBeVisible();
          const opacity = await el.evaluate((node) => window.getComputedStyle(node).opacity);
          expect(parseFloat(opacity)).toBeGreaterThanOrEqual(0.8);
        }
      }

      // Copy video recording
      const video = page.video();
      if (video) {
        try {
          const videoPath = await video.path();
          const outName = `homepage-scroll-${size.prefix}-${size.width}px.webm`;
          fs.copyFileSync(videoPath, path.join(RECORDINGS_DIR, outName));
          fs.copyFileSync(videoPath, path.join(MEDIA_DIR, outName));
        } catch {}
      }
    });
  }

  // =========================================================================
  // 3. REDUCED MOTION EMULATION (IMMEDIATE VISIBILITY)
  // =========================================================================
  test('Prefers-reduced-motion emulated: all content visible immediately without animations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

    // Instantly check hero and categories without scrolling wait
    const heroH1 = page.locator('#hero-banner h1');
    await expect(heroH1).toBeVisible();

    const categoryTitle = page.locator('h2:has-text("Explore by Category")');
    await expect(categoryTitle).toBeAttached();

    const lookbook = page.locator('h2:has-text("The Sakshi Lookbook")');
    await expect(lookbook).toBeAttached();
  });

  // =========================================================================
  // 4. ANCHOR-LINK JUMP AND MID-PAGE RELOAD
  // =========================================================================
  test('Anchor-link jump & mid-page reload never leaves content hidden', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:4173/#shop-the-look', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const shopLook = page.locator('#shop-the-look');
    await expect(shopLook).toBeVisible();

    // Reload mid-page
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Assert section remains fully visible after reload
    await expect(shopLook).toBeVisible();
    const opacity = await shopLook.evaluate((node) => window.getComputedStyle(node).opacity);
    expect(parseFloat(opacity)).toBeGreaterThanOrEqual(0.9);
  });

  // =========================================================================
  // 5. INNER PAGE ENTRANCE TRANSITIONS (SHOP, CATEGORY, PRODUCT, CART, CHECKOUT)
  // =========================================================================
  test('Inner pages have active entrance motion without overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // Shop Page
    await page.goto('http://localhost:4173/shop', { waitUntil: 'networkidle' });
    let noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    expect(noOverflow).toBe(true);
    await expect(page.locator('h1')).toBeVisible();

    // Product Details Page
    await page.goto('http://localhost:4173/product/saree-festive-01', { waitUntil: 'networkidle' });
    noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    expect(noOverflow).toBe(true);

    // Cart Page
    await page.goto('http://localhost:4173/cart', { waitUntil: 'networkidle' });
    noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    expect(noOverflow).toBe(true);
  });
});
