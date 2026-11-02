import { Router } from 'express';
import {
  subscribe,
  getSubscribers,
  deleteSubscriber,
  broadcastToSubscribers,
  getSmtpConfig,
  saveSmtpConfig,
  testSmtpConnection
} from '../controllers/subscriber.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Public subscription endpoint
router.post('/subscribe', subscribe);
router.post('/', subscribe);

// Admin-only management, SMTP gateway & 1-click broadcast endpoints
router.get('/', verifyJWT, authorizeRoles('admin', 'superadmin'), getSubscribers);
router.get('/admin', verifyJWT, authorizeRoles('admin', 'superadmin'), getSubscribers);
router.delete('/:id', verifyJWT, authorizeRoles('admin', 'superadmin'), deleteSubscriber);
router.post('/broadcast', verifyJWT, authorizeRoles('admin', 'superadmin'), broadcastToSubscribers);

// SMTP configuration & diagnostics
router.get('/smtp', verifyJWT, authorizeRoles('admin', 'superadmin'), getSmtpConfig);
router.post('/smtp', verifyJWT, authorizeRoles('admin', 'superadmin'), saveSmtpConfig);
router.post('/test-email', verifyJWT, authorizeRoles('admin', 'superadmin'), testSmtpConnection);

export default router;

