import { Router } from 'express';
import { addReview, getProductReviews, getAdminReviews, updateReviewStatus } from '../controllers/review.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Customer routes
router.post('/', verifyJWT, addReview);

// Admin routes
router.get('/admin', verifyJWT, authorizeRoles('admin', 'superadmin'), getAdminReviews);
router.patch('/admin/:id/status', verifyJWT, authorizeRoles('admin', 'superadmin'), updateReviewStatus);

export default router;
