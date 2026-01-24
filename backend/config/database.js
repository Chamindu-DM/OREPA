// ============================================================================
// OREPA Backend - Database Connection Configuration
// ============================================================================
//
// Purpose:
//   Establishes and manages connection to Supabase (PostgreSQL) using Prisma
//
// Features:
//   - Connection logging
//   - Exports Prisma Client instance
//
// Dependencies:
//   - @prisma/client
//
// ============================================================================

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// ============================================================================
// DATABASE CONNECTION FUNCTION
// ============================================================================

/**
 * Connect to the database with Prisma Client
 *
 * Features:
 *   - Logs connection events (success, error)
 *   - Gracefully handles connection failures
 *
 * @returns {Promise<void>} Resolves when connected, rejects on error
 *
 * @throws {Error} If connection fails
 *
 * @example
 *   try {
 *     await connectDB();
 *     console.log('Database connected');
 *   } catch (error) {
 *     console.error('Database connection failed:', error);
 *     process.exit(1);
 *   }
 */
const connectDB = async () => {
  try {
    // Connect to the database
    await prisma.$connect();
    console.log(`✅ Database connected successfully: PostgreSQL via Prisma`);
    console.log(`📊 Database URL: ${prisma._engineConfig.datamodelPath}`);

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// ============================================================================
// EXPORT CONNECTION FUNCTION
// ============================================================================

module.exports = connectDB;
module.exports.prisma = prisma;

// ============================================================================
// END OF DATABASE CONFIGURATION
// ============================================================================
