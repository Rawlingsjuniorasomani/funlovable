const axios = require('axios');

async function testApiLogin() {
    try {
        console.log('--- Testing API Admin Login ---');
        const url = 'http://localhost:5000/api/auth/admin/login';
        console.log('Target:', url);
        const payload = {
            email: 'admin@edulearn.com',
            password: 'admin123'
        };
        console.log('Payload:', payload);

        const res = await axios.post(url, payload);
        console.log('✅ API Login Success!');
        console.log('Status:', res.status);
        console.log('Token:', res.data.token ? 'Received' : 'Missing');
    } catch (error) {
        if (error.response) {
            console.log('❌ API Login Failed - Response Received:');
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else if (error.request) {
            console.log('❌ API Login Failed - No Response (Network Error?):');
            console.log('Code:', error.code);
            console.log('Message:', error.message);
        } else {
            console.log('❌ Error Setting up Request:', error.message);
        }
    }
}

testApiLogin();
