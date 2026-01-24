// ============================================================================
// OREPA Backend - User Model (Prisma)
// ============================================================================
//
// Purpose:
//   Defines the User model methods for PostgreSQL using Prisma
//   Handles user authentication, authorization, and profile management
//
// Features:
//   - Email-based authentication
//   - Password hashing with bcrypt
//   - Role-based access control (user, member, admin, superadmin)
//   - User status management (pending, approved, rejected)
//   - Helper methods for user operations
//
// Dependencies:
//   - @prisma/client: PostgreSQL ORM
//   - bcryptjs: Password hashing
//
// Usage:
//   const UserModel = require('./models/User');
//   const user = await UserModel.create({ email, password, firstName, lastName });
//
// ============================================================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// ============================================================================
// USER MODEL METHODS
// ============================================================================

const UserModel = {
  // ==========================================================================
  // HELPER METHODS FOR PASSWORD
  // ==========================================================================

  /**
   * Hash Password
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  },

  /**
   * Compare Password
   * @param {string} candidatePassword - Plain text password to compare
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} True if passwords match
   */
  async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  },

  /**
   * Generate Auth Token
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  generateAuthToken(user) {
    const JWT_SECRET = process.env.JWT_SECRET;
    const JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';

    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );
  },

  // ==========================================================================
  // CRUD OPERATIONS
  // ==========================================================================

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async create(userData) {
    // Hash password before creating
    if (userData.password) {
      userData.password = await this.hashPassword(userData.password);
    }

    // Convert batch to integer if it's a string
    if (userData.batch && typeof userData.batch === 'string') {
      userData.batch = parseInt(userData.batch, 10);
    }

    // Set isAdmin based on role
    const adminRoles = ['MEMBER_ADMIN', 'CONTENT_ADMIN', 'NEWSLETTER_ADMIN', 'SUPER_ADMIN'];
    userData.isAdmin = adminRoles.includes(userData.role || 'USER');

    return await prisma.user.create({
      data: userData,
    });
  },

  /**
   * Find user by email
   * @param {string} email - User email
   * @param {boolean} includePassword - Whether to include password field
   * @returns {Promise<Object|null>} User object or null
   */
  async findByEmail(email, includePassword = false) {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: includePassword ? undefined : undefined,
    });
  },

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
    });
  },

  /**
   * Find one user by criteria
   * @param {Object} where - Query criteria
   * @returns {Promise<Object|null>} User object or null
   */
  async findOne(where) {
    return await prisma.user.findFirst({
      where,
    });
  },

  /**
   * Find multiple users
   * @param {Object} options - Query options (where, orderBy, skip, take)
   * @returns {Promise<Array>} Array of users
   */
  async find(options = {}) {
    return await prisma.user.findMany(options);
  },

  /**
   * Update user by ID
   * @param {string} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async update(id, updateData) {
    // Hash password if it's being updated
    if (updateData.password) {
      updateData.password = await this.hashPassword(updateData.password);
    }

    // Convert batch to integer if it's a string
    if (updateData.batch && typeof updateData.batch === 'string') {
      updateData.batch = parseInt(updateData.batch, 10);
    }

    // Update isAdmin based on role if role is being updated
    if (updateData.role) {
      const adminRoles = ['MEMBER_ADMIN', 'CONTENT_ADMIN', 'NEWSLETTER_ADMIN', 'SUPER_ADMIN'];
      updateData.isAdmin = adminRoles.includes(updateData.role);
    }

    return await prisma.user.update({
      where: { id },
      data: updateData,
    });
  },

  /**
   * Delete user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} Deleted user
   */
  async delete(id) {
    return await prisma.user.delete({
      where: { id },
    });
  },

  /**
   * Count users by criteria
   * @param {Object} where - Query criteria
   * @returns {Promise<number>} Count of users
   */
  async count(where = {}) {
    return await prisma.user.count({ where });
  },

  // ==========================================================================
  // AUTHENTICATION METHODS
  // ==========================================================================

  /**
   * Update last login timestamp
   * @param {string} id - User ID
   * @returns {Promise<Object>} Updated user
   */
  async updateLastLogin(id) {
    return await this.update(id, { lastLogin: new Date() });
  },

  /**
   * Increment login attempts
   * @param {string} id - User ID
   * @param {number} currentAttempts - Current login attempts
   * @returns {Promise<Object>} Updated user
   */
  async incrementLoginAttempts(id, currentAttempts) {
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes

    const updateData = {
      loginAttempts: currentAttempts + 1,
    };

    if (currentAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
      updateData.accountLockedUntil = new Date(Date.now() + LOCK_DURATION);
    }

    return await this.update(id, updateData);
  },

  /**
   * Reset login attempts
   * @param {string} id - User ID
   * @returns {Promise<Object>} Updated user
   */
  async resetLoginAttempts(id) {
    return await this.update(id, {
      loginAttempts: 0,
      accountLockedUntil: null,
    });
  },

  /**
   * Check if account is locked
   * @param {Object} user - User object
   * @returns {boolean} True if account is locked
   */
  isAccountLocked(user) {
    return user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date();
  },

  /**
   * Check if user is approved
   * @param {Object} user - User object
   * @returns {boolean} True if user is approved and active
   */
  isApproved(user) {
    return user.status === 'APPROVED' && user.isActive;
  },

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Get full name
   * @param {Object} user - User object
   * @returns {string} Full name
   */
  getFullName(user) {
    return `${user.firstName} ${user.lastName}`;
  },

  /**
   * Sanitize user object (remove sensitive fields)
   * @param {Object} user - User object
   * @returns {Object} Sanitized user
   */
  sanitize(user) {
    if (!user) return null;
    const { password, ...sanitized } = user;
    return sanitized;
  },

  /**
   * Generate OREPA SC ID
   * @returns {Promise<string>} Generated ID (e.g., SC/25/0001)
   */
  async generateOrepaSCId() {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const idPrefix = `SC/${currentYear}/`;

    // Find the last user with an ID matching the current year's prefix
    const lastUser = await prisma.user.findFirst({
      where: {
        orepaSCId: {
          startsWith: idPrefix,
        },
      },
      orderBy: {
        orepaSCId: 'desc',
      },
    });

    let sequence = 1;
    if (lastUser && lastUser.orepaSCId) {
      const parts = lastUser.orepaSCId.split('/');
      if (parts.length === 3) {
        sequence = parseInt(parts[2], 10) + 1;
      }
    }

    return `${idPrefix}${String(sequence).padStart(4, '0')}`;
  },

  // ==========================================================================
  // AGGREGATE QUERIES
  // ==========================================================================

  /**
   * Get user statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    const [total, pending, approved, rejected, suspended, members, admins] = await Promise.all([
      this.count(),
      this.count({ status: 'PENDING' }),
      this.count({ status: 'APPROVED' }),
      this.count({ status: 'REJECTED' }),
      this.count({ status: 'SUSPENDED' }),
      this.count({ role: 'MEMBER' }),
      this.count({ isAdmin: true }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      suspended,
      members,
      admins,
    };
  },

  /**
   * Get users grouped by status
   * @returns {Promise<Object>} Object with status counts
   */
  async groupByStatus() {
    const statuses = await prisma.user.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    return statuses.reduce((acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {});
  },

  /**
   * Get users grouped by role
   * @returns {Promise<Object>} Object with role counts
   */
  async groupByRole() {
    const roles = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    return roles.reduce((acc, item) => {
      acc[item.role] = item._count.id;
      return acc;
    }, {});
  },
};

// ============================================================================
// EXPORT MODEL
// ============================================================================

module.exports = UserModel;
module.exports.prisma = prisma;

// ============================================================================
// END OF USER MODEL
// ============================================================================
