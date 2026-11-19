import mongoose from 'mongoose';
import paymentService from '../services/payment.service.js';
import razorpayAdapter from '../services/adapters/razorpay.adapter.js';
import Payment from '../models/Payment.model.js';
import Order from '../models/Order.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { PAYMENT_STATUS } from '../constants/index.js';

export const createStandardOrder = async (req, res) => {
  try {
    const { orderId, items, couponCode, receipt, notes } = req.body;

    let grandTotal = 0;
    let orderReceipt = receipt || `rcpt_${Date.now()}`;
    let orderNotes = notes || {};

    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }
      if (order.paymentStatus === 'completed') {
        return res.status(400).json({ success: false, error: 'Order is already paid' });
      }
      grandTotal = order.totals.grandTotal;
      orderReceipt = order.orderNumber;
      orderNotes = { ...orderNotes, orderId: order._id.toString() };
    } else if (items && Array.isArray(items) && items.length > 0) {
      const { default: orderService } = await import('../services/order.service.js');
      const calculation = await orderService.calculateOrderTotals(items, couponCode);
      grandTotal = calculation.totals.grandTotal;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Direct client-specified amount is forbidden. Pass orderId or items so server computes the authoritative total.'
      });
    }

    const amountInPaise = Math.round(grandTotal * 100);
    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        error: 'Calculated order total must be at least ₹1.00 (100 paise)'
      });
    }

    const order = await razorpayAdapter.createStandardOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderReceipt,
      notes: orderNotes
    });

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        'payment.gatewayOrderId': order.order_id
      });
    }

    return res.status(200).json({
      success: true,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to create Razorpay order'
    });
  }
};

export const verifyStandardPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      order_id,
      razorpay_payment_id,
      payment_id,
      razorpay_signature,
      signature,
      localOrderId
    } = req.body;

    const finalOrderId = razorpay_order_id || order_id;
    const finalPaymentId = razorpay_payment_id || payment_id;
    const finalSignature = razorpay_signature || signature;

    if (!finalOrderId || !finalPaymentId || !finalSignature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: order_id, payment_id, and razorpay_signature are required.'
      });
    }

    // 1. Verify cryptographic HMAC signature
    const isValid = razorpayAdapter.verifyPaymentSignature(
      finalOrderId,
      finalPaymentId,
      finalSignature
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed: Signature mismatch. Do not mark as paid.'
      });
    }

    // 2. Fetch payment record directly from Razorpay API
    let rzpPayment = null;
    try {
      rzpPayment = await razorpayAdapter.fetchPayment(finalPaymentId);
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: `Failed to fetch payment details from Razorpay: ${err.message}`
      });
    }

    if (!rzpPayment || (rzpPayment.status !== 'captured' && rzpPayment.status !== 'authorized')) {
      return res.status(400).json({
        success: false,
        error: `Payment is not captured or authorized on gateway (status: ${rzpPayment?.status})`
      });
    }

    // 3. Verify payment amount against database Order if linked
    const linkedOrder = await Order.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(localOrderId) ? localOrderId : null },
        { 'payment.gatewayOrderId': finalOrderId }
      ].filter(Boolean)
    });

    if (linkedOrder) {
      const expectedPaise = Math.round(linkedOrder.totals.grandTotal * 100);
      if (rzpPayment.amount !== expectedPaise) {
        return res.status(400).json({
          success: false,
          error: `Tampered payment amount rejected: Expected ₹${linkedOrder.totals.grandTotal} (${expectedPaise} paise), but gateway was charged ₹${rzpPayment.amount / 100} (${rzpPayment.amount} paise).`
        });
      }

      // Mark order as completed if not already
      if (linkedOrder.paymentStatus !== PAYMENT_STATUS.COMPLETED) {
        linkedOrder.paymentStatus = PAYMENT_STATUS.COMPLETED;
        linkedOrder.orderStatus = 'pending_approval';
        linkedOrder.payment = {
          method: 'razorpay',
          transactionId: finalPaymentId,
          gatewayOrderId: finalOrderId,
          gatewayResponse: rzpPayment
        };
        await linkedOrder.save();
      }
    }

    // Update payment record in database
    try {
      await paymentService.handlePaymentSuccess(finalOrderId, finalPaymentId, 'razorpay', req.body);
    } catch { }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and confirmed successfully',
      payment_id: finalPaymentId,
      order_id: finalOrderId
    });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Payment verification failed'
    });
  }
};

export const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId, gateway } = req.body;

    if (!orderId || !gateway) {
      return res.status(400).json(new ApiResponse(400, null, 'orderId and gateway are required', false));
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json(new ApiResponse(404, null, 'Order not found', false));
    }

    const customerId = req.user?._id || order.customer;
    const intent = await paymentService.createPayment(orderId, gateway, customerId);
    return res.status(200).json(new ApiResponse(200, intent, 'Payment intent created successfully'));
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json(new ApiResponse(400, null, 'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required', false));
    }

    const result = await paymentService.verifyAndConfirmPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    return res.status(200).json(new ApiResponse(200, result, 'Payment verified and recorded successfully'));
  } catch (error) {
    next(error);
  }
};

export const getPaymentHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const query = { customer: req.user._id };

    const payments = await Payment.find(query)
      .populate('order', 'orderNumber totals')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Payment.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Payment history retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getPaymentDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id).populate('order', 'orderNumber totals');

    if (!payment) {
      return res.status(404).json(new ApiResponse(404, null, 'Payment not found', false));
    }

    // Check authorization
    if (req.user.role !== 'admin' && payment.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json(new ApiResponse(403, null, 'Unauthorized', false));
    }

    return res.status(200).json(new ApiResponse(200, payment, 'Payment retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

// Admin endpoints
export const getAllPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.gateway) query.gateway = req.query.gateway;
    if (req.query.search) {
      query.$or = [
        { gatewayOrderId: { $regex: req.query.search, $options: 'i' } },
        { gatewayPaymentId: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const payments = await Payment.find(query)
      .populate('customer', 'name email')
      .populate('order', 'orderNumber totals')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Payment.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Payments retrieved successfully'));
  } catch (error) {
    next(error);
  }
};
