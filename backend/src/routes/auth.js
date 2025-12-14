const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/AuthController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'teacher', 'parent', 'admin']).withMessage('Invalid role')
], AuthController.register);

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], AuthController.login);

// Admin Login
router.post('/admin/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], AuthController.adminLogin);

// Get Me
router.get('/me', authMiddleware, AuthController.getMe);

// Complete Onboarding
router.post('/onboarding/complete', authMiddleware, AuthController.completeOnboarding);

// OTP Generation
router.post('/generate-otp', authMiddleware, AuthController.generateOTP);

module.exports = router;
