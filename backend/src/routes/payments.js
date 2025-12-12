const express = require('express');
const pool = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Initialize payment
router.post('/initialize', authMiddleware, async (req, res) => {
  try {
    const { amount, plan, email } = req.body;
    const userId = req.user.id;

    // In production, you would call Paystack API here
    const reference = `PAY_${Date.now()}_${userId.slice(0, 8)}`;

    // Create subscription record
    const subscriptionResult = await pool.query(`
      INSERT INTO subscriptions (user_id, plan, status, amount, payment_reference)
      VALUES ($1, $2, 'pending', $3, $4)
      RETURNING *
    `, [userId, plan, amount, reference]);

    // Create payment record
    await pool.query(`
      INSERT INTO payments (user_id, subscription_id, amount, status, reference)
      VALUES ($1, $2, $3, 'pending', $4)
    `, [userId, subscriptionResult.rows[0].id, amount, reference]);

    // In production, you would return Paystack authorization URL
    res.json({
      reference,
      authorization_url: `https://paystack.com/pay/${reference}`,
      subscription_id: subscriptionResult.rows[0].id
    });
  } catch (error) {
    console.error('Initialize payment error:', error);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
});

// Verify payment (webhook or manual verification)
router.post('/verify/:reference', authMiddleware, async (req, res) => {
  try {
    const { reference } = req.params;

    // In production, verify with Paystack API
    // For now, simulate successful payment
    
    // Update subscription
    await pool.query(`
      UPDATE subscriptions 
      SET status = 'active', 
          starts_at = CURRENT_TIMESTAMP,
          expires_at = CURRENT_TIMESTAMP + INTERVAL '30 days'
      WHERE payment_reference = $1
    `, [reference]);

    // Update payment
    await pool.query(`
      UPDATE payments SET status = 'success' WHERE reference = $1
    `, [reference]);

    // Create notification
    const subResult = await pool.query('SELECT user_id FROM subscriptions WHERE payment_reference = $1', [reference]);
    if (subResult.rows.length > 0) {
      await pool.query(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ($1, 'Payment Successful', 'Your subscription is now active!', 'success')
      `, [subResult.rows[0].user_id]);
    }

    res.json({ message: 'Payment verified', status: 'success' });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Get user payments
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, s.plan, s.status as subscription_status
      FROM payments p
      LEFT JOIN subscriptions s ON p.subscription_id = s.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to get payments' });
  }
});

// Get user subscription
router.get('/subscription', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM subscriptions 
      WHERE user_id = $1 AND status = 'active'
      ORDER BY created_at DESC LIMIT 1
    `, [req.user.id]);

    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

module.exports = router;
