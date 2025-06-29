import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  institutionName?: string;
  password: string;
  role: mongoose.Types.ObjectId;
  isActive: boolean;
  subscriptions?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Add interface for static methods
interface UserModel extends mongoose.Model<IUser> {
  findUserWithSubscriptions(userId: string): Promise<IUser | null>;
  findUserWithActiveSubscriptions(userId: string): Promise<IUser | null>;
  findUsersBySubscriptionStatus(status: string): Promise<any[]>;
}

const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  institutionName: {
    type: String,
    trim: true,
    maxlength: [100, 'Institution name cannot exceed 100 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'UserRole',
    required: [true, 'User role is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscriptions: [{
    type: Schema.Types.ObjectId,
    ref: 'Subscription'
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods['comparePassword'] = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this['password']);
};

// Static methods for user-subscription queries
userSchema.statics['findUserWithSubscriptions'] = function(userId: string) {
  return this.findById(userId).populate({
    path: 'subscriptions',
    populate: {
      path: 'plan',
      select: 'name monthlyPrice annualPrice features'
    }
  });
};

userSchema.statics['findUserWithActiveSubscriptions'] = function(userId: string) {
  return this.findById(userId).populate({
    path: 'subscriptions',
    match: { status: { $in: ['active', 'trialing'] } },
    populate: {
      path: 'plan',
      select: 'name monthlyPrice annualPrice features'
    }
  });
};

userSchema.statics['findUsersBySubscriptionStatus'] = function(status: string) {
  return this.aggregate([
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'user',
        as: 'subscriptions'
      }
    },
    {
      $match: {
        'subscriptions.status': status
      }
    },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        email: 1,
        subscriptions: 1
      }
    }
  ]);
};

export default mongoose.model<IUser, UserModel>('User', userSchema); 