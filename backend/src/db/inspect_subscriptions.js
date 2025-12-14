require('dotenv').config();
const pool = require('./pool');

async function inspect() {
    const client = await pool.connect();
    try {
        console.log("--- subscriptions Schema ---");
        const sub = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'subscriptions'
    `);
        console.log(sub.rows);
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

inspect();
