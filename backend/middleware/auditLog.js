// ============================================================================
// OREPA Backend - Audit Logging Middleware
// ============================================================================
//
// Purpose:
//   Automatically logs all admin actions for accountability and security
//   Creates audit trail in AdminActionLog collection
//
// Features:
//   - Automatic logging of admin actions
//   - Captures request/response details
//   - Records IP address and user agent
//   - Stores before/after states for data changes
//   - Middleware factory pattern for flexibility
//
// Dependencies:
//   - AdminActionLog model: For storing audit logs
//
// Usage:
//   const { logAdminAction } = require('./middleware/auditLog');
//   router.post('/users/approve', authenticate, requireAdmin, logAdminAction('APPROVE_USER'), controller.approve);
//
// ============================================================================

const AdminActionLog = require('../models/AdminActionLog');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================================================
// AUDIT LOGGING MIDDLEWARE
// ============================================================================

/**
 * Log Admin Action Middleware Factory
 *
 * Creates middleware that automatically logs admin actions after successful execution
 * Captures admin details, action type, resource info, and request metadata
 *
 * How it works:
 *   1. Stores original res.json and res.send methods
 *   2. Overrides them to intercept response
 *   3. After successful response (2xx status), creates audit log
 *   4. Calls original response method to send data to client
 *
 * Must be used AFTER authenticate middleware (needs req.user)
 *
 * @param {string} actionType - Type of action being performed (e.g., 'CREATE_USER', 'APPROVE_USER')
 * @param {Object} options - Optional configuration
 * @param {Function} options.getResourceId - Function to extract resource ID from req/res
 * @param {Function} options.getDescription - Function to generate description from req/res
 * @param {Function} options.getBeforeState - Function to capture before state
 * @param {Function} options.getAfterState - Function to capture after state
 * @returns {Function} Express middleware function
 *
 * @example
 *   // Simple usage
 *   router.post('/users/:id/approve', authenticate, requireAdmin, logAdminAction('APPROVE_USER'), controller.approve);
 *
 *   // Advanced usage with custom resource extraction
 *   router.post('/users', authenticate, requireSuperAdmin, logAdminAction('CREATE_USER', {
 *     getResourceId: (req, res) => res.locals.createdUserId,
 *     getDescription: (req, res) => `Created user: ${req.body.email}`,
 *     getAfterState: (req, res) => res.locals.createdUser
 *   }), controller.createUser);
 */
const logAdminAction = (actionType, options = {}) => {
  return async (req, res, next) => {
    // ========================================================================
    // VALIDATION
    // ========================================================================

    // Verify user is authenticated and is an admin
    if (!req.user || !req.user.isAdmin) {
      // If not authenticated or not admin, skip logging and continue
      // (auth middleware will handle rejection)
      return next();
    }

    // ========================================================================
    // STORE ORIGINAL RESPONSE METHODS
    // ========================================================================

    // Store the original json and send methods
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    // Variable to track if response has been sent (prevent double logging)
    let responseSent = false;

    // ========================================================================
    // LOGGING FUNCTION
    // ========================================================================

    /**
     * Create Audit Log Entry
     *
     * Creates a log entry in the database with all relevant information
     */
    const createAuditLog = async (responseData) => {
      // Prevent double logging
      if (responseSent) return;
      responseSent = true;

      try {
        // Extract resource information
        const resourceId = options.getResourceId
          ? options.getResourceId(req, res)
          : req.params.id || req.params.userId || null;

        const resourceType = options.getResourceType
          ? options.getResourceType(req, res)
          : determineResourceType(actionType);

        // Generate description
        const description = options.getDescription
          ? options.getDescription(req, res)
          : generateDefaultDescription(actionType, req);

        // Capture state (if applicable)
        const beforeState = options.getBeforeState
          ? options.getBeforeState(req, res)
          : res.locals.beforeState || null;

        const afterState = options.getAfterState
          ? options.getAfterState(req, res)
          : res.locals.afterState || responseData || null;

        // Create audit log entry
        await AdminActionLog.create({
          admin: req.user._id,
          adminEmail: req.user.email,
          adminRole: req.user.role,
          action: actionType,
          resourceType,
          resourceId,
          description,
          beforeState,
          afterState,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          timestamp: new Date(),
        });

        // Log success in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`📝 Audit log created: ${actionType} by ${req.user.email}`);
        }
      } catch (error) {
        // Log error but don't fail the request
        console.error('❌ Error creating audit log:', error);
      }
    };

    // ========================================================================
    // OVERRIDE RESPONSE METHODS
    // ========================================================================

    /**
     * Override res.json
     *
     * Intercepts JSON responses to log before sending
     */
    res.json = function (data) {
      // Only log if response is successful (2xx status code)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Create audit log asynchronously (don't wait)
        createAuditLog(data);
      }

      // Call original json method to send response
      return originalJson(data);
    };

    /**
     * Override res.send
     *
     * Intercepts send responses to log before sending
     */
    res.send = function (data) {
      // Only log if response is successful (2xx status code)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Create audit log asynchronously (don't wait)
        createAuditLog(data);
      }

      // Call original send method to send response
      return originalSend(data);
    };

    // ========================================================================
    // CONTINUE TO NEXT MIDDLEWARE
    // ========================================================================

    next();
  };
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Determine Resource Type from Action
 *
 * Attempts to determine resource type based on action name
 * Returns best guess or null
 *
 * @param {string} actionType - Action type
 * @returns {string|null} Resource type or null
 */
function determineResourceType(actionType) {
  const actionLower = actionType.toLowerCase();

  if (actionLower.includes('user')) return 'User';
  if (actionLower.includes('admin')) return 'Admin';
  if (actionLower.includes('newsletter')) return 'Newsletter';
  if (actionLower.includes('project')) return 'Project';
  if (actionLower.includes('lms')) return 'LMS';
  if (actionLower.includes('scholarship')) return 'Scholarship';
  if (actionLower.includes('content')) return 'Content';

  return null;
}

/**
 * Generate Default Description
 *
 * Creates a human-readable description of the action
 * Based on action type and request details
 *
 * @param {string} actionType - Action type
 * @param {Object} req - Express request object
 * @returns {string} Description
 */
function generateDefaultDescription(actionType, req) {
  const descriptions = {
    // User actions
    CREATE_USER: `Created new user: ${req.body.email || 'unknown'}`,
    UPDATE_USER: `Updated user: ${req.params.id}`,
    DELETE_USER: `Deleted user: ${req.params.id}`,
    APPROVE_USER: `Approved user registration: ${req.params.id || req.params.userId}`,
    REJECT_USER: `Rejected user registration: ${req.params.id || req.params.userId}`,
    SUSPEND_USER: `Suspended user account: ${req.params.id}`,
    REACTIVATE_USER: `Reactivated user account: ${req.params.id}`,

    // Admin actions
    CREATE_ADMIN: `Created new admin: ${req.body.email || 'unknown'}`,
    DELETE_ADMIN: `Deleted admin account: ${req.params.id}`,
    CHANGE_ROLE: `Changed user role: ${req.params.id}`,

    // Newsletter actions
    CREATE_NEWSLETTER: `Created newsletter: ${req.body.title || 'Untitled'}`,
    UPDATE_NEWSLETTER: `Updated newsletter: ${req.params.id}`,
    DELETE_NEWSLETTER: `Deleted newsletter: ${req.params.id}`,
    PUBLISH_NEWSLETTER: `Published newsletter: ${req.params.id}`,
    SCHEDULE_NEWSLETTER: `Scheduled newsletter: ${req.params.id}`,

    // Project actions
    CREATE_PROJECT: `Created project: ${req.body.title || 'Untitled'}`,
    UPDATE_PROJECT: `Updated project: ${req.params.id}`,
    DELETE_PROJECT: `Deleted project: ${req.params.id}`,
    PUBLISH_PROJECT: `Published project: ${req.params.id}`,

    // LMS actions
    CREATE_LMS_CONTENT: `Created LMS content: ${req.body.title || 'Untitled'}`,
    UPDATE_LMS_CONTENT: `Updated LMS content: ${req.params.id}`,
    DELETE_LMS_CONTENT: `Deleted LMS content: ${req.params.id}`,

    // Scholarship actions
    CREATE_SCHOLARSHIP: `Created scholarship: ${req.body.title || 'Untitled'}`,
    UPDATE_SCHOLARSHIP: `Updated scholarship: ${req.params.id}`,
    DELETE_SCHOLARSHIP: `Deleted scholarship: ${req.params.id}`,

    // Content actions
    UPDATE_CONTENT: `Updated content: ${req.params.id || 'page'}`,
    UPLOAD_FILE: `Uploaded file: ${req.file?.originalname || 'unknown'}`,
    DELETE_FILE: `Deleted file: ${req.params.id}`,

    // System actions
    LOGIN: `Admin logged in`,
    LOGOUT: `Admin logged out`,
    CHANGE_SETTINGS: `Changed system settings`,
  };

  return descriptions[actionType] || `Performed action: ${actionType}`;
}

/**
 * Simple Audit Log Function
 *
 * Simplified function for logging actions directly (not as middleware)
 * Useful for logging actions that don't go through a route handler
 *
 * @param {Object} params - Logging parameters
 * @param {Object} params.admin - Admin user object
 * @param {string} params.action - Action type
 * @param {string} params.resourceType - Resource type (optional)
 * @param {string} params.resourceId - Resource ID (optional)
 * @param {string} params.description - Description (optional)
 * @param {string} params.ipAddress - IP address (optional)
 * @param {string} params.userAgent - User agent (optional)
 * @returns {Promise<AdminActionLog>} Created log entry
 *
 * @example
 *   await logAction({
 *     admin: req.user,
 *     action: 'LOGIN',
 *     description: 'Admin logged in successfully',
 *     ipAddress: req.ip,
 *     userAgent: req.headers['user-agent']
 *   });
 */
async function logAction(params) {
  const { admin, action, resourceType, resourceId, description, ipAddress, userAgent, beforeState, afterState } =
    params;

  try {
    return await prisma.adminActionLog.create({
      data: {
      adminId: admin.id,
      adminEmail: admin.email,
      adminRole: admin.role,
      action,
      resourceType: resourceType || null,
      resourceId: resourceId || null,
      description: description || '',
      beforeState: beforeState ?? undefined,
      afterState: afterState ?? undefined,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      // timestamp default(now())
      }
    });
  } catch (error) {
    console.error('❌ Error creating audit log:', error);
    return null;
  }
}

// ============================================================================
// EXPORT MIDDLEWARE AND FUNCTIONS
// ============================================================================

module.exports = {
  logAdminAction,
  logAction,
};

// ============================================================================
// END OF AUDIT LOGGING MIDDLEWARE
// ============================================================================
