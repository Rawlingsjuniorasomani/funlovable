const express = require('express');
const router = express.Router();
const NotificationModel = require('../models/NotificationModel');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Get all notifications (Admin only)
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const notifications = await NotificationModel.getAll();
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark as read
router.put('/:id/read', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const notification = await NotificationModel.markAsRead(req.params.id);
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all as read
router.put('/read-all', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    await NotificationModel.markAllAsRead();
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

module.exports = router;
