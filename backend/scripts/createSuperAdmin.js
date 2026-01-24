// ============================================================================
// OREPA Backend - Create Super Admin Script
// ============================================================================
//
// Purpose:
//   Creates the initial Super Admin account in the database (Prisma/PostgreSQL)
//   This script should be run once during initial system setup
//
// Usage:
//   node backend/scripts/createSuperAdmin.js
//
//   OR with custom credentials:
//   node backend/scripts/createSuperAdmin.js --email admin@orepa.com --password yourpassword --firstName John --lastName Doe
//
// Security Notes:
//   - This script should only be run by the system owner (Dehan)
//   - Use a strong password (minimum 8 characters, recommended 12+)
//   - Keep credentials secure and never commit them to version control
//   - After running, delete this script or restrict access to it
//
// ============================================================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const readline = require('readline');

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Default Super Admin Credentials
 *
 * These are used if no command-line arguments are provided
 * CHANGE THESE BEFORE RUNNING IN PRODUCTION
 */
const DEFAULT_CREDENTIALS = {
  email: process.env.SUPER_ADMIN_EMAIL || 'admin@orepa.com',
  password: process.env.SUPER_ADMIN_PASSWORD,

  firstName: process.env.SUPER_ADMIN_FIRSTNAME || 'Super',
  lastName: process.env.SUPER_ADMIN_LASTNAME || 'Admin',
};

// ============================================================================
// COMMAND LINE ARGUMENT PARSING
// ============================================================================

/**
 * Parse Command Line Arguments
 *
 * Extracts email, password, firstName, lastName from command line args
 * Format: --email value --password value --firstName value --lastName value
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const credentials = { ...DEFAULT_CREDENTIALS };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];

    if (['email', 'password', 'firstName', 'lastName'].includes(key)) {
      credentials[key] = value;
    }
  }

  return credentials;
}

// ============================================================================
// INTERACTIVE PROMPT (if no args provided)
// ============================================================================

/**
 * Prompt User for Credentials
 *
 * Interactive CLI prompts for Super Admin details
 * Used when script is run without command-line arguments
 */
async function promptForCredentials() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  console.log('\n🔐 Create Super Admin Account\n');
  console.log('Press Enter to use default values shown in [brackets]\n');

  const email = await question(`Email [${DEFAULT_CREDENTIALS.email}]: `);
  const password = await question(`Password [${DEFAULT_CREDENTIALS.password}]: `);
  const firstName = await question(`First Name [${DEFAULT_CREDENTIALS.firstName}]: `);
  const lastName = await question(`Last Name [${DEFAULT_CREDENTIALS.lastName}]: `);

  rl.close();

  return {
    email: email.trim() || DEFAULT_CREDENTIALS.email,
    password: password.trim() || DEFAULT_CREDENTIALS.password,
    firstName: firstName.trim() || DEFAULT_CREDENTIALS.firstName,
    lastName: lastName.trim() || DEFAULT_CREDENTIALS.lastName,
  };
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate Credentials
 *
 * Ensures all required fields are present and meet minimum requirements
 */
function validateCredentials(credentials) {
  const errors = [];

  // Validate email format
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(credentials.email)) {
    errors.push('Invalid email format');
  }

  // Validate password length
  if (credentials.password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Validate names
  if (!credentials.firstName || credentials.firstName.length < 2) {
    errors.push('First name must be at least 2 characters');
  }

  if (!credentials.lastName || credentials.lastName.length < 2) {
    errors.push('Last name must be at least 2 characters');
  }

  return errors;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Create Super Admin Account
 *
 * Main function that:
 * 1. Connects to Database (Prisma)
 * 2. Gets or prompts for credentials
 * 3. Validates credentials
 * 4. Checks if Super Admin already exists
 * 5. Creates Super Admin account
 * 6. Displays success message
 */
async function createSuperAdmin() {
  try {
    console.log('\n========================================');
    console.log('  OREPA - Create Super Admin Account');
    console.log('========================================\n');

    // ========================================================================
    // STEP 1: Connect to Database
    // ========================================================================

    console.log('📡 Connecting to Database...');

    await prisma.$connect();

    console.log('✅ Connected to Database\n');

    // ========================================================================
    // STEP 2: Get Credentials
    // ========================================================================

    let credentials;

    // Check if command-line arguments were provided
    const hasArgs = process.argv.length > 2;

    if (hasArgs) {
      // Parse command-line arguments
      credentials = parseArgs();
      console.log('📝 Using credentials from command-line arguments');
    } else {
      // Prompt for credentials interactively
      credentials = await promptForCredentials();
    }

    console.log('\n📋 Credentials Summary:');
    console.log(`   Email: ${credentials.email}`);
    console.log(`   Name: ${credentials.firstName} ${credentials.lastName}`);
    console.log(`   Password: ${'*'.repeat(credentials.password.length)} (hidden)\n`);

    // ========================================================================
    // STEP 3: Validate Credentials
    // ========================================================================

    const validationErrors = validateCredentials(credentials);

    if (validationErrors.length > 0) {
      console.error('❌ Validation Errors:');
      validationErrors.forEach((error) => console.error(`   - ${error}`));
      process.exit(1);
    }

    // ========================================================================
    // STEP 4: Check if Super Admin Already Exists
    // ========================================================================

    console.log('🔍 Checking for existing Super Admin accounts...');

    // Check by email
    const existingByEmail = await prisma.user.findUnique({ where: { email: credentials.email.toLowerCase() } });

    if (existingByEmail) {
      console.log('\n⚠️  WARNING: A user with this email already exists!');
      console.log('   Email:', existingByEmail.email);
      console.log('   Role:', existingByEmail.role);
      console.log('   Status:', existingByEmail.status);
      console.log('\n❌ Cannot create duplicate account. Exiting...\n');
      process.exit(1);
    }

    // Check for any existing Super Admin using findFirst
    const existingSuperAdmin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });

    if (existingSuperAdmin) {
      console.log('\n⚠️  INFO: A Super Admin account already exists in the database.');
      console.log('   Email:', existingSuperAdmin.email);
      console.log('   Name:', `${existingSuperAdmin.firstName} ${existingSuperAdmin.lastName}`);
      console.log('\n   Creating an additional Super Admin account...\n');
    } else {
      console.log('✅ No existing Super Admin found. Proceeding with creation.\n');
    }

    // ========================================================================
    // STEP 5: Create Super Admin Account
    // ========================================================================

    console.log('🔨 Creating Super Admin account...');

    // Hash the password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(credentials.password, salt);

    // Some required fields might be missing from credentials, add dummy data for them
    // based on schema requirements: batch, admissionNumber, alShy, university, faculty, universityLevel, engineeringField, phone, address, dateOfBirth, nameWithInitials

    const superAdmin = await prisma.user.create({
      data: {
        email: credentials.email.toLowerCase(),
        password: hashedPassword,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        role: 'SUPER_ADMIN',
        isAdmin: true,
        status: 'APPROVED',
        isActive: true, // Prisma defaults this to true, but consistent with intent
        isEmailVerified: true,

        // Required fields placeholder data for Admin
        nameWithInitials: `${credentials.firstName.charAt(0)}. ${credentials.lastName}`,
        dateOfBirth: new Date('1980-01-01'), // Dummy date
        address: 'OREPA Admin Office',
        phone: '0000000000',

        // Academic dummy data
        batch: 0,
        admissionNumber: 'ADMIN',
        alShy: '1st shy', // Enum string
        university: 'UOM',
        faculty: 'Engineering',
        universityLevel: 'Graduated', // Enum string
        engineeringField: 'Computer Science',
      }
    });

    console.log('✅ Super Admin account created successfully!\n');

    // ========================================================================
    // STEP 6: Display Success Information
    // ========================================================================

    console.log('========================================');
    console.log('  🎉 SUCCESS! Super Admin Created');
    console.log('========================================\n');

    console.log('📧 Login Credentials:');
    console.log(`   Email:    ${credentials.email}`);
    console.log(`   Password: ${credentials.password}`);
    console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
    console.log('   1. Store these credentials in a secure password manager');
    console.log('   2. Never share these credentials');
    console.log('   3. Change the password after first login (recommended)');
    console.log('   4. Enable two-factor authentication (if available)');
    console.log('   5. This script should be deleted or access-restricted after use\n');

    console.log('🌐 Login URL:');
    console.log(`   Local:      http://localhost:3000/admin/login`);
    console.log(`   Production: https://your-domain.com/admin/login\n`);

    console.log('📊 Account Details:');
    console.log(`   User ID:   ${superAdmin.id}`);
    console.log(`   Role:      ${superAdmin.role}`);
    console.log(`   Status:    ${superAdmin.status}`);
    console.log(`   Created:   ${superAdmin.createdAt.toISOString()}\n`);

    console.log('✅ You can now log in to the Super Admin dashboard!\n');

    // ========================================================================
    // STEP 7: Cleanup and Exit
    // ========================================================================

    await prisma.$disconnect();
    console.log('📡 Database connection closed.');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR: Failed to create Super Admin account\n');
    console.error('Error Details:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Stack: ${error.stack}\n`);

    // Close database connection
    await prisma.$disconnect();
    console.log('📡 Database connection closed.\n');

    process.exit(1);
  }
}

// ============================================================================
// EXECUTE SCRIPT
// ============================================================================

// Run the script
createSuperAdmin();

// ============================================================================
// END OF CREATE SUPER ADMIN SCRIPT
// ============================================================================
