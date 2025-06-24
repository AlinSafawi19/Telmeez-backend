import * as express from 'express';
import * as dotenv from 'dotenv';
import * as cors from "cors";
import './config/db';
import testimonialRoutes from './routes/testimonialRoutes';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/testimonials', testimonialRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});