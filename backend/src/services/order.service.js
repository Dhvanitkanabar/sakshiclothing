import orderRepository from '../repositories/order.repository.js';
import addressRepository from '../repositories/address.repository.js';
import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';
import User from '../models/User.model.js';
import Payment from '../models/Payment.model.js';
import AuditLog from '../models/AuditLog.model.js';
import Notification from '../models/Notification.model.js';
import pushNotificationService from './pushNotification.service.js';
import { ApiError } from '../utils/ApiError.js';
import { ORDER_STATUS, PAYMENT_STATUS } from '../constants/index.js';
import { sendOrderConfirmationEmail, sendOrderRejectionEmail } from '../utils/emailService.js';
import BUSINESS_CONFIG from '../config/business.config.js';
import mongoose from 'mongoose';

class OrderService {
  /**
   * Authoritative server-side calculation of order items, stock, discounts and totals.
   * Client amounts are completely ignored.
   */
  async calculateOrderTotals(items, couponCode = null, paymentMethod = 'razorpay') {
    if (!items || !items.length) {
      throw new ApiError(400, 'Order items cannot be empty');
    }

    let itemsTotal = 0;
    const validatedItems = [];
    const bulkProductUpdates = [];

    for (const item of items) {
      const productId = item.productId || item.product?._id || item.product;
      const product = await Product.findById(productId);
      if (!product) throw new ApiError(404, `Product not found: ${productId}`);
      if (product.status !== 'published') {
        throw new ApiError(400, `Product "${product.name}" is currently unavailable`);
      }

      let variant = null;
      if (item.variantId) {
        if (typeof product.variants?.id === 'function') {
          try { variant = product.variants.id(item.variantId); } catch {}
        }
        if (!variant && Array.isArray(product.variants)) {
          variant = product.variants.find(v => v._id?.toString() === item.variantId?.toString());
        }
      }
      if (!variant && product.variants && product.variants.length > 0) {
        variant = product.variants[0];
      }
      if (!variant) throw new ApiError(404, `Variant not found in product "${product.name}"`);
      if (variant.status && ['out_of_stock', 'archived', 'deleted'].includes(variant.status)) {
        throw new ApiError(400, `Selected variant for "${product.name}" is unavailable`);
      }

      let effectiveStock = typeof variant.stock === 'number' ? variant.stock : 0;
      if (effectiveStock === 0 && (product.inventory?.totalStock || 0) > 0 && product.variants?.length === 1) {
        effectiveStock = product.inventory.totalStock;
        variant.stock = effectiveStock;
        await product.save().catch(() => {});
      }

      if (effectiveStock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for "${product.name}" (${variant.size || variant.color || 'Standard'}). Available: ${effectiveStock}`);
      }

      const price = product.calculateDiscount(variant._id);
      const subtotal = price * item.quantity;
      itemsTotal += subtotal;

      validatedItems.push({
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

    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const Coupon = (await import('../models/Coupon.model.js')).default;
      const coupon = await Coupon.findOne({
        code: couponCode.toString().trim().toUpperCase(),
        isActive: true
      });

      if (!coupon) {
        throw new ApiError(400, `Invalid coupon code: "${couponCode}"`);
      }

      if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
        throw new ApiError(400, `Coupon "${coupon.code}" has expired`);
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new ApiError(400, `Coupon "${coupon.code}" usage limit has been reached`);
      }

      if (coupon.minimumOrderAmount && itemsTotal < coupon.minimumOrderAmount) {
        throw new ApiError(400, `Coupon requires a minimum order value of ₹${coupon.minimumOrderAmount}`);
      }

      if (coupon.discountType === 'percentage') {
        discount = Math.round((itemsTotal * coupon.discountValue) / 100);
        if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
          discount = coupon.maximumDiscount;
        }
      } else if (coupon.discountType === 'flat') {
        discount = Math.min(coupon.discountValue, itemsTotal);
      }

      appliedCoupon = coupon;
    }

    // Explicit Rule: Free delivery when subtotal after discount and before shipping is >= freeShippingThreshold (₹300)
    const subtotalAfterDiscount = Math.max(0, itemsTotal - discount);
    const threshold = Number(BUSINESS_CONFIG.shipping?.freeShippingThreshold) || 300;
    const defaultFee = Number(BUSINESS_CONFIG.shipping?.defaultShippingCharge) || 49;
    const codHandlingFee = Number(BUSINESS_CONFIG.shipping?.codHandlingFee) || 0;

    const shippingCharges = subtotalAfterDiscount >= threshold ? 0 : defaultFee;
    const codCharges = paymentMethod === 'cod' ? codHandlingFee : 0;
    const grandTotal = Math.max(0, subtotalAfterDiscount + shippingCharges + codCharges);

    return {
      orderItems: validatedItems,
      bulkProductUpdates,
      totals: {
        itemsTotal,
        subtotalAfterDiscount,
        shippingCharges,
        codCharges,
        discount,
        grandTotal
      },
      coupon: appliedCoupon
    };
  }

  async createCheckoutOrder(userId, items, shippingAddressId, paymentInfo = {}, couponCode = null, metadata = {}) {
    if (!items || items.length === 0) {
      throw new ApiError(400, 'Order items cannot be empty');
    }

    const shippingAddress = await addressRepository.findById(shippingAddressId);
    if (!shippingAddress || shippingAddress.user.toString() !== userId.toString()) {
      throw new ApiError(404, 'Invalid shipping address');
    }

    // Authoritative calculation from Product collection with payment method
    const calculation = await this.calculateOrderTotals(items, couponCode, paymentInfo.method || 'cod');
    const { orderItems, bulkProductUpdates, totals, coupon } = calculation;
    const { itemsTotal, subtotalAfterDiscount, shippingCharges, codCharges, discount, grandTotal } = totals;

    // Strict validation if paid via online gateway
    if (paymentInfo.method === 'razorpay') {
      const expectedPaise = Math.round(grandTotal * 100);
      if (paymentInfo.amountInPaise && paymentInfo.amountInPaise !== expectedPaise) {
        throw new ApiError(400, `Payment verification failed: Server expected ₹${grandTotal} (${expectedPaise} paise), but gateway was charged ₹${paymentInfo.amountInPaise / 100} (${paymentInfo.amountInPaise} paise). Tampered payment rejected.`);
      }
    }

    const orderNumber = await orderRepository.generateOrderNumber();
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
        gatewayOrderId: paymentInfo.gatewayOrderId || null,
        gatewayResponse: paymentInfo.gatewayResponse || null
      },
      coupon: coupon ? coupon._id : null,
      noReturnPolicyAcknowledged: Boolean(metadata?.noReturnPolicyAcknowledged),
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
        subtotalAfterDiscount,
        shippingCharges,
        codCharges,
        discount,
        grandTotal
      }
    };

    const bulkResult = await Product.bulkWrite(bulkProductUpdates);

    if (bulkResult.modifiedCount !== items.length) {
      throw new ApiError(409, 'Checkout failed due to stock availability. Please review your cart.');
    }

    // Atomically increment coupon usedCount if coupon applied and paid
    if (coupon && isPaid) {
      const Coupon = (await import('../models/Coupon.model.js')).default;
      const consumed = await Coupon.consumeCoupon(coupon._id);
      if (!consumed) {
        throw new ApiError(400, 'Coupon usage limit was reached by another checkout. Please try again.');
      }
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

  async initiateCheckout(userId, items, shippingAddressId, couponCode = null, metadata = {}) {
    if (!items || !items.length) {
      throw new ApiError(400, 'Order items cannot be empty');
    }

    const shippingAddress = await addressRepository.findById(shippingAddressId);
    if (!shippingAddress || shippingAddress.user.toString() !== userId.toString()) {
      throw new ApiError(404, 'Invalid shipping address');
    }

    const calculation = await this.calculateOrderTotals(items, couponCode, 'razorpay');
    const { orderItems, totals, coupon } = calculation;
    const { itemsTotal, subtotalAfterDiscount, shippingCharges, codCharges, discount, grandTotal } = totals;

    const orderNumber = await orderRepository.generateOrderNumber();

    const orderData = {
      orderNumber,
      customer: userId,
      products: orderItems,
      orderStatus: 'payment_pending',
      approvalStatus: 'pending',
      paymentStatus: PAYMENT_STATUS.PENDING,
      payment: {
        method: 'razorpay',
        transactionId: null,
        gatewayOrderId: null
      },
      coupon: coupon ? coupon._id : null,
      noReturnPolicyAcknowledged: Boolean(metadata?.noReturnPolicyAcknowledged),
      authenticity: {
        isGenuine: true,
        riskScore: 'Unverified (Payment Pending)',
        paymentVerified: false,
        addressVerified: true,
        verificationNotes: ['Order created; awaiting Razorpay payment confirmation']
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
        subtotalAfterDiscount,
        shippingCharges,
        codCharges,
        discount,
        grandTotal
      }
    };

    const newOrder = await orderRepository.create(orderData);

    const razorpayAdapter = (await import('./adapters/razorpay.adapter.js')).default;
    const amountInPaise = Math.round(grandTotal * 100);
    const rzpOrder = await razorpayAdapter.createStandardOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: newOrder.orderNumber,
      notes: { orderId: newOrder._id.toString(), orderNumber: newOrder.orderNumber }
    });

    newOrder.payment.gatewayOrderId = rzpOrder.order_id;
    await newOrder.save();

    await Payment.create({
      order: newOrder._id,
      customer: userId,
      gateway: 'razorpay',
      gatewayOrderId: rzpOrder.order_id,
      amount: grandTotal,
      currency: 'INR',
      status: PAYMENT_STATUS.PENDING,
      method: 'razorpay'
    });

    return {
      order: newOrder,
      razorpayOrder: rzpOrder
    };
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

      // Dispatch Native Push Notification to Customer's Devices
      pushNotificationService.sendToUser(order.customer?._id || order.customer, {
        title: 'Order Approved & Packing Initiated',
        body: `Your order #${order.orderNumber} has been verified and approved!`,
        data: { orderId: order._id.toString(), orderNumber: order.orderNumber, status: nextStatus }
      }).catch(err => console.error('Push notification error:', err));
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

  // Public/Secure Order Tracking with Non-guessable Tokens & Phone/Email Verification
  async trackOrderPublic(orderIdInput, email, phone, currentUserId) {
    const raw = (orderIdInput || '').trim();
    if (!raw) {
      throw new ApiError(400, 'Order tracking reference or token is required');
    }
    const cleanId = raw.replace(/^#+/, '').trim().toUpperCase();

    const query = {
      $or: [
        { trackingToken: raw.toLowerCase() },
        { orderNumber: cleanId },
        { orderNumber: `#${cleanId}` },
        { orderNumber: raw.toUpperCase() },
        ...(mongoose.Types.ObjectId.isValid(cleanId) ? [{ _id: cleanId }] : []),
        ...(mongoose.Types.ObjectId.isValid(raw) ? [{ _id: raw }] : [])
      ]
    };

    const order = await Order.findOne(query)
      .populate('customer', 'fullName email phone')
      .populate('products.product', 'name thumbnail images');

    if (!order) {
      throw new ApiError(404, 'No order found with the provided tracking details');
    }

    const isTokenAccess = order.trackingToken && order.trackingToken.toLowerCase() === raw.toLowerCase();
    const isOwner = currentUserId && order.customer && order.customer._id.toString() === currentUserId.toString();
    const matchesEmail = email && (
      (order.customer?.email && order.customer.email.toLowerCase() === email.trim().toLowerCase())
    );
    const matchesPhone = phone && (
      (order.shippingAddress?.phone && order.shippingAddress.phone.replace(/\D/g, '').endsWith(phone.trim().replace(/\D/g, '').slice(-10))) ||
      (order.customer?.phone && order.customer.phone.replace(/\D/g, '').endsWith(phone.trim().replace(/\D/g, '').slice(-10)))
    );

    // Require authorization: either authenticated owner, possession of unguessable trackingToken, or verified phone/email
    if (!isOwner && !isTokenAccess && !matchesEmail && !matchesPhone) {
      throw new ApiError(403, 'Access denied: Verification required. Please provide the phone number or email address associated with this order.');
    }

    // Fetch related live notifications
    const notifications = await Notification.find({
      orderNumber: order.orderNumber
    }).sort({ createdAt: -1 }).limit(5);

    const orderObj = order.toObject();

    // SEC-05: Remove all raw GPS coordinates and internal telemetry
    if (orderObj.shippingAddress) {
      delete orderObj.shippingAddress.coordinates;
    }
    if (orderObj.billingAddress) {
      delete orderObj.billingAddress.coordinates;
    }
    if (orderObj.userLocation) {
      delete orderObj.userLocation.coordinates;
      delete orderObj.userLocation.ip;
    }

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

      // Dispatch Native Push Notification
      pushNotificationService.sendToUser(order.customer?._id || order.customer, {
        title: `Order Update: ${status.replace(/_/g, ' ').toUpperCase()}`,
        body: statusNote,
        data: { orderId: order._id.toString(), orderNumber: order.orderNumber, status }
      }).catch(err => console.error('Push notification error:', err));
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

  /**
   * CHANGE B: No-Return Policy Claim Submission
   * Customer reports damaged/defective/wrong item within 48 hours of delivery with unboxing video/photo proof
   */
  async submitOrderClaim(orderId, userId, { reason, description, photoUrls = [], unboxingVideoUrl = '' }) {
    const order = await Order.findById(orderId).populate('customer', 'fullName email phone');
    if (!order) throw new ApiError(404, 'Order not found');

    const customerIdStr = (order.customer?._id || order.customer)?.toString();
    if (customerIdStr !== userId.toString()) {
      throw new ApiError(403, 'Unauthorized to file a claim for this order');
    }

    if (order.claim?.hasClaim && order.claim?.status !== 'rejected') {
      throw new ApiError(400, 'A claim is already submitted or under review for this order.');
    }

    if (!reason) {
      throw new ApiError(400, 'Claim reason is required (e.g., damaged_in_transit, defective_piece, incorrect_item_sent).');
    }

    const cleanPhotos = Array.isArray(photoUrls) ? photoUrls.filter(Boolean) : (photoUrls ? [photoUrls] : []);
    if (!unboxingVideoUrl && cleanPhotos.length === 0) {
      throw new ApiError(400, 'Unboxing video URL or photo proof is required pursuant to the transit damage policy.');
    }

    order.claim = {
      hasClaim: true,
      reason,
      description: description || '',
      photoUrls: cleanPhotos,
      unboxingVideoUrl: unboxingVideoUrl || '',
      status: 'submitted',
      resolutionType: 'none',
      adminNotes: '',
      reportedAt: new Date()
    };

    order.timeline.push({
      status: 'claim_submitted',
      note: `Transit damage/defect claim submitted by customer. Reason: ${reason}`,
      date: new Date()
    });

    await order.save();
    return order;
  }

  /**
   * CHANGE B: Admin Claim Review & Resolution
   */
  async reviewOrderClaim(orderId, { status, resolutionType = 'none', adminNotes = '' }, adminUser) {
    const order = await Order.findById(orderId).populate('customer', 'fullName email phone');
    if (!order) throw new ApiError(404, 'Order not found');

    if (!order.claim || !order.claim.hasClaim) {
      throw new ApiError(400, 'No active claim exists for this order.');
    }

    const validStatuses = ['submitted', 'under_review', 'approved', 'rejected', 'resolved'];
    if (status && !validStatuses.includes(status)) {
      throw new ApiError(400, `Invalid claim status: ${status}`);
    }

    if (status) order.claim.status = status;
    if (resolutionType) order.claim.resolutionType = resolutionType;
    if (adminNotes) order.claim.adminNotes = adminNotes;

    if (status === 'resolved' || status === 'approved') {
      order.claim.resolvedAt = new Date();
      if (resolutionType === 'refund_to_source') {
        order.orderStatus = 'refunded';
        order.paymentStatus = 'refunded';
      }
    }

    order.timeline.push({
      status: `claim_${status || 'updated'}`,
      note: adminNotes || `Claim marked as ${status} (Resolution: ${resolutionType}) by ${adminUser?.fullName || 'Admin'}`,
      date: new Date()
    });

    await order.save();
    return order;
  }
}

export default new OrderService();
