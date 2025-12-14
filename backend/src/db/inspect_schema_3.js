const pool = require('../db/pool');

async function inspect() {
    try {
        const pc = await pool.query("SELECT * FROM information_schema.columns WHERE table_name = 'parent_children'");
        console.log('Parent_Children columns:', pc.rows.map(r => r.column_name));

        const sub = await pool.query("SELECT * FROM information_schema.columns WHERE table_name = 'subscriptions'");
        console.log('Subscriptions columns:', sub.rows.map(r => r.column_name));

        pool.end();
    } catch (e) {
        console.error(e);
    }
}
inspect();
