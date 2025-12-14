require('dotenv').config();
const pool = require('./db/pool');

async function inspectTable() {
    try {
        console.log('🔍 Inspecting subjects table...');

        const res = await pool.query(`
            SELECT table_name, column_name, is_nullable 
            FROM information_schema.columns 
            WHERE table_name IN ('quizzes', 'teacher_subjects')
            ORDER BY table_name;
        `);

        console.table(res.rows);
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        pool.end();
    }
}

inspectTable();
