import orderRepository from '../repositories/order.repository.js';
import addressRepository from '../repositories/address.repository.js';
import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';
import User from '../models/User.model.js';
import Payment from '../models/Payment.model.js';
import AuditLog from '../models/AuditLog.model.js';
import Notification from '../models/Notification.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ORDER_STATUS, PAYMENT_STATUS } from '../constants/index.js';
import { sendOrderConfirmationEmail, sendOrderRejectionEmail } from '../utils/emailService.js';
import mongoose from 'mongoose';

class OrderService {
  async createCheckoutOrder(userId, items, shippingAddressId, paymentInfo = {}) {
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

      // Check stock with fallback for single variant/standard size stock desync
      let effectiveStock = typeof variant.stock === 'number' ? variant.stock : 0;
      if (effectiveStock === 0 && (product.inventory?.totalStock || 0) > 0 && product.variants?.length === 1) {
        effectiveStock = product.inventory.totalStock;
        variant.stock = effectiveStock;
        await product.save().catch(() => {});
      }

      if (effectiveStock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name} (Size: ${variant.size}). Available: ${effectiveStock}`);
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

      // Prepare bulk update to decrement both variant stock and total inventory stock
      bulkProductUpdates.push({
        updateOne: {
          filter: { _id: product._id, 'variants._id': variant._id, 'variants.stock': { $gte: item.quantity } },
          update: {
            $inc: {
              'variants.$.stock': -item.quantity,
              'inventory.totalStock': -item.quantity
            }
          }
        }
      });
    }

    const orderNumber = await orderRepository.generateOrderNumber();
    const grandTotal = itemsTotal; // No shipping/tax for now

    const isPaid = paymentInfo.paymentStatus === 'completed';
    const isCod = paymentInfo.method === 'cod';

    const orderData = {
      orderNumber,
      customer: userId,
      products: orderItems,
      orderStatus: (isPaid || isCod) ? 'pending_approval' : 'payment_pending',
      approvalStatus: 'pending',
      paymentStatus: isPaid ? PAYMENT_STATUS.COMPLETED : PAYMENT_STATUS.PENDING,
      payment: {
        method: paymentInfo.method || (isCod ? 'cod' : 'pending'),
        transactionId: paymentInfo.transactionId || null,
        gatewayResponse: paymentInfo.gatewayResponse || null
      },
      authenticity: {
        isGenuine: true,
        riskScore: isPaid ? 'Low Risk (Payment Verified)' : (isCod ? 'Low Risk (Cash On Delivery)' : 'Unverified (Payment Pending)'),
        paymentVerified: isPaid,
        addressVerified: true,
        verificationNotes: [
          isPaid
            ? `Online payment of ₹${grandTotal} successfully verified via ${paymentInfo.method} (Txn: ${paymentInfo.transactionId})`
            : (isCod ? `Cash on delivery selected (₹${grandTotal} to be collected on delivery)` : 'Awaiting online payment verification')
        ]
      },
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
        landmark: shippingAddress.landmark,
        coordinates: shippingAddress.coordinates
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

    if (newOrder) {
      try {
        await Payment.create({
          order: newOrder._id,
          customer: userId,
          gateway: paymentInfo.method || (isCod ? 'cod' : 'razorpay'),
          gatewayOrderId: paymentInfo.gatewayOrderId || null,
          gatewayPaymentId: paymentInfo.transactionId || null,
          amount: grandTotal,
          currency: 'INR',
          status: isPaid ? PAYMENT_STATUS.COMPLETED : PAYMENT_STATUS.PENDING,
          method: paymentInfo.method || (isCod ? 'cod' : 'razorpay'),
          gatewayResponse: paymentInfo.gatewayResponse || null
        });
      } catch (paymentErr) {
        console.error('Payment audit record notice:', paymentErr.message);
      }
    }

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

  // Admin Accept Order with Estimated Delivery Time & Verification
  async acceptOrder(id, approvalData = {}, adminUser = {}) {
    const { estimatedDeliveryTime, note, status, courierName, trackingNumber } = approvalData;
    const order = await Order.findById(id).populate('customer', 'fullName email phone');
    if (!order) throw new ApiError(404, 'Order not found');

    if (order.orderStatus !== 'pending_approval' && order.approvalStatus !== 'pending') {
      if (order.approvalStatus === 'approved') {
        // Allow updating estimated delivery time if already approved
        if (estimatedDeliveryTime) {
          order.tracking = order.tracking || {};
          order.tracking.estimatedDeliveryTime = estimatedDeliveryTime;
          if (courierName) order.tracking.courierName = courierName;
          if (trackingNumber) order.tracking.trackingNumber = trackingNumber;
          if (note) order.tracking.liveStatusNote = note;
          order.timeline.push({
            status: order.orderStatus,
            note: `Estimated delivery updated to: ${estimatedDeliveryTime}. ${note || ''}`,
            date: new Date()
          });
          await order.save();
          return order;
        }
      }
      throw new ApiError(400, `Order is already ${order.orderStatus}`);
    }

    const nextStatus = status || 'confirmed';
    order.orderStatus = nextStatus;
    order.approvalStatus = 'approved';

    const deliveryEstimate = estimatedDeliveryTime || '2 to 3 Business Days';
    order.tracking = order.tracking || {};
    order.tracking.status = nextStatus;
    order.tracking.estimatedDeliveryTime = deliveryEstimate;
    if (courierName) order.tracking.courierName = courierName;
    if (trackingNumber) order.tracking.trackingNumber = trackingNumber;
    order.tracking.currentLocation = order.tracking.currentLocation || 'Sakshi Maison Atelier — Packaging Desk';
    order.tracking.liveStatusNote = note || `Order verified genuine by admin. Packing started. Estimated arrival: ${deliveryEstimate}`;
    order.tracking.lastCheckpointAt = new Date();

    const timelineNote = note 
      ? `Order verified genuine & approved by admin. Packing initiated. Estimated delivery: ${deliveryEstimate}. Note: ${note}`
      : `Order verified genuine & approved by admin. Packing initiated. Estimated delivery: ${deliveryEstimate}`;

    order.timeline.push({
      status: nextStatus,
      note: timelineNote,
      date: new Date()
    });

    await order.save();

    // Create Live Notification for Customer
    try {
      await Notification.create({
        recipient: order.customer?._id,
        recipientEmail: order.customer?.email,
        recipientPhone: order.customer?.phone || order.shippingAddress?.phone,
        order: order._id,
        orderNumber: order.orderNumber,
        title: 'Order Approved & Packing Initiated',
        message: `Your order #${order.orderNumber} has been verified and approved! Estimated delivery time: ${deliveryEstimate}. Our atelier has started packaging your order.`,
        type: 'order_accepted',
        estimatedDeliveryTime: deliveryEstimate,
        metadata: {
          orderStatus: nextStatus,
          courierName: order.tracking.courierName,
          currentLocation: order.tracking.currentLocation
        }
      });
    } catch (notifErr) {
      console.error('Failed to create customer notification:', notifErr);
    }

    // Audit Logging
    try {
      await AuditLog.create({
        user: adminUser._id,
        action: 'ORDER_ACCEPTED',
        details: { 
          orderId: order._id, 
          orderNumber: order.orderNumber, 
          estimatedDeliveryTime: deliveryEstimate,
          status: nextStatus 
        }
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
      note: `Order rejected by admin: ${reason}`,
      date: new Date()
    });

    await order.save();

    // Create rejection notification
    try {
      await Notification.create({
        recipient: order.customer?._id,
        recipientEmail: order.customer?.email,
        order: order._id,
        orderNumber: order.orderNumber,
        title: 'Order Status Update',
        message: `Your order #${order.orderNumber} could not be approved. Reason: ${reason}`,
        type: 'order_status'
      });
    } catch (e) {
      console.error('Rejection notification error:', e);
    }

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

  // Public/Secure Order Tracking with Live Notifications & Checkpoints
  async trackOrderPublic(orderIdInput, email, phone, currentUserId) {
    const raw = (orderIdInput || '').trim();
    const cleanId = raw.replace(/^#+/, '').trim().toUpperCase();

    const query = {
      $or: [
        { orderNumber: cleanId },
        { orderNumber: `#${cleanId}` },
        { orderNumber: raw.toUpperCase() },
        { orderNumber: { $regex: new RegExp(`^#?${cleanId.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } },
        ...(mongoose.Types.ObjectId.isValid(cleanId) ? [{ _id: cleanId }] : []),
        ...(mongoose.Types.ObjectId.isValid(raw) ? [{ _id: raw }] : [])
      ]
    };

    const order = await Order.findOne(query)
      .populate('customer', 'fullName email phone')
      .populate('products.product', 'name thumbnail images');

    if (!order) {
      throw new ApiError(404, 'No order found with the provided Order ID');
    }

    // Fetch related live notifications
    const notifications = await Notification.find({
      orderNumber: order.orderNumber
    }).sort({ createdAt: -1 }).limit(5);

    // IDOR Protection: If logged in, verify ownership
    if (currentUserId && order.customer && order.customer._id.toString() === currentUserId.toString()) {
      const orderObj = order.toObject();
      orderObj.notifications = notifications;
      return orderObj;
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
        products: (order.products || []).map(p => ({
          name: p.name,
          quantity: p.quantity,
          price: p.price,
          size: p.size,
          product: p.product ? {
            name: p.product.name,
            thumbnail: p.product.thumbnail,
            images: p.product.images
          } : undefined
        })),
        totals: {
          grandTotal: order.totals?.grandTotal || 0
        },
        shippingAddress: {
          city: order.shippingAddress?.city,
          state: order.shippingAddress?.state,
          pincode: order.shippingAddress?.pincode,
          country: order.shippingAddress?.country || 'India',
          coordinates: order.shippingAddress?.coordinates
        },
        notifications,
        createdAt: order.createdAt
      };
    }

    const orderObj = order.toObject();
    orderObj.notifications = notifications;
    return orderObj;
  }

  // Admin Methods
  async getAllOrders(filter, sort, skip, limit) {
    return await orderRepository.findAll(filter, sort, skip, limit);
  }

  async updateOrderStatus(id, status, note = '', currentLocation = '') {
    const order = await Order.findById(id).populate('customer', 'fullName email phone');
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

    order.orderStatus = status;
    if (status === 'rejected') {
      order.approvalStatus = 'rejected';
      order.rejectionReason = note || 'Rejected by admin';
    } else if (status === 'confirmed') {
      order.approvalStatus = 'approved';
    } else if (status === 'cancelled') {
      order.approvalStatus = 'rejected';
      order.rejectionReason = note || 'Cancelled by admin';
    }

    order.tracking = order.tracking || {};
    order.tracking.status = status;
    if (currentLocation) order.tracking.currentLocation = currentLocation;
    if (note) order.tracking.liveStatusNote = note;
    order.tracking.lastCheckpointAt = new Date();

    const statusNote = note || `Order status updated to ${status}${currentLocation ? ` at ${currentLocation}` : ''}`;
    order.timeline.push({
      status,
      note: statusNote,
      date: new Date()
    });

    await order.save();

    // Create Notification for Customer
    try {
      await Notification.create({
        recipient: order.customer?._id,
        recipientEmail: order.customer?.email,
        recipientPhone: order.customer?.phone || order.shippingAddress?.phone,
        order: order._id,
        orderNumber: order.orderNumber,
        title: `Order Update: ${status.replace(/_/g, ' ').toUpperCase()}`,
        message: statusNote,
        type: 'order_status',
        estimatedDeliveryTime: order.tracking?.estimatedDeliveryTime,
        metadata: {
          orderStatus: status,
          currentLocation: order.tracking?.currentLocation
        }
      });
    } catch (e) {
      console.error('Notification creation failed:', e);
    }

    return order;
  }

  async updateTracking(id, trackingData = {}) {
    const order = await Order.findById(id).populate('customer', 'fullName email phone');
    if (!order) throw new ApiError(404, 'Order not found');

    order.tracking = {
      ...(order.tracking ? (order.tracking.toObject ? order.tracking.toObject() : order.tracking) : {}),
      ...trackingData,
      lastCheckpointAt: new Date()
    };

    if (trackingData.coordinates) {
      order.shippingAddress = order.shippingAddress || {};
      order.shippingAddress.coordinates = {
        lat: Number(trackingData.coordinates.lat),
        lng: Number(trackingData.coordinates.lng)
      };
      delete order.tracking.coordinates;
    }

    if (trackingData.status && trackingData.status !== order.orderStatus) {
      order.orderStatus = trackingData.status;
    }

    const note = trackingData.liveStatusNote || `Tracking update: Courier ${order.tracking?.courierName || 'Express'}, Location: ${order.tracking?.currentLocation || 'In Transit'}`;
    order.timeline.push({
      status: order.orderStatus,
      note,
      date: new Date()
    });

    await order.save();

    // Notify customer about tracking update
    try {
      await Notification.create({
        recipient: order.customer?._id,
        recipientEmail: order.customer?.email,
        recipientPhone: order.customer?.phone || order.shippingAddress?.phone,
        order: order._id,
        orderNumber: order.orderNumber,
        title: 'Order Tracking & Location Update',
        message: note,
        type: 'shipping_update',
        estimatedDeliveryTime: order.tracking?.estimatedDeliveryTime,
        metadata: order.tracking
      });
    } catch (e) {
      console.error('Tracking notification failed:', e);
    }

    return order;
  }

  async updateCoordinates(id, { lat, lng }) {
    const order = await Order.findById(id).populate('customer', 'fullName email phone');
    if (!order) throw new ApiError(404, 'Order not found');

    order.shippingAddress = order.shippingAddress || {};
    order.shippingAddress.coordinates = {
      lat: Number(lat),
      lng: Number(lng)
    };

    await order.save();
    return order;
  }
}

export default new OrderService();
