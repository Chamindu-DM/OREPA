# OREPA - Old Royalists Engineering Professionals Association

A full-stack web platform for connecting and empowering engineering professionals from Royal College.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running with Docker](#running-with-docker)
- [Running without Docker](#running-without-docker)
- [Environment Variables](#environment-variables)
- [Available Routes](#available-routes)
- [API Endpoints](#api-endpoints)
- [Role-Based Access Control](#role-based-access-control)
- [Features](#features)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Overview

OREPA is a platform designed to connect engineering professionals from Royal College, fostering collaboration, mentorship, and professional development. The platform provides:

- Professional networking opportunities
- Mentorship programs
- Learning management system
- Community projects showcase
- Newsletters and updates
- Member approval workflows
- Multi-tier admin management system

## Tech Stack

### Frontend
- **Framework**: Next.js 16.1.4 (App Router)
- **Language**: TypeScript
- **Runtime**: React 19
- **Styling**: Tailwind CSS
- **Animations**: GSAP, Lottie (lottie-react)
- **Smooth Scroll**: @studio-freight/lenis
- **Carousel/Slider**: Swiper
- **PDF Viewer**: pdfjs-dist, react-pageflip

### Backend
- **Runtime**: Node.js (18+)
- **Framework**: Express.js
- **Database**: PostgreSQL (via [Supabase](https://supabase.com)) with Prisma ORM
- **Authentication**: JWT (jsonwebtoken) with bcryptjs
- **Security**: Helmet (with CSP), CORS, express-rate-limit
- **Logging**: Morgan
- **Validation**: express-validator
- **Email**: Nodemailer
- **Other**: compression, cookie-parser

### DevOps
- **Containerization**: Docker & Docker Compose
- **Development**: Hot reload (Next.js fast refresh, Nodemon)

## Project Structure

```
OREPA/
├── backend/
│   ├── config/
│   │   ├── database.js              # PostgreSQL/Prisma connection
│   │   └── permissions.js           # Role-based permissions system
│   ├── controllers/
│   │   ├── authController.js        # User auth logic
│   │   └── admin/
│   │       ├── authController.js    # Admin authentication
│   │       ├── userManagementController.js
│   │       ├── memberManagementController.js
│   │       └── analyticsController.js
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification & RBAC
│   │   ├── authorize.js             # Permission-based authorization
│   │   ├── errorHandler.js          # Global error handling
│   │   ├── auditLog.js              # Admin action logging
│   │   └── rateLimiter.js           # Rate limiting
│   ├── models/
│   │   ├── User.js                  # User operations & helper methods
│   │   ├── AdminActionLog.js        # Audit trail
│   │   └── SystemConfig.js          # System configuration
│   ├── routes/
│   │   ├── auth.js                  # User authentication endpoints
│   │   └── admin/
│   │       ├── auth.js              # Admin auth endpoints
│   │       ├── users.js             # User management endpoints
│   │       ├── member-management.js # Member approval endpoints
│   │       └── analytics.js         # Analytics endpoints
│   ├── validators/
│   │   ├── authValidator.js         # Auth input validation
│   │   ├── adminValidator.js        # Admin action validation
│   │   └── userValidator.js         # User data validation
│   ├── utils/
│   │   └── sendEmail.js             # Email utility (Nodemailer)
│   ├── scripts/
│   │   ├── createSuperAdmin.js      # Initial super admin creation
│   │   ├── importParticipants.js    # Bulk CSV user import
│   │   └── verifyImport.js          # Verify imported data
│   ├── prisma/
│   │   └── schema.prisma            # Database schema definition
│   ├── server.js                    # Express entry point
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/                     # Next.js App Router pages
│   │   │   ├── page.tsx             # Home page
│   │   │   ├── layout.tsx           # Root layout
│   │   │   ├── login/               # User login page
│   │   │   ├── register/            # User registration page
│   │   │   ├── about/               # About OREPA page
│   │   │   ├── our-team/            # Team page
│   │   │   ├── events/              # Events page
│   │   │   ├── pillars/             # Organization pillars page
│   │   │   ├── newsletters/         # Newsletters page
│   │   │   └── admin/
│   │   │       ├── login/           # Admin login page
│   │   │       └── users/           # Admin user management page
│   │   ├── components/              # Reusable React components
│   │   │   ├── Header.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── AboutUs.tsx
│   │   │   ├── Gallery.tsx
│   │   │   ├── ContactUs.tsx
│   │   │   ├── Newsletters.tsx
│   │   │   ├── EventSection.tsx
│   │   │   ├── Partners.tsx
│   │   │   ├── History.tsx
│   │   │   ├── Statement.tsx
│   │   │   └── Loading.tsx
│   │   ├── config/
│   │   │   └── api.ts               # API configuration & endpoint map
│   │   ├── data/
│   │   │   ├── organization.ts      # Org structure data
│   │   │   └── partners.ts          # Partners data
│   │   └── hooks/
│   │       ├── useLenis.ts          # Smooth scroll hook
│   │       └── useAnimations.ts     # GSAP animations hook
│   ├── public/
│   │   ├── images/                  # Image assets
│   │   └── newsletters/             # Newsletter PDFs
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
│
├── docs/                            # Comprehensive documentation
│   ├── 01_Current_Implementation_Overview.md
│   ├── 02_Codebase_Structure.md
│   ├── 07_Gap_Analysis.md
│   ├── MONGODB_TO_POSTGRESQL_MIGRATION.md
│   ├── SUPER_ADMIN_IMPLEMENTATION_STATUS.md
│   └── SUPER_ADMIN_ACCESS_GUIDE.md
│
├── docker-compose.yml               # Multi-container orchestration
├── .env.example                     # Environment variable template
├── .gitignore
└── README.md                        # This file
```

## Prerequisites

### With Docker (Recommended)
- Docker Desktop (20.10+)
- Docker Compose (1.29+)
- A [Supabase](https://supabase.com) project (PostgreSQL database)

### Without Docker
- Node.js (18.0+ or 20.0+)
- npm (9.0+)
- A [Supabase](https://supabase.com) project (PostgreSQL database)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd OREPA
```

### 2. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values
# IMPORTANT: Set DATABASE_URL, DIRECT_URL from your Supabase project settings
# IMPORTANT: Change JWT_SECRET to a secure random string
```

### 3. Create the Super Admin Account

```bash
# After configuring your .env, run:
node backend/scripts/createSuperAdmin.js
```

## Running with Docker

Docker Compose is the recommended method for development as it handles both services automatically. The database is hosted externally on Supabase — no local database container is required.

### Start All Services

```bash
# Build and start all containers
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d
```

### Stop All Services

```bash
docker-compose down
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Access Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001 (host port 5001 → container port 5000)
- **API Health Check**: http://localhost:5001/api/health

## Running without Docker

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend directory (in new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Variables

### Backend Variables

```env
# Database (from your Supabase project settings)
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@[host]:5432/postgres

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Server
NODE_ENV=development
PORT=5000

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@orepa.lk

# Super Admin (used by createSuperAdmin.js script)
SUPER_ADMIN_EMAIL=admin@orepa.lk
SUPER_ADMIN_PASSWORD=your-secure-admin-password
```

### Frontend Variables

```env
# API Configuration
# Without Docker: http://localhost:5000/api
# With Docker (from browser): http://localhost:5001/api
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Available Routes

### Frontend Routes

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Home page with animations | ✅ Complete |
| `/about` | About OREPA | ✅ Complete |
| `/our-team` | Team members page | ✅ Complete |
| `/events` | Events page | ✅ Complete |
| `/pillars` | Organization pillars | ✅ Complete |
| `/newsletters` | Newsletters & PDFs | ✅ Complete |
| `/login` | User login | 🚧 In Progress |
| `/register` | User registration | 🚧 In Progress |
| `/admin/login` | Admin login | ✅ Complete |
| `/admin/users` | Admin user management | ✅ Complete |

## API Endpoints

### General

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/api` | API information | ✅ Complete |
| GET | `/api/health` | Health check with DB status | ✅ Complete |

### User Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | User self-registration (creates PENDING account) | Public |
| POST | `/api/auth/login` | User login (approved users only) | Public |
| POST | `/api/auth/logout` | User logout | 🔒 Required |
| GET | `/api/auth/profile` | Get authenticated user's profile | 🔒 Required |
| PUT | `/api/auth/profile` | Update user profile | 🔒 Required |
| POST | `/api/auth/forgot-password` | Request password reset email | Public |
| PUT | `/api/auth/reset-password/:token` | Reset password with token | Public |

### Admin Authentication (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/admin/login` | Admin login | Public |
| POST | `/api/admin/logout` | Admin logout | 🔒 Admin |
| GET | `/api/admin/verify` | Verify admin token | 🔒 Admin |
| GET | `/api/admin/profile` | Get admin profile | 🔒 Admin |
| PUT | `/api/admin/profile` | Update admin profile | 🔒 Admin |
| PUT | `/api/admin/change-password` | Change admin password | 🔒 Admin |

### Admin User Management (`/api/admin/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/users` | Get all users (paginated) | 🔒 Admin |
| GET | `/api/admin/users/:id` | Get single user | 🔒 Admin |
| POST | `/api/admin/users/create-admin` | Create new admin account | 🔒 Super Admin |
| PATCH | `/api/admin/users/:id/role` | Update user role | 🔒 Super Admin |
| PATCH | `/api/admin/users/:id/status` | Update user status | 🔒 Admin |
| DELETE | `/api/admin/users/:id` | Delete user | 🔒 Super Admin |

### Admin Member Management (`/api/admin/members`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/members/pending` | Get pending approval requests | 🔒 Admin |
| PATCH | `/api/admin/members/:id/approve` | Approve member | 🔒 Admin |
| PATCH | `/api/admin/members/:id/reject` | Reject member | 🔒 Admin |
| PATCH | `/api/admin/members/:id/suspend` | Suspend member | 🔒 Admin |

### Admin Analytics (`/api/admin/analytics`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/analytics` | Platform analytics & statistics | 🔒 Admin |

## Role-Based Access Control

OREPA uses a granular permission system with the following roles:

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| `SUPER_ADMIN` | Full platform control | All permissions |
| `MEMBER_ADMIN` | User & member management | Approve/reject/suspend members, view analytics |
| `NEWSLETTER_ADMIN` | Newsletter operations | Create/publish/delete newsletters, manage subscribers |
| `CONTENT_ADMIN` | Content management | Manage projects, LMS, scholarships, gallery, files |
| `MEMBER` | Verified member | Access member-only features |
| `USER` | Pending/regular user | Limited access until approved |

**Account Security:**
- 5 failed login attempts triggers a 15-minute account lockout
- All admin actions are recorded in an audit log
- Rate limiting applied to login and registration endpoints

## Features

### Implemented ✅

- **Docker Containerization**: Full multi-service setup with hot reload
- **Backend API**: Express.js server with security middleware (Helmet, CORS, rate limiting, compression)
- **PostgreSQL Database**: Prisma ORM with type-safe queries (hosted on Supabase)
- **User Model**: Complete data layer with authentication, account locking, approval workflow
- **JWT Authentication**: Stateless auth with expiry, refresh, and logout support
- **Role-Based Access Control**: 6 roles with 20+ granular permissions
- **Admin System**: Separate admin authentication and management endpoints
- **Member Approval Workflow**: Pending → Approved / Rejected flow with admin oversight
- **Account Lockout**: Brute-force protection (5 failures → 15-minute lockout)
- **Audit Logging**: Every admin action recorded (who, what, when, IP, before/after state)
- **Email Infrastructure**: Nodemailer configured for notifications and password resets
- **Rate Limiting**: Different limits for login, registration, and general endpoints
- **Error Handling**: Consistent global error responses with dev/prod awareness
- **Frontend (Next.js 16)**: App Router, TypeScript, Tailwind CSS, GSAP animations
- **Rich Component Library**: Header, Footer, Hero, Gallery, EventSection, Partners, and more
- **Admin UI**: Admin login and user management pages
- **Public Pages**: Home, About, Our Team, Events, Pillars, Newsletters

### In Progress / Planned 🚧

- User registration and login UI forms
- User dashboard and profile management
- Project management system
- Newsletter creation and publishing UI
- Learning Management System (LMS) with courses and lessons
- Gallery management
- Scholarship management
- Admin dashboard with charts and KPIs
- File upload system
- Search functionality
- Full analytics and reporting UI

## Development

### Code Style

This project follows the "vibe coding methodology" with extensive inline comments:

- Every file starts with a comment block explaining its purpose
- Functions include comments explaining parameters and return values
- Complex logic has inline comments explaining WHY, not just WHAT
- TODO items are clearly marked

### Hot Reload

Both frontend and backend support hot reload during development:

- **Frontend**: Next.js fast refresh on file changes
- **Backend**: Nodemon restarts server on file changes

### Utility Scripts

```bash
# Create the initial super admin account
node backend/scripts/createSuperAdmin.js

# Bulk-import members from CSV
node backend/scripts/importParticipants.js

# Verify imported member data
node backend/scripts/verifyImport.js
```

### Available Scripts

#### Backend
```bash
cd backend
npm run dev     # Start development server with nodemon
npm start       # Start production server
```

#### Frontend
```bash
cd frontend
npm run dev     # Start development server
npm run build   # Build for production
npm start       # Start production server
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Notes

- **Never commit `.env` files**
- Change `JWT_SECRET` to a strong, random value in production
- Use environment variables for all sensitive data
- Keep dependencies updated
- Follow OWASP security best practices

## Troubleshooting

### Docker Issues

**Problem**: Containers won't start
```bash
# Check Docker is running
docker --version
docker-compose --version

# Remove old containers and rebuild
docker-compose down
docker-compose up --build
```

**Problem**: Port already in use
```bash
# Find and kill the process using port 3000 or 5001

# On Mac/Linux:
lsof -ti:3000 | xargs kill -9
lsof -ti:5001 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Issues

**Problem**: Prisma / database connection failed
```bash
# Ensure DATABASE_URL and DIRECT_URL are set correctly in .env
# They should point to your Supabase PostgreSQL instance

# Re-generate Prisma client
cd backend
npx prisma generate

# Check backend logs
docker-compose logs -f backend
```

### Frontend Issues

**Problem**: Module not found
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## License

ISC

## Contact

**OREPA Development Team**
- Email: orepastudentchapter@gmail.com
- Website: https://orepa.lk

---

**Built with Claude Code** - Generated with extensive comments for clarity and maintainability.
