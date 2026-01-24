// ============================================================================
// OREPA Backend - Authentication Middleware
// ============================================================================
//
// Purpose:
//   Provides authentication and authorization middleware for protecting routes
//   Verifies JWT tokens and enforces role-based access control
//
// Features:
//   - JWT token verification
//   - User authentication
//   - Role-based authorization (admin, superadmin)
//   - Account status verification
//   - Error handling for invalid/expired tokens
//
// Dependencies:
//   - jsonwebtoken: JWT token verification
//   - User model: User document retrieval
//
// Environment Variables Required:
//   - JWT_SECRET: Secret key for JWT verification
//
// Usage:
//   const { authenticate, isAdmin, isSuperAdmin } = require('./middleware/auth');
//   router.get('/protected', authenticate, controller.getProtectedResource);
//   router.delete('/users/:id', authenticate, isAdmin, controller.deleteUser);
//
// ============================================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Authenticate Middleware
 *
 * Verifies JWT token and attaches authenticated user to request object
 *
 * Process:
 *   1. Extract token from Authorization header (Bearer token)
 *   2. Verify token signature and expiration
 *   3. Decode token payload to get user ID
 *   4. Fetch user from database
 *   5. Verify user exists and is active
 *   6. Attach user object to request
 *   7. Continue to next middleware
 *
 * Token Format:
 *   Authorization: Bearer <token>
 *
 * Success:
 *   - Sets req.user to authenticated user document
 *   - Calls next() to continue request processing
 *
 * Failure:
 *   - Returns 401 Unauthorized if token is missing, invalid, or expired
 *   - Returns 404 if user not found
 *   - Returns 403 if user account is inactive
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @example
 *   router.get('/profile', authenticate, async (req, res) => {
 *     // req.user contains authenticated user
 *     res.json({ user: req.user });
 *   });
 */
const authenticate = async (req, res, next) => {
  try {
    // ========================================================================
    // STEP 1: Extract Token from Authorization Header
    // ========================================================================

    // Get Authorization header value
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        error: 'MISSING_TOKEN',
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    // Format: "Bearer <token>" -> "<token>"
    const token = authHeader.substring(7);

    // Validate token exists after extraction
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.',
        error: 'INVALID_TOKEN_FORMAT',
      });
    }

    // ========================================================================
    // STEP 2: Verify JWT Token
    // ========================================================================

    // Get JWT secret from environment variables
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET is not defined in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error.',
        error: 'MISSING_JWT_SECRET',
      });
    }

    // Verify token signature and expiration
    // jwt.verify throws an error if token is invalid or expired
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      // Handle specific JWT errors
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please log in again.',
          error: 'TOKEN_EXPIRED',
        });
      }

      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Please log in again.',
          error: 'INVALID_TOKEN',
        });
      }

      // Other JWT errors
      return res.status(401).json({
        success: false,
        message: 'Token verification failed.',
        error: 'TOKEN_VERIFICATION_FAILED',
      });
    }

    // ========================================================================
    // STEP 3: Fetch User from Database
    // ========================================================================

    // Extract user ID from decoded token
    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload.',
        error: 'INVALID_TOKEN_PAYLOAD',
      });
    }

    // Fetch user from database
    // Exclude password field is not natively supported in simple findUnique but we can delete it later
    // or use select. For specific fields, select is better, but here we likely need most fields.
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Account may have been deleted.',
        error: 'USER_NOT_FOUND',
      });
    }

    // Remove password from user object
    delete user.password;

    // ========================================================================
    // STEP 4: Verify User Account Status
    // ========================================================================

    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact support.',
        error: 'ACCOUNT_INACTIVE',
      });
    }

    // Check if account is locked due to failed login attempts
    const isAccountLocked = user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date();

    if (isAccountLocked) {
      // Calculate remaining lockout time
      const lockoutEndsAt = new Date(user.accountLockedUntil);
      const remainingMinutes = Math.ceil((lockoutEndsAt - Date.now()) / (1000 * 60));

      return res.status(403).json({
        success: false,
        message: `Account temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
        error: 'ACCOUNT_LOCKED',
        lockoutEndsAt: lockoutEndsAt.toISOString(),
        remainingMinutes,
      });
    }

    // Check if user account is approved
    // Only approved users (and admins) can access protected resources
    if (user.status !== 'APPROVED') {
      // For non-admin users, require approval
      if (!user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Account is pending approval. Please wait for admin verification.',
          error: 'ACCOUNT_NOT_APPROVED',
          status: user.status,
        });
      }
    }

    // Check if account is suspended
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
        error: 'ACCOUNT_SUSPENDED',
      });
    }

    // ========================================================================
    // STEP 5: Attach User to Request and Continue
    // ========================================================================

    // Attach user object to request for use in subsequent middleware/controllers
    req.user = user;

    // Attach decoded token for additional info if needed
    req.token = decoded;

    // Continue to next middleware
    next();

  } catch (error) {
    // Catch any unexpected errors
    console.error('❌ Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed. Please try again.',
      error: 'AUTHENTICATION_ERROR',
    });
  }
};

// ============================================================================
// AUTHORIZATION MIDDLEWARE - ROLE-BASED ACCESS CONTROL
// ============================================================================

/**
 * Is Admin Middleware
 *
 * Verifies that authenticated user has any admin role
 * Must be used AFTER authenticate middleware
 *
 * Allowed Roles:
 *   - MEMBER_ADMIN
 *   - CONTENT_ADMIN
 *   - NEWSLETTER_ADMIN
 *   - SUPER_ADMIN
 *
 * Success:
 *   - Calls next() to continue request processing
 *
 * Failure:
 *   - Returns 403 Forbidden if user does not have admin privileges
 *
 * @param {Object} req - Express request object (must have req.user)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @example
 *   router.get('/admin/dashboard', authenticate, isAdmin, controller.getDashboard);
 */
const isAdmin = (req, res, next) => {
  // Verify user is attached to request (authentication passed)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      error: 'NOT_AUTHENTICATED',
    });
  }

  // Check if user has isAdmin flag set to true
  // This is more efficient than checking each role individually
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
      error: 'INSUFFICIENT_PERMISSIONS',
      currentRole: req.user.role,
    });
  }

  // User has admin privileges, continue
  next();
};

/**
 * Is Super Admin Middleware
 *
 * Verifies that authenticated user has SUPER_ADMIN role
 * Must be used AFTER authenticate middleware
 *
 * Allowed Roles:
 *   - SUPER_ADMIN only
 *
 * Success:
 *   - Calls next() to continue request processing
 *
 * Failure:
 *   - Returns 403 Forbidden if user does not have SUPER_ADMIN role
 *
 * @param {Object} req - Express request object (must have req.user)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @example
 *   router.post('/admin/create', authenticate, isSuperAdmin, controller.createAdmin);
 */
const isSuperAdmin = (req, res, next) => {
  // Verify user is attached to request (authentication passed)
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

  // User has required role, continue
  next();
};

/**
 * Is Member Middleware
 *
 * Verifies that authenticated user has at least MEMBER status
 * Must be used AFTER authenticate middleware
 *
 * Allowed Roles:
 *   - MEMBER (verified OREPA members)
 *   - All admin roles (MEMBER_ADMIN, CONTENT_ADMIN, NEWSLETTER_ADMIN, SUPER_ADMIN)
 *
 * Success:
 *   - Calls next() to continue request processing
 *
 * Failure:
 *   - Returns 403 Forbidden if user is not a member
 *
 * @param {Object} req - Express request object (must have req.user)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isMember = (req, res, next) => {
  // Verify user is attached to request (authentication passed)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      error: 'NOT_AUTHENTICATED',
    });
  }

  // Check if user has MEMBER role or any admin role
  const allowedRoles = ['MEMBER', 'MEMBER_ADMIN', 'CONTENT_ADMIN', 'NEWSLETTER_ADMIN', 'SUPER_ADMIN'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. OREPA membership required.',
      error: 'INSUFFICIENT_PERMISSIONS',
      requiredRole: 'MEMBER',
      currentRole: req.user.role,
    });
  }

  // User has required role, continue
  next();
};

// ============================================================================
// EXPORT MIDDLEWARE FUNCTIONS
// ============================================================================

module.exports = {
  authenticate,
  isAdmin,
  isSuperAdmin,
  isMember,
};

// ============================================================================
// END OF AUTHENTICATION MIDDLEWARE
// ============================================================================
