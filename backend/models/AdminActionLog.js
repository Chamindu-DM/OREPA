// ============================================================================
// OREPA Backend - Admin Action Log Model (Prisma)
// ============================================================================
//
// Purpose:
//   Defines the AdminActionLog model methods for PostgreSQL using Prisma
//   Tracks who did what, when, and provides accountability
//
// Dependencies:
//   - @prisma/client: PostgreSQL ORM
//
// Usage:
//   const AdminActionLog = require('./models/AdminActionLog');
//   await AdminActionLog.create({ adminId: userId, action: 'CREATE_USER', ... });
//
// ============================================================================

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ============================================================================
// ADMIN ACTION LOG MODEL METHODS
// ============================================================================

const AdminActionLog = {
  /**
   * Create a new admin action log entry
   * @param {Object} logData - Log data
   * @returns {Promise<Object>} Created log entry
   */
  async create(logData) {
    return await prisma.adminActionLog.create({
      data: logData,
    });
  },

  /**
   * Find logs by admin ID
   * @param {string} adminId - Admin user ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of log entries
   */
  async findByAdminId(adminId, options = {}) {
    return await prisma.adminActionLog.findMany({
      where: { adminId },
      ...options,
    });
  },

  /**
   * Find logs by action type
   * @param {string} action - Action type
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of log entries
   */
  async findByAction(action, options = {}) {
    return await prisma.adminActionLog.findMany({
      where: { action },
      ...options,
    });
  },

  /**
   * Find logs within a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of log entries
   */
  async findByDateRange(startDate, endDate, options = {}) {
    return await prisma.adminActionLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      ...options,
    });
  },

  /**
   * Find all logs with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of log entries
   */
  async findAll(options = {}) {
    return await prisma.adminActionLog.findMany(options);
  },

  /**
   * Count logs by criteria
   * @param {Object} where - Query criteria
   * @returns {Promise<number>} Count of logs
   */
  async count(where = {}) {
    return await prisma.adminActionLog.count({ where });
  },

  /**
   * Get log statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    const total = await this.count();
    const actionGroups = await prisma.adminActionLog.groupBy({
      by: ['action'],
      _count: {
        id: true,
      },
    });

    return {
      total,
      byAction: actionGroups.reduce((acc, item) => {
        acc[item.action] = item._count.id;
        return acc;
      }, {}),
    };
  },
};

// ============================================================================
// EXPORT MODEL
// ============================================================================

module.exports = AdminActionLog;
module.exports.prisma = prisma;
