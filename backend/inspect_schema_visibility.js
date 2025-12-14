require('dotenv').config();
const pool = require('./src/db/pool');

async function inspectSchema() {
    try {
        const usersCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        console.log('Users Columns:', usersCols.rows.map(r => r.column_name));

        const subjectsCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'subjects'");
        console.log('Subjects Columns:', subjectsCols.rows.map(r => r.column_name));

        const studentSubjectsExists = await pool.query("SELECT to_regclass('public.student_subjects')");
        if (studentSubjectsExists.rows[0].to_regclass) {
            const ssCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'student_subjects'");
            console.log('Student_Subjects Columns:', ssCols.rows.map(r => r.column_name));
        } else {
            console.log('Student_Subjects table does NOT exist.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

inspectSchema();
