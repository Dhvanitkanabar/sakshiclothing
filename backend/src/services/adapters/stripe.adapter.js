import Stripe from 'stripe';

class StripeAdapter {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123', {
      apiVersion: '2023-10-16' // or the latest supported version
    });
  }

  async createPaymentIntent(amount, currency, orderId, metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Amount in cents
        currency: currency || 'USD',
        metadata: {
          orderId: orderId.toString(),
          ...metadata
        }
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        raw: paymentIntent
      };
    } catch (error) {
      console.error('Stripe Error:', error);
      throw new Error('Failed to create Stripe payment intent');
    }
  }

  verifyWebhookSignature(body, signature, secret) {
    try {
      // Stripe requires the raw buffer for verification
      const event = this.stripe.webhooks.constructEvent(body, signature, secret);
      return event;
    } catch (err) {
      return null;
    }
  }
}

export default new StripeAdapter();
