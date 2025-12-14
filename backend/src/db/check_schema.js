require('dotenv').config();
const pool = require('./pool');

async function checkSchema() {
    try {
        const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
        console.table(res.rows);
        pool.end();
    } catch (err) {
        console.error(err);
    }
}

checkSchema();
