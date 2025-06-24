import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/telmeez';

mongoose.connect(MONGO_URI).then(() => {
  console.log("MongoDB connected ✅");
}).catch((error) => {
  console.error("MongoDB connection error:", error);
}); 