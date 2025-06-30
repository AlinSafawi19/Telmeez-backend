const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials (you may need to adjust these)
const testUser = {
  email: 'alinsafawi19@gmail.com',
  password: 'alin123M@'
};

async function testStatsEndpoints() {
  try {
    console.log('🧪 Testing Stats Endpoints...\n');

    // Step 1: Sign in to get access token
    console.log('1. Signing in...');
    const signinResponse = await axios.post(`${BASE_URL}/auth/signin`, testUser);
    
    if (signinResponse.data.success) {
      console.log('✅ Sign in successful');
      console.log('📊 Stats included in signin response:', JSON.stringify(signinResponse.data.data.stats, null, 2));
      
      // Extract cookies for subsequent requests
      const cookies = signinResponse.headers['set-cookie'];
      const cookieHeader = cookies ? cookies.join('; ') : '';
      
      // Step 2: Test user stats endpoint
      console.log('\n2. Testing user stats endpoint...');
      try {
        const userStatsResponse = await axios.get(`${BASE_URL}/stats/user`, {
          headers: {
            Cookie: cookieHeader
          }
        });
        
        if (userStatsResponse.data.success) {
          console.log('✅ User stats retrieved successfully');
          console.log('📊 User Stats:', JSON.stringify(userStatsResponse.data.data.stats, null, 2));
        } else {
          console.log('❌ Failed to get user stats:', userStatsResponse.data.message);
        }
      } catch (error) {
        console.log('❌ Error getting user stats:', error.response?.data?.message || error.message);
      }
      
      // Step 3: Test system stats endpoint (admin only)
      console.log('\n3. Testing system stats endpoint...');
      try {
        const systemStatsResponse = await axios.get(`${BASE_URL}/stats/system`, {
          headers: {
            Cookie: cookieHeader
          }
        });
        
        if (systemStatsResponse.data.success) {
          console.log('✅ System stats retrieved successfully');
          console.log('📊 System Stats:', JSON.stringify(systemStatsResponse.data.data.stats, null, 2));
        } else {
          console.log('❌ Failed to get system stats:', systemStatsResponse.data.message);
        }
      } catch (error) {
        if (error.response?.status === 403) {
          console.log('⚠️  System stats access denied (requires admin role)');
        } else {
          console.log('❌ Error getting system stats:', error.response?.data?.message || error.message);
        }
      }
      
    } else {
      console.log('❌ Sign in failed:', signinResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure the server is running on port 5000');
    }
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testStatsEndpoints(); 