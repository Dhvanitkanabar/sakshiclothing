import request from 'supertest';
import app from '../src/app.js';

describe('SEC-03: Explicit CORS Allow-list Enforcement', () => {
  it('allows authorized frontend origins from the whitelist with credentials', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'https://sakshiclothing.store');

    expect(res.headers['access-control-allow-origin']).toBe('https://sakshiclothing.store');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('allows localhost development origins', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'http://localhost:5173');

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('blocks unauthorized attacker origins and refuses to reflect origin', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'https://evil-attacker-phishing.com');

    // Must NOT reflect the malicious origin in Access-Control-Allow-Origin
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
    // Should return 500/error due to CORS rejection callback
    expect(res.statusCode >= 400).toBe(true);
  });

  it('allows non-browser direct requests without Origin header (e.g. mobile apps / curl)', async () => {
    const res = await request(app)
      .get('/api/v1/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
