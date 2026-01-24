# OREPA Super Admin - Access Guide

**CONFIDENTIAL - SYSTEM OWNER ONLY**

---

## 🔐 Super Admin Login Credentials

```
Email:    admin@orepa.com
Password: SuperAdmin@2026
```

⚠️ **Security Reminder:** Change the password after first login!

---

## 🌐 Hidden Login URL

### The Super Admin login is accessible at a hidden, non-discoverable route:

**Local Development:**
```
http://localhost:3000/sys-access-portal-x7k9
```

**Production:**
```
https://your-domain.com/sys-access-portal-x7k9
```

### Why a Hidden Route?

1. **Security through obscurity** - The admin login is not linked anywhere in the public interface
2. **Reduced attack surface** - Bots and attackers won't easily find the login page
3. **No admin registration** - Only system owner (Dehan) can create admin accounts at database level
4. **Rate limited** - Backend limits login attempts (5 per 15 minutes)
5. **Audit logged** - All login attempts are tracked in AdminActionLog

---

## 🚀 How to Access (Step-by-Step)

### Step 1: Start the Application

**Backend:**
```bash
cd backend
npm install  # First time only
npm start    # Runs on port 5000
```

**Frontend:**
```bash
cd frontend
npm install  # First time only
npm run dev  # Runs on port 3000
```

### Step 2: Navigate to Hidden Login

Open your browser and go to:
```
http://localhost:3000/sys-access-portal-x7k9
```

**DO NOT share this URL publicly or link to it anywhere on the website.**

### Step 3: Login

- Enter email: `admin@orepa.com`
- Enter password: `SuperAdmin@2026`
- (Optional) Check "Remember me for 30 days"
- Click "Login"

### Step 4: You're In!

After successful login, you'll be redirected to:
```
http://localhost:3000/admin/dashboard
```

You now have full Super Admin access to all platform features.

---

## 📱 Features Currently Available

### ✅ Working Now:
- **Hidden Super Admin Login** - Secure, obscure login route
- **Authentication & Authorization** - JWT-based session management
- **Dashboard Placeholder** - Basic dashboard view
- **Logout Functionality** - Secure logout with audit logging

### 🔨 Backend API Ready (Frontend UI Pending):
- User Management (CRUD operations)
- User Approval/Rejection/Suspension
- Dashboard Statistics
- System Configuration (partially)
- Audit Logs
- Admin Profile Management
- Password Change

### 🚧 Coming Soon:
- Full Dashboard with Stats
- User Management Interface
- Pending Approvals UI
- Analytics Dashboard
- System Settings UI
- Audit Logs Viewer
- Newsletter Management
- System Maintenance Tools

---

## 🔧 Troubleshooting

### Can't Access Login Page?

**Check:**
1. Is the frontend running? (`npm run dev` in frontend directory)
2. Is it running on port 3000? Check terminal output
3. Did you type the URL correctly? (it's `/sys-access-portal-x7k9`)
4. Clear browser cache and try again

### Login Failed?

**Check:**
1. Is the backend running? (`npm start` in backend directory)
2. Is MongoDB connected? Check backend console for connection message
3. Was the Super Admin account created? (Run `node backend/scripts/createSuperAdmin.js`)
4. Are credentials correct?
   - Email: `admin@orepa.com`
   - Password: `SuperAdmin@2026`
5. Check browser console (F12) for errors

### Account Locked?

If you see "Account temporarily locked" message:
- Wait 15 minutes (lockout duration after 5 failed attempts)
- Or manually reset in MongoDB:
  ```javascript
  db.users.updateOne(
    { email: "admin@orepa.com" },
    { $set: { loginAttempts: 0, accountLockedUntil: null } }
  )
  ```

### Token Expired?

If you get 401 errors:
- Tokens expire after 7 days (configurable in .env)
- Simply log in again
- Or clear localStorage and log in:
  ```javascript
  // In browser console (F12)
  localStorage.clear();
  window.location.reload();
  ```

---

## 🛡️ Security Best Practices

### DO:
- ✅ Keep the hidden URL confidential
- ✅ Use strong passwords (change default password)
- ✅ Enable 2FA when available (future feature)
- ✅ Log out when done
- ✅ Regularly review audit logs
- ✅ Change JWT_SECRET in production (.env file)

### DON'T:
- ❌ Share the hidden URL publicly
- ❌ Link to the admin login from public pages
- ❌ Use the default password in production
- ❌ Share admin credentials
- ❌ Leave your session logged in on shared computers
- ❌ Commit credentials to version control

---

## 🔑 Creating Additional Admin Accounts

Admin accounts can ONLY be created by the system owner (Dehan) at the database level.

### Method 1: Using the Seeding Script

```bash
cd backend
node scripts/createSuperAdmin.js --email newadmin@orepa.com --password SecurePass123 --firstName Jane --lastName Doe
```

### Method 2: Directly in MongoDB

Using MongoDB Compass or mongosh:

```javascript
db.users.insertOne({
  email: "newadmin@orepa.com",
  password: "$2a$10$...", // Hash with bcrypt (see below)
  firstName: "Jane",
  lastName: "Doe",
  role: "SUPER_ADMIN", // or MEMBER_ADMIN, CONTENT_ADMIN, NEWSLETTER_ADMIN
  isAdmin: true,
  isApproved: true,
  status: "APPROVED",
  isActive: true,
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**To hash a password for MongoDB:**
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourPassword', 10));"
```

---

## 📊 Admin Roles & Permissions

### SUPER_ADMIN (You)
- **Full platform access**
- Can perform ALL actions
- Manages all users, content, newsletters, system settings
- Views all analytics and audit logs
- Emergency powers

### MEMBER_ADMIN
- User registration approval
- User management (view, approve, reject, suspend)
- View analytics
- View audit logs

### CONTENT_ADMIN
- Manage projects, LMS content, scholarships
- Manage gallery and media library
- Edit pages
- View content analytics

### NEWSLETTER_ADMIN
- Create, edit, publish newsletters
- Manage subscribers
- View newsletter analytics

---

## 🗂️ Important Files & Locations

### Backend
- **Login Endpoint:** `backend/routes/admin/auth.js`
- **Auth Middleware:** `backend/middleware/auth.js`
- **User Model:** `backend/models/User.js`
- **Audit Log Model:** `backend/models/AdminActionLog.js`
- **Seeding Script:** `backend/scripts/createSuperAdmin.js`

### Frontend
- **Hidden Login:** `frontend/app/sys-access-portal-x7k9/page.js`
- **Dashboard:** `frontend/app/admin/dashboard/page.js`
- **Admin Layout:** `frontend/app/admin/layout.js`
- **Auth Context:** `frontend/contexts/AdminAuthContext.js`
- **API Client:** `frontend/lib/api/adminApi.js`

### Configuration
- **Backend Env:** `backend/.env` or root `.env`
- **Frontend Env:** `frontend/.env.local`

---

## 📞 Support & Questions

**System Owner:** Dehan
**Technical Issues:** Check implementation status at `docs/SUPER_ADMIN_IMPLEMENTATION_STATUS.md`

### Quick Commands

**Create Super Admin:**
```bash
node backend/scripts/createSuperAdmin.js
```

**Start Backend:**
```bash
cd backend && npm start
```

**Start Frontend:**
```bash
cd frontend && npm run dev
```

**Check MongoDB Connection:**
```bash
mongosh "your-connection-string"
```

---

## 🎯 Quick Test After Setup

1. **Backend Test:**
   ```bash
   curl -X POST http://localhost:5000/api/admin/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@orepa.com","password":"SuperAdmin@2026"}'
   ```

   Should return: `{ "success": true, "token": "...", "user": {...} }`

2. **Frontend Test:**
   - Navigate to: `http://localhost:3000/sys-access-portal-x7k9`
   - Login with credentials
   - Should redirect to: `http://localhost:3000/admin/dashboard`

---

**Document End** - Keep this guide secure! 🔐
