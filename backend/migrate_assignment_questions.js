require('dotenv').config({ path: './backend/.env' });
const pool = require('./src/db/pool');

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create assignment_questions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS assignment_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_type VARCHAR(50) NOT NULL, -- mcq, true_false, short_answer, long_answer, etc.
        options JSONB, -- For MCQ options, etc.
        correct_answer TEXT,
        marks INTEGER DEFAULT 0,
        order_index INTEGER DEFAULT 0,
        required BOOLEAN DEFAULT true,
        media_url TEXT, -- For image/audio based questions
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created assignment_questions table');

    // Create student_assignment_answers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS student_assignment_answers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assignment_submission_id UUID REFERENCES student_assignments(id) ON DELETE CASCADE,
        question_id UUID REFERENCES assignment_questions(id) ON DELETE CASCADE,
        answer_text TEXT,
        is_correct BOOLEAN,
        marks_awarded INTEGER,
        feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(assignment_submission_id, question_id)
      );
    `);
    console.log('Created student_assignment_answers table');

    // Add duration_minutes to assignments table if not exists
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignments' AND column_name = 'duration_minutes') THEN
          ALTER TABLE assignments ADD COLUMN duration_minutes INTEGER;
        END IF;
      END $$;
    `);
    console.log('Added duration_minutes to assignments table');

    await client.query('COMMIT');
    console.log('Migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
    process.exit();
  }
};

migrate();
