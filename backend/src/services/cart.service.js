import mongoose from 'mongoose';
import cartRepository from '../repositories/cart.repository.js';
import Product from '../models/Product.model.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import BUSINESS_CONFIG from '../config/business.config.js';

const findVariant = (variants, variantId) => {
  if (!variants || !Array.isArray(variants) || variants.length === 0) return null;
  if (!variantId) return variants[0];
  const targetIdStr = variantId.toString();
  if (typeof variants.id === 'function') {
    try {
      const found = variants.id(variantId);
      if (found) return found;
    } catch {}
  }
  return variants.find(v => v._id?.toString() === targetIdStr) || variants[0];
};

class CartService {
  async getCart(userId, guestId) {
    let cart = await cartRepository.findCartByUserOrGuest(userId, guestId);
    if (!cart) {
      cart = await cartRepository.createCart({ user: userId, guestId });
      return cart;
    }

    // Refresh live prices from Product collection
    let modified = false;
    for (const item of cart.items) {
      if (item.product && typeof item.product.calculateDiscount === 'function') {
        const livePrice = item.product.calculateDiscount(item.variantId);
        if (typeof livePrice === 'number' && livePrice >= 0 && item.price !== livePrice) {
          item.price = livePrice;
          item.subtotal = livePrice * item.quantity;
          modified = true;
        }
      }
    }
    if (modified) {
      cart = await cartRepository.saveCart(cart);
    }
    return cart;
  }

  async addToCart(userId, guestId, productId, variantId, quantity) {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');

    let variant = findVariant(product.variants, variantId);
    
    // Auto-create or resolve default variant if product has no variants or variantId is default/missing
    if (!variant && (!product.variants || product.variants.length === 0)) {
      if (!product.variants) product.variants = [];
      product.variants.push({
        size: 'Standard',
        price: product.pricing?.basePrice || 0,
        stock: product.inventory?.totalStock || 10,
        status: 'published'
      });
      await product.save();
      variant = product.variants[0];
      variantId = variant._id.toString();
    } else if (!variant && product.variants.length > 0) {
      variant = product.variants[0];
      variantId = variant._id.toString();
    }

    if (!variant) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid variant');

    // Effective available stock
    let effectiveStock = typeof variant.stock === 'number' ? variant.stock : 0;
    if (effectiveStock === 0 && (product.inventory?.totalStock || 0) > 0 && product.variants?.length === 1) {
      effectiveStock = product.inventory.totalStock;
      variant.stock = effectiveStock;
      await product.save().catch(() => {});
    }

    if (effectiveStock <= 0 || variant.status === 'out_of_stock') {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Selected piece (${variant.size || 'Standard'}) is currently out of stock`);
    }

    if (effectiveStock < quantity) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Insufficient stock for ${product.name} (Size: ${variant.size || 'Standard'}). Available: ${effectiveStock}`);
    }

    const effectivePrice = product.calculateDiscount(variant._id);

    let cart = await cartRepository.findCartByUserOrGuest(userId, guestId);
    if (!cart) {
      cart = await cartRepository.createCart({ user: userId, guestId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.product._id.toString() === productId && item.variantId?.toString() === variantId?.toString()
    );

    if (existingItemIndex > -1) {
      const newQty = cart.items[existingItemIndex].quantity + quantity;
      if (effectiveStock < newQty) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Insufficient stock for ${product.name} (Size: ${variant.size || 'Standard'}). Already in bag: ${cart.items[existingItemIndex].quantity}. Maximum available: ${effectiveStock}`);
      }
      cart.items[existingItemIndex].quantity = newQty;
      cart.items[existingItemIndex].price = effectivePrice;
      // Subtotal is recalculated in pre-save hook
    } else {
      cart.items.push({
        product: productId,
        variantId: variantId,
        quantity: quantity,
        price: effectivePrice,
        subtotal: effectivePrice * quantity
      });
    }

    return await cartRepository.saveCart(cart);
  }

  async updateItemQuantity(userId, guestId, productId, variantId, quantity) {
    if (quantity < 1) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Quantity must be at least 1');

    const cart = await cartRepository.findCartByUserOrGuest(userId, guestId);
    if (!cart) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Cart not found');

    const item = cart.items.find(i => i.product._id.toString() === productId && i.variantId?.toString() === variantId?.toString());
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Item not in cart');

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');
    const variant = findVariant(product.variants, variantId);
    if (!variant) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Variant not found');
    if (variant.stock < quantity) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Insufficient stock');

    const effectivePrice = product.calculateDiscount(variant._id);
    item.quantity = quantity;
    item.price = effectivePrice;
    item.subtotal = effectivePrice * quantity;
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

  /**
   * Authoritative server-side cart quote.
   * Single source of truth for cart totals, discounts, shipping and COD fees.
   * Recalculates all prices against the live database and reports price changes.
   */
  async getCartQuote(userId, guestId, { items: inputItems, couponCode, paymentMethod = 'razorpay' } = {}) {
    let cart = await cartRepository.findCartByUserOrGuest(userId, guestId);
    let itemsToQuote = [];
    const warnings = [];

    if (inputItems && Array.isArray(inputItems) && inputItems.length > 0) {
      itemsToQuote = inputItems;
    } else if (cart && cart.items && cart.items.length > 0) {
      itemsToQuote = cart.items.map(item => ({
        productId: item.product?._id ? item.product._id.toString() : item.product?.toString(),
        variantId: item.variantId ? item.variantId.toString() : null,
        quantity: item.quantity,
        originalCartPrice: item.price
      }));
    }

    const threshold = Number(BUSINESS_CONFIG.shipping?.freeShippingThreshold) || 300;

    if (!itemsToQuote || itemsToQuote.length === 0) {
      return {
        lineItems: [],
        totals: {
          itemsTotal: 0,
          subtotalAfterDiscount: 0,
          shippingCharges: 0,
          codCharges: 0,
          discount: 0,
          grandTotal: 0,
          freeShippingThreshold: threshold,
          amountNeededForFreeShipping: threshold,
          isFreeShipping: false
        },
        coupon: null,
        warnings: []
      };
    }

    // Call the authoritative order calculation engine (single source of truth)
    const orderService = (await import('./order.service.js')).default;
    const calculation = await orderService.calculateOrderTotals(itemsToQuote, couponCode, paymentMethod);

    let hasPriceUpdates = false;
    const lineItems = calculation.orderItems.map(oi => {
      const matchedInput = itemsToQuote.find(i => {
        const iPid = (i.productId || i.product?._id || i.product)?.toString();
        const iVid = (i.variantId || '')?.toString();
        return iVid ? (iPid === oi.product?.toString() && iVid === oi.variantId?.toString()) : (iPid === oi.product?.toString());
      });

      const originalPrice = (matchedInput && typeof matchedInput.originalCartPrice === 'number')
        ? matchedInput.originalCartPrice
        : oi.price;

      const priceChanged = originalPrice !== oi.price;
      if (priceChanged) {
        warnings.push(`Price for "${oi.name}" updated from ₹${originalPrice} to ₹${oi.price}.`);
      }

      return {
        productId: oi.product,
        variantId: oi.variantId,
        name: oi.name,
        size: oi.size,
        color: oi.color,
        sku: oi.sku,
        quantity: oi.quantity,
        price: oi.price,
        originalCartPrice: originalPrice,
        priceChanged,
        subtotal: oi.subtotal
      };
    });

    // Synchronize stored cart in database if exists
    if (cart && cart.items && cart.items.length > 0) {
      for (const item of cart.items) {
        const cPid = (item.product?._id || item.product)?.toString();
        const cVid = item.variantId?.toString();
        const quoted = lineItems.find(li => li.productId.toString() === cPid && (!cVid || li.variantId.toString() === cVid));
        if (quoted && item.price !== quoted.price) {
          item.price = quoted.price;
          item.subtotal = quoted.price * item.quantity;
          hasPriceUpdates = true;
        }
      }
      if (hasPriceUpdates) {
        await cartRepository.saveCart(cart);
      }
    }

    const isFreeShipping = calculation.totals.subtotalAfterDiscount >= threshold;
    const amountNeeded = Math.max(0, threshold - calculation.totals.subtotalAfterDiscount);

    return {
      lineItems,
      totals: {
        ...calculation.totals,
        freeShippingThreshold: threshold,
        amountNeededForFreeShipping: amountNeeded,
        isFreeShipping
      },
      coupon: calculation.coupon ? {
        code: calculation.coupon.code,
        discountType: calculation.coupon.discountType,
        discountValue: calculation.coupon.discountValue,
        discount: calculation.totals.discount
      } : null,
      warnings
    };
  }
}

export default new CartService();
