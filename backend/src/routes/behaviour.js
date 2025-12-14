const express = require('express');
const BehaviourController = require('../controllers/BehaviourController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create behaviour record (teachers only)
router.post('/', authMiddleware, requireRole(['teacher', 'admin']), BehaviourController.createRecord);

// Get student behaviour records
router.get('/student/:studentId', authMiddleware, BehaviourController.getStudentRecords);

// Get behaviour summary
router.get('/summary/:studentId', authMiddleware, BehaviourController.getSummary);

module.exports = router;
