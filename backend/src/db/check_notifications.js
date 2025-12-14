const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const pool = require('./pool');

async function check() {
    try {
        const res = await pool.query("SELECT to_regclass('public.notifications')");
        console.log('Table exists:', res.rows[0].to_regclass);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
