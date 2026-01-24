# OREPA - Codebase Structure Documentation

## Table of Contents
- [Complete Directory Tree](#complete-directory-tree)
- [Backend Structure](#backend-structure)
- [Frontend Structure](#frontend-structure)
- [Key File Locations](#key-file-locations)
- [File Organization Patterns](#file-organization-patterns)

---

## Complete Directory Tree

```
OREPA/
├── backend/
│   ├── config/
│   │   └── database.js              # MongoDB connection with retry logic
│   ├── controllers/                 # 📁 EMPTY - Business logic goes here
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication & RBAC middleware
│   │   └── errorHandler.js          # Global error handling
│   ├── models/
│   │   └── User.js                  # User schema with roles & status
│   ├── routes/                      # 📁 EMPTY - API route definitions go here
│   ├── utils/                       # 📁 EMPTY - Utility functions go here
│   ├── node_modules/                # Dependencies (not tracked)
│   ├── .dockerignore
│   ├── Dockerfile                   # Backend container configuration
│   ├── package.json                 # Backend dependencies
│   ├── package-lock.json
│   └── server.js                    # Express app entry point
│
├── frontend/
│   ├── app/                         # Next.js 14 App Router pages
│   │   ├── about/
│   │   │   └── page.js              # About OREPA page (placeholder)
│   │   ├── contact/
│   │   │   └── page.js              # Contact page (placeholder)
│   │   ├── lms/
│   │   │   └── page.js              # Learning Management System (placeholder)
│   │   ├── login/
│   │   │   └── page.js              # Login page (placeholder)
│   │   ├── my-account/
│   │   │   └── page.js              # User account page (placeholder)
│   │   ├── newsletters/
│   │   │   └── page.js              # Newsletters page (placeholder)
│   │   ├── projects/
│   │   │   └── page.js              # Projects showcase (placeholder)
│   │   ├── globals.css              # Global styles & Tailwind directives
│   │   ├── layout.js                # Root layout with Header & Footer
│   │   └── page.js                  # Home page with Hero & sections
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Footer.jsx           # Site footer component
│   │   │   └── Header.jsx           # Navigation header component
│   │   ├── sections/
│   │   │   ├── AboutSection.jsx     # Home: About OREPA section
│   │   │   ├── FeaturesSection.jsx  # Home: Features section
│   │   │   ├── HeroSection.jsx      # Home: Hero banner
│   │   │   └── ProjectsSection.jsx  # Home: Projects preview
│   │   └── ui/
│   │       └── button.jsx           # shadcn/ui Button component
│   ├── lib/
│   │   ├── api.js                   # Axios client & API functions
│   │   └── utils.js                 # Utility functions (cn, token mgmt)
│   ├── public/
│   │   └── images/                  # Static image assets
│   ├── node_modules/                # Dependencies (not tracked)
│   ├── .dockerignore
│   ├── .eslintrc.json
│   ├── .gitignore
│   ├── Dockerfile                   # Frontend container configuration
│   ├── jsconfig.json                # Path aliases configuration
│   ├── next.config.js               # Next.js configuration
│   ├── package.json                 # Frontend dependencies
│   ├── package-lock.json
│   ├── postcss.config.js            # PostCSS for Tailwind
│   └── tailwind.config.js           # Tailwind CSS configuration
│
├── docs/                            # 📁 Analysis documentation (this folder)
│   ├── 01_Current_Implementation_Overview.md
│   ├── 02_Codebase_Structure.md     # ← You are here
│   ├── 03_Database_Schema.md
│   ├── 04_Authentication_Analysis.md
│   ├── 05_API_Endpoints.md
│   ├── 06_Frontend_Components.md
│   ├── 07_Gap_Analysis.md
│   └── 08_Implementation_Recommendations.md
│
├── .env                             # Environment variables (not in git)
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── docker-compose.yml               # Multi-container orchestration
├── package.json                     # Root-level package.json
└── README.md                        # Project documentation
```

---

## Backend Structure

### Implemented Files

#### `/backend/server.js`
**Purpose:** Express application entry point
**Lines:** 306 lines
**Key Features:**
- Express app initialization
- Security middleware (Helmet, CORS)
- Request parsing (JSON, URL-encoded, cookies)
- Logging (Morgan)
- Health check endpoint (`/api/health`)
- Welcome endpoint (`/api`)
- Error handling
- Graceful shutdown handling
- Database connection on startup

**Key Sections:**
```javascript
// Lines 34-47: Import dependencies
// Lines 59-72: Environment configuration
// Lines 80-99: Security middleware
// Lines 106-122: Request parsing & compression
// Lines 130-134: Logging
// Lines 147-163: Health check endpoint
// Lines 170-183: Welcome API endpoint
// Lines 185-190: TODO: Future routes
// Lines 199-204: Error handling middleware
// Lines 212-289: Database connection & startup
```

#### `/backend/config/database.js`
**Purpose:** MongoDB connection configuration
**Lines:** 229 lines
**Key Features:**
- Mongoose connection with options
- Automatic retry logic (5 attempts, 5s delay)
- Connection event listeners
- Connection pooling configuration
- Debug mode in development

**Configuration:**
```javascript
// Lines 38-71: Connection options
maxPoolSize: 10
minPoolSize: 2
socketTimeoutMS: 45000
serverSelectionTimeoutMS: 5000
autoIndex: (development only)

// Lines 77-82: Retry configuration
MAX_RETRY_ATTEMPTS: 5
RETRY_DELAY: 5000 (5 seconds)
```

#### `/backend/models/User.js`
**Purpose:** User model and schema definition
**Lines:** 405 lines
**Key Features:**
- Complete user schema with validation
- Password hashing pre-save hook
- Instance methods (comparePassword, updateLastLogin, isApproved)
- Static methods (findByEmail)
- Virtual fields (fullName)
- JSON transformation (excludes password)

**Schema Fields:**
```javascript
// Authentication
- email (unique, required, indexed)
- password (hashed, select: false)

// Profile
- firstName (required)
- lastName (required)
- phone (optional, validated)

// Authorization
- role (enum: user|member|admin|superadmin, default: user)
- status (enum: pending|approved|rejected, default: pending)

// Media
- profilePicture (optional)

// Metadata
- lastLogin (Date)
- isEmailVerified (Boolean)
- isActive (Boolean, default: true)
- createdAt (timestamp)
- updatedAt (timestamp)
```

**Indexes:**
```javascript
// Line 65: email (unique index)
// Line 159: status (index)
// Line 259: { email: 1, status: 1 } (compound)
// Line 262: { role: 1 } (role index)
```

#### `/backend/middleware/auth.js`
**Purpose:** Authentication and authorization middleware
**Lines:** 387 lines
**Key Features:**
- JWT token verification
- User authentication
- Role-based access control
- Account status verification

**Exported Functions:**
```javascript
// Line 73: authenticate(req, res, next)
//   - Extracts JWT from Authorization header
//   - Verifies token signature
//   - Fetches user from database
//   - Checks isActive and status === 'approved'
//   - Attaches req.user and req.token

// Line 254: isAdmin(req, res, next)
//   - Requires: admin or superadmin role

// Line 301: isSuperAdmin(req, res, next)
//   - Requires: superadmin role only

// Line 347: isMember(req, res, next)
//   - Requires: member, admin, or superadmin role
```

**Token Format:**
```
Authorization: Bearer <jwt_token>
```

**Error Codes:**
- `MISSING_TOKEN` - No Authorization header
- `INVALID_TOKEN_FORMAT` - Malformed header
- `TOKEN_EXPIRED` - JWT expired
- `INVALID_TOKEN` - Invalid signature
- `USER_NOT_FOUND` - User doesn't exist
- `ACCOUNT_INACTIVE` - isActive = false
- `ACCOUNT_NOT_APPROVED` - status !== 'approved'
- `INSUFFICIENT_PERMISSIONS` - Wrong role

#### `/backend/middleware/errorHandler.js`
**Purpose:** Centralized error handling
**Lines:** 353 lines
**Key Features:**
- Global error handler
- 404 Not Found handler
- Specific error type handlers
- Environment-aware responses

**Exported Functions:**
```javascript
// Line 49: notFound(req, res, next)
//   - Catches undefined routes
//   - Creates 404 error

// Line 91: errorHandler(err, req, res, next)
//   - Handles all application errors
//   - Specific handlers for:
//     * MongoDB duplicate key (E11000)
//     * Mongoose ValidationError
//     * Mongoose CastError
//     * JWT errors
//     * Multer file upload errors
//     * Express-validator errors

// Line 300: asyncHandler(fn)
//   - Wraps async functions to catch errors

// Line 326: AppError class
//   - Custom error with statusCode
```

**Error Response Format:**
```json
{
  "success": false,
  "status": "error|fail",
  "message": "Error description",
  "error": "ERROR_CODE",
  "stack": "..." // development only
}
```

### Empty/Placeholder Directories

#### `/backend/controllers/`
**Status:** 📁 EMPTY
**Purpose:** Will contain business logic for routes
**Expected Files:**
- `authController.js` - Login, register, logout, profile
- `userController.js` - User CRUD operations
- `projectController.js` - Project management
- `newsletterController.js` - Newsletter management
- `lmsController.js` - LMS content management
- `adminController.js` - Admin-specific operations

#### `/backend/routes/`
**Status:** 📁 EMPTY
**Purpose:** Will contain API route definitions
**Expected Files:**
- `auth.js` - Authentication routes
- `users.js` - User management routes
- `projects.js` - Project routes
- `newsletters.js` - Newsletter routes
- `lms.js` - LMS routes
- `admin.js` - Admin routes

#### `/backend/utils/`
**Status:** 📁 EMPTY
**Purpose:** Will contain utility functions
**Expected Files:**
- `generateToken.js` - JWT token generation
- `sendEmail.js` - Email sending utility
- `fileUpload.js` - File upload handling
- `validators.js` - Custom validation functions

---

## Frontend Structure

### Implemented Files

#### App Router Pages (`/frontend/app/`)

**`layout.js`** (Root Layout)
- Wraps all pages
- Includes Header and Footer
- Global metadata
- Font configuration

**`page.js`** (Home Page)
- Hero section
- About section
- Features section
- Projects preview section

**`login/page.js`**
- **Status:** Placeholder only
- Contains icon and message
- "Back to Home" button
- No actual login form

**`my-account/page.js`**
- **Status:** Placeholder only
- Contains icon and message
- "Back to Home" button
- No actual dashboard

**Other Pages** (`about/`, `contact/`, `lms/`, `newsletters/`, `projects/`)
- **Status:** Placeholder pages
- Similar structure to login/my-account
- Implementation pending

#### Components (`/frontend/components/`)

**`layout/Header.jsx`**
- Navigation bar
- Logo/brand
- Navigation links
- Mobile-responsive

**`layout/Footer.jsx`**
- Footer information
- Links
- Brand elements

**`sections/HeroSection.jsx`**
- Landing page hero
- Call-to-action

**`sections/AboutSection.jsx`**
- About OREPA content

**`sections/FeaturesSection.jsx`**
- Platform features display

**`sections/ProjectsSection.jsx`**
- Projects preview

**`ui/button.jsx`**
- Reusable button component
- shadcn/ui style
- Variant support

#### Library Files (`/frontend/lib/`)

**`api.js`** (Lines: 378)
**Purpose:** HTTP client and API functions
**Key Features:**
- Axios instance with baseURL
- Request interceptor (attaches JWT)
- Response interceptor (handles errors)
- Auto-redirect on 401
- API helper functions

**Exported Functions:**
```javascript
// Line 43: api (Axios instance)
// Line 247: login(email, password)
// Line 280: register(userData)
// Line 296: logout()
// Line 321: fetchProfile()
// Line 338: fetchUsers(params)
// Line 351: fetchUserById(userId)
// Line 364: updateProfile(updates)
```

**`utils.js`**
**Purpose:** Utility functions
**Expected to contain:**
- `cn()` - Class name utility (tailwind-merge)
- `getToken()` - Get JWT from localStorage
- `setToken()` - Store JWT
- `clearAuthData()` - Clear auth data
- `getApiUrl()` - Get API URL from env

### Configuration Files

**`next.config.js`**
- Next.js configuration
- Build settings

**`tailwind.config.js`**
- Tailwind CSS configuration
- Custom colors (OREPA brand)
- Theme customization

**`jsconfig.json`**
- Path aliases (@/components, @/lib, etc.)

**`postcss.config.js`**
- PostCSS for Tailwind

---

## Key File Locations

### Backend Critical Files

| File | Path | Purpose | Status |
|------|------|---------|--------|
| Server Entry | `/backend/server.js` | App initialization | ✅ Complete |
| Database Config | `/backend/config/database.js` | MongoDB connection | ✅ Complete |
| User Model | `/backend/models/User.js` | User schema | ✅ Complete |
| Auth Middleware | `/backend/middleware/auth.js` | JWT & RBAC | ✅ Complete |
| Error Handler | `/backend/middleware/errorHandler.js` | Error handling | ✅ Complete |
| Auth Routes | `/backend/routes/auth.js` | Login/register endpoints | ❌ Missing |
| Auth Controller | `/backend/controllers/authController.js` | Auth business logic | ❌ Missing |

### Frontend Critical Files

| File | Path | Purpose | Status |
|------|------|---------|--------|
| Root Layout | `/frontend/app/layout.js` | App wrapper | ✅ Complete |
| Home Page | `/frontend/app/page.js` | Landing page | ✅ Complete |
| Login Page | `/frontend/app/login/page.js` | Login UI | 🚧 Placeholder |
| Account Page | `/frontend/app/my-account/page.js` | User dashboard | 🚧 Placeholder |
| API Client | `/frontend/lib/api.js` | HTTP requests | ✅ Complete |
| Utilities | `/frontend/lib/utils.js` | Helper functions | ✅ Complete |
| Header | `/frontend/components/layout/Header.jsx` | Navigation | ✅ Complete |

### Docker Files

| File | Path | Purpose | Status |
|------|------|---------|--------|
| Compose | `/docker-compose.yml` | Multi-container setup | ✅ Complete |
| Backend Dockerfile | `/backend/Dockerfile` | Backend image | ✅ Complete |
| Frontend Dockerfile | `/frontend/Dockerfile` | Frontend image | ✅ Complete |
| Environment | `/.env` | Environment variables | ✅ Complete |

---

## File Organization Patterns

### Backend Pattern (MVC-style)

```
Typical Request Flow:
  Route → Middleware → Controller → Model → Database
   │         │            │          │         │
   │         │            │          │         └─ MongoDB
   │         │            │          └─ User.js
   │         │            └─ authController.js
   │         └─ authenticate, isAdmin
   └─ /api/auth/login

Current Status:
  Route → Middleware → ❌ Controller ❌ → Model → Database
   │         │                               │         │
   │         │                               │         └─ MongoDB ✅
   │         │                               └─ User.js ✅
   │         └─ authenticate ✅, isAdmin ✅
   └─ ❌ No routes defined ❌
```

### Frontend Pattern (Next.js App Router)

```
app/
├── layout.js          ← Root layout (all pages)
├── page.js            ← Home page (/)
└── [feature]/
    └── page.js        ← Feature page (/feature)

components/
├── layout/            ← Layout components (Header, Footer)
├── sections/          ← Page sections (Hero, About)
└── ui/                ← Reusable UI components (Button, Input)

lib/
├── api.js             ← API client & functions
└── utils.js           ← Utility functions
```

### Naming Conventions

#### Backend
- **Models:** PascalCase (User.js)
- **Middleware:** camelCase (auth.js, errorHandler.js)
- **Config:** camelCase (database.js)
- **Routes:** camelCase (auth.js, users.js)
- **Controllers:** camelCase with Controller suffix (authController.js)

#### Frontend
- **Pages:** camelCase (page.js, layout.js)
- **Components:** PascalCase for React components (Header.jsx, Button.jsx)
- **Utilities:** camelCase (api.js, utils.js)
- **Styles:** kebab-case (globals.css)

---

## Import/Export Patterns

### Backend Exports

```javascript
// Models
module.exports = User;

// Middleware
module.exports = {
  authenticate,
  isAdmin,
  isSuperAdmin,
  isMember,
};

// Error Handler
module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
  AppError,
};

// Config
module.exports = connectDB;
```

### Frontend Exports

```javascript
// API functions
export const login = async (email, password) => { ... };
export const register = async (userData) => { ... };
export default api; // Default export

// Components
export default function Header() { ... }

// Utilities
export function cn(...inputs) { ... }
export const getToken = () => { ... };
```

---

## Path Aliases (Frontend)

Configured in `jsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Usage:
```javascript
import { Button } from '@/components/ui/button';
import { api, login } from '@/lib/api';
import { cn } from '@/lib/utils';
```

---

## Docker Structure

### docker-compose.yml Services

```yaml
services:
  frontend:
    build: ./frontend
    ports: "3000:3000"
    depends_on:
      - backend (healthy)

  backend:
    build: ./backend
    ports: "5000:5000"
    depends_on:
      - mongodb (healthy)

  mongodb:
    image: mongo:7.0
    ports: "27017:27017"
    volumes:
      - mongodb_data:/data/db
```

---

## Summary

### Strengths
✅ Clear separation of concerns
✅ Logical folder structure
✅ Consistent naming conventions
✅ Well-organized components
✅ Path aliases for clean imports
✅ Docker containerization

### Gaps
❌ Empty controllers directory
❌ Empty routes directory
❌ Empty utils directory
❌ Placeholder pages (login, my-account, etc.)
❌ No admin-specific components/pages yet

### Next Steps
1. Create controller files for business logic
2. Create route files for API endpoints
3. Implement authentication pages (login, register)
4. Build user dashboard
5. Create admin dashboards for each admin type
6. Add utility functions as needed

---

**Related Documentation:**
- [Database Schema](./03_Database_Schema.md)
- [Authentication Analysis](./04_Authentication_Analysis.md)
- [API Endpoints](./05_API_Endpoints.md)
- [Frontend Components](./06_Frontend_Components.md)

