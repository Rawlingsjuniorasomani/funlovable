const express = require('express');
const GradesController = require('../controllers/GradesController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create grade
router.post('/', authMiddleware, requireRole(['teacher', 'admin']), GradesController.createGrade);

// Get student grades
router.get('/student/:studentId', authMiddleware, GradesController.getStudentGrades);

// Update grade
router.put('/:id', authMiddleware, requireRole(['teacher', 'admin']), GradesController.updateGrade);

// Delete grade
router.delete('/:id', authMiddleware, requireRole(['teacher', 'admin']), GradesController.deleteGrade);

// Generate report card
router.post('/report-cards', authMiddleware, requireRole(['teacher', 'admin']), GradesController.generateReportCard);

// Get report card
router.get('/report-cards/:studentId/:term/:academicYear', authMiddleware, GradesController.getReportCard);

// Publish report card
router.post('/report-cards/:id/publish', authMiddleware, requireRole(['teacher', 'admin']), GradesController.publishReportCard);

module.exports = router;
