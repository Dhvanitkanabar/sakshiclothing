import mongoose, { Schema } from 'mongoose';

const subscriberSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      default: 'Patron'
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    source: {
      type: String,
      default: 'Atelier Circle Footer'
    }
  },
  { timestamps: true }
);

export const Subscriber = mongoose.model('Subscriber', subscriberSchema);
export default Subscriber;
