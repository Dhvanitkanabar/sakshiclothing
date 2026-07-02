import mongoose, { Schema } from 'mongoose';

const cartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantId: {
    type: Schema.Types.ObjectId, // Refers to the variant _id in Product.variants array
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true // Price at the time of adding to cart
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      // Optional for guest carts
    },
    guestId: {
      type: String,
      // For unauthenticated users
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexes
cartSchema.index({ user: 1 });

// Pre-save hook to calculate subtotal
cartSchema.pre('save', function(next) {
  this.items.forEach(item => {
    item.subtotal = item.price * item.quantity;
  });
  this.totalAmount = this.items.reduce((total, item) => total + item.subtotal, 0);
  next();
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
