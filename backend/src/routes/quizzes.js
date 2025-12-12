const express = require('express');
const pool = require('../db/pool');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get quiz by ID with questions
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const quizResult = await pool.query('SELECT * FROM quizzes WHERE id = $1', [req.params.id]);

    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const questionsResult = await pool.query(`
      SELECT id, question_text, question_type, options, points, order_index
      FROM quiz_questions WHERE quiz_id = $1 ORDER BY order_index
    `, [req.params.id]);

    // Don't send correct answers to students
    const questions = questionsResult.rows.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));

    res.json({
      ...quizResult.rows[0],
      questions
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Failed to get quiz' });
  }
});

// Create quiz
router.post('/', authMiddleware, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const { lesson_id, module_id, title, description, time_limit_minutes, passing_score, xp_reward, questions } = req.body;

    // Create quiz
    const quizResult = await pool.query(`
      INSERT INTO quizzes (lesson_id, module_id, title, description, time_limit_minutes, passing_score, xp_reward)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [lesson_id, module_id, title, description, time_limit_minutes || 30, passing_score || 70, xp_reward || 50]);

    const quiz = quizResult.rows[0];

    // Add questions
    if (questions && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await pool.query(`
          INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, points, order_index)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [quiz.id, q.question_text, q.question_type || 'multiple_choice', JSON.stringify(q.options), q.correct_answer, q.points || 1, i]);
      }
    }

    res.status(201).json(quiz);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// Submit quiz attempt
router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const quizId = req.params.id;
    const userId = req.user.id;
    const { answers, time_taken_minutes } = req.body;

    // Get quiz questions with correct answers
    const questionsResult = await pool.query(`
      SELECT id, correct_answer, points FROM quiz_questions WHERE quiz_id = $1
    `, [quizId]);

    let score = 0;
    let maxScore = 0;

    const results = questionsResult.rows.map(question => {
      maxScore += question.points;
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correct_answer;
      if (isCorrect) {
        score += question.points;
      }
      return { questionId: question.id, correct: isCorrect };
    });

    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

    // Get passing score
    const quizResult = await pool.query('SELECT passing_score, xp_reward FROM quizzes WHERE id = $1', [quizId]);
    const passingScore = quizResult.rows[0]?.passing_score || 70;
    const xpReward = quizResult.rows[0]?.xp_reward || 50;
    const passed = percentage >= passingScore;

    // Save attempt
    await pool.query(`
      INSERT INTO quiz_attempts (user_id, quiz_id, score, max_score, percentage, passed, answers, time_taken_minutes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [userId, quizId, score, maxScore, percentage, passed, JSON.stringify(answers), time_taken_minutes]);

    // Award XP if passed
    if (passed) {
      await pool.query(`
        INSERT INTO user_xp (user_id, total_xp, level)
        VALUES ($1, $2, 1)
        ON CONFLICT (user_id) 
        DO UPDATE SET total_xp = user_xp.total_xp + $2, updated_at = CURRENT_TIMESTAMP
      `, [userId, xpReward]);
    }

    res.json({
      score,
      maxScore,
      percentage: Math.round(percentage),
      passed,
      xp_earned: passed ? xpReward : 0,
      results
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// Get user's quiz attempts
router.get('/:id/attempts', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM quiz_attempts 
      WHERE quiz_id = $1 AND user_id = $2
      ORDER BY completed_at DESC
    `, [req.params.id, req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(500).json({ error: 'Failed to get attempts' });
  }
});

// Delete quiz
router.delete('/:id', authMiddleware, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM quizzes WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({ message: 'Quiz deleted' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

module.exports = router;
