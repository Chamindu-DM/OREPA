// ============================================================================
// OREPA Backend - Error Handling Middleware
// ============================================================================
//
// Purpose:
//   Centralized error handling for the Express application
//   Provides consistent error responses and logging
//
// Features:
//   - Global error handler for all routes
//   - 404 Not Found handler for undefined routes
//   - Specific error type handlers (Validation, MongoDB, JWT, etc.)
//   - Environment-aware error responses (detailed in dev, safe in production)
//   - Error logging with stack traces
//
// Dependencies:
//   None (uses built-in Express error handling)
//
// Usage:
//   // In server.js (must be last middleware):
//   app.use(notFound);
//   app.use(errorHandler);
//
// ============================================================================

// ============================================================================
// 404 NOT FOUND HANDLER
// ============================================================================

/**
 * Not Found Handler
 *
 * Catches all requests that don't match any defined routes
 * Must be placed AFTER all route definitions
 *
 * Process:
 *   1. Receives request that didn't match any route
 *   2. Creates error object with 404 status
 *   3. Passes error to global error handler
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @example
 *   // Request to non-existent route: GET /api/nonexistent
 *   // Response: { success: false, message: 'Route not found: /api/nonexistent' }
 */
const notFound = (req, res, next) => {
  // Create error object for 404
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  error.status = 'fail';

  // Pass error to global error handler
  next(error);
};

// ============================================================================
// GLOBAL ERROR HANDLER
// ============================================================================

/**
 * Global Error Handler
 *
 * Centralized error handling for all application errors
 * Provides consistent error response format
 * Handles different error types (Validation, MongoDB, JWT, etc.)
 *
 * Error Response Format:
 *   {
 *     success: false,
 *     status: 'error' | 'fail',
 *     message: 'Error message',
 *     error: 'ERROR_CODE',
 *     stack: '...' (development only)
 *   }
 *
 * Error Types Handled:
 *   - Validation Errors (express-validator)
 *   - MongoDB Errors (duplicate key, cast error, validation)
 *   - JWT Errors (invalid token, expired token)
 *   - Multer Errors (file upload)
 *   - Custom Application Errors
 *
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // ========================================================================
  // ERROR INITIALIZATION
  // ========================================================================

  // Make a copy of the error object
  let error = { ...err };
  error.message = err.message;

  // Default status code (500 if not set)
  let statusCode = err.statusCode || 500;

  // Default error status ('error' for 5xx, 'fail' for 4xx)
  let status = err.status || (statusCode >= 500 ? 'error' : 'fail');

  // ========================================================================
  // LOG ERROR (Development Only)
  // ========================================================================

  // Log detailed error information in development
  if (process.env.NODE_ENV === 'development') {
    console.error('\n❌ ========== ERROR OCCURRED ==========');
    console.error('📍 Path:', req.method, req.originalUrl);
    console.error('🔴 Error Name:', err.name);
    console.error('💬 Error Message:', err.message);
    console.error('📊 Status Code:', statusCode);
    if (err.stack) {
      console.error('📚 Stack Trace:', err.stack);
    }
    console.error('========================================\n');
  } else {
    // Log minimal error information in production
    console.error('❌ Error:', err.name, '-', err.message);
  }

  // ========================================================================
  // HANDLE SPECIFIC ERROR TYPES
  // ========================================================================

  // ------------------------------------------------------------------------
  // MongoDB Duplicate Key Error (E11000)
  // ------------------------------------------------------------------------
  //
  // Occurs when trying to insert a document with a duplicate unique field
  // Example: Registering with an email that already exists
  //
  if (err.code === 11000) {
    // Extract field name from error message
    const field = Object.keys(err.keyValue || {})[0];
    const value = err.keyValue ? err.keyValue[field] : 'unknown';

    error.message = `${field || 'Field'} '${value}' already exists. Please use a different value.`;
    statusCode = 400;
    status = 'fail';
  }

  // ------------------------------------------------------------------------
  // Mongoose Validation Error
  // ------------------------------------------------------------------------
  //
  // Occurs when document fails schema validation
  // Example: Missing required fields, invalid data types, etc.
  //
  if (err.name === 'ValidationError') {
    // Extract validation error messages
    const messages = Object.values(err.errors || {}).map((e) => e.message);

    error.message = messages.length > 0
      ? messages.join('. ')
      : 'Validation failed';

    statusCode = 400;
    status = 'fail';
  }

  // ------------------------------------------------------------------------
  // Mongoose Cast Error
  // ------------------------------------------------------------------------
  //
  // Occurs when invalid data type is provided for a field
  // Example: Providing invalid ObjectId, non-numeric value for number field
  //
  if (err.name === 'CastError') {
    error.message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
    status = 'fail';
  }

  // ------------------------------------------------------------------------
  // JWT Errors
  // ------------------------------------------------------------------------
  //
  // JWT Token Expired Error
  //
  if (err.name === 'TokenExpiredError') {
    error.message = 'Your token has expired. Please log in again.';
    statusCode = 401;
    status = 'fail';
  }

  //
  // JWT Malformed/Invalid Error
  //
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token. Please log in again.';
    statusCode = 401;
    status = 'fail';
  }

  //
  // JWT Not Before Error
  //
  if (err.name === 'NotBeforeError') {
    error.message = 'Token not active yet.';
    statusCode = 401;
    status = 'fail';
  }

  // ------------------------------------------------------------------------
  // Multer File Upload Errors (Future Use)
  // ------------------------------------------------------------------------
  //
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error.message = 'File size too large. Maximum size allowed is 5MB.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      error.message = 'Too many files. Maximum 10 files allowed.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      error.message = 'Unexpected field in file upload.';
    } else {
      error.message = 'File upload error.';
    }
    statusCode = 400;
    status = 'fail';
  }

  // ------------------------------------------------------------------------
  // Express Validator Errors
  // ------------------------------------------------------------------------
  //
  // Handle validation errors from express-validator
  //
  if (err.array && typeof err.array === 'function') {
    const errors = err.array();
    const messages = errors.map((e) => e.msg);
    error.message = messages.join('. ');
    statusCode = 400;
    status = 'fail';
  }

  // ========================================================================
  // BUILD ERROR RESPONSE
  // ========================================================================

  // Base error response object
  const errorResponse = {
    success: false,
    status: status,
    message: error.message || 'An error occurred',
  };

  // Add error code if available
  if (err.code) {
    errorResponse.error = err.code;
  }

  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.error = err;
  }

  // ========================================================================
  // SEND ERROR RESPONSE
  // ========================================================================

  res.status(statusCode).json(errorResponse);
};

// ============================================================================
// ASYNC HANDLER UTILITY
// ============================================================================

/**
 * Async Handler Wrapper
 *
 * Wraps async route handlers to catch errors and pass to error handler
 * Eliminates need for try-catch blocks in every async route
 *
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 *
 * @example
 *   // Without asyncHandler (requires try-catch):
 *   router.get('/users', async (req, res, next) => {
 *     try {
 *       const users = await User.find();
 *       res.json(users);
 *     } catch (error) {
 *       next(error);
 *     }
 *   });
 *
 *   // With asyncHandler (no try-catch needed):
 *   router.get('/users', asyncHandler(async (req, res) => {
 *     const users = await User.find();
 *     res.json(users);
 *   }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ============================================================================
// CUSTOM ERROR CLASS
// ============================================================================

/**
 * Custom Application Error Class
 *
 * Extends built-in Error class with additional properties
 * Useful for creating specific application errors
 *
 * @class AppError
 * @extends Error
 *
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 *
 * @example
 *   // In a controller:
 *   if (!user) {
 *     throw new AppError('User not found', 404);
 *   }
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode >= 500 ? 'error' : 'fail';
    this.isOperational = true;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// ============================================================================
// EXPORT MIDDLEWARE AND UTILITIES
// ============================================================================

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
  AppError,
};

// ============================================================================
// END OF ERROR HANDLING MIDDLEWARE
// ============================================================================
