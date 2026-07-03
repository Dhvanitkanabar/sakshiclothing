import mongoose, { Schema } from 'mongoose';
import { PAYMENT_STATUS } from '../constants/index.js';

const paymentSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    gateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'cod'],
      required: true
    },
    gatewayOrderId: {
      type: String, // Razorpay order_id or Stripe payment_intent_id
    },
    gatewayPaymentId: {
      type: String, // Razorpay payment_id or Stripe charge_id
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: [
        PAYMENT_STATUS.PENDING,
        PAYMENT_STATUS.COMPLETED,
        PAYMENT_STATUS.FAILED,
        'refunded',
        'cancelled'
      ],
      default: PAYMENT_STATUS.PENDING
    },
    method: {
      type: String // 'card', 'upi', 'netbanking', 'wallet', 'cod'
    },
    gatewayResponse: {
      type: Schema.Types.Mixed // Store full webhook/API payload for auditing
    },
    metadata: {
      type: Schema.Types.Mixed // Any custom metadata passed during creation
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.index({ order: 1 });
paymentSchema.index({ gatewayOrderId: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
