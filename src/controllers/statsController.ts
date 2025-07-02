import { Request, Response } from 'express';
import { getUserStats, getSystemStats, getHistoricalStats } from '../services/statsService';

interface AuthRequest extends Request {
  user?: any;
}

export const getUserStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({
        success: false,
        error_code: 'UNAUTHORIZED',
        message: 'User not authenticated'
      });
      return;
    }

    const stats = await getUserStats(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Error getting user statistics:', error);
    res.status(500).json({
      success: false,
      error_code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get user statistics'
    });
  }
};

export const getSystemStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({
        success: false,
        error_code: 'UNAUTHORIZED',
        message: 'User not authenticated'
      });
      return;
    }

    // Check if user is admin (you might want to add role-based access control here)
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error_code: 'FORBIDDEN',
        message: 'Access denied. Admin privileges required.'
      });
      return;
    }

    const stats = await getSystemStats();

    res.status(200).json({
      success: true,
      message: 'System statistics retrieved successfully',
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Error getting system statistics:', error);
    res.status(500).json({
      success: false,
      error_code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get system statistics'
    });
  }
};

export const getHistoricalStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({
        success: false,
        error_code: 'UNAUTHORIZED',
        message: 'User not authenticated'
      });
      return;
    }

    const historicalStats = await getHistoricalStats(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Historical statistics retrieved successfully',
      data: {
        historicalStats
      }
    });
  } catch (error) {
    console.error('Error getting historical statistics:', error);
    res.status(500).json({
      success: false,
      error_code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get historical statistics'
    });
  }
}; 