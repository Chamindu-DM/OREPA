// ============================================================================
// OREPA Backend - Authorization Middleware (Role & Permission Based)
// ============================================================================
//
// Purpose:
//   Provides flexible authorization middleware for role and permission checking
//   Builds on top of authenticate middleware with granular access control
//
// Features:
//   - Role-based authorization (single or multiple roles)
//   - Permission-based authorization
//   - Flexible middleware factories
//   - Resource ownership validation
//
// Dependencies:
//   - permissions config: Permission definitions and mappings
//
// Usage:
//   const { requireRole, requirePermission } = require('./middleware/authorize');
//   router.post('/newsletters', authenticate, requireRole('NEWSLETTER_ADMIN', 'SUPER_ADMIN'), controller.create);
//   router.delete('/users/:id', authenticate, requirePermission('delete_user'), controller.deleteUser);
//
// ============================================================================

const { hasPermission, hasAnyPermission, hasAllPermissions, PERMISSIONS } = require('../config/permissions');

// ============================================================================
// ROLE-BASED AUTHORIZATION MIDDLEWARE
// ============================================================================

/**
 * Require Admin Middleware
 *
 * Requires user to have any admin role
 * Shortcut for checking isAdmin flag
 *
 * Must be used AFTER authenticate middleware
 *
 * @param {Object} req - Express request object (must have req.user)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @example
 *   router.get('/admin/dashboard', authenticate, requireAdmin, controller.getDashboard);
 */
const requireAdmin = (req, res, next) => {
  // Verify user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      error: 'NOT_AUTHENTICATED',
    });
  }

  // Check if user has admin privileges
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
      error: 'INSUFFICIENT_PERMISSIONS',
      currentRole: req.user.role,
    });
  }

  next();
};

/**
 * Require Role Middleware Factory
 *
 * Creates middleware that requires user to have one of the specified roles
 * Accepts variable number of role arguments (OR logic)
 *
 * Must be used AFTER authenticate middleware
 *
 * @param {...string} roles - One or more roles to check (USER, MEMBER, MEMBER_ADMIN, etc.)
 * @returns {Function} Express middleware function
 *
 * @example
 *   // Single role
 *   router.post('/admin/create', authenticate, requireRole('SUPER_ADMIN'), controller.create);
 *
 *   // Multiple roles (OR logic - user needs one of these)
 *   router.get('/newsletters', authenticate, requireRole('NEWSLETTER_ADMIN', 'SUPER_ADMIN'), controller.list);
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    // Verify user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        error: 'NOT_AUTHENTICATED',
      });
    }

    // Check if user's role matches any of the required roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
        error: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        currentRole: req.user.role,
      });
    }

    next();
  };
};

/**
 * Require Super Admin Middleware
 *
 * Requires user to have SUPER_ADMIN role
 * Shortcut for requireRole('SUPER_ADMIN')
 *
 * Must be used AFTER authenticate middleware
 *
 * @param {Object} req - Express request object (must have req.user)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @example
 *   router.post('/admin/create', authenticate, requireSuperAdmin, controller.createAdmin);
 */
const requireSuperAdmin = (req, res, next) => {
  // Verify user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      error: 'NOT_AUTHENTICATED',
    });
  }

  // Check if user has SUPER_ADMIN role
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super Admin privileges required.',
      error: 'INSUFFICIENT_PERMISSIONS',
      requiredRole: 'SUPER_ADMIN',
      currentRole: req.user.role,
    });
  }

  next();
};

// ============================================================================
// PERMISSION-BASED AUTHORIZATION MIDDLEWARE
// ============================================================================

/**
 * Require Permission Middleware Factory
 *
 * Creates middleware that requires user to have specific permission(s)
 * Accepts variable number of permission arguments (AND logic by default)
 *
 * Must be used AFTER authenticate middleware
 *
 * @param {...string} permissions - One or more permissions to check
 * @returns {Function} Express middleware function
 *
 * @example
 *   // Single permission
 *   router.post('/newsletters', authenticate, requirePermission('create_newsletter'), controller.create);
 *
 *   // Multiple permissions (AND logic - user needs all of these)
 *   router.post('/projects/publish', authenticate, requirePermission('manage_projects', 'publish_project'), controller.publish);
 */
const requirePermission = (...permissions) => {
  return (req, res, next) => {
    // Verify user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        error: 'NOT_AUTHENTICATED',
      });
    }

    // Check if user has all required permissions
    const hasAllPerms = hasAllPermissions(req.user.role, permissions);

    if (!hasAllPerms) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permissions: ${permissions.join(', ')}.`,
        error: 'INSUFFICIENT_PERMISSIONS',
        requiredPermissions: permissions,
        currentRole: req.user.role,
      });
    }

    next();
  };
};

/**
 * Require Any Permission Middleware Factory
 *
 * Creates middleware that requires user to have at least one of the specified permissions
 * OR logic - user needs any one of the permissions
 *
 * Must be used AFTER authenticate middleware
 *
 * @param {...string} permissions - One or more permissions to check
 * @returns {Function} Express middleware function
 *
 * @example
 *   // User needs either edit OR publish permission
 *   router.put('/newsletters/:id', authenticate, requireAnyPermission('edit_newsletter', 'publish_newsletter'), controller.update);
 */
const requireAnyPermission = (...permissions) => {
  return (req, res, next) => {
    // Verify user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        error: 'NOT_AUTHENTICATED',
      });
    }

    // Check if user has any of the required permissions
    const hasAnyPerm = hasAnyPermission(req.user.role, permissions);

    if (!hasAnyPerm) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required one of: ${permissions.join(', ')}.`,
        error: 'INSUFFICIENT_PERMISSIONS',
        requiredPermissions: permissions,
        currentRole: req.user.role,
      });
    }

    next();
  };
};

// ============================================================================
// RESOURCE OWNERSHIP MIDDLEWARE
// ============================================================================

/**
 * Require Ownership Middleware Factory
 *
 * Creates middleware that verifies user owns the resource they're trying to access
 * Allows admins to bypass ownership check
 *
 * Expects req.params.id or req.params.userId to contain the resource owner's ID
 * Must be used AFTER authenticate middleware
 *
 * @param {string} resourceType - Type of resource to check ownership for
 * @returns {Function} Express middleware function
 *
 * @example
 *   // Only allow users to update their own profile (unless admin)
 *   router.put('/users/:id/profile', authenticate, requireOwnership('user'), controller.updateProfile);
 */
const requireOwnership = (resourceType = 'user') => {
  return (req, res, next) => {
    // Verify user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        error: 'NOT_AUTHENTICATED',
      });
    }

    // Admin users can access any resource
    if (req.user.isAdmin) {
      return next();
    }

    // Get resource owner ID from params
    const resourceOwnerId = req.params.id || req.params.userId;

    // Check if user is the owner of the resource
    if (resourceOwnerId && req.user._id.toString() === resourceOwnerId.toString()) {
      return next();
    }

    // User is not the owner and not an admin
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.',
      error: 'INSUFFICIENT_PERMISSIONS',
      resourceType,
    });
  };
};

/**
 * Require Self or Admin Middleware
 *
 * Allows user to access their own resource OR allows any admin to access it
 * Common pattern for profile updates, viewing own data, etc.
 *
 * Must be used AFTER authenticate middleware
 *
 * @param {Object} req - Express request object (must have req.user)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @example
 *   router.get('/users/:id/profile', authenticate, requireSelfOrAdmin, controller.getProfile);
 */
const requireSelfOrAdmin = (req, res, next) => {
  // Verify user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      error: 'NOT_AUTHENTICATED',
    });
  }

  // Get target user ID from params
  const targetUserId = req.params.id || req.params.userId;

  // Allow if user is accessing their own resource
  if (targetUserId && req.user._id.toString() === targetUserId.toString()) {
    return next();
  }

  // Allow if user is an admin
  if (req.user.isAdmin) {
    return next();
  }

  // User is neither owner nor admin
  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own profile or be an admin.',
    error: 'INSUFFICIENT_PERMISSIONS',
  });
};

// ============================================================================
// ACCOUNT STATUS MIDDLEWARE
// ============================================================================

/**
 * Require Approved Account Middleware
 *
 * Ensures user account is approved before allowing access
 * Useful for features that require verified accounts
 *
 * Must be used AFTER authenticate middleware
 *
 * @param {Object} req - Express request object (must have req.user)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @example
 *   router.post('/projects', authenticate, requireApprovedAccount, controller.createProject);
 */
const requireApprovedAccount = (req, res, next) => {
  // Verify user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      error: 'NOT_AUTHENTICATED',
    });
  }

  // Check if account is approved
  if (req.user.status !== 'APPROVED') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Your account must be approved to access this feature.',
      error: 'ACCOUNT_NOT_APPROVED',
      currentStatus: req.user.status,
    });
  }

  next();
};

// ============================================================================
// EXPORT MIDDLEWARE FUNCTIONS
// ============================================================================

module.exports = {
  // Role-based
  requireAdmin,
  requireRole,
  requireSuperAdmin,

  // Permission-based
  requirePermission,
  requireAnyPermission,

  // Resource ownership
  requireOwnership,
  requireSelfOrAdmin,

  // Account status
  requireApprovedAccount,
};

// ============================================================================
// END OF AUTHORIZATION MIDDLEWARE
// ============================================================================
