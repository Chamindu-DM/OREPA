// ============================================================================
// OREPA Backend - Admin Analytics Routes
// ============================================================================
//
// Purpose:
//   Defines API endpoints for admin analytics and statistics
//   Provides data for various admin dashboards
//
// Routes:
//   GET /api/admin/analytics/overview       - Dashboard overview statistics
//   GET /api/admin/analytics/users          - User analytics
//   GET /api/admin/analytics/content        - Content analytics
//   GET /api/admin/audit-logs               - Audit logs with filtering
//   GET /api/admin/audit-logs/stats         - Audit log statistics
//
// ============================================================================

const express = require('express');
const router = express.Router();

// Controllers
const {
  getDashboardOverview,
  getUserAnalytics,
  getContentAnalytics,
  getAuditLogs,
  getAuditLogStats,
} = require('../../controllers/admin/analyticsController');

// Middleware
const { authenticate } = require('../../middleware/auth');
const { requireAdmin, requireSuperAdmin } = require('../../middleware/authorize');

// Validators
const { validateAuditLogQuery, validateAnalyticsDateRange } = require('../../validators/adminValidator');

// ============================================================================
// PROTECTED ROUTES (Admin Access Required)
// ============================================================================

/**
 * @route   GET /api/admin/analytics/overview
 * @desc    Get dashboard overview statistics
 * @access  Protected (Admin only)
 *
 * @returns {Object} Comprehensive dashboard statistics
 *
 * @example
 *   GET /api/admin/analytics/overview
 *   Headers: { "Authorization": "Bearer <token>" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "stats": {
 *       "users": {
 *         "total": 175,
 *         "totalMembers": 150,
 *         "pendingApprovals": 25,
 *         "newThisMonth": 40,
 *         "suspended": 2
 *       },
 *       "admins": {
 *         "total": 5,
 *         "active": 4,
 *         "breakdown": [
 *           { "_id": "SUPER_ADMIN", "count": 1 },
 *           { "_id": "MEMBER_ADMIN", "count": 2 },
 *           { "_id": "CONTENT_ADMIN", "count": 1 },
 *           { "_id": "NEWSLETTER_ADMIN", "count": 1 }
 *         ]
 *       },
 *       "activity": {
 *         "recentLogins": 45
 *       },
 *       "recentActions": [...]
 *     }
 *   }
 */
router.get('/overview', authenticate, requireAdmin, validateAnalyticsDateRange, getDashboardOverview);

/**
 * @route   GET /api/admin/analytics/users
 * @desc    Get detailed user analytics
 * @access  Protected (Admin only)
 *
 * @returns {Object} User analytics with distributions and growth
 *
 * @example
 *   GET /api/admin/analytics/users
 *   Headers: { "Authorization": "Bearer <token>" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "analytics": {
 *       "statusDistribution": [
 *         { "_id": "APPROVED", "count": 150 },
 *         { "_id": "PENDING", "count": 25 },
 *         { "_id": "REJECTED", "count": 5 }
 *       ],
 *       "roleDistribution": [
 *         { "_id": "USER", "count": 120 },
 *         { "_id": "MEMBER", "count": 30 }
 *       ],
 *       "userGrowth": [...]
 *     }
 *   }
 */
router.get('/users', authenticate, requireAdmin, validateAnalyticsDateRange, getUserAnalytics);

/**
 * @route   GET /api/admin/analytics/content
 * @desc    Get content analytics
 * @access  Protected (Admin only)
 *
 * @returns {Object} Content statistics
 *
 * @example
 *   GET /api/admin/analytics/content
 *   Headers: { "Authorization": "Bearer <token>" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "analytics": {
 *       "projects": { "total": 0, "active": 0 },
 *       "newsletters": { "total": 0, "published": 0, "subscribers": 0 },
 *       "lms": { "totalCourses": 0, "totalLessons": 0 },
 *       "scholarships": { "total": 0, "active": 0 }
 *     }
 *   }
 */
router.get('/content', authenticate, requireAdmin, validateAnalyticsDateRange, getContentAnalytics);

// ============================================================================
// AUDIT LOG ROUTES
// ============================================================================

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get audit logs with filtering and pagination
 * @access  Protected (Admin only)
 *
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 50)
 * @query {string} action - Filter by action type
 * @query {string} adminId - Filter by admin ID
 * @query {string} startDate - Filter by start date
 * @query {string} endDate - Filter by end date
 *
 * @returns {Object} Paginated audit logs
 *
 * @example
 *   GET /api/admin/audit-logs?page=1&limit=50&action=CREATE_USER
 *   Headers: { "Authorization": "Bearer <token>" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "data": {
 *       "logs": [...audit log entries...],
 *       "pagination": {
 *         "currentPage": 1,
 *         "totalPages": 10,
 *         "totalLogs": 500,
 *         "limit": 50,
 *         "hasNextPage": true,
 *         "hasPrevPage": false
 *       }
 *     }
 *   }
 */
router.get('/audit-logs', authenticate, requireAdmin, validateAuditLogQuery, getAuditLogs);

/**
 * @route   GET /api/admin/audit-logs/stats
 * @desc    Get audit log statistics
 * @access  Protected (SUPER_ADMIN only)
 *
 * @returns {Object} Audit log statistics
 *
 * @example
 *   GET /api/admin/audit-logs/stats
 *   Headers: { "Authorization": "Bearer <token>" }
 *
 *   Response (200 OK):
 *   {
 *     "success": true,
 *     "stats": {
 *       "totalActions": 1234,
 *       "actionStats": [
 *         { "_id": "CREATE_USER", "count": 45 },
 *         { "_id": "APPROVE_USER", "count": 32 },
 *         ...
 *       ],
 *       "mostActiveAdmins": [...],
 *       "dateRange": {
 *         "start": "2024-01-01T00:00:00.000Z",
 *         "end": "2024-01-31T23:59:59.999Z"
 *       }
 *     }
 *   }
 */
router.get('/audit-logs/stats', authenticate, requireSuperAdmin, validateAnalyticsDateRange, getAuditLogStats);

// ============================================================================
// EXPORT ROUTER
// ============================================================================

module.exports = router;

// ============================================================================
// END OF ADMIN ANALYTICS ROUTES
// ============================================================================
