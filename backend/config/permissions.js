// ============================================================================
// OREPA Backend - Permissions Configuration
// ============================================================================
//
// Purpose:
//   Centralized permission definitions and role-permission mappings
//   Provides helper functions for permission checking
//
// Features:
//   - All permissions defined as constants
//   - Role-to-permission mappings
//   - Helper functions for permission checks
//   - Easy to extend with new permissions
//
// Usage:
//   const { PERMISSIONS, hasPermission, getRolePermissions } = require('./config/permissions');
//   if (hasPermission(user.role, PERMISSIONS.CREATE_ADMIN)) { ... }
//
// ============================================================================

// ============================================================================
// PERMISSION CONSTANTS
// ============================================================================

/**
 * All Available Permissions
 *
 * Comprehensive list of all permissions in the system
 * Grouped by category for easy management
 */
const PERMISSIONS = {
  // ==========================================================================
  // USER MANAGEMENT PERMISSIONS
  // ==========================================================================

  /**
   * Manage All Users
   * - View all users in the system
   * - Edit user profiles
   * - View user analytics
   */
  MANAGE_ALL_USERS: 'manage_all_users',

  /**
   * Approve User
   * - Approve pending user registrations
   * - Change user status from PENDING to APPROVED
   */
  APPROVE_USER: 'approve_user',

  /**
   * Reject User
   * - Reject pending user registrations
   * - Change user status from PENDING to REJECTED
   */
  REJECT_USER: 'reject_user',

  /**
   * Suspend User
   * - Temporarily suspend user accounts
   * - Change user status to SUSPENDED
   */
  SUSPEND_USER: 'suspend_user',

  /**
   * Delete User
   * - Permanently delete user accounts
   * - Typically restricted to SUPER_ADMIN
   */
  DELETE_USER: 'delete_user',

  // ==========================================================================
  // ADMIN MANAGEMENT PERMISSIONS
  // ==========================================================================

  /**
   * Create Admin
   * - Create new admin accounts
   * - Assign admin roles to users
   * - Restricted to SUPER_ADMIN only
   */
  CREATE_ADMIN: 'create_admin',

  /**
   * Delete Admin
   * - Delete admin accounts
   * - Restricted to SUPER_ADMIN only
   */
  DELETE_ADMIN: 'delete_admin',

  /**
   * Change Role
   * - Change user roles (including admin roles)
   * - Restricted to SUPER_ADMIN only
   */
  CHANGE_ROLE: 'change_role',

  /**
   * Manage Admins
   * - View all admin accounts
   * - View admin activity logs
   */
  MANAGE_ADMINS: 'manage_admins',

  // ==========================================================================
  // NEWSLETTER PERMISSIONS
  // ==========================================================================

  /**
   * Create Newsletter
   * - Create new newsletter drafts
   */
  CREATE_NEWSLETTER: 'create_newsletter',

  /**
   * Edit Newsletter
   * - Edit newsletter content and settings
   * - Update newsletter drafts
   */
  EDIT_NEWSLETTER: 'edit_newsletter',

  /**
   * Publish Newsletter
   * - Publish newsletters to subscribers
   * - Schedule newsletter sends
   */
  PUBLISH_NEWSLETTER: 'publish_newsletter',

  /**
   * Delete Newsletter
   * - Delete newsletter drafts
   * - Remove published newsletters
   */
  DELETE_NEWSLETTER: 'delete_newsletter',

  /**
   * Manage Subscribers
   * - View subscriber list
   * - Add/remove subscribers
   * - Export subscriber data
   */
  MANAGE_SUBSCRIBERS: 'manage_subscribers',

  /**
   * View Newsletter Analytics
   * - View open rates, click rates
   * - View subscriber statistics
   */
  VIEW_NEWSLETTER_ANALYTICS: 'view_newsletter_analytics',

  // ==========================================================================
  // CONTENT MANAGEMENT PERMISSIONS
  // ==========================================================================

  /**
   * Manage Projects
   * - Create, edit, delete projects
   * - Publish/unpublish projects
   */
  MANAGE_PROJECTS: 'manage_projects',

  /**
   * Manage LMS Content
   * - Create, edit, delete LMS courses and lessons
   * - Upload course materials
   */
  MANAGE_LMS: 'manage_lms',

  /**
   * Manage Scholarships
   * - Create, edit, delete scholarship listings
   * - Update scholarship details
   */
  MANAGE_SCHOLARSHIPS: 'manage_scholarships',

  /**
   * Upload Files
   * - Upload images, documents, videos
   * - Manage media library
   */
  UPLOAD_FILES: 'upload_files',

  /**
   * Delete Files
   * - Delete uploaded files from media library
   */
  DELETE_FILES: 'delete_files',

  /**
   * Edit Pages
   * - Edit website page content
   * - Update static pages
   */
  EDIT_PAGES: 'edit_pages',

  /**
   * Manage Gallery
   * - Upload/delete gallery images
   * - Organize gallery albums
   */
  MANAGE_GALLERY: 'manage_gallery',

  /**
   * View Content Analytics
   * - View page visit statistics
   * - View content engagement metrics
   */
  VIEW_CONTENT_ANALYTICS: 'view_content_analytics',

  // ==========================================================================
  // SYSTEM PERMISSIONS
  // ==========================================================================

  /**
   * View Analytics
   * - View system-wide analytics
   * - View dashboard statistics
   */
  VIEW_ANALYTICS: 'view_analytics',

  /**
   * View Audit Logs
   * - View admin action logs
   * - View system activity logs
   */
  VIEW_AUDIT_LOGS: 'view_audit_logs',

  /**
   * System Settings
   * - Change system configuration
   * - Update environment settings
   * - Restricted to SUPER_ADMIN only
   */
  SYSTEM_SETTINGS: 'system_settings',

  /**
   * Database Operations
   * - Backup database
   * - Restore database
   * - Run migrations
   * - Restricted to SUPER_ADMIN only
   */
  DATABASE_OPERATIONS: 'database_operations',

  /**
   * Manage API Keys
   * - Generate API keys
   * - Revoke API keys
   * - View API usage
   */
  MANAGE_API_KEYS: 'manage_api_keys',
};

// ============================================================================
// ROLE-PERMISSION MAPPINGS
// ============================================================================

/**
 * Role Permissions Mapping
 *
 * Defines which permissions each role has
 * Super Admin has all permissions
 * Other roles have specific subsets
 */
const ROLE_PERMISSIONS = {
  // ==========================================================================
  // SUPER ADMIN - All Permissions
  // ==========================================================================

  /**
   * Super Admin
   * - Has all permissions in the system
   * - Full control over all features
   * - Can create other admins
   */
  SUPER_ADMIN: Object.values(PERMISSIONS),

  // ==========================================================================
  // MEMBER ADMIN - User Management Focused
  // ==========================================================================

  /**
   * Member Admin
   * - Manages user registrations and approvals
   * - Views member analytics
   * - Handles member-related tasks
   */
  MEMBER_ADMIN: [
    // User management
    PERMISSIONS.MANAGE_ALL_USERS,
    PERMISSIONS.APPROVE_USER,
    PERMISSIONS.REJECT_USER,
    PERMISSIONS.SUSPEND_USER,

    // Analytics
    PERMISSIONS.VIEW_ANALYTICS,

    // System
    PERMISSIONS.VIEW_AUDIT_LOGS,
  ],

  // ==========================================================================
  // NEWSLETTER ADMIN - Newsletter Management Focused
  // ==========================================================================

  /**
   * Newsletter Admin
   * - Manages all newsletter operations
   * - Handles subscriber management
   * - Views newsletter analytics
   */
  NEWSLETTER_ADMIN: [
    // Newsletter management
    PERMISSIONS.CREATE_NEWSLETTER,
    PERMISSIONS.EDIT_NEWSLETTER,
    PERMISSIONS.PUBLISH_NEWSLETTER,
    PERMISSIONS.DELETE_NEWSLETTER,
    PERMISSIONS.MANAGE_SUBSCRIBERS,
    PERMISSIONS.VIEW_NEWSLETTER_ANALYTICS,

    // Analytics
    PERMISSIONS.VIEW_ANALYTICS,
  ],

  // ==========================================================================
  // CONTENT ADMIN - Content Management Focused
  // ==========================================================================

  /**
   * Content Admin
   * - Manages all website content
   * - Handles projects, LMS, scholarships
   * - Manages media library
   */
  CONTENT_ADMIN: [
    // Content management
    PERMISSIONS.MANAGE_PROJECTS,
    PERMISSIONS.MANAGE_LMS,
    PERMISSIONS.MANAGE_SCHOLARSHIPS,
    PERMISSIONS.UPLOAD_FILES,
    PERMISSIONS.DELETE_FILES,
    PERMISSIONS.EDIT_PAGES,
    PERMISSIONS.MANAGE_GALLERY,
    PERMISSIONS.VIEW_CONTENT_ANALYTICS,

    // Analytics
    PERMISSIONS.VIEW_ANALYTICS,
  ],

  // ==========================================================================
  // REGULAR USERS - No Admin Permissions
  // ==========================================================================

  /**
   * Member
   * - Verified OREPA member
   * - No admin permissions
   * - Can access member-only features
   */
  MEMBER: [],

  /**
   * User
   * - Regular user
   * - No admin permissions
   * - Basic access only
   */
  USER: [],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if User Role Has Specific Permission
 *
 * Determines if a given role has a specific permission
 * Returns true if role has the permission, false otherwise
 *
 * @param {string} userRole - Role to check (e.g., 'SUPER_ADMIN', 'MEMBER_ADMIN')
 * @param {string} permission - Permission to check (e.g., 'create_admin')
 * @returns {boolean} True if role has permission
 *
 * @example
 *   if (hasPermission(user.role, PERMISSIONS.CREATE_ADMIN)) {
 *     // Allow admin creation
 *   }
 */
function hasPermission(userRole, permission) {
  // Get permissions for this role
  const rolePermissions = ROLE_PERMISSIONS[userRole];

  // If role not found or has no permissions, return false
  if (!rolePermissions || rolePermissions.length === 0) {
    return false;
  }

  // Check if permission exists in role's permissions
  return rolePermissions.includes(permission);
}

/**
 * Check if User Role Has Any of the Specified Permissions
 *
 * Determines if a role has at least one of the specified permissions
 * Useful for OR logic (user needs permission A OR B)
 *
 * @param {string} userRole - Role to check
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean} True if role has any of the permissions
 *
 * @example
 *   if (hasAnyPermission(user.role, [PERMISSIONS.EDIT_NEWSLETTER, PERMISSIONS.PUBLISH_NEWSLETTER])) {
 *     // User can edit OR publish newsletters
 *   }
 */
function hasAnyPermission(userRole, permissions) {
  // Get permissions for this role
  const rolePermissions = ROLE_PERMISSIONS[userRole];

  // If role not found or has no permissions, return false
  if (!rolePermissions || rolePermissions.length === 0) {
    return false;
  }

  // Check if any of the required permissions exist in role's permissions
  return permissions.some((permission) => rolePermissions.includes(permission));
}

/**
 * Check if User Role Has All of the Specified Permissions
 *
 * Determines if a role has all of the specified permissions
 * Useful for AND logic (user needs permission A AND B)
 *
 * @param {string} userRole - Role to check
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean} True if role has all of the permissions
 *
 * @example
 *   if (hasAllPermissions(user.role, [PERMISSIONS.CREATE_PROJECT, PERMISSIONS.PUBLISH_PROJECT])) {
 *     // User can both create AND publish projects
 *   }
 */
function hasAllPermissions(userRole, permissions) {
  // Get permissions for this role
  const rolePermissions = ROLE_PERMISSIONS[userRole];

  // If role not found or has no permissions, return false
  if (!rolePermissions || rolePermissions.length === 0) {
    return false;
  }

  // Check if all required permissions exist in role's permissions
  return permissions.every((permission) => rolePermissions.includes(permission));
}

/**
 * Get All Permissions for a Role
 *
 * Returns array of all permissions that a role has
 * Useful for displaying permissions in UI
 *
 * @param {string} userRole - Role to get permissions for
 * @returns {string[]} Array of permission strings
 *
 * @example
 *   const permissions = getRolePermissions('CONTENT_ADMIN');
 *   // Returns: ['manage_projects', 'manage_lms', 'manage_scholarships', ...]
 */
function getRolePermissions(userRole) {
  return ROLE_PERMISSIONS[userRole] || [];
}

/**
 * Check if User Can Access Resource Type
 *
 * Determines if a role can access a specific resource type
 * Maps resource types to required permissions
 *
 * @param {string} userRole - Role to check
 * @param {string} resourceType - Type of resource (e.g., 'newsletter', 'project', 'user')
 * @returns {boolean} True if role can access resource type
 *
 * @example
 *   if (canAccessResource(user.role, 'newsletter')) {
 *     // User can access newsletter features
 *   }
 */
function canAccessResource(userRole, resourceType) {
  // Map resource types to required permissions
  const resourcePermissionMap = {
    newsletter: [
      PERMISSIONS.CREATE_NEWSLETTER,
      PERMISSIONS.EDIT_NEWSLETTER,
      PERMISSIONS.PUBLISH_NEWSLETTER,
      PERMISSIONS.DELETE_NEWSLETTER,
    ],
    project: [PERMISSIONS.MANAGE_PROJECTS],
    lms: [PERMISSIONS.MANAGE_LMS],
    scholarship: [PERMISSIONS.MANAGE_SCHOLARSHIPS],
    user: [
      PERMISSIONS.MANAGE_ALL_USERS,
      PERMISSIONS.APPROVE_USER,
      PERMISSIONS.REJECT_USER,
      PERMISSIONS.SUSPEND_USER,
    ],
    admin: [PERMISSIONS.CREATE_ADMIN, PERMISSIONS.DELETE_ADMIN, PERMISSIONS.MANAGE_ADMINS],
  };

  // Get required permissions for this resource type
  const requiredPermissions = resourcePermissionMap[resourceType.toLowerCase()];

  // If resource type not found, return false
  if (!requiredPermissions) {
    return false;
  }

  // Check if user has any of the required permissions
  return hasAnyPermission(userRole, requiredPermissions);
}

/**
 * Check if Role is Admin
 *
 * Quick check to see if a role is an admin role
 * Returns true for any admin role, false for USER and MEMBER
 *
 * @param {string} userRole - Role to check
 * @returns {boolean} True if role is an admin role
 *
 * @example
 *   if (isAdminRole(user.role)) {
 *     // Show admin dashboard
 *   }
 */
function isAdminRole(userRole) {
  const adminRoles = ['SUPER_ADMIN', 'MEMBER_ADMIN', 'CONTENT_ADMIN', 'NEWSLETTER_ADMIN'];
  return adminRoles.includes(userRole);
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Constants
  PERMISSIONS,
  ROLE_PERMISSIONS,

  // Helper functions
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  canAccessResource,
  isAdminRole,
};

// ============================================================================
// END OF PERMISSIONS CONFIGURATION
// ============================================================================
