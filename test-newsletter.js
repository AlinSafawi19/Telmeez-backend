const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api/newsletter';

// Test data
const testEmail = 'test@example.com';
const testEmail2 = 'test2@example.com';

async function testNewsletterAPI() {
    console.log('🧪 Testing Newsletter API...\n');

    try {
        // Test 1: Subscribe to newsletter
        console.log('1. Testing newsletter subscription...');
        const subscribeResponse = await fetch(`${API_BASE_URL}/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testEmail,
                language: 'en'
            }),
        });

        const subscribeData = await subscribeResponse.json();
        console.log('Status:', subscribeResponse.status);
        console.log('Response:', subscribeData);
        console.log('✅ Subscribe test completed\n');

        // Test 2: Try to subscribe with the same email (should fail)
        console.log('2. Testing duplicate subscription...');
        const duplicateResponse = await fetch(`${API_BASE_URL}/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testEmail,
                language: 'en'
            }),
        });

        const duplicateData = await duplicateResponse.json();
        console.log('Status:', duplicateResponse.status);
        console.log('Response:', duplicateData);
        console.log('✅ Duplicate subscription test completed\n');

        // Test 3: Subscribe with invalid email
        console.log('3. Testing invalid email...');
        const invalidResponse = await fetch(`${API_BASE_URL}/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'invalid-email',
                language: 'en'
            }),
        });

        const invalidData = await invalidResponse.json();
        console.log('Status:', invalidResponse.status);
        console.log('Response:', invalidData);
        console.log('✅ Invalid email test completed\n');

        // Test 4: Subscribe with Arabic language
        console.log('4. Testing Arabic language subscription...');
        const arabicResponse = await fetch(`${API_BASE_URL}/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testEmail2,
                language: 'ar'
            }),
        });

        const arabicData = await arabicResponse.json();
        console.log('Status:', arabicResponse.status);
        console.log('Response:', arabicData);
        console.log('✅ Arabic language test completed\n');

        // Test 5: Get newsletter statistics
        console.log('5. Testing newsletter statistics...');
        const statsResponse = await fetch(`${API_BASE_URL}/stats`);
        const statsData = await statsResponse.json();
        console.log('Status:', statsResponse.status);
        console.log('Response:', statsData);
        console.log('✅ Statistics test completed\n');

        // Test 6: Unsubscribe from newsletter
        console.log('6. Testing newsletter unsubscription...');
        const unsubscribeResponse = await fetch(`${API_BASE_URL}/unsubscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testEmail
            }),
        });

        const unsubscribeData = await unsubscribeResponse.json();
        console.log('Status:', unsubscribeResponse.status);
        console.log('Response:', unsubscribeData);
        console.log('✅ Unsubscribe test completed\n');

        // Test 7: Resubscribe (should work)
        console.log('7. Testing resubscription...');
        const resubscribeResponse = await fetch(`${API_BASE_URL}/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testEmail,
                language: 'en'
            }),
        });

        const resubscribeData = await resubscribeResponse.json();
        console.log('Status:', resubscribeResponse.status);
        console.log('Response:', resubscribeData);
        console.log('✅ Resubscribe test completed\n');

        console.log('🎉 All newsletter tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the tests
testNewsletterAPI(); 