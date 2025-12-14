const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const pool = require('./src/db/pool');

async function debugSubmission() {
    try {
        console.log('DB URL defined:', !!process.env.DATABASE_URL);
        console.log('Testing submission query...');
        // Try to insert a dummy record to see if it fails
        // We need a valid assignment_id and student_id first.

        // 1. Get a student
        const studentRes = await pool.query("SELECT id FROM users WHERE role = 'student' LIMIT 1");
        if (studentRes.rows.length === 0) {
            console.log('No students found');
            return;
        }
        const studentId = studentRes.rows[0].id;

        // 2. Get an assignment
        const assignmentRes = await pool.query("SELECT id FROM assignments LIMIT 1");
        if (assignmentRes.rows.length === 0) {
            console.log('No assignments found');
            return;
        }
        const assignmentId = assignmentRes.rows[0].id;

        console.log(`Using student: ${studentId}, assignment: ${assignmentId}`);

        // 3. Try the UPSERT query
        try {
            const result = await pool.query(
                `INSERT INTO student_assignments (assignment_id, student_id, content, status, submitted_at)
               VALUES ($1, $2, 'Debug Content', 'draft', CURRENT_TIMESTAMP)
               ON CONFLICT (assignment_id, student_id) 
               DO UPDATE SET 
                 content = EXCLUDED.content, 
                 updated_at = CURRENT_TIMESTAMP
               RETURNING *`,
                [assignmentId, studentId]
            );
            console.log('Query successful:', result.rows[0]);
        } catch (e) {
            console.error('Query failed!');
            console.error(e.message);

            // Check constraint
            if (e.message.includes('ON CONFLICT')) {
                console.log('Constraint missing?');
            }
        }

        // 4. Check schema constraints
        const schemaRes = await pool.query(`
            SELECT conname, pg_get_constraintdef(c.oid)
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE conrelid = 'student_assignments'::regclass
        `);
        console.log('Constraints on student_assignments:', schemaRes.rows);

    } catch (err) {
        console.error('Script error:', err);
    } finally {
        pool.end();
    }
}

debugSubmission();
