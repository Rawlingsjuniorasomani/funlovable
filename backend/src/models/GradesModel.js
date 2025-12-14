const pool = require('../db/pool');

class GradesModel {
    static async create(data) {
        const { student_id, subject_id, teacher_id, term, assessment_type, assessment_id, score, max_score, grade, remarks } = data;

        const result = await pool.query(`
            INSERT INTO grades (student_id, subject_id, teacher_id, term, assessment_type, assessment_id, score, max_score, grade, remarks)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [student_id, subject_id, teacher_id, term, assessment_type, assessment_id, score, max_score, grade, remarks]);

        return result.rows[0];
    }

    static async getStudentGrades(studentId, filters = {}) {
        let query = `
            SELECT g.*, s.name as subject_name, u.name as teacher_name
            FROM grades g
            JOIN subjects s ON g.subject_id = s.id
            LEFT JOIN users u ON g.teacher_id = u.id
            WHERE g.student_id = $1
        `;
        const params = [studentId];
        let paramIndex = 2;

        if (filters.subject_id) {
            query += ` AND g.subject_id = $${paramIndex++}`;
            params.push(filters.subject_id);
        }

        if (filters.term) {
            query += ` AND g.term = $${paramIndex++}`;
            params.push(filters.term);
        }

        query += ' ORDER BY g.created_at DESC';

        const result = await pool.query(query, params);
        return result.rows;
    }

    static async update(id, data) {
        const { score, max_score, grade, remarks } = data;

        const result = await pool.query(`
            UPDATE grades 
            SET score = COALESCE($1, score),
                max_score = COALESCE($2, max_score),
                grade = COALESCE($3, grade),
                remarks = COALESCE($4, remarks),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING *
        `, [score, max_score, grade, remarks, id]);

        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM grades WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }

    static async generateReportCard(data) {
        const { student_id, term, academic_year, overall_grade, overall_percentage, teacher_remarks } = data;

        const result = await pool.query(`
            INSERT INTO report_cards (student_id, term, academic_year, overall_grade, overall_percentage, teacher_remarks)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (student_id, term, academic_year)
            DO UPDATE SET 
                overall_grade = EXCLUDED.overall_grade,
                overall_percentage = EXCLUDED.overall_percentage,
                teacher_remarks = EXCLUDED.teacher_remarks,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `, [student_id, term, academic_year, overall_grade, overall_percentage, teacher_remarks]);

        return result.rows[0];
    }

    static async getReportCard(studentId, term, academicYear) {
        const result = await pool.query(`
            SELECT * FROM report_cards 
            WHERE student_id = $1 AND term = $2 AND academic_year = $3
        `, [studentId, term, academicYear]);

        return result.rows[0];
    }

    static async publishReportCard(id) {
        const result = await pool.query(`
            UPDATE report_cards SET published = true WHERE id = $1 RETURNING *
        `, [id]);

        return result.rows[0];
    }
}

module.exports = GradesModel;
