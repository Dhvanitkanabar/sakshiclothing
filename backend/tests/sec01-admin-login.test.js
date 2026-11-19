import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import User from '../src/models/User.model.js';

describe('SEC-01: Admin Login Backdoor Elimination & Credential Verification', () => {
  beforeAll(async () => {
    // If not connected to a test DB, connect to memory/local test DB or mock User queries
    if (mongoose.connection.readyState === 0) {
      const mongoUri = process.env.MONGODB_URI_TEST || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sakshiclothing_test';
      try {
        await mongoose.connect(mongoUri);
      } catch (e) {
        console.warn('MongoDB connection failed in test, will use mock if needed:', e.message);
      }
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await User.deleteMany({ email: 'testadmin@sakshiclothing.store' });
      await mongoose.disconnect();
    }
  });

  it('rejects missing email or password with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/v1/auth/admin-login')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it('rejects arbitrary 3-character passwords (the old backdoor bypass: password.length >= 3)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/admin-login')
      .send({ email: 'admin', password: 'abc' });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Invalid admin credentials/i);
    // Crucial: Must NEVER leak suggestion 'Use username: sakshi, password: sakshi'
    expect(JSON.stringify(res.body)).not.toContain('Use username: sakshi');
  });

  it('rejects unauthorized non-admin accounts or incorrect passwords', async () => {
    const res = await request(app)
      .post('/api/v1/auth/admin-login')
      .send({ email: 'random@attacker.com', password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Invalid admin credentials/i);
  });

  it('allows login only with valid hashed password for an admin user in DB', async () => {
    if (mongoose.connection.readyState !== 0) {
      await User.deleteMany({ email: 'testadmin@sakshiclothing.store' });
      await User.create({
        email: 'testadmin@sakshiclothing.store',
        fullName: 'Test Admin Verified',
        role: 'admin',
        password: 'CorrectAdminSecret99!',
        isActive: true,
        isBlocked: false
      });

      const res = await request(app)
        .post('/api/v1/auth/admin-login')
        .send({ email: 'testadmin@sakshiclothing.store', password: 'CorrectAdminSecret99!' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data.user.email).toBe('testadmin@sakshiclothing.store');
      expect(res.body.data.user).not.toHaveProperty('password');
    }
  });
});
