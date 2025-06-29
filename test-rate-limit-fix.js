const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testRateLimitFix() {
    console.log('🧪 Testing Rate Limit Error Message Fix...\n');

    try {
        // Test rate limiting by making multiple requests quickly
        console.log('1️⃣ Testing rate limit error message...');
        
        const promises = [];
        for (let i = 1; i <= 10; i++) {
            promises.push(
                axios.post(`${BASE_URL}/auth/signin`, {
                    email: 'test@example.com',
                    password: 'wrongpassword'
                }).catch(error => error.response)
            );
        }

        const responses = await Promise.all(promises);
        
        // Check if we got rate limit errors
        let rateLimitErrors = 0;
        responses.forEach((response, index) => {
            if (response && response.status === 429) {
                rateLimitErrors++;
                console.log(`   Request ${index + 1}: ${response.status} - ${response.data.error_code}: ${response.data.message}`);
                
                // Check if error_code is present
                if (response.data.error_code === 'RATE_LIMIT_EXCEEDED') {
                    console.log('   ✅ Rate limit error_code is present!');
                } else {
                    console.log('   ❌ Rate limit error_code is missing!');
                }
                
                // Check if message is descriptive
                if (response.data.message.includes('Too many login attempts')) {
                    console.log('   ✅ Rate limit message is descriptive!');
                } else {
                    console.log('   ❌ Rate limit message is not descriptive!');
                }
            }
        });

        if (rateLimitErrors > 0) {
            console.log(`\n✅ Rate limiting is working! Got ${rateLimitErrors} rate limit errors.`);
        } else {
            console.log('\n❌ No rate limit errors detected. Rate limiting might not be working.');
        }

        console.log('\n2️⃣ Testing account lockout vs rate limit...');
        
        // Try a few more attempts to see if we get account lockout
        for (let i = 1; i <= 3; i++) {
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
                    
                    if (data.error_code === 'ACCOUNT_LOCKED') {
                        console.log('   ✅ Account lockout working correctly!');
                    } else if (data.error_code === 'RATE_LIMIT_EXCEEDED') {
                        console.log('   ✅ Rate limiting working correctly!');
                    } else if (data.error_code === 'INVALID_CREDENTIALS') {
                        console.log('   ✅ Invalid credentials working correctly!');
                    } else {
                        console.log('   ❌ Unexpected error code!');
                    }
                } else {
                    console.log(`   Attempt ${i}: Network error`);
                }
            }
        }

        console.log('\n3️⃣ Summary of error codes found:');
        const errorCodes = new Set();
        responses.forEach(response => {
            if (response && response.data && response.data.error_code) {
                errorCodes.add(response.data.error_code);
            }
        });
        
        errorCodes.forEach(code => {
            console.log(`   - ${code}`);
        });

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testRateLimitFix(); 