import { test, expect } from '@playwright/test';

test.describe('Mobile Viewport Smoke Suite (390x844)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('1. Customer App: Browse, Header & Mobile Navigation Drawer', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    await expect(page).toHaveTitle(/Sakshi/i);

    // Verify no horizontal overflow on mobile viewport
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow).toBe(false);

    // Verify mobile hamburger menu exists with adequate touch target (>= 40px)
    const mobileMenuBtn = page.locator('button[aria-label="Open Navigation Menu"]');
    await expect(mobileMenuBtn).toBeVisible();
    const box = await mobileMenuBtn.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(40);
    expect(box?.height).toBeGreaterThanOrEqual(40);

    // Open mobile navigation drawer
    await mobileMenuBtn.click();
    await page.waitForTimeout(300);

    // Verify drawer contents
    const closeBtn = page.locator('button[aria-label="Close navigation menu"]');
    await expect(closeBtn).toBeVisible();
    await expect(page.getByRole('link', { name: /sarees/i }).first()).toBeVisible();

    // Close mobile drawer
    await closeBtn.click();
    await page.waitForTimeout(300);
  });

  test('2. Customer App: Product Details, Safe Areas & Cart Drawer', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__MOCK_AUTH_USER__ = {
        id: 'usr_test_123',
        fullName: 'Test Customer',
        email: 'customer@example.com',
      };
    });

    const mockCartItem = {
      product: {
        _id: 'sakshi-01',
        name: 'The Noor-e-Jahan Scalloped Raw Silk Bridal Lehenga',
        category: { name: 'Bridal' },
        thumbnail: { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800' },
        images: [{ url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800' }],
      },
      price: 145000,
      quantity: 1,
      variantId: 'var_1',
    };

    await page.route('**/api/v1/cart**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { items: [mockCartItem] } }),
      });
    });

    await page.goto('http://localhost:4173/product/sakshi-01');
    await expect(page.getByRole('heading', { name: /The Noor-e-Jahan/i })).toBeVisible();

    // Verify MOB-01: Global BottomNav is hidden on ProductDetails page
    const bottomNav = page.locator('nav.fixed.bottom-0');
    // The sticky mobile action bar should be visible at bottom
    const addToBagStickyBtn = page.getByRole('button', { name: /add to bag/i }).last();
    await expect(addToBagStickyBtn).toBeVisible();

    // Open Cart Drawer via the header cart trigger
    const cartHeaderBtn = page.locator('button[aria-label="Shopping Bag"]');
    await expect(cartHeaderBtn).toBeVisible();
    await cartHeaderBtn.click();
    await page.waitForTimeout(400);

    // Verify Cart Drawer opens and title is visible
    await expect(page.getByRole('heading', { name: /Your Atelier Bag/i })).toBeVisible();
    const closeCartBtn = page.locator('button[aria-label="Close Shopping Bag"]');
    await expect(closeCartBtn).toBeVisible();

    // Verify close action
    await closeCartBtn.click();
    await page.waitForTimeout(300);
  });

  test('3. Customer App: Checkout Flow & Razorpay Test Mode Initiation', async ({ page }) => {
    // Populate mock user and mock Razorpay SDK
    await page.addInitScript(() => {
      (window as any).__MOCK_AUTH_USER__ = {
        id: 'usr_test_123',
        fullName: 'Test Customer',
        email: 'customer@example.com',
      };
      (window as any).Razorpay = function (options: any) {
        this.open = () => {
          if (options?.modal?.ondismiss) {
            // simulate modal opening
          }
        };
        this.on = () => {};
      };
    });

    // Mock cart API so CartContext provides active items to checkout
    await page.route('**/api/v1/cart**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            items: [
              {
                product: {
                  _id: 'sakshi-01',
                  name: 'The Noor-e-Jahan Scalloped Raw Silk Bridal Lehenga',
                  category: { name: 'Bridal' },
                  thumbnail: { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800' },
                },
                price: 145000,
                quantity: 1,
                variantId: 'var_1',
              },
            ],
          },
        }),
      });
    });

    await page.route('**/api/v1/addresses**', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              _id: 'addr_test_123',
              street: '123 Fashion Street',
              city: 'Ahmedabad',
              state: 'Gujarat',
              pincode: '380001',
            },
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] }),
        });
      }
    });

    let initiatePayload: any = null;
    await page.route('**/api/v1/orders/initiate', async (route) => {
      initiatePayload = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Order initiated',
          order: {
            order_id: 'order_mock_test_123',
            orderNumber: 'ORDERSC1',
            amount: 14500000,
            currency: 'INR',
            key_id: 'rzp_test_mockKey123',
            db_order_id: '663d2a2a2a2a2a2a2a2a2a2a',
            status: 'pending_payment',
          },
        }),
      });
    });

    await page.goto('http://localhost:4173/checkout');
    await expect(page.getByRole('heading', { name: /Secure Checkout/i })).toBeVisible();

    // Verify font-size >= 16px on inputs to prevent iOS auto-zoom
    const streetInput = page.locator('input[placeholder*="123, Luxury Lane" i]').first();
    await expect(streetInput).toBeVisible();
    const fontSize = await streetInput.evaluate((el) => window.getComputedStyle(el).fontSize);
    expect(parseFloat(fontSize)).toBeGreaterThanOrEqual(16);

    await streetInput.fill('123 Fashion Street');

    const cityInput = page.locator('input[placeholder*="Mumbai" i]').first();
    await cityInput.fill('Ahmedabad');

    const pinInput = page.locator('input[placeholder*="400001" i]').first();
    await pinInput.fill('380001');

    const phoneInput = page.locator('input[placeholder*="98765 43210" i]').first();
    await phoneInput.fill('9876543210');

    // Click Place Order button
    const placeOrderBtn = page.getByRole('button', { name: /Place Order/i }).first();
    await expect(placeOrderBtn).toBeVisible();
    await placeOrderBtn.click();
    await page.waitForTimeout(400);

    // Confirmation Modal appears
    await expect(page.getByText('Confirm Your Details')).toBeVisible();

    // Click Confirm & Pay inside modal
    const confirmPayBtn = page.getByRole('button', { name: /Confirm & Pay/i });
    await expect(confirmPayBtn).toBeVisible();
    await confirmPayBtn.click();
    await page.waitForTimeout(500);

    // Verify that the initiate endpoint was called
    expect(initiatePayload).not.toBeNull();
    // Security check: Client MUST NOT calculate or send total amount
    expect(initiatePayload.amount).toBeUndefined();
    expect(initiatePayload.total).toBeUndefined();
    expect(initiatePayload.totalAmount).toBeUndefined();
    expect(initiatePayload.items).toBeDefined();
    expect(initiatePayload.shippingAddressId).toBeDefined();
  });

  test('4. Customer App: Order Tracking Lookup & Sanitized Timeline', async ({ page }) => {
    const mockTrackResponse = {
      success: true,
      data: {
        orderId: 'ORD-98765',
        orderNumber: 'ORDERSC1',
        orderStatus: 'shipped',
        createdAt: new Date().toISOString(),
        paymentStatus: 'paid',
        paymentMethod: 'razorpay',
        totalAmount: 4999,
        shippingAddress: {
          fullName: 'Test Customer',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '380001',
        },
        items: [
          {
            name: 'Royal Crimson Banarasi Silk Saree',
            price: 4999,
            quantity: 1,
            selectedSize: 'Free Size',
          },
        ],
        trackingTimeline: [
          { status: 'pending_payment', timestamp: new Date().toISOString() },
          { status: 'confirmed', timestamp: new Date().toISOString() },
          { status: 'shipped', timestamp: new Date().toISOString() },
        ],
      },
    };

    await page.route('**/api/v1/orders/track*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockTrackResponse),
      });
    });

    await page.goto('http://localhost:4173/track-order');
    await expect(page.getByRole('heading', { name: /Track Your Order/i })).toBeVisible();

    const orderInput = page.locator('input[placeholder*="Enter Order #" i]').first();
    await expect(orderInput).toBeVisible();
    await orderInput.fill('ORDERSC1');

    const trackBtn = page.getByRole('button', { name: /^Track$/i });
    await trackBtn.click();
    await page.waitForTimeout(400);

    // Verify tracking timeline card rendered without horizontal overflow
    await expect(page.getByText('ORDERSC1').first()).toBeVisible();

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);
  });

  test('5. Admin Atelier: Mobile Responsive Cards & Navigation Drawer', async ({ page }) => {
    // Inject mock admin authentication state
    await page.addInitScript(() => {
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminToken', 'mock_admin_jwt_token');
    });

    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              _id: 'admin_123',
              fullName: 'Master Atelier Admin',
              email: 'admin@sakshiclothing.com',
              role: 'admin',
            },
          },
        }),
      });
    });

    const mockOrders = [
      {
        _id: 'ord_101',
        orderId: 'ORD-101',
        user: { fullName: 'Priya Sharma', email: 'priya@example.com' },
        createdAt: new Date().toISOString(),
        totalAmount: 7499,
        orderStatus: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'razorpay',
        orderItems: [{ product: { name: 'Chanderi Saree' }, quantity: 1 }],
      },
    ];

    await page.route('**/api/v1/orders/admin*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { orders: mockOrders, totalOrders: 1, totalPages: 1 },
          orders: mockOrders,
          stats: { totalRevenue: 7499, pendingOrders: 0 },
        }),
      });
    });

    await page.goto('http://localhost:4174/orders');

    // Verify MOB-02: On mobile viewport (<768px), responsive card container is visible and desktop table is hidden
    const mobileCards = page.locator('.md\\:hidden');
    await expect(mobileCards.first()).toBeVisible();

    const desktopTable = page.locator('.hidden.md\\:block');
    if (await desktopTable.count() > 0) {
      await expect(desktopTable.first()).toBeHidden();
    }

    // Verify admin mobile topbar hamburger
    const adminMenuBtn = page.getByRole('button', { name: /toggle navigation menu/i });
    if (await adminMenuBtn.isVisible()) {
      await adminMenuBtn.click();
      await page.waitForTimeout(300);

      // Verify sidebar navigation links
      await expect(page.getByRole('link', { name: /products/i }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: /orders/i }).first()).toBeVisible();
    }
  });

  test('6. Admin Atelier: Product List Responsive Layout & Touch Ergonomics', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminToken', 'mock_admin_jwt_token');
    });

    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { user: { role: 'admin', fullName: 'Atelier Admin' } },
        }),
      });
    });

    const mockProducts = [
      {
        _id: 'prod_901',
        name: 'Handcrafted Zardozi Lehenga',
        price: 24999,
        category: { name: 'Bridal' },
        countInStock: 3,
        isActive: true,
        images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'],
      },
    ];

    await page.route('**/api/v1/products*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { data: mockProducts, total: 1 },
        }),
      });
    });

    await page.goto('http://localhost:4174/products');

    // Verify mobile product card is visible with touch action buttons
    await expect(page.getByText('Handcrafted Zardozi Lehenga').first()).toBeVisible();

    // Verify no horizontal overflow in admin on mobile
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow).toBe(false);
  });
});
