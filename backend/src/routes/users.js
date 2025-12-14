const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { authMiddleware, requireRole, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();



// Get all users (admin only)
// Get all users (admin and teacher)
router.get('/', authMiddleware, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { role, status } = req.query;

    let query = `
      SELECT u.id, u.name, u.email, u.role, u.phone, u.avatar, u.is_approved, u.is_onboarded, u.created_at,
             u.student_class, u.school,
             MAX(COALESCE(ux.total_xp, 0)) as total_xp, MAX(COALESCE(ux.level, 1)) as level,
             u.subscription_status, u.subscription_end_date,
             (SELECT COUNT(*) FROM parent_children pc WHERE pc.parent_id = u.id)::int as children_count,
             (
                SELECT s.plan
                FROM subscriptions s 
                WHERE s.user_id = u.id AND s.status = 'active' 
                ORDER BY s.created_at DESC 
                LIMIT 1
             ) as plan_name,
             (SELECT AVG(percentage) FROM quiz_attempts qa WHERE qa.user_id = u.id) as avg_quiz_score,
             (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.user_id = u.id AND qa.passed = true) as completed_quizzes,
             (SELECT COUNT(*) FROM user_progress up WHERE up.user_id = u.id AND up.is_completed = true) as completed_lessons,
             (SELECT AVG(percentage) FROM quiz_attempts qa WHERE qa.user_id = u.id) as avg_quiz_score,
             (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.user_id = u.id AND qa.passed = true) as completed_quizzes,
             (SELECT COUNT(*) FROM user_progress up WHERE up.user_id = u.id AND up.is_completed = true) as completed_lessons,
             (
                SELECT u2.name 
                FROM parent_children pc2 
                JOIN users u2 ON pc2.parent_id = u2.id 
                WHERE pc2.child_id = u.id
                LIMIT 1
             ) as parent_name,
             STRING_AGG(DISTINCT s.name, ', ') as subjects_list
      FROM users u
      LEFT JOIN teacher_subjects ts ON u.id = ts.teacher_id
      LEFT JOIN subjects s ON ts.subject_id = s.id
      LEFT JOIN user_xp ux ON u.id = ux.user_id
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      params.push(role);
      query += ` AND u.role = $${params.length}`;
    }

    if (status === 'pending') {
      query += ' AND u.is_approved = false';
    } else if (status === 'approved') {
      query += ' AND u.is_approved = true';
    }

    query += ' GROUP BY u.id ORDER BY u.created_at DESC';

    const result = await pool.query(query, params);

    // Transform data to match frontend expectations
    const users = result.rows.map(user => ({
      ...user,
      children: Array(user.children_count).fill({}), // Mock array length for count
      subscription: {
        status: user.subscription_status || 'inactive',
        plan: user.plan_name || 'None',
        endDate: user.subscription_end_date
      }
    }));

    res.json(users);
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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userId = req.params.id;

    // 1. Unlink from Subjects (Set teacher_id to NULL)
    await client.query('UPDATE subjects SET teacher_id = NULL WHERE teacher_id = $1', [userId]);

    // 2. Remove from teacher_subjects (Many-to-Many)
    await client.query('DELETE FROM teacher_subjects WHERE teacher_id = $1', [userId]);

    // 3. Delete Assignments (cascades to student_assignments)
    await client.query('DELETE FROM assignments WHERE teacher_id = $1', [userId]);

    // 4. Delete Live Classes
    await client.query('DELETE FROM live_classes WHERE teacher_id = $1', [userId]);

    // 6. Delete the User
    const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    await client.query('COMMIT');
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  } finally {
    client.release();
  }
});

// Add child to parent
router.post('/:id/children', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'parent' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only parents can add children' });
    }

    const { name, grade, school, age, studentClass, phone } = req.body;

    let childId;

    // 1. Try to find existing student by phone if provided
    if (phone) {
      const existingStudent = await pool.query(
        'SELECT * FROM users WHERE phone = $1 AND role = $2',
        [phone, 'student']
      );

      if (existingStudent.rows.length > 0) {
        childId = existingStudent.rows[0].id;

        // Verify if already linked
        const existingLink = await pool.query(
          'SELECT * FROM parent_children WHERE parent_id = $1 AND child_id = $2',
          [req.user.id, childId]
        );

        if (existingLink.rows.length > 0) {
          return res.status(400).json({ error: 'Student already linked to this parent' });
        }
      }
    }

    // 2. If no existing student found, create new one
    if (!childId) {
      // Create child as student
      const passwordHash = await bcrypt.hash('child123', 10);
      // Use provided email or generate a placeholder
      const childEmail = req.body.email || `child_${Date.now()}@edulearn.com`;

      const childResult = await pool.query(`
          INSERT INTO users (name, email, password_hash, role, is_approved, is_onboarded, school, age, student_class, phone)
          VALUES ($1, $2, $3, 'student', true, false, $4, $5, $6, $7)
          RETURNING id, name, email, role
        `, [name, childEmail, passwordHash, school, age, studentClass || grade, phone]); // Map grade to studentClass if provided

      childId = childResult.rows[0].id;
    }

    // 3. Link to parent
    await pool.query(`
      INSERT INTO parent_children (parent_id, child_id)
      VALUES ($1, $2)
    `, [req.user.id, childId]);

    // 3.5. Link to Subjects (Enrollment)
    const { subjects } = req.body;
    if (subjects && Array.isArray(subjects) && subjects.length > 0) {
      for (const subjectId of subjects) {
        // Only insert valid UUIDs (basic check)
        if (subjectId.length > 10) {
          await pool.query(`
            INSERT INTO student_subjects (student_id, subject_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            `, [childId, subjectId]);
        }
      }
    }

    // 4. Initialize XP if new (or check if exists)
    await pool.query(`
      INSERT INTO user_xp (user_id, total_xp, level) 
      VALUES ($1, 0, 1)
      ON CONFLICT (user_id) DO NOTHING
    `, [childId]);

    // Return the child details
    const childDetails = await pool.query('SELECT id, name, email, role, school, age, student_class FROM users WHERE id = $1', [childId]);
    res.status(201).json(childDetails.rows[0]);
  } catch (error) {
    console.error('Add child error:', error);
    res.status(500).json({ error: 'Failed to add child' });
  }
});

// Get parent's children
router.get('/:id/children', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.avatar, u.created_at,
             COALESCE(ux.total_xp, 0) as xp, COALESCE(ux.level, 1) as level
      FROM users u
      INNER JOIN parent_children pc ON u.id = pc.child_id
      LEFT JOIN user_xp ux ON u.id = ux.user_id
      WHERE pc.parent_id = $1
    `, [req.params.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({ error: 'Failed to get children' });
  }
});

// --- Admin Management Routes ---

// Get all admins with their super-admin status
router.get('/admins/list', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone, u.avatar, u.created_at,
             EXISTS(SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role = 'super_admin') as is_super_admin
      FROM users u
      WHERE u.role = 'admin'
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ error: 'Failed to get admins' });
  }
});

// Create a new Admin
router.post('/admins/invite', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(`
      INSERT INTO users (name, email, password_hash, role, phone, is_approved, is_onboarded)
      VALUES ($1, $2, $3, 'admin', $4, true, true)
      RETURNING id, name, email, role
    `, [name, email, passwordHash, phone]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Invite admin error:', error);
    res.status(500).json({ error: 'Failed to invite admin' });
  }
});

// Promote to Super Admin
router.post('/:id/promote', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { otp_code } = req.body;
    const OtpService = require('../services/OtpService');

    // 1. Check if ANY super admin exists (Bootstrapping check)
    const superAdminCheck = await pool.query("SELECT 1 FROM user_roles WHERE role = 'super_admin' LIMIT 1");
    const isBootstrap = superAdminCheck.rows.length === 0;

    if (!isBootstrap) {
      if (!otp_code) {
        return res.status(400).json({ error: 'OTP required for this action', requires_otp: true });
      }

      const isValid = await OtpService.verifyOTP(req.user.id, otp_code, 'sensitive_action');
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }
    }

    await pool.query(`
      INSERT INTO user_roles (user_id, role)
      VALUES ($1, 'super_admin')
      ON CONFLICT DO NOTHING
    `, [req.params.id]);

    // Notify
    await pool.query(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES ($1, 'Role Updated', 'You have been promoted to Super Admin.', 'system')
    `, [req.params.id]);

    res.json({ message: 'User promoted to Super Admin' });
  } catch (error) {
    console.error('Promote error:', error);
    res.status(500).json({ error: 'Failed to promote user' });
  }
});

// Demote from Super Admin
router.post('/:id/demote', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    await pool.query(`
      DELETE FROM user_roles WHERE user_id = $1 AND role = 'super_admin'
    `, [req.params.id]);

    res.json({ message: 'User demoted from Super Admin' });
  } catch (error) {
    console.error('Demote error:', error);
    res.status(500).json({ error: 'Failed to demote user' });
  }
});

module.exports = router;
