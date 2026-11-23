import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'docs/screenshots');
const RECORDINGS_DIR = path.resolve(process.cwd(), 'docs/recordings');

// Ensure destination directories exist
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
if (!fs.existsSync(RECORDINGS_DIR)) fs.mkdirSync(RECORDINGS_DIR, { recursive: true });

test.use({ video: 'on' });

test.describe('Scroll-Driven Homepage & Interaction Suite', () => {

  test('Mobile (390px): Scroll-Driven Entrance, Pinned Looks, and Marquee', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

    // 1. Hero Section Verification
    const heroH1 = page.locator('#hero-banner h1');
    await expect(heroH1).toBeVisible();
    await expect(heroH1).toContainText(/Festive Drapes|Imitation Jewels/i);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scroll-01-hero-mobile.png') });

    // 2. Offer Marquee Strip
    const marquee = page.locator('text=/FREE Pan-India Delivery/i');
    await expect(marquee.first()).toBeVisible();

    // 3. Category Strip Scroll-Snap
    const categorySection = page.locator('text=Explore by Category');
    await categorySection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await expect(page.locator('h3:has-text("Imitation Jewellery")')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scroll-03-categories-mobile.png') });

    // 4. Trending Rail & Tab Switch
    const trendingSection = page.locator('section:has-text("Trending Right Now")');
    await trendingSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await expect(trendingSection).toBeVisible();

    // Switch to Imitation Jewellery tab within Trending Section
    const jewelTab = trendingSection.locator('button:has-text("Imitation Jewellery")');
    if (await jewelTab.isVisible()) {
      await jewelTab.click();
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scroll-04-trending-mobile.png') });

    // 5. "Shop The Look" Interactive Pinned Section
    const shopTheLookHeading = page.locator('h2:has-text("Shop The Look")');
    await shopTheLookHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await expect(shopTheLookHeading).toBeVisible();

    // Click Look 2 tab
    const look2Button = page.locator('button:has-text("Look 2")');
    if (await look2Button.isVisible()) {
      await look2Button.click();
      await page.waitForTimeout(400);
    }

    // Tap hotspot 1 to view drape details
    const hotspot1 = page.locator('button[aria-label="View Drape Details"]');
    if (await hotspot1.isVisible()) {
      await hotspot1.click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scroll-05-shop-the-look-mobile.png') });

    // 6. Dedicated Imitation Jewellery Spotlight
    const jewelSpotlight = page.locator('text=Regal Radiance');
    await jewelSpotlight.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await expect(jewelSpotlight).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scroll-06-jewellery-spotlight-mobile.png') });

    // 7. Brand Story & Surat Facts
    const brandStory = page.locator('text=The Surat Connection');
    await brandStory.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await expect(page.getByText('19,000+', { exact: true })).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scroll-07-brand-story-mobile.png') });

    // 8. Lookbook / Bento Grid
    const lookbook = page.locator('text=The Sakshi Lookbook');
    await lookbook.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scroll-08-lookbook-mobile.png') });

    // 9. Newsletter Form & Wordmark Footer
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await expect(page.locator('text=SAKSHI').last()).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scroll-09-footer-mobile.png') });

    // Ensure video is written cleanly
    const video = page.video();
    if (video) {
      const videoPath = await video.path();
      const destVideo = path.join(RECORDINGS_DIR, 'homepage-scroll-mobile-390px.webm');
      try {
        fs.copyFileSync(videoPath, destVideo);
      } catch (err) {
        // file might still be finalizing until test ends
      }
    }
  });

  test('Desktop (1280px): Parallax, Sticky Nav, Hotspots and Wordmark Reveal', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

    // 1. Verify Top Scroll Progress Indicator
    const heroH1 = page.locator('#hero-banner h1');
    await expect(heroH1).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scroll-01-hero-desktop.png') });

    // 2. Scroll to Categories
    const categorySection = page.locator('text=Explore by Category');
    await categorySection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scroll-03-categories-desktop.png') });

    // 3. Scroll to Shop The Look & Test Hotspots
    const shopTheLook = page.locator('h2:has-text("Shop The Look")');
    await shopTheLook.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    const hotspot2 = page.locator('button[aria-label="View Jewellery Details"]');
    if (await hotspot2.isVisible()) {
      await hotspot2.click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scroll-05-shop-the-look-desktop.png') });

    // 4. Scroll to Jewellery Spotlight
    const jewelSpotlight = page.locator('text=Regal Radiance');
    await jewelSpotlight.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scroll-06-jewellery-spotlight-desktop.png') });

    // 5. Scroll to Brand Story
    const brandStory = page.locator('text=The Surat Connection');
    await brandStory.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scroll-07-brand-story-desktop.png') });

    // 6. Scroll to Footer & Big Wordmark Reveal
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scroll-09-footer-desktop.png') });

    // Copy video
    const video = page.video();
    if (video) {
      const videoPath = await video.path();
      const destVideo = path.join(RECORDINGS_DIR, 'homepage-scroll-desktop-1280px.webm');
      try {
        fs.copyFileSync(videoPath, destVideo);
      } catch (err) {
        // file finalized on test close
      }
    }
  });
});
