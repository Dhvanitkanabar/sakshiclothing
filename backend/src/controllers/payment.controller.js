import paymentService from '../services/payment.service.js';
import razorpayAdapter from '../services/adapters/razorpay.adapter.js';
import Payment from '../models/Payment.model.js';
import Order from '../models/Order.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const createStandardOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required'
      });
    }

    const amountInPaise = Math.round(Number(amount));
    if (isNaN(amountInPaise) || amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        error: 'Minimum amount must be at least 100 paise (₹1.00)'
      });
    }

    const order = await razorpayAdapter.createStandardOrder({
      amount: amountInPaise,
      currency,
      receipt,
      notes
    });

    return res.status(200).json({
      success: true,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    const statusCode = error.statusCode || 500;
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
      signature
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

    // If there is an associated payment in the database, update its status
    try {
      await paymentService.handlePaymentSuccess(finalOrderId, finalPaymentId, 'razorpay', req.body);
    } catch {
      // Ignore if called standalone
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment_id: finalPaymentId,
      order_id: finalOrderId
    });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error occurred while verifying payment signature'
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
