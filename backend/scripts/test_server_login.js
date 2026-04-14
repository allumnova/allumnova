const axios = require('axios');

// Allumnova Production Verification Utility
const API_URL = 'https://allumnova.cloud/api';

async function testServerLogin(email, password) {
    console.log(`\n🚀 Testing login for: ${email}`);
    console.log(`🌐 Endpoint: ${API_URL}/auth/login`);
    
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: email,
            password: password
        });

        if (response.data && response.data.token) {
            console.log('✅ LOGIN SUCCESSFUL!');
            console.log('👤 User:', response.data.user.full_name || response.data.user.email);
            console.log('🔑 Token received:', response.data.token.substring(0, 10) + '...');
            return true;
        } else {
            console.log('⚠️ Login response did not contain a token.');
            console.log('Response:', JSON.stringify(response.data, null, 2));
            return false;
        }
    } catch (error) {
        console.error('❌ LOGIN FAILED');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Error Details:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Network Error:', error.message);
        }
        return false;
    }
}

// Usage: node scripts/test_server_login.js <email> <password>
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node scripts/test_server_login.js <email> <password>');
    process.exit(1);
}

testServerLogin(args[0], args[1]);
