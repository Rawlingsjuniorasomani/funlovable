const AuthService = require('../services/AuthService');
const { validationResult } = require('express-validator');

class AuthController {
    static async register(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, email, password, role, phone, school, age, class: studentClass, ...rest } = req.body;
            // Map 'class' from frontend to 'studentClass' for backend consistency, or just pass 'class' if service handles it. 
            // Better to pass explicit fields.
            const result = await AuthService.register({ name, email, password, role, phone, school, age, studentClass, ...rest });

            res.status(201).json(result);
        } catch (error) {
            if (error.message === 'Email already registered') {
                return res.status(400).json({ error: error.message });
            }
            console.error(error);
            res.status(500).json({ error: 'Registration failed' });
        }
    }

    static async login(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;
            const result = await AuthService.login(email, password);

            res.json(result);
        } catch (error) {
            if (error.message === 'Invalid credentials' || error.message.includes('pending admin approval') || error.message.includes('Registration incomplete')) {
                return res.status(401).json({ error: error.message });
            }
            console.error(error);
            res.status(500).json({ error: 'Login failed' });
        }
    }

    static async adminLogin(req, res) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.adminLogin(email, password);
            res.json(result);
        } catch (error) {
            if (error.message === 'Invalid admin credentials') {
                return res.status(401).json({ error: error.message });
            }
            console.error(error);
            res.status(500).json({ error: 'Admin login failed' });
        }
    }

    static async getMe(req, res) {
        try {
            // Return user in the same format as login
            const user = req.user;
            res.json({ user });
        } catch (error) {
            console.error('Get me error:', error);
            res.status(500).json({ error: 'Failed to get user' });
        }
    }

    static async completeOnboarding(req, res) {
        try {
            const result = await AuthService.completeOnboarding(req.user.id);
            res.json(result);
        } catch (error) {
            console.error('Complete onboarding error:', error);
            res.status(500).json({ error: 'Failed to complete onboarding' });
        }
    }

    static async generateOTP(req, res) {
        try {
            const OtpService = require('../services/OtpService');
            // User must be authenticated
            if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

            const code = await OtpService.generateOTP(req.user.id, req.body.type || 'general');

            // In a real app, we wouldn't return the code, but for this mock implementation we do
            // so the frontend can display it for testing.
            res.json({ message: 'OTP generated', code });
        } catch (error) {
            console.error('Generate OTP error:', error);
            res.status(500).json({ error: 'Failed to generate OTP' });
        }
    }
}

module.exports = AuthController;
