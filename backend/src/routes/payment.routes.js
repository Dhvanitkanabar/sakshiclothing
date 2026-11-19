import express from 'express';
import { verifyJWT, authorizeRoles, optionalAuth } from '../middlewares/auth.middleware.js';
import {
  createStandardOrder,
  verifyStandardPayment,
  createPaymentIntent,
  verifyPayment,
  getPaymentHistory,
  getPaymentDetails,
  getAllPayments
} from '../controllers/payment.controller.js';
import {
  handleRazorpayWebhook,
  handleStripeWebhook
} from '../controllers/webhook.controller.js';

import rateLimit from 'express-rate-limit';

const router = express.Router();

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many payment requests, please try again later.' }
});

// Standard Razorpay endpoints (can be called directly)
router.post('/create-order', paymentLimiter, createStandardOrder);
router.post('/verify-payment', paymentLimiter, verifyStandardPayment);

// Webhook routes - Need to be outside of auth
// In app.js, make sure to use raw body parsing for these routes if needed
router.post('/webhook/razorpay', handleRazorpayWebhook);
router.post('/webhook/stripe', handleStripeWebhook);

// Customer payment intent creation & signature verification (supports token refresh and active order fallback)
router.post('/create-intent', paymentLimiter, optionalAuth, createPaymentIntent);
router.post('/verify', paymentLimiter, optionalAuth, verifyPayment);

// Protected Customer history routes
router.get('/history', verifyJWT, getPaymentHistory);
router.get('/:id', verifyJWT, getPaymentDetails);

// Admin routes
router.use(verifyJWT, authorizeRoles('admin'));
router.get('/', getAllPayments);

export default router;
