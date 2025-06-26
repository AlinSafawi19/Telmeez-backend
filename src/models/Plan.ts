import mongoose, { Document, Schema } from 'mongoose';

export interface IMaxUsers {
  admin: number | 'unlimited';
  teacher: number | 'unlimited';
  student: number | 'unlimited';
  parent: number | 'unlimited';
}

export interface IPlan extends Document {
  name: string;
  description: string;
  monthlyPrice: number;
  currency: string;
  discount_annual: number;
  maxStorage: string;
  maxUsers: IMaxUsers;
  recommended?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const maxUsersSchema = new Schema<IMaxUsers>({
  admin: {
    type: Schema.Types.Mixed, // Can be number or 'unlimited'
    required: [true, 'Admin user limit is required']
  },
  teacher: {
    type: Schema.Types.Mixed, // Can be number or 'unlimited'
    required: [true, 'Teacher user limit is required']
  },
  student: {
    type: Schema.Types.Mixed, // Can be number or 'unlimited'
    required: [true, 'Student user limit is required']
  },
  parent: {
    type: Schema.Types.Mixed, // Can be number or 'unlimited'
    required: [true, 'Parent user limit is required']
  }
});

const planSchema = new Schema<IPlan>({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Plan description is required'],
    trim: true
  },
  monthlyPrice: {
    type: Number,
    required: [true, 'Monthly price is required'],
    min: [0, 'Monthly price cannot be negative']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'USD',
    uppercase: true
  },
  discount_annual: {
    type: Number,
    required: [true, 'Annual discount percentage is required'],
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  maxStorage: {
    type: String,
    required: [true, 'Maximum storage is required']
  },
  maxUsers: {
    type: maxUsersSchema,
    required: [true, 'Maximum users configuration is required']
  },
  recommended: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
planSchema.index({ name: 1 });
planSchema.index({ monthlyPrice: 1 });

export default mongoose.model<IPlan>('Plan', planSchema); 