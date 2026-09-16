import orderRepository from '../repositories/order.repository.js';
import addressRepository from '../repositories/address.repository.js';
import Product from '../models/Product.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ORDER_STATUS } from '../constants/index.js';
import mongoose from 'mongoose';

class OrderService {
  async createCheckoutOrder(userId, items, shippingAddressId) {
    if (!items || items.length === 0) {
      throw new ApiError(400, 'Order items cannot be empty');
    }

    const shippingAddress = await addressRepository.findById(shippingAddressId);
    if (!shippingAddress || shippingAddress.user.toString() !== userId.toString()) {
      throw new ApiError(404, 'Invalid shipping address');
    }

    let itemsTotal = 0;
    const orderItems = [];
    const bulkProductUpdates = [];

    // Calculate and snapshot products without starting transaction yet to fail early
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new ApiError(404, `Product not found: ${item.productId}`);
      if (product.status !== 'published') {
        throw new ApiError(400, `Product ${product.name} is currently unavailable`);
      }

      let variant = item.variantId ? product.variants.id(item.variantId) : null;
      if (!variant && product.variants && product.variants.length > 0) {
        variant = product.variants[0];
      }
      if (!variant) throw new ApiError(404, `Variant not found in product ${product.name}`);
      if (variant.status && ['out_of_stock', 'archived', 'deleted'].includes(variant.status)) {
        throw new ApiError(400, `Selected variant for ${product.name} is unavailable`);
      }

      if (variant.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name} (Size: ${variant.size}). Available: ${variant.stock}`);
      }

      const price = product.calculateDiscount(variant._id);
      const subtotal = price * item.quantity;
      itemsTotal += subtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        variantId: variant._id,
        sku: variant.sku || '',
        color: variant.color || '',
        size: variant.size || '',
        quantity: item.quantity,
        price,
        subtotal
      });

      // Prepare bulk update to decrement stock. Add a query condition to ensure stock hasn't dropped below requirement
      bulkProductUpdates.push({
        updateOne: {
          filter: { _id: product._id, 'variants._id': variant._id, 'variants.stock': { $gte: item.quantity } },
          update: { $inc: { 'variants.$.stock': -item.quantity } }
        }
      });
    }

    const orderNumber = await orderRepository.generateOrderNumber();
    const grandTotal = itemsTotal; // No shipping/tax for now

    const orderData = {
      orderNumber,
      customer: userId,
      products: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        houseNumber: shippingAddress.houseNumber,
        street: shippingAddress.street,
        area: shippingAddress.area,
        city: shippingAddress.city,
        state: shippingAddress.state,
        country: shippingAddress.country,
        pincode: shippingAddress.pincode,
        landmark: shippingAddress.landmark
      },
      billingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        houseNumber: shippingAddress.houseNumber,
        street: shippingAddress.street,
        area: shippingAddress.area,
        city: shippingAddress.city,
        state: shippingAddress.state,
        country: shippingAddress.country,
        pincode: shippingAddress.pincode
      },
      totals: {
        itemsTotal,
        grandTotal
      }
    };

    const bulkResult = await Product.bulkWrite(bulkProductUpdates);

    if (bulkResult.modifiedCount !== items.length) {
      throw new ApiError(409, 'Checkout failed due to stock availability. Please review your cart.');
    }

    const newOrder = await orderRepository.create(orderData);
    return newOrder;
  }

  async getUserOrders(userId) {
    return await orderRepository.findByUser(userId);
  }

  async getOrderById(id, userId = null) {
    const order = await orderRepository.findById(id, userId);
    if (!order) throw new ApiError(404, 'Order not found');
    return order;
  }

  async cancelOrder(id, userId) {
    const order = await orderRepository.findById(id, userId);
    if (!order) throw new ApiError(404, 'Order not found');

    if (order.orderStatus !== ORDER_STATUS.PENDING && order.orderStatus !== ORDER_STATUS.PROCESSING) {
      throw new ApiError(400, `Cannot cancel order in ${order.orderStatus} status`);
    }

    // Revert stock
    const bulkProductUpdates = order.products.map(item => ({
      updateOne: {
        filter: { _id: item.product, 'variants._id': item.variantId },
        update: { $inc: { 'variants.$.stock': item.quantity } }
      }
    }));
    await Product.bulkWrite(bulkProductUpdates);

    return await orderRepository.updateStatus(id, ORDER_STATUS.CANCELLED, {
      status: ORDER_STATUS.CANCELLED,
      note: 'Order cancelled by customer'
    });
  }

  // Admin Methods
  async getAllOrders(filter, sort, skip, limit) {
    return await orderRepository.findAll(filter, sort, skip, limit);
  }

  async updateOrderStatus(id, status, note = '') {
    const order = await orderRepository.findById(id);
    if (!order) throw new ApiError(404, 'Order not found');

    const validStatuses = [
      ORDER_STATUS.PENDING, ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED,
      ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED, 'packed', 'outForDelivery',
      'returned', 'refunded'
    ];

    if (!validStatuses.includes(status)) {
      throw new ApiError(400, 'Invalid status');
    }

    return await orderRepository.updateStatus(id, status, {
      status,
      note: note || `Order status updated to ${status}`
    });
  }
  async updateTracking(id, tracking) {
    const order = await orderRepository.findById(id);
    if (!order) throw new ApiError(404, 'Order not found');
    return await orderRepository.updateTracking(id, tracking);
  }
}

export default new OrderService();
