const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAccountLockout() {
    console.log('🧪 Testing Account Lockout Error Messages...\n');

    try {
        // Test 1: Try to sign in with wrong credentials multiple times
        console.log('1️⃣ Testing multiple failed login attempts...');
        
        for (let i = 1; i <= 6; i++) {
            try {
                const response = await axios.post(`${BASE_URL}/auth/signin`, {
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });
                console.log(`   Attempt ${i}: Success (unexpected)`);
            } catch (error) {
                if (error.response) {
                    const { status, data } = error.response;
                    console.log(`   Attempt ${i}: ${status} - ${data.error_code}: ${data.message}`);
                    
                    // Check if we got the expected lockout message
                    if (i >= 5 && data.error_code === 'ACCOUNT_LOCKED') {
                        console.log('   ✅ Account lockout working correctly!');
                    }
                } else {
                    console.log(`   Attempt ${i}: Network error`);
                }
            }
        }

        console.log('\n2️⃣ Testing IP-based lockout...');
        
        // Test IP-based lockout by trying different emails from same IP
        for (let i = 1; i <= 11; i++) {
            try {
                const response = await axios.post(`${BASE_URL}/auth/signin`, {
                    email: `test${i}@example.com`,
                    password: 'wrongpassword'
                });
                console.log(`   IP Attempt ${i}: Success (unexpected)`);
            } catch (error) {
                if (error.response) {
                    const { status, data } = error.response;
                    console.log(`   IP Attempt ${i}: ${status} - ${data.error_code}: ${data.message}`);
                    
                    // Check if we got the expected IP lockout message
                    if (i >= 10 && data.error_code === 'IP_LOCKED') {
                        console.log('   ✅ IP lockout working correctly!');
                    }
                } else {
                    console.log(`   IP Attempt ${i}: Network error`);
                }
            }
        }

        console.log('\n3️⃣ Testing error message content...');
        
        // Test that error messages are descriptive
        try {
            await axios.post(`${BASE_URL}/auth/signin`, {
                email: 'test@example.com',
                password: 'wrongpassword'
            });
        } catch (error) {
            if (error.response) {
                const { data } = error.response;
                console.log(`   Error Code: ${data.error_code}`);
                console.log(`   Error Message: ${data.message}`);
                
                if (data.error_code === 'ACCOUNT_LOCKED' || data.error_code === 'IP_LOCKED') {
                    if (data.message.includes('temporarily locked') || data.message.includes('Too many failed attempts')) {
                        console.log('   ✅ Error message is descriptive and user-friendly!');
                    } else {
                        console.log('   ❌ Error message is not descriptive enough');
                    }
                }
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testAccountLockout(); 