const pool = require('./db/pool');

async function checkTable() {
    try {
        const res = await pool.query("SELECT to_regclass('public.notifications')");
        if (res.rows[0].to_regclass) {
            console.log("Table 'notifications' exists.");
            const count = await pool.query("SELECT count(*) FROM notifications");
            console.log(`Row count: ${count.rows[0].count}`);
        } else {
            console.error("Table 'notifications' DOES NOT exist.");
        }
    } catch (err) {
        console.error("Error checking table:", err);
    } finally {
        pool.end();
    }
}

checkTable();
