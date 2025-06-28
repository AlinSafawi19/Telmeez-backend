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

async function testRememberMe() {
    console.log('🧪 Testing Remember Me functionality...\n');

    try {
        // Test 1: Sign in without remember me
        console.log('1. Testing sign in WITHOUT remember me...');
        const response1 = await makeRequest(`${API_BASE_URL}/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }, {
            email: 'test@telmeez.com',
            password: 'testpassword123',
            rememberMe: false
        });

        console.log('Status:', response1.status);
        console.log('Response:', response1.data.success ? '✅ Success' : '❌ Failed');
        console.log('Message:', response1.data.message);
        
        if (response1.headers['set-cookie']) {
            console.log('Cookies set:', response1.headers['set-cookie']);
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 2: Sign in with remember me
        console.log('2. Testing sign in WITH remember me...');
        const response2 = await makeRequest(`${API_BASE_URL}/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }, {
            email: 'test@telmeez.com',
            password: 'testpassword123',
            rememberMe: true
        });

        console.log('Status:', response2.status);
        console.log('Response:', response2.data.success ? '✅ Success' : '❌ Failed');
        console.log('Message:', response2.data.message);
        
        if (response2.headers['set-cookie']) {
            console.log('Cookies set:', response2.headers['set-cookie']);
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 3: Test with invalid credentials
        console.log('3. Testing with invalid credentials...');
        const response3 = await makeRequest(`${API_BASE_URL}/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }, {
            email: 'invalid@example.com',
            password: 'wrongpassword',
            rememberMe: true
        });

        console.log('Status:', response3.status);
        console.log('Response:', response3.data.success ? '✅ Success' : '❌ Failed (expected)');
        console.log('Message:', response3.data.message);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testRememberMe(); 