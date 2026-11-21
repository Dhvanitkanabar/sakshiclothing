import { test } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'docs/screenshots');

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'shop', path: '/shop' },
  { name: 'category', path: '/category/Women' },
  { name: 'product', path: '/product/sakshi-01' },
  { name: 'cart', path: '/cart' },
  { name: 'checkout', path: '/checkout' },
  { name: 'track-order', path: '/track-order' },
  { name: 'profile', path: '/profile' },
  { name: 'auth', path: '/login' },
  { name: 'wishlist', path: '/wishlist' },
];

test.describe('Visual Screenshot Capture (Mobile 390px & Desktop 1280px)', () => {
  test('Capture mobile & desktop viewport screenshots', async ({ page }) => {
    // Mock user session & cart items for complete page rendering
    await page.addInitScript(() => {
      (window as any).__MOCK_AUTH_USER__ = {
        id: 'usr_mock_patron',
        fullName: 'Aaradhya Sharma',
        email: 'aaradhya@example.com',
        role: 'user',
        loyaltyPoints: 340,
      };
      localStorage.setItem('sakshi_cart', JSON.stringify([
        {
          id: 'sakshi-01',
          name: 'The Noor-e-Jahan Scalloped Raw Silk Bridal Lehenga',
          price: 145000,
          category: 'Bridal',
          image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
          quantity: 1,
          selectedSize: 'M',
        },
        {
          id: 'jewel-01',
          name: 'Kundan Polki Bridal Choker Set',
          price: 18500,
          category: 'Jewellery',
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
          quantity: 1,
          selectedSize: 'Free Size',
        }
      ]));
    });

    // 1. Mobile captures (390 x 844)
    await page.setViewportSize({ width: 390, height: 844 });
    for (const p of PAGES) {
      try {
        await page.goto(`http://localhost:4173${p.path}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(600);
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `mobile-${p.name}.png`),
          fullPage: false,
        });
      } catch (err) {
        console.warn(`Failed capturing mobile ${p.name}:`, err);
      }
    }

    // 2. Desktop captures (1280 x 800)
    await page.setViewportSize({ width: 1280, height: 800 });
    for (const p of PAGES) {
      try {
        await page.goto(`http://localhost:4173${p.path}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(600);
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `desktop-${p.name}.png`),
          fullPage: false,
        });
      } catch (err) {
        console.warn(`Failed capturing desktop ${p.name}:`, err);
      }
    }
  });
});
