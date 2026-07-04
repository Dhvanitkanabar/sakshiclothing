import mongoose, { Schema } from 'mongoose';

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null // Null means it's a top-level category
    },
    description: {
      type: String,
      trim: true
    },
    image: {
      url: String,
      publicId: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    seo: {
      title: String,
      description: String,
      keywords: [String]
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes

categorySchema.index({ parentCategory: 1 });
categorySchema.index({ isActive: 1, displayOrder: 1 });

const Category = mongoose.model('Category', categorySchema);
export default Category;
