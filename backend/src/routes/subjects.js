const express = require('express');
const SubjectController = require('../controllers/SubjectController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public get all subjects
router.get('/', SubjectController.getAll);

// Get teacher's subjects
router.get('/my-subjects', authMiddleware, requireRole(['teacher']), SubjectController.getTeacherSubjects);

// Get single subject
router.get('/:id', SubjectController.getOne);

// Admin/Teacher only routes
router.post('/', authMiddleware, requireRole(['admin', 'teacher']), SubjectController.create);
router.put('/:id', authMiddleware, requireRole(['admin', 'teacher']), SubjectController.update);
router.delete('/:id', authMiddleware, requireRole(['admin']), SubjectController.delete);

module.exports = router;
