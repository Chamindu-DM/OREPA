// ============================================================================
// OREPA Backend - Rate Limiting Middleware
// ============================================================================
//
// Purpose:
//   Provides rate limiting for API endpoints to prevent abuse
//   Protects against brute force attacks, spam, and DoS
//
// Features:
//   - Different limits for different endpoint types
//   - IP-based rate limiting
//   - Configurable time windows
//   - Custom error messages
//   - Skip rate limiting for whitelisted IPs (if needed)
//
// Dependencies:
//   - express-rate-limit: Rate limiting middleware
//
// Usage:
//   const { adminLoginLimiter, apiLimiter } = require('./middleware/rateLimiter');
//   router.post('/admin/login', adminLoginLimiter, controller.login);
//   router.use('/api', apiLimiter);
//
// ============================================================================

const rateLimit = require('express-rate-limit');

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Get configuration from environment variables with defaults
 */
const config = {
  // Time window for rate limiting (in minutes)
  window: parseInt(process.env.RATE_LIMIT_WINDOW) || 15,

  // General API request limit
  apiMaxRequests: parseInt(process.env.RATE_LIMIT_MAX) || 100,

  // Admin login attempt limit
  adminLoginMaxAttempts: parseInt(process.env.ADMIN_LOGIN_LIMIT) || 5,

  // User registration attempt limit
  registrationMaxAttempts: 3,

  // User login attempt limit
  userLoginMaxAttempts: 5,
};

// ============================================================================
// CUSTOM ERROR MESSAGE HANDLER
// ============================================================================

/**
 * Custom handler for rate limit exceeded errors
 *
 * Provides consistent error response format
 */
const rateLimitHandler = (req, res) => {
  return res.status(429).json({
    success: false,
    message: 'Too many requests. Please try again later.',
    error: 'RATE_LIMIT_EXCEEDED',
    retryAfter: res.get('Retry-After'),
  });
};

// ============================================================================
// RATE LIMITERS
// ============================================================================

/**
 * Admin Login Rate Limiter
 *
 * Strict rate limiting for admin login endpoint
 * Prevents brute force attacks on admin accounts
 *
 * Limits: 5 attempts per 15 minutes per IP
 *
 * Usage:
 *   router.post('/admin/login', adminLoginLimiter, controller.login);
 */
const adminLoginLimiter = rateLimit({
  windowMs: config.window * 60 * 1000, // 15 minutes in milliseconds
  max: config.adminLoginMaxAttempts, // 5 requests per window
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
    error: 'TOO_MANY_LOGIN_ATTEMPTS',
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: rateLimitHandler,
  // Key generator: rate limit by IP address
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  // Skip successful logins (only count failed attempts)
  skipSuccessfulRequests: true,
});

/**
 * User Login Rate Limiter
 *
 * Rate limiting for regular user login endpoint
 * Less strict than admin login
 *
 * Limits: 5 attempts per 15 minutes per IP
 *
 * Usage:
 *   router.post('/auth/login', userLoginLimiter, controller.login);
 */
const userLoginLimiter = rateLimit({
  windowMs: config.window * 60 * 1000, // 15 minutes
  max: config.userLoginMaxAttempts, // 5 requests per window
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
    error: 'TOO_MANY_LOGIN_ATTEMPTS',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => req.ip || req.connection.remoteAddress,
  skipSuccessfulRequests: true,
});

/**
 * Registration Rate Limiter
 *
 * Rate limiting for user registration endpoint
 * Prevents spam registrations
 *
 * Limits: 3 attempts per hour per IP
 *
 * Usage:
 *   router.post('/auth/register', registrationLimiter, controller.register);
 */
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.registrationMaxAttempts, // 3 requests per hour
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again in an hour.',
    error: 'TOO_MANY_REGISTRATION_ATTEMPTS',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => req.ip || req.connection.remoteAddress,
  skipSuccessfulRequests: true,
});

/**
 * General API Rate Limiter
 *
 * General rate limiting for all API endpoints
 * Prevents API abuse and DoS attacks
 *
 * Limits: 100 requests per 15 minutes per IP
 *
 * Usage:
 *   router.use('/api', apiLimiter);
 */
const apiLimiter = rateLimit({
  windowMs: config.window * 60 * 1000, // 15 minutes
  max: config.apiMaxRequests, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
    error: 'API_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => req.ip || req.connection.remoteAddress,
  // Skip rate limiting for health check endpoint
  skip: (req) => req.path === '/api/health',
});

/**
 * Strict API Rate Limiter
 *
 * More restrictive rate limiting for sensitive operations
 * Use for password reset, email verification, etc.
 *
 * Limits: 10 requests per 15 minutes per IP
 *
 * Usage:
 *   router.post('/auth/password-reset', strictApiLimiter, controller.resetPassword);
 */
const strictApiLimiter = rateLimit({
  windowMs: config.window * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    error: 'STRICT_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => req.ip || req.connection.remoteAddress,
});

/**
 * File Upload Rate Limiter
 *
 * Rate limiting for file upload endpoints
 * Prevents abuse of file storage
 *
 * Limits: 20 uploads per hour per IP
 *
 * Usage:
 *   router.post('/admin/upload', authenticate, requireAdmin, uploadLimiter, controller.upload);
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: {
    success: false,
    message: 'Too many uploads. Please try again in an hour.',
    error: 'UPLOAD_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => req.ip || req.connection.remoteAddress,
});

/**
 * Email Sending Rate Limiter
 *
 * Rate limiting for email sending endpoints
 * Prevents email spam and abuse
 *
 * Limits: 5 emails per hour per IP
 *
 * Usage:
 *   router.post('/contact', emailLimiter, controller.sendContactEmail);
 */
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 emails per hour
  message: {
    success: false,
    message: 'Too many emails sent. Please try again in an hour.',
    error: 'EMAIL_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => req.ip || req.connection.remoteAddress,
});

// ============================================================================
// CUSTOM RATE LIMITER FACTORY
// ============================================================================

/**
 * Create Custom Rate Limiter
 *
 * Factory function to create rate limiters with custom settings
 * Useful for specific endpoints that need unique rate limiting
 *
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMinutes - Time window in minutes (default: 15)
 * @param {number} options.maxRequests - Maximum requests per window (default: 100)
 * @param {string} options.message - Custom error message
 * @param {boolean} options.skipSuccessful - Skip successful requests (default: false)
 * @returns {Function} Express rate limiter middleware
 *
 * @example
 *   const customLimiter = createRateLimiter({
 *     windowMinutes: 30,
 *     maxRequests: 50,
 *     message: 'Too many requests to this endpoint'
 *   });
 *   router.post('/special-endpoint', customLimiter, controller.handle);
 */
function createRateLimiter(options = {}) {
  const {
    windowMinutes = 15,
    maxRequests = 100,
    message = 'Too many requests. Please try again later.',
    skipSuccessful = false,
  } = options;

  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: {
      success: false,
      message,
      error: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    keyGenerator: (req) => req.ip || req.connection.remoteAddress,
    skipSuccessfulRequests: skipSuccessful,
  });
}

// ============================================================================
// IP WHITELIST (Optional)
// ============================================================================

/**
 * Check if IP is Whitelisted
 *
 * Helper function to check if an IP should bypass rate limiting
 * Useful for internal services, trusted partners, etc.
 *
 * @param {string} ip - IP address to check
 * @returns {boolean} True if IP is whitelisted
 */
function isWhitelisted(ip) {
  // Get whitelisted IPs from environment (comma-separated)
  const whitelist = (process.env.RATE_LIMIT_WHITELIST || '').split(',').map((ip) => ip.trim());

  return whitelist.includes(ip);
}

/**
 * Skip Rate Limiting for Whitelisted IPs
 *
 * Middleware to skip rate limiting for whitelisted IPs
 * Can be combined with any rate limiter
 *
 * @example
 *   router.post('/api/endpoint', skipWhitelisted, apiLimiter, controller.handle);
 */
const skipWhitelisted = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;

  if (isWhitelisted(ip)) {
    // Skip to next middleware (bypass rate limiting)
    return next('route');
  }

  // Continue to rate limiter
  next();
};

// ============================================================================
// EXPORT RATE LIMITERS
// ============================================================================

module.exports = {
  // Predefined limiters
  adminLoginLimiter,
  userLoginLimiter,
  registrationLimiter,
  apiLimiter,
  strictApiLimiter,
  uploadLimiter,
  emailLimiter,

  // Custom limiter factory
  createRateLimiter,

  // Whitelist helpers
  skipWhitelisted,
  isWhitelisted,
};

// ============================================================================
// END OF RATE LIMITING MIDDLEWARE
// ============================================================================
