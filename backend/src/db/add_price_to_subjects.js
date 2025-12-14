require('dotenv').config();
const pool = require('./pool');

async function migrate() {
    try {
        console.log('Running migration: Add price to subjects...');
        await pool.query(`
            ALTER TABLE subjects 
            ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00;
        `);
        console.log('✅ Migration successful');
        process.exit(0);
    } catch (e) {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    }
}

migrate();
