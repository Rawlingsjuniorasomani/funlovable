const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { role, status } = req.query;
    
    let query = `
      SELECT id, name, email, role, phone, avatar, is_approved, is_onboarded, created_at
      FROM users WHERE 1=1
    `;
    const params = [];

    if (role) {
      params.push(role);
      query += ` AND role = $${params.length}`;
    }

    if (status === 'pending') {
      query += ' AND is_approved = false';
    } else if (status === 'approved') {
      query += ' AND is_approved = true';
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get user by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, role, phone, avatar, is_approved, is_onboarded, created_at
      FROM users WHERE id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Users can only update their own profile, unless admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { name, phone, avatar } = req.body;
    
    const result = await pool.query(`
      UPDATE users 
      SET name = COALESCE($1, name), 
          phone = COALESCE($2, phone), 
          avatar = COALESCE($3, avatar),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, name, email, role, phone, avatar, is_approved, is_onboarded
    `, [name, phone, avatar, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Approve user (admin only)
router.post('/:id/approve', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      UPDATE users SET is_approved = true WHERE id = $1
      RETURNING id, name, email, role, is_approved
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create notification for user
    await pool.query(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES ($1, 'Account Approved', 'Your account has been approved. Welcome to EduLearn!', 'success')
    `, [req.params.id]);

    res.json({ message: 'User approved', user: result.rows[0] });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
});

// Reject user (admin only)
router.post('/:id/reject', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      UPDATE users SET is_approved = false WHERE id = $1
      RETURNING id, name, email, role
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User rejected', user: result.rows[0] });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ error: 'Failed to reject user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Add child to parent
router.post('/:id/children', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'parent' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only parents can add children' });
    }

    const { name, grade, school } = req.body;

    // Create child as student
    const passwordHash = await bcrypt.hash('child123', 10);
    
    const childResult = await pool.query(`
      INSERT INTO users (name, email, password_hash, role, is_approved, is_onboarded)
      VALUES ($1, $2, $3, 'student', true, false)
      RETURNING id, name, email, role
    `, [name, `child_${Date.now()}@edulearn.com`, passwordHash]);

    const child = childResult.rows[0];

    // Link to parent
    await pool.query(`
      INSERT INTO parent_children (parent_id, child_id)
      VALUES ($1, $2)
    `, [req.user.id, child.id]);

    // Initialize XP
    await pool.query(`
      INSERT INTO user_xp (user_id, total_xp, level) VALUES ($1, 0, 1)
    `, [child.id]);

    res.status(201).json(child);
  } catch (error) {
    console.error('Add child error:', error);
    res.status(500).json({ error: 'Failed to add child' });
  }
});

// Get parent's children
router.get('/:id/children', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.avatar, u.created_at
      FROM users u
      INNER JOIN parent_children pc ON u.id = pc.child_id
      WHERE pc.parent_id = $1
    `, [req.params.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({ error: 'Failed to get children' });
  }
});

module.exports = router;
