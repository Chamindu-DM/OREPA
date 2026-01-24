# ============================================================================
# OREPA Frontend - Next.js Application Dockerfile
# ============================================================================
#
# Purpose:
#   Build and run the Next.js 14 frontend application in a Docker container
#
# Features:
#   - Node.js 20 Alpine Linux for minimal footprint
#   - Hot Module Replacement (HMR) for development
#   - Non-root user for enhanced security
#   - Efficient layer caching for faster builds
#
# Components:
#   - Next.js 14 with App Router
#   - React 19
#   - GSAP for animations
#   - Lenis for smooth scrolling
#
# Usage:
#   Build: docker build -t orepa-frontend .
#   Run:   docker run -p 3000:3000 orepa-frontend
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
# - curl: For health checks
# - libc6-compat: Required for some Node.js native modules
# Update package index first to resolve DNS issues
RUN apk update && apk add --no-cache curl libc6-compat

# Set working directory
# All application files will be stored here
WORKDIR /app

# ============================================================================
# DEVELOPMENT DEPENDENCY INSTALLATION
# ============================================================================
#
# Copy package files first for optimal Docker layer caching
# If these files haven't changed, Docker will use cached layers
#
COPY package*.json ./

# Install dependencies
# Uses npm install for development environment with all devDependencies
RUN npm install

# ============================================================================
# APPLICATION CODE
# ============================================================================
#
# Copy all application source code
# This includes src/, public/, next.config.ts, etc.
#
COPY . .

# ============================================================================
# SECURITY CONFIGURATION
# ============================================================================
#
# Create a non-root user and group for running the application
# Running as non-root reduces security risks
#
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextuser -u 1001 -G nodejs && \
    chown -R nextuser:nodejs /app

# Switch to non-root user
# All subsequent commands and the application will run as this user
USER nextuser

# ============================================================================
# PORT CONFIGURATION
# ============================================================================
#
# Expose port 3000 for the Next.js development server
# This is the default port for Next.js
#
EXPOSE 3000

# ============================================================================
# STARTUP COMMAND
# ============================================================================
#
# Start the Next.js development server
# The dev server provides:
#   - Hot Module Replacement (HMR) for instant updates
#   - Fast Refresh for React components
#   - Error overlay with detailed error messages
#
# For production, use: CMD ["npm", "run", "start"]
# And add a build step: RUN npm run build
#
CMD ["npm", "run", "dev"]

# ============================================================================
# PRODUCTION BUILD STAGE
# ============================================================================
#
# Build the application for production usage
# Using a separate stage reduces final image size
#
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ============================================================================
# PRODUCTION RUN STAGE
# ============================================================================
#
# Create the final production image
#
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextuser -u 1001 -G nodejs

COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextuser:nodejs /app/.next/standalone ./

USER nextuser

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]

# ============================================================================
# ENVIRONMENT VARIABLES (Set in docker-compose.yml)
# ============================================================================
#
# The following environment variables should be provided at runtime:
#   - NODE_ENV: 'development' or 'production'
#   - NEXT_PUBLIC_API_URL: Backend API endpoint URL
#   - WATCHPACK_POLLING: Enable polling for file changes in Docker
#
# ============================================================================

# ============================================================================
# HEALTH CHECK (Defined in docker-compose.yml)
# ============================================================================
#
# The health check endpoint is the home page:
#   GET http://localhost:3000
#
# Returns:
#   - 200 OK: Service is healthy
#
# ============================================================================
