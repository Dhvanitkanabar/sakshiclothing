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

const router = express.Router();

// Standard Razorpay endpoints (can be called directly)
router.post('/create-order', createStandardOrder);
router.post('/verify-payment', verifyStandardPayment);

// Webhook routes - Need to be outside of auth
// In app.js, make sure to use raw body parsing for these routes if needed
router.post('/webhook/razorpay', handleRazorpayWebhook);
router.post('/webhook/stripe', handleStripeWebhook);

// Customer payment intent creation & signature verification (supports token refresh and active order fallback)
router.post('/create-intent', optionalAuth, createPaymentIntent);
router.post('/verify', optionalAuth, verifyPayment);

// Protected Customer history routes
router.get('/history', verifyJWT, getPaymentHistory);
router.get('/:id', verifyJWT, getPaymentDetails);

// Admin routes
router.use(verifyJWT, authorizeRoles('admin'));
router.get('/', getAllPayments);

export default router;
