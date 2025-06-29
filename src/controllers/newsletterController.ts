import { Request, Response } from 'express';
import Newsletter from '../models/Newsletter';
import { sendNewsletterWelcomeEmail } from '../services/emailService';

// Subscribe to newsletter
export const subscribeToNewsletter = async (req: Request, res: Response) => {
  try {
    const { email, language = 'en' } = req.body;

    // Validate email
    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return;
    }

    // Email validation regex
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
      return;
    }

    // Check if email already exists
    const existingSubscription = await Newsletter.findOne({ email: email.toLowerCase() });

    if (existingSubscription) {
      if (existingSubscription.isSubscribed) {
        res.status(400).json({
          success: false,
          message: 'You\'re already part of our newsletter family! 🎉'
        });
        return;
      } else {
        // Resubscribe
        existingSubscription.isSubscribed = true;
        existingSubscription.unsubscribedAt = undefined as any;
        existingSubscription.language = language;
        if (req.ip) existingSubscription.ipAddress = req.ip;
        if (req.get('User-Agent')) existingSubscription.userAgent = req.get('User-Agent')!;
        await existingSubscription.save();

        // Send welcome back email
        await sendNewsletterWelcomeEmail(email, language, true);

        res.status(200).json({
          success: true,
          message: 'Welcome back! We\'re thrilled to have you rejoin our newsletter family! 🎉'
        });
        return;
      }
    }

    // Create new subscription
    const newsletterSubscription = new Newsletter({
      email: email.toLowerCase(),
      language,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await newsletterSubscription.save();

    // Send welcome email
    await sendNewsletterWelcomeEmail(email, language, false);

    res.status(201).json({
      success: true,
      message: 'Thank you for joining our newsletter! Welcome to the Telmeez family! 🎉'
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while subscribing to the newsletter'
    });
  }
};

// Unsubscribe from newsletter
export const unsubscribeFromNewsletter = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return;
    }

    // Email validation regex
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
      return;
    }

    // Find and update subscription
    const subscription = await Newsletter.findOne({ email: email.toLowerCase() });

    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Email not found in our newsletter subscriptions'
      });
      return;
    }

    if (!subscription.isSubscribed) {
      res.status(400).json({
        success: false,
        message: 'This email is already unsubscribed from our newsletter'
      });
      return;
    }

    subscription.isSubscribed = false;
    subscription.unsubscribedAt = new Date();
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'We\'ll miss you! You\'ve been unsubscribed successfully. 👋'
    });

  } catch (error) {
    console.error('Newsletter unsubscription error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while unsubscribing from the newsletter'
    });
  }
};

// Get newsletter statistics (admin only)
export const getNewsletterStats = async (_req: Request, res: Response) => {
  try {
    const totalSubscribers = await Newsletter.countDocuments({ isSubscribed: true });
    const totalUnsubscribers = await Newsletter.countDocuments({ isSubscribed: false });
    const totalEmails = await Newsletter.countDocuments();

    // Get recent subscriptions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSubscriptions = await Newsletter.countDocuments({
      subscribedAt: { $gte: thirtyDaysAgo },
      isSubscribed: true
    });

    res.status(200).json({
      success: true,
      data: {
        totalSubscribers,
        totalUnsubscribers,
        totalEmails,
        recentSubscriptions
      }
    });

  } catch (error) {
    console.error('Newsletter stats error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching newsletter statistics'
    });
  }
}; 