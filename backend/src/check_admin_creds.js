require('dotenv').config();
const pool = require('./db/pool');
const bcrypt = require('bcryptjs');

async function check() {
    try {
        console.log('--- Listing all admins ---');
        const res = await pool.query("SELECT email, role, password_hash FROM users WHERE role IN ('admin', 'super_admin')");
        for (const u of res.rows) {
            const isValid = await bcrypt.compare('admin123', u.password_hash);
            console.log(`Email: ${u.email}, Role: ${u.role}, Pass(admin123): ${isValid}`);
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

check();
