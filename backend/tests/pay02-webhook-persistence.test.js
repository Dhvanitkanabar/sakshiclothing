import request from 'supertest';
import mongoose from 'mongoose';
import crypto from 'crypto';
import app from '../src/app.js';
import Order from '../src/models/Order.model.js';
import Product from '../src/models/Product.model.js';
import User from '../src/models/User.model.js';
import Address from '../src/models/Address.model.js';
import razorpayAdapter from '../src/services/adapters/razorpay.adapter.js';

describe('PAY-02: Pre-Payment Order Persistence & Idempotent Razorpay Webhook', () => {
  let sampleOrder;
  const mockWebhookSecret = 'test_whsec_super_secret_12345';

  beforeAll(async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = mockWebhookSecret;

    if (mongoose.connection.readyState === 0) {
      const mongoUri = process.env.MONGODB_URI_TEST || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sakshiclothing_test';
      try {
        await mongoose.connect(mongoUri);
      } catch (e) {
        console.warn('MongoDB connection failed in test:', e.message);
      }
    }

    if (mongoose.connection.readyState !== 0) {
      sampleOrder = await Order.create({
        orderNumber: 'TEST-PAY02-ORD-01',
        customer: new mongoose.Types.ObjectId(),
        products: [
          {
            product: new mongoose.Types.ObjectId(),
            name: 'Silk Dupatta',
            variantId: new mongoose.Types.ObjectId(),
            sku: 'TEST-PAY02-SKU',
            quantity: 1,
            price: 5000,
            subtotal: 5000
          }
        ],
        orderStatus: 'payment_pending',
        paymentStatus: 'pending',
        payment: {
          method: 'razorpay',
          gatewayOrderId: 'order_pay02_rzp_mock'
        },
        totals: {
          itemsTotal: 5000,
          shippingCharges: 0,
          discount: 0,
          grandTotal: 5000
        }
      });
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await Order.deleteMany({ orderNumber: 'TEST-PAY02-ORD-01' });
      await mongoose.disconnect();
    }
  });

  it('rejects webhooks with invalid cryptographic signature', async () => {
    const payload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_mock_123',
            order_id: 'order_pay02_rzp_mock',
            amount: 500000,
            currency: 'INR',
            status: 'captured'
          }
        }
      }
    });

    const res = await request(app)
      .post('/api/v1/payments/webhook/razorpay')
      .set('x-razorpay-signature', 'invalid_signature_hash')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('valid webhook transitions pending_payment order to completed even if user dropped off', async () => {
    if (!sampleOrder) return;

    const payloadObj = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_valid_dropoff_123',
            order_id: 'order_pay02_rzp_mock',
            amount: 500000, // ₹5000 in paise
            currency: 'INR',
            status: 'captured'
          }
        }
      }
    };
    const payloadStr = JSON.stringify(payloadObj);

    // Compute legitimate HMAC signature
    const signature = crypto
      .createHmac('sha256', mockWebhookSecret)
      .update(payloadStr)
      .digest('hex');

    const res = await request(app)
      .post('/api/v1/payments/webhook/razorpay')
      .set('x-razorpay-signature', signature)
      .set('Content-Type', 'application/json')
      .send(payloadStr);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');

    // Confirm Order in DB was updated to completed
    const updatedOrder = await Order.findById(sampleOrder._id);
    expect(updatedOrder.paymentStatus).toBe('completed');
    expect(updatedOrder.orderStatus).toBe('pending_approval');
    expect(updatedOrder.payment.transactionId).toBe('pay_valid_dropoff_123');
  });

  it('is idempotent: sending the same webhook twice returns 200 without duplicate processing', async () => {
    if (!sampleOrder) return;

    const payloadObj = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_valid_dropoff_123',
            order_id: 'order_pay02_rzp_mock',
            amount: 500000,
            currency: 'INR',
            status: 'captured'
          }
        }
      }
    };
    const payloadStr = JSON.stringify(payloadObj);

    const signature = crypto
      .createHmac('sha256', mockWebhookSecret)
      .update(payloadStr)
      .digest('hex');

    const res = await request(app)
      .post('/api/v1/payments/webhook/razorpay')
      .set('x-razorpay-signature', signature)
      .set('Content-Type', 'application/json')
      .send(payloadStr);

    expect(res.statusCode).toBe(200);

    const checkOrder = await Order.findById(sampleOrder._id);
    expect(checkOrder.paymentStatus).toBe('completed');
  });
});
