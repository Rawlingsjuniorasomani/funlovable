const pool = require('../db/pool');

class ModuleModel {
    static async findAllBySubjectId(subjectId) {
        const result = await pool.query(
            'SELECT * FROM modules WHERE subject_id = $1 ORDER BY order_index',
            [subjectId]
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM modules WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async create({ subject_id, title, description, order_index }) {
        const result = await pool.query(
            `INSERT INTO modules (subject_id, title, description, order_index)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [subject_id, title, description, order_index]
        );
        return result.rows[0];
    }

    static async update(id, { title, description, order_index, is_locked }) {
        const result = await pool.query(
            `UPDATE modules 
         SET title = COALESCE($2, title),
             description = COALESCE($3, description),
             order_index = COALESCE($4, order_index),
             is_locked = COALESCE($5, is_locked)
         WHERE id = $1
         RETURNING *`,
            [id, title, description, order_index, is_locked]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM modules WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}

module.exports = ModuleModel;
