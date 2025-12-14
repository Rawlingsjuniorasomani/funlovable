require('dotenv').config();
const pool = require('./src/db/pool');

async function checkSchema() {
    try {
        const assignments = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'assignments';
    `);
        console.log("Assignments Table:", assignments.rows);

        const studentAssignments = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'student_assignments';
    `);
        console.log("Student Assignments Table:", studentAssignments.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkSchema();
