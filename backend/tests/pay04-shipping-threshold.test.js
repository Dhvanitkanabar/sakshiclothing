import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import orderService from '../src/services/order.service.js';
import Product from '../src/models/Product.model.js';
import User from '../src/models/User.model.js';
import Order from '../src/models/Order.model.js';
import Coupon from '../src/models/Coupon.model.js';
import Address from '../src/models/Address.model.js';
import { generateTokens } from '../src/utils/tokenHelper.js';
import { BUSINESS_CONFIG } from '../src/config/business.config.js';

describe('PAY-04: Free Delivery Threshold (₹300) & No-Return Policy Claims', () => {
  let customerUser;
  let adminUser;
  let customerToken;
  let adminToken;
  let testAddress;
  let prod299;
  let prod300;
  let prod301;
  let prod350;
  let testCoupon60;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      const mongoUri = process.env.MONGODB_URI_TEST || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sakshiclothing_test';
      try {
        await mongoose.connect(mongoUri);
      } catch (e) {
        console.warn('MongoDB connection notice in test:', e.message);
      }
    }

    if (mongoose.connection.readyState !== 0) {
      // Create Customer and Admin users
      await User.deleteMany({ email: { $in: ['threshold_customer@sakshiclothing.store', 'threshold_admin@sakshiclothing.store'] } });

      customerUser = await User.create({
        email: 'threshold_customer@sakshiclothing.store',
        fullName: 'Threshold Customer',
        role: 'user',
        isActive: true,
        isBlocked: false
      });
      customerToken = generateTokens(customerUser._id).accessToken;

      adminUser = await User.create({
        email: 'threshold_admin@sakshiclothing.store',
        fullName: 'Atelier Admin',
        role: 'admin',
        isActive: true,
        isBlocked: false
      });
      adminToken = generateTokens(adminUser._id).accessToken;

      // Create test address
      testAddress = await Address.create({
        user: customerUser._id,
        fullName: 'Threshold Customer',
        phone: '9876543210',
        houseNumber: '101',
        street: 'Ring Road',
        area: 'Utran',
        city: 'Surat',
        state: 'Gujarat',
        country: 'India',
        pincode: '395007'
      });

      // Create Products for exact threshold boundaries
      await Product.deleteMany({ slug: { $in: ['test-accent-299', 'test-accent-300', 'test-accent-301', 'test-accent-350'] } });
      const mockCatId = new mongoose.Types.ObjectId();

      prod299 = await Product.create({
        name: 'Earring Accent 299',
        slug: 'test-accent-299',
        description: 'Test jewelry piece at 299',
        category: mockCatId,
        status: 'published',
        pricing: { basePrice: 299, discountPrice: 299 },
        inventory: { totalStock: 50 },
        variants: [{ sku: 'SKU-TEST-299', color: 'Gold', size: 'Std', price: 299, stock: 50, status: 'published' }]
      });

      prod300 = await Product.create({
        name: 'Choker Accent 300',
        slug: 'test-accent-300',
        description: 'Test jewelry piece at 300',
        category: mockCatId,
        status: 'published',
        pricing: { basePrice: 300, discountPrice: 300 },
        inventory: { totalStock: 50 },
        variants: [{ sku: 'SKU-TEST-300', color: 'Gold', size: 'Std', price: 300, stock: 50, status: 'published' }]
      });

      prod301 = await Product.create({
        name: 'Bangle Set 301',
        slug: 'test-accent-301',
        description: 'Test jewelry piece at 301',
        category: mockCatId,
        status: 'published',
        pricing: { basePrice: 301, discountPrice: 301 },
        inventory: { totalStock: 50 },
        variants: [{ sku: 'SKU-TEST-301', color: 'Gold', size: 'Std', price: 301, stock: 50, status: 'published' }]
      });

      prod350 = await Product.create({
        name: 'Kurti Accent 350',
        slug: 'test-accent-350',
        description: 'Test kurti piece at 350',
        category: mockCatId,
        status: 'published',
        pricing: { basePrice: 350, discountPrice: 350 },
        inventory: { totalStock: 50 },
        variants: [{ sku: 'SKU-TEST-350', color: 'Plum', size: 'M', price: 350, stock: 50, status: 'published' }]
      });

      // Create a flat ₹60 coupon
      await Coupon.deleteMany({ code: 'DISC60' });
      testCoupon60 = await Coupon.create({
        code: 'DISC60',
        discountType: 'flat',
        discountValue: 60,
        minimumOrderAmount: 300,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await User.deleteMany({ email: { $in: ['threshold_customer@sakshiclothing.store', 'threshold_admin@sakshiclothing.store'] } });
      await Product.deleteMany({ slug: { $in: ['test-accent-299', 'test-accent-300', 'test-accent-301', 'test-accent-350'] } });
      await Coupon.deleteMany({ code: 'DISC60' });
      if (testAddress) await Address.deleteMany({ user: customerUser._id });
      await Order.deleteMany({ customer: { $in: [customerUser?._id, adminUser?._id] } });
      await mongoose.disconnect();
    }
  });

  describe('Change A: Shipping Calculation at Exact Boundaries', () => {
    it('charges standard shipping (₹49) when cart subtotal is exactly ₹299 (< ₹300)', async () => {
      const result = await orderService.calculateOrderTotals([
        { product: prod299._id, quantity: 1 }
      ]);

      expect(result.totals.itemsTotal).toBe(299);
      expect(result.totals.subtotalAfterDiscount).toBe(299);
      expect(result.totals.shippingCharges).toBe(49);
      expect(result.totals.grandTotal).toBe(348);
    });

    it('grants free delivery (₹0 shipping) when cart subtotal is exactly ₹300 (>= ₹300)', async () => {
      const result = await orderService.calculateOrderTotals([
        { product: prod300._id, quantity: 1 }
      ]);

      expect(result.totals.itemsTotal).toBe(300);
      expect(result.totals.subtotalAfterDiscount).toBe(300);
      expect(result.totals.shippingCharges).toBe(0);
      expect(result.totals.grandTotal).toBe(300);
    });

    it('grants free delivery (₹0 shipping) when cart subtotal is exactly ₹301 (> ₹300)', async () => {
      const result = await orderService.calculateOrderTotals([
        { product: prod301._id, quantity: 1 }
      ]);

      expect(result.totals.itemsTotal).toBe(301);
      expect(result.totals.subtotalAfterDiscount).toBe(301);
      expect(result.totals.shippingCharges).toBe(0);
      expect(result.totals.grandTotal).toBe(301);
    });

    it('re-applies standard shipping fee when coupon drops subtotal below ₹300', async () => {
      // ₹350 item - ₹60 coupon = ₹290 subtotal (< ₹300 threshold) -> charges ₹49 shipping
      const result = await orderService.calculateOrderTotals(
        [{ product: prod350._id, quantity: 1 }],
        'DISC60'
      );

      expect(result.totals.itemsTotal).toBe(350);
      expect(result.totals.discount).toBe(60);
      expect(result.totals.subtotalAfterDiscount).toBe(290);
      expect(result.totals.shippingCharges).toBe(49);
      expect(result.totals.grandTotal).toBe(339); // 290 + 49
    });

    it('exposes free delivery threshold via public GET /api/v1/cms/business-config', async () => {
      const res = await request(app).get('/api/v1/cms/business-config');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.shipping.freeShippingThreshold).toBe(300);
      expect(res.body.data.shipping.defaultShippingCharge).toBe(49);
      expect(res.body.data.policies.noReturnsPermitted).toBe(true);
      expect(res.body.data.policies.returnWindowHours).toBe(48);
    });
  });

  describe('Change B: No-Return Policy Consent & Damage Claim Flow', () => {
    let createdOrder;

    it('creates an order and persists noReturnPolicyAcknowledged: true', async () => {
      createdOrder = await orderService.createCheckoutOrder(
        customerUser._id,
        [{ product: prod300._id, quantity: 1 }],
        testAddress._id,
        { method: 'cod', paymentStatus: 'pending' },
        null,
        { noReturnPolicyAcknowledged: true }
      );

      expect(createdOrder).not.toBeNull();
      expect(createdOrder.noReturnPolicyAcknowledged).toBe(true);
      expect(createdOrder.totals.grandTotal).toBe(300);
      expect(createdOrder.totals.shippingCharges).toBe(0);
    });

    it('allows customer to submit transit damage claim with unboxing video proof within window', async () => {
      const res = await request(app)
        .post(`/api/v1/orders/${createdOrder._id}/claim`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          reason: 'damaged_in_transit',
          description: 'Package arrived with torn outer wrap and damaged jewelry clasp.',
          unboxingVideoUrl: 'https://drive.google.com/file/d/test-unboxing-video/view',
          photoUrls: ['https://sakshiclothing.store/proof/damage-1.jpg']
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.claim.hasClaim).toBe(true);
      expect(res.body.data.claim.status).toBe('submitted');
      expect(res.body.data.claim.reason).toBe('damaged_in_transit');
      expect(res.body.data.claim.unboxingVideoUrl).toContain('test-unboxing-video');
    });

    it('prevents customer from filing a second concurrent claim on the same order', async () => {
      const res = await request(app)
        .post(`/api/v1/orders/${createdOrder._id}/claim`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          reason: 'defective_piece',
          description: 'Second claim attempt'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already submitted or under review/i);
    });

    it('allows admin to review and approve transit damage claim with replacement resolution', async () => {
      const res = await request(app)
        .patch(`/api/v1/orders/admin/${createdOrder._id}/claim`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'approved',
          resolutionType: 'replacement',
          adminNotes: 'Unboxing video verified. Courier transit damage confirmed. Dispatched replacement item.'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.claim.status).toBe('approved');
      expect(res.body.data.claim.resolutionType).toBe('replacement');
      expect(res.body.data.claim.adminNotes).toContain('Courier transit damage confirmed');
    });
  });
});
