import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletter extends Document {
  email: string;
  isSubscribed: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  language: string;
  ipAddress?: string;
  userAgent?: string;
}

const newsletterSchema = new Schema<INewsletter>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  isSubscribed: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  },
  language: {
    type: String,
    enum: ['en', 'ar', 'fr'],
    default: 'en'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
newsletterSchema.index({ email: 1 });
newsletterSchema.index({ isSubscribed: 1 });
newsletterSchema.index({ subscribedAt: -1 });

export default mongoose.model<INewsletter>('Newsletter', newsletterSchema); 