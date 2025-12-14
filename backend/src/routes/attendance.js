const express = require('express');
const AttendanceController = require('../controllers/AttendanceController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Mark attendance (single or bulk)
router.post('/mark', authMiddleware, requireRole(['teacher', 'admin']), AttendanceController.markAttendance);
router.post('/bulk-mark', authMiddleware, requireRole(['teacher', 'admin']), AttendanceController.bulkMarkAttendance);

// Get student attendance
router.get('/student/:studentId', authMiddleware, AttendanceController.getStudentAttendance);

// Get class attendance for a specific date
router.get('/class/:subjectId', authMiddleware, requireRole(['teacher', 'admin']), AttendanceController.getClassAttendance);

// Get attendance statistics
router.get('/stats/:studentId', authMiddleware, AttendanceController.getAttendanceStats);

module.exports = router;
