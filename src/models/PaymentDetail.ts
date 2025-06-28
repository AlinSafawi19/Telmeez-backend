import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentDetail extends Document {
  user: mongoose.Types.ObjectId;
  cardType: string;
  lastFourDigits: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const paymentDetailSchema = new Schema<IPaymentDetail>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  cardType: {
    type: String,
    required: [true, 'Card type is required'],
    enum: ['visa', 'mastercard', 'amex'],
    lowercase: true
  },
  lastFourDigits: {
    type: String,
    required: [true, 'Last four digits are required'],
    match: [/^\d{4}$/, 'Last four digits must be exactly 4 digits']
  },
  expiryMonth: {
    type: String,
    required: [true, 'Expiry month is required'],
    match: [/^(0[1-9]|1[0-2])$/, 'Expiry month must be between 01 and 12']
  },
  expiryYear: {
    type: String,
    required: [true, 'Expiry year is required'],
    match: [/^\d{2}$/, 'Expiry year must be 2 digits']
  },
  isDefault: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one default payment method per user
paymentDetailSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await (this.constructor as any).updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

export default mongoose.model<IPaymentDetail>('PaymentDetail', paymentDetailSchema); 