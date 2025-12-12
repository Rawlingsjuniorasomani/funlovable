const express = require('express');
const pool = require('../db/pool');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get module by ID with lessons
router.get('/:id', async (req, res) => {
  try {
    const moduleResult = await pool.query('SELECT * FROM modules WHERE id = $1', [req.params.id]);

    if (moduleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const lessonsResult = await pool.query(`
      SELECT * FROM lessons WHERE module_id = $1 ORDER BY order_index
    `, [req.params.id]);

    res.json({
      ...moduleResult.rows[0],
      lessons: lessonsResult.rows
    });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ error: 'Failed to get module' });
  }
});

// Create module
router.post('/', authMiddleware, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const { subject_id, title, description, order_index } = req.body;

    const result = await pool.query(`
      INSERT INTO modules (subject_id, title, description, order_index)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [subject_id, title, description, order_index || 0]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ error: 'Failed to create module' });
  }
});

// Update module
router.put('/:id', authMiddleware, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const { title, description, order_index, is_locked } = req.body;

    const result = await pool.query(`
      UPDATE modules 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          order_index = COALESCE($3, order_index),
          is_locked = COALESCE($4, is_locked)
      WHERE id = $5
      RETURNING *
    `, [title, description, order_index, is_locked, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ error: 'Failed to update module' });
  }
});

// Delete module
router.delete('/:id', authMiddleware, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM modules WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }

    res.json({ message: 'Module deleted' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ error: 'Failed to delete module' });
  }
});

module.exports = router;
