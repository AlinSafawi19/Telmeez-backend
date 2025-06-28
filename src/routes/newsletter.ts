import express from 'express';
import { subscribeToNewsletter, unsubscribeFromNewsletter, getNewsletterStats } from '../controllers/newsletterController';

const router = express.Router();

// Subscribe to newsletter
router.post('/subscribe', subscribeToNewsletter);

// Unsubscribe from newsletter
router.post('/unsubscribe', unsubscribeFromNewsletter);

// Get newsletter statistics (admin only)
router.get('/stats', getNewsletterStats);

export default router; 