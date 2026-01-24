// ============================================================================
// OREPA Backend - User Authentication Routes
// ============================================================================
//
// Purpose:
//   Defines regular user authentication API endpoints
//   Separate from admin authentication
//
// Routes:
//   POST   /api/auth/register    - User self-registration
//   POST   /api/auth/login       - User login
//   POST   /api/auth/logout      - User logout
//   GET    /api/auth/profile     - Get user profile
//   PUT    /api/auth/profile     - Update user profile
//
// ============================================================================

const express = require('express');
const router = express.Router();

// Controllers
const { register, login, logout, getProfile, updateProfile, forgotPassword, resetPassword } = require('../controllers/authController');

// Middleware
const { authenticate } = require('../middleware/auth');
const { userLoginLimiter, registrationLimiter } = require('../middleware/rateLimiter');

// Validators
const { validateRegistration, validateLogin, validateProfileUpdate } = require('../validators/authValidator');

// ============================================================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================================================

/**
 * @route   POST /api/auth/register
 * @desc    User self-registration (creates account with PENDING status)
 * @access  Public
 * @rateLimit 3 attempts per hour
 *
 * @body {string} email - User email address (required)
 * @body {string} password - User password (required, min 6 chars)
 * @body {string} firstName - First name (required)
 * @body {string} lastName - Last name (required)
 * @body {string} phone - Phone number (optional)
 * @body {number} graduationYear - Graduation year (optional)
 * @body {string} engineeringField - Engineering field (optional)
 *
 * @returns {Object} Success message and user info
 *
 * @example
 *   POST /api/auth/register
 *   Body: {
 *     "email": "john@example.com",
 *     "password": "securepass123",
 *     "firstName": "John",
 *     "lastName": "Doe",
 *     "phone": "+1234567890",
 *     "graduationYear": 2020
 *   }
 *
 *   Response (201 Created):
 *   {
 *     "success": true,
 *     "message": "Registration successful! Your account is pending approval...",
 *     "user": {
 *       "id": "60f1b2...",
 *       "email": "john@example.com",
 *       "firstName": "John",
 *       "lastName": "Doe",
 *       "status": "PENDING"
 *     }
 *   }
 */
router.post('/register', registrationLimiter, validateRegistration, register);

/**
 * @route   POST /api/auth/login
 * @desc    User login (approved users only, admin must use /admin/login)
 * @access  Public
 * @rateLimit 5 attempts per 15 minutes
 *
 * @body {string} email - User email address
 * @body {string} password - User password
 *
 * @returns {Object} Token and user info
 *
 * @example
 *   POST /api/auth/login
 *   Body: { "email": "john@example.com", "password": "securepass123" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "message": "Login successful",
 *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "user": {
 *       "id": "60f1b2...",
 *       "email": "john@example.com",
 *       "firstName": "John",
 *       "lastName": "Doe",
 *       "fullName": "John Doe",
 *       "role": "USER"
 *     }
 *   }
 */
router.post('/login', userLoginLimiter, validateLogin, login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   PUT /api/auth/reset-password/:resetToken
 * @desc    Reset password
 * @access  Public
 */
router.put('/reset-password/:resetToken', resetPassword);

// ============================================================================
// PROTECTED ROUTES (Authentication Required)
// ============================================================================

/**
 * @route   POST /api/auth/logout
 * @desc    User logout
 * @access  Protected (Authenticated user)
 *
 * @returns {Object} Success message
 *
 * @example
 *   POST /api/auth/logout
 *   Headers: { "Authorization": "Bearer <token>" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "message": "Logged out successfully"
 *   }
 */
router.post('/logout', authenticate, logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Get authenticated user's profile
 * @access  Protected (Authenticated user)
 *
 * @returns {Object} User profile
 *
 * @example
 *   GET /api/auth/profile
 *   Headers: { "Authorization": "Bearer <token>" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "user": { ... full user object ... }
 *   }
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update authenticated user's profile
 * @access  Protected (Authenticated user)
 *
 * @body {string} firstName - First name (optional)
 * @body {string} lastName - Last name (optional)
 * @body {string} phone - Phone number (optional)
 * @body {number} graduationYear - Graduation year (optional)
 * @body {string} engineeringField - Engineering field (optional)
 *
 * @returns {Object} Updated user info
 *
 * @example
 *   PUT /api/auth/profile
 *   Headers: { "Authorization": "Bearer <token>" }
 *   Body: { "firstName": "Jane", "phone": "+1234567890" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "message": "Profile updated successfully",
 *     "user": { ... updated user object ... }
 *   }
 */
router.put('/profile', authenticate, validateProfileUpdate, updateProfile);

// ============================================================================
// EXPORT ROUTER
// ============================================================================

module.exports = router;

// ============================================================================
// END OF USER AUTHENTICATION ROUTES
// ============================================================================
