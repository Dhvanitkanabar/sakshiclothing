import mongoose, { Schema } from 'mongoose';
import { ORDER_STATUS, PAYMENT_STATUS } from '../constants/index.js';
import Counter from './Counter.model.js';

const orderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true }, // Snapshotted name
  variantId: { type: Schema.Types.ObjectId, required: true },
  sku: { type: String }, // Snapshotted SKU
  color: { type: String }, // Snapshotted Color
  size: { type: String }, // Snapshotted Size
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }, // Snapshotted Price
  subtotal: { type: Number, required: true } // Price * Quantity
}, { _id: true });

const timelineEventSchema = new Schema({
  status: { type: String, required: true },
  note: { type: String },
  date: { type: Date, default: Date.now }
}, { _id: false });

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    products: [orderItemSchema],
    shippingAddress: {
      fullName: String,
      phone: String,
      houseNumber: String,
      street: String,
      area: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
      landmark: String,
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    },
    billingAddress: {
      fullName: String,
      phone: String,
      houseNumber: String,
      street: String,
      area: String,
      city: String,
      state: String,
      country: String,
      pincode: String
    },
    userLocation: {
      ip: { type: String, default: '127.0.0.1' },
      city: { type: String },
      region: { type: String },
      country: { type: String, default: 'India' },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      },
      userAgent: { type: String }
    },
    authenticity: {
      isGenuine: { type: Boolean, default: true },
      riskScore: { type: String, default: 'Low Risk (Verified Genuine)' },
      paymentVerified: { type: Boolean, default: true },
      addressVerified: { type: Boolean, default: true },
      verificationNotes: [{ type: String }]
    },
    payment: {
      method: String, // e.g., 'Credit Card', 'UPI', 'COD'
      transactionId: String,
      gatewayResponse: Schema.Types.Mixed
    },
    coupon: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon'
    },
    orderStatus: {
      type: String,
      enum: [
        ORDER_STATUS.PENDING,
        ORDER_STATUS.PROCESSING,
        ORDER_STATUS.SHIPPED,
        ORDER_STATUS.DELIVERED,
        ORDER_STATUS.CANCELLED,
        'pending_approval',
        'confirmed',
        'packed',
        'dispatched',
        'in_transit',
        'out_for_delivery',
        'rejected',
        'returned',
        'refunded'
      ],
      default: 'pending_approval'
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    rejectionReason: {
      type: String,
      default: null
    },
    paymentStatus: {
      type: String,
      enum: [
        PAYMENT_STATUS.PENDING,
        PAYMENT_STATUS.COMPLETED,
        PAYMENT_STATUS.FAILED,
        'refunded'
      ],
      default: PAYMENT_STATUS.PENDING
    },
    tracking: {
      courierName: String,
      trackingNumber: String,
      trackingUrl: String,
      carrier: String,
      status: String,
      estimatedDeliveryTime: String,
      currentLocation: String,
      liveStatusNote: String,
      lastCheckpointAt: Date
    },
    invoice: {
      invoiceNumber: String,
      url: String
    },
    timeline: [timelineEventSchema],
    totals: {
      itemsTotal: { type: Number, required: true, default: 0 },
      taxes: { type: Number, default: 0 },
      shippingCharges: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true, default: 0 }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for fast lookup
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ approvalStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

// Virtuals
orderSchema.virtual('isPaid').get(function () {
  return this.paymentStatus === PAYMENT_STATUS.COMPLETED;
});

// Pre-save hook to add initial timeline event
orderSchema.pre('save', function (next) {
  if (this.isNew && (!this.timeline || this.timeline.length === 0)) {
    this.timeline.push({ status: this.orderStatus, note: 'Order placed successfully' });
  }
  next();
});

// Atomic sequential order number generator (ORDERSC1, ORDERSC2, ...)
orderSchema.statics.generateOrderNumber = async function () {
  const counter = await Counter.findByIdAndUpdate(
    'orders',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `ORDERSC${counter.seq}`;
};

const Order = mongoose.model('Order', orderSchema);
export default Order;
