import mongoose, { Document, Schema } from 'mongoose';

export interface IPromoCode extends Document {
  code: string;
  description: string;
  discount: number;
  applies_to: 'first_time' | 'all' | 'specific_plans';
  active: boolean;
  usage_limit_per_user: number;
  usage_count?: number;
  valid_from?: Date;
  valid_until?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const promoCodeSchema = new Schema<IPromoCode>({
  code: {
    type: String,
    required: [true, 'Promo code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  discount: {
    type: Number,
    required: [true, 'Discount percentage is required'],
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  applies_to: {
    type: String,
    required: [true, 'Applies to field is required'],
    enum: ['first_time', 'all', 'specific_plans'],
    default: 'all'
  },
  active: {
    type: Boolean,
    required: [true, 'Active status is required'],
    default: true
  },
  usage_limit_per_user: {
    type: Number,
    required: [true, 'Usage limit per user is required'],
    min: [1, 'Usage limit must be at least 1'],
    default: 1
  },
  usage_count: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  valid_from: {
    type: Date
  },
  valid_until: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
promoCodeSchema.index({ code: 1 });
promoCodeSchema.index({ active: 1 });
promoCodeSchema.index({ valid_from: 1, valid_until: 1 });

// Virtual for checking if promo code is currently valid
promoCodeSchema.virtual('isValid').get(function() {
  if (!this.active) return false;
  
  const now = new Date();
  
  if (this.valid_from && now < this.valid_from) return false;
  if (this.valid_until && now > this.valid_until) return false;
  
  return true;
});

export default mongoose.model<IPromoCode>('PromoCode', promoCodeSchema); 