import mongoose, { Schema } from 'mongoose';

const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    logo: {
      url: String,
      publicId: String
    },
    description: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes
brandSchema.index({ slug: 1 });
brandSchema.index({ isActive: 1, isFeatured: -1 });

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
