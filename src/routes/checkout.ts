import { Router } from 'express';
import { processCheckout, validatePromoCode, getPlans, getPaymentMethods, sendVerificationCode, verifyCode } from '../controllers/checkoutController';
import { validateCheckoutData, validatePromoCode as validatePromoCodeMiddleware } from '../middleware/validation';

const router = Router();

// Skip CSRF for verification endpoints
router.use(['/send-verification', '/verify-code'], (req, _res, next) => {
  // Remove CSRF validation for verification endpoints
  req.csrfToken = () => 'skipped';
  next();
});

// POST /api/checkout - Process complete checkout
router.post('/', validateCheckoutData, processCheckout);

// POST /api/checkout/validate-promo - Validate promo code
router.post('/validate-promo', validatePromoCodeMiddleware, validatePromoCode);

// POST /api/checkout/send-verification - Send verification code
router.post('/send-verification', sendVerificationCode);

// POST /api/checkout/verify-code - Verify email code
router.post('/verify-code', verifyCode);

// GET /api/checkout/plans - Get available plans
router.get('/plans', getPlans);

// GET /api/checkout/payment-methods - Get available payment methods
router.get('/payment-methods', getPaymentMethods);

export default router; 