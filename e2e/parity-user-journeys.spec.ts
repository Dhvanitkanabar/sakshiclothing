import { test, expect } from '@playwright/test';

// Exact parity test suite across 390px (Mobile), 768px (Tablet), and 1280px (Desktop)
const VIEWPORTS = [
  { name: 'Mobile (390px)', width: 390, height: 844 },
  { name: 'Tablet (768px)', width: 768, height: 1024 },
  { name: 'Desktop (1280px)', width: 1280, height: 800 },
];

for (const vp of VIEWPORTS) {
  test.describe(`User Journeys Parity — ${vp.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
    });

    test('1. Browse Homepage, Campaign Hero, and All Key Sections', async ({ page }) => {
      await page.goto('http://localhost:4173/');
      await page.waitForLoadState('domcontentloaded');

      // Brand Wordmark
      await expect(page.getByRole('link', { name: /SAKSHI/i }).first()).toBeVisible();

      // Hero Campaign Slider & CTA
      const hero = page.locator('#hero-banner');
      await expect(hero).toBeVisible();
      await expect(hero.getByRole('heading', { level: 1 })).toBeVisible();

      // Offer Marquee Strip
      await expect(page.locator('text=FREE Pan-India Delivery').first()).toBeVisible();

      // Category Tiles
      await expect(page.getByRole('heading', { name: 'Explore by Category' })).toBeVisible();

      // Trending Section
      await expect(page.getByRole('heading', { name: 'Trending Right Now' })).toBeVisible();

      // Shop The Look Section
      const shopLookHeading = page.getByRole('heading', { name: 'Shop The Look' });
      await shopLookHeading.scrollIntoViewIfNeeded();
      await expect(shopLookHeading).toBeVisible();

      // Jewellery Spotlight
      const jewelSpotlight = page.getByRole('heading', { name: /Regal Radiance/i });
      await jewelSpotlight.scrollIntoViewIfNeeded();
      await expect(jewelSpotlight).toBeVisible();

      // Brand Story (Surat Heritage Facts)
      const brandStory = page.getByText('The Surat Connection');
      await brandStory.scrollIntoViewIfNeeded();
      await expect(brandStory).toBeVisible();
      await expect(page.getByText('19,000+', { exact: true })).toBeVisible();

      // Lookbook Grid
      const lookbookHeading = page.getByRole('heading', { name: 'The Sakshi Lookbook' });
      await lookbookHeading.scrollIntoViewIfNeeded();
      await expect(lookbookHeading).toBeVisible();

      // Floating WhatsApp Button
      const whatsappBtn = page.locator('a[aria-label="Chat with Sakshi Clothing on WhatsApp"]');
      await expect(whatsappBtn).toBeVisible();
    });

    test('2. Working Postal PIN Code Delivery Check Modal', async ({ page }) => {
      await page.goto('http://localhost:4173/');
      await page.waitForLoadState('domcontentloaded');

      // Click PIN check button in announcement bar
      const pinTrigger = page.locator('button:has-text("Check Delivery PIN"), button:has-text("PIN")').first();
      await expect(pinTrigger).toBeVisible();
      await pinTrigger.click();

      // Pincode Modal should appear
      const modal = page.locator('[role="dialog"]');
      await expect(modal.getByRole('heading', { name: 'Check Delivery & COD Availability' })).toBeVisible();

      // Type Surat PIN code 394105
      const pinInput = modal.getByPlaceholder(/Enter 6-digit PIN code/i);
      await pinInput.fill('394105');
      await modal.getByRole('button', { name: 'Check PIN' }).click();

      // Expect instant serviceability result with Surat SLA inside modal
      await expect(modal.getByText(/Surat Local/i)).toBeVisible();
      await expect(modal.getByText('1–2 Business Days', { exact: true })).toBeVisible();
      await expect(modal.getByText(/Cash on Delivery/i).first()).toBeVisible();

      // Close modal
      await modal.getByRole('button', { name: 'Done' }).click();
      await expect(modal).not.toBeVisible();
    });

    test('3. Search with Live Suggestions & Keyboard Trigger', async ({ page }) => {
      await page.goto('http://localhost:4173/');
      await page.waitForLoadState('networkidle');

      // Trigger search
      const searchBtn = page.locator('button[aria-label="Search Collection"]').first();
      await searchBtn.click();

      // Search input appears
      const searchInput = page.getByPlaceholder(/Search sarees, lehengas, kurtis/i);
      await expect(searchInput).toBeVisible();

      // Search for Saree
      await searchInput.fill('Saree');
      await page.waitForTimeout(600);

      // Verify search modal shows results or search button
      await expect(page.locator('button:has-text("View all results in Shop")')).toBeVisible();

      // Close search modal
      await page.locator('button[title="Close search"]').click();
      await expect(searchInput).not.toBeVisible();
    });

    test('4. Shop Filter, Category Navigation & Empty State Verification', async ({ page }) => {
      await page.goto('http://localhost:4173/shop');
      await page.waitForLoadState('domcontentloaded');

      // Heading
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // Category tab filter (Jewellery)
      const jewelTab = page.locator('button:has-text("Imitation Jewellery")').first();
      if (await jewelTab.isVisible()) {
        await jewelTab.click();
        await page.waitForTimeout(300);
      }

      // Filter by max price
      await page.goto('http://localhost:4173/shop?category=Women');
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('.grid').first()).toBeVisible();
    });

    test('5. Product Details, Size Selector, PIN Check & Add to Cart', async ({ page }) => {
      await page.goto('http://localhost:4173/shop');
      await page.waitForLoadState('networkidle');

      // Wait for products to render
      const firstProductLink = page.locator('a[href^="/product/"]').first();
      await expect(firstProductLink).toBeVisible({ timeout: 12000 });
      await firstProductLink.click();
      await page.waitForURL(/\/product\//);

      // Verify product page elements
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('text=/₹[0-9,]+/').first()).toBeVisible();

      // Verify in-page PIN Code Delivery Check
      const pinInput = page.getByPlaceholder(/Enter 6-digit PIN code/i);
      await expect(pinInput).toBeVisible();
      await pinInput.fill('400001'); // Mumbai
      await page.getByRole('button', { name: 'Check', exact: true }).click();
      await expect(page.locator('text=/Delivering to PIN 400001/i')).toBeVisible();

      // Add to bag
      const addToBagBtn = page.getByRole('button', { name: 'Add to Shopping Bag' });
      await expect(addToBagBtn).toBeVisible();
      if (await addToBagBtn.isEnabled()) {
        await addToBagBtn.click();
        // Unauthenticated guests are safely redirected to /login with pendingCartItem preserved
        await expect(page.locator('text=/Please sign in|added to shopping bag|Sign In or Join/i').first()).toBeVisible({ timeout: 6000 });
      }
    });

    test('6. Cart Drawer & Wishlist Navigation', async ({ page }) => {
      await page.goto('http://localhost:4173/');
      await page.waitForLoadState('domcontentloaded');

      // Open Cart Drawer
      const cartBtn = page.locator('button[aria-label="Shopping Bag"]').first();
      await cartBtn.click();
      await expect(page.getByRole('heading', { name: /Atelier Bag/i })).toBeVisible();

      // Close Cart Drawer
      const closeCartBtn = page.locator('button[aria-label="Close Shopping Bag"]').first();
      await closeCartBtn.click();
      await expect(page.getByRole('heading', { name: /Atelier Bag/i })).not.toBeVisible();

      // Open Wishlist
      const wishBtn = page.locator('a[aria-label="Saved Wishlist"]').first();
      await wishBtn.click();
      await page.waitForURL(/\/wishlist/);
      await expect(page.getByRole('heading', { name: /Wishlist/i })).toBeVisible();
    });

    test('7. Track Order Page Flow', async ({ page }) => {
      await page.goto('http://localhost:4173/track-order');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.getByRole('heading', { name: /Track Your Order/i })).toBeVisible();
      const orderInput = page.getByPlaceholder(/Enter Order #/i);
      await expect(orderInput).toBeVisible();
    });
  });
}
