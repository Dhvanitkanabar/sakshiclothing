import paymentService from '../services/payment.service.js';

export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature) {
      return res.status(400).json({ success: false, error: 'Missing x-razorpay-signature header' });
    }

    if (!secret) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not configured in backend environment.');
      return res.status(500).json({ success: false, error: 'Webhook secret is not configured' });
    }

    const body = req.rawBody 
      ? req.rawBody.toString('utf8') 
      : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

    await paymentService.processWebhook('razorpay', body, signature, secret);
    return res.status(200).json({ status: 'ok', success: true });
  } catch (error) {
    console.error('Razorpay Webhook Error:', error.message);
    return res.status(400).json({ success: false, error: `Webhook Error: ${error.message}` });
  }
};

export const handleStripeWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_123';
    // Stripe requires the raw buffer
    const body = req.rawBody;

    await paymentService.processWebhook('stripe', body, signature, secret);
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe Webhook Error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
