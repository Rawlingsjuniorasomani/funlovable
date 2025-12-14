const pool = require('../db/pool');

class NotificationModel {
    static async create({ type, title, description, related_id }) {
        const result = await pool.query(`
            INSERT INTO notifications (type, title, description, related_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [type, title, description, related_id]);
        return result.rows[0];
    }

    static async getAll() {
        const result = await pool.query(`
            SELECT * FROM notifications ORDER BY created_at DESC
        `);
        return result.rows;
    }

    static async getUnread() {
        const result = await pool.query(`
            SELECT * FROM notifications WHERE is_read = false ORDER BY created_at DESC
        `);
        return result.rows;
    }

    static async markAsRead(id) {
        const result = await pool.query(`
            UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *
        `, [id]);
        return result.rows[0];
    }

    static async markAllAsRead() {
        const result = await pool.query(`
            UPDATE notifications SET is_read = true RETURNING *
        `);
        return result.rows;
    }

    static async clearAll() {
        await pool.query('DELETE FROM notifications');
        return true;
    }
}

module.exports = NotificationModel;
