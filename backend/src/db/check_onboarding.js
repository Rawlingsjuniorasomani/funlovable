require('dotenv').config();
const pool = require('./pool');

async function checkUser() {
    const client = await pool.connect();
    try {
        const email = 'beatriceafrifaantwi@gmail.com';
        const res = await client.query('SELECT id, email, role, is_onboarded, is_approved FROM users WHERE email = $1', [email]);
        console.log(res.rows[0]);
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

checkUser();
