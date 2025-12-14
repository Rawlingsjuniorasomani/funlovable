const express = require('express');
const ProgressController = require('../controllers/ProgressController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Track lesson view
router.post('/lesson-view', authMiddleware, ProgressController.trackLessonView);

// Get student progress
router.get('/student/:studentId', authMiddleware, ProgressController.getStudentProgress);

// Get analytics
router.get('/analytics/:studentId', authMiddleware, ProgressController.getAnalytics);

module.exports = router;
