import request from 'supertest';
import app from '../src/app.js';

describe('Health Endpoints', () => {
  it('should return 200 OK from /api/v1/health', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
  });
});
