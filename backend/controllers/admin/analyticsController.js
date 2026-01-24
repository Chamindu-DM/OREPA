// ============================================================================
// OREPA Backend - Admin Analytics Controller
// ============================================================================
//
// Purpose:
//   Provides analytics and statistics for admin dashboards
//   Different statistics for different admin roles
//
// Features:
//   - Overview statistics (SUPER_ADMIN dashboard)
//   - User analytics
//   - Content analytics
//   - Audit log retrieval
//
// Dependencies:
//   - User model
//   - AdminActionLog model
//   - asyncHandler
//
// ============================================================================

const User = require('../../models/User');
const AdminActionLog = require('../../models/AdminActionLog');
const { asyncHandler } = require('../../middleware/errorHandler');

// ============================================================================
// GET DASHBOARD OVERVIEW STATISTICS
// ============================================================================

/**
 * Get Dashboard Overview Controller
 *
 * Returns comprehensive statistics for SUPER_ADMIN dashboard
 * Includes users, admins, recent activity
 *
 * Route: GET /api/admin/analytics/overview
 * Access: Protected (Admin only)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with dashboard statistics
 */
exports.getDashboardOverview = asyncHandler(async (req, res) => {
  // ==========================================================================
  // STEP 1: Calculate Date Ranges
  // ==========================================================================

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // ==========================================================================
  // STEP 2: Query Statistics in Parallel
  // ==========================================================================

  const [
    totalUsers,
    totalMembers,
    pendingApprovals,
    activeAdmins,
    totalAdmins,
    recentLogins, // Last 7 days
    newUsersThisMonth,
    suspendedUsers,
  ] = await Promise.all([
    // Total users (excluding admins)
    User.count({ isAdmin: false }),

    // Total approved members
    User.count({ role: { in: ['USER', 'MEMBER'] }, status: 'APPROVED' }),

    // Pending approvals
    User.count({ status: 'PENDING' }),

    // Active admins (logged in last 7 days)
    User.count({
      isAdmin: true,
      lastLogin: { gte: sevenDaysAgo },
    }),

    // Total admins
    User.count({ isAdmin: true }),

    // Recent logins (last 7 days)
    User.count({
      lastLogin: { gte: sevenDaysAgo },
    }),

    // New users this month
    User.count({
      createdAt: { gte: thirtyDaysAgo },
      isAdmin: false,
    }),

    // Suspended users
    User.count({ status: 'SUSPENDED' }),
  ]);

  // ==========================================================================
  // STEP 3: Get Recent Admin Actions
  // ==========================================================================

  const recentActions = await AdminActionLog.getRecentActions(10);

  // ==========================================================================
  // STEP 4: Get Admin Breakdown by Role
  // ==========================================================================

  const adminBreakdownRaw = await User.find({
    where: { isAdmin: true },
    select: { role: true, id: true },
  });

  const adminBreakdown = adminBreakdownRaw.reduce((acc, user) => {
    const existing = acc.find(item => item._id === user.role);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ _id: user.role, count: 1 });
    }
    return acc;
  }, []);

  // ==========================================================================
  // STEP 5: Send Response
  // ==========================================================================

  res.status(200).json({
    success: true,
    stats: {
      users: {
        total: totalUsers,
        totalMembers,
        pendingApprovals,
        newThisMonth: newUsersThisMonth,
        suspended: suspendedUsers,
      },
      admins: {
        total: totalAdmins,
        active: activeAdmins,
        breakdown: adminBreakdown,
      },
      activity: {
        recentLogins,
      },
      recentActions,
    },
  });
});

// ============================================================================
// GET USER ANALYTICS
// ============================================================================

/**
 * Get User Analytics Controller
 *
 * Returns detailed user analytics
 * Growth trends, status distribution, role distribution
 *
 * Route: GET /api/admin/analytics/users
 * Access: Protected (Admin only)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user analytics
 */
exports.getUserAnalytics = asyncHandler(async (req, res) => {
  // ==========================================================================
  // STEP 1: Get User Status Distribution
  // ==========================================================================

  const statusDistributionRaw = await User.find({
    where: { isAdmin: false },
    select: { status: true, id: true },
  });

  const statusDistribution = statusDistributionRaw.reduce((acc, user) => {
    const existing = acc.find(item => item._id === user.status);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ _id: user.status, count: 1 });
    }
    return acc;
  }, []);

  // ==========================================================================
  // STEP 2: Get User Role Distribution
  // ==========================================================================

  const roleDistributionRaw = await User.find({
    where: { isAdmin: false },
    select: { role: true, id: true },
  });

  const roleDistribution = roleDistributionRaw.reduce((acc, user) => {
    const existing = acc.find(item => item._id === user.role);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ _id: user.role, count: 1 });
    }
    return acc;
  }, []);

  // ==========================================================================
  // STEP 3: Get User Growth (Last 12 Months)
  // ==========================================================================

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const usersRaw = await User.find({
    where: {
      createdAt: { gte: twelveMonthsAgo },
      isAdmin: false,
    },
    select: { createdAt: true, id: true },
  });

  const userGrowth = usersRaw.reduce((acc, user) => {
    const date = new Date(user.createdAt);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12

    const existing = acc.find(item => item._id.year === year && item._id.month === month);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ _id: { year, month }, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => {
    if (a._id.year !== b._id.year) return a._id.year - b._id.year;
    return a._id.month - b._id.month;
  });

  // ==========================================================================
  // STEP 4: Get Top Referrers (if tracking implemented)
  // ==========================================================================

  // TODO: Implement referrer tracking if needed

  // ==========================================================================
  // STEP 5: Send Response
  // ==========================================================================

  res.status(200).json({
    success: true,
    analytics: {
      statusDistribution,
      roleDistribution,
      userGrowth,
    },
  });
});

// ============================================================================
// GET AUDIT LOGS
// ============================================================================

/**
 * Get Audit Logs Controller
 *
 * Returns admin action logs with filtering
 * Paginated for performance
 *
 * Route: GET /api/admin/audit-logs
 * Access: Protected (Admin only)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with audit logs
 */
exports.getAuditLogs = asyncHandler(async (req, res) => {
  // ==========================================================================
  // STEP 1: Extract Query Parameters
  // ==========================================================================

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const { action, adminId, startDate, endDate } = req.query;

  // ==========================================================================
  // STEP 2: Build Query Filter
  // ==========================================================================

  const where = {};

  // Filter by action type
  if (action) {
    where.action = action;
  }

  // Filter by admin
  if (adminId) {
    where.adminId = adminId;
  }

  // Filter by date range
  if (startDate || endDate) {
    where.createdAt = {}; // NOTE: Schema uses createdAt, code used timestamp.
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  // ==========================================================================
  // STEP 3: Query Audit Logs
  // ==========================================================================

  const [logs, totalLogs] = await Promise.all([
    prisma.adminActionLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
          admin: {
              select: { firstName: true, lastName: true, email: true, role: true }
          }
      }
    }),
    prisma.adminActionLog.count({ where }),
  ]);

  // ==========================================================================
  // STEP 4: Calculate Pagination
  // ==========================================================================

  const totalPages = Math.ceil(totalLogs / limit);

  // ==========================================================================
  // STEP 5: Send Response
  // ==========================================================================

  res.status(200).json({
    success: true,
    data: {
      logs,
      pagination: {
        currentPage: page,
        totalPages,
        totalLogs,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});

// ============================================================================
// GET AUDIT LOG STATISTICS
// ============================================================================

/**
 * Get Audit Log Statistics Controller
 *
 * Returns statistics about admin actions
 * Action type distribution, most active admins
 *
 * Route: GET /api/admin/audit-logs/stats
 * Access: Protected (SUPER_ADMIN only)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with audit statistics
 */
exports.getAuditLogStats = asyncHandler(async (req, res) => {
  // ==========================================================================
  // STEP 1: Calculate Date Range (Last 30 Days)
  // ==========================================================================

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // ==========================================================================
  // STEP 2: Get Action Statistics
  // ==========================================================================

  const actionStatsData = await prisma.adminActionLog.groupBy({
      by: ['action'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { action: true }
  });

  // Format for frontend
  const actionStats = actionStatsData.map(item => ({
      _id: item.action,
      count: item._count.action
  }));


  // ==========================================================================
  // STEP 3: Get Most Active Admins
  // ==========================================================================

  const activeAdminsData = await prisma.adminActionLog.groupBy({
    by: ['adminId', 'adminEmail', 'adminRole'],
    where: { createdAt: { gte: thirtyDaysAgo } },
    _count: { adminId: true },
    orderBy: {
        _count: {
            adminId: 'desc'
        }
    },
    take: 10
  });

  const mostActiveAdmins = activeAdminsData.map(item => ({
      _id: item.adminId,
      actionCount: item._count.adminId,
      adminEmail: item.adminEmail,
      adminRole: item.adminRole
  }));

  // ==========================================================================
  // STEP 4: Get Total Actions
  // ==========================================================================

  const totalActions = await prisma.adminActionLog.count({
    where: {
        createdAt: { gte: thirtyDaysAgo },
    }
  });

  // ==========================================================================
  // STEP 5: Send Response
  // ==========================================================================

  res.status(200).json({
    success: true,
    stats: {
      totalActions,
      actionStats,
      mostActiveAdmins,
      dateRange: {
        start: thirtyDaysAgo,
        end: new Date(),
      },
    },
  });
});

// ============================================================================
// GET CONTENT ANALYTICS (Placeholder)
// ============================================================================

/**
 * Get Content Analytics Controller
 *
 * Returns content-related statistics
 * TODO: Implement when content models are created
 *
 * Route: GET /api/admin/analytics/content
 * Access: Protected (Admin only)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with content analytics
 */
exports.getContentAnalytics = asyncHandler(async (req, res) => {
  // TODO: Implement when Newsletter, Project, LMS, Scholarship models are created

  res.status(200).json({
    success: true,
    message: 'Content analytics will be available once content models are implemented',
    analytics: {
      projects: {
        total: 0,
        active: 0,
      },
      newsletters: {
        total: 0,
        published: 0,
        subscribers: 0,
      },
      lms: {
        totalCourses: 0,
        totalLessons: 0,
      },
      scholarships: {
        total: 0,
        active: 0,
      },
    },
  });
});

// ============================================================================
// END OF ADMIN ANALYTICS CONTROLLER
// ============================================================================
