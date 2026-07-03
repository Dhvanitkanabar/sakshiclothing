import { Router } from 'express';
import { getDashboardStats, exportOrdersCsv, exportInventoryCsv } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middlewares/authentication.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();
router.get('/stats', authenticate, authorize('admin'), getDashboardStats);
router.get('/export/orders', authenticate, authorize('admin'), exportOrdersCsv);
router.get('/export/inventory', authenticate, authorize('admin'), exportInventoryCsv);
export default router;
