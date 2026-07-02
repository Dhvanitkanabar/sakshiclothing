import mongoose, { Schema } from 'mongoose';

const storeSettingsSchema = new Schema(
  {
    storeName: {
      type: String,
      required: true,
      default: 'Sakshi Clothing'
    },
    logo: {
      url: String,
      publicId: String
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    gstNumber: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String
    },
    currency: {
      code: { type: String, default: 'INR' },
      symbol: { type: String, default: '₹' }
    },
    tax: {
      defaultRate: { type: Number, default: 18 }, // 18% GST default
      isInclusive: { type: Boolean, default: true }
    },
    shipping: {
      freeShippingThreshold: { type: Number, default: 2000 },
      defaultShippingCharge: { type: Number, default: 99 }
    },
    socialLinks: {
      instagram: String,
      facebook: String,
      twitter: String,
      youtube: String
    },
    policies: {
      termsOfService: String,
      privacyPolicy: String,
      returnPolicy: String,
      shippingPolicy: String
    },
    announcementBar: [{
      text: String,
      link: String,
      isActive: { type: Boolean, default: true }
    }]
  },
  {
    timestamps: true
  }
);

// There should only ever be one settings document. 
// We can handle this logic in the service layer (e.g., upserting a known ID or finding the first doc).

const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);
export default StoreSettings;
