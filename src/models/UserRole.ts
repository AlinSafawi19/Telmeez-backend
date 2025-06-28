import mongoose, { Document, Schema } from 'mongoose';

export interface IUserRole extends Document {
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const userRoleSchema = new Schema<IUserRole>({
  role: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IUserRole>('UserRole', userRoleSchema)