require('dotenv').config();
const pool = require('./pool');

async function debug() {
    const client = await pool.connect();
    try {
        const parentEmail = 'beatriceafrifaantwi@gmail.com';
        const childId = '771fe18f-5c27-4e3b-9c31-d1508eca4f0e';

        console.log('--- Parent Info ---');
        const parentRes = await client.query('SELECT id, email, role FROM users WHERE email = $1', [parentEmail]);
        if (parentRes.rows.length === 0) { console.log('Parent not found'); return; }
        const parent = parentRes.rows[0];
        console.log(parent);

        console.log('\n--- Linked Children ---');
        const kidsRes = await client.query('SELECT * FROM parent_children WHERE parent_id = $1', [parent.id]);
        console.log(kidsRes.rows);

        console.log('\n--- Child Info ---');
        const childRes = await client.query('SELECT id, name, role FROM users WHERE id = $1', [childId]);
        console.log(childRes.rows[0]);

        console.log('\n--- Quiz Attempts Table Columns ---');
        const schemaRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'quiz_attempts'
    `);
        schemaRes.rows.forEach(r => console.log(`${r.column_name} (${r.data_type})`));

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

debug();
