const pool = require('../db/pool');

class PlanModel {
    static async findAll() {
        const result = await pool.query(`
            SELECT 
                id, 
                plan_name as name, 
                price, 
                CASE 
                    WHEN duration_days = 120 THEN 'Termly'
                    WHEN duration_days = 365 THEN 'Yearly'
                    ELSE duration_days || ' days'
                END as duration,
                features, 
                description,
                (price = 1300) as recommended 
            FROM plans 
            ORDER BY price ASC
        `);
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM plans WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async create({ id, name, price, duration, features, recommended, description }) {
        const result = await pool.query(
            `INSERT INTO plans (id, name, price, duration, features, recommended, description)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [id, name, price, duration, features, recommended, description]
        );
        return result.rows[0];
    }

    static async update(id, updates) {
        const fields = Object.keys(updates);
        const values = Object.values(updates);

        if (fields.length === 0) return null;

        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

        const result = await pool.query(
            `UPDATE plans SET ${setClause} WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM plans WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}

module.exports = PlanModel;
