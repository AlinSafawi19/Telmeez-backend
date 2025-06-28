import express, { ErrorRequestHandler } from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import './config/db';
import { SECURITY_CONFIG, validateSecurityConfig } from './config/security';
import checkoutRoutes from './routes/checkout';
import newsletterRoutes from './routes/newsletter';
import authRoutes from './routes/auth';

// Load environment variables from .env file
dotenv.config();

// Validate security configuration
validateSecurityConfig();

const app = express();
const PORT = process.env['PORT'];

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: SECURITY_CONFIG.CSP.DIRECTIVES,
  },
  hsts: {
    maxAge: SECURITY_CONFIG.HSTS.MAX_AGE,
    includeSubDomains: SECURITY_CONFIG.HSTS.INCLUDE_SUBDOMAINS,
    preload: SECURITY_CONFIG.HSTS.PRELOAD
  }
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: SECURITY_CONFIG.RATE_LIMIT.AUTH_WINDOW_MS,
  max: SECURITY_CONFIG.RATE_LIMIT.AUTH_MAX_ATTEMPTS,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: SECURITY_CONFIG.RATE_LIMIT.GENERAL_WINDOW_MS,
  max: SECURITY_CONFIG.RATE_LIMIT.GENERAL_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
app.use(cors({
  origin: SECURITY_CONFIG.CORS.ORIGINS,
  credentials: SECURITY_CONFIG.CORS.CREDENTIALS,
  methods: SECURITY_CONFIG.CORS.METHODS,
  allowedHeaders: SECURITY_CONFIG.CORS.ALLOWED_HEADERS
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Apply rate limiting
app.use('/api/auth/signin', authLimiter);
app.use('/api', generalLimiter);

// CSRF token endpoint (before CSRF protection)
app.get('/api/csrf-token', (req: express.Request & { csrfToken?: () => string }, res) => {
  res.json({ csrfToken: req.csrfToken?.() || '' });
});

// Auth routes (no CSRF protection needed)
app.use('/api/auth', authRoutes);

// Checkout routes (temporarily no CSRF protection)
app.use('/api/checkout', checkoutRoutes);

// CSRF protection - apply to remaining routes
app.use(csrf({ 
  cookie: true,
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
}));

// Routes (with CSRF protection)
app.use('/api/newsletter', newsletterRoutes);

// Error handling for CSRF
const csrfErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
    return;
  }
  next(err);
};

app.use(csrfErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});