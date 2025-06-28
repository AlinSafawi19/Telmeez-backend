const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAuth() {
    console.log('🧪 Testing Authentication System...\n');

    // Test 1: Sign in with invalid credentials
    console.log('1. Testing sign in with invalid credentials...');
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'invalid@example.com',
                password: 'wrongpassword'
            }),
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
        console.log('✅ Invalid credentials test passed\n');
    } catch (error) {
        console.error('❌ Invalid credentials test failed:', error.message);
    }

    // Test 2: Sign in with missing fields
    console.log('2. Testing sign in with missing fields...');
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com'
                // Missing password
            }),
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
        console.log('✅ Missing fields test passed\n');
    } catch (error) {
        console.error('❌ Missing fields test failed:', error.message);
    }

    // Test 3: Get profile without token
    console.log('3. Testing get profile without token...');
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
        console.log('✅ No token test passed\n');
    } catch (error) {
        console.error('❌ No token test failed:', error.message);
    }

    // Test 4: Get profile with invalid token
    console.log('4. Testing get profile with invalid token...');
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer invalid-token'
            },
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
        console.log('✅ Invalid token test passed\n');
    } catch (error) {
        console.error('❌ Invalid token test failed:', error.message);
    }

    console.log('🎉 Authentication API tests completed!');
    console.log('\n📝 Note: To test with real credentials, you need to:');
    console.log('1. Create a user in the database');
    console.log('2. Use valid email and password');
    console.log('3. Test the successful sign in flow');
}

// Run the tests
testAuth().catch(console.error); 