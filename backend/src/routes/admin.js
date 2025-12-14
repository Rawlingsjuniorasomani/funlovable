const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth');
const AdminController = require('../controllers/AdminController');

const router = express.Router();

// Get Dashboard Stats (students, teachers, revenue, etc.)
router.get('/stats', authMiddleware, requireRole('admin'), AdminController.getStats);

module.exports = router;
