require('dotenv').config();
const pool = require('./db/pool');
const bcrypt = require('bcryptjs');

async function resetAdmin() {
    try {
        const email = 'admin@edulearn.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const res = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email',
            [hashedPassword, email]
        );

        if (res.rowCount > 0) {
            console.log(`✅ Password for ${email} reset to '${password}'`);
        } else {
            console.log(`❌ Admin user ${email} not found.`);
        }
    } catch (error) {
        console.error('❌ Error resetting password:', error);
    } finally {
        pool.end();
    }
}

resetAdmin();
