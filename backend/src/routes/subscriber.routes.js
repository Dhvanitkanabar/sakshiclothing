import { Router } from 'express';
import {
  subscribe,
  getSubscribers,
  deleteSubscriber,
  broadcastToSubscribers
} from '../controllers/subscriber.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Public subscription endpoint
router.post('/subscribe', subscribe);
router.post('/', subscribe);

// Admin-only management & 1-click broadcast endpoints
router.get('/', verifyJWT, authorizeRoles('admin', 'superadmin'), getSubscribers);
router.get('/admin', verifyJWT, authorizeRoles('admin', 'superadmin'), getSubscribers);
router.delete('/:id', verifyJWT, authorizeRoles('admin', 'superadmin'), deleteSubscriber);
router.post('/broadcast', verifyJWT, authorizeRoles('admin', 'superadmin'), broadcastToSubscribers);

export default router;
