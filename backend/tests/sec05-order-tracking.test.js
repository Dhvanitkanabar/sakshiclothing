import request from 'supertest';
import mongoose from 'mongoose';
import crypto from 'crypto';
import app from '../src/app.js';
import Order from '../src/models/Order.model.js';
import User from '../src/models/User.model.js';

describe('SEC-05: Secure Order Tracking & GPS Coordinate Redaction', () => {
  let sampleOrder;

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
      const customer = await User.create({
        email: 'priya.sharma@example.com',
        fullName: 'Priya Sharma',
        phone: '9876543210',
        role: 'user',
        isActive: true,
        isBlocked: false
      });

      sampleOrder = await Order.create({
        orderNumber: 'TEST-SEC05-ORD',
        trackingToken: 'tok_sec05_random_secret_token_128bit',
        customer: customer._id,
        products: [
          {
            product: new mongoose.Types.ObjectId(),
            name: 'Embroidered Anarkali',
            variantId: new mongoose.Types.ObjectId(),
            sku: 'TEST-SEC05-SKU',
            quantity: 1,
            price: 18000,
            subtotal: 18000
          }
        ],
        shippingAddress: {
          fullName: 'Priya Sharma',
          phone: '9876543210',
          houseNumber: 'Flat 402',
          street: 'Lavelle Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001',
          coordinates: { lat: 12.9716, lng: 77.5946 } // Sensitive GPS coordinates
        },
        billingAddress: {
          fullName: 'Priya Sharma',
          phone: '9876543210',
          coordinates: { lat: 12.9716, lng: 77.5946 }
        },
        userLocation: {
          ip: '203.0.113.195',
          coordinates: { lat: 12.9716, lng: 77.5946 }
        },
        orderStatus: 'confirmed',
        paymentStatus: 'completed',
        totals: {
          itemsTotal: 18000,
          grandTotal: 18000
        }
      });
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await User.deleteMany({ email: 'priya.sharma@example.com' });
      await Order.deleteMany({ orderNumber: 'TEST-SEC05-ORD' });
      await mongoose.disconnect();
    }
  });

  it('rejects order tracking by guessable order ID without phone or email verification (403)', async () => {
    const res = await request(app)
      .get('/api/v1/orders/track?orderId=TEST-SEC05-ORD');

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Verification required|phone number or email/i);
  });

  it('allows tracking when matching phone or email is supplied with order ID', async () => {
    const res = await request(app)
      .get('/api/v1/orders/track?orderId=TEST-SEC05-ORD&phone=9876543210');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toBe('TEST-SEC05-ORD');

    // CRITICAL: Raw GPS coordinates and IP must be stripped from response!
    expect(res.body.data.shippingAddress).not.toHaveProperty('coordinates');
    expect(res.body.data.billingAddress).not.toHaveProperty('coordinates');
    if (res.body.data.userLocation) {
      expect(res.body.data.userLocation).not.toHaveProperty('coordinates');
      expect(res.body.data.userLocation).not.toHaveProperty('ip');
    }
  });

  it('allows instant tracking using unguessable 128-bit trackingToken without leaking coordinates', async () => {
    const res = await request(app)
      .get('/api/v1/orders/track?orderId=tok_sec05_random_secret_token_128bit');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toBe('TEST-SEC05-ORD');
    expect(res.body.data.shippingAddress).not.toHaveProperty('coordinates');
  });
});
