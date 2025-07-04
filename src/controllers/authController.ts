import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import VerificationCode from '../models/VerificationCode';
import { SECURITY_CONFIG } from '../config/security';
import { generateVerificationCode, sendPasswordResetEmail } from '../services/emailService';
import { getUserStats } from '../services/statsService';

interface AuthRequest extends Request {
  user?: any;
}

interface PopulatedUserRole {
  _id: string;
  role: string;
}

// Enhanced tracking for failed login attempts
interface FailedAttemptInfo {
  count: number;
  lastAttempt: number;
  lockoutCount: number; // Track how many times account has been locked
  ipAddresses: Set<string>; // Track IP addresses used
  firstAttempt: number; // Track when first attempt was made
}

// Track failed login attempts with enhanced information
const failedAttempts = new Map<string, FailedAttemptInfo>();

// Track IP-based attempts
const ipAttempts = new Map<string, { count: number; lastAttempt: number }>();

// Helper function to get client IP
function getClientIP(req: Request): string {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         (req.connection as any).socket?.remoteAddress || 
         'unknown';
}

// Enhanced helper function to record failed login attempts
function recordFailedAttempt(email: string, ipAddress: string) {
  const current = failedAttempts.get(email) || { 
    count: 0, 
    lastAttempt: 0, 
    lockoutCount: 0,
    ipAddresses: new Set<string>(),
    firstAttempt: Date.now()
  };
  
  current.count += 1;
  current.lastAttempt = Date.now();
  current.ipAddresses.add(ipAddress);
  
  // Track IP-based attempts
  const ipInfo = ipAttempts.get(ipAddress) || { count: 0, lastAttempt: 0 };
  ipInfo.count += 1;
  ipInfo.lastAttempt = Date.now();
  ipAttempts.set(ipAddress, ipInfo);
  
  failedAttempts.set(email, current);
  
  // Check for suspicious activity
  if (SECURITY_CONFIG.ACCOUNT.SUSPICIOUS_ACTIVITY.ENABLED && 
      current.count >= SECURITY_CONFIG.ACCOUNT.SUSPICIOUS_ACTIVITY.MIN_ATTEMPTS_FOR_ALERT) {
    // Log suspicious activity (in production, this could trigger alerts)
    console.warn(`🚨 Suspicious activity detected for email: ${email}`, {
      attempts: current.count,
      ipAddresses: Array.from(current.ipAddresses),
      timeSpan: Date.now() - current.firstAttempt
    });
  }
}

// Helper function to calculate progressive lockout duration
function calculateLockoutDuration(email: string): number {
  const info = failedAttempts.get(email);
  if (!info || !SECURITY_CONFIG.ACCOUNT.PROGRESSIVE_LOCKOUT.ENABLED) {
    return SECURITY_CONFIG.ACCOUNT.LOCKOUT_DURATION;
  }
  
  const baseDuration = SECURITY_CONFIG.ACCOUNT.LOCKOUT_DURATION;
  const multiplier = Math.pow(SECURITY_CONFIG.ACCOUNT.PROGRESSIVE_LOCKOUT.MULTIPLIER, info.lockoutCount);
  const progressiveDuration = baseDuration * multiplier;
  
  return Math.min(progressiveDuration, SECURITY_CONFIG.ACCOUNT.PROGRESSIVE_LOCKOUT.MAX_LOCKOUT);
}

// Helper function to check IP-based lockout
function isIPLocked(ipAddress: string): boolean {
  if (!SECURITY_CONFIG.ACCOUNT.IP_TRACKING.ENABLED) return false;
  
  const ipInfo = ipAttempts.get(ipAddress);
  if (!ipInfo) return false;
  
  const timeSinceLastAttempt = Date.now() - ipInfo.lastAttempt;
  return ipInfo.count >= SECURITY_CONFIG.ACCOUNT.IP_TRACKING.MAX_ATTEMPTS_PER_IP && 
         timeSinceLastAttempt < SECURITY_CONFIG.ACCOUNT.IP_TRACKING.IP_LOCKOUT_DURATION;
}

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;
    const clientIP = getClientIP(req);

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error_code: !email ? 'EMAIL_REQUIRED' : 'PASSWORD_REQUIRED',
        message: !email ? 'Email is required' : 'Password is required'
      });
      return;
    }

    // Check for IP-based lockout
    if (isIPLocked(clientIP)) {
      const remainingTime = Math.ceil((SECURITY_CONFIG.ACCOUNT.IP_TRACKING.IP_LOCKOUT_DURATION - 
        (Date.now() - (ipAttempts.get(clientIP)?.lastAttempt || 0))) / 1000 / 60);
      res.status(423).json({
        success: false,
        error_code: 'IP_LOCKED',
        message: `Too many failed attempts from this IP. Please try again in ${remainingTime} minutes.`
      });
      return;
    }

    // Check for account lockout
    const lockoutInfo = failedAttempts.get(email);
    if (lockoutInfo && lockoutInfo.count >= SECURITY_CONFIG.ACCOUNT.MAX_LOGIN_ATTEMPTS) {
      const lockoutDuration = calculateLockoutDuration(email);
      const timeSinceLastAttempt = Date.now() - lockoutInfo.lastAttempt;
      
      if (timeSinceLastAttempt < lockoutDuration) {
        const remainingTime = Math.ceil((lockoutDuration - timeSinceLastAttempt) / 1000 / 60);
        res.status(423).json({
          success: false,
          error_code: 'ACCOUNT_LOCKED',
          message: `Account temporarily locked due to multiple failed attempts. Please try again in ${remainingTime} minutes.`,
          lockout_count: lockoutInfo.lockoutCount + 1
        });
        return;
      } else {
        // Reset lockout after duration
        lockoutInfo.count = 0;
        lockoutInfo.lockoutCount += 1; // Increment lockout count for progressive lockout
        failedAttempts.set(email, lockoutInfo);
      }
    }

    // Find user by email and populate role
    const user = await User.findOne({ email }).populate('role', 'role');
    
    if (!user) {
      recordFailedAttempt(email, clientIP);
      res.status(401).json({
        success: false,
        error_code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        error_code: 'ACCOUNT_DEACTIVATED',
        message: 'Account is deactivated. Please contact support.'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      recordFailedAttempt(email, clientIP);
      res.status(401).json({
        success: false,
        error_code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
      return;
    }

    // Clear failed attempts on successful login
    failedAttempts.delete(email);
    
    // Clear IP-based attempts for this IP (optional - could keep for additional security)
    if (SECURITY_CONFIG.ACCOUNT.IP_TRACKING.ENABLED) {
      ipAttempts.delete(clientIP);
    }

    // Type guard for populated role
    const userRole = user.role as unknown as PopulatedUserRole;
    if (!userRole || !userRole.role) {
      res.status(500).json({
        success: false,
        error_code: 'USER_ROLE_NOT_FOUND',
        message: 'User role not found'
      });
      return;
    }

    // Determine token expiry times based on rememberMe
    const accessTokenExpiry = rememberMe ? '7d' : SECURITY_CONFIG.JWT.ACCESS_TOKEN_EXPIRY;
    const refreshTokenExpiry = rememberMe ? '30d' : SECURITY_CONFIG.JWT.REFRESH_TOKEN_EXPIRY;
    
    // Calculate cookie maxAge in milliseconds
    const accessTokenMaxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : SECURITY_CONFIG.COOKIES.ACCESS_TOKEN_MAX_AGE;
    const refreshTokenMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : SECURITY_CONFIG.COOKIES.REFRESH_TOKEN_MAX_AGE;

    // Generate access token
    const accessToken = (jwt.sign as any)(
      {
        userId: user._id,
        email: user.email,
        role: userRole.role,
        permissions: [] // No permissions field in current model
      },
      SECURITY_CONFIG.JWT.SECRET,
      { expiresIn: accessTokenExpiry }
    );

    // Generate refresh token
    const refreshToken = (jwt.sign as any)(
      {
        userId: user._id,
        type: 'refresh'
      },
      SECURITY_CONFIG.JWT.REFRESH_SECRET,
      { expiresIn: refreshTokenExpiry }
    );

    // Set secure cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: SECURITY_CONFIG.COOKIES.HTTP_ONLY,
      secure: SECURITY_CONFIG.COOKIES.SECURE,
      sameSite: SECURITY_CONFIG.COOKIES.SAME_SITE as 'strict' | 'lax' | 'none',
      maxAge: accessTokenMaxAge,
      domain: SECURITY_CONFIG.COOKIES.DOMAIN,
      path: SECURITY_CONFIG.COOKIES.PATH
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: SECURITY_CONFIG.COOKIES.HTTP_ONLY,
      secure: SECURITY_CONFIG.COOKIES.SECURE,
      sameSite: SECURITY_CONFIG.COOKIES.SAME_SITE as 'strict' | 'lax' | 'none',
      maxAge: refreshTokenMaxAge,
      domain: SECURITY_CONFIG.COOKIES.DOMAIN,
      path: SECURITY_CONFIG.COOKIES.PATH
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

    // Get user statistics
    let stats;
    try {
      stats = await getUserStats((user._id as any).toString());
    } catch (error) {
      console.error('Error getting user stats during signin:', error);
      // Don't fail the signin if stats fail, just set to null
      stats = null;
    }

    res.status(200).json({
      success: true,
      message: 'Sign in successful',
      data: {
        user: userResponse,
        stats
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      error_code: 'INTERNAL_SERVER_ERROR',
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
      sameSite: SECURITY_CONFIG.COOKIES.SAME_SITE as 'strict' | 'lax' | 'none',
      maxAge: SECURITY_CONFIG.COOKIES.ACCESS_TOKEN_MAX_AGE,
      domain: SECURITY_CONFIG.COOKIES.DOMAIN,
      path: SECURITY_CONFIG.COOKIES.PATH
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
    // Clear cookies with same settings
    res.clearCookie('accessToken', {
      domain: SECURITY_CONFIG.COOKIES.DOMAIN,
      path: SECURITY_CONFIG.COOKIES.PATH
    });
    res.clearCookie('refreshToken', {
      domain: SECURITY_CONFIG.COOKIES.DOMAIN,
      path: SECURITY_CONFIG.COOKIES.PATH
    });

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

// Forgot Password - Request password reset
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, language = 'en' } = req.body;

    // Validate input
    if (!email) {
      res.status(400).json({
        success: false,
        error_code: 'EMAIL_REQUIRED',
        message: 'Email is required'
      });
      return;
    }

    // Check if user exists and is active
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      // Don't reveal if user exists or not for security
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset code has been sent'
      });
      return;
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save verification code
    await VerificationCode.create({
      email,
      code: verificationCode,
      expiresAt,
      used: false
    });

    // Send email with user's selected language
    const emailSent = await sendPasswordResetEmail(email, verificationCode, language);

    if (!emailSent) {
      res.status(500).json({
        success: false,
        error_code: 'EMAIL_SEND_FAILED',
        message: 'Failed to send password reset email'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset code has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error_code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error'
    });
  }
};

// Verify password reset code
export const verifyPasswordResetCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    // Validate input
    if (!email || !code) {
      res.status(400).json({
        success: false,
        error_code: !email ? 'EMAIL_REQUIRED' : 'CODE_REQUIRED',
        message: !email ? 'Email is required' : 'Verification code is required'
      });
      return;
    }

    // Find the verification code
    const verificationCode = await VerificationCode.findOne({
      email,
      code,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!verificationCode) {
      res.status(400).json({
        success: false,
        error_code: 'INVALID_OR_EXPIRED_CODE',
        message: 'Invalid or expired verification code'
      });
      return;
    }

    // Don't mark code as used here - only mark it as used after password reset
    // verificationCode.used = true;
    // await verificationCode.save();

    res.status(200).json({
      success: true,
      message: 'Verification code is valid'
    });

  } catch (error) {
    console.error('Verify password reset code error:', error);
    res.status(500).json({
      success: false,
      error_code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error'
    });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    // Validate input
    if (!email || !code || !newPassword) {
      res.status(400).json({
        success: false,
        error_code: !email ? 'EMAIL_REQUIRED' : !code ? 'CODE_REQUIRED' : 'PASSWORD_REQUIRED',
        message: !email ? 'Email is required' : !code ? 'Verification code is required' : 'New password is required'
      });
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        error_code: 'PASSWORD_TOO_SHORT',
        message: 'Password must be at least 8 characters long'
      });
      return;
    }

    // Find the verification code
    const verificationCode = await VerificationCode.findOne({
      email,
      code,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!verificationCode) {
      res.status(400).json({
        success: false,
        error_code: 'INVALID_OR_EXPIRED_CODE',
        message: 'Invalid or expired verification code'
      });
      return;
    }

    // Find user
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      res.status(404).json({
        success: false,
        error_code: 'USER_NOT_FOUND',
        message: 'User not found'
      });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Mark verification code as used
    verificationCode.used = true;
    await verificationCode.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error_code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error'
    });
  }
}; 