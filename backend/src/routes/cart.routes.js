import express from 'express';
import cartController from '../controllers/cart.controller.js';
import { optionalAuthenticate } from '../middlewares/optionalAuth.js';

const router = express.Router();

router.use(optionalAuthenticate);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.patch('/update', cartController.updateQuantity);
router.delete('/remove', cartController.removeItem);
router.post('/buy-now', cartController.buyNow);

export default router;
