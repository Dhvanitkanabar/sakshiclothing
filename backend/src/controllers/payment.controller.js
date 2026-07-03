import paymentService from '../services/payment.service.js';
import Payment from '../models/Payment.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId, gateway } = req.body;
    
    if (!orderId || !gateway) {
      return res.status(400).json(new ApiResponse(400, null, 'orderId and gateway are required', false));
    }

    const intent = await paymentService.createPayment(orderId, gateway, req.user._id);
    return res.status(200).json(new ApiResponse(200, intent, 'Payment intent created successfully'));
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
