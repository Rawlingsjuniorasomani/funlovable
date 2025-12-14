const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const pool = require('./src/db/pool');

async function inspectSchema() {
    try {
        console.log('DB URL defined:', !!process.env.DATABASE_URL);
        console.log('Inspecting assignments table...');
        const assignmentCols = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'assignments'
        `);
        console.log(assignmentCols.rows.map(r => r.column_name));

        console.log('Inspecting assignment_questions table...');
        const questionCols = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'assignment_questions'
        `);
        console.log(questionCols.rows.map(r => r.column_name));

        console.log('Inspecting student_assignment_answers table...');
        const answerCols = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'student_assignment_answers'
        `);
        console.log(answerCols.rows.map(r => r.column_name));

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
inspectSchema();
