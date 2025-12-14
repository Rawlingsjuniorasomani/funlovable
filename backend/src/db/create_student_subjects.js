require('dotenv').config();
const pool = require('./pool');

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('🚀 Creating student_subjects table...');

        await client.query(`
      CREATE TABLE IF NOT EXISTS student_subjects (
        student_id UUID REFERENCES users(id) ON DELETE CASCADE,
        subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (student_id, subject_id)
      );
    `);

        console.log('✅ student_subjects table created successfully.');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
