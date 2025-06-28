import mongoose, { Document, Schema } from 'mongoose';

export interface IVerificationCode extends Document {
  email: string;
  code: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const verificationCodeSchema = new Schema<IVerificationCode>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    length: 6
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // Automatically delete expired documents
  },
  used: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for email and code for efficient lookups
verificationCodeSchema.index({ email: 1, code: 1 });

// Create index for email to find active codes
verificationCodeSchema.index({ email: 1, used: 1, expiresAt: 1 });

export default mongoose.model<IVerificationCode>('VerificationCode', verificationCodeSchema); 