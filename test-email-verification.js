const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api/checkout';

async function testEmailVerification() {
    console.log('🧪 Testing Email Verification System\n');

    const testEmail = 'test@example.com';

    try {
        // Test 1: Send verification code
        console.log('1️⃣ Testing: Send verification code');
        const sendResponse = await fetch(`${BASE_URL}/send-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'en'
            },
            body: JSON.stringify({
                email: testEmail
            })
        });

        const sendData = await sendResponse.json();
        
        if (sendData.success) {
            console.log('✅ Verification code sent successfully');
            console.log(`📧 Email: ${sendData.data.email}`);
        } else {
            console.log('❌ Failed to send verification code');
            console.log(`Error: ${sendData.message}`);
            return;
        }

        // Test 2: Try to verify with invalid code
        console.log('\n2️⃣ Testing: Verify with invalid code');
        const invalidVerifyResponse = await fetch(`${BASE_URL}/verify-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'en'
            },
            body: JSON.stringify({
                email: testEmail,
                code: '000000'
            })
        });

        const invalidVerifyData = await invalidVerifyResponse.json();
        
        if (!invalidVerifyData.success) {
            console.log('✅ Invalid code correctly rejected');
            console.log(`Error: ${invalidVerifyData.message}`);
        } else {
            console.log('❌ Invalid code was incorrectly accepted');
            return;
        }

        // Test 3: Test with missing email
        console.log('\n3️⃣ Testing: Send verification code without email');
        const noEmailResponse = await fetch(`${BASE_URL}/send-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'en'
            },
            body: JSON.stringify({})
        });

        const noEmailData = await noEmailResponse.json();
        
        if (!noEmailData.success) {
            console.log('✅ Missing email correctly rejected');
            console.log(`Error: ${noEmailData.message}`);
        } else {
            console.log('❌ Missing email was incorrectly accepted');
            return;
        }

        // Test 4: Test with invalid email format
        console.log('\n4️⃣ Testing: Send verification code with invalid email format');
        const invalidEmailResponse = await fetch(`${BASE_URL}/send-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'en'
            },
            body: JSON.stringify({
                email: 'invalid-email'
            })
        });

        const invalidEmailData = await invalidEmailResponse.json();
        
        if (!invalidEmailData.success) {
            console.log('✅ Invalid email format correctly rejected');
            console.log(`Error: ${invalidEmailData.message}`);
        } else {
            console.log('❌ Invalid email format was incorrectly accepted');
            return;
        }

        // Test 5: Test Arabic language support
        console.log('\n5️⃣ Testing: Arabic language support');
        const arabicResponse = await fetch(`${BASE_URL}/send-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'ar'
            },
            body: JSON.stringify({
                email: 'test-arabic@example.com'
            })
        });

        const arabicData = await arabicResponse.json();
        
        if (arabicData.success) {
            console.log('✅ Arabic language support working');
        } else {
            console.log('❌ Arabic language support failed');
            console.log(`Error: ${arabicData.message}`);
        }

        // Test 6: Test French language support
        console.log('\n6️⃣ Testing: French language support');
        const frenchResponse = await fetch(`${BASE_URL}/send-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'fr'
            },
            body: JSON.stringify({
                email: 'test-french@example.com'
            })
        });

        const frenchData = await frenchResponse.json();
        
        if (frenchData.success) {
            console.log('✅ French language support working');
        } else {
            console.log('❌ French language support failed');
            console.log(`Error: ${frenchData.message}`);
        }

        console.log('\n🎉 All tests completed!');
        console.log('\n📝 Note: To test actual verification, you need to:');
        console.log('1. Use a real email address');
        console.log('2. Check the email for the verification code');
        console.log('3. Use the actual code to test verification');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.log('\n💡 Make sure the server is running on http://localhost:5000');
    }
}

// Run the tests
testEmailVerification(); 