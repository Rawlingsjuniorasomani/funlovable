require('dotenv').config();
const pool = require('./pool');

async function testQuery() {
    const id = '0dabe83a-43f9-4118-aaff-3c72dacb5e7a';
    try {
        console.log(`Querying for ID: ${id}`);
        const result = await pool.query(`
      SELECT id, name, email, role, phone, avatar, is_approved, is_onboarded, created_at
      FROM users WHERE id = $1
    `, [id]);
        console.log('Result:', result.rows);
        pool.end();
    } catch (err) {
        console.error('❌ Query failed:', err);
        process.exit(1);
    }
}

testQuery();
