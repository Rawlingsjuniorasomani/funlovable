require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const pool = require('./pool');

const runMigration = async () => {
    try {
        console.log('Adding subscription columns to users table...');

        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive',
            ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP,
            ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP;
        `);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
