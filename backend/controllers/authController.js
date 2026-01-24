// ============================================================================
// OREPA Backend - User Authentication Controller
// ============================================================================
//
// Purpose:
//   Handles authentication logic for regular users
//   Separate from admin authentication
//
// Features:
//   - User self-registration (pending approval)
//   - User login (approved users only)
//   - Profile management
//
// Dependencies:
//   - User model: For user authentication
//   - asyncHandler: Error handling wrapper
//
// Usage:
//   const { register, login, logout } = require('./controllers/authController');
//
// ============================================================================

const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const prisma = new PrismaClient();

// ============================================================================
// USER REGISTRATION
// ============================================================================

/**
 * User Registration Controller
 *
 * Allows users to self-register (status: PENDING until approved)
 * Admin users cannot register through this endpoint
 *
 * Route: POST /api/auth/register
 * Access: Public
 * Rate Limited: 3 attempts per hour
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
exports.register = asyncHandler(async (req, res) => {
  // ==========================================================================
  // STEP 1: Extract and Validate Input
  // ==========================================================================

  const { email, password, firstName, lastName } = req.body;

  // Validate required fields
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: email, password, firstName, lastName',
      error: 'MISSING_REQUIRED_FIELDS',
    });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
      error: 'WEAK_PASSWORD',
    });
  }

  // ==========================================================================
  // STEP 2: Check if User Already Exists
  // ==========================================================================

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(409).json({
      success: false,
      message: 'User already exists with this email address',
      error: 'EMAIL_ALREADY_EXISTS',
    });
  }

  // ==========================================================================
  // STEP 2.5: Generate OREPA_SC_ID
  // ==========================================================================
  // Format: SC/YY/XXXX (e.g., SC/25/0001) where YY is current year

  const orepaSCId = await User.generateOrepaSCId();

  // ==========================================================================
  // STEP 3: Create New User (Pending Approval)
  // ==========================================================================

  const user = await User.create({
    email,
    password, // Will be hashed by pre-save hook
    firstName,
    lastName,
    nameWithInitials: req.body.nameWithInitials,
    address: req.body.address,
    dateOfBirth: req.body.dateOfBirth,
    country: req.body.country,
    phone: req.body.phone,
    batch: req.body.batch,
    admissionNumber: req.body.admissionNumber,
    alShy: req.body.alShy,
    university: req.body.university,
    faculty: req.body.faculty,
    universityLevel: req.body.universityLevel,
    engineeringField: req.body.engineeringField,
    orepaSCId: orepaSCId, // Generated ID
    // Fields not provided by user but managed by system
    role: 'USER', // Default role for searchability, effectively 'STUDENT' if we add that enum
    status: 'PENDING', // Pending approval
    isAdmin: false,
  });

  // ==========================================================================
  // STEP 4: TODO - Send Confirmation Email to User
  // ==========================================================================

  // TODO: Send email to user confirming registration
  // TODO: Notify MEMBER_ADMIN users of pending registration

  // ==========================================================================
  // STEP 5: Send Response
  // ==========================================================================

  res.status(201).json({
    success: true,
    message: 'Registration successful! Your account is pending approval. You will receive an email once approved.',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
    },
  });
});

// ============================================================================
// USER LOGIN
// ============================================================================

/**
 * User Login Controller
 *
 * Authenticates regular users (approved users only)
 * Admin users must use /admin/login endpoint
 *
 * Route: POST /api/auth/login
 * Access: Public
 * Rate Limited: 5 attempts per 15 minutes
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with token and user info
 */
exports.login = asyncHandler(async (req, res) => {
  // ==========================================================================
  // STEP 1: Extract and Validate Input
  // ==========================================================================

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password',
      error: 'MISSING_CREDENTIALS',
    });
  }

  // ==========================================================================
  // STEP 2: Find User
  // ==========================================================================

  const user = await User.findByEmail(email);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      error: 'INVALID_CREDENTIALS',
    });
  }

  // ==========================================================================
  // STEP 3: Prevent Admin Login Through Regular Endpoint
  // ==========================================================================

  if (user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin accounts must login through the admin portal at /admin/login',
      error: 'ADMIN_LOGIN_REQUIRED',
    });
  }

  // ==========================================================================
  // STEP 4: Check Account Status
  // ==========================================================================

  // Check if account is approved
  if (user.status !== 'APPROVED') {
    const messages = {
      PENDING: 'Your account is pending approval. Please wait for administrator verification.',
      REJECTED: 'Your registration has been rejected. Please contact support for more information.',
      SUSPENDED: 'Your account has been suspended. Please contact support.',
    };

    return res.status(403).json({
      success: false,
      message: messages[user.status] || 'Account access denied',
      error: 'ACCOUNT_NOT_APPROVED',
      status: user.status,
    });
  }

  // Check if account is locked
  if (User.isAccountLocked(user)) {
    const lockTimeRemaining = Math.ceil((user.accountLockedUntil - Date.now()) / (60 * 1000));
    return res.status(403).json({
      success: false,
      message: `Account temporarily locked due to too many failed login attempts. Please try again in ${lockTimeRemaining} minutes.`,
      error: 'ACCOUNT_LOCKED',
      lockUntil: user.accountLockedUntil,
    });
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account is inactive. Please contact support.',
      error: 'ACCOUNT_INACTIVE',
    });
  }

  // ==========================================================================
  // STEP 5: Verify Password
  // ==========================================================================

  const isPasswordCorrect = await User.comparePassword(password, user.password);

  if (!isPasswordCorrect) {
    // Increment failed login attempts
    await User.incrementLoginAttempts(user.id, user.loginAttempts);

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      error: 'INVALID_CREDENTIALS',
    });
  }

  // ==========================================================================
  // STEP 6: Password Correct - Reset Login Attempts
  // ==========================================================================

  await User.resetLoginAttempts(user.id);

  // ==========================================================================
  // STEP 7: Update Last Login
  // ==========================================================================

  await User.updateLastLogin(user.id);

  // ==========================================================================
  // STEP 8: Generate JWT Token
  // ==========================================================================

  const token = User.generateAuthToken(user);

  // ==========================================================================
  // STEP 9: Send Response
  // ==========================================================================

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: User.getFullName(user),
      role: user.role,
    },
  });
});

// ============================================================================
// USER LOGOUT
// ============================================================================

/**
 * User Logout Controller
 *
 * Logs user logout (token invalidation handled on client side)
 *
 * Route: POST /api/auth/logout
 * Access: Protected (User only)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
exports.logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// ============================================================================
// GET USER PROFILE
// ============================================================================

/**
 * Get User Profile Controller
 *
 * Returns profile information for the authenticated user
 *
 * Route: GET /api/auth/profile
 * Access: Protected (Authenticated user)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user profile
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });

  if (user) {
    delete user.password;
    user.fullName = `${user.firstName} ${user.lastName}`;
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// ============================================================================
// UPDATE USER PROFILE
// ============================================================================

/**
 * Update User Profile Controller
 *
 * Allows users to update their own profile information
 * Cannot change role or approval status
 *
 * Route: PUT /api/auth/profile
 * Access: Protected (Authenticated user)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated profile
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      error: 'USER_NOT_FOUND',
    });
  }

  // Allowed fields to update
  const allowedUpdates = ['firstName', 'lastName', 'phone', 'university', 'faculty', 'engineeringField'];
  // Note: graduationYear was in old code but schema says batch (int). Checking if graduationYear was mapped?
  // Schema has: batch, admissionNumber, university, etc.
  // Old code had: allowedUpdates = ['firstName', 'lastName', 'phone', 'graduationYear', 'engineeringField'];
  // But user model had 'batch'. Assuming graduationYear might have been batch.

  const updateData = {};

  // Update allowed fields only
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  // Handle batch separately if passed as graduationYear
  if (req.body.graduationYear) {
      updateData.batch = req.body.graduationYear;
  }
  // If batch is passed directly
  if (req.body.batch) {
      updateData.batch = req.body.batch;
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: updateData
  });

  const fullName = `${updatedUser.firstName} ${updatedUser.lastName}`;

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      fullName: fullName,
      phone: updatedUser.phone,
      role: updatedUser.role,
    },
  });
});

// ============================================================================
// FORGOT PASSWORD
// ============================================================================

/**
 * Forgot Password Controller
 *
 * Request a password reset email
 * Generates a reset token and sends it via email
 *
 * Route: POST /api/auth/forgot-password
 * Access: Public
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { email: req.body.email },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User with this email was not found',
      error: 'USER_NOT_FOUND'
    });
  }

  // Get reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken,
      resetPasswordExpire
    }
  });

  // Create reset URL
  const resetUrl = `${process.env.CORS_ORIGIN.split(',')[0]}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message: message,
    });

    res.status(200).json({
      success: true,
      message: 'Email sent'
    });
  } catch (err) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: null,
        resetPasswordExpire: null
      }
    });

    return res.status(500).json({
      success: false,
      message: 'Email could not be sent',
      error: 'EMAIL_SEND_ERROR'
    });
  }
});

// ============================================================================
// RESET PASSWORD
// ============================================================================

/**
 * Reset Password Controller
 *
 * Reset password using token
 *
 * Route: PUT /api/auth/reset-password/:resetToken
 * Access: Public
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken,
      resetPasswordExpire: { gte: new Date() }
    }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid token',
      error: 'INVALID_TOKEN'
    });
  }

  // Set new password
  // Note: Password hashing should be handled by model hook or manually here if needed.
  // The User model creation in authController usually lets hooks handle it.
  // However, User model update via prisma directly might skip hooks if not explicitly called.
  // We need to hash password here.
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpire: null
    }
  });

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

// ============================================================================
// END OF USER AUTHENTICATION CONTROLLER
// ============================================================================
