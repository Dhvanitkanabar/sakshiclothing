import mongoose, { Schema } from 'mongoose';

const loyaltyTransactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    points: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['earned', 'redeemed', 'expired', 'adjustment'],
      required: true
    },
    orderRef: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    },
    description: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

loyaltyTransactionSchema.index({ user: 1 });
loyaltyTransactionSchema.index({ type: 1 });

const LoyaltyTransaction = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);
export default LoyaltyTransaction;
