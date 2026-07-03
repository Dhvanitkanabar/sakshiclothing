import { Router } from 'express';
import { createCoupon, getCoupons, updateCoupon, deleteCoupon, validateCoupon } from '../controllers/coupon.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Customer route
router.post('/validate', verifyJWT, validateCoupon);

// Admin routes
router.use('/admin', verifyJWT, authorizeRoles('admin', 'superadmin'));
router.route('/admin')
  .post(createCoupon)
  .get(getCoupons);

router.route('/admin/:id')
  .patch(updateCoupon)
  .delete(deleteCoupon);

export default router;
