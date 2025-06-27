import User from '../models/User';
import Subscription from '../models/Subscription';

// Add interfaces for populated data
interface PopulatedSubscription {
  _id: any;
  plan: {
    _id: any;
    name: string;
    monthlyPrice: number;
    annualPrice: number;
  };
  status: string;
  billingCycle: string;
  totalAmount: number;
  currentPeriodEnd: Date;
  trialEnd?: Date;
}

interface PopulatedUser {
  _id: any;
  firstName: string;
  lastName: string;
  email: string;
  subscriptions?: PopulatedSubscription[];
}

export interface UserSubscriptionData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  subscriptions: Array<{
    id: string;
    plan: {
      id: string;
      name: string;
      monthlyPrice: number;
      annualPrice: number;
    };
    status: string;
    billingCycle: string;
    totalAmount: number;
    currentPeriodEnd: Date;
    trialEnd?: Date;
  }>;
}

export class UserSubscriptionService {
  /**
   * Get all subscriptions for a specific user
   */
  static async getUserSubscriptions(userId: string): Promise<UserSubscriptionData | null> {
    try {
      const user = await User.findUserWithSubscriptions(userId) as PopulatedUser | null;
      if (!user) return null;

      return {
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        subscriptions: user.subscriptions?.map(sub => ({
          id: sub._id.toString(),
          plan: {
            id: sub.plan._id.toString(),
            name: sub.plan.name,
            monthlyPrice: sub.plan.monthlyPrice,
            annualPrice: sub.plan.annualPrice
          },
          status: sub.status,
          billingCycle: sub.billingCycle,
          totalAmount: sub.totalAmount,
          currentPeriodEnd: sub.currentPeriodEnd,
          ...(sub.trialEnd && { trialEnd: sub.trialEnd })
        })) || []
      };
    } catch (error) {
      console.error('Error getting user subscriptions:', error);
      throw error;
    }
  }

  /**
   * Get only active subscriptions for a user
   */
  static async getUserActiveSubscriptions(userId: string): Promise<UserSubscriptionData | null> {
    try {
      const user = await User.findUserWithActiveSubscriptions(userId) as PopulatedUser | null;
      if (!user) return null;

      return {
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        subscriptions: user.subscriptions?.map(sub => ({
          id: sub._id.toString(),
          plan: {
            id: sub.plan._id.toString(),
            name: sub.plan.name,
            monthlyPrice: sub.plan.monthlyPrice,
            annualPrice: sub.plan.annualPrice
          },
          status: sub.status,
          billingCycle: sub.billingCycle,
          totalAmount: sub.totalAmount,
          currentPeriodEnd: sub.currentPeriodEnd,
          ...(sub.trialEnd && { trialEnd: sub.trialEnd })
        })) || []
      };
    } catch (error) {
      console.error('Error getting user active subscriptions:', error);
      throw error;
    }
  }

  /**
   * Get all users with a specific subscription status
   */
  static async getUsersBySubscriptionStatus(status: string): Promise<any[]> {
    try {
      return await User.findUsersBySubscriptionStatus(status);
    } catch (error) {
      console.error('Error getting users by subscription status:', error);
      throw error;
    }
  }

  /**
   * Get all users with active subscriptions
   */
  static async getUsersWithActiveSubscriptions(): Promise<any[]> {
    try {
      return await User.aggregate([
        {
          $lookup: {
            from: 'subscriptions',
            localField: '_id',
            foreignField: 'user',
            as: 'subscriptions'
          }
        },
        {
          $match: {
            'subscriptions.status': { $in: ['active', 'trialing'] }
          }
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            email: 1,
            subscriptions: 1
          }
        }
      ]);
    } catch (error) {
      console.error('Error getting users with active subscriptions:', error);
      throw error;
    }
  }

  /**
   * Get subscription details with user information
   */
  static async getSubscriptionWithUser(subscriptionId: string): Promise<any> {
    try {
      return await Subscription.findById(subscriptionId)
        .populate('user', 'firstName lastName email')
        .populate('plan', 'name monthlyPrice annualPrice features');
    } catch (error) {
      console.error('Error getting subscription with user:', error);
      throw error;
    }
  }

  /**
   * Get all subscriptions with user details
   */
  static async getAllSubscriptionsWithUsers(): Promise<any[]> {
    try {
      return await Subscription.find()
        .populate('user', 'firstName lastName email')
        .populate('plan', 'name monthlyPrice annualPrice features')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting all subscriptions with users:', error);
      throw error;
    }
  }

  /**
   * Check if a user has an active subscription
   */
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const activeSubscriptions = await Subscription.find({
        user: userId,
        status: { $in: ['active', 'trialing'] }
      });
      return activeSubscriptions.length > 0;
    } catch (error) {
      console.error('Error checking if user has active subscription:', error);
      throw error;
    }
  }

  /**
   * Get subscription statistics
   */
  static async getSubscriptionStats(): Promise<any> {
    try {
      const stats = await Subscription.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' }
          }
        }
      ]);

      const totalUsers = await User.countDocuments();
      const usersWithSubscriptions = await User.countDocuments({
        subscriptions: { $exists: true, $ne: [] }
      });

      return {
        byStatus: stats,
        totalUsers,
        usersWithSubscriptions,
        subscriptionRate: totalUsers > 0 ? (usersWithSubscriptions / totalUsers) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting subscription stats:', error);
      throw error;
    }
  }
} 