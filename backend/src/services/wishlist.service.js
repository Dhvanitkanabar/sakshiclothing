import wishlistRepository from '../repositories/wishlist.repository.js';
import ProductRepository from '../repositories/product.repository.js';
import cartService from './cart.service.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

class WishlistService {
  async getWishlist(userId, guestId) {
    let wishlist = await wishlistRepository.findWishlistByUserOrGuest(userId, guestId);
    if (!wishlist) {
      wishlist = await wishlistRepository.createWishlist({ user: userId, guestId });
    }
    return wishlist;
  }

  async addToWishlist(userId, guestId, productId) {
    const product = await ProductRepository.findById(productId);
    if (!product) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');

    let wishlist = await wishlistRepository.findWishlistByUserOrGuest(userId, guestId);
    if (!wishlist) {
      wishlist = await wishlistRepository.createWishlist({ user: userId, guestId, products: [] });
    }

    if (!wishlist.products.some(p => p._id.toString() === productId)) {
      wishlist.products.push(productId);
      return await wishlistRepository.saveWishlist(wishlist);
    }
    return wishlist;
  }

  async removeFromWishlist(userId, guestId, productId) {
    const wishlist = await wishlistRepository.findWishlistByUserOrGuest(userId, guestId);
    if (!wishlist) return null;

    wishlist.products = wishlist.products.filter(p => p._id.toString() !== productId);
    return await wishlistRepository.saveWishlist(wishlist);
  }

  async moveToCart(userId, guestId, productId, variantId) {
    // Add to cart
    await cartService.addToCart(userId, guestId, productId, variantId, 1);
    // Remove from wishlist
    return await this.removeFromWishlist(userId, guestId, productId);
  }

  async getAllWishlists() {
    return await wishlistRepository.getAllWishlists();
  }
}

export default new WishlistService();
