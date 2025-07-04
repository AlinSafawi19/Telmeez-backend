import { Request, Response } from 'express';
import User from '../models/User';
import BillingAddress from '../models/BillingAddress';
import PaymentDetail from '../models/PaymentDetail';
import Payment from '../models/Payment';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';
import UserRole from '../models/UserRole';
import PromoCode from '../models/PromoCode';
import PromoCodeUsage from '../models/PromoCodeUsage';
import VerificationCode from '../models/VerificationCode';
import { getTranslation, Language } from '../translations';
import { generateVerificationCode, sendVerificationEmail } from '../services/emailService';

interface CheckoutRequest {
  // User information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  institutionName?: string;
  password: string;

  // Billing address
  billingAddress: {
    address: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    customCountry?: string;
  };

  // Payment information
  paymentInfo: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  };

  // Subscription details
  planId: string;
  billingCycle: 'monthly' | 'annual';
  addOns: Array<{
    type: 'admin' | 'teacher' | 'student' | 'parent' | 'storage';
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  promoCode?: string;
  discount?: number;
  paymentMethod: 'card';
}

export const processCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    const checkoutData: CheckoutRequest = req.body;
    
    // Get language from request headers (default to 'en')
    const language = (req.headers['accept-language'] as Language) || 'en';
    const t = getTranslation(language);

    // Validate required fields
    if (!checkoutData.firstName || !checkoutData.lastName || !checkoutData.email || 
        !checkoutData.password || !checkoutData.phone || !checkoutData.planId) {
      res.status(400).json({
        success: false,
        message: t.checkout.server_errors.missing_required_fields
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: checkoutData.email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: t.checkout.server_errors.user_already_exists
      });
      return;
    }

    // Validate plan exists
    const plan = await Plan.findById(checkoutData.planId);
    if (!plan) {
      res.status(400).json({
        success: false,
        message: t.checkout.server_errors.invalid_plan
      });
      return;
    }

    // Apply promo code discount if provided (already validated by frontend)
    let promoCodeData = null;
    let finalAmount = checkoutData.totalAmount;
    
    if (checkoutData.promoCode && checkoutData.discount) {
      // Verify the promo code exists and is valid (double-check)
      const promoCode = await PromoCode.findOne({ 
        code: checkoutData.promoCode.toUpperCase(),
        active: true 
      });

      if (promoCode) {
        // Check if promo code is valid (date-wise)
        const now = new Date();
        if (promoCode.valid_from && now < promoCode.valid_from) {
          res.status(400).json({
            success: false,
            message: t.checkout.server_errors.promo_code_not_valid_yet
          });
          return;
        }

        if (promoCode.valid_until && now > promoCode.valid_until) {
          res.status(400).json({
            success: false,
            message: t.checkout.server_errors.promo_code_expired
          });
          return;
        }

        // Apply the discount that was calculated by the frontend
        finalAmount = checkoutData.totalAmount * (1 - checkoutData.discount / 100);
        promoCodeData = promoCode;
      }
    }

    // Get Super Admin role for new user
    const superAdminRole = await UserRole.findOne({ 
      role: { $regex: /^super\s*admin$/i } 
    });
    if (!superAdminRole) {
      res.status(500).json({
        success: false,
        message: t.checkout.server_errors.super_admin_role_not_found
      });
      return;
    }

    // Create user
    const user = new User({
      firstName: checkoutData.firstName,
      lastName: checkoutData.lastName,
      email: checkoutData.email.toLowerCase(),
      phone: checkoutData.phone,
      institutionName: checkoutData.institutionName,
      password: checkoutData.password,
      role: superAdminRole._id
    });

    await user.save();

    // Create billing address
    const billingAddress = new BillingAddress({
      user: user._id,
      address: checkoutData.billingAddress.address,
      address2: checkoutData.billingAddress.address2,
      city: checkoutData.billingAddress.city,
      state: checkoutData.billingAddress.state,
      zipCode: checkoutData.billingAddress.zipCode,
      country: checkoutData.billingAddress.country,
      customCountry: checkoutData.billingAddress.customCountry,
      isDefault: true
    });

    await billingAddress.save();

    // Create payment detail only for card payments
    let paymentDetail = null;
    if (checkoutData.paymentMethod === 'card') {
      // Extract card information for payment details
      const cardNumber = checkoutData.paymentInfo.cardNumber.replace(/\s/g, '');
      const lastFourDigits = cardNumber.slice(-4);
      const [expiryMonth, expiryYear] = checkoutData.paymentInfo.expiryDate.split('/');
      
      // Determine card type
      let cardType = 'visa';
      if (cardNumber.startsWith('5')) {
        cardType = 'mastercard';
      } else if (cardNumber.startsWith('3')) {
        cardType = 'amex';
      }

      paymentDetail = new PaymentDetail({
        user: user._id,
        cardType,
        lastFourDigits,
        expiryMonth,
        expiryYear,
        isDefault: true
      });

      await paymentDetail.save();
    }

    // Calculate subscription period
    const now = new Date();
    let currentPeriodStart = now;
    let currentPeriodEnd = new Date(now);
    let trialStart: Date | undefined;
    let trialEnd: Date | undefined;
    let subscriptionStatus = 'active'; // Default status

    if (checkoutData.billingCycle === 'annual') {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    // Add trial period for starter plan only
    if (plan.name === 'Starter') {
      subscriptionStatus = 'trialing';
      trialStart = now;
      trialEnd = new Date(now);
      if (checkoutData.billingCycle === 'annual') {
        trialEnd.setDate(trialEnd.getDate() + 30); // 30 days trial for annual
      } else {
        trialEnd.setDate(trialEnd.getDate() + 7); // 7 days trial for monthly
      }
    }

    // Create subscription
    const subscription = new Subscription({
      user: user._id,
      plan: plan._id,
      status: subscriptionStatus,
      billingCycle: checkoutData.billingCycle,
      currentPeriodStart,
      currentPeriodEnd,
      trialStart,
      trialEnd,
      addOns: checkoutData.addOns,
      totalAmount: finalAmount,
      currency: 'USD'
    });

    await subscription.save();

    // Update user's subscriptions array to maintain bidirectional relationship
    await User.findByIdAndUpdate(
      user._id,
      { $push: { subscriptions: subscription._id } }
    );

    // Determine payment status based on payment method
    let paymentStatus = 'pending';
    if (checkoutData.paymentMethod === 'card') {
      // For card payments, we'll need to integrate with a payment gateway
      // For now, we'll set it as pending until payment is processed
      paymentStatus = 'pending';
    }

    // Create payment record
    const payment = new Payment({
      user: user._id,
      subscription: subscription._id,
      amount: finalAmount,
      currency: 'USD',
      status: paymentStatus,
      paymentMethod: checkoutData.paymentMethod,
      description: `${plan.name} Plan - ${checkoutData.billingCycle} subscription`,
      metadata: {
        promoCode: checkoutData.promoCode,
        discount: checkoutData.discount,
        addOns: checkoutData.addOns,
        originalAmount: checkoutData.totalAmount,
        finalAmount: finalAmount,
        paymentGateway: 'generic' // Will be replaced with actual gateway
      }
    });

    await payment.save();

    // Record promo code usage if applicable
    if (promoCodeData) {
      const promoCodeUsage = new PromoCodeUsage({
        user: user._id,
        promoCode: promoCodeData._id,
        orderId: payment._id,
        discountAmount: checkoutData.totalAmount - finalAmount
      });

      await promoCodeUsage.save();

      // Update promo code usage count
      await PromoCode.findByIdAndUpdate(
        promoCodeData._id,
        { $inc: { usage_count: 1 } }
      );
    }

    // Return success response
    const responseData: any = {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        institutionName: user.institutionName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      subscription: {
        id: subscription._id,
        plan: plan.name,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        totalAmount: subscription.totalAmount,
        trialEnd: subscription.trialEnd
      },
      payment: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.paymentMethod
      },
      promoCode: promoCodeData ? {
        code: promoCodeData.code,
        discount: promoCodeData.discount,
        description: promoCodeData.description,
        savings: checkoutData.totalAmount - finalAmount
      } : null
    };

    res.status(201).json({
      success: true,
      message: t.checkout.success.checkout_completed,
      data: responseData
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    
    // Get language from request headers (default to 'en')
    const language = (req.headers['accept-language'] as Language) || 'en';
    const t = getTranslation(language);
    
    res.status(500).json({
      success: false,
      message: t.checkout.server_errors.checkout_error,
      error: error.message
    });
  }
};

export const validatePromoCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { promoCode, email } = req.body;
    
    // Get language from request headers (default to 'en')
    const language = (req.headers['accept-language'] as Language) || 'en';
    const t = getTranslation(language);

    if (!promoCode) {
      res.status(400).json({
        success: false,
        message: t.checkout.server_errors.promo_code_required
      });
      return;
    }

    // Find promo code in database
    const promoCodeData = await PromoCode.findOne({ 
      code: promoCode.toUpperCase(),
      active: true 
    });

    if (!promoCodeData) {
      res.status(400).json({
        success: false,
        message: t.checkout.server_errors.invalid_promo_code
      });
      return;
    }

    // Check if promo code is valid (date-wise)
    const now = new Date();
    if (promoCodeData.valid_from && now < promoCodeData.valid_from) {
      res.status(400).json({
        success: false,
        message: t.checkout.server_errors.promo_code_not_valid_yet
      });
      return;
    }

    if (promoCodeData.valid_until && now > promoCodeData.valid_until) {
      res.status(400).json({
        success: false,
        message: t.checkout.server_errors.promo_code_expired
      });
      return;
    }

    // Check if promo code applies to first-time users
    if (promoCodeData.applies_to === 'first_time') {
      if (!email) {
        res.status(400).json({
          success: false,
          message: t.checkout.server_errors.email_required_for_promo
        });
        return;
      }

      // Check if user with this email already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: t.checkout.server_errors.promo_code_first_time_only
        });
        return;
      }
    }

    res.json({
      success: true,
      data: {
        promoCode: promoCodeData.code,
        discount: promoCodeData.discount,
        description: promoCodeData.description,
        appliesTo: promoCodeData.applies_to,
        usageLimitPerUser: promoCodeData.usage_limit_per_user
      }
    });

  } catch (error: any) {
    console.error('Promo code validation error:', error);
    
    // Get language from request headers (default to 'en')
    const language = (req.headers['accept-language'] as Language) || 'en';
    const t = getTranslation(language);
    
    res.status(500).json({
      success: false,
      message: t.checkout.server_errors.validation_error,
      error: error.message
    });
  }
};

export const getPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = await Plan.find({}).sort({ monthlyPrice: 1 });
    
    res.json({
      success: true,
      data: plans
    });

  } catch (error: any) {
    console.error('Get plans error:', error);
    
    // Get language from request headers (default to 'en')
    const language = (req.headers['accept-language'] as Language) || 'en';
    const t = getTranslation(language);
    
    res.status(500).json({
      success: false,
      message: t.checkout.server_errors.general_error,
      error: error.message
    });
  }
};

// New endpoint to get payment methods available in Lebanon
export const getPaymentMethods = async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentMethods = [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Pay with Visa, Mastercard, or American Express',
        icon: '💳',
        available: true
      }
    ];

    res.json({
      success: true,
      data: paymentMethods
    });

  } catch (error: any) {
    console.error('Get payment methods error:', error);
    
    // Get language from request headers (default to 'en')
    const language = (req.headers['accept-language'] as Language) || 'en';
    const t = getTranslation(language);
    
    res.status(500).json({
      success: false,
      message: t.checkout.server_errors.general_error,
      error: error.message
    });
  }
};

export const sendVerificationCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    // Get language from request headers (default to 'en')
    const language = (req.headers['accept-language'] as Language) || 'en';
    const t = getTranslation(language);

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: t.checkout.server_errors.user_already_exists
      });
      return;
    }

    // Generate verification code
    const code = generateVerificationCode();
    
    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Invalidate any existing codes for this email
    await VerificationCode.updateMany(
      { email: email.toLowerCase() },
      { used: true }
    );

    // Save new verification code
    const verificationCode = new VerificationCode({
      email: email.toLowerCase(),
      code,
      expiresAt
    });

    await verificationCode.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(email, code, language);
    
    if (!emailSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Verification code sent successfully',
      data: {
        email: email.toLowerCase()
      }
    });

  } catch (error: any) {
    console.error('Send verification code error:', error);
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while sending verification code',
      error: error.message
    });
  }
};

export const verifyCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
      return;
    }

    // Find the verification code
    const verificationCode = await VerificationCode.findOne({
      email: email.toLowerCase(),
      code,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!verificationCode) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
      return;
    }

    // Mark the code as used
    verificationCode.used = true;
    await verificationCode.save();

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        email: email.toLowerCase(),
        verified: true
      }
    });

  } catch (error: any) {
    console.error('Verify code error:', error);
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while verifying code',
      error: error.message
    });
  }
}; 