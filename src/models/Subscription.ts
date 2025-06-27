import mongoose, { Document, Schema } from 'mongoose';

export interface IAddOn {
  type: 'admin' | 'teacher' | 'student' | 'parent' | 'storage';
  quantity: number;
  price: number;
}

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  plan: mongoose.Types.ObjectId;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
  billingCycle: 'monthly' | 'annual';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  addOns: IAddOn[];
  totalAmount: number;
  currency: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const addOnSchema = new Schema<IAddOn>({
  type: {
    type: String,
    required: [true, 'Add-on type is required'],
    enum: ['admin', 'teacher', 'student', 'parent', 'storage']
  },
  quantity: {
    type: Number,
    required: [true, 'Add-on quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  price: {
    type: Number,
    required: [true, 'Add-on price is required'],
    min: [0, 'Price cannot be negative']
  }
});

const subscriptionSchema = new Schema<ISubscription>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  plan: {
    type: Schema.Types.ObjectId,
    ref: 'Plan',
    required: [true, 'Plan reference is required']
  },
  status: {
    type: String,
    required: [true, 'Subscription status is required'],
    enum: ['active', 'inactive', 'cancelled', 'past_due', 'trialing'],
    default: 'active'
  },
  billingCycle: {
    type: String,
    required: [true, 'Billing cycle is required'],
    enum: ['monthly', 'annual'],
    default: 'monthly'
  },
  currentPeriodStart: {
    type: Date,
    required: [true, 'Current period start is required']
  },
  currentPeriodEnd: {
    type: Date,
    required: [true, 'Current period end is required']
  },
  trialStart: {
    type: Date
  },
  trialEnd: {
    type: Date
  },
  addOns: [addOnSchema],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'USD',
    uppercase: true
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });

// Virtual for checking if subscription is in trial
subscriptionSchema.virtual('isInTrial').get(function() {
  if (!this.trialEnd) return false;
  return new Date() < this.trialEnd;
});

// Virtual for checking if subscription is active
subscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' || this.status === 'trialing';
});

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema); 