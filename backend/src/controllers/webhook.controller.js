import paymentService from '../services/payment.service.js';

export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret';
    const body = req.rawBody || JSON.stringify(req.body);

    await paymentService.processWebhook('razorpay', body, signature, secret);
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay Webhook Error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
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
