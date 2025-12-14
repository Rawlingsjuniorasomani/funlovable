const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('./db/pool');

async function checkData() {
    try {
        console.log('\n=== Checking Modules ===');
        const modules = await pool.query('SELECT * FROM modules ORDER BY created_at DESC LIMIT 5');
        console.log(`Found ${modules.rows.length} modules:`);
        modules.rows.forEach(m => {
            console.log(`- ${m.title} (subject_id: ${m.subject_id})`);
        });

        console.log('\n=== Checking Lessons ===');
        const lessons = await pool.query('SELECT * FROM lessons ORDER BY created_at DESC LIMIT 5');
        console.log(`Found ${lessons.rows.length} lessons:`);
        lessons.rows.forEach(l => {
            console.log(`- ${l.title} (module_id: ${l.module_id})`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkData();
