import mongoose, { Document, Schema } from 'mongoose';

export interface IBillingAddress extends Document {
  user: mongoose.Types.ObjectId;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  customCountry?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const billingAddressSchema = new Schema<IBillingAddress>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  address2: {
    type: String,
    trim: true,
    maxlength: [200, 'Address line 2 cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [100, 'State cannot exceed 100 characters']
  },
  zipCode: {
    type: String,
    required: [true, 'ZIP code is required'],
    trim: true,
    maxlength: [20, 'ZIP code cannot exceed 20 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    default: 'lebanon'
  },
  customCountry: {
    type: String,
    trim: true,
    maxlength: [100, 'Custom country cannot exceed 100 characters']
  },
  isDefault: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one default address per user
billingAddressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await (this.constructor as any).updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

export default mongoose.model<IBillingAddress>('BillingAddress', billingAddressSchema); 