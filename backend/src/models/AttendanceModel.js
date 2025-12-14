const pool = require('../db/pool');

class AttendanceModel {
    static async markAttendance(data) {
        const { teacher_id, student_id, subject_id, date, status, notes } = data;

        const result = await pool.query(`
            INSERT INTO attendance (teacher_id, student_id, subject_id, date, status, notes)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (student_id, subject_id, date)
            DO UPDATE SET 
                status = EXCLUDED.status,
                notes = EXCLUDED.notes,
                teacher_id = EXCLUDED.teacher_id,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `, [teacher_id, student_id, subject_id, date, status, notes]);

        return result.rows[0];
    }

    static async getStudentAttendance(studentId, filters = {}) {
        let query = `
            SELECT a.*, s.name as subject_name, u.name as teacher_name
            FROM attendance a
            JOIN subjects s ON a.subject_id = s.id
            JOIN users u ON a.teacher_id = u.id
            WHERE a.student_id = $1
        `;
        const params = [studentId];
        let paramIndex = 2;

        if (filters.subject_id) {
            query += ` AND a.subject_id = $${paramIndex++}`;
            params.push(filters.subject_id);
        }

        if (filters.start_date) {
            query += ` AND a.date >= $${paramIndex++}`;
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            query += ` AND a.date <= $${paramIndex++}`;
            params.push(filters.end_date);
        }

        query += ' ORDER BY a.date DESC';

        const result = await pool.query(query, params);
        return result.rows;
    }

    static async getClassAttendance(subjectId, date) {
        const result = await pool.query(`
            SELECT a.*, u.name as student_name, u.email as student_email
            FROM attendance a
            JOIN users u ON a.student_id = u.id
            WHERE a.subject_id = $1 AND a.date = $2
            ORDER BY u.name
        `, [subjectId, date]);

        return result.rows;
    }

    static async getAttendanceStats(studentId, subjectId = null) {
        let query = `
            SELECT 
                COUNT(*) as total_days,
                COUNT(*) FILTER (WHERE status = 'present') as present_count,
                COUNT(*) FILTER (WHERE status = 'absent') as absent_count,
                COUNT(*) FILTER (WHERE status = 'late') as late_count,
                COUNT(*) FILTER (WHERE status = 'excused') as excused_count,
                ROUND(
                    (COUNT(*) FILTER (WHERE status = 'present')::DECIMAL / 
                    NULLIF(COUNT(*), 0)) * 100, 
                    2
                ) as attendance_percentage
            FROM attendance
            WHERE student_id = $1
        `;
        const params = [studentId];

        if (subjectId) {
            query += ' AND subject_id = $2';
            params.push(subjectId);
        }

        const result = await pool.query(query, params);
        return result.rows[0];
    }

    static async bulkMarkAttendance(attendanceRecords) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const results = [];
            for (const record of attendanceRecords) {
                const result = await client.query(`
                    INSERT INTO attendance (teacher_id, student_id, subject_id, date, status, notes)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (student_id, subject_id, date)
                    DO UPDATE SET 
                        status = EXCLUDED.status,
                        notes = EXCLUDED.notes,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING *
                `, [record.teacher_id, record.student_id, record.subject_id, record.date, record.status, record.notes || null]);

                results.push(result.rows[0]);
            }

            await client.query('COMMIT');
            return results;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = AttendanceModel;
