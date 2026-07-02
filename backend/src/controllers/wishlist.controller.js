import crypto from 'crypto';
import wishlistService from '../services/wishlist.service.js';
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

class WishlistController {
  getWishlist = asyncHandler(async (req, res) => {
    const { userId, guestId } = getUserIdAndGuestId(req, res);
    const wishlist = await wishlistService.getWishlist(userId, guestId);
    res.status(200).json({ success: true, data: wishlist });
  });

  addToWishlist = asyncHandler(async (req, res) => {
    const { userId, guestId } = getUserIdAndGuestId(req, res);
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }

    const wishlist = await wishlistService.addToWishlist(userId, guestId, productId);
    res.status(200).json({ success: true, data: wishlist, message: 'Added to wishlist' });
  });

  removeFromWishlist = asyncHandler(async (req, res) => {
    const { userId, guestId } = getUserIdAndGuestId(req, res);
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }

    const wishlist = await wishlistService.removeFromWishlist(userId, guestId, productId);
    res.status(200).json({ success: true, data: wishlist, message: 'Removed from wishlist' });
  });

  moveToCart = asyncHandler(async (req, res) => {
    const { userId, guestId } = getUserIdAndGuestId(req, res);
    const { productId, variantId } = req.body;

    if (!productId || !variantId) {
      return res.status(400).json({ success: false, message: 'productId and variantId are required' });
    }

    const wishlist = await wishlistService.moveToCart(userId, guestId, productId, variantId);
    res.status(200).json({ success: true, data: wishlist, message: 'Moved to cart' });
  });

  getAllWishlists = asyncHandler(async (req, res) => {
    const wishlists = await wishlistService.getAllWishlists();
    res.status(200).json({ success: true, data: wishlists });
  });
}

export default new WishlistController();
