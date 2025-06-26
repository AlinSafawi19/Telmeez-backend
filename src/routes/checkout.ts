import { Router } from 'express';
import { processCheckout, validatePromoCode, getPlans, getPaymentMethods } from '../controllers/checkoutController';
import { validateCheckoutData, validatePromoCode as validatePromoCodeMiddleware } from '../middleware/validation';

const router = Router();

// POST /api/checkout - Process complete checkout
router.post('/', validateCheckoutData, processCheckout);

// POST /api/checkout/validate-promo - Validate promo code
router.post('/validate-promo', validatePromoCodeMiddleware, validatePromoCode);

// GET /api/checkout/plans - Get available plans
router.get('/plans', getPlans);

// GET /api/checkout/payment-methods - Get available payment methods
router.get('/payment-methods', getPaymentMethods);

export default router; 