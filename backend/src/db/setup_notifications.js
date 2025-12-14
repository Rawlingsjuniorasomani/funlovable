const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const pool = require('./pool');

const createNotificationsTable = async () => {
    try {
        console.log('Creating notifications table...');

        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
            
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                is_read BOOLEAN DEFAULT FALSE,
                related_id UUID,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Notifications table created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating notifications table:', error);
        process.exit(1);
    }
};

createNotificationsTable();
