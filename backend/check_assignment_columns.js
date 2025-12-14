require('dotenv').config();
const pool = require('./src/db/pool');

async function checkColumns() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'assignments';
    `);
    console.log("Columns in 'assignments' table:", res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkColumns();
