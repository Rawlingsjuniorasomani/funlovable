const pool = require('../db/pool');

class PaymentModel {
    static async create({ user_id, plan_id, amount, reference, paystack_reference, status = 'pending' }) {
        const result = await pool.query(
            `INSERT INTO payments (user_id, plan_id, amount, reference, paystack_reference, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [user_id, plan_id, amount, reference, paystack_reference, status]
        );
        return result.rows[0];
    }

    static async findByReference(reference) {
        const result = await pool.query('SELECT * FROM payments WHERE reference = $1', [reference]);
        return result.rows[0];
    }

    static async updateStatus(reference, status) {
        const result = await pool.query(
            'UPDATE payments SET status = $1 WHERE reference = $2 RETURNING *',
            [status, reference]
        );
        return result.rows[0];
    }
    static async findByUser(userId) {
        const result = await pool.query('SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        return result.rows;
    }
}

module.exports = PaymentModel;
