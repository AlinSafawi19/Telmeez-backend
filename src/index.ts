import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import './config/db';
import checkoutRoutes from './routes/checkout';
import newsletterRoutes from './routes/newsletter';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env['PORT'];

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', process.env['BASE_URL']].filter((url): url is string => Boolean(url)),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/checkout', checkoutRoutes);
app.use('/api/newsletter', newsletterRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});