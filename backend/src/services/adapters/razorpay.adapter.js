import Razorpay from 'razorpay';
import crypto from 'crypto';

class RazorpayAdapter {
  getRazorpay() {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret || key_id.includes('REPLACE_WITH') || key_secret.includes('REPLACE_WITH')) {
      throw new Error('Razorpay live credentials missing: Please set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env');
    }
    return new Razorpay({ key_id, key_secret });
  }

  async createStandardOrder({ amount, currency = 'INR', receipt, notes = {} }) {
    // amount expected in paise, must be >= 100 paise (Rs. 1.00)
    const amountInPaise = Math.round(Number(amount));
    if (isNaN(amountInPaise) || amountInPaise < 100) {
      const err = new Error('Amount must be at least 100 paise (₹1.00).');
      err.statusCode = 400;
      throw err;
    }

    try {
      const razorpay = this.getRazorpay();
      const options = {
        amount: amountInPaise,
        currency,
        receipt: receipt ? receipt.toString().slice(-40) : `rcpt_${Date.now()}`,
        notes
      };

      const order = await razorpay.orders.create(options);
      return {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency
      };
    } catch (error) {
      console.error('❌ Razorpay Live Order Creation Error:', error.message);
      const err = new Error(error.error?.description || error.message || 'Failed to create live Razorpay order');
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async createPaymentIntent(amountInRupees, currency = 'INR', orderId, metadata = {}) {
    const amountInPaise = Math.round(Number(amountInRupees) * 100);
    if (isNaN(amountInPaise) || amountInPaise < 100) {
      throw new Error('Amount must be at least 100 paise (₹1.00).');
    }

    try {
      const razorpay = this.getRazorpay();
      const options = {
        amount: amountInPaise,
        currency: currency || 'INR',
        receipt: orderId ? orderId.toString().slice(-40) : `rcpt_${Date.now()}`,
        notes: metadata
      };

      const order = await razorpay.orders.create(options);
      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        clientSecret: null,
        raw: order
      };
    } catch (error) {
      console.error('❌ Razorpay Live Intent Error:', error.message);
      const err = new Error(error.error?.description || error.message || 'Failed to initialize live Razorpay transaction. Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  verifyPaymentSignature(orderId, paymentId, signature) {
    if (!orderId || !paymentId || !signature) {
      return false;
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('❌ RAZORPAY_KEY_SECRET is not configured in backend environment.');
      return false;
    }

    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');
    
    return expectedSignature === signature;
  }

  verifyWebhookSignature(body, signature, secret) {
    const webhookSecret = secret || process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) return false;
    
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');
    
    return expectedSignature === signature;
  }
}

export default new RazorpayAdapter();
