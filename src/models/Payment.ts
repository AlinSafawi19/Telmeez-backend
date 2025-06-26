import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  subscription: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'card';
  paymentGateway?: string;
  gatewayTransactionId?: string;
  description: string;
  metadata?: Record<string, any>;
  failureReason?: string;
  refundedAt?: Date;
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  subscription: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
    required: [true, 'Subscription reference is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'USD',
    uppercase: true
  },
  status: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['card'],
    default: 'card'
  },
  paymentGateway: {
    type: String,
    default: 'generic'
  },
  gatewayTransactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  description: {
    type: String,
    required: [true, 'Payment description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  failureReason: {
    type: String,
    maxlength: [500, 'Failure reason cannot exceed 500 characters']
  },
  refundedAt: {
    type: Date
  },
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative']
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ gatewayTransactionId: 1 });

export default mongoose.model<IPayment>('Payment', paymentSchema); 