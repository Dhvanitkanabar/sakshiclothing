import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false // If null, can be a system or guest notification
    },
    recipientEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    recipientPhone: {
      type: String,
      trim: true
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    },
    orderNumber: {
      type: String
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['order_placed', 'order_accepted', 'order_status', 'shipping_update', 'system', 'inventory'],
      default: 'order_status'
    },
    estimatedDeliveryTime: {
      type: String
    },
    isRead: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ orderNumber: 1 });
notificationSchema.index({ isRead: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
