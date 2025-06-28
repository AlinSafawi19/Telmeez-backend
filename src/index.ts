import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import './config/db';
import checkoutRoutes from './routes/checkout';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env['PORT'];

// Middleware
app.use(cors({
  origin: process.env['BASE_URL'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/checkout', checkoutRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});