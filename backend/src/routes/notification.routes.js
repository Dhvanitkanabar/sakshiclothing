import { Router } from 'express';
import { getAdminNotifications, markAsRead, createAdminNotification } from '../controllers/notification.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/admin', verifyJWT, authorizeRoles('admin', 'superadmin'), getAdminNotifications);
router.patch('/admin/:id/read', verifyJWT, authorizeRoles('admin', 'superadmin'), markAsRead);
router.post('/admin', verifyJWT, authorizeRoles('admin', 'superadmin'), createAdminNotification);

export default router;
