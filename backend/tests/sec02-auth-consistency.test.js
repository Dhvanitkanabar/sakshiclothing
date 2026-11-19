import request from 'supertest';
import app from '../src/app.js';

describe('SEC-02: Consistent Authentication Architecture (Clerk Unification)', () => {
  it('gracefully informs users that customer registration is handled via Clerk without crashing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Clerk/i);
    // Crucial: Server did not throw an unhandled 500 TypeError
    expect(res.statusCode).not.toBe(500);
  });

  it('gracefully informs users that customer login is handled via Clerk without crashing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Clerk/i);
    expect(res.statusCode).not.toBe(500);
  });
});
