import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import orderService from '../src/services/order.service.js';
import cartService from '../src/services/cart.service.js';
import Product from '../src/models/Product.model.js';
import User from '../src/models/User.model.js';
import Order from '../src/models/Order.model.js';
import Cart from '../src/models/Cart.model.js';
import Coupon from '../src/models/Coupon.model.js';
import Address from '../src/models/Address.model.js';
import { generateTokens } from '../src/utils/tokenHelper.js';
import { BUSINESS_CONFIG } from '../src/config/business.config.js';

describe('PAY-05: Single Source of Truth Cart Quote & UPI-Only Payment Restrictions', () => {
  let customerUser;
  let customerToken;
  let testAddress;
  let mockProductDiscount;
  let mockProductVariant;
  let mockProductThreshold299;
  let mockProductThreshold300;
  let mockProductThreshold301;
  let testCoupon50;

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
      // Create test customer
      await User.deleteMany({ email: 'pay05_customer@sakshiclothing.store' });
      customerUser = await User.create({
        email: 'pay05_customer@sakshiclothing.store',
        fullName: 'Pay05 Quote Customer',
        role: 'user',
        isActive: true,
        isBlocked: false
      });
      customerToken = generateTokens(customerUser._id).accessToken;

      // Create test address
      await Address.deleteMany({ user: customerUser._id });
      testAddress = await Address.create({
        user: customerUser._id,
        fullName: 'Pay05 Quote Customer',
        phone: '9876543210',
        houseNumber: 'B-204 Sentosa',
        street: 'VIP Road',
        area: 'Utran',
        city: 'Surat',
        state: 'Gujarat',
        country: 'India',
        pincode: '394105'
      });

      // Clear old test products
      await Product.deleteMany({ slug: { $in: ['pay05-discount-prod', 'pay05-variant-prod', 'pay05-prod-299', 'pay05-prod-300', 'pay05-prod-301'] } });
      const mockCatId = new mongoose.Types.ObjectId();

      // Product 1: MRP 999, Discount/Sale Price 299 (The exact reproduction scenario)
      mockProductDiscount = await Product.create({
        name: 'Festive Banarasi Silk Dupatta',
        slug: 'pay05-discount-prod',
        description: 'Authentic Banarasi silk weave dupatta from Surat',
        category: mockCatId,
        pricing: {
          basePrice: 999,      // MRP
          discountPrice: 299,  // Live discounted sale price
          costPrice: 150
        },
        inventory: { totalStock: 50 },
        variants: [{
          size: 'Standard',
          price: 999,
          stock: 50,
          status: 'published'
        }],
        status: 'published'
      });

      // Product 2: Product with distinct variant pricing (e.g. XL costs 350)
      mockProductVariant = await Product.create({
        name: 'Embroidered Kurti',
        slug: 'pay05-variant-prod',
        description: 'Cotton embroidered kurti',
        category: mockCatId,
        pricing: {
          basePrice: 500,
          costPrice: 200
        },
        inventory: { totalStock: 30 },
        variants: [
          { size: 'M', price: 250, stock: 15, status: 'published' },
          { size: 'XL', price: 350, stock: 15, status: 'published' }
        ],
        status: 'published'
      });

      // Threshold Products: 299, 300, 301
      mockProductThreshold299 = await Product.create({
        name: 'Threshold Accessory 299',
        slug: 'pay05-prod-299',
        description: 'Accessory priced exactly at ₹299',
        category: mockCatId,
        pricing: { basePrice: 299, costPrice: 100 },
        inventory: { totalStock: 20 },
        variants: [{ size: 'Standard', price: 299, stock: 20, status: 'published' }],
        status: 'published'
      });

      mockProductThreshold300 = await Product.create({
        name: 'Threshold Accessory 300',
        slug: 'pay05-prod-300',
        description: 'Accessory priced exactly at ₹300',
        category: mockCatId,
        pricing: { basePrice: 300, costPrice: 100 },
        inventory: { totalStock: 20 },
        variants: [{ size: 'Standard', price: 300, stock: 20, status: 'published' }],
        status: 'published'
      });

      mockProductThreshold301 = await Product.create({
        name: 'Threshold Accessory 301',
        slug: 'pay05-prod-301',
        description: 'Accessory priced exactly at ₹301',
        category: mockCatId,
        pricing: { basePrice: 301, costPrice: 100 },
        inventory: { totalStock: 20 },
        variants: [{ size: 'Standard', price: 301, stock: 20, status: 'published' }],
        status: 'published'
      });

      // Create test coupon
      await Coupon.deleteMany({ code: 'PAY05TEST50' });
      testCoupon50 = await Coupon.create({
        code: 'PAY05TEST50',
        discountType: 'flat',
        discountValue: 50,
        minimumOrderAmount: 200,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await User.deleteMany({ email: 'pay05_customer@sakshiclothing.store' });
      await Address.deleteMany({ user: customerUser?._id });
      await Product.deleteMany({ slug: { $in: ['pay05-discount-prod', 'pay05-variant-prod', 'pay05-prod-299', 'pay05-prod-300', 'pay05-prod-301'] } });
      await Coupon.deleteMany({ code: 'PAY05TEST50' });
      await Cart.deleteMany({ user: customerUser?._id });
      await Order.deleteMany({ customer: customerUser?._id });
      await mongoose.disconnect();
    }
  });

  describe('1. Price Mismatch Reproduction & Server Source of Truth Quote', () => {
    it('returns authoritative sale price ₹299 instead of MRP ₹999 on POST /api/v1/cart/quote', async () => {
      const res = await request(app)
        .post('/api/v1/cart/quote')
        .send({
          items: [{
            productId: mockProductDiscount._id.toString(),
            variantId: mockProductDiscount.variants[0]._id.toString(),
            quantity: 1
          }],
          paymentMethod: 'razorpay'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();

      const { lineItems, totals } = res.body.data;
      expect(lineItems).toHaveLength(1);
      // Authoritative sale price from Product.model calculateDiscount
      expect(lineItems[0].price).toBe(299);
      expect(lineItems[0].subtotal).toBe(299);

      // Totals check: Subtotal 299 < 300 threshold -> ₹49 shipping applied
      expect(totals.itemsTotal).toBe(299);
      expect(totals.subtotalAfterDiscount).toBe(299);
      expect(totals.shippingCharges).toBe(49);
      expect(totals.grandTotal).toBe(348);
      expect(totals.isFreeShipping).toBe(false);
      expect(totals.amountNeededForFreeShipping).toBe(1);
    });

    it('matches exact Razorpay order initiation amount in paise (grandTotal * 100)', async () => {
      // 1. Get quote
      const quoteRes = await request(app)
        .post('/api/v1/cart/quote')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [{
            productId: mockProductDiscount._id.toString(),
            variantId: mockProductDiscount.variants[0]._id.toString(),
            quantity: 1
          }],
          paymentMethod: 'razorpay'
        });

      const quoteGrandTotal = quoteRes.body.data.totals.grandTotal;

      // 2. Initiate order checkout
      const initRes = await request(app)
        .post('/api/v1/orders/initiate')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          shippingAddressId: testAddress._id.toString(),
          items: [{
            productId: mockProductDiscount._id.toString(),
            variantId: mockProductDiscount.variants[0]._id.toString(),
            quantity: 1
          }],
          isFromCart: false,
          noReturnPolicyAcknowledged: true
        });

      expect(initRes.status).toBe(201);
      expect(initRes.body.success).toBe(true);

      const initiatedOrder = initRes.body.data.order;
      const razorpayOrder = initRes.body.data.razorpayOrder;

      // Assert total parity: Displayed Total == Server Order Total == Razorpay Amount in paise
      expect(initiatedOrder.totals.grandTotal).toBe(quoteGrandTotal);
      expect(razorpayOrder.amount).toBe(Math.round(quoteGrandTotal * 100));
    });

    it('handles multiple items and quantity > 1 accurately in quote', async () => {
      const res = await request(app)
        .post('/api/v1/cart/quote')
        .send({
          items: [
            {
              productId: mockProductDiscount._id.toString(),
              variantId: mockProductDiscount.variants[0]._id.toString(),
              quantity: 2 // 2 x 299 = 598
            },
            {
              productId: mockProductThreshold300._id.toString(),
              variantId: mockProductThreshold300.variants[0]._id.toString(),
              quantity: 1 // 1 x 300 = 300
            }
          ],
          paymentMethod: 'razorpay'
        });

      expect(res.status).toBe(200);
      const { lineItems, totals } = res.body.data;
      expect(lineItems).toHaveLength(2);
      expect(lineItems[0].subtotal).toBe(598);
      expect(lineItems[1].subtotal).toBe(300);
      expect(totals.itemsTotal).toBe(898);
      expect(totals.shippingCharges).toBe(0); // >= 300 is FREE
      expect(totals.grandTotal).toBe(898);
      expect(totals.isFreeShipping).toBe(true);
    });

    it('correctly resolves variant-specific pricing overrides in quote', async () => {
      const variantXL = mockProductVariant.variants.find(v => v.size === 'XL');
      const res = await request(app)
        .post('/api/v1/cart/quote')
        .send({
          items: [{
            productId: mockProductVariant._id.toString(),
            variantId: variantXL._id.toString(),
            quantity: 1
          }],
          paymentMethod: 'razorpay'
        });

      expect(res.status).toBe(200);
      const { lineItems, totals } = res.body.data;
      expect(lineItems[0].price).toBe(350);
      expect(totals.itemsTotal).toBe(350);
      expect(totals.shippingCharges).toBe(0); // 350 >= 300
      expect(totals.grandTotal).toBe(350);
    });

    it('accurately applies coupon and reflects discount in quote and order totals', async () => {
      const quoteRes = await request(app)
        .post('/api/v1/cart/quote')
        .send({
          items: [{
            productId: mockProductDiscount._id.toString(),
            variantId: mockProductDiscount.variants[0]._id.toString(),
            quantity: 2 // 2 x 299 = 598
          }],
          couponCode: 'PAY05TEST50',
          paymentMethod: 'razorpay'
        });

      expect(quoteRes.status).toBe(200);
      const { totals, coupon } = quoteRes.body.data;
      expect(totals.itemsTotal).toBe(598);
      expect(totals.discount).toBe(50);
      expect(totals.subtotalAfterDiscount).toBe(548);
      expect(totals.shippingCharges).toBe(0); // 548 >= 300
      expect(totals.grandTotal).toBe(548);
      expect(coupon.code).toBe('PAY05TEST50');
    });
  });

  describe('2. ₹300 Free Delivery Threshold Boundaries', () => {
    it('charges ₹49 shipping when cart subtotal is exactly ₹299 (total ₹348)', async () => {
      const res = await request(app)
        .post('/api/v1/cart/quote')
        .send({
          items: [{
            productId: mockProductThreshold299._id.toString(),
            variantId: mockProductThreshold299.variants[0]._id.toString(),
            quantity: 1
          }]
        });

      expect(res.body.data.totals.itemsTotal).toBe(299);
      expect(res.body.data.totals.shippingCharges).toBe(49);
      expect(res.body.data.totals.grandTotal).toBe(348);
      expect(res.body.data.totals.isFreeShipping).toBe(false);
      expect(res.body.data.totals.amountNeededForFreeShipping).toBe(1);
    });

    it('grants FREE shipping when cart subtotal is exactly ₹300 (total ₹300)', async () => {
      const res = await request(app)
        .post('/api/v1/cart/quote')
        .send({
          items: [{
            productId: mockProductThreshold300._id.toString(),
            variantId: mockProductThreshold300.variants[0]._id.toString(),
            quantity: 1
          }]
        });

      expect(res.body.data.totals.itemsTotal).toBe(300);
      expect(res.body.data.totals.shippingCharges).toBe(0);
      expect(res.body.data.totals.grandTotal).toBe(300);
      expect(res.body.data.totals.isFreeShipping).toBe(true);
      expect(res.body.data.totals.amountNeededForFreeShipping).toBe(0);
    });

    it('grants FREE shipping when cart subtotal is ₹301 (total ₹301)', async () => {
      const res = await request(app)
        .post('/api/v1/cart/quote')
        .send({
          items: [{
            productId: mockProductThreshold301._id.toString(),
            variantId: mockProductThreshold301.variants[0]._id.toString(),
            quantity: 1
          }]
        });

      expect(res.body.data.totals.itemsTotal).toBe(301);
      expect(res.body.data.totals.shippingCharges).toBe(0);
      expect(res.body.data.totals.grandTotal).toBe(301);
      expect(res.body.data.totals.isFreeShipping).toBe(true);
    });
  });

  describe('3. Dynamic Database Price Change Detection', () => {
    it('detects price update when database price changes after item was added to cart', async () => {
      // Step A: Create a product at ₹799
      const dynamicProd = await Product.create({
        name: 'Dynamic Price Saree',
        slug: 'dynamic-price-saree-' + Date.now(),
        description: 'Chiffon printed saree',
        category: new mongoose.Types.ObjectId(),
        pricing: { basePrice: 799, costPrice: 300 },
        inventory: { totalStock: 10 },
        variants: [{ size: 'Standard', price: 799, stock: 10, status: 'published' }],
        status: 'published'
      });

      // Step B: Customer adds item to cart at ₹799
      await cartService.clearCart(customerUser._id, null);
      await cartService.addToCart(
        customerUser._id,
        null,
        dynamicProd._id.toString(),
        dynamicProd.variants[0]._id.toString(),
        1
      );

      // Verify cart has item with price 799
      let cart = await Cart.findOne({ user: customerUser._id });
      expect(cart.items[0].price).toBe(799);

      // Step C: Admin updates price in database to ₹299 (sale price discount)
      await Product.findByIdAndUpdate(dynamicProd._id, {
        'pricing.discountPrice': 299
      });

      // Step D: Customer opens cart / gets quote without passing items (loads from DB cart)
      const quoteRes = await request(app)
        .post('/api/v1/cart/quote')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({});

      expect(quoteRes.status).toBe(200);
      expect(quoteRes.body.data).toBeDefined();

      const { lineItems, warnings } = quoteRes.body.data;
      expect(lineItems[0].price).toBe(299);
      expect(lineItems[0].originalCartPrice).toBe(799);
      expect(lineItems[0].priceChanged).toBe(true);

      // Warning message should notify customer clearly
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toContain('Dynamic Price Saree');
      expect(warnings[0]).toContain('799');
      expect(warnings[0]).toContain('299');

      // Cart in database should now be updated to new price ₹299
      const updatedCart = await Cart.findOne({ user: customerUser._id });
      expect(updatedCart.items[0].price).toBe(299);

      // Clean up
      await Product.findByIdAndDelete(dynamicProd._id);
    });
  });

  describe('4. Payment Methods Configuration & Razorpay Modal Options', () => {
    it('exposes UPI-only and COD allowed methods via public GET /api/v1/cms/business-config', async () => {
      const res = await request(app).get('/api/v1/cms/business-config');

      expect(res.status).toBe(200);
      expect(res.body.data.payment).toBeDefined();
      expect(res.body.data.payment.allowedMethods).toEqual(['upi', 'cod']);
      expect(res.body.data.payment.defaultOnlineMethod).toBe('upi');

      // Verify hide list contains all non-UPI methods
      const hidden = res.body.data.payment.razorpayHiddenMethods.map(h => h.method);
      expect(hidden).toContain('card');
      expect(hidden).toContain('netbanking');
      expect(hidden).toContain('wallet');
      expect(hidden).toContain('emi');
      expect(hidden).toContain('cardless_emi');
      expect(hidden).toContain('paylater');
    });

    it('business.config.js defines razorpayHiddenMethods matching the required hide list', () => {
      expect(BUSINESS_CONFIG.payment).toBeDefined();
      expect(BUSINESS_CONFIG.payment.allowedMethods).toContain('upi');
      expect(BUSINESS_CONFIG.payment.allowedMethods).toContain('cod');

      const methods = BUSINESS_CONFIG.payment.razorpayHiddenMethods.map(m => m.method);
      ['card', 'netbanking', 'wallet', 'emi', 'cardless_emi', 'paylater'].forEach(m => {
        expect(methods).toContain(m);
      });
    });
  });
});
