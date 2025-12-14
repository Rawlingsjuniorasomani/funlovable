const pool = require('../db/pool');

class BehaviourModel {
    static async create(data) {
        const { student_id, teacher_id, type, category, description, severity, action_taken, date } = data;

        const result = await pool.query(`
            INSERT INTO behaviour_records (student_id, teacher_id, type, category, description, severity, action_taken, date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [student_id, teacher_id, type, category, description, severity, action_taken, date || null]);

        return result.rows[0];
    }

    static async getStudentRecords(studentId, filters = {}) {
        let query = `
            SELECT b.*, u.name as teacher_name
            FROM behaviour_records b
            JOIN users u ON b.teacher_id = u.id
            WHERE b.student_id = $1
        `;
        const params = [studentId];
        let paramIndex = 2;

        if (filters.type) {
            query += ` AND b.type = $${paramIndex++}`;
            params.push(filters.type);
        }

        if (filters.start_date) {
            query += ` AND b.date >= $${paramIndex++}`;
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            query += ` AND b.date <= $${paramIndex++}`;
            params.push(filters.end_date);
        }

        query += ' ORDER BY b.date DESC, b.created_at DESC';

        const result = await pool.query(query, params);
        return result.rows;
    }

    static async getSummary(studentId) {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total_records,
                COUNT(*) FILTER (WHERE type = 'positive') as positive_count,
                COUNT(*) FILTER (WHERE type = 'negative') as negative_count,
                COUNT(*) FILTER (WHERE type = 'neutral') as neutral_count
            FROM behaviour_records
            WHERE student_id = $1
        `, [studentId]);

        return result.rows[0];
    }
}

module.exports = BehaviourModel;
