import Cart from '../models/Cart.model.js';

class CartRepository {
  async findCartByUserOrGuest(userId, guestId) {
    if (userId) {
      return await Cart.findOne({ user: userId }).populate('items.product');
    }
    return await Cart.findOne({ guestId }).populate('items.product');
  }

  async createCart(data) {
    const cart = new Cart(data);
    return await cart.save();
  }

  async saveCart(cart) {
    return await cart.save();
  }

  async clearCart(cartId) {
    return await Cart.findByIdAndUpdate(cartId, { items: [], totalAmount: 0 }, { new: true });
  }

  async getAllCarts() {
    return await Cart.find().populate('user', 'firstName lastName email').populate('items.product');
  }
}

export default new CartRepository();
