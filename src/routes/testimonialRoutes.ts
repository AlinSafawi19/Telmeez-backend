import * as express from 'express';
import {
  submitTestimonial,
  getLatestTestimonials,
  getAllTestimonials,
  updateTestimonialStatus
} from '../controllers/testimonialController';

const router = express.Router();

// Public routes
router.post('/submit', submitTestimonial as unknown as express.RequestHandler);
router.get('/latest', getLatestTestimonials as unknown as express.RequestHandler);

// Admin routes (you can add authentication middleware later)
router.get('/all', getAllTestimonials);
router.patch('/:id/status', updateTestimonialStatus as unknown as express.RequestHandler);

export default router; 