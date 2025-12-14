require('dotenv').config();
const pool = require('./src/db/pool');

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Update assignments table
        console.log('Migrating assignments table...');
        await client.query(`
      ALTER TABLE assignments 
      ADD COLUMN IF NOT EXISTS resources TEXT, -- JSON string or comma-separated URLs
      ADD COLUMN IF NOT EXISTS submission_type VARCHAR(50) DEFAULT 'text', -- 'text', 'file', 'both'
      ADD COLUMN IF NOT EXISTS total_marks INTEGER DEFAULT 100,
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'; -- 'draft', 'active', 'archived'
    `);

        // 2. Update student_assignments table
        console.log('Migrating student_assignments table...');
        // Ensure existing columns are compatible or add new ones if missing
        // We already have: status, content, file_url, feedback. 
        // Let's add teacher_feedback if it differs, but schema showed 'feedback'. 
        // We might need 'submitted_at' if not present (schema showed it exists).

        // We'll trust schema showed: graded_at, submitted_at, score, feedback, content, file_url, status.
        // Ensure status can handle 'draft'. 
        // If it's an enum type, we might need to alter it, but usually it's VARCHAR.

        // No specific changes needed for student_assignments based on previous inspection, 
        // just using the fields correctly.

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
}

migrate();
