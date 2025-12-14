require('dotenv').config();
const axios = require('axios');
const pool = require('./db/pool');

async function testDelete() {
    try {
        // 1. Get Teacher ID
        const res = await pool.query("SELECT id FROM users WHERE email = 'teacher@edulearn.com'");
        if (res.rows.length === 0) {
            console.log('Teacher not found in DB');
            process.exit(1);
        }
        const teacherId = res.rows[0].id;
        console.log(`Target Teacher ID: ${teacherId}`);

        // 2. Login Admin
        console.log('Logging in as Admin...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'admin@edulearn.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;

        // 3. Delete Teacher
        console.log('Attempting DELETE...');
        await axios.delete(`http://localhost:5000/api/users/${teacherId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('❌ Unexpected Success: Teacher was deleted!');
    } catch (err) {
        if (err.response) {
            console.log(`✅ Expected Error: ${err.response.status} ${err.response.data.error}`);
            console.log('   Full Data:', err.response.data);
        } else {
            console.error('❌ Network/Client error:', err);
        }
    } finally {
        pool.end();
    }
}

testDelete();
