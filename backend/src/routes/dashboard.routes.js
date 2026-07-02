import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middlewares/authentication.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();
router.get('/stats', authenticate, authorize('admin'), getDashboardStats);
export default router;
