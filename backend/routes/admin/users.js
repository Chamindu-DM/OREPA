// ============================================================================
// OREPA Backend - Admin User Management Routes
// ============================================================================
//
// Purpose:
//   Defines API endpoints for admin user management
//   SUPER_ADMIN can create admins, change roles, delete users
//
// Routes:
//   GET    /api/admin/users              - Get all users (paginated)
//   GET    /api/admin/users/:id          - Get single user
//   POST   /api/admin/users/create-admin - Create admin user (SUPER_ADMIN only)
//   PATCH  /api/admin/users/:id/role     - Update user role (SUPER_ADMIN only)
//   PATCH  /api/admin/users/:id/status   - Update user status
//   DELETE /api/admin/users/:id          - Delete user (SUPER_ADMIN only)
//
// ============================================================================

const express = require('express');
const router = express.Router();

// Controllers
const {
  getAllUsers,
  getUserById,
  createAdmin,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  updateUser,
} = require('../../controllers/admin/userManagementController');

// Middleware
const { authenticate } = require('../../middleware/auth');
const { requireAdmin, requireSuperAdmin } = require('../../middleware/authorize');
const { logAdminAction } = require('../../middleware/auditLog');

// Validators
const {
  validateCreateAdmin,
  validateRoleUpdate,
  validateStatusUpdate,
  validateUserListQuery,
  validateUserId,
} = require('../../validators/userValidator');

// ============================================================================
// PROTECTED ROUTES (Admin Access Required)
// ============================================================================

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and filtering
 * @access  Protected (Admin only)
 *
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {string} role - Filter by role
 * @query {string} status - Filter by status
 * @query {string} search - Search by name or email
 *
 * @returns {Object} Paginated users list
 *
 * @example
 *   GET /api/admin/users?page=1&limit=20&role=USER&status=PENDING
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "data": {
 *       "users": [...],
 *       "pagination": {
 *         "currentPage": 1,
 *         "totalPages": 5,
 *         "totalUsers": 100,
 *         "limit": 20,
 *         "hasNextPage": true,
 *         "hasPrevPage": false
 *       }
 *     }
 *   }
 */
router.get('/', authenticate, requireAdmin, validateUserListQuery, getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get single user details
 * @access  Protected (Admin only)
 *
 * @param {string} id - User ID
 *
 * @returns {Object} User details
 *
 * @example
 *   GET /api/admin/users/60f1b2a3c4d5e6f7g8h9i0j1
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "user": { ... full user object ... }
 *   }
 */
router.get('/:id', authenticate, requireAdmin, validateUserId, getUserById);

/**
 * @route   POST /api/admin/users/create-admin
 * @desc    Create new admin user
 * @access  Protected (SUPER_ADMIN only)
 *
 * @body {string} email - Admin email (required)
 * @body {string} password - Admin password (required, min 6 chars)
 * @body {string} firstName - First name (required)
 * @body {string} lastName - Last name (required)
 * @body {string} role - Admin role (required): MEMBER_ADMIN, CONTENT_ADMIN, NEWSLETTER_ADMIN, SUPER_ADMIN
 * @body {string} phone - Phone number (optional)
 *
 * @returns {Object} Created admin user
 *
 * @example
 *   POST /api/admin/users/create-admin
 *   Headers: { "Authorization": "Bearer <token>" }
 *   Body: {
 *     "email": "newadmin@orepa.org",
 *     "password": "securepass123",
 *     "firstName": "Jane",
 *     "lastName": "Doe",
 *     "role": "CONTENT_ADMIN",
 *     "phone": "+1234567890"
 *   }
 *
 *   Response (201 Created):
 *   {
 *     "success": true,
 *     "message": "Admin user created successfully",
 *     "user": {
 *       "id": "60f1b2...",
 *       "email": "newadmin@orepa.org",
 *       "firstName": "Jane",
 *       "lastName": "Doe",
 *       "fullName": "Jane Doe",
 *       "role": "CONTENT_ADMIN",
 *       "isAdmin": true
 *     }
 *   }
 */
router.post('/create-admin', authenticate, requireSuperAdmin, validateCreateAdmin, logAdminAction('CREATE_ADMIN'), createAdmin);

/**
 * @route   PATCH /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Protected (SUPER_ADMIN only)
 *
 * @param {string} id - User ID
 * @body {string} role - New role: USER, MEMBER, MEMBER_ADMIN, CONTENT_ADMIN, NEWSLETTER_ADMIN, SUPER_ADMIN
 *
 * @returns {Object} Updated user
 *
 * @example
 *   PATCH /api/admin/users/60f1b2a3c4d5e6f7g8h9i0j1/role
 *   Headers: { "Authorization": "Bearer <token>" }
 *   Body: { "role": "MEMBER_ADMIN" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "message": "User role updated successfully",
 *     "user": {
 *       "id": "60f1b2...",
 *       "email": "user@example.com",
 *       "firstName": "John",
 *       "lastName": "Doe",
 *       "role": "MEMBER_ADMIN",
 *       "isAdmin": true
 *     }
 *   }
 */
router.patch('/:id/role', authenticate, requireSuperAdmin, validateUserId, validateRoleUpdate, logAdminAction('CHANGE_ROLE'), updateUserRole);

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Update user status (suspend/reactivate)
 * @access  Protected (Admin only)
 *
 * @param {string} id - User ID
 * @body {string} status - New status: PENDING, APPROVED, REJECTED, SUSPENDED
 *
 * @returns {Object} Updated user
 *
 * @example
 *   PATCH /api/admin/users/60f1b2a3c4d5e6f7g8h9i0j1/status
 *   Headers: { "Authorization": "Bearer <token>" }
 *   Body: { "status": "SUSPENDED" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "message": "User status updated successfully",
 *     "user": {
 *       "id": "60f1b2...",
 *       "email": "user@example.com",
 *       "status": "SUSPENDED"
 *     }
 *   }
 */
router.patch('/:id/status', authenticate, requireAdmin, validateUserId, validateStatusUpdate, logAdminAction('SUSPEND_USER'), updateUserStatus);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user details
 * @access  Protected (Admin only)
 *
 * @param {string} id - User ID
 * @body {string} firstName - First name (optional)
 * @body {string} lastName - Last name (optional)
 * @body {number} batch - Batch year (optional)
 * @body {string} university - University (optional)
 * @body {string} engineeringField - Field (optional)
 * @body {string} orepaSCId - SC ID (optional)
 * @body {string} role - Role (Super Admin only can change role here)
 *
 * @returns {Object} Updated user
 */
router.put('/:id', authenticate, requireAdmin, validateUserId, logAdminAction('UPDATE_USER'), updateUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user account
 * @access  Protected (SUPER_ADMIN only)
 *
 * @param {string} id - User ID
 *
 * @returns {Object} Success message
 *
 * @example
 *   DELETE /api/admin/users/60f1b2a3c4d5e6f7g8h9i0j1
 *   Headers: { "Authorization": "Bearer <token>" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "message": "User deleted successfully"
 *   }
 */
router.delete('/:id', authenticate, requireSuperAdmin, validateUserId, logAdminAction('DELETE_USER'), deleteUser);

// ============================================================================
// EXPORT ROUTER
// ============================================================================

module.exports = router;

// ============================================================================
// END OF ADMIN USER MANAGEMENT ROUTES
// ============================================================================
