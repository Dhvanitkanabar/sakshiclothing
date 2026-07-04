import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../constants/index.js';

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false // Do not return password by default
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please use a valid phone number']
    },
    role: {
      type: String,
      enum: [ROLES.USER, ROLES.ADMIN, 'superadmin'],
      default: ROLES.USER
    },
    avatar: {
      url: String,
      publicId: String
    },
    addresses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Address'
      }
    ],
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    cart: {
      type: Schema.Types.ObjectId,
      ref: 'Cart'
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    loyaltyPoints: {
      type: Number,
      default: 0
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date
    },
    refreshToken: {
      type: String,
      select: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
   
};

// Virtuals
userSchema.virtual('totalAddresses').get(function() {
  return this.addresses ? this.addresses.length : 0;
});

const User = mongoose.model('User', userSchema);
export default User;
