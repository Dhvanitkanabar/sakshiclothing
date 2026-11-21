import mongoose from 'mongoose';
import Product from '../src/models/Product.model.js';
import Order from '../src/models/Order.model.js';
import { cleanupAbandonedStock } from '../src/jobs/stockCleanupJob.js';
import { ORDER_STATUS, PAYMENT_STATUS } from '../src/constants/index.js';

describe('PROD-STOCK: Abandoned Payment Stock Cleanup Job', () => {
  let testProduct;
  let testVariantId;
  let recentOrder;
  let expiredOrder;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      const mongoUri = process.env.MONGODB_URI_TEST || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sakshiclothing_test';
      try {
        await mongoose.connect(mongoUri);
      } catch (e) {
        console.warn('MongoDB connection failed in test:', e.message);
      }
    }

    if (mongoose.connection.readyState !== 0) {
      await Product.deleteMany({ slug: 'test-cleanup-anarkali' });
      await Order.deleteMany({ orderNumber: { $in: ['TEST-CLEANUP-RECENT', 'TEST-CLEANUP-EXPIRED'] } });

      testVariantId = new mongoose.Types.ObjectId();
      const mockCategoryId = new mongoose.Types.ObjectId();

      testProduct = await Product.create({
        name: 'Festive Silk Anarkali',
        slug: 'test-cleanup-anarkali',
        description: 'Authentic handcrafted silk anarkali with zardozi embroidery',
        category: mockCategoryId,
        status: 'published',
        pricing: { basePrice: 4999, discountPrice: 3999 },
        inventory: { totalStock: 8 },
        variants: [
          {
            _id: testVariantId,
            sku: 'SKU-CLEANUP-M',
            color: 'Plum Rose',
            size: 'M',
            price: 3999,
            stock: 8,
            status: 'published'
          }
        ]
      });

      // 1. Recent order (created 10 minutes ago — should NOT be cancelled)
      recentOrder = await Order.create({
        orderNumber: 'TEST-CLEANUP-RECENT',
        customer: new mongoose.Types.ObjectId(),
        orderStatus: 'payment_pending',
        paymentStatus: PAYMENT_STATUS.PENDING,
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 mins ago
        products: [
          {
            product: testProduct._id,
            variantId: testVariantId,
            name: 'Festive Silk Anarkali',
            size: 'M',
            quantity: 2,
            price: 3999,
            subtotal: 7998
          }
        ],
        totals: { itemsTotal: 7998, grandTotal: 7998 }
      });

      // 2. Expired abandoned order (created 45 minutes ago — SHOULD be cancelled and stock restored)
      expiredOrder = await Order.create({
        orderNumber: 'TEST-CLEANUP-EXPIRED',
        customer: new mongoose.Types.ObjectId(),
        orderStatus: 'payment_pending',
        paymentStatus: PAYMENT_STATUS.PENDING,
        createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
        products: [
          {
            product: testProduct._id,
            variantId: testVariantId,
            name: 'Festive Silk Anarkali',
            size: 'M',
            quantity: 3,
            price: 3999,
            subtotal: 11997
          }
        ],
        totals: { itemsTotal: 11997, grandTotal: 11997 }
      });
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await Product.deleteMany({ slug: 'test-cleanup-anarkali' });
      await Order.deleteMany({ orderNumber: { $in: ['TEST-CLEANUP-RECENT', 'TEST-CLEANUP-EXPIRED'] } });
      await mongoose.disconnect();
    }
  });

  it('preserves recent pending_payment orders and releases abandoned orders older than 30m', async () => {
    if (mongoose.connection.readyState === 0) {
      console.warn('Skipping test due to missing MongoDB connection');
      return;
    }

    const initialProduct = await Product.findById(testProduct._id);
    const initialVariant = initialProduct.variants.id(testVariantId);
    expect(initialVariant.stock).toBe(8);

    // Run the cleanup job with 30-minute threshold
    const result = await cleanupAbandonedStock(30);

    expect(result.releasedOrders).toBeGreaterThanOrEqual(1);
    expect(result.restoredItems).toBeGreaterThanOrEqual(3);

    // Verify recent order is untouched
    const freshRecentOrder = await Order.findById(recentOrder._id);
    expect(freshRecentOrder.orderStatus).toBe('payment_pending');

    // Verify expired order is cancelled
    const freshExpiredOrder = await Order.findById(expiredOrder._id);
    expect(['cancelled', ORDER_STATUS.CANCELLED]).toContain(freshExpiredOrder.orderStatus);
    expect(['failed', PAYMENT_STATUS.FAILED]).toContain(freshExpiredOrder.paymentStatus);
    expect(freshExpiredOrder.rejectionReason).toMatch(/Payment expired after 30 minutes/i);

    // Verify product stock was incremented by 3 (from 8 to 11)
    const updatedProduct = await Product.findById(testProduct._id);
    const updatedVariant = updatedProduct.variants.id(testVariantId);
    expect(updatedVariant.stock).toBe(11);
    expect(updatedProduct.inventory.totalStock).toBe(11);
  });
});
