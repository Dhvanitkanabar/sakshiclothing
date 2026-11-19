import { Router } from 'express';
import {
  initiateCheckout,
  checkout,
  buyNow,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getInvoice,
  getAllOrders,
  acceptOrder,
  rejectOrder,
  trackOrderPublic,
  updateOrderStatus,
  updateTracking,
  approveReturn,
  updateOrderCoordinates
} from '../controllers/order.controller.js';
import { verifyJWT, authorizeRoles, optionalAuth } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { checkoutSchema } from '../validators/order.validator.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const trackingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many tracking attempts. Please try again after 15 minutes.' }
});

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many checkout attempts. Please try again shortly.' }
});

// Public / Verification Tracking Route (optional auth for seamless owner lookup)
router.get('/track', trackingLimiter, optionalAuth, trackOrderPublic);

// Customer Routes (auth required)
router.post('/initiate', checkoutLimiter, verifyJWT, validateRequest(checkoutSchema), initiateCheckout);
router.post('/checkout', checkoutLimiter, verifyJWT, validateRequest(checkoutSchema), checkout);
router.post('/buy-now', checkoutLimiter, verifyJWT, buyNow);
router.get('/', verifyJWT, getUserOrders);
router.get('/:id', verifyJWT, getOrderById);
router.patch('/:id/cancel', verifyJWT, cancelOrder);
router.get('/:id/invoice', verifyJWT, getInvoice);

// Admin Routes
router.get('/admin/all', verifyJWT, authorizeRoles('admin'), getAllOrders);
router.post('/admin/:id/accept', verifyJWT, authorizeRoles('admin'), acceptOrder);
router.post('/admin/:id/reject', verifyJWT, authorizeRoles('admin'), rejectOrder);
router.patch('/admin/:id/status', verifyJWT, authorizeRoles('admin'), updateOrderStatus);
router.patch('/admin/:id/tracking', verifyJWT, authorizeRoles('admin'), updateTracking);
router.patch('/admin/:id/coordinates', verifyJWT, authorizeRoles('admin'), updateOrderCoordinates);
router.patch('/admin/:id/return', verifyJWT, authorizeRoles('admin'), approveReturn);

export default router;
