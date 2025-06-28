// Security configuration constants
export const SECURITY_CONFIG = {
  // JWT Configuration
  JWT: {
    SECRET: process.env['JWT_SECRET'] || 'your-secret-key',
    REFRESH_SECRET: process.env['JWT_REFRESH_SECRET'] || 'your-refresh-secret-key',
    ACCESS_TOKEN_EXPIRY: process.env['TOKEN_EXPIRY'] || '1h',
    REFRESH_TOKEN_EXPIRY: process.env['REFRESH_TOKEN_EXPIRY'] || '7d',
  },

  // Account Security
  ACCOUNT: {
    MAX_LOGIN_ATTEMPTS: parseInt(process.env['MAX_LOGIN_ATTEMPTS'] || '5'),
    LOCKOUT_DURATION: parseInt(process.env['LOCKOUT_DURATION'] || '900000'), // 15 minutes in ms
    BCRYPT_ROUNDS: parseInt(process.env['BCRYPT_ROUNDS'] || '12'),
  },

  // Rate Limiting
  RATE_LIMIT: {
    AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    AUTH_MAX_ATTEMPTS: parseInt(process.env['RATE_LIMIT_MAX'] || '5'),
    GENERAL_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    GENERAL_MAX_REQUESTS: parseInt(process.env['GENERAL_RATE_LIMIT_MAX'] || '100'),
  },

  // Cookie Configuration
  COOKIES: {
    HTTP_ONLY: true,
    SECURE: process.env['NODE_ENV'] === 'production',
    SAME_SITE: 'strict' as const,
    ACCESS_TOKEN_MAX_AGE: 60 * 60 * 1000, // 1 hour
    REFRESH_TOKEN_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  // CORS Configuration
  CORS: {
    ORIGINS: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      process.env['BASE_URL'],
      process.env['FRONTEND_URL']
    ].filter(Boolean) as string[],
    CREDENTIALS: true,
    METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  },

  // Content Security Policy
  CSP: {
    DIRECTIVES: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },

  // HSTS Configuration
  HSTS: {
    MAX_AGE: 31536000, // 1 year
    INCLUDE_SUBDOMAINS: true,
    PRELOAD: true,
  },
};

// Environment validation
export const validateSecurityConfig = () => {
  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn('⚠️  Missing required environment variables:', missing.join(', '));
    console.warn('⚠️  Using default values. This is not secure for production!');
  }

  if (process.env['NODE_ENV'] === 'production') {
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables for production: ${missing.join(', ')}`);
    }
    
    if (process.env['JWT_SECRET'] === 'your-secret-key' || 
        process.env['JWT_REFRESH_SECRET'] === 'your-refresh-secret-key') {
      throw new Error('Default JWT secrets detected. Please set proper secrets for production.');
    }
  }
}; 