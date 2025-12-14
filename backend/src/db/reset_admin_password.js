const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const pool = require('./pool');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
    const client = await pool.connect();
    try {
        console.log('🔄 Resetting admin password...');

        const email = 'superadmin@edulearn.com';
        const newPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const res = await client.query(`
            UPDATE users 
            SET password_hash = $1 
            WHERE email = $2
            RETURNING id, name, email
        `, [hashedPassword, email]);

        if (res.rows.length === 0) {
            console.log(`❌ User ${email} not found.`);
        } else {
            console.log(`✅ Password reset successfully for:`);
            console.log(`   User: ${res.rows[0].name} (${res.rows[0].email})`);
            console.log(`   New Password: ${newPassword}`);
        }

    } catch (error) {
        console.error('❌ Error resetting password:', error);
    } finally {
        client.release();
        process.exit();
    }
}

resetAdminPassword();
