const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

// Test different error scenarios
async function testCheckoutErrors() {
    console.log('🧪 Testing Checkout Error Handling...\n');

    // Test 1: Missing required fields
    console.log('1. Testing missing required fields...');
    try {
        const response = await fetch(`${BASE_URL}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // Missing required fields
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                password: '',
                planId: 'invalid-plan-id'
            })
        });
        const data = await response.json();
        console.log('   Response:', data.message);
        console.log('   Status:', response.status);
    } catch (error) {
        console.log('   Error:', error.message);
    }

    // Test 2: Invalid plan ID
    console.log('\n2. Testing invalid plan ID...');
    try {
        const response = await fetch(`${BASE_URL}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@example.com',
                phone: '+1234567890',
                password: 'password123',
                planId: 'invalid-plan-id',
                billingAddress: {
                    address: '123 Test St',
                    city: 'Test City',
                    state: 'Test State',
                    zipCode: '12345',
                    country: 'lebanon'
                },
                paymentInfo: {
                    cardNumber: '4242424242424242',
                    expiryDate: '12/25',
                    cvv: '123'
                },
                billingCycle: 'monthly',
                addOns: [],
                totalAmount: 49,
                paymentMethod: 'card'
            })
        });
        const data = await response.json();
        console.log('   Response:', data.message);
        console.log('   Status:', response.status);
    } catch (error) {
        console.log('   Error:', error.message);
    }

    // Test 3: Duplicate email
    console.log('\n3. Testing duplicate email...');
    try {
        const response = await fetch(`${BASE_URL}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'John',
                lastName: 'Doe',
                email: 'admin@telmeezlb.com', // Use an email that might exist
                phone: '+1234567890',
                password: 'password123',
                planId: '507f1f77bcf86cd799439011', // Use a valid plan ID from your database
                billingAddress: {
                    address: '123 Test St',
                    city: 'Test City',
                    state: 'Test State',
                    zipCode: '12345',
                    country: 'lebanon'
                },
                paymentInfo: {
                    cardNumber: '4242424242424242',
                    expiryDate: '12/25',
                    cvv: '123'
                },
                billingCycle: 'monthly',
                addOns: [],
                totalAmount: 49,
                paymentMethod: 'card'
            })
        });
        const data = await response.json();
        console.log('   Response:', data.message);
        console.log('   Status:', response.status);
    } catch (error) {
        console.log('   Error:', error.message);
    }

    // Test 4: Invalid promo code
    console.log('\n4. Testing invalid promo code...');
    try {
        const response = await fetch(`${BASE_URL}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'John',
                lastName: 'Doe',
                email: 'test2@example.com',
                phone: '+1234567890',
                password: 'password123',
                planId: '507f1f77bcf86cd799439011',
                billingAddress: {
                    address: '123 Test St',
                    city: 'Test City',
                    state: 'Test State',
                    zipCode: '12345',
                    country: 'lebanon'
                },
                paymentInfo: {
                    cardNumber: '4242424242424242',
                    expiryDate: '12/25',
                    cvv: '123'
                },
                billingCycle: 'monthly',
                addOns: [],
                totalAmount: 49,
                promoCode: 'INVALID_CODE',
                discount: 10,
                paymentMethod: 'card'
            })
        });
        const data = await response.json();
        console.log('   Response:', data.message);
        console.log('   Status:', response.status);
    } catch (error) {
        console.log('   Error:', error.message);
    }

    console.log('\n✅ Error handling tests completed!');
    console.log('\n📝 Frontend should now handle these errors gracefully with:');
    console.log('   - Clear error messages');
    console.log('   - Prominent error display');
    console.log('   - Retry functionality');
    console.log('   - Auto-scroll to error');
    console.log('   - Error clearing on user input');
}

// Run the tests
testCheckoutErrors().catch(console.error); 