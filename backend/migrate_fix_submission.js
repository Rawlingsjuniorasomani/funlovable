const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const pool = require('./src/db/pool');

async function migrate() {
    try {
        console.log('Connected to DB');

        console.log('Cleaning up duplicates...');
        await pool.query(`
            DELETE FROM student_assignments a USING student_assignments b 
            WHERE a.id < b.id 
            AND a.student_id = b.student_id 
            AND a.assignment_id = b.assignment_id
        `);

        console.log('Adding updated_at column...');
        await pool.query(`
            ALTER TABLE student_assignments 
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);

        console.log('Adding unique constraint...');
        await pool.query(`
            ALTER TABLE student_assignments 
            DROP CONSTRAINT IF EXISTS student_assignments_unique_submission;
        `);
        await pool.query(`
            ALTER TABLE student_assignments 
            ADD CONSTRAINT student_assignments_unique_submission 
            UNIQUE (student_id, assignment_id)
        `);

        console.log('Migration successful');
    } catch (e) {
        console.error('Migration failed:', e.message);
    } finally {
        pool.end();
    }
}
migrate();
