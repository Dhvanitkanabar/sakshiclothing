import mongoose, { Schema } from 'mongoose';

const newsletterSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    subscribedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

newsletterSchema.index({ email: 1 });

const Newsletter = mongoose.model('Newsletter', newsletterSchema);
export default Newsletter;
