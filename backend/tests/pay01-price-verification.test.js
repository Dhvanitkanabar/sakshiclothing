import request from 'supertest';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import app from '../src/app.js';
import Product from '../src/models/Product.model.js';
import Order from '../src/models/Order.model.js';
import razorpayAdapter from '../src/services/adapters/razorpay.adapter.js';

describe('PAY-01: Server-Side Order Price Computation & Tamper Prevention', () => {
  let sampleProduct;

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
      await Product.deleteMany({ slug: 'test-pay01-lehenga' });
      const mockCategoryId = new mongoose.Types.ObjectId();
      sampleProduct = await Product.create({
        name: 'Royal Heritage Lehenga',
        slug: 'test-pay01-lehenga',
        description: 'Luxury embroidered bridal silk',
        category: mockCategoryId,
        status: 'published',
        pricing: {
          basePrice: 50000,
          discountPrice: 45000
        },
        inventory: { totalStock: 10 },
        variants: [
          {
            sku: 'TEST-PAY01-VAR',
            color: 'Crimson Gold',
            size: 'M',
            price: 45000,
            stock: 10,
            status: 'published'
          }
        ]
      });
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await Product.deleteMany({ slug: 'test-pay01-lehenga' });
      await Order.deleteMany({ 'products.sku': 'TEST-PAY01-VAR' });
      await mongoose.disconnect();
    }
  });

  it('rejects arbitrary client-supplied amount on payment order creation', async () => {
    const res = await request(app)
      .post('/api/v1/payments/create-order')
      .send({
        amount: 100 // Attacker attempting to pay 100 paise (₹1)
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Direct client-specified amount is forbidden/i);
  });

  it('detects and rejects tampered payment amounts during payment verification', async () => {
    if (!sampleProduct) return;

    // Spy on Razorpay fetch payment and signature verification
    const verifySpy = jest.spyOn(razorpayAdapter, 'verifyPaymentSignature').mockReturnValue(true);
    // Attacker actually paid 100 paise (₹1) on Razorpay for a ₹45,000 product
    const fetchSpy = jest.spyOn(razorpayAdapter, 'fetchPayment').mockResolvedValue({
      id: 'pay_tampered_123',
      order_id: 'order_rzp_mock_123',
      amount: 100, // 100 paise = ₹1.00
      currency: 'INR',
      status: 'captured'
    });

    // Create order with actual total ₹45,000
    const testOrder = await Order.create({
      orderNumber: 'TEST-ORD-TAMPER-01',
      customer: new mongoose.Types.ObjectId(),
      products: [
        {
          product: sampleProduct._id,
          name: sampleProduct.name,
          variantId: sampleProduct.variants[0]._id,
          sku: 'TEST-PAY01-VAR',
          quantity: 1,
          price: 45000,
          subtotal: 45000
        }
      ],
      orderStatus: 'payment_pending',
      paymentStatus: 'pending',
      payment: {
        method: 'razorpay',
        gatewayOrderId: 'order_rzp_mock_123'
      },
      totals: {
        itemsTotal: 45000,
        shippingCharges: 0,
        discount: 0,
        grandTotal: 45000 // Server expects 4500000 paise
      }
    });

    const res = await request(app)
      .post('/api/v1/payments/verify-payment')
      .send({
        razorpay_order_id: 'order_rzp_mock_123',
        razorpay_payment_id: 'pay_tampered_123',
        razorpay_signature: 'mock_valid_signature',
        localOrderId: testOrder._id.toString()
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Tampered payment amount rejected/i);

    // Verify order was NOT marked as paid in database
    const refreshedOrder = await Order.findById(testOrder._id);
    expect(refreshedOrder.paymentStatus).toBe('pending');
    expect(refreshedOrder.orderStatus).toBe('payment_pending');

    verifySpy.mockRestore();
    fetchSpy.mockRestore();
  });
});
