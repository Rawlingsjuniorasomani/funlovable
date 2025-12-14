require('dotenv').config();
const pool = require('./db/pool');

async function inspectSubjects() {
    try {
        console.log('🔍 Inspecting subjects...');
        const res = await pool.query('SELECT * FROM subjects');
        console.table(res.rows.map(s => ({ id: s.id, name: s.name, active: s.is_active })));
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        pool.end();
    }
}

inspectSubjects();
