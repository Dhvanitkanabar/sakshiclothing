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
      console.error('Razorpay Error:', error);
      throw new Error('Failed to create Razorpay payment intent');
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
