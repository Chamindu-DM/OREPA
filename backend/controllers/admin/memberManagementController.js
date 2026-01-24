// ============================================================================
// OREPA Backend - Member Management Controller
// ============================================================================
//
// Purpose:
//   Handles member-related operations for MEMBER_ADMIN role
//   User registration approval/rejection workflow
//
// Features:
//   - View pending user registrations
//   - Approve user registrations
//   - Reject user registrations
//   - View member statistics
//
// Dependencies:
//   - User model
//   - asyncHandler
//   - logAction utility
//
// ============================================================================

const User = require('../../models/User');
const { asyncHandler } = require('../../middleware/errorHandler');
const { logAction } = require('../../middleware/auditLog');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================================================
// GET PENDING REGISTRATIONS
// ============================================================================

/**
 * Get Pending Registrations Controller
 *
 * Returns all users with PENDING status
 * Paginated for better performance
 *
 * Route: GET /api/admin/member-management/pending
 * Access: Protected (MEMBER_ADMIN, SUPER_ADMIN)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with pending users
 */
exports.getPendingRegistrations = asyncHandler(async (req, res) => {
  // ==========================================================================
  // STEP 1: Extract Query Parameters
  // ==========================================================================

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // ==========================================================================
  // STEP 2: Query Pending Users
  // ==========================================================================

  const [users, totalPending] = await Promise.all([
    User.find({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' }, // Most recent first
      take: limit,
      skip: skip,
    }),
    User.count({ status: 'PENDING' }),
  ]);

  // ==========================================================================
  // STEP 3: Calculate Pagination
  // ==========================================================================

  const totalPages = Math.ceil(totalPending / limit);

  // ==========================================================================
  // STEP 4: Send Response
  // ==========================================================================

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalPending,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});

// ============================================================================
// APPROVE USER REGISTRATION
// ============================================================================

/**
 * Approve User Registration Controller
 *
 * Approves a pending user registration
 * Updates status to APPROVED and sets approval metadata
 *
 * Route: POST /api/admin/member-management/:userId/approve
 * Access: Protected (MEMBER_ADMIN, SUPER_ADMIN)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with approved user
 */
exports.approveUser = asyncHandler(async (req, res) => {
  // ==========================================================================
  // STEP 1: Find User
  // ==========================================================================

  const user = await User.findById(req.params.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      error: 'USER_NOT_FOUND',
    });
  }

  // ==========================================================================
  // STEP 2: Validate User Status
  // ==========================================================================

  if (user.status !== 'PENDING') {
    return res.status(400).json({
      success: false,
      message: `User status is ${user.status}. Can only approve PENDING users.`,
      error: 'INVALID_STATUS',
      currentStatus: user.status,
    });
  }

  // ==========================================================================
  // STEP 3: Store Before State
  // ==========================================================================

  const beforeState = {
    status: user.status,
  };

  // ==========================================================================
  // STEP 4: Update User Status
  // ==========================================================================

  const adminUserId = req.user.userId || req.user.id;
  const updatedUser = await User.update(req.params.userId, {
    status: 'APPROVED',
    approvedById: adminUserId,
    approvalDate: new Date(),
  });

  // ==========================================================================
  // STEP 5: Log Action
  // ==========================================================================

  await logAction({
    admin: req.user,
    action: 'APPROVE_USER',
    resourceType: 'User',
    resourceId: updatedUser.id,
    description: `Approved user registration: ${updatedUser.email}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    beforeState,
    afterState: {
      status: updatedUser.status,
      approvedBy: req.user.email,
      approvalDate: updatedUser.approvalDate,
    },
  });

  // ==========================================================================
  // STEP 6: TODO - Send Approval Email
  // ==========================================================================

  // TODO: Send email to user notifying them of approval
  // TODO: Include login link and instructions

  // ==========================================================================
  // STEP 7: Send Response
  // ==========================================================================

  res.status(200).json({
    success: true,
    message: 'User registration approved successfully',
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      status: updatedUser.status,
      approvedBy: req.user.email,
      approvalDate: updatedUser.approvalDate,
    },
  });
});

// ============================================================================
// REJECT USER REGISTRATION
// ============================================================================

/**
 * Reject User Registration Controller
 *
 * Rejects a pending user registration
 * Updates status to REJECTED with optional reason
 *
 * Route: POST /api/admin/member-management/:userId/reject
 * Access: Protected (MEMBER_ADMIN, SUPER_ADMIN)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
exports.rejectUser = asyncHandler(async (req, res) => {
  // ==========================================================================
  // STEP 1: Extract Rejection Reason (Optional)
  // ==========================================================================

  const { reason } = req.body;

  // ==========================================================================
  // STEP 2: Find User
  // ==========================================================================

  const user = await User.findById(req.params.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      error: 'USER_NOT_FOUND',
    });
  }

  // ==========================================================================
  // STEP 3: Validate User Status
  // ==========================================================================

  if (user.status !== 'PENDING') {
    return res.status(400).json({
      success: false,
      message: `User status is ${user.status}. Can only reject PENDING users.`,
      error: 'INVALID_STATUS',
      currentStatus: user.status,
    });
  }

  // ==========================================================================
  // STEP 4: Store Before State
  // ==========================================================================

  const beforeState = {
    status: user.status,
  };

  // ==========================================================================
  // STEP 5: Update User Status
  // ==========================================================================

  const updatedUser = await User.update(req.params.userId, {
    status: 'REJECTED',
  });

  // ==========================================================================
  // STEP 6: Log Action
  // ==========================================================================

  await logAction({
    admin: req.user,
    action: 'REJECT_USER',
    resourceType: 'User',
    resourceId: updatedUser.id,
    description: `Rejected user registration: ${updatedUser.email}${reason ? ` (Reason: ${reason})` : ''}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    beforeState,
    afterState: {
      status: updatedUser.status,
      rejectedBy: req.user.email,
      reason,
    },
  });

  // ==========================================================================
  // STEP 7: TODO - Send Rejection Email
  // ==========================================================================

  // TODO: Send email to user notifying them of rejection
  // TODO: Include reason if provided

  // ==========================================================================
  // STEP 8: Send Response
  // ==========================================================================

  res.status(200).json({
    success: true,
    message: 'User registration rejected',
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      status: updatedUser.status,
    },
  });
});

// ============================================================================
// GET MEMBER STATISTICS
// ============================================================================

/**
 * Get Member Statistics Controller
 *
 * Returns statistics for member management dashboard
 * Total members, pending approvals, recent activity
 *
 * Route: GET /api/admin/member-management/stats
 * Access: Protected (MEMBER_ADMIN, SUPER_ADMIN)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with statistics
 */
exports.getMemberStats = asyncHandler(async (req, res) => {
  // ==========================================================================
  // STEP 1: Calculate Date Ranges
  // ==========================================================================

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // ==========================================================================
  // STEP 2: Query Statistics in Parallel
  // ==========================================================================

  const [
    totalMembers,
    pendingApprovals,
    approvedToday,
    rejectedThisWeek,
    newRegistrationsThisMonth,
    activeMembers, // Logged in last 30 days
    totalUsers,
    totalAdmins,
  ] = await Promise.all([
    // Total approved members (USER and MEMBER roles)
    prisma.user.count({ where: { role: { in: ['USER', 'MEMBER'] }, status: 'APPROVED' } }),

    // Pending approvals
    prisma.user.count({ where: { status: 'PENDING' } }),

    // Approved today
    prisma.user.count({
      where: {
        status: 'APPROVED',
        approvalDate: { gte: today },
      }
    }),

    // Rejected this week
    prisma.user.count({
      where: {
        status: 'REJECTED',
        updatedAt: { gte: oneWeekAgo },
      }
    }),

    // New registrations this month
    prisma.user.count({
      where: {
        createdAt: { gte: oneMonthAgo },
        role: { in: ['USER', 'MEMBER'] },
      }
    }),

    // Active members (logged in last 30 days)
    prisma.user.count({
      where: {
        lastLogin: { gte: thirtyDaysAgo },
        role: { in: ['USER', 'MEMBER'] },
        status: 'APPROVED',
      }
    }),

    // Total users (all non-admin)
    prisma.user.count({ where: { isAdmin: false } }),

    // Total admins
    prisma.user.count({ where: { isAdmin: true } }),
  ]);

  // ==========================================================================
  // STEP 3: Get Recent Pending Registrations
  // ==========================================================================

  const recentPending = await prisma.user.findMany({
    where: { status: 'PENDING' },
    select: { firstName: true, lastName: true, email: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // ==========================================================================
  // STEP 4: Send Response
  // ==========================================================================

  res.status(200).json({
    success: true,
    stats: {
      totalMembers,
      totalUsers,
      totalAdmins,
      pendingApprovals,
      approvedToday,
      rejectedThisWeek,
      newRegistrationsThisMonth,
      activeMembers,
      recentPending,
    },
  });
});

// ============================================================================
// GET ALL MEMBERS
// ============================================================================

/**
 * Get All Members Controller
 *
 * Returns all approved members with pagination
 * Filters to show only USER and MEMBER roles
 *
 * Route: GET /api/admin/member-management/members
 * Access: Protected (MEMBER_ADMIN, SUPER_ADMIN)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with members
 */
exports.getAllMembers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const { search } = req.query;

  // Build filter
  const where = {
    role: { in: ['USER', 'MEMBER'] },
    status: 'APPROVED',
  };

  // Add search if provided
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [members, totalMembers] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        approvedBy: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    }),
    prisma.user.count({ where }),
  ]);

  // remove password
  members.forEach(m => delete m.password);

  const totalPages = Math.ceil(totalMembers / limit);

  res.status(200).json({
    success: true,
    data: {
      members,
      pagination: {
        currentPage: page,
        totalPages,
        totalMembers,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});

// ============================================================================
// GET MEMBER DETAILS
// ============================================================================

/**
 * Get Member Details Controller
 *
 * Returns full details of a specific member
 *
 * Route: GET /api/admin/member-management/members/:userId
 * Access: Protected (MEMBER_ADMIN, SUPER_ADMIN)
 */
exports.getMemberDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      error: 'USER_NOT_FOUND',
    });
  }

  // Remove password
  delete user.password;

  res.status(200).json({
    success: true,
    user,
  });
});

// ============================================================================
// UPDATE MEMBER DETAILS
// ============================================================================

/**
 * Update Member Details Controller
 *
 * Updates member details and status
 *
 * Route: PUT /api/admin/member-management/members/:userId
 * Access: Protected (MEMBER_ADMIN, SUPER_ADMIN)
 */
exports.updateMember = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      error: 'USER_NOT_FOUND',
    });
  }

  const {
    firstName, lastName, phone, university, faculty,
    engineeringField, batch, admissionNumber, status
  } = req.body;

  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (phone) updateData.phone = phone;
  if (university) updateData.university = university;
  if (faculty) updateData.faculty = faculty;
  if (engineeringField) updateData.engineeringField = engineeringField;
  if (batch) updateData.batch = parseInt(batch);
  if (admissionNumber) updateData.admissionNumber = admissionNumber;

  // Handle Status Change
  if (status && status !== user.status) {
    // Validate status
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];
    if (!validStatuses.includes(status)) {
       return res.status(400).json({
        success: false,
        message: 'Invalid status provided',
        error: 'INVALID_STATUS',
      });
    }
    updateData.status = status;

    // If approving, set approval metadata if not present
    if (status === 'APPROVED' && user.status !== 'APPROVED') {
        updateData.approvedById = req.user.userId || req.user.id;
        updateData.approvalDate = new Date();
    }
  }

  // Store state for audit log
  const beforeState = { ...user };
  delete beforeState.password;

  const updatedUser = await User.update(req.params.userId, updateData);

  // Log action
  await logAction({
    admin: req.user,
    action: 'UPDATE_MEMBER',
    resourceType: 'User',
    resourceId: updatedUser.id,
    description: `Updated member details: ${updatedUser.email}`,
    beforeState,
    afterState: updateData
  });

  delete updatedUser.password;

  res.status(200).json({
    success: true,
    message: 'Member updated successfully',
    user: updatedUser,
  });
});

// ============================================================================
// BATCH ACTION (APPROVE/REJECT)
// ============================================================================

/**
 * Batch Action Controller
 *
 * Approves or rejects multiple users at once
 *
 * Route: POST /api/admin/member-management/batch
 * Access: Protected (MEMBER_ADMIN, SUPER_ADMIN)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
exports.batchAction = asyncHandler(async (req, res) => {
  const { userIds, action } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an array of user IDs',
      error: 'INVALID_INPUT',
    });
  }

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid action. Must be "approve" or "reject"',
      error: 'INVALID_ACTION',
    });
  }

  const results = {
    success: [],
    failed: [],
  };

  const adminUserId = req.user.userId || req.user.id; // Corrected to use req.user.id

  for (const userId of userIds) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        results.failed.push({ userId, reason: 'User not found' });
        continue;
      }

      if (user.status !== 'PENDING') {
        results.failed.push({ userId, reason: `User status is ${user.status}` });
        continue;
      }

      if (action === 'approve') {
        const updatedUser = await User.update(userId, {
          status: 'APPROVED',
          approvedById: adminUserId,
          approvalDate: new Date(),
        });

        await logAction({
          admin: req.user,
          action: 'APPROVE_USER',
          resourceType: 'User',
          resourceId: updatedUser.id,
          description: `Batch approved user: ${updatedUser.email}`,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          afterState: { status: 'APPROVED' }
        });

        results.success.push({ userId, email: updatedUser.email });

      } else if (action === 'reject') {
        const updatedUser = await User.update(userId, {
          status: 'REJECTED',
        });

        await logAction({
          admin: req.user,
          action: 'REJECT_USER',
          resourceType: 'User',
          resourceId: updatedUser.id,
          description: `Batch rejected user: ${updatedUser.email}`,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          afterState: { status: 'REJECTED' }
        });

        results.success.push({ userId, email: updatedUser.email });
      }

    } catch (error) {
      console.error(`Error processing batch action for user ${userId}:`, error);
      results.failed.push({ userId, reason: error.message });
    }
  }

  res.status(200).json({
    success: true,
    message: `Batch ${action} completed`,
    results,
  });
});

// ============================================================================
// END OF MEMBER MANAGEMENT CONTROLLER
// ============================================================================
