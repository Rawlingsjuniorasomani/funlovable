const express = require('express');
const pool = require('../db/pool');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get admin analytics
router.get('/admin', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    // User counts by role
    const userCountsResult = await pool.query(`
      SELECT role, COUNT(*) as count FROM users GROUP BY role
    `);

    // New registrations this month
    const newUsersResult = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM users 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at) ORDER BY date
    `);

    // Payment stats
    const paymentStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END) as total_revenue,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_payments
      FROM payments
    `);

    // Daily revenue (last 30 days)
    const dailyRevenueResult = await pool.query(`
      SELECT DATE(created_at) as date, SUM(amount) as revenue
      FROM payments
      WHERE status = 'success' AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at) ORDER BY date
    `);

    // Active subscriptions
    const subscriptionsResult = await pool.query(`
      SELECT plan, COUNT(*) as count 
      FROM subscriptions WHERE status = 'active'
      GROUP BY plan
    `);

    // Quiz attempts stats
    const quizStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_attempts,
        AVG(percentage) as average_score,
        COUNT(CASE WHEN passed THEN 1 END) as passed_count
      FROM quiz_attempts
    `);

    // Recent activity (Users and Payments mixed)
    const recentActivityResult = await pool.query(`
      SELECT 'user' as type, name as title, created_at as date, email as subtitle
      FROM users
      ORDER BY created_at DESC LIMIT 5
    `);

    const recentPaymentsResult = await pool.query(`
      SELECT 'payment' as type, amount::text as title, created_at as date, status as subtitle
      FROM payments
      ORDER BY created_at DESC LIMIT 5
    `);

    // Merge and sort
    const recentActivity = [...recentActivityResult.rows, ...recentPaymentsResult.rows]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // System alerts
    const alerts = [];
    const pendingCount = parseInt(pendingTeachersResult.rows[0].count);
    if (pendingCount > 0) {
      alerts.push({
        type: 'warning',
        message: `${pendingCount} Teacher approval${pendingCount > 1 ? 's' : ''} pending`,
        date: new Date()
      });
    }

    // Check for recent failed payments
    const failedPaymentsResult = await pool.query(`
      SELECT COUNT(*) as count FROM payments 
      WHERE status = 'failed' AND created_at >= CURRENT_DATE - INTERVAL '24 hours'
    `);
    const failedCount = parseInt(failedPaymentsResult.rows[0].count);
    if (failedCount > 0) {
      alerts.push({
        type: 'error',
        message: `${failedCount} Payment failure${failedCount > 1 ? 's' : ''} in last 24h`,
        date: new Date()
      });
    }

    res.json({
      userCounts: userCountsResult.rows,
      newUsers: newUsersResult.rows,
      paymentStats: paymentStatsResult.rows[0],
      dailyRevenue: dailyRevenueResult.rows,
      subscriptions: subscriptionsResult.rows,
      quizStats: quizStatsResult.rows[0],
      pendingTeachers: pendingCount,
      recentActivity,
      systemAlerts: alerts
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Get teacher analytics
router.get('/teacher', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Subjects taught
    const subjectsResult = await pool.query(`
      SELECT COUNT(*) as count FROM subjects WHERE teacher_id = $1
    `, [teacherId]);

    // Total students in classes
    const studentsResult = await pool.query(`
      SELECT COUNT(DISTINCT up.user_id) as count
      FROM user_progress up
      INNER JOIN lessons l ON up.lesson_id = l.id
      INNER JOIN modules m ON l.module_id = m.id
      INNER JOIN subjects s ON m.subject_id = s.id
      WHERE s.teacher_id = $1
    `, [teacherId]);

    // Quiz performance in teacher's subjects
    const quizPerformanceResult = await pool.query(`
      SELECT 
        AVG(qa.percentage) as average_score,
        COUNT(*) as total_attempts
      FROM quiz_attempts qa
      INNER JOIN quizzes q ON qa.quiz_id = q.id
      INNER JOIN modules m ON q.module_id = m.id
      INNER JOIN subjects s ON m.subject_id = s.id
      WHERE s.teacher_id = $1
    `, [teacherId]);

    res.json({
      subjectsCount: parseInt(subjectsResult.rows[0].count),
      studentsCount: parseInt(studentsResult.rows[0].count),
      quizPerformance: quizPerformanceResult.rows[0]
    });
  } catch (error) {
    console.error('Teacher analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Get student analytics
router.get('/student', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Progress stats
    const progressResult = await pool.query(`
      SELECT 
        COUNT(*) as completed_lessons,
        SUM(time_spent_minutes) as total_time
      FROM user_progress 
      WHERE user_id = $1 AND is_completed = true
    `, [userId]);

    // Quiz stats
    const quizResult = await pool.query(`
      SELECT 
        COUNT(*) as total_attempts,
        AVG(percentage) as average_score,
        COUNT(CASE WHEN passed THEN 1 END) as quizzes_passed
      FROM quiz_attempts WHERE user_id = $1
    `, [userId]);

    // XP and level
    const xpResult = await pool.query(
      'SELECT total_xp, level FROM user_xp WHERE user_id = $1',
      [userId]
    );

    // Achievements
    const achievementsResult = await pool.query(`
      SELECT COUNT(*) as count FROM user_achievements WHERE user_id = $1
    `, [userId]);

    // Recent activity
    const recentActivityResult = await pool.query(`
      SELECT 'lesson' as type, l.title as name, up.completed_at as date
      FROM user_progress up
      INNER JOIN lessons l ON up.lesson_id = l.id
      WHERE up.user_id = $1 AND up.is_completed = true
      UNION ALL
      SELECT 'quiz' as type, q.title as name, qa.completed_at as date
      FROM quiz_attempts qa
      INNER JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = $1
      ORDER BY date DESC LIMIT 10
    `, [userId]);

    res.json({
      progress: progressResult.rows[0],
      quizStats: quizResult.rows[0],
      xp: xpResult.rows[0] || { total_xp: 0, level: 1 },
      achievementsCount: parseInt(achievementsResult.rows[0].count),
      recentActivity: recentActivityResult.rows
    });
  } catch (error) {
    console.error('Student analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Get parent analytics (for children)
router.get('/parent', authMiddleware, async (req, res) => {
  try {
    const parentId = req.user.id;

    // Get children
    const childrenResult = await pool.query(`
      SELECT u.id, u.name
      FROM users u
      INNER JOIN parent_children pc ON u.id = pc.child_id
      WHERE pc.parent_id = $1
    `, [parentId]);

    const childrenAnalytics = await Promise.all(
      childrenResult.rows.map(async (child) => {
        const progressResult = await pool.query(`
          SELECT 
            COUNT(*) as completed_lessons,
            COALESCE(SUM(time_spent_minutes), 0) as total_time
          FROM user_progress 
          WHERE user_id = $1 AND is_completed = true
        `, [child.id]);

        const quizResult = await pool.query(`
          SELECT AVG(percentage) as average_score, COUNT(*) as attempts
          FROM quiz_attempts WHERE user_id = $1
        `, [child.id]);

        const xpResult = await pool.query(
          'SELECT total_xp, level FROM user_xp WHERE user_id = $1',
          [child.id]
        );

        return {
          ...child,
          completedLessons: parseInt(progressResult.rows[0].completed_lessons),
          totalTime: parseInt(progressResult.rows[0].total_time),
          quizStats: quizResult.rows[0],
          xp: xpResult.rows[0] || { total_xp: 0, level: 1 }
        };
      })
    );

    // Get recent activity for all children
    const childIds = childrenResult.rows.map(c => c.id);
    let recentActivity = [];

    if (childIds.length > 0) {
      // Need to format array for SQL IN clause safely? 
      // Actually pg allows $1 = ANY(array)
      const activityResult = await pool.query(`
        SELECT 'lesson' as type, l.title as name, up.completed_at as date, u.name as student_name
        FROM user_progress up
        INNER JOIN lessons l ON up.lesson_id = l.id
        INNER JOIN users u ON up.user_id = u.id
        WHERE up.user_id = ANY($1) AND up.is_completed = true
        UNION ALL
        SELECT 'quiz' as type, q.title as name, qa.completed_at as date, u.name as student_name
        FROM quiz_attempts qa
        INNER JOIN quizzes q ON qa.quiz_id = q.id
        INNER JOIN users u ON qa.user_id = u.id
        WHERE qa.user_id = ANY($1)
        ORDER BY date DESC LIMIT 10
      `, [childIds]);
      recentActivity = activityResult.rows;
    }

    res.json({ children: childrenAnalytics, recentActivity });
  } catch (error) {
    console.error('Parent analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

module.exports = router;
