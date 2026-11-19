import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.model.js';
import mongoose from 'mongoose';
import { generateTokens } from '../src/utils/tokenHelper.js';

describe('SEC-10: Advanced Security Hardening (Headers, Sanitization, Limits, Validation)', () => {
  let customerToken;
  let adminToken;

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
      const user = await User.create({
        email: 'sec10_user@example.com',
        fullName: 'Sec10 Tester',
        role: 'user',
        isActive: true,
        isBlocked: false
      });
      customerToken = generateTokens(user._id).accessToken;

      const admin = await User.create({
        email: 'sec10_admin@example.com',
        fullName: 'Sec10 Admin',
        role: 'admin',
        isActive: true,
        isBlocked: false
      });
      adminToken = generateTokens(admin._id).accessToken;
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await User.deleteMany({ email: { $in: ['sec10_user@example.com', 'sec10_admin@example.com'] } });
      await mongoose.disconnect();
    }
  });

  it('serves critical Helmet security headers (nosniff, HSTS, frameguard, referrer-policy)', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  it('sanitizes NoSQL operator keys ($gt, $ne, $where) from input payloads', async () => {
    const res = await request(app)
      .post('/api/v1/auth/check-email')
      .send({
        email: { $ne: null } // NoSQL operator injection attempt
      });

    // The mongoSanitize middleware strips/sanitizes '$' prefixed keys into '_'
    expect(res.statusCode).toBe(400);
  });

  it('validates write payload schemas using Zod and rejects malformed checkout payloads with 400', async () => {
    const res = await request(app)
      .post('/api/v1/orders/initiate')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        // missing required shippingAddressId
        isFromCart: false
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Validation/i);
  });

  it('rejects upload files with invalid file types or extensions (e.g. .exe)', async () => {
    const maliciousBuffer = Buffer.from('MZ_fake_executable_binary_content');

    const res = await request(app)
      .post('/api/v1/uploads/image')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', maliciousBuffer, 'malicious_payload.exe');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Invalid file type/i);
  });
});
