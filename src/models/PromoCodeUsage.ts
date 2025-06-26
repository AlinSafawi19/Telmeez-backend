import mongoose, { Document, Schema } from 'mongoose';

export interface IPromoCodeUsage extends Document {
  user: mongoose.Types.ObjectId;
  promoCode: mongoose.Types.ObjectId;
  usedAt: Date;
  orderId?: mongoose.Types.ObjectId;
  discountAmount: number;
  createdAt: Date;
}

const promoCodeUsageSchema = new Schema<IPromoCodeUsage>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  promoCode: {
    type: Schema.Types.ObjectId,
    ref: 'PromoCode',
    required: [true, 'Promo code reference is required']
  },
  usedAt: {
    type: Date,
    required: [true, 'Usage date is required'],
    default: Date.now
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment'
  },
  discountAmount: {
    type: Number,
    required: [true, 'Discount amount is required'],
    min: [0, 'Discount amount cannot be negative']
  }
}, {
  timestamps: true
});

// Index for efficient queries
promoCodeUsageSchema.index({ user: 1, promoCode: 1 });
promoCodeUsageSchema.index({ promoCode: 1, usedAt: -1 });

// Ensure unique usage per user per promo code (based on usage_limit_per_user)
promoCodeUsageSchema.index({ user: 1, promoCode: 1 }, { unique: false });

export default mongoose.model<IPromoCodeUsage>('PromoCodeUsage', promoCodeUsageSchema); 