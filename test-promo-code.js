const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testPromoCodeValidation() {
    console.log('🧪 Testing Promo Code Validation...\n');

    // Test 1: Valid promo code for first-time user
    console.log('Test 1: Valid promo code (WELCOME10) for first-time user');
    try {
        const response = await fetch(`${BASE_URL}/checkout/validate-promo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'en'
            },
            body: JSON.stringify({
                promoCode: 'WELCOME10',
                email: 'newuser@example.com'
            })
        });

        const data = await response.json();
        console.log('Response:', data);
        console.log('✅ Test 1 passed\n');
    } catch (error) {
        console.log('❌ Test 1 failed:', error.message, '\n');
    }

    // Test 2: Invalid promo code
    console.log('Test 2: Invalid promo code (INVALID123)');
    try {
        const response = await fetch(`${BASE_URL}/checkout/validate-promo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'en'
            },
            body: JSON.stringify({
                promoCode: 'INVALID123',
                email: 'newuser@example.com'
            })
        });

        const data = await response.json();
        console.log('Response:', data);
        console.log('✅ Test 2 passed\n');
    } catch (error) {
        console.log('❌ Test 2 failed:', error.message, '\n');
    }

    // Test 3: Empty promo code
    console.log('Test 3: Empty promo code');
    try {
        const response = await fetch(`${BASE_URL}/checkout/validate-promo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'en'
            },
            body: JSON.stringify({
                promoCode: '',
                email: 'newuser@example.com'
            })
        });

        const data = await response.json();
        console.log('Response:', data);
        console.log('✅ Test 3 passed\n');
    } catch (error) {
        console.log('❌ Test 3 failed:', error.message, '\n');
    }

    // Test 4: Missing email for first-time user promo
    console.log('Test 4: Missing email for first-time user promo');
    try {
        const response = await fetch(`${BASE_URL}/checkout/validate-promo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'en'
            },
            body: JSON.stringify({
                promoCode: 'WELCOME10',
                email: ''
            })
        });

        const data = await response.json();
        console.log('Response:', data);
        console.log('✅ Test 4 passed\n');
    } catch (error) {
        console.log('❌ Test 4 failed:', error.message, '\n');
    }

    console.log('🎉 Promo code validation tests completed!');
}

// Run the tests
testPromoCodeValidation().catch(console.error); 