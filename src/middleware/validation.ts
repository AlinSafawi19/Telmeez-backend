import { Request, Response, NextFunction } from 'express';

export const validateCheckoutData = (req: Request, res: Response, next: NextFunction): void => {
  const { firstName, lastName, email, phone, password, planId, billingAddress, paymentInfo } = req.body;

  const errors: string[] = [];

  // Validate user information
  if (!firstName || firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }

  if (!lastName || lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!phone || phone.trim().length < 10) {
    errors.push('Valid phone number is required');
  }

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!planId) {
    errors.push('Plan selection is required');
  }

  // Validate billing address
  if (!billingAddress) {
    errors.push('Billing address is required');
  } else {
    if (!billingAddress.address || billingAddress.address.trim().length < 5) {
      errors.push('Valid billing address is required');
    }
    if (!billingAddress.city || billingAddress.city.trim().length < 2) {
      errors.push('City is required');
    }
    if (!billingAddress.state || billingAddress.state.trim().length < 2) {
      errors.push('State is required');
    }
    if (!billingAddress.zipCode || billingAddress.zipCode.trim().length < 3) {
      errors.push('Valid ZIP code is required');
    }
    if (!billingAddress.country) {
      errors.push('Country is required');
    }
  }

  // Validate payment information
  if (!paymentInfo) {
    errors.push('Payment information is required');
  } else {
    const cardNumber = paymentInfo.cardNumber?.replace(/\s/g, '');
    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
      errors.push('Valid card number is required');
    }

    if (!paymentInfo.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentInfo.expiryDate)) {
      errors.push('Valid expiry date (MM/YY) is required');
    }

    if (!paymentInfo.cvv || paymentInfo.cvv.length < 3 || paymentInfo.cvv.length > 4) {
      errors.push('Valid CVV is required');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
    return;
  }

  next();
};

export const validatePromoCode = (req: Request, res: Response, next: NextFunction): void => {
  const { promoCode } = req.body;

  if (!promoCode || promoCode.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'Promo code is required'
    });
    return;
  }

  if (promoCode.trim().length < 3) {
    res.status(400).json({
      success: false,
      message: 'Promo code must be at least 3 characters long'
    });
    return;
  }

  next();
}; 