const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const pool = require('./pool');

async function checkAdmins() {
    const client = await pool.connect();
    try {
        console.log('🔍 Checking for admin users...');

        const res = await client.query(`
            SELECT u.id, u.name, u.email, u.role 
            FROM users u
            WHERE u.role = 'admin'
        `);

        if (res.rows.length === 0) {
            console.log('❌ No admin users found in the database.');
        } else {
            console.log(`✅ Found ${res.rows.length} admin user(s):`);
            res.rows.forEach(user => {
                console.log(`   - ${user.name} (${user.email})`);
            });
        }

    } catch (error) {
        console.error('Error checking admins:', error);
    } finally {
        client.release();
        process.exit();
    }
}

checkAdmins();
