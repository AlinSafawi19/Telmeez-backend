import express from 'express';
import { signin, getProfile, refreshToken, signout } from '../controllers/authController';
import { sendVerificationCode, verifyCode } from '../controllers/checkoutController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/signin', signin);
router.post('/refresh', refreshToken);
router.post('/signout', signout);

// Verification routes (no CSRF needed)
router.post('/send-verification', sendVerificationCode);
router.post('/verify-code', verifyCode);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router; 