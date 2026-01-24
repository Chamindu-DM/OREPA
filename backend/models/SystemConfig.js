// ============================================================================
// OREPA Backend - System Configuration Model (Prisma)
// ============================================================================
//
// Purpose:
//   Manages system-wide configuration settings that can be modified by
//   Super Admin without requiring code changes or server restarts
//
// Dependencies:
//   - @prisma/client: PostgreSQL ORM
//
// Usage:
//   const SystemConfig = require('./models/SystemConfig');
//   const config = await SystemConfig.findByKey('site_name');
//   await SystemConfig.updateConfig('maintenance_mode', true, adminUserId);
//
// ============================================================================

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ============================================================================
// SYSTEM CONFIG MODEL METHODS
// ============================================================================

const SystemConfig = {
  /**
   * Find configuration by key
   * @param {string} key - Configuration key
   * @returns {Promise<Object|null>} Configuration object or null
   */
  async findByKey(key) {
    return await prisma.systemConfig.findUnique({
      where: { key },
    });
  },

  /**
   * Find all configurations
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of configurations
   */
  async findAll(options = {}) {
    return await prisma.systemConfig.findMany(options);
  },

  /**
   * Find configurations by category
   * @param {string} category - Configuration category
   * @returns {Promise<Array>} Array of configurations
   */
  async findByCategory(category) {
    return await prisma.systemConfig.findMany({
      where: { category },
    });
  },

  /**
   * Create a new configuration
   * @param {Object} configData - Configuration data
   * @returns {Promise<Object>} Created configuration
   */
  async create(configData) {
    return await prisma.systemConfig.create({
      data: configData,
    });
  },

  /**
   * Update a configuration
   * @param {string} key - Configuration key
   * @param {*} value - New value
   * @param {string} modifiedById - Admin user ID who modified
   * @returns {Promise<Object>} Updated configuration
   */
  async updateConfig(key, value, modifiedById) {
    return await prisma.systemConfig.update({
      where: { key },
      data: {
        value: JSON.stringify(value),
        modifiedById,
      },
    });
  },

  /**
   * Delete a configuration
   * @param {string} key - Configuration key
   * @returns {Promise<Object>} Deleted configuration
   */
  async delete(key) {
    return await prisma.systemConfig.delete({
      where: { key },
    });
  },

  /**
   * Get configuration value by key
   * @param {string} key - Configuration key
   * @param {*} defaultValue - Default value if not found
   * @returns {Promise<*>} Configuration value
   */
  async getValue(key, defaultValue = null) {
    const config = await this.findByKey(key);
    if (!config) return defaultValue;

    try {
      return JSON.parse(config.value);
    } catch {
      return config.value;
    }
  },

  /**
   * Set configuration value by key
   * @param {string} key - Configuration key
   * @param {*} value - New value
   * @param {string} modifiedById - Admin user ID who modified
   * @returns {Promise<Object>} Updated configuration
   */
  async setValue(key, value, modifiedById) {
    const exists = await this.findByKey(key);

    if (exists) {
      return await this.updateConfig(key, value, modifiedById);
    } else {
      return await this.create({
        key,
        value: JSON.stringify(value),
        modifiedById,
      });
    }
  },
};

// ============================================================================
// EXPORT MODEL
// ============================================================================

module.exports = SystemConfig;
module.exports.prisma = prisma;
