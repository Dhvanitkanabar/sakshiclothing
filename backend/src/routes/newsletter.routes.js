import { Router } from 'express';
import { subscribe, unsubscribe, getAdminSubscribers, exportSubscribersCsv } from '../controllers/newsletter.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

// Admin routes
router.get('/admin', verifyJWT, authorizeRoles('admin', 'superadmin'), getAdminSubscribers);
router.get('/export', verifyJWT, authorizeRoles('admin', 'superadmin'), exportSubscribersCsv);

export default router;
