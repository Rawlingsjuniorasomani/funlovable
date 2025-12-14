require('dotenv').config();
const pool = require('./pool');

async function checkUsers() {
    try {
        console.log('Fetching user roles...');
        const res = await pool.query('SELECT email, role, is_approved FROM users');

        if (res.rows.length === 0) {
            console.log('⚠️ No users found.');
        } else {
            console.log('✅ Users found:');
            console.table(res.rows);
        }

        pool.end();
    } catch (err) {
        console.error('❌ User check failed:', err);
        process.exit(1);
    }
}

checkUsers();
