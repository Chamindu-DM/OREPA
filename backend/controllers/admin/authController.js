// ============================================================================
// OREPA Backend - Admin Authentication Controller
// ============================================================================
//
// Purpose:
//   Handles authentication logic for admin users
//   Separate from regular user authentication
//
// Features:
//   - Admin login with enhanced security
//   - Account lockout after failed attempts
//   - JWT token generation with role information
//   - Audit logging for security
//
// Dependencies:
//   - User model: For user authentication
//   - AdminActionLog: For audit logging
//   - asyncHandler: Error handling wrapper
//
// Usage:
//   const { adminLogin, adminLogout, verifyAdminToken } = require('./controllers/admin/authController');
//
// ============================================================================

const User = require('../../models/User');
const AdminActionLog = require('../../models/AdminActionLog');
const { asyncHandler } = require('../../middleware/errorHandler');
const { logAction } = require('../../middleware/auditLog');

// ============================================================================
// ADMIN LOGIN
// ============================================================================

/**
 * Admin Login Controller
 *
 * Authenticates admin users and generates JWT tokens
 * Separate endpoint from regular user login for enhanced security
 *
 * Route: POST /api/admin/login
 * Access: Public
 * Rate Limited: 5 attempts per 15 minutes
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - Admin email address
 * @param {string} req.body.password - Admin password
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with token and user info
 */
exports.adminLogin = asyncHandler(async (req, res) => {
  // ==========================================================================
  // STEP 1: Extract and Validate Input
  // ==========================================================================

  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.',
      error: 'MISSING_CREDENTIALS',
    });
  }

  // ==========================================================================
  // STEP 2: Find User and Validate Admin Status
  // ==========================================================================

  // Find user by email (include password for comparison)
  const user = await User.findByEmail(email);

  // Check if user exists
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
      error: 'INVALID_CREDENTIALS',
    });
  }

  // Check if user is an admin
  if (!user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'This account does not have admin privileges. Please use the regular login.',
      error: 'NOT_ADMIN_ACCOUNT',
    });
  }

  // ==========================================================================
  // STEP 3: Check Account Status
  // ==========================================================================

  // Check if account is locked
  if (User.isAccountLocked(user)) {
    const lockTimeRemaining = Math.ceil((user.accountLockedUntil - Date.now()) / (60 * 1000));
    return res.status(403).json({
      success: false,
      message: `Account temporarily locked due to too many failed login attempts. Please try again in ${lockTimeRemaining} minutes.`,
      error: 'ACCOUNT_LOCKED',
      lockUntil: user.accountLockedUntil,
    });
  }

  // Check if account is suspended
  if (user.status === 'SUSPENDED') {
    return res.status(403).json({
      success: false,
      message: 'Your account has been suspended. Please contact the system administrator.',
      error: 'ACCOUNT_SUSPENDED',
    });
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account is inactive. Please contact support.',
      error: 'ACCOUNT_INACTIVE',
    });
  }

  // ==========================================================================
  // STEP 4: Verify Password
  // ==========================================================================

  // Compare provided password with hashed password
  const isPasswordCorrect = await User.comparePassword(password, user.password);

  if (!isPasswordCorrect) {
    // Increment failed login attempts
    await User.incrementLoginAttempts(user.id, user.loginAttempts);

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
      error: 'INVALID_CREDENTIALS',
    });
  }

  // ==========================================================================
  // STEP 5: Password Correct - Reset Login Attempts
  // ==========================================================================

  // Reset login attempts on successful authentication
  await User.resetLoginAttempts(user.id);

  // ==========================================================================
  // STEP 6: Update Last Login Timestamp
  // ==========================================================================

  await User.updateLastLogin(user.id);

  // ==========================================================================
  // STEP 7: Generate JWT Token
  // ==========================================================================

  const token = User.generateAuthToken(user);

  // ==========================================================================
  // STEP 8: Log Admin Login Action
  // ==========================================================================

  // Log login action for audit trail
  await logAction({
    admin: user,
    action: 'LOGIN',
    description: `Admin logged in: ${user.email}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
  });

  // ==========================================================================
  // STEP 9: Send Response
  // ==========================================================================

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: User.getFullName(user),
      role: user.role,
      isAdmin: user.isAdmin,
    },
  });
});

// ============================================================================
// ADMIN LOGOUT
// ============================================================================

/**
 * Admin Logout Controller
 *
 * Logs admin logout action for audit trail
 * Token invalidation handled on client side
 *
 * Route: POST /api/admin/logout
 * Access: Protected (Admin only)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
exports.adminLogout = asyncHandler(async (req, res) => {
  // ==========================================================================
  // Log Logout Action
  // ==========================================================================

  await logAction({
    admin: req.user,
    action: 'LOGOUT',
    description: `Admin logged out: ${req.user.email}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
  });

  // ==========================================================================
  // Send Response
  // ==========================================================================

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// ============================================================================
// VERIFY ADMIN TOKEN
// ============================================================================

/**
 * Verify Admin Token Controller
 *
 * Verifies JWT token and returns current admin user info
 * Used by frontend to check authentication status
 *
 * Route: GET /api/admin/verify
 * Access: Protected (Admin only)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user info
 */
exports.verifyAdminToken = asyncHandler(async (req, res) => {
  // User already attached to req by authenticate middleware
  // Just return user information with permissions

  const { getRolePermissions } = require('../../config/permissions');
  const permissions = getRolePermissions(req.user.role);

  res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      fullName: req.user.fullName,
      role: req.user.role,
      isAdmin: req.user.isAdmin,
      permissions,
    },
  });
});

// ============================================================================
// GET ADMIN PROFILE
// ============================================================================

/**
 * Get Admin Profile Controller
 *
 * Returns detailed profile information for the authenticated admin
 *
 * Route: GET /api/admin/profile
 * Access: Protected (Admin only)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with admin profile
 */
exports.getAdminProfile = asyncHandler(async (req, res) => {
  // Get full user object (without password)
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
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
// UPDATE ADMIN PROFILE
// ============================================================================

/**
 * Update Admin Profile Controller
 *
 * Allows admins to update their own profile information
 * Cannot change role or admin status
 *
 * Route: PUT /api/admin/profile
 * Access: Protected (Admin only)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated profile
 */
exports.updateAdminProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId || req.user.id;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      error: 'USER_NOT_FOUND',
    });
  }

  // Allowed fields to update
  const allowedUpdates = ['firstName', 'lastName', 'phone'];

  // Build update data
  const updateData = {};
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  // Update user
  const updatedUser = await User.update(userId, updateData);

  // Log action
  await logAction({
    admin: req.user,
    action: 'UPDATE_USER',
    resourceType: 'User',
    resourceId: user.id,
    description: `Updated own profile`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      fullName: User.getFullName(updatedUser),
      phone: updatedUser.phone,
      role: updatedUser.role,
    },
  });
});

// ============================================================================
// CHANGE PASSWORD
// ============================================================================

/**
 * Change Password Controller
 *
 * Allows admins to change their own password
 *
 * Route: PUT /api/admin/change-password
 * Access: Protected (Admin only)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validate input
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both current and new password',
      error: 'MISSING_FIELDS',
    });
  }

  // Get user with password
  const user = await prisma.user.findUnique({
      where: { id: req.user.id }
  });

  // Verify current password
  const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordCorrect) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect',
      error: 'INVALID_PASSWORD',
    });
  }

  // Validate new password length
  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters',
      error: 'WEAK_PASSWORD',
    });
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });

  // Log action
  await logAction({
    admin: req.user,
    action: 'UPDATE_USER',
    resourceType: 'User',
    resourceId: user.id,
    description: `Changed own password`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

// ============================================================================
// END OF ADMIN AUTHENTICATION CONTROLLER
// ============================================================================
