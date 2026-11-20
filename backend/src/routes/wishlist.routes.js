import express from 'express';
import wishlistController from '../controllers/wishlist.controller.js';
import { optionalAuthenticate } from '../middlewares/optionalAuth.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Admin Route
router.get('/all', verifyJWT, authorizeRoles('admin', 'superadmin'), wishlistController.getAllWishlists);

// Customer / Guest Routes
router.use(optionalAuthenticate);

router.get('/', wishlistController.getWishlist);
router.post('/add', wishlistController.addToWishlist);
router.delete('/remove', wishlistController.removeFromWishlist);
router.post('/move-to-cart', wishlistController.moveToCart);

export default router;
