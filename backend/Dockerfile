# ============================================================================
# OREPA Backend - Express.js API Server Dockerfile
# ============================================================================
#
# Purpose:
#   Build and run the Express.js backend API server in a Docker container
#
# Features:
#   - Node.js 20 Alpine Linux for minimal footprint
#   - Nodemon for automatic server restarts during development
#   - Non-root user for enhanced security
#   - Efficient multi-stage builds with layer caching
#
# Components:
#   - Express.js REST API
#   - Supabase PostgreSQL with Prisma ORM
#   - JWT authentication
#   - Comprehensive error handling
#   - Request logging with Morgan
#
# Database:
#   PostgreSQL is hosted on Supabase (external service).
#   No local database container or wait-for-it script is needed.
#
# Usage:
#   Build: docker build -t orepa-backend .
#   Run:   docker run -p 5000:5000 orepa-backend
#
# ============================================================================

# ============================================================================
# DEVELOPMENT STAGE (base)
# ============================================================================
#
# Used for local development with nodemon auto-restart
#
FROM node:20-alpine AS base

# Install system dependencies
# - curl: For health checks
# - openssl: Required for Prisma Client
RUN apk update && apk add --no-cache curl openssl

# Set working directory
WORKDIR /app

# Copy package files first for optimal Docker layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for nodemon)
RUN npm ci

# Install nodemon globally for development auto-restart
RUN npm install -g nodemon

# Copy all application source code
COPY . .

# Generate Prisma Client from schema
RUN npx prisma generate

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs && \
    chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Expose port 5000 for the API server
EXPOSE 5000

# Start the server with nodemon for development
CMD ["nodemon", "server.js"]

# ============================================================================
# PRODUCTION BUILD STAGE (builder)
# ============================================================================
#
# Installs all dependencies, generates Prisma client, then prunes dev deps
#
FROM node:20-alpine AS builder

RUN apk update && apk add --no-cache openssl

WORKDIR /app

# Install all dependencies (need devDeps for prisma generate)
COPY package*.json ./
RUN npm ci

# Copy source code and generate Prisma client
COPY . .
RUN npx prisma generate

# Remove devDependencies for production
RUN npm prune --production

# ============================================================================
# PRODUCTION RUN STAGE (runner)
# ============================================================================
#
# Minimal production image with only production dependencies
#
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install system dependencies needed at runtime
# - curl: For health checks
# - openssl: Required for Prisma Client
RUN apk update && apk add --no-cache curl openssl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Copy application from builder stage
COPY --from=builder --chown=nodeuser:nodejs /app .

USER nodeuser

EXPOSE 5000

# Start the server with node (no nodemon in production)
CMD ["node", "server.js"]

# ============================================================================
# ENVIRONMENT VARIABLES (Set in docker-compose.yml or .env)
# ============================================================================
#
# The following environment variables should be provided at runtime:
#   - NODE_ENV: 'development' or 'production'
#   - PORT: Server port (default: 5000)
#   - DATABASE_URL: Supabase PostgreSQL pooled connection string
#   - DIRECT_URL: Supabase PostgreSQL direct connection string
#   - JWT_SECRET: Secret key for JWT token signing
#   - JWT_EXPIRE: JWT expiration time (e.g., '7d')
#   - CORS_ORIGIN: Allowed CORS origin (frontend URL)
#
# ============================================================================
#
# HEALTH CHECK (Defined in docker-compose.yml)
#
# The health check endpoint is implemented in the application:
#   GET /api/health
#
# Returns:
#   - 200 OK: Service is healthy
#   - JSON: { status: 'ok', timestamp: '...', database: 'connected' }
#
# ============================================================================
