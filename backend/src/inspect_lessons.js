const pool = require('./db/pool');

async function inspect() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'lessons'
        `);
        console.table(res.rows);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

inspect();
