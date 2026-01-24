// ============================================================================
// OREPA Backend - Admin Operations Validators
// ============================================================================
//
// Purpose:
//   Input validation middleware for admin-specific operations
//   Validates audit log queries, analytics requests, and admin actions
//
// Features:
//   - Audit log query validation
//   - Analytics date range validation
//   - Admin action logging validation
//   - Report generation validation
//
// Dependencies:
//   - express-validator: Validation and sanitization library
//
// ============================================================================

const { query, body, param, validationResult } = require('express-validator');

// ============================================================================
// VALIDATION ERROR HANDLER
// ============================================================================

/**
 * Check Validation Errors Middleware
 *
 * Checks for validation errors from express-validator
 * If errors exist, returns 400 with error details
 * If no errors, continues to next middleware
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Object} JSON response with validation errors or calls next()
 */
const checkValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }

  next();
};

// ============================================================================
// AUDIT LOG QUERY VALIDATION
// ============================================================================

/**
 * Audit Log Query Validator
 *
 * Validates audit log retrieval queries
 * - Pagination parameters
 * - Date range filters
 * - Action type filters
 * - Admin ID filters
 *
 * @type {Array} Array of validation middleware
 */
const validateAuditLogQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('action')
    .optional()
    .isIn([
      'CREATE_USER',
      'UPDATE_USER',
      'DELETE_USER',
      'APPROVE_USER',
      'REJECT_USER',
      'SUSPEND_USER',
      'CREATE_ADMIN',
      'DELETE_ADMIN',
      'CHANGE_ROLE',
      'CREATE_NEWSLETTER',
      'PUBLISH_NEWSLETTER',
      'DELETE_NEWSLETTER',
      'CREATE_PROJECT',
      'UPDATE_PROJECT',
      'DELETE_PROJECT',
      'UPDATE_CONTENT',
      'LOGIN',
      'LOGOUT',
    ])
    .withMessage('Invalid action type'),

  query('adminId')
    .optional()
    .isUUID()
    .withMessage('Invalid admin ID format'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .toDate(),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .toDate()
    .custom((value, { req }) => {
      if (req.query.startDate && value < new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  query('resourceType')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Resource type must not exceed 50 characters'),

  query('resourceId')
    .optional()
    .isUUID()
    .withMessage('Invalid resource ID format'),

  checkValidationErrors,
];

// ============================================================================
// ANALYTICS QUERY VALIDATION
// ============================================================================

/**
 * Analytics Date Range Validator
 *
 * Validates date range parameters for analytics queries
 * - Optional start and end dates
 * - Ensures end date is after start date
 *
 * @type {Array} Array of validation middleware
 */
const validateAnalyticsDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .toDate(),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .toDate()
    .custom((value, { req }) => {
      if (req.query.startDate && value < new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  query('granularity')
    .optional()
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('Granularity must be day, week, month, or year'),

  checkValidationErrors,
];

// ============================================================================
// ADMIN ACTION VALIDATION
// ============================================================================

/**
 * Admin Action Logger Validator
 *
 * Validates admin action logging requests
 * Used for manual logging of admin actions
 *
 * @type {Array} Array of validation middleware
 */
const validateAdminAction = [
  body('action')
    .notEmpty()
    .withMessage('Action is required')
    .isIn([
      'CREATE_USER',
      'UPDATE_USER',
      'DELETE_USER',
      'APPROVE_USER',
      'REJECT_USER',
      'SUSPEND_USER',
      'CREATE_ADMIN',
      'DELETE_ADMIN',
      'CHANGE_ROLE',
      'CREATE_NEWSLETTER',
      'PUBLISH_NEWSLETTER',
      'DELETE_NEWSLETTER',
      'CREATE_PROJECT',
      'UPDATE_PROJECT',
      'DELETE_PROJECT',
      'UPDATE_CONTENT',
      'LOGIN',
      'LOGOUT',
    ])
    .withMessage('Invalid action type'),

  body('resourceType')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Resource type must not exceed 50 characters'),

  body('resourceId')
    .optional({ checkFalsy: true })
    .isUUID()
    .withMessage('Resource ID must be a valid UUID'),

  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  checkValidationErrors,
];

// ============================================================================
// REPORT GENERATION VALIDATION
// ============================================================================

/**
 * Report Generation Validator
 *
 * Validates report generation requests
 * - Report type validation
 * - Date range validation
 * - Format validation
 *
 * @type {Array} Array of validation middleware
 */
const validateReportGeneration = [
  body('reportType')
    .notEmpty()
    .withMessage('Report type is required')
    .isIn(['user', 'admin', 'audit', 'content', 'newsletter', 'analytics'])
    .withMessage('Invalid report type'),

  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .toDate(),

  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .toDate()
    .custom((value, { req }) => {
      if (value < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('format')
    .optional()
    .isIn(['json', 'csv', 'pdf'])
    .withMessage('Format must be json, csv, or pdf'),

  body('filters')
    .optional()
    .isObject()
    .withMessage('Filters must be an object'),

  checkValidationErrors,
];

// ============================================================================
// SYSTEM SETTINGS VALIDATION
// ============================================================================

/**
 * System Settings Update Validator
 *
 * Validates system settings update requests
 * Used for SUPER_ADMIN to modify system configuration
 *
 * @type {Array} Array of validation middleware
 */
const validateSystemSettings = [
  body('setting')
    .notEmpty()
    .withMessage('Setting name is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Setting name must not exceed 100 characters')
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Setting name can only contain letters, numbers, underscores, dots, and hyphens'),

  body('value')
    .notEmpty()
    .withMessage('Setting value is required'),

  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  checkValidationErrors,
];

// ============================================================================
// NOTIFICATION VALIDATION
// ============================================================================

/**
 * Admin Notification Validator
 *
 * Validates admin notification sending requests
 * - Recipient validation
 * - Message content validation
 *
 * @type {Array} Array of validation middleware
 */
const validateAdminNotification = [
  body('recipients')
    .notEmpty()
    .withMessage('Recipients are required')
    .isArray({ min: 1 })
    .withMessage('Recipients must be an array with at least one recipient'),

  body('recipients.*')
    .isUUID()
    .withMessage('Each recipient must be a valid user ID'),

  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject must be between 1 and 200 characters'),

  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),

  checkValidationErrors,
];

// ============================================================================
// DASHBOARD FILTER VALIDATION
// ============================================================================

/**
 * Dashboard Filter Validator
 *
 * Validates dashboard filter parameters
 * Used for filtering dashboard statistics
 *
 * @type {Array} Array of validation middleware
 */
const validateDashboardFilter = [
  query('timeRange')
    .optional()
    .isIn(['today', 'week', 'month', 'quarter', 'year', 'custom'])
    .withMessage('Time range must be today, week, month, quarter, year, or custom'),

  query('role')
    .optional()
    .isIn(['USER', 'MEMBER', 'MEMBER_ADMIN', 'CONTENT_ADMIN', 'NEWSLETTER_ADMIN', 'SUPER_ADMIN'])
    .withMessage('Invalid role filter'),

  query('status')
    .optional()
    .isIn(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'])
    .withMessage('Invalid status filter'),

  query('customStartDate')
    .optional()
    .isISO8601()
    .withMessage('Custom start date must be a valid ISO 8601 date')
    .toDate(),

  query('customEndDate')
    .optional()
    .isISO8601()
    .withMessage('Custom end date must be a valid ISO 8601 date')
    .toDate()
    .custom((value, { req }) => {
      if (req.query.customStartDate && value < new Date(req.query.customStartDate)) {
        throw new Error('Custom end date must be after custom start date');
      }
      return true;
    }),

  checkValidationErrors,
];

// ============================================================================
// EXPORT VALIDATORS
// ============================================================================

module.exports = {
  validateAuditLogQuery,
  validateAnalyticsDateRange,
  validateAdminAction,
  validateReportGeneration,
  validateSystemSettings,
  validateAdminNotification,
  validateDashboardFilter,
};

// ============================================================================
// END OF ADMIN OPERATIONS VALIDATORS
// ============================================================================
