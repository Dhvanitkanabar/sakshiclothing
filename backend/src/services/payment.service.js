import razorpayAdapter from './adapters/razorpay.adapter.js';
import stripeAdapter from './adapters/stripe.adapter.js';
import Payment from '../models/Payment.model.js';
import Order from '../models/Order.model.js';
import { PAYMENT_STATUS } from '../constants/index.js';

class PaymentService {
  async createPayment(orderId, gateway, customerId) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (gateway === 'cod') {
      const payment = await Payment.create({
        order: order._id,
        customer: customerId,
        gateway: 'cod',
        amount: order.totals.grandTotal,
        status: PAYMENT_STATUS.PENDING,
        method: 'cod'
      });
      return { paymentId: payment._id, type: 'cod' };
    }

    let intentResponse;
    let currency = 'INR';

    if (gateway === 'razorpay') {
      intentResponse = await razorpayAdapter.createPaymentIntent(
        order.totals.grandTotal,
        currency,
        order._id,
        { customerId: customerId.toString() }
      );
    } else if (gateway === 'stripe') {
      currency = 'USD'; // For demonstration, Stripe using USD
      intentResponse = await stripeAdapter.createPaymentIntent(
        order.totals.grandTotal,
        currency,
        order._id,
        { customerId: customerId.toString() }
      );
    } else {
      throw new Error('Unsupported payment gateway');
    }

    const payment = await Payment.create({
      order: order._id,
      customer: customerId,
      gateway,
      gatewayOrderId: intentResponse.id,
      amount: order.totals.grandTotal,
      currency,
      status: PAYMENT_STATUS.PENDING,
      gatewayResponse: intentResponse.raw
    });

    return {
      paymentId: payment._id,
      gatewayOrderId: intentResponse.id,
      clientSecret: intentResponse.clientSecret,
      amount: intentResponse.amount,
      currency: intentResponse.currency,
      gateway
    };
  }

  async processWebhook(gateway, body, signature, secret) {
    if (gateway === 'razorpay') {
      const isValid = razorpayAdapter.verifyWebhookSignature(body, signature, secret);
      if (!isValid) throw new Error('Invalid signature');
      
      const parsedBody = JSON.parse(body);
      const event = parsedBody.event;
      
      if (event === 'payment.captured' || event === 'order.paid') {
        const payload = parsedBody.payload.payment.entity;
        const gatewayOrderId = payload.order_id;
        const paymentId = payload.id;
        
        await this.handlePaymentSuccess(gatewayOrderId, paymentId, 'razorpay', parsedBody);
      } else if (event === 'payment.failed') {
        const payload = parsedBody.payload.payment.entity;
        const gatewayOrderId = payload.order_id;
        await this.handlePaymentFailure(gatewayOrderId, 'razorpay', parsedBody);
      }

    } else if (gateway === 'stripe') {
      const event = stripeAdapter.verifyWebhookSignature(body, signature, secret);
      if (!event) throw new Error('Invalid signature');

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        await this.handlePaymentSuccess(paymentIntent.id, paymentIntent.id, 'stripe', event);
      } else if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object;
        await this.handlePaymentFailure(paymentIntent.id, 'stripe', event);
      }
    }
  }

  async handlePaymentSuccess(gatewayOrderId, gatewayPaymentId, gateway, rawPayload) {
    const payment = await Payment.findOne({ gatewayOrderId, gateway });
    if (!payment) {
      console.error(`Payment not found for ${gateway} order: ${gatewayOrderId}`);
      return;
    }

    if (payment.status === PAYMENT_STATUS.COMPLETED) {
      // Idempotency: Already processed
      return;
    }

    payment.status = PAYMENT_STATUS.COMPLETED;
    payment.gatewayPaymentId = gatewayPaymentId;
    payment.gatewayResponse = rawPayload;
    await payment.save();

    // Update order status
    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = PAYMENT_STATUS.COMPLETED;
      if (order.orderStatus === 'pending') {
         order.orderStatus = 'processing';
         order.timeline.push({ status: 'processing', note: 'Payment received successfully.' });
      }
      await order.save();
    }
  }

  async handlePaymentFailure(gatewayOrderId, gateway, rawPayload) {
    const payment = await Payment.findOne({ gatewayOrderId, gateway });
    if (!payment) return;

    if (payment.status !== PAYMENT_STATUS.COMPLETED) {
      payment.status = PAYMENT_STATUS.FAILED;
      payment.gatewayResponse = rawPayload;
      await payment.save();

      const order = await Order.findById(payment.order);
      if (order) {
        order.paymentStatus = PAYMENT_STATUS.FAILED;
        order.timeline.push({ status: order.orderStatus, note: 'Payment failed.' });
        await order.save();
      }
    }
  }
}

export default new PaymentService();
