import orderRepository from '../repositories/order.repository.js';
import addressRepository from '../repositories/address.repository.js';
import Product from '../models/Product.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ORDER_STATUS } from '../constants/index.js';

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

    // Snapshot products and validate inventory
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new ApiError(404, `Product not found: ${item.productId}`);
      
      const variant = product.variants.id(item.variantId);
      if (!variant) throw new ApiError(404, `Variant not found in product ${product.name}`);

      if (variant.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name} (Size: ${variant.size}). Available: ${variant.stock}`);
      }

      const price = product.pricing.basePrice;
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

      // Prepare bulk update to decrement stock
      bulkProductUpdates.push({
        updateOne: {
          filter: { _id: product._id, 'variants._id': variant._id },
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
        // Can be same as shipping for now
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

    // Execute product stock updates
    await Product.bulkWrite(bulkProductUpdates);

    // Create Order
    return await orderRepository.create(orderData);
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
