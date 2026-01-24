# OREPA - Old Royalists Engineering Professionals Association

A comprehensive MERN stack application for connecting and empowering engineering professionals from Royal College.

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
- [Features](#features)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Overview

OREPA is a platform designed to connect engineering professionals from Royal College, fostering collaboration, mentorship, and professional development. The platform provides:

- Professional networking opportunities
- Mentorship programs
- Learning management system
- Community projects showcase
- Newsletters and updates

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS
- **State Management**: React hooks
- **HTTP Client**: Axios
- **Form Management**: react-hook-form with Zod validation
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js (LTS)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **Security**: Helmet, CORS
- **Logging**: Morgan
- **Validation**: express-validator

### DevOps
- **Containerization**: Docker & Docker Compose
- **Development**: Hot reload (Next.js, Nodemon)

## Project Structure

```
OREPA/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   └── errorHandler.js      # Error handling
│   ├── models/
│   │   └── User.js               # User schema
│   ├── routes/                   # API routes (future)
│   ├── controllers/              # Business logic (future)
│   ├── utils/                    # Utilities (future)
│   ├── server.js                 # Entry point
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── app/
│   │   ├── layout.js             # Root layout
│   │   ├── page.js               # Home page
│   │   ├── globals.css           # Global styles
│   │   ├── projects/             # Projects page
│   │   ├── newsletters/          # Newsletters page
│   │   ├── lms/                  # LMS page
│   │   ├── contact/              # Contact page
│   │   ├── about/                # About page
│   │   ├── login/                # Login page
│   │   └── my-account/           # Account page
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx        # Navigation header
│   │   │   └── Footer.jsx        # Site footer
│   │   ├── sections/
│   │   │   ├── HeroSection.jsx   # Hero banner
│   │   │   ├── AboutSection.jsx  # About section
│   │   │   ├── FeaturesSection.jsx
│   │   │   └── ProjectsSection.jsx
│   │   └── ui/
│   │       └── button.jsx        # Button component
│   ├── lib/
│   │   ├── utils.js              # Utility functions
│   │   └── api.js                # API client
│   ├── public/                   # Static assets
│   ├── tailwind.config.js        # Tailwind configuration
│   ├── next.config.js            # Next.js configuration
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml            # Docker orchestration
├── .env.example                  # Environment template
└── README.md                     # This file
```

## Prerequisites

### With Docker (Recommended)
- Docker Desktop (20.10+)
- Docker Compose (1.29+)

### Without Docker
- Node.js (18.0+ or 20.0+)
- npm (9.0+)
- MongoDB (7.0+)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Web-project
```

### 2. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and update the values
# IMPORTANT: Change JWT_SECRET to a secure random string
```

## Running with Docker

Docker Compose is the recommended method for development as it handles all services automatically.

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

# Stop and remove volumes (WARNING: This deletes MongoDB data)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f mongodb
```

### Access Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health
- **MongoDB**: mongodb://localhost:27017/orepa

## Running without Docker

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start MongoDB (in separate terminal)
mongod

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
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://mongodb:27017/orepa

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Available Routes

### Frontend Routes

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Home page | ✅ Complete |
| `/projects` | Projects showcase | 🚧 Placeholder |
| `/newsletters` | Newsletters | 🚧 Placeholder |
| `/lms` | Learning Management System | 🚧 Placeholder |
| `/contact` | Contact page | 🚧 Placeholder |
| `/about` | About OREPA | 🚧 Placeholder |
| `/login` | Login page | 🚧 Placeholder |
| `/my-account` | User account | 🚧 Placeholder |

### API Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/api` | API information | ✅ Complete |
| GET | `/api/health` | Health check | ✅ Complete |

**Future Endpoints (Planned):**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `GET /api/users` - Get all users (admin)
- `PUT /api/users/profile` - Update profile
- And more...

## Features

### Current Features ✅

- **Docker Containerization**: Full Docker setup with hot reload
- **Backend Foundation**: Express.js server with MongoDB
- **User Model**: Complete Mongoose schema with authentication
- **Middleware**: Auth, error handling, security
- **Frontend Structure**: Next.js 14 with App Router
- **UI Components**: shadcn/ui compatible components
- **Layout**: Responsive header and footer
- **Landing Page**: Hero, About, Features, Projects sections
- **Responsive Design**: Mobile-first approach
- **Brand Identity**: OREPA gold and blue theme

### Planned Features 🚧

- User authentication (register, login, logout)
- User dashboard and profile management
- Project management system
- Newsletter creation and distribution
- Learning Management System (LMS)
- Admin panel
- Role-based access control
- File uploads
- Email notifications
- Search functionality
- Analytics and reporting

## Development

### Code Style

This project follows the "vibe coding methodology" with extensive inline comments:

- Every file starts with a comment block explaining its purpose
- Functions include comments explaining parameters and return values
- Complex logic has inline comments explaining WHY, not just WHAT
- TODO items are clearly marked

### Hot Reload

Both frontend and backend support hot reload during development:

- **Frontend**: Next.js automatically reloads on file changes
- **Backend**: Nodemon restarts server on file changes
- **Database**: MongoDB data persists across restarts

### Adding New Features

1. Plan your feature (consider creating a TODO list)
2. Create necessary models/schemas
3. Build API endpoints (controllers + routes)
4. Create frontend components
5. Connect frontend to backend via API
6. Test thoroughly
7. Update documentation

### Available Scripts

#### Backend
```bash
npm run dev     # Start development server with nodemon
npm start       # Start production server
npm test        # Run tests (not yet implemented)
```

#### Frontend
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm start       # Start production server
npm run lint    # Run ESLint
```

## Testing

```bash
# Backend tests (to be implemented)
cd backend
npm test

# Frontend tests (to be implemented)
cd frontend
npm test
```

## Testing Checklist

- [ ] Docker containers start successfully
- [ ] MongoDB connection established
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend API responds at http://localhost:5000/api/health
- [ ] All navigation links work
- [ ] Landing page displays correctly
- [ ] Responsive design works on mobile
- [ ] No console errors in browser or terminal
- [ ] Hot reload works for both services

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
docker-compose down -v
docker-compose up --build
```

**Problem**: Port already in use
```bash
# Find and kill process using port 3000 or 5000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### Database Issues

**Problem**: MongoDB connection failed
```bash
# Check MongoDB is running in Docker
docker-compose logs mongodb

# Or restart MongoDB container
docker-compose restart mongodb
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
- Email: info@orepa.org
- Website: https://orepa.org (coming soon)

---

**Built with Claude Code** - Generated with extensive comments for clarity and maintainability.
