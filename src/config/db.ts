import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env['MONGO_URI'];

if (!MONGO_URI) {
  throw new Error('MONGO_URI environment variable is required');
}

mongoose.connect(MONGO_URI).then(() => {
  console.log("MongoDB connected ✅");
}).catch((error) => {
  console.error("MongoDB connection error:", error);
}); 