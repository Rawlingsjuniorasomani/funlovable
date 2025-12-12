const express = require('express');
const pool = require('../db/pool');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all subjects
router.get('/', async (req, res) => {
  try {
    const { grade } = req.query;
    
    let query = `
      SELECT s.*, u.name as teacher_name
      FROM subjects s
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE s.is_active = true
    `;
    const params = [];

    if (grade) {
      params.push(grade);
      query += ` AND s.grade_level = $${params.length}`;
    }

    query += ' ORDER BY s.name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Failed to get subjects' });
  }
});

// Get subject by ID with modules
router.get('/:id', async (req, res) => {
  try {
    const subjectResult = await pool.query(`
      SELECT s.*, u.name as teacher_name
      FROM subjects s
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE s.id = $1
    `, [req.params.id]);

    if (subjectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const modulesResult = await pool.query(`
      SELECT m.*, 
        (SELECT COUNT(*) FROM lessons l WHERE l.module_id = m.id) as lesson_count
      FROM modules m
      WHERE m.subject_id = $1
      ORDER BY m.order_index
    `, [req.params.id]);

    res.json({
      ...subjectResult.rows[0],
      modules: modulesResult.rows
    });
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ error: 'Failed to get subject' });
  }
});

// Create subject (admin/teacher)
router.post('/', authMiddleware, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const { name, description, icon, color, grade_level } = req.body;

    const result = await pool.query(`
      INSERT INTO subjects (name, description, icon, color, grade_level, teacher_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, description, icon, color, grade_level, req.user.id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// Update subject
router.put('/:id', authMiddleware, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const { name, description, icon, color, grade_level, is_active } = req.body;

    const result = await pool.query(`
      UPDATE subjects 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          icon = COALESCE($3, icon),
          color = COALESCE($4, color),
          grade_level = COALESCE($5, grade_level),
          is_active = COALESCE($6, is_active)
      WHERE id = $7
      RETURNING *
    `, [name, description, icon, color, grade_level, is_active, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

// Delete subject
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM subjects WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json({ message: 'Subject deleted' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

module.exports = router;
