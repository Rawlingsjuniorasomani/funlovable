const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const pool = require('./pool');

async function inspect() {
    try {
        const res = await pool.query('SELECT * FROM plans LIMIT 1');
        console.log('Fields:', res.fields.map(f => f.name));
        console.log('Rows:', res.rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspect();
