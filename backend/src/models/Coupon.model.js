import mongoose, { Schema } from 'mongoose';

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    minimumOrderAmount: {
      type: Number,
      default: 0
    },
    maximumDiscount: {
      type: Number, // Applicable mostly for percentage discounts
      default: null
    },
    usageLimit: {
      type: Number,
      default: null // Null means unlimited
    },
    usedCount: {
      type: Number,
      default: 0
    },
    expiryDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ expiryDate: 1, isActive: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
