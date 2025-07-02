import express from 'express';
import { signin, getProfile, refreshToken, signout, forgotPassword, verifyPasswordResetCode, resetPassword } from '../controllers/authController';
import { sendVerificationCode, verifyCode } from '../controllers/checkoutController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/signin', signin);
router.post('/refresh', refreshToken);
router.post('/signout', signout);

// Debug route to check auth status
router.get('/status', (req, res) => {
  const hasAccessToken = req.cookies['accessToken'];
  const hasRefreshToken = req.cookies['refreshToken'];
  
  res.json({
    hasAccessToken: !!hasAccessToken,
    hasRefreshToken: !!hasRefreshToken,
    cookies: req.cookies
  });
});

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyPasswordResetCode);
router.post('/reset-password', resetPassword);

// Verification routes (no CSRF needed)
router.post('/send-verification', sendVerificationCode);
router.post('/verify-code', verifyCode);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router; 