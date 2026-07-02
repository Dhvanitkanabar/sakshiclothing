import mongoose, { Schema } from 'mongoose';

const bannerSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    subtitle: {
      type: String,
      trim: true
    },
    buttonText: {
      type: String,
      trim: true
    },
    buttonLink: {
      type: String,
      trim: true
    },
    image: {
      url: { type: String, required: true },
      publicId: String
    },
    mobileImage: {
      url: String,
      publicId: String
    },
    redirectUrl: {
      type: String,
      trim: true
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    homepageSection: {
      type: String,
      enum: ['hero', 'trending', 'featured', 'bottom', 'popup'],
      default: 'hero'
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
bannerSchema.index({ homepageSection: 1, isActive: 1, displayOrder: 1 });

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
