// ============================================================================
// OREPA Backend - Admin Authentication Routes
// ============================================================================
//
// Purpose:
//   Defines admin authentication API endpoints
//   Separate from regular user authentication for enhanced security
//
// Routes:
//   POST   /api/admin/login          - Admin login
//   POST   /api/admin/logout         - Admin logout
//   GET    /api/admin/verify         - Verify admin token
//   GET    /api/admin/profile        - Get admin profile
//   PUT    /api/admin/profile        - Update admin profile
//   PUT    /api/admin/change-password - Change password
//
// ============================================================================

const express = require('express');
const router = express.Router();

// Controllers
const {
  adminLogin,
  adminLogout,
  verifyAdminToken,
  getAdminProfile,
  updateAdminProfile,
  changePassword,
} = require('../../controllers/admin/authController');

// Middleware
const { authenticate } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/authorize');
const { adminLoginLimiter } = require('../../middleware/rateLimiter');

// Validators
const { validateLogin, validatePasswordChange, validateProfileUpdate } = require('../../validators/authValidator');

// ============================================================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================================================

/**
 * @route   POST /api/admin/login
 * @desc    Admin login endpoint
 * @access  Public
 * @rateLimit 5 attempts per 15 minutes
 *
 * @body {string} email - Admin email address
 * @body {string} password - Admin password
 *
 * @returns {Object} Token and user info
 *
 * @example
 *   POST /api/admin/login
 *   Body: { "email": "admin@orepa.org", "password": "securepassword" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "message": "Login successful",
 *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "user": {
 *       "id": "60f1b2...",
 *       "email": "admin@orepa.org",
 *       "firstName": "John",
 *       "lastName": "Doe",
 *       "fullName": "John Doe",
 *       "role": "SUPER_ADMIN",
 *       "isAdmin": true
 *     }
 *   }
 */
router.post('/login', adminLoginLimiter, validateLogin, adminLogin);

// ============================================================================
// PROTECTED ROUTES (Authentication Required)
// ============================================================================

/**
 * @route   POST /api/admin/logout
 * @desc    Admin logout endpoint (logs action for audit trail)
 * @access  Protected (Admin only)
 *
 * @returns {Object} Success message
 *
 * @example
 *   POST /api/admin/logout
 *   Headers: { "Authorization": "Bearer <token>" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "message": "Logged out successfully"
 *   }
 */
router.post('/logout', authenticate, requireAdmin, adminLogout);

/**
 * @route   GET /api/admin/verify
 * @desc    Verify admin token and get user info
 * @access  Protected (Admin only)
 *
 * @returns {Object} User info with permissions
 *
 * @example
 *   GET /api/admin/verify
 *   Headers: { "Authorization": "Bearer <token>" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "user": {
 *       "id": "60f1b2...",
 *       "email": "admin@orepa.org",
 *       "firstName": "John",
 *       "lastName": "Doe",
 *       "fullName": "John Doe",
 *       "role": "SUPER_ADMIN",
 *       "isAdmin": true,
 *       "permissions": ["manage_all_users", "create_admin", ...]
 *     }
 *   }
 */
router.get('/verify', authenticate, requireAdmin, verifyAdminToken);

/**
 * @route   GET /api/admin/profile
 * @desc    Get detailed admin profile
 * @access  Protected (Admin only)
 *
 * @returns {Object} Full user profile
 *
 * @example
 *   GET /api/admin/profile
 *   Headers: { "Authorization": "Bearer <token>" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "user": { ... full user object ... }
 *   }
 */
router.get('/profile', authenticate, requireAdmin, getAdminProfile);

/**
 * @route   PUT /api/admin/profile
 * @desc    Update admin profile
 * @access  Protected (Admin only)
 *
 * @body {string} firstName - First name (optional)
 * @body {string} lastName - Last name (optional)
 * @body {string} phone - Phone number (optional)
 *
 * @returns {Object} Updated user info
 *
 * @example
 *   PUT /api/admin/profile
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
router.put('/profile', authenticate, requireAdmin, validateProfileUpdate, updateAdminProfile);

/**
 * @route   PUT /api/admin/change-password
 * @desc    Change admin password
 * @access  Protected (Admin only)
 *
 * @body {string} currentPassword - Current password
 * @body {string} newPassword - New password (min 6 characters)
 *
 * @returns {Object} Success message
 *
 * @example
 *   PUT /api/admin/change-password
 *   Headers: { "Authorization": "Bearer <token>" }
 *   Body: {
 *     "currentPassword": "oldpassword123",
 *     "newPassword": "newpassword456"
 *   }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "message": "Password changed successfully"
 *   }
 */
router.put('/change-password', authenticate, requireAdmin, validatePasswordChange, changePassword);

// ============================================================================
// EXPORT ROUTER
// ============================================================================

module.exports = router;

// ============================================================================
// END OF ADMIN AUTHENTICATION ROUTES
// ============================================================================
