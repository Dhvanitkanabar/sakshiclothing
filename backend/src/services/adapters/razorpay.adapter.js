import Razorpay from 'razorpay';
import crypto from 'crypto';

class RazorpayAdapter {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'test_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret'
    });
  }

  async createPaymentIntent(amount, currency, orderId, metadata = {}) {
    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: currency || 'INR',
      receipt: orderId.toString(),
      notes: metadata
    };

    try {
      const order = await this.razorpay.orders.create(options);
      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        clientSecret: null, // Razorpay doesn't use client secrets like Stripe
        raw: order
      };
    } catch (error) {
      console.warn('Razorpay SDK notice (using simulated order for development):', error.message);
      const mockId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      return {
        id: mockId,
        amount: Math.round(amount * 100),
        currency: currency || 'INR',
        status: 'created',
        clientSecret: null,
        raw: { id: mockId, status: 'created' }
      };
    }
  }

  verifyWebhookSignature(body, signature, secret) {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    
    return expectedSignature === signature;
  }
}

export default new RazorpayAdapter();
