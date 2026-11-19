import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.model.js';
import { generateTokens } from '../src/utils/tokenHelper.js';

describe('SEC-04: Protect Admin Notifications with Auth and Admin Role', () => {
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
      await User.deleteMany({ email: { $in: ['sec04_cust@test.com', 'sec04_admin@test.com'] } });

      const customer = await User.create({
        email: 'sec04_cust@test.com',
        fullName: 'Normal Customer',
        role: 'user',
        isActive: true,
        isBlocked: false
      });
      customerToken = generateTokens(customer._id).accessToken;

      const admin = await User.create({
        email: 'sec04_admin@test.com',
        fullName: 'Admin Person',
        role: 'admin',
        isActive: true,
        isBlocked: false
      });
      adminToken = generateTokens(admin._id).accessToken;
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await User.deleteMany({ email: { $in: ['sec04_cust@test.com', 'sec04_admin@test.com'] } });
      await mongoose.disconnect();
    }
  });

  it('rejects unauthenticated requests with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/v1/notifications/admin');
    expect(res.statusCode).toBe(401);
  });

  it('rejects regular customer accounts with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/notifications/admin')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/permission|forbidden|denied/i);
  });

  it('allows access to verified admin users with 200 OK', async () => {
    const res = await request(app)
      .get('/api/v1/notifications/admin')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
