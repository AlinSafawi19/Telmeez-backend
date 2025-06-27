import { Request, Response } from 'express';
import { UserSubscriptionService } from '../services/userSubscriptionService';

/**
 * Get all subscriptions for a specific user
 */
export const getUserSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
      return;
    }
    
    const userSubscriptions = await UserSubscriptionService.getUserSubscriptions(userId);
    
    if (!userSubscriptions) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: userSubscriptions
    });
  } catch (error: any) {
    console.error('Error getting user subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get only active subscriptions for a user
 */
export const getUserActiveSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
      return;
    }
    
    const userSubscriptions = await UserSubscriptionService.getUserActiveSubscriptions(userId);
    
    if (!userSubscriptions) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: userSubscriptions
    });
  } catch (error: any) {
    console.error('Error getting user active subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get all users with active subscriptions
 */
export const getUsersWithActiveSubscriptions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await UserSubscriptionService.getUsersWithActiveSubscriptions();
    
    res.json({
      success: true,
      data: users
    });
  } catch (error: any) {
    console.error('Error getting users with active subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get all users with a specific subscription status
 */
export const getUsersBySubscriptionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.params;
    
    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Status is required'
      });
      return;
    }
    
    const users = await UserSubscriptionService.getUsersBySubscriptionStatus(status);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error: any) {
    console.error('Error getting users by subscription status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get subscription details with user information
 */
export const getSubscriptionWithUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subscriptionId } = req.params;
    
    if (!subscriptionId) {
      res.status(400).json({
        success: false,
        message: 'Subscription ID is required'
      });
      return;
    }
    
    const subscription = await UserSubscriptionService.getSubscriptionWithUser(subscriptionId);
    
    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
      return;
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error: any) {
    console.error('Error getting subscription with user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get all subscriptions with user details
 */
export const getAllSubscriptionsWithUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const subscriptions = await UserSubscriptionService.getAllSubscriptionsWithUsers();
    
    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error: any) {
    console.error('Error getting all subscriptions with users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Check if a user has an active subscription
 */
export const checkUserActiveSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
      return;
    }
    
    const hasActive = await UserSubscriptionService.hasActiveSubscription(userId);
    
    res.json({
      success: true,
      data: {
        userId,
        hasActiveSubscription: hasActive
      }
    });
  } catch (error: any) {
    console.error('Error checking user active subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get subscription statistics
 */
export const getSubscriptionStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await UserSubscriptionService.getSubscriptionStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Error getting subscription stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
