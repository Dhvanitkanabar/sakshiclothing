import crypto from 'crypto';
import mongoose from 'mongoose';
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
      gateway,
      isSimulated: !!intentResponse.isSimulated
    };
  }

  verifyPaymentSignature(orderId, paymentId, signature) {
    return razorpayAdapter.verifyPaymentSignature(orderId, paymentId, signature);
  }

  async verifyAndConfirmPayment(gatewayOrderId, gatewayPaymentId, signature) {
    const isSignatureValid = this.verifyPaymentSignature(gatewayOrderId, gatewayPaymentId, signature);
    if (!isSignatureValid) {
      throw new Error('Invalid payment signature');
    }
    await this.handlePaymentSuccess(gatewayOrderId, gatewayPaymentId, 'razorpay', {
      gatewayOrderId,
      gatewayPaymentId,
      signature
    });
    return { verified: true };
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
    let order = null;
    let payment = await Payment.findOne({ gatewayOrderId, gateway });

    if (payment && payment.order) {
      order = await Order.findById(payment.order);
    }

    if (!order) {
      const orConditions = [{ 'payment.gatewayOrderId': gatewayOrderId }];
      const orderId = rawPayload?.payload?.payment?.entity?.notes?.orderId || rawPayload?.orderId;
      if (orderId && mongoose.isValidObjectId(orderId)) {
        orConditions.push({ _id: orderId });
      }
      const orderNumber = rawPayload?.payload?.payment?.entity?.notes?.orderNumber || rawPayload?.orderNumber;
      if (orderNumber) {
        orConditions.push({ orderNumber });
      }
      order = await Order.findOne({ $or: orConditions });
    }

    if (!order) {
      console.warn(`[Payment Webhook Warning]: No order matching gatewayOrderId ${gatewayOrderId}`);
      return;
    }

    // Idempotency: If already finalized, acknowledge and exit
    if (order.paymentStatus === PAYMENT_STATUS.COMPLETED) {
      return;
    }

    // Amount match check
    const entity = rawPayload?.payload?.payment?.entity || rawPayload;
    if (entity && entity.amount) {
      const chargedPaise = Number(entity.amount);
      const expectedPaise = Math.round(order.totals.grandTotal * 100);
      if (chargedPaise !== expectedPaise) {
        console.error(`[Webhook Fraud Alert]: Gateway amount ₹${chargedPaise / 100} does not match server expected ₹${order.totals.grandTotal}`);
        order.paymentStatus = PAYMENT_STATUS.FAILED;
        order.timeline.push({ status: 'payment_failed', note: 'Payment amount mismatch rejected.' });
        await order.save();
        return;
      }
    }

    // Finalize order
    order.paymentStatus = PAYMENT_STATUS.COMPLETED;
    order.orderStatus = 'pending_approval';
    order.payment = {
      method: gateway || 'razorpay',
      transactionId: gatewayPaymentId,
      gatewayOrderId: gatewayOrderId,
      gatewayResponse: rawPayload
    };
    order.authenticity.paymentVerified = true;
    order.authenticity.riskScore = 'Low Risk (Webhook Verified)';
    order.timeline.push({
      status: 'pending_approval',
      note: `Payment of ₹${order.totals.grandTotal} captured via ${gateway} webhook (Txn: ${gatewayPaymentId}). Order finalized.`
    });

    // Deduct stock if order was in payment_pending
    if (order.products && order.products.length > 0) {
      const Product = (await import('../models/Product.model.js')).default;
      const bulkUpdates = order.products.map(item => ({
        updateOne: {
          filter: { _id: item.product, 'variants._id': item.variantId },
          update: {
            $inc: {
              'variants.$.stock': -item.quantity,
              'inventory.totalStock': -item.quantity
            }
          }
        }
      }));
      await Product.bulkWrite(bulkUpdates).catch(e => console.error('Stock decrement in webhook:', e.message));
    }

    // Atomically increment coupon usage if used
    if (order.coupon) {
      const Coupon = (await import('../models/Coupon.model.js')).default;
      await Coupon.consumeCoupon(order.coupon).catch(() => {});
    }

    await order.save();

    // Update or create payment record
    if (payment) {
      payment.status = PAYMENT_STATUS.COMPLETED;
      payment.gatewayPaymentId = gatewayPaymentId;
      payment.gatewayResponse = rawPayload;
      await payment.save();
    } else {
      await Payment.create({
        order: order._id,
        customer: order.customer,
        gateway: gateway || 'razorpay',
        gatewayOrderId,
        gatewayPaymentId,
        amount: order.totals.grandTotal,
        currency: 'INR',
        status: PAYMENT_STATUS.COMPLETED,
        method: gateway || 'razorpay',
        gatewayResponse: rawPayload
      }).catch(() => {});
    }

    // Dispatch order confirmation email
    try {
      const { sendOrderConfirmationEmail } = await import('../utils/emailService.js');
      const User = (await import('../models/User.model.js')).default;
      const customer = await User.findById(order.customer);
      if (customer?.email) {
        await sendOrderConfirmationEmail(order, customer);
      }
    } catch (mailErr) {
      console.error('Confirmation email error in webhook:', mailErr.message);
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
