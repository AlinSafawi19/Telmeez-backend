import mongoose, { Document, Schema } from 'mongoose';

export interface ITestimonial extends Document {
  name: string;
  position: string;
  institution: string;
  quote: string;
  email: string;
  initials: string;
  date: Date;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  institution: {
    type: String,
    required: [true, 'Institution is required'],
    trim: true,
    maxlength: [200, 'Institution cannot exceed 200 characters']
  },
  quote: {
    type: String,
    required: [true, 'Quote is required'],
    trim: true,
    maxlength: [1000, 'Quote cannot exceed 1000 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  initials: {
    type: String,
    required: false,
    maxlength: [10, 'Initials cannot exceed 10 characters']
  },
  date: {
    type: Date,
    default: Date.now
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Generate initials from name before saving
testimonialSchema.pre('save', function(next) {
  // Always generate initials if name exists and initials are missing
  if (this.name && (!this.initials || this.initials.trim() === '')) {
    const nameParts = this.name.trim().split(' ').filter(part => part.length > 0);
    if (nameParts.length >= 2) {
      this.initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    } else if (nameParts.length === 1) {
      this.initials = nameParts[0][0].toUpperCase();
    } else {
      this.initials = 'N/A';
    }
  }
  next();
});

export default mongoose.model<ITestimonial>('Testimonial', testimonialSchema); 