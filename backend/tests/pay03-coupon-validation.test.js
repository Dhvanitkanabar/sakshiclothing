import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Coupon from '../src/models/Coupon.model.js';
import User from '../src/models/User.model.js';
import { generateTokens } from '../src/utils/tokenHelper.js';

describe('PAY-03: Server-Side Coupon Validation & Atomic Usage Increment', () => {
  let userToken;
  let testCoupon;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      const mongoUri = process.env.MONGODB_URI_TEST || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sakshiclothing_test';
      try {
        await mongoose.connect(mongoUri);
      } catch (e) {
        console.warn('MongoDB connection failed in test:', e.message);
      }
    }

    if (mongoose.connection.readyState !== 0) {
      const testUser = await User.create({
        email: 'coupon_tester@sakshiclothing.store',
        fullName: 'Coupon Tester',
        role: 'user',
        isActive: true,
        isBlocked: false
      });
      const tokens = generateTokens(testUser._id);
      userToken = tokens.accessToken;

      await Coupon.deleteMany({ code: { $in: ['TESTPAY03_EXPIRED', 'TESTPAY03_LIMITED', 'TESTPAY03_VALID'] } });

      // Expired coupon
      await Coupon.create({
        code: 'TESTPAY03_EXPIRED',
        discountType: 'flat',
        discountValue: 500,
        expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        isActive: true
      });

      // Usage limit coupon (limit 1, used 1)
      await Coupon.create({
        code: 'TESTPAY03_LIMITED',
        discountType: 'percentage',
        discountValue: 10,
        usageLimit: 1,
        usedCount: 1,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });

      // Valid coupon with min order 2000, usage limit 2, currently 0 used
      testCoupon = await Coupon.create({
        code: 'TESTPAY03_VALID',
        discountType: 'flat',
        discountValue: 500,
        minimumOrderAmount: 2000,
        usageLimit: 2,
        usedCount: 0,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await User.deleteMany({ email: 'coupon_tester@sakshiclothing.store' });
      await Coupon.deleteMany({ code: { $in: ['TESTPAY03_EXPIRED', 'TESTPAY03_LIMITED', 'TESTPAY03_VALID'] } });
      await mongoose.disconnect();
    }
  });

  it('rejects expired coupon with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: 'TESTPAY03_EXPIRED', orderAmount: 5000 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/expired/i);
  });

  it('rejects coupon whose usage limit has been reached', async () => {
    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: 'TESTPAY03_LIMITED', orderAmount: 5000 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/usage limit/i);
  });

  it('rejects coupon when order amount is less than minimumOrderAmount', async () => {
    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: 'TESTPAY03_VALID', orderAmount: 1500 }); // Min is 2000

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/minimum order amount/i);
  });

  it('atomically increments usedCount and locks once limit is reached', async () => {
    if (!testCoupon) return;

    // Slot 1: should consume successfully
    const consumed1 = await Coupon.consumeCoupon(testCoupon._id);
    expect(consumed1).not.toBeNull();
    expect(consumed1.usedCount).toBe(1);

    // Slot 2: should consume successfully (limit reached)
    const consumed2 = await Coupon.consumeCoupon(testCoupon._id);
    expect(consumed2).not.toBeNull();
    expect(consumed2.usedCount).toBe(2);

    // Slot 3: should fail to consume (atomically returns null, preventing race overrun)
    const consumed3 = await Coupon.consumeCoupon(testCoupon._id);
    expect(consumed3).toBeNull();

    const finalCoupon = await Coupon.findById(testCoupon._id);
    expect(finalCoupon.usedCount).toBe(2);
  });
});
