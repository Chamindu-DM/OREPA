// ============================================================================
// OREPA Backend - User Management Validators
// ============================================================================
//
// Purpose:
//   Input validation middleware for user management endpoints
//   Validates admin operations on user accounts
//
// Features:
//   - User creation validation
//   - Role change validation
//   - Status update validation
//   - User search/filter validation
//
// Dependencies:
//   - express-validator: Validation and sanitization library
//
// ============================================================================

const { body, query, param, validationResult } = require('express-validator');

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
// ADMIN CREATION VALIDATION
// ============================================================================

/**
 * Create Admin Validator
 *
 * Validates admin user creation
 * - All registration fields required
 * - Role must be valid admin role
 * - Cannot create regular USER or MEMBER accounts
 *
 * @type {Array} Array of validation middleware
 */
const validateCreateAdmin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['MEMBER_ADMIN', 'CONTENT_ADMIN', 'NEWSLETTER_ADMIN', 'SUPER_ADMIN'])
    .withMessage('Invalid admin role. Must be MEMBER_ADMIN, CONTENT_ADMIN, NEWSLETTER_ADMIN, or SUPER_ADMIN'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Please provide a valid phone number'),

  checkValidationErrors,
];

// ============================================================================
// ROLE UPDATE VALIDATION
// ============================================================================

/**
 * Update User Role Validator
 *
 * Validates role change requests
 * - Role must be one of the valid roles
 * - Prevents invalid role transitions
 *
 * @type {Array} Array of validation middleware
 */
const validateRoleUpdate = [
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['USER', 'MEMBER', 'MEMBER_ADMIN', 'CONTENT_ADMIN', 'NEWSLETTER_ADMIN', 'SUPER_ADMIN'])
    .withMessage('Invalid role. Must be USER, MEMBER, MEMBER_ADMIN, CONTENT_ADMIN, NEWSLETTER_ADMIN, or SUPER_ADMIN'),

  checkValidationErrors,
];

// ============================================================================
// STATUS UPDATE VALIDATION
// ============================================================================

/**
 * Update User Status Validator
 *
 * Validates status change requests
 * - Status must be one of the valid statuses
 *
 * @type {Array} Array of validation middleware
 */
const validateStatusUpdate = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'])
    .withMessage('Invalid status. Must be PENDING, APPROVED, REJECTED, or SUSPENDED'),

  body('reason')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters'),

  checkValidationErrors,
];

// ============================================================================
// USER REJECTION VALIDATION
// ============================================================================

/**
 * Reject User Validator
 *
 * Validates user rejection requests
 * - Optional reason field with max length
 *
 * @type {Array} Array of validation middleware
 */
const validateUserRejection = [
  body('reason')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Rejection reason must not exceed 500 characters'),

  checkValidationErrors,
];

// ============================================================================
// USER LIST QUERY VALIDATION
// ============================================================================

/**
 * Get Users List Validator
 *
 * Validates pagination and filter parameters
 * - Page and limit must be positive integers
 * - Role and status must be valid values if provided
 * - Search query sanitization
 *
 * @type {Array} Array of validation middleware
 */
const validateUserListQuery = [
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

  query('role')
    .optional()
    .isIn(['USER', 'MEMBER', 'MEMBER_ADMIN', 'CONTENT_ADMIN', 'NEWSLETTER_ADMIN', 'SUPER_ADMIN'])
    .withMessage('Invalid role filter'),

  query('status')
    .optional()
    .isIn(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'])
    .withMessage('Invalid status filter'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must not exceed 100 characters'),

  checkValidationErrors,
];

// ============================================================================
// USER ID PARAMETER VALIDATION
// ============================================================================

/**
 * User ID Validator
 *
 * Validates MongoDB ObjectId format for user ID parameter
 * Ensures ID is a valid 24-character hex string
 *
 * @type {Array} Array of validation middleware
 */
const validateUserId = [
  param('id')
    .notEmpty()
    .withMessage('User ID is required')
    .isUUID()
    .withMessage('Invalid user ID format'),

  checkValidationErrors,
];

/**
 * User ID in URL Validator (for routes with :userId param)
 *
 * @type {Array} Array of validation middleware
 */
const validateUserIdParam = [
  param('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isUUID()
    .withMessage('Invalid user ID format'),

  checkValidationErrors,
];

// ============================================================================
// MEMBER STATS QUERY VALIDATION
// ============================================================================

/**
 * Member Statistics Query Validator
 *
 * Validates query parameters for member statistics
 * - Optional date range parameters
 *
 * @type {Array} Array of validation middleware
 */
const validateMemberStatsQuery = [
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

  checkValidationErrors,
];

// ============================================================================
// BULK OPERATIONS VALIDATION
// ============================================================================

/**
 * Bulk User Update Validator
 *
 * Validates bulk user operations
 * - User IDs array must contain valid MongoDB IDs
 * - Action must be specified
 *
 * @type {Array} Array of validation middleware
 */
const validateBulkUserUpdate = [
  body('userIds')
    .notEmpty()
    .withMessage('User IDs are required')
    .isArray({ min: 1, max: 50 })
    .withMessage('User IDs must be an array with 1-50 items'),

  body('userIds.*')
    .isUUID()
    .withMessage('Each user ID must be a valid UUID'),

  body('action')
    .notEmpty()
    .withMessage('Action is required')
    .isIn(['approve', 'reject', 'suspend', 'reactivate', 'delete'])
    .withMessage('Invalid action. Must be approve, reject, suspend, reactivate, or delete'),

  body('reason')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters'),

  checkValidationErrors,
];

// ============================================================================
// EXPORT VALIDATORS
// ============================================================================

module.exports = {
  validateCreateAdmin,
  validateRoleUpdate,
  validateStatusUpdate,
  validateUserRejection,
  validateUserListQuery,
  validateUserId,
  validateUserIdParam,
  validateMemberStatsQuery,
  validateBulkUserUpdate,
};

// ============================================================================
// END OF USER MANAGEMENT VALIDATORS
// ============================================================================
