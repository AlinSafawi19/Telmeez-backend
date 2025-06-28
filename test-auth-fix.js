const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAuthFix() {
  console.log('🧪 Testing Authentication Fix...\n');

  try {
    // Test 1: Sign in with existing user
    console.log('1️⃣ Testing sign in...');
    const signInResponse = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'alinsafawi19@gmail.com',
        password: 'password123' // Replace with actual password
      })
    });

    const signInData = await signInResponse.json();
    console.log('Sign in response:', JSON.stringify(signInData, null, 2));

    if (!signInResponse.ok) {
      console.log('❌ Sign in failed:', signInData.message);
      return;
    }

    // Extract cookies from response
    const cookies = signInResponse.headers.get('set-cookie');
    console.log('🍪 Cookies received:', cookies);

    // Test 2: Get profile with cookies
    console.log('\n2️⃣ Testing get profile...');
    const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      }
    });

    const profileData = await profileResponse.json();
    console.log('Profile response:', JSON.stringify(profileData, null, 2));

    if (!profileResponse.ok) {
      console.log('❌ Get profile failed:', profileData.message);
      return;
    }

    console.log('✅ Authentication fix is working!');
    console.log('✅ User role:', profileData.data.role.role);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthFix(); 