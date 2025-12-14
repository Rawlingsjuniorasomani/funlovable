require('dotenv').config();
const pool = require('./pool');

async function checkTable() {
    try {
        const res = await pool.query("SELECT to_regclass('public.user_roles')");
        console.log('user_roles exists:', res.rows[0].to_regclass !== null);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkTable();
