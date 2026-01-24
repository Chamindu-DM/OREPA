// ============================================================================
// OREPA Backend - Admin User Management Controller
// ============================================================================
//
// Purpose:
//   Handles user management operations for admin users
//   SUPER_ADMIN can create other admins, change roles, delete users
//   All admins can view users
//
// Features:
//   - Create admin accounts (SUPER_ADMIN only)
//   - View all users with pagination
//   - Update user roles (SUPER_ADMIN only)
//   - Delete users (SUPER_ADMIN only)
//   - Suspend/reactivate users
//
// Dependencies:
//   - User model
//   - AdminActionLog model
//   - asyncHandler
//   - logAction utility
//
// ============================================================================

const User = require('../../models/User');
const { asyncHandler } = require('../../middleware/errorHandler');
const { logAction } = require('../../middleware/auditLog');

// ============================================================================
// GET ALL USERS
// ============================================================================

/**
 * Get All Users Controller
 *
 * Returns paginated list of all users
 * Supports filtering by role, status, and search
 *
 * Route: GET /api/admin/users
 * Access: Protected (Admin only)
 *
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} req.query.page - Page number (default: 1)
 * @param {number} req.query.limit - Items per page (default: 20)
 * @param {string} req.query.role - Filter by role
 * @param {string} req.query.status - Filter by status
 * @param {string} req.query.search - Search by name or email
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with paginated users
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  // ==========================================================================
  // STEP 1: Extract Query Parameters
  // ==========================================================================

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const { role, status, search } = req.query;

  // ==========================================================================
  // STEP 2: Build Query Filter
  // ==========================================================================

  const where = {};

  // Filter by role
  if (role) {
    where.role = role;
  }

  // Filter by status
  if (status) {
    where.status = status;
  }

  // Search by name or email
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  // ==========================================================================
  // STEP 3: Execute Query with Pagination
  // ==========================================================================

  const [users, totalUsers] = await Promise.all([
    User.find({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        nameWithInitials: true,
        role: true,
        status: true,
        isAdmin: true,
        isActive: true,
        orepaSCId: true,
        batch: true,
        university: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        approvedAt: true,
        approvedById: true,
        createdById: true,
        // Exclude password
      },
    }),
    User.count(where),
  ]);

  // ==========================================================================
  // STEP 4: Calculate Pagination Metadata
  // ==========================================================================

  const totalPages = Math.ceil(totalUsers / limit);

  // ==========================================================================
  // STEP 5: Send Response
  // ==========================================================================

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});

// ============================================================================
// GET SINGLE USER
// ============================================================================

/**
 * Get Single User Controller
 *
 * Returns detailed information for a single user
 *
 * Route: GET /api/admin/users/:id
 * Access: Protected (Admin only)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user details
 */
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      error: 'USER_NOT_FOUND',
    });
  }

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  res.status(200).json({
    success: true,
    user: userWithoutPassword,
  });
});

// ============================================================================
// CREATE ADMIN USER
// ============================================================================

/**
 * Create Admin User Controller
 *
 * Creates a new admin account
 * Only SUPER_ADMIN can create admin accounts
 *
 * Route: POST /api/admin/users/create-admin
 * Access: Protected (SUPER_ADMIN only)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created admin
 */
exports.createAdmin = asyncHandler(async (req, res) => {
  // ==========================================================================
  // STEP 1: Extract and Validate Input
  // ==========================================================================

  const { email, password, firstName, lastName, role, phone } = req.body;

  // Validate required fields
  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: email, password, firstName, lastName, role',
      error: 'MISSING_REQUIRED_FIELDS',
    });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
      error: 'WEAK_PASSWORD',
    });
  }

  // Validate admin role
  const validAdminRoles = ['MEMBER_ADMIN', 'CONTENT_ADMIN', 'NEWSLETTER_ADMIN', 'SUPER_ADMIN'];
  if (!validAdminRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Invalid role. Must be one of: ${validAdminRoles.join(', ')}`,
      error: 'INVALID_ROLE',
    });
  }

  // ==========================================================================
  // STEP 2: Check if Email Already Exists
  // ==========================================================================

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email already exists',
      error: 'EMAIL_ALREADY_EXISTS',
    });
  }

  // ==========================================================================
  // STEP 3: Create Admin User
  // ==========================================================================

  const user = await User.create({
    email,
    password, // Will be hashed by pre-save hook
    firstName,
    lastName,
    phone,
    role, // Admin role
    status: 'APPROVED', // Admins are pre-approved
    isAdmin: true, // Will be set by pre-save hook but explicit here
    createdById: req.user.id, // Track who created this admin
  });

  // ==========================================================================
  // STEP 4: Log Action
  // ==========================================================================

  await logAction({
    admin: req.user,
    action: 'CREATE_ADMIN',
    resourceType: 'User',
    resourceId: user.id,
    description: `Created admin account: ${email} with role ${role}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    afterState: {
      email: user.email,
      role: user.role,
      createdBy: req.user.email,
    },
  });

  // ==========================================================================
  // STEP 5: TODO - Send Welcome Email
  // ==========================================================================

  // TODO: Send welcome email to new admin with login instructions

  // ==========================================================================
  // STEP 6: Send Response
  // ==========================================================================

  res.status(201).json({
    success: true,
    message: 'Admin user created successfully',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role,
      isAdmin: user.isAdmin,
    },
  });
});

// ============================================================================
// UPDATE USER ROLE
// ============================================================================

/**
 * Update User Role Controller
 *
 * Changes a user's role
 * Only SUPER_ADMIN can change roles
 *
 * Route: PATCH /api/admin/users/:id/role
 * Access: Protected (SUPER_ADMIN only)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated user
 */
exports.updateUserRole = asyncHandler(async (req, res) => {
  // ==========================================================================
  // STEP 1: Validate Input
  // ==========================================================================

  const { role } = req.body;

  if (!role) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a role',
      error: 'MISSING_ROLE',
    });
  }

  // Validate role
  const validRoles = ['USER', 'MEMBER', 'MEMBER_ADMIN', 'CONTENT_ADMIN', 'NEWSLETTER_ADMIN', 'SUPER_ADMIN'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      error: 'INVALID_ROLE',
    });
  }

  // ==========================================================================
  // STEP 2: Find User
  // ==========================================================================

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      error: 'USER_NOT_FOUND',
    });
  }

  // ==========================================================================
  // STEP 3: Prevent Self-Demotion
  // ==========================================================================

  if (user.id.toString() === req.user.id.toString() && user.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'You cannot demote yourself from SUPER_ADMIN role',
      error: 'CANNOT_DEMOTE_SELF',
    });
  }

  // ==========================================================================
  // STEP 4: Store Before State
  // ==========================================================================

  const beforeState = {
    role: user.role,
    isAdmin: user.isAdmin,
  };

  // ==========================================================================
  // STEP 5: Update Role
  // ==========================================================================

  user.role = role;
  // isAdmin flag will be set automatically by pre-save hook
  await user.save();

  // ==========================================================================
  // STEP 6: Log Action
  // ==========================================================================

  await logAction({
    admin: req.user,
    action: 'CHANGE_ROLE',
    resourceType: 'User',
    resourceId: user.id,
    description: `Changed user role from ${beforeState.role} to ${role} for ${user.email}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    beforeState,
    afterState: {
      role: user.role,
      isAdmin: user.isAdmin,
    },
  });

  // ==========================================================================
  // STEP 7: Send Response
  // ==========================================================================

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isAdmin: user.isAdmin,
    },
  });
});

// ============================================================================
// UPDATE USER STATUS
// ============================================================================

/**
 * Update User Status Controller
 *
 * Changes a user's status (suspend, reactivate)
 *
 * Route: PATCH /api/admin/users/:id/status
 * Access: Protected (Admin only)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated user
 */
exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  // Validate status
  const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      error: 'INVALID_STATUS',
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.params.id }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      error: 'USER_NOT_FOUND',
    });
  }

  const beforeStatus = user.status;

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { status }
  });

  // Determine action type based on status change
  let actionType = 'UPDATE_USER';
  if (status === 'SUSPENDED') actionType = 'SUSPEND_USER';
  if (status === 'APPROVED' && beforeStatus === 'SUSPENDED') actionType = 'REACTIVATE_USER';

  await logAction({
    admin: req.user,
    action: actionType,
    resourceType: 'User',
    resourceId: user.id,
    description: `Changed user status from ${beforeStatus} to ${status} for ${user.email}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    beforeState: { status: beforeStatus },
    afterState: { status: updatedUser.status },
  });

  res.status(200).json({
    success: true,
    message: 'User status updated successfully',
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      status: updatedUser.status,
    },
  });
});

// ============================================================================
// UPDATE USER DETAILS
// ============================================================================

/**
 * Update User Details Controller
 *
 * Updates user profile information
 *
 * Route: PUT /api/admin/users/:id
 * Access: Protected (Admin only)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated user
 */
exports.updateUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    batch,
    university,
    engineeringField,
    orepaSCId,
    role
  } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: req.params.id }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      error: 'USER_NOT_FOUND',
    });
  }

  const beforeState = {
    firstName: user.firstName,
    lastName: user.lastName,
    batch: user.batch,
    university: user.university,
    engineeringField: user.engineeringField,
    orepaSCId: user.orepaSCId,
    role: user.role,
  };

  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (batch) updateData.batch = parseInt(batch, 10);
  if (university) updateData.university = university;
  if (engineeringField) updateData.engineeringField = engineeringField;
  if (orepaSCId) updateData.orepaSCId = orepaSCId;

  // Only SUPER_ADMIN can update roles here (although there is a separate endpoint, convenient to allow here if permission matches)
  if (role && req.user.role === 'SUPER_ADMIN') {
    updateData.role = role;
    // Update isAdmin flag if role changes
    const adminRoles = ['MEMBER_ADMIN', 'CONTENT_ADMIN', 'NEWSLETTER_ADMIN', 'SUPER_ADMIN'];
    updateData.isAdmin = adminRoles.includes(role);
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: updateData
  });

  await logAction({
    admin: req.user,
    action: 'UPDATE_USER',
    resourceType: 'User',
    resourceId: user.id,
    description: `Updated user details for ${user.email}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    beforeState,
    afterState: {
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      batch: updatedUser.batch,
      university: updatedUser.university,
      engineeringField: updatedUser.engineeringField,
      orepaSCId: updatedUser.orepaSCId,
      role: updatedUser.role,
    },
  });

  res.status(200).json({
    success: true,
    message: 'User details updated successfully',
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      batch: updatedUser.batch,
      university: updatedUser.university,
      engineeringField: updatedUser.engineeringField,
      orepaSCId: updatedUser.orepaSCId,
      role: updatedUser.role,
    },
  });
});

// ============================================================================
// DELETE USER
// ============================================================================

/**
 * Delete User Controller
 *
 * Permanently deletes a user account
 * Only SUPER_ADMIN can delete users
 *
 * Route: DELETE /api/admin/users/:id
 * Access: Protected (SUPER_ADMIN only)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      error: 'USER_NOT_FOUND',
    });
  }

  // Prevent self-deletion
  if (user.id === req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'You cannot delete your own account',
      error: 'CANNOT_DELETE_SELF',
    });
  }

  // Store user info before deletion
  const deletedUserInfo = {
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  };

  // Delete user
  await prisma.user.delete({
    where: { id: req.params.id }
  });

  // Log action
  await logAction({
    admin: req.user,
    action: 'DELETE_USER',
    resourceType: 'User',
    resourceId: req.params.id,
    description: `Deleted user account: ${deletedUserInfo.email}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    beforeState: deletedUserInfo,
  });

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

// ============================================================================
// END OF ADMIN USER MANAGEMENT CONTROLLER
// ============================================================================
