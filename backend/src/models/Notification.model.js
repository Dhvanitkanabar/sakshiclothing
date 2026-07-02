import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['order', 'promotion', 'system', 'account'],
      default: 'system'
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User' // If null, implies a global broadcast notification
    },
    isRead: {
      type: Boolean,
      default: false
    },
    link: {
      type: String // Optional URL to redirect to when clicked
    }
  },
  {
    timestamps: true
  }
);

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
