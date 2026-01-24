// ============================================================================
// OREPA Backend - Member Management Routes
// ============================================================================
//
// Purpose:
//   Defines API endpoints for member management
//   MEMBER_ADMIN and SUPER_ADMIN can approve/reject user registrations
//
// Routes:
//   GET  /api/admin/member-management/pending       - Get pending registrations
//   POST /api/admin/member-management/:userId/approve - Approve user
//   POST /api/admin/member-management/:userId/reject  - Reject user
//   GET  /api/admin/member-management/stats         - Get member statistics
//   GET  /api/admin/member-management/members       - Get all approved members
//
// ============================================================================

const express = require('express');
const router = express.Router();

// Controllers
const {
  getPendingRegistrations,
  approveUser,
  rejectUser,
  getMemberStats,
  getAllMembers,
  batchAction,
  getMemberDetails,
  updateMember,
} = require('../../controllers/admin/memberManagementController');

// Middleware
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/authorize');
const { logAdminAction } = require('../../middleware/auditLog');

// Validators
const {
  validateUserListQuery,
  validateUserIdParam,
  validateUserRejection,
  validateMemberStatsQuery,
} = require('../../validators/userValidator');

// ============================================================================
// PROTECTED ROUTES (MEMBER_ADMIN or SUPER_ADMIN Access Required)
// ============================================================================

/**
 * @route   GET /api/admin/member-management/pending
 * @desc    Get all pending user registrations
 * @access  Protected (MEMBER_ADMIN, SUPER_ADMIN)
 *
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 *
 * @returns {Object} Paginated pending users
 *
 * @example
 *   GET /api/admin/member-management/pending?page=1&limit=20
 *   Headers: { "Authorization": "Bearer <token>" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "data": {
 *       "users": [...pending users...],
 *       "pagination": {
 *         "currentPage": 1,
 *         "totalPages": 2,
 *         "totalPending": 25,
 *         "limit": 20,
 *         "hasNextPage": true,
 *         "hasPrevPage": false
 *       }
 *     }
 *   }
 */
router.get('/pending', authenticate, requireRole('MEMBER_ADMIN', 'SUPER_ADMIN'), validateUserListQuery, getPendingRegistrations);

/**
 * @route   POST /api/admin/member-management/:userId/approve
 * @desc    Approve pending user registration
 * @access  Protected (MEMBER_ADMIN, SUPER_ADMIN)
 *
 * @param {string} userId - User ID to approve
 *
 * @returns {Object} Approved user info
 *
 * @example
 *   POST /api/admin/member-management/60f1b2a3c4d5e6f7g8h9i0j1/approve
 *   Headers: { "Authorization": "Bearer <token>" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "message": "User registration approved successfully",
 *     "user": {
 *       "id": "60f1b2...",
 *       "email": "user@example.com",
 *       "firstName": "John",
 *       "lastName": "Doe",
 *       "status": "APPROVED",
 *       "approvedBy": "admin@orepa.org",
 *       "approvalDate": "2024-01-12T10:30:00.000Z"
 *     }
 *   }
 */
router.post('/:userId/approve', authenticate, requireRole('MEMBER_ADMIN', 'SUPER_ADMIN'), validateUserIdParam, logAdminAction('APPROVE_USER'), approveUser);

/**
 * @route   POST /api/admin/member-management/:userId/reject
 * @desc    Reject pending user registration
 * @access  Protected (MEMBER_ADMIN, SUPER_ADMIN)
 *
 * @param {string} userId - User ID to reject
 * @body {string} reason - Rejection reason (optional)
 *
 * @returns {Object} Success message
 *
 * @example
 *   POST /api/admin/member-management/60f1b2a3c4d5e6f7g8h9i0j1/reject
 *   Headers: { "Authorization": "Bearer <token>" }
 *   Body: { "reason": "Incomplete information" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "message": "User registration rejected",
 *     "user": {
 *       "id": "60f1b2...",
 *       "email": "user@example.com",
 *       "status": "REJECTED"
 *     }
 *   }
 */
router.post('/:userId/reject', authenticate, requireRole('MEMBER_ADMIN', 'SUPER_ADMIN'), validateUserIdParam, validateUserRejection, logAdminAction('REJECT_USER'), rejectUser);

/**
 * @route   GET /api/admin/member-management/stats
 * @desc    Get member statistics for dashboard
 * @access  Protected (MEMBER_ADMIN, SUPER_ADMIN)
 *
 * @returns {Object} Member statistics
 *
 * @example
 *   GET /api/admin/member-management/stats
 *   Headers: { "Authorization": "Bearer <token>" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "stats": {
 *       "totalMembers": 150,
 *       "totalUsers": 175,
 *       "totalAdmins": 5,
 *       "pendingApprovals": 25,
 *       "approvedToday": 3,
 *       "rejectedThisWeek": 2,
 *       "newRegistrationsThisMonth": 40,
 *       "activeMembers": 120,
 *       "recentPending": [...]
 *     }
 *   }
 */
router.get('/stats', authenticate, requireRole('MEMBER_ADMIN', 'SUPER_ADMIN'), validateMemberStatsQuery, getMemberStats);

/**
 * @route   GET /api/admin/member-management/members
 * @desc    Get all approved members
 * @access  Protected (MEMBER_ADMIN, SUPER_ADMIN)
 *
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {string} search - Search by name or email
 *
 * @returns {Object} Paginated members list
 *
 * @example
 *   GET /api/admin/member-management/members?page=1&limit=20&search=john
 *   Headers: { "Authorization": "Bearer <token>" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "data": {
 *       "members": [...approved members...],
 *       "pagination": {
 *         "currentPage": 1,
 *         "totalPages": 8,
 *         "totalMembers": 150,
 *         "limit": 20,
 *         "hasNextPage": true,
 *         "hasPrevPage": false
 *       }
 *     }
 *   }
 */
router.get('/members', authenticate, requireRole('MEMBER_ADMIN', 'SUPER_ADMIN'), validateUserListQuery, getAllMembers);

/**
 * @route   GET /api/admin/member-management/members/:userId
 * @desc    Get full details of a specific member
 * @access  Protected (MEMBER_ADMIN, SUPER_ADMIN)
 */
router.get('/members/:userId', authenticate, requireRole('MEMBER_ADMIN', 'SUPER_ADMIN'), validateUserIdParam, getMemberDetails);

/**
 * @route   PUT /api/admin/member-management/members/:userId
 * @desc    Update member details and status
 * @access  Protected (MEMBER_ADMIN, SUPER_ADMIN)
 */
router.put('/members/:userId', authenticate, requireRole('MEMBER_ADMIN', 'SUPER_ADMIN'), validateUserIdParam, updateMember);

router.post('/batch', authenticate, requireRole('MEMBER_ADMIN', 'SUPER_ADMIN'), batchAction);

// ============================================================================
// EXPORT ROUTER
// ============================================================================

module.exports = router;

// ============================================================================
// END OF MEMBER MANAGEMENT ROUTES
// ============================================================================
