const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');
const UserModel = require('../models/User');

const prisma = new PrismaClient();

// Configuration
const CSV_FILE_PATH = '../participants-database-23rd-January-2026.csv'; // Adjust path if needed relative to script
const DEFAULT_PASSWORD = process.env.IMPORT_DEFAULT_PASSWORD; // Default password for imported users
if (!DEFAULT_PASSWORD) {
    console.error("Error: IMPORT_DEFAULT_PASSWORD environment variable is not set.");
    process.exit(1);
}
const DEFAULT_DOB = new Date('2000-01-01'); // Default DOB as per plan

async function importParticipants() {
    const results = [];

    console.log('Starting CSV import...');

    // 1. Read CSV
    try {
        const stream = fs.createReadStream(CSV_FILE_PATH)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                console.log(`Parsed ${results.length} records. Processing...`);
                await processRecords(results);
            });
    } catch (err) {
        console.error('Error reading CSV:', err);
    }
}

async function processRecords(records) {
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const record of records) {
        try {
            // 2. Map fields
            // CSV Headers: full_name,name_with_initials,membership_id,address,phone,email,batch,school_admission_number,last_year_sat_for_a_l,university,faculty,department,batch_of_university,university_level,mailing_list,id

            const email = record.email ? record.email.trim().toLowerCase() : null;
            if (!email) {
                console.warn(`Skipping record with no email: ${record.full_name}`);
                skippedCount++;
                continue;
            }

            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                console.log(`User already exists: ${email}. Skipping.`);
                skippedCount++;
                continue;
            }

            // Name handling
            const fullName = record.full_name || '';
            const nameParts = fullName.split(' ');
            let firstName = nameParts[0] || 'Member';
            let lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Member';
            // If name_with_initials exists, might be better to keep simple first/last name logic or refine it.
            // Keeping simple split for now.

            // Map other fields
            const phone = record.phone || '';
            const address = record.address || '';
            const batch = parseInt(record.batch) || 0; // "batch" in CSV seems to be A/L batch? User model has "batch" (Int)
            const admissionNumber = record.school_admission_number || record.membership_id || ''; // Using school_admission_number primarily
            const university = record.university || '';
            const faculty = record.faculty || '';
            // department maps to engineeringField?
            const engineeringField = record.department || '';
            const alShy = record.last_year_sat_for_a_l || '';
            const universityLevel = record.university_level || '';


            // 3. Generate SC ID
            // NOTE: User.create from UserModel handles password hashing, but createOrepaSCId is separate call in controller usually?
            // In UserModel.js: generateOrepaSCId() is available.

            const orepaSCId = await UserModel.generateOrepaSCId();

            // 4. Create User
            // Prepare data for Prisma
            const userData = {
                email,
                password: DEFAULT_PASSWORD,
                firstName,
                lastName,
                nameWithInitials: record.name_with_initials || fullName,
                dateOfBirth: DEFAULT_DOB,
                address,
                phone,

                // Academic
                batch,
                admissionNumber,
                alShy,
                university,
                faculty,
                universityLevel,
                engineeringField,
                orepaSCId,

                // Status & Role
                role: 'MEMBER', // or 'USER' if they need to be verified again? Plan said APPROVED
                status: 'APPROVED',
                isActive: true,
                isEmailVerified: true, // Assuming imported users are verified

                // Metadata
                createdBy: { connect: { email: 'superadmin@orepa.com' } } // Optional: link to importer if possible, else skip
            };

            // Remove createdBy if we don't have a superadmin ID handy easily without fetching one.
            // Instead, let's just use prisma.user.create without createdBy connection for now to be safe, 
            // or fetch a superadmin first. For simplicity, skipping createdBy relationship for import.
            delete userData.createdBy;

            // Use UserModel.create to handle password hashing
            await UserModel.create(userData);

            console.log(`Imported: ${email} with ID: ${orepaSCId}`);
            successCount++;

        } catch (err) {
            console.error(`Error processing record ${record.email}:`, err.message);
            errorCount++;
        }
    }

    console.log('--------------------------------------------------');
    console.log(`Import Complete.`);
    console.log(`Success: ${successCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors:  ${errorCount}`);
    console.log('--------------------------------------------------');
}

importParticipants()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
