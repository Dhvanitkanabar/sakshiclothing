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
couponSchema.index({ expiryDate: 1, isActive: 1 });

// Atomic coupon consumption preventing usage limit race conditions
couponSchema.statics.consumeCoupon = async function(couponId) {
  if (!couponId) return null;
  return this.findOneAndUpdate(
    {
      _id: couponId,
      isActive: true,
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ]
    },
    { $inc: { usedCount: 1 } },
    { new: true }
  );
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
