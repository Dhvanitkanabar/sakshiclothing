import crypto from 'crypto';
import cartService from '../services/cart.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getUserIdAndGuestId = (req, res) => {
  const userId = req.user ? req.user._id : null;
  let guestId = req.cookies.guestId;

  if (!userId && !guestId) {
    guestId = crypto.randomUUID();
    res.cookie('guestId', guestId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  }
  return { userId, guestId };
};

class CartController {
  getCart = asyncHandler(async (req, res) => {
    const { userId, guestId } = getUserIdAndGuestId(req, res);
    const cart = await cartService.getCart(userId, guestId);
    res.status(200).json({ success: true, data: cart });
  });

  addToCart = asyncHandler(async (req, res) => {
    const { userId, guestId } = getUserIdAndGuestId(req, res);
    const { productId, variantId, quantity } = req.body;
    
    if (!productId || !variantId || !quantity) {
      return res.status(400).json({ success: false, message: 'productId, variantId, and quantity are required' });
    }

    const cart = await cartService.addToCart(userId, guestId, productId, variantId, quantity);
    res.status(200).json({ success: true, data: cart, message: 'Item added to cart' });
  });

  updateQuantity = asyncHandler(async (req, res) => {
    const { userId, guestId } = getUserIdAndGuestId(req, res);
    const { productId, variantId, quantity } = req.body;

    if (!productId || !variantId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'productId, variantId, and quantity are required' });
    }

    const cart = await cartService.updateItemQuantity(userId, guestId, productId, variantId, quantity);
    res.status(200).json({ success: true, data: cart, message: 'Cart updated' });
  });

  removeItem = asyncHandler(async (req, res) => {
    const { userId, guestId } = getUserIdAndGuestId(req, res);
    const { productId, variantId } = req.body;

    const cart = await cartService.removeItem(userId, guestId, productId, variantId);
    res.status(200).json({ success: true, data: cart, message: 'Item removed from cart' });
  });

  buyNow = asyncHandler(async (req, res) => {
    // Buy Now typically bypasses the cart or creates a temporary cart session.
    // For simplicity, we can just add to cart and return it.
    const { userId, guestId } = getUserIdAndGuestId(req, res);
    const { productId, variantId, quantity } = req.body;

    await cartService.clearCart(userId, guestId);
    const cart = await cartService.addToCart(userId, guestId, productId, variantId, quantity);
    
    res.status(200).json({ success: true, data: cart, message: 'Proceeding to checkout' });
  });

  getAllCarts = asyncHandler(async (req, res) => {
    const carts = await cartService.getAllCarts();
    res.status(200).json({ success: true, data: carts });
  });
}

export default new CartController();
