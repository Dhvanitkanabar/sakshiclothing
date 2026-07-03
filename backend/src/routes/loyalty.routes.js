import { Router } from 'express';
import { getCustomerLoyaltyHistory, getAdminLoyaltyTransactions, adjustPoints } from '../controllers/loyalty.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Customer routes
router.get('/', verifyJWT, getCustomerLoyaltyHistory);

// Admin routes
router.get('/admin', verifyJWT, authorizeRoles('admin', 'superadmin'), getAdminLoyaltyTransactions);
router.post('/admin/adjust', verifyJWT, authorizeRoles('admin', 'superadmin'), adjustPoints);

export default router;
