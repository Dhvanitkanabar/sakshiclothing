import { Router } from 'express';
import { getAdminNotifications, markAsRead, createAdminNotification, getCustomerNotifications, deleteNotification } from '../controllers/notification.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Customer routes
router.get('/', verifyJWT, getCustomerNotifications);
router.patch('/:id/read', verifyJWT, markAsRead);
router.delete('/:id', verifyJWT, deleteNotification);

// Admin routes
router.get('/admin', verifyJWT, authorizeRoles('admin', 'superadmin'), getAdminNotifications);
router.patch('/admin/:id/read', verifyJWT, authorizeRoles('admin', 'superadmin'), markAsRead);
router.post('/admin', verifyJWT, authorizeRoles('admin', 'superadmin'), createAdminNotification);

export default router;
