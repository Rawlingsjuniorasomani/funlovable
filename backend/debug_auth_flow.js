require('dotenv').config();
const AuthService = require('./src/services/AuthService');
const pool = require('./src/db/pool');
const jwt = require('jsonwebtoken');

async function testAuthFlow() {
    try {
        console.log('--- Starting Auth Flow Test ---');

        const testEmail = `debug_student_${Date.now()}@test.com`;
        const testPassword = 'password123';

        console.log(`1. Registering new student: ${testEmail}`);
        const regResult = await AuthService.register({
            name: 'Debug Student',
            email: testEmail,
            password: testPassword,
            role: 'student',
            age: 15,
            studentClass: 'JHS 1',
            school: 'Test School',
            phone: '0000000000'
        });

        console.log('Registration Result:', {
            id: regResult.user.id,
            email: regResult.user.email,
            role: regResult.user.role
        });

        if (regResult.user.role !== 'student') {
            console.error('CRITICAL FAILURE: User registered as', regResult.user.role, 'but expected student');
            return;
        }

        console.log('2. Logging in...');
        const loginResult = await AuthService.login(testEmail, testPassword);
        const token = loginResult.token;
        console.log('Login successful. Token obtained.');

        console.log('3. Verifying Token Content...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded);

        if (decoded.role !== 'student') {
            console.error('CRITICAL FAILURE: Token contains role', decoded.role);
            return;
        }

        console.log('4. Simulating /me request (database fetch)...');
        // Copy logic from authMiddleware
        const result = await pool.query(`
            SELECT u.id, u.name, u.email, u.role, u.is_approved, u.is_onboarded,
                   u.subscription_status, u.subscription_end_date,
                   COALESCE(bool_or(ur.role = 'super_admin'), false) as is_super_admin
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            WHERE u.id = $1
            GROUP BY u.id
          `, [decoded.userId]);

        const fetchedUser = result.rows[0];
        console.log('Fetched User from DB via Token ID:', {
            id: fetchedUser.id,
            email: fetchedUser.email,
            role: fetchedUser.role
        });

        if (fetchedUser.role !== 'student') {
            console.error('CRITICAL FAILURE: DB returned role', fetchedUser.role);
        } else {
            console.log('SUCCESS: Authenticated user is confirmed as STUDENT.');
        }

    } catch (error) {
        console.error('Test Failed with Error:', error);
    } finally {
        await pool.end();
    }
}

testAuthFlow();
