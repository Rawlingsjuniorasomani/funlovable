const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'teacher', 'parent']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, phone } = req.body;

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Teachers need approval, others are auto-approved
    const isApproved = role !== 'teacher';

    // Insert user
    const result = await pool.query(`
      INSERT INTO users (name, email, password_hash, role, phone, is_approved)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, role, is_approved, is_onboarded, created_at
    `, [name, email, passwordHash, role, phone, isApproved]);

    const user = result.rows[0];

    // Add role to user_roles table
    await pool.query(`
      INSERT INTO user_roles (user_id, role)
      VALUES ($1, $2)
    `, [user.id, role]);

    // Initialize XP for students
    if (role === 'student') {
      await pool.query(`
        INSERT INTO user_xp (user_id, total_xp, level)
        VALUES ($1, 0, 1)
      `, [user.id]);
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Get user
    const result = await pool.query(`
      SELECT id, name, email, password_hash, role, phone, avatar, is_approved, is_onboarded
      FROM users WHERE email = $1
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password hash from response
    delete user.password_hash;

    res.json({
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin login
router.post('/admin/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user and check if admin
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.password_hash, u.role
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id
      WHERE u.email = $1 AND ur.role = 'admin'
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const user = result.rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    delete user.password_hash;

    res.json({ user, token });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Admin login failed' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, role, phone, avatar, is_approved, is_onboarded, created_at
      FROM users WHERE id = $1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get XP for students
    let xp = null;
    if (req.user.role === 'student') {
      const xpResult = await pool.query(
        'SELECT total_xp, level FROM user_xp WHERE user_id = $1',
        [req.user.id]
      );
      if (xpResult.rows.length > 0) {
        xp = xpResult.rows[0];
      }
    }

    res.json({ user: result.rows[0], xp });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Complete onboarding
router.post('/onboarding/complete', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'UPDATE users SET is_onboarded = true WHERE id = $1',
      [req.user.id]
    );
    res.json({ message: 'Onboarding completed' });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

module.exports = router;
