import orderRepository from '../repositories/order.repository.js';
import addressRepository from '../repositories/address.repository.js';
import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';
import User from '../models/User.model.js';
import AuditLog from '../models/AuditLog.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ORDER_STATUS } from '../constants/index.js';
import { sendOrderConfirmationEmail, sendOrderRejectionEmail } from '../utils/emailService.js';
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
      orderStatus: 'pending_approval',
      approvalStatus: 'pending',
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

    if (order.orderStatus !== 'pending_approval' && order.orderStatus !== ORDER_STATUS.PENDING) {
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

  // Admin Accept Order
  async acceptOrder(id, adminUser) {
    const order = await Order.findById(id).populate('customer', 'fullName email');
    if (!order) throw new ApiError(404, 'Order not found');

    if (order.orderStatus !== 'pending_approval' && order.approvalStatus !== 'pending') {
      throw new ApiError(400, `Order is already ${order.orderStatus}`);
    }

    order.orderStatus = 'confirmed';
    order.approvalStatus = 'approved';
    order.timeline.push({
      status: 'confirmed',
      note: `Order approved by admin ${adminUser.fullName || adminUser.email || ''}`
    });

    await order.save();

    // Audit Logging
    try {
      await AuditLog.create({
        user: adminUser._id,
        action: 'ORDER_ACCEPTED',
        details: { orderId: order._id, orderNumber: order.orderNumber }
      });
    } catch (e) {
      console.error('AuditLog error:', e);
    }

    // Async Email notification (failsafe)
    sendOrderConfirmationEmail(order, order.customer).catch(err => console.error('Confirmation email error:', err));

    return order;
  }

  // Admin Reject Order
  async rejectOrder(id, reason, adminUser) {
    const order = await Order.findById(id).populate('customer', 'fullName email');
    if (!order) throw new ApiError(404, 'Order not found');

    if (order.approvalStatus === 'rejected' || order.orderStatus === 'rejected') {
      throw new ApiError(400, 'Order is already rejected');
    }

    // Revert stock
    if (order.products && order.products.length > 0) {
      const bulkProductUpdates = order.products.map(item => ({
        updateOne: {
          filter: { _id: item.product, 'variants._id': item.variantId },
          update: { $inc: { 'variants.$.stock': item.quantity } }
        }
      }));
      await Product.bulkWrite(bulkProductUpdates);
    }

    order.orderStatus = 'rejected';
    order.approvalStatus = 'rejected';
    order.rejectionReason = reason;
    order.timeline.push({
      status: 'rejected',
      note: `Order rejected by admin: ${reason}`
    });

    await order.save();

    // Audit Logging
    try {
      await AuditLog.create({
        user: adminUser._id,
        action: 'ORDER_REJECTED',
        details: { orderId: order._id, orderNumber: order.orderNumber, reason }
      });
    } catch (e) {
      console.error('AuditLog error:', e);
    }

    // Async Email notification
    sendOrderRejectionEmail(order, order.customer, reason).catch(err => console.error('Rejection email error:', err));

    return order;
  }

  // Public/Secure Order Tracking
  async trackOrderPublic(orderIdInput, email, phone, currentUserId) {
    const cleanId = orderIdInput.trim().toUpperCase();
    const query = {
      $or: [
        { orderNumber: cleanId },
        ...(mongoose.Types.ObjectId.isValid(orderIdInput) ? [{ _id: orderIdInput }] : [])
      ]
    };

    const order = await Order.findOne(query)
      .populate('customer', 'fullName email phone')
      .populate('products.product', 'name thumbnail images');

    if (!order) {
      throw new ApiError(404, 'No order found with the provided Order ID');
    }

    // IDOR Protection: If logged in, verify ownership
    if (currentUserId && order.customer && order.customer._id.toString() === currentUserId.toString()) {
      return order;
    }

    // Secondary verification check for guest lookup
    const matchesEmail = email && order.customer?.email?.toLowerCase() === email.toLowerCase();
    const matchesPhone = phone && (order.shippingAddress?.phone === phone || order.customer?.phone === phone);

    if (!currentUserId && !matchesEmail && !matchesPhone) {
      // Return safe minimal order tracking structure without exposing sensitive PII
      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        approvalStatus: order.approvalStatus,
        rejectionReason: order.rejectionReason,
        tracking: order.tracking,
        timeline: order.timeline,
        createdAt: order.createdAt
      };
    }

    return order;
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
      ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED, 'pending_approval', 'confirmed',
      'packed', 'dispatched', 'in_transit', 'out_for_delivery', 'rejected',
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
