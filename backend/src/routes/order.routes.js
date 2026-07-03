import { Router } from 'express';
import {
  checkout,
  buyNow,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getInvoice,
  getAllOrders,
  updateOrderStatus,
  updateTracking,
  approveReturn
} from '../controllers/order.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Customer Routes (auth required)
router.post('/checkout', verifyJWT, checkout);
router.post('/buy-now', verifyJWT, buyNow);
router.get('/', verifyJWT, getUserOrders);
router.get('/:id', verifyJWT, getOrderById);
router.patch('/:id/cancel', verifyJWT, cancelOrder);
router.get('/:id/invoice', verifyJWT, getInvoice);

// Admin Routes
router.get('/admin/all', verifyJWT, authorizeRoles('admin'), getAllOrders);
router.patch('/admin/:id/status', verifyJWT, authorizeRoles('admin'), updateOrderStatus);
router.patch('/admin/:id/tracking', verifyJWT, authorizeRoles('admin'), updateTracking);
router.patch('/admin/:id/return', verifyJWT, authorizeRoles('admin'), approveReturn);

export default router;
