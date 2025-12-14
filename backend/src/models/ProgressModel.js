const pool = require('../db/pool');

class ProgressModel {
    static async trackLessonView(data) {
        const { lesson_id, student_id, duration_seconds, completed } = data;

        const result = await pool.query(`
            INSERT INTO lesson_views (lesson_id, student_id, duration_seconds, completed)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [lesson_id, student_id, duration_seconds || 0, completed || false]);

        return result.rows[0];
    }

    static async getStudentProgress(studentId, filters = {}) {
        let query = `
            SELECT lv.*, l.title as lesson_title, m.title as module_title
            FROM lesson_views lv
            JOIN lessons l ON lv.lesson_id = l.id
            JOIN modules m ON l.module_id = m.id
            WHERE lv.student_id = $1
        `;
        const params = [studentId];
        let paramIndex = 2;

        if (filters.lesson_id) {
            query += ` AND lv.lesson_id = $${paramIndex++}`;
            params.push(filters.lesson_id);
        }

        query += ' ORDER BY lv.viewed_at DESC';

        const result = await pool.query(query, params);
        return result.rows;
    }

    static async updateAnalytics(data) {
        const { student_id, subject_id, week_start, lessons_viewed, assignments_submitted, quizzes_taken, avg_quiz_score, total_time_minutes } = data;

        const result = await pool.query(`
            INSERT INTO learning_analytics 
            (student_id, subject_id, week_start, lessons_viewed, assignments_submitted, quizzes_taken, avg_quiz_score, total_time_minutes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (student_id, subject_id, week_start)
            DO UPDATE SET
                lessons_viewed = learning_analytics.lessons_viewed + EXCLUDED.lessons_viewed,
                assignments_submitted = learning_analytics.assignments_submitted + EXCLUDED.assignments_submitted,
                quizzes_taken = learning_analytics.quizzes_taken + EXCLUDED.quizzes_taken,
                avg_quiz_score = EXCLUDED.avg_quiz_score,
                total_time_minutes = learning_analytics.total_time_minutes + EXCLUDED.total_time_minutes
            RETURNING *
        `, [student_id, subject_id, week_start, lessons_viewed || 0, assignments_submitted || 0, quizzes_taken || 0, avg_quiz_score, total_time_minutes || 0]);

        return result.rows[0];
    }

    static async getAnalytics(studentId, subjectId = null) {
        let query = `
            SELECT * FROM learning_analytics
            WHERE student_id = $1
        `;
        const params = [studentId];

        if (subjectId) {
            query += ' AND subject_id = $2';
            params.push(subjectId);
        }

        query += ' ORDER BY week_start DESC LIMIT 12';

        const result = await pool.query(query, params);
        return result.rows;
    }
}

module.exports = ProgressModel;
