import express from 'express';
import cartController from '../controllers/cart.controller.js';
import { optionalAuthenticate } from '../middlewares/optionalAuth.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Admin Route
router.get('/all', verifyJWT, authorizeRoles('admin', 'superadmin'), cartController.getAllCarts);

// Customer / Guest Routes
router.use(optionalAuthenticate);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.patch('/update', cartController.updateQuantity);
router.delete('/remove', cartController.removeItem);
router.delete('/clear', cartController.clearCart);
router.post('/buy-now', cartController.buyNow);

export default router;
