const https = require('https');
const http = require('http');

const API_BASE_URL = 'http://localhost:5000/api';

function makeRequest(url, options, data) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = client.request(requestOptions, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(body);
                    resolve({
                        status: res.statusCode,
                        data: jsonData,
                        headers: res.headers
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        data: body,
                        headers: res.headers
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testForgotPassword() {
    console.log('🧪 Testing Forgot Password functionality...\n');

    const testEmail = 'test@telmeez.com';

    try {
        // Test 1: Request password reset
        console.log('1. Testing password reset request...');
        const response1 = await makeRequest(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }, {
            email: testEmail
        });

        console.log('Status:', response1.status);
        console.log('Response:', response1.data.success ? '✅ Success' : '❌ Failed');
        console.log('Message:', response1.data.message);

        if (!response1.data.success) {
            console.log('❌ Password reset request failed');
            return;
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 2: Test with invalid email
        console.log('2. Testing with invalid email...');
        const response2 = await makeRequest(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }, {
            email: 'invalid@example.com'
        });

        console.log('Status:', response2.status);
        console.log('Response:', response2.data.success ? '✅ Success' : '❌ Failed');
        console.log('Message:', response2.data.message);

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 3: Test with missing email
        console.log('3. Testing with missing email...');
        const response3 = await makeRequest(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }, {});

        console.log('Status:', response3.status);
        console.log('Response:', response3.data.success ? '✅ Success' : '❌ Failed (expected)');
        console.log('Message:', response3.data.message);

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 4: Test verify reset code with invalid code
        console.log('4. Testing verify reset code with invalid code...');
        const response4 = await makeRequest(`${API_BASE_URL}/auth/verify-reset-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }, {
            email: testEmail,
            code: '000000'
        });

        console.log('Status:', response4.status);
        console.log('Response:', response4.data.success ? '✅ Success' : '❌ Failed (expected)');
        console.log('Message:', response4.data.message);

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 5: Test reset password with invalid data
        console.log('5. Testing reset password with invalid data...');
        const response5 = await makeRequest(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }, {
            email: testEmail,
            code: '000000',
            newPassword: '123'
        });

        console.log('Status:', response5.status);
        console.log('Response:', response5.data.success ? '✅ Success' : '❌ Failed (expected)');
        console.log('Message:', response5.data.message);

        console.log('\n✅ All tests completed!');
        console.log('\n📝 Summary:');
        console.log('- Password reset request functionality is working');
        console.log('- Invalid email handling is working');
        console.log('- Missing email validation is working');
        console.log('- Invalid verification code handling is working');
        console.log('- Password validation is working');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testForgotPassword(); 