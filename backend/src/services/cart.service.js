import cartRepository from '../repositories/cart.repository.js';
import ProductRepository from '../repositories/product.repository.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

class CartService {
  async getCart(userId, guestId) {
    let cart = await cartRepository.findCartByUserOrGuest(userId, guestId);
    if (!cart) {
      cart = await cartRepository.createCart({ user: userId, guestId });
    }
    return cart;
  }

  async addToCart(userId, guestId, productId, variantId, quantity) {
    const product = await ProductRepository.findById(productId);
    if (!product) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');

    const variant = product.variants.id(variantId);
    if (!variant) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid variant');

    if (variant.stock < quantity) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Insufficient stock');
    }

    let cart = await cartRepository.findCartByUserOrGuest(userId, guestId);
    if (!cart) {
      cart = await cartRepository.createCart({ user: userId, guestId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.product._id.toString() === productId && item.variantId.toString() === variantId
    );

    if (existingItemIndex > -1) {
      const newQty = cart.items[existingItemIndex].quantity + quantity;
      if (variant.stock < newQty) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Insufficient stock for combined quantity');
      cart.items[existingItemIndex].quantity = newQty;
      // Subtotal is recalculated in pre-save hook
    } else {
      cart.items.push({
        product: productId,
        variantId: variantId,
        quantity: quantity,
        price: product.pricing.basePrice, // assuming flat basePrice for simplicity as per existing schema
        subtotal: 0 // Will be set by pre-save
      });
    }

    return await cartRepository.saveCart(cart);
  }

  async updateItemQuantity(userId, guestId, productId, variantId, quantity) {
    if (quantity < 1) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Quantity must be at least 1');

    const cart = await cartRepository.findCartByUserOrGuest(userId, guestId);
    if (!cart) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Cart not found');

    const item = cart.items.find(i => i.product._id.toString() === productId && i.variantId.toString() === variantId);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Item not in cart');

    const product = await ProductRepository.findById(productId);
    const variant = product.variants.id(variantId);
    if (variant.stock < quantity) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Insufficient stock');

    item.quantity = quantity;
    return await cartRepository.saveCart(cart);
  }

  async removeItem(userId, guestId, productId, variantId) {
    const cart = await cartRepository.findCartByUserOrGuest(userId, guestId);
    if (!cart) return null;

    cart.items = cart.items.filter(
      i => !(i.product._id.toString() === productId && i.variantId.toString() === variantId)
    );

    return await cartRepository.saveCart(cart);
  }

  async clearCart(userId, guestId) {
    const cart = await cartRepository.findCartByUserOrGuest(userId, guestId);
    if (cart) {
      return await cartRepository.clearCart(cart._id);
    }
    return null;
  }

  async getAllCarts() {
    return await cartRepository.getAllCarts();
  }
}

export default new CartService();
