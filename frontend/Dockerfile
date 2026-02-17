# ============================================================================
# OREPA Frontend - Next.js Application Dockerfile
# ============================================================================
#
# Purpose:
#   Build and run the Next.js 16 frontend application in a Docker container
#
# Features:
#   - Node.js 20 Alpine Linux for minimal footprint
#   - Hot Module Replacement (HMR) for development
#   - Standalone output for optimized production builds
#   - Non-root user for enhanced security
#   - Efficient multi-stage builds with layer caching
#
# Components:
#   - Next.js 16 with App Router
#   - React 19
#   - GSAP for animations
#   - Lenis for smooth scrolling
#   - PDF.js for newsletter viewer
#   - react-pageflip for flipbook viewer
#
# Usage:
#   Build: docker build -t orepa-frontend .
#   Run:   docker run -p 3000:3000 orepa-frontend
#
# ============================================================================

# ============================================================================
# DEVELOPMENT STAGE (base)
# ============================================================================
#
# Used for local development with hot reload
#
FROM node:20-alpine AS base

# Install system dependencies
# - curl: For health checks
# - libc6-compat: Required for some Node.js native modules on Alpine
RUN apk update && apk add --no-cache curl libc6-compat

# Set working directory
WORKDIR /app

# Copy package files first for optimal Docker layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for development)
RUN npm ci

# Copy all application source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextuser -u 1001 -G nodejs && \
    mkdir -p /app/.next && \
    chown -R nextuser:nodejs /app

# Switch to non-root user
USER nextuser

# Expose port 3000 for the Next.js development server
EXPOSE 3000

# Start the Next.js development server with HMR
CMD ["npm", "run", "dev"]

# ============================================================================
# PRODUCTION BUILD STAGE (builder)
# ============================================================================
#
# Builds the Next.js application for production
# Uses standalone output for minimal deployment size
#
FROM node:20-alpine AS builder

RUN apk update && apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .

# Build the production application
# Requires output: 'standalone' in next.config.ts
RUN npm run build

# ============================================================================
# PRODUCTION RUN STAGE (runner)
# ============================================================================
#
# Minimal production image with only the built application
#
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install curl for health checks
RUN apk update && apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextuser -u 1001 -G nodejs

# Copy only the necessary build artifacts
# next.config is needed at runtime
COPY --from=builder /app/next.config.ts ./

# Public assets (images, newsletters, etc.)
COPY --from=builder /app/public ./public

# Next.js standalone output (includes server.js and minimal node_modules)
COPY --from=builder --chown=nextuser:nodejs /app/.next/standalone ./

# Static assets generated during build
COPY --from=builder /app/.next/static ./.next/static

USER nextuser

EXPOSE 3000

# Start the standalone Next.js server
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
