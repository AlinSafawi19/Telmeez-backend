import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { SECURITY_CONFIG } from '../config/security';

interface AuthRequest extends Request {
  user?: any;
}

interface PopulatedUserRole {
  _id: string;
  role: string;
}

// Track failed login attempts
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
      return;
    }

    // Check for account lockout
    const lockoutInfo = failedAttempts.get(email);
    if (lockoutInfo && lockoutInfo.count >= SECURITY_CONFIG.ACCOUNT.MAX_LOGIN_ATTEMPTS) {
      const timeSinceLastAttempt = Date.now() - lockoutInfo.lastAttempt;
      if (timeSinceLastAttempt < SECURITY_CONFIG.ACCOUNT.LOCKOUT_DURATION) {
        const remainingTime = Math.ceil((SECURITY_CONFIG.ACCOUNT.LOCKOUT_DURATION - timeSinceLastAttempt) / 1000 / 60);
        res.status(423).json({
          success: false,
          message: `Account temporarily locked. Please try again in ${remainingTime} minutes.`
        });
        return;
      } else {
        // Reset lockout after duration
        failedAttempts.delete(email);
      }
    }

    // Find user by email and populate role
    const user = await User.findOne({ email }).populate('role', 'role');
    
    if (!user) {
      recordFailedAttempt(email);
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      recordFailedAttempt(email);
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Clear failed attempts on successful login
    failedAttempts.delete(email);

    // Type guard for populated role
    const userRole = user.role as unknown as PopulatedUserRole;
    if (!userRole || !userRole.role) {
      res.status(500).json({
        success: false,
        message: 'User role not found'
      });
      return;
    }

    // Generate access token (short-lived)
    const accessToken = (jwt.sign as any)(
      {
        userId: user._id,
        email: user.email,
        role: userRole.role,
        permissions: [] // No permissions field in current model
      },
      SECURITY_CONFIG.JWT.SECRET,
      { expiresIn: SECURITY_CONFIG.JWT.ACCESS_TOKEN_EXPIRY }
    );

    // Generate refresh token (long-lived)
    const refreshToken = (jwt.sign as any)(
      {
        userId: user._id,
        type: 'refresh'
      },
      SECURITY_CONFIG.JWT.REFRESH_SECRET,
      { expiresIn: SECURITY_CONFIG.JWT.REFRESH_TOKEN_EXPIRY }
    );

    // Set secure cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: SECURITY_CONFIG.COOKIES.HTTP_ONLY,
      secure: SECURITY_CONFIG.COOKIES.SECURE,
      sameSite: SECURITY_CONFIG.COOKIES.SAME_SITE,
      maxAge: SECURITY_CONFIG.COOKIES.ACCESS_TOKEN_MAX_AGE
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: SECURITY_CONFIG.COOKIES.HTTP_ONLY,
      secure: SECURITY_CONFIG.COOKIES.SECURE,
      sameSite: SECURITY_CONFIG.COOKIES.SAME_SITE,
      maxAge: SECURITY_CONFIG.COOKIES.REFRESH_TOKEN_MAX_AGE
    });

    // Return user data (without password) and token
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      institutionName: user.institutionName,
      role: userRole,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    res.status(200).json({
      success: true,
      message: 'Sign in successful',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token not found'
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      SECURITY_CONFIG.JWT.REFRESH_SECRET
    ) as any;

    if (decoded.type !== 'refresh') {
      res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
      return;
    }

    // Get user
    const user = await User.findById(decoded.userId).populate('role', 'role');
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
      return;
    }

    const userRole = user.role as unknown as PopulatedUserRole;

    // Generate new access token
    const newAccessToken = (jwt.sign as any)(
      {
        userId: user._id,
        email: user.email,
        role: userRole.role,
        permissions: [] // No permissions field in current model
      },
      SECURITY_CONFIG.JWT.SECRET,
      { expiresIn: SECURITY_CONFIG.JWT.ACCESS_TOKEN_EXPIRY }
    );

    // Set new access token cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: SECURITY_CONFIG.COOKIES.HTTP_ONLY,
      secure: SECURITY_CONFIG.COOKIES.SECURE,
      sameSite: SECURITY_CONFIG.COOKIES.SAME_SITE,
      maxAge: SECURITY_CONFIG.COOKIES.ACCESS_TOKEN_MAX_AGE
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

export const signout = async (_req: Request, res: Response) => {
  try {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Sign out successful'
    });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const user = await User.findById(userId)
      .populate('role', 'role')
      .populate({
        path: 'subscriptions',
        populate: {
          path: 'plan',
          select: 'name monthlyPrice annualPrice features'
        }
      });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Type guard for populated role
    const userRole = user.role as unknown as PopulatedUserRole;
    if (!userRole || !userRole.role) {
      res.status(500).json({
        success: false,
        message: 'User role not found'
      });
      return;
    }

    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      institutionName: user.institutionName,
      role: userRole,
      isActive: user.isActive,
      subscriptions: user.subscriptions,
      createdAt: user.createdAt
    };

    res.status(200).json({
      success: true,
      data: userResponse
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper function to record failed login attempts
function recordFailedAttempt(email: string) {
  const current = failedAttempts.get(email) || { count: 0, lastAttempt: 0 };
  current.count += 1;
  current.lastAttempt = Date.now();
  failedAttempts.set(email, current);
} 