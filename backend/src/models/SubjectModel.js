const pool = require('../db/pool');

class SubjectModel {
    static async findAll() {
        const result = await pool.query('SELECT * FROM subjects WHERE is_active = true ORDER BY name');
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM subjects WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async create({ name, description, icon, price }) {
        const result = await pool.query(
            `INSERT INTO subjects (name, description, icon, price)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [name, description, icon, price]
        );
        return result.rows[0];
    }

    static async update(id, { name, description, icon, price, is_active }) {
        const result = await pool.query(
            `UPDATE subjects 
       SET name = COALESCE($2, name),
           description = COALESCE($3, description),
           icon = COALESCE($4, icon),
           price = COALESCE($5, price),
           is_active = COALESCE($6, is_active)
       WHERE id = $1
       RETURNING *`,
            [id, name, description, icon, price, is_active]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM subjects WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }

    static async findByTeacherId(teacherId) {
        const result = await pool.query(
            `SELECT s.* 
             FROM subjects s
             JOIN teacher_subjects ts ON s.id = ts.subject_id
             WHERE ts.teacher_id = $1 AND s.is_active = true
             ORDER BY s.name`,
            [teacherId]
        );
        return result.rows;
    }

    static async linkTeacher(teacherId, subjectId) {
        await pool.query(
            'INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [teacherId, subjectId]
        );
    }
}

module.exports = SubjectModel;
