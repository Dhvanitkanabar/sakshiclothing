import Wishlist from '../models/Wishlist.model.js';

class WishlistRepository {
  async findWishlistByUserOrGuest(userId, guestId) {
    if (userId) {
      return await Wishlist.findOne({ user: userId }).populate('products');
    }
    return await Wishlist.findOne({ guestId }).populate('products');
  }

  async createWishlist(data) {
    const wishlist = new Wishlist(data);
    return await wishlist.save();
  }

  async saveWishlist(wishlist) {
    return await wishlist.save();
  }

  async getAllWishlists() {
    return await Wishlist.find().populate('user', 'firstName lastName email').populate('products');
  }
}

export default new WishlistRepository();
