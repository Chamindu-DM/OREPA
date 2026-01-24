// ============================================================================
// OREPA Backend - Express.js API Server Entry Point
// ============================================================================
//
// Purpose:
//   Main entry point for the OREPA backend API server
//   Initializes Express app, connects to MongoDB, and starts the server
//
// Features:
//   - Express.js REST API framework
//   - MongoDB connection with Mongoose ODM
//   - Security middleware (Helmet, CORS)
//   - Request logging with Morgan
//   - Error handling middleware
//   - Graceful shutdown handling
//   - Health check endpoint
//
// Dependencies:
//   - express: Web application framework
//   - mongoose: MongoDB object modeling
//   - cors: Cross-Origin Resource Sharing
//   - helmet: Security headers
//   - morgan: HTTP request logger
//   - dotenv: Environment variable management
//
// Environment Variables Required:
//   - NODE_ENV: Application environment (development/production)
//   - PORT: Server port (default: 5000)
//   - MONGODB_URI: MongoDB connection string
//   - CORS_ORIGIN: Allowed CORS origins
//
// ============================================================================

// Load environment variables from .env file
// Must be called before any other imports that use process.env
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// ============================================================================
// IMPORT DEPENDENCIES
// ============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

// Database connection
const connectDB = require('./config/database');

// Middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// ============================================================================
// INITIALIZE EXPRESS APPLICATION
// ============================================================================

const app = express();

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

// Get port from environment or use default
const PORT = process.env.PORT || 5000;

// Get environment mode
const NODE_ENV = process.env.NODE_ENV || 'development';

// Get CORS origin from environment
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

// Helmet: Sets various HTTP headers for security
// Protects against common vulnerabilities like XSS, clickjacking, etc.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for development, enable in production
}));

// CORS: Enable Cross-Origin Resource Sharing
// Allows frontend (running on different port/domain) to make requests
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Parse allowed origins (support comma-separated list)
    const allowedOrigins = CORS_ORIGIN.split(',').map(o => o.trim());

    // Add localhost:3001 explicitly for development fallback
    if (NODE_ENV === 'development' && !allowedOrigins.includes('http://localhost:3001')) {
      allowedOrigins.push('http://localhost:3001');
    }

    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,                        // Allow cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ============================================================================
// REQUEST PARSING MIDDLEWARE
// ============================================================================

// Body parser: Parse incoming JSON requests
// Limit: 10mb (adjust based on your needs)
app.use(express.json({ limit: '10mb' }));

// URL-encoded parser: Parse URL-encoded data (form submissions)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser: Parse cookies from request headers
app.use(cookieParser());

// ============================================================================
// COMPRESSION MIDDLEWARE
// ============================================================================

// Compress all HTTP responses for better performance
// Reduces bandwidth and improves load times
app.use(compression());

// ============================================================================
// LOGGING MIDDLEWARE
// ============================================================================

// Morgan: HTTP request logger
// In development: use 'dev' format (colored, concise)
// In production: use 'combined' format (detailed, Apache-style)
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

// Health check endpoint for monitoring and Docker health checks
// Returns server status, timestamp, and database connection status
//
// Response format:
//   Success: { status: 'ok', timestamp: '...', database: 'connected', environment: '...' }
//   Error: { status: 'error', timestamp: '...', database: 'disconnected', environment: '...' }
//
app.get('/api/health', async (req, res) => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Check database connection by running a simple query
    await prisma.$queryRaw`SELECT 1`;
    const dbStatus = 'connected';

    await prisma.$disconnect();

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: NODE_ENV,
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      environment: NODE_ENV,
      uptime: process.uptime(),
    });
  }
});

// ============================================================================
// ROOT ROUTER
// ============================================================================

// Redirect root to /api or show a simple status message
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'OREPA Backend API is running',
    documentation: '/api'
  });
});

// ============================================================================
// API ROUTES
// ============================================================================

// Welcome route - provides API information
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to OREPA API',
    version: '1.0.0',
    description: 'Old Royalists Engineering Professionals Association - Backend API',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      admin: {
        auth: '/api/admin',
        users: '/api/admin/users',
        memberManagement: '/api/admin/member-management',
        analytics: '/api/admin/analytics',
      },
      // Future routes:
      // newsletters: '/api/admin/newsletters',
      // content: '/api/admin/content',
      // projects: '/api/projects',
    },
  });
});

// ============================================================================
// IMPORT ROUTE HANDLERS
// ============================================================================

// Authentication routes
const authRoutes = require('./routes/auth');
const adminAuthRoutes = require('./routes/admin/auth');

// Admin management routes
const adminUsersRoutes = require('./routes/admin/users');
const memberManagementRoutes = require('./routes/admin/member-management');
const analyticsRoutes = require('./routes/admin/analytics');

// ============================================================================
// MOUNT ROUTE HANDLERS
// ============================================================================

// User authentication routes
app.use('/api/auth', authRoutes);

// Admin authentication routes
app.use('/api/admin', adminAuthRoutes);

// Admin user management routes
app.use('/api/admin/users', adminUsersRoutes);

// Member management routes (user approval system)
app.use('/api/admin/member-management', memberManagementRoutes);

// Analytics and audit log routes
app.use('/api/admin/analytics', analyticsRoutes);

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// 404 Not Found handler
// This catches all requests that don't match any routes
// Must be placed AFTER all other routes
app.use(notFound);

// Global error handler
// Catches all errors thrown in the application
// Must be placed LAST in the middleware chain
app.use(errorHandler);

// ============================================================================
// DATABASE CONNECTION AND SERVER STARTUP
// ============================================================================

// Function to start the server
// Only starts after successful database connection
const startServer = async () => {
  try {
    // Connect to PostgreSQL (Supabase) using Prisma
    // This function handles connection logic, retries, and error handling
    await connectDB();

    // Start Express server only after successful DB connection
    const server = app.listen(PORT, () => {
      console.log('============================================');
      console.log('🚀 OREPA Backend Server Started');
      console.log('============================================');
      console.log(`📍 Environment: ${NODE_ENV}`);
      console.log(`🌐 Server running on port: ${PORT}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Database: Connected to PostgreSQL (Supabase)`);
      console.log(`🔐 CORS Enabled for: ${CORS_ORIGIN}`);
      console.log('============================================');
    });

    // ========================================================================
    // GRACEFUL SHUTDOWN HANDLING
    // ========================================================================

    // Handle process termination signals
    // Ensures proper cleanup before the process exits
    const gracefulShutdown = (signal) => {
      console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);

      // Stop accepting new connections
      server.close(async () => {
        console.log('✅ Express server closed');

        // Close database connection
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        try {
          await prisma.$disconnect();
          console.log('✅ PostgreSQL connection closed');
          console.log('👋 Graceful shutdown completed');
          process.exit(0);
        } catch (err) {
          console.error('❌ Error during shutdown:', err);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds if graceful shutdown hangs
      setTimeout(() => {
        console.error('⚠️  Forceful shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));  // Docker stop
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));    // Ctrl+C

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
      console.error('Error:', err.name, err.message);
      console.error('Stack:', err.stack);
      gracefulShutdown('UNCAUGHT EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('❌ UNHANDLED REJECTION! Shutting down...');
      console.error('Error:', err);
      gracefulShutdown('UNHANDLED REJECTION');
    });

  } catch (error) {
    // If database connection fails, log error and exit
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ============================================================================
// START THE SERVER
// ============================================================================

startServer();

// ============================================================================
// EXPORT APP FOR TESTING
// ============================================================================

module.exports = app;

// ============================================================================
// END OF SERVER CONFIGURATION
// ============================================================================
