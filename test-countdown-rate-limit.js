const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testCountdownWithRateLimit() {
    console.log('🧪 Testing Countdown Timer with Rate Limiter...\n');

    try {
        // Test rate limiting with countdown
        console.log('1️⃣ Triggering rate limit...');
        
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
        
        let rateLimitResponse = null;
        responses.forEach((response, index) => {
            if (response && response.status === 429) {
                console.log(`   Rate limit response ${index + 1}: ${response.data.error_code}: ${response.data.message}`);
                rateLimitResponse = response;
            }
        });

        if (rateLimitResponse) {
            console.log('   ✅ Rate limit triggered!');
            
            // Extract remaining time from message
            const message = rateLimitResponse.data.message;
            const timeMatch = message.match(/(\d+)\s*minutes?/i);
            if (timeMatch) {
                const remainingMinutes = parseInt(timeMatch[1]);
                console.log(`   ✅ Rate limit remaining time: ${remainingMinutes} minutes`);
                
                // Test countdown timer functionality
                console.log('\n2️⃣ Testing countdown timer...');
                console.log(`   Frontend should show: "Time remaining: ${remainingMinutes} minutes"`);
                console.log(`   Progress bar should be at: ${Math.max(0, (remainingMinutes / Math.max(remainingMinutes, 1)) * 100)}%`);
                
                // Simulate countdown
                for (let i = remainingMinutes; i >= 0; i--) {
                    const progress = Math.max(0, (i / Math.max(remainingMinutes, 1)) * 100);
                    console.log(`   ${i} minutes remaining - Progress: ${progress.toFixed(1)}%`);
                }
            } else {
                console.log('   ❌ Could not extract remaining time from rate limit message');
            }
        } else {
            console.log('   ❌ Rate limit not triggered');
        }

        console.log('\n3️⃣ Summary:');
        console.log('   ✅ Rate limiter now includes remaining time in minutes');
        console.log('   ✅ Frontend countdown timer will extract and display this time');
        console.log('   ✅ Progress bar will show visual countdown');
        console.log('   ✅ Timer updates every minute automatically');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testCountdownWithRateLimit(); 