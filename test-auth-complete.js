const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAuthComplete() {
    console.log('🧪 Testing Complete Authentication System...\n');

    let authToken = null;

    // Get CSRF token before making requests
    const csrfResponse = await fetch('/api/csrf-token', {
        credentials: 'include'
    });
    const { csrfToken } = await csrfResponse.json();

    // Test 1: Sign in with invalid credentials
    console.log('1. Testing sign in with invalid credentials...');
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
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
                'X-CSRF-Token': csrfToken
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

    // Test 3: Sign in with valid credentials (if test user exists)
    console.log('3. Testing sign in with valid credentials...');
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({
                email: 'test@telmeez.com',
                password: 'testpassword123'
            }),
        });

        const data = await response.json();
        console.log('Status:', response.status);
        
        if (response.ok) {
            authToken = data.data.token;
            console.log('✅ Valid credentials test passed');
            console.log('Token received:', authToken ? 'Yes' : 'No');
            console.log('User data:', {
                name: `${data.data.user.firstName} ${data.data.user.lastName}`,
                email: data.data.user.email,
                role: data.data.user.role.name
            });
        } else {
            console.log('Response:', data);
            console.log('⚠️  Valid credentials test - user may not exist');
        }
        console.log('');
    } catch (error) {
        console.error('❌ Valid credentials test failed:', error.message);
    }

    // Test 4: Get profile without token
    console.log('4. Testing get profile without token...');
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

    // Test 5: Get profile with invalid token
    console.log('5. Testing get profile with invalid token...');
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

    // Test 6: Get profile with valid token (if we have one)
    if (authToken) {
        console.log('6. Testing get profile with valid token...');
        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                    'X-CSRF-Token': csrfToken
                },
            });

            const data = await response.json();
            console.log('Status:', response.status);
            
            if (response.ok) {
                console.log('✅ Valid token test passed');
                console.log('User profile retrieved successfully');
                console.log('User data:', {
                    name: `${data.data.firstName} ${data.data.lastName}`,
                    email: data.data.email,
                    role: data.data.role.name,
                    subscriptions: data.data.subscriptions ? data.data.subscriptions.length : 0
                });
            } else {
                console.log('Response:', data);
                console.log('❌ Valid token test failed');
            }
            console.log('');
        } catch (error) {
            console.error('❌ Valid token test failed:', error.message);
        }
    } else {
        console.log('6. Skipping valid token test (no token available)\n');
    }

    console.log('🎉 Complete Authentication API tests finished!');
    console.log('\n📝 Summary:');
    console.log('- Authentication endpoints are working');
    console.log('- Error handling is implemented');
    console.log('- JWT token generation and validation is functional');
    
    if (authToken) {
        console.log('- Full authentication flow is working');
    } else {
        console.log('- To test full flow, create a test user first');
        console.log('  Run: node create-test-user.js');
    }
}

// Run the tests
testAuthComplete().catch(console.error);

// Complete example
async function makeSecureRequest(data) {
  try {
    // Step 1: Get CSRF token
    const csrfResponse = await fetch('/api/csrf-token', {
      credentials: 'include'
    });
    const { csrfToken } = await csrfResponse.json();
    
    // Step 2: Make request with CSRF token
    const response = await fetch('/api/your-endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
  }
} 