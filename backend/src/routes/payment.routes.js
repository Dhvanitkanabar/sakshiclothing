import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import {
  createPaymentIntent,
  getPaymentHistory,
  getPaymentDetails,
  getAllPayments
} from '../controllers/payment.controller.js';
import {
  handleRazorpayWebhook,
  handleStripeWebhook
} from '../controllers/webhook.controller.js';

const router = express.Router();

// Webhook routes - Need to be outside of auth
// In app.js, make sure to use raw body parsing for these routes if needed
router.post('/webhook/razorpay', handleRazorpayWebhook);
router.post('/webhook/stripe', handleStripeWebhook);

// Protected Customer routes
router.use(protect);

router.post('/create-intent', createPaymentIntent);
router.get('/history', getPaymentHistory);
router.get('/:id', getPaymentDetails);

// Admin routes
router.use(authorize('admin'));
router.get('/', getAllPayments);

export default router;
