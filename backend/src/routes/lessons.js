const express = require('express');
const pool = require('../db/pool');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get lesson by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.*, m.title as module_title, s.name as subject_name
      FROM lessons l
      INNER JOIN modules m ON l.module_id = m.id
      INNER JOIN subjects s ON m.subject_id = s.id
      WHERE l.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Get quiz if exists
    const quizResult = await pool.query(
      'SELECT id, title, time_limit_minutes, passing_score FROM quizzes WHERE lesson_id = $1',
      [req.params.id]
    );

    res.json({
      ...result.rows[0],
      quiz: quizResult.rows[0] || null
    });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ error: 'Failed to get lesson' });
  }
});

// Create lesson
router.post('/', authMiddleware, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const { module_id, title, content, video_url, duration_minutes, order_index, xp_reward } = req.body;

    const result = await pool.query(`
      INSERT INTO lessons (module_id, title, content, video_url, duration_minutes, order_index, xp_reward)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [module_id, title, content, video_url, duration_minutes || 0, order_index || 0, xp_reward || 10]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// Update lesson
router.put('/:id', authMiddleware, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const { title, content, video_url, duration_minutes, order_index, xp_reward } = req.body;

    const result = await pool.query(`
      UPDATE lessons 
      SET title = COALESCE($1, title),
          content = COALESCE($2, content),
          video_url = COALESCE($3, video_url),
          duration_minutes = COALESCE($4, duration_minutes),
          order_index = COALESCE($5, order_index),
          xp_reward = COALESCE($6, xp_reward)
      WHERE id = $7
      RETURNING *
    `, [title, content, video_url, duration_minutes, order_index, xp_reward, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// Mark lesson as complete
router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user.id;

    // Check if already completed
    const existing = await pool.query(
      'SELECT id FROM user_progress WHERE user_id = $1 AND lesson_id = $2',
      [userId, lessonId]
    );

    if (existing.rows.length > 0) {
      await pool.query(`
        UPDATE user_progress 
        SET is_completed = true, progress_percentage = 100, completed_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND lesson_id = $2
      `, [userId, lessonId]);
    } else {
      await pool.query(`
        INSERT INTO user_progress (user_id, lesson_id, is_completed, progress_percentage, completed_at)
        VALUES ($1, $2, true, 100, CURRENT_TIMESTAMP)
      `, [userId, lessonId]);
    }

    // Get lesson XP reward
    const lessonResult = await pool.query('SELECT xp_reward FROM lessons WHERE id = $1', [lessonId]);
    const xpReward = lessonResult.rows[0]?.xp_reward || 10;

    // Update user XP
    await pool.query(`
      INSERT INTO user_xp (user_id, total_xp, level)
      VALUES ($1, $2, 1)
      ON CONFLICT (user_id) 
      DO UPDATE SET total_xp = user_xp.total_xp + $2, updated_at = CURRENT_TIMESTAMP
    `, [userId, xpReward]);

    res.json({ message: 'Lesson completed', xp_earned: xpReward });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({ error: 'Failed to complete lesson' });
  }
});

// Delete lesson
router.delete('/:id', authMiddleware, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM lessons WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json({ message: 'Lesson deleted' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

module.exports = router;
