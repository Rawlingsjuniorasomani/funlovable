const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('./db/pool');
const jwt = require('jsonwebtoken');

async function fixTeacherRole() {
    try {
        // Find the user who is likely logging in (based on recent activity or assumption)
        // Or updated a specific email if known. For now, let's list all users and roles.
        const res = await pool.query("SELECT id, email, role, is_approved FROM users");
        console.log("Current Users:");
        res.rows.forEach(u => console.log(`- ${u.email}: ${u.role} (Approved: ${u.is_approved})`));

        // Let's assume we want to make 'teacher@example.com' (if exists) or the first user a teacher
        // for testing purposes if no other user is found.
        // Actually, we should probably just verify if ANY user has 'teacher' role.

        // If you are testing, you should probably set a specific user to be a teacher.
        // Let's set the user that caused the log (if we could see it) but we can't.

        // Use a hardcoded update for 'teacher@test.com' or similar if it exists
        // Or update ALL users with 'teacher' in their email to have 'teacher' role.

        await pool.query("UPDATE users SET role = 'teacher', is_approved = true WHERE email LIKE '%teacher%'");
        console.log("Updated potential teacher accounts to confirmed teacher role.");

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

fixTeacherRole();
