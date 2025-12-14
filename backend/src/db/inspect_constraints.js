require('dotenv').config();
const pool = require('./pool');

async function inspect() {
    const client = await pool.connect();
    try {
        console.log("--- subscriptions Constraints ---");
        const constraints = await client.query(`
      SELECT conname, pg_get_constraintdef(c.oid)
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE conrelid = 'public.subscriptions'::regclass
    `);
        console.log(constraints.rows);
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

inspect();
