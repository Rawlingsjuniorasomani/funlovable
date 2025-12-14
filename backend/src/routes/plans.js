const express = require('express');
const PlanController = require('../controllers/PlanController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public routes (or authenticated but accessible to all roles)
router.get('/', PlanController.getAll);
router.get('/:id', PlanController.getById);

// Admin only routes
router.post('/', authMiddleware, requireRole(['admin']), PlanController.create);
router.put('/:id', authMiddleware, requireRole(['admin']), PlanController.update);
router.delete('/:id', authMiddleware, requireRole(['admin']), PlanController.delete);

module.exports = router;
