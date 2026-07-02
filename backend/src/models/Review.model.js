import mongoose, { Schema } from 'mongoose';

const reviewSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    images: [
      {
        url: String,
        publicId: String
      }
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: false
    },
    helpfulCount: {
      type: Number,
      default: 0
    },
    isApproved: {
      type: Boolean,
      default: true // Set to false if requiring manual admin approval for reviews
    }
  },
  {
    timestamps: true
  }
);

// Indexes
reviewSchema.index({ product: 1, isApproved: 1 });
reviewSchema.index({ customer: 1 });
// Ensure one review per user per product
reviewSchema.index({ product: 1, customer: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
