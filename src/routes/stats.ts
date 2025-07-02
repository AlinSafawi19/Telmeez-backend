import express from 'express';
import { getUserStatistics, getSystemStatistics, getHistoricalStatistics } from '../controllers/statsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All stats routes require authentication
router.use(authenticateToken);

// Get user statistics (for the authenticated user)
router.get('/user', getUserStatistics);

// Get system statistics (admin only)
router.get('/system', getSystemStatistics);

// Get historical statistics (for the authenticated user)
router.get('/historical', getHistoricalStatistics);

export default router; 