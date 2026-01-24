# ============================================================================
# OREPA Backend - Express.js API Server Dockerfile
# ============================================================================
#
# Purpose:
#   Build and run the Express.js backend API server in a Docker container
#
# Features:
#   - Node.js 20 Alpine Linux for minimal footprint
#   - Nodemon for automatic server restarts on code changes
#   - Non-root user for enhanced security
#   - Wait-for-it support to ensure Database is ready
#   - Efficient layer caching for faster builds
#
# Components:
#   - Express.js REST API
#   - PostgreSQL with Prisma ORM
#   - JWT authentication
#   - Comprehensive error handling
#   - Request logging with Morgan
#
# Usage:
#   Build: docker build -t orepa-backend .
#   Run:   docker run -p 5000:5000 orepa-backend
#
# ============================================================================

# ============================================================================
# BASE IMAGE
# ============================================================================
#
# Use Node.js 20 Alpine Linux for a lightweight container
# Alpine is a minimal Linux distribution optimized for containers
#
FROM node:20-alpine AS base

# Install system dependencies
# - curl: For health checks and downloading wait-for-it script
# - bash: Required for wait-for-it script
# - openssl: Required for Prisma Client
# Update package index first to resolve DNS issues
RUN apk update && apk add --no-cache curl bash openssl

# Set working directory
# All application files will be stored here
WORKDIR /app

# ============================================================================
# DEPENDENCY INSTALLATION
# ============================================================================
#
# Copy package files first for optimal Docker layer caching
# If these files haven't changed, Docker will use cached layers
#
COPY package*.json ./

# Install dependencies
# Uses npm ci for clean, reproducible installs based on package-lock.json
RUN npm install

# Install nodemon globally for development auto-restart functionality
# Nodemon watches for file changes and automatically restarts the server
RUN npm install -g nodemon

# ============================================================================
# APPLICATION CODE
# ============================================================================
#
# Copy all application source code
# This includes models/, routes/, controllers/, middleware/, etc.
#
COPY . .

# Generate Prisma Client
# This is required after copying schema.prisma
RUN npx prisma generate

# ============================================================================
# WAIT-FOR-IT SCRIPT (Database Readiness Check)
# ============================================================================
#
# Download wait-for-it script to ensure MongoDB is ready before starting
# This prevents connection errors during startup
#
RUN curl -o /wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh && \
    chmod +x /wait-for-it.sh

# ============================================================================
# SECURITY CONFIGURATION
# ============================================================================
#
# Create a non-root user and group for running the application
# Running as non-root reduces security risks
#
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs && \
    chown -R nodeuser:nodejs /app

# Switch to non-root user
# All subsequent commands and the application will run as this user
USER nodeuser

# ============================================================================
# PORT CONFIGURATION
# ============================================================================
#
# Expose port 5000 for the API server
# This port should match the PORT environment variable
#
EXPOSE 5000

# ============================================================================
# STARTUP COMMAND
# ============================================================================
#
# Start the server with nodemon for development
# Nodemon will:
#   - Watch for file changes in the /app directory
#   - Automatically restart the server when changes are detected
#   - Provide better error messages and debugging
#
# For production, use: CMD ["node", "server.js"]
#
CMD ["nodemon", "server.js"]

# ============================================================================
# ENVIRONMENT VARIABLES (Set in docker-compose.yml)
# ============================================================================
#
# The following environment variables should be provided at runtime:
#   - NODE_ENV: 'development' or 'production'
#   - PORT: Server port (default: 5000)
#   - DATABASE_URL: PostgreSQL connection string
#   - JWT_SECRET: Secret key for JWT token signing
#   - JWT_EXPIRE: JWT expiration time (e.g., '7d')
#   - CORS_ORIGIN: Allowed CORS origin (frontend URL)
#
# ============================================================================

# ============================================================================
# HEALTH CHECK (Defined in docker-compose.yml)
# ============================================================================
#
# The health check endpoint is implemented in the application:
#   GET /api/health
#
# Returns:
#   - 200 OK: Service is healthy
#   - JSON: { status: 'ok', timestamp: '...', database: 'connected' }
#
# ============================================================================

# ============================================================================
# PRODUCTION BUILD STAGE
# ============================================================================
#
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
# Prune dev dependencies
RUN npm prune --production

# ============================================================================
# PRODUCTION RUN STAGE
# ============================================================================
#
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Install system dependencies
# openssl is required for Prisma in production too
RUN apk update && apk add --no-cache curl bash openssl

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Download wait-for-it script to ensure Database is ready before starting
RUN curl -o /wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh && \
    chmod +x /wait-for-it.sh

RUN chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 5000

CMD ["node", "server.js"]
