const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const pool = require('./src/db/pool');

async function migrate() {
    try {
        console.log('Starting migration for review features...');

        // Add reveal_answers and settings to assignments
        await pool.query(`
            ALTER TABLE assignments 
            ADD COLUMN IF NOT EXISTS reveal_answers VARCHAR(50) DEFAULT 'immediate',
            ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
        `);
        console.log('Added reveal_answers and settings to assignments.');

        // Add explanation to assignment_questions
        await pool.query(`
            ALTER TABLE assignment_questions 
            ADD COLUMN IF NOT EXISTS explanation TEXT;
        `);
        console.log('Added explanation to assignment_questions.');

        console.log('Migration completed successfully.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        pool.end();
    }
}
migrate();
