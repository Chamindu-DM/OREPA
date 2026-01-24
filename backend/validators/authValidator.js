// ============================================================================
// OREPA Backend - Authentication Validators
// ============================================================================
//
// Purpose:
//   Input validation middleware for authentication endpoints
//   Validates registration, login, and password-related requests
//
// Features:
//   - Email format validation
//   - Password strength validation
//   - Required field validation
//   - Input sanitization
//
// Dependencies:
//   - express-validator: Validation and sanitization library
//
// ============================================================================

const { body, validationResult } = require('express-validator');

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
// REGISTRATION VALIDATION
// ============================================================================

/**
 * Registration Validator
 *
 * Validates user registration input
 * - Email must be valid format
 * - Password must be at least 6 characters
 * - First name and last name required
 * - Optional phone number format validation
 *
 * @type {Array} Array of validation middleware
 */
const validateRegistration = [
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
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),

  body('nameWithInitials')
    .trim()
    .notEmpty()
    .withMessage('Name with initials is required')
    .isLength({ max: 100 })
    .withMessage('Name with initials cannot exceed 100 characters'),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),

  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .toDate(),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    .withMessage('Please provide a valid phone number'),

  body('batch')
    .notEmpty()
    .withMessage('Batch of school is required')
    .isInt({ min: 1900, max: new Date().getFullYear() + 10 })
    .withMessage('Please provide a valid batch year')
    .toInt(),

  body('admissionNumber')
    .trim()
    .notEmpty()
    .withMessage('Admission number is required'),

  body('alShy')
    .trim()
    .notEmpty()
    .withMessage('A/L shy is required')
    .isIn(['1st shy', '2nd shy', '3rd shy'])
    .withMessage('Invalid A/L shy value'),

  body('university')
    .trim()
    .notEmpty()
    .withMessage('University is required'),

  body('faculty')
    .trim()
    .notEmpty()
    .withMessage('Faculty is required'),

  body('universityLevel')
    .trim()
    .notEmpty()
    .withMessage('University level is required')
    .isIn(['First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Graduated', 'Other'])
    .withMessage('Invalid university level'),

  body('engineeringField')
    .trim()
    .notEmpty()
    .withMessage('Engineering field is required'),

  body('country')
    .optional()
    .trim(),

  // Confirmations are handled on frontend, but good to ensure matches
  body('confirmPassword')
    .optional()
    .custom((value, { req }) => {
        if (value && value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    }),

  checkValidationErrors,
];

// ============================================================================
// LOGIN VALIDATION
// ============================================================================

/**
 * Login Validator
 *
 * Validates user login input
 * - Email must be valid format
 * - Password is required (no strength check on login)
 *
 * @type {Array} Array of validation middleware
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),

  body('password').notEmpty().withMessage('Password is required'),

  checkValidationErrors,
];

// ============================================================================
// PASSWORD CHANGE VALIDATION
// ============================================================================

/**
 * Password Change Validator
 *
 * Validates password change requests
 * - Current password required
 * - New password must meet strength requirements
 * - New password must be different from current
 *
 * @type {Array} Array of validation middleware
 */
const validatePasswordChange = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),

  checkValidationErrors,
];

// ============================================================================
// PROFILE UPDATE VALIDATION
// ============================================================================

/**
 * Profile Update Validator
 *
 * Validates profile update requests
 * - First name and last name optional but must meet requirements if provided
 * - Phone number format validation if provided
 *
 * @type {Array} Array of validation middleware
 */
const validateProfileUpdate = [
  body('firstName')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  body('lastName')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Please provide a valid phone number'),

  checkValidationErrors,
];

// ============================================================================
// EMAIL VALIDATION (Standalone)
// ============================================================================

/**
 * Email Validator
 *
 * Validates email format
 * Used for password reset requests, email verification, etc.
 *
 * @type {Array} Array of validation middleware
 */
const validateEmail = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),

  checkValidationErrors,
];

// ============================================================================
// EXPORT VALIDATORS
// ============================================================================

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
  validateEmail,
};

// ============================================================================
// END OF AUTHENTICATION VALIDATORS
// ============================================================================
