require('dotenv').config();
const pool = require('./db/pool');

async function debugSubjects() {
    try {
        const subjects = await pool.query('SELECT * FROM subjects');
        console.log('--- ALL SUBJECTS ---');
        console.table(subjects.rows);

        const links = await pool.query('SELECT * FROM teacher_subjects');
        console.log('--- TEACHER LINKS ---');
        console.table(links.rows);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

debugSubjects();
