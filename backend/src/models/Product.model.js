import mongoose, { Schema } from 'mongoose';
import { PRODUCT_STATUS } from '../constants/index.js';

const imageSchema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  alt: { type: String, trim: true },
  isPrimary: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 }
}, { _id: true });

const variantSchema = new Schema({
  color: { type: String, trim: true },
  size: { type: String, trim: true },
  sku: { type: String, trim: true },
  barcode: { type: String, trim: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  stock: { type: Number, required: true, default: 0, min: 0 },
  weight: { type: Number },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  image: imageSchema,
  status: {
    type: String,
    enum: [PRODUCT_STATUS.DRAFT, PRODUCT_STATUS.PUBLISHED, PRODUCT_STATUS.ARCHIVED, PRODUCT_STATUS.DELETED, PRODUCT_STATUS.OUT_OF_STOCK],
    default: PRODUCT_STATUS.DRAFT
  }
}, { _id: true });

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: 300
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'Brand'
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],
    images: [imageSchema],
    thumbnail: imageSchema,
    pricing: {
      basePrice: { type: Number, required: true },
      discountPrice: { type: Number },
      taxRate: { type: Number, default: 0 } // e.g., 18 for 18% GST
    },
    inventory: {
      totalStock: { type: Number, default: 0 },
      lowStockThreshold: { type: Number, default: 5 }
    },
    variants: [variantSchema],
    attributes: {
      type: Map,
      of: String // Flexible key-value pairs (e.g., Fabric: Cotton, Neck: Round)
    },
    specifications: [
      {
        key: String,
        value: String
      }
    ],
    shippingInfo: {
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number
      },
      shippingClass: String
    },
    returnPolicy: {
      isReturnable: { type: Boolean, default: true },
      returnWindowDays: { type: Number, default: 7 }
    },
    seo: {
      title: String,
      description: String,
      keywords: [String]
    },
    status: {
      type: String,
      enum: [PRODUCT_STATUS.DRAFT, PRODUCT_STATUS.PUBLISHED, PRODUCT_STATUS.ARCHIVED, PRODUCT_STATUS.DELETED, PRODUCT_STATUS.OUT_OF_STOCK],
      default: PRODUCT_STATUS.DRAFT
    },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes

productSchema.index({ 'variants.sku': 1 }, { sparse: true, unique: true });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ name: 'text', shortDescription: 'text', tags: 'text' });

// Virtuals
productSchema.virtual('averageRating').get(function() {
  // To be populated by Review aggregation in service layer
  return this._averageRating || 0;
});

productSchema.virtual('totalReviews').get(function() {
  return this._totalReviews || 0;
});

productSchema.virtual('discountPercentage').get(function() {
  if (this.pricing.discountPrice && this.pricing.basePrice) {
    return Math.round(((this.pricing.basePrice - this.pricing.discountPrice) / this.pricing.basePrice) * 100);
  }
  return 0;
});

// Pre-save hook to calculate total stock from variants
productSchema.pre('save', function(next) {
  if (this.variants && this.variants.length > 0) {
    this.inventory.totalStock = this.variants.reduce((total, v) => total + v.stock, 0);
  }
  next();
});

// Schema Methods
productSchema.methods.calculateDiscount = function(variantId = null) {
  if (variantId) {
    const variant = this.variants.id(variantId);
    if (variant && variant.discount) {
      return variant.price - variant.discount;
    }
  }
  if (this.pricing.discountPrice) {
    return this.pricing.discountPrice;
  }
  return this.pricing.basePrice;
};

const Product = mongoose.model('Product', productSchema);
export default Product;
