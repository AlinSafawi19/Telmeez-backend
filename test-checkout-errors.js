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

// Test script to verify billing address validation error handling
const testBillingAddressValidation = () => {
    console.log('Testing billing address validation error handling...');
    
    // Simulate backend validation error response
    const mockBackendResponse = {
        success: false,
        message: 'Validation failed',
        errors: [
            'Valid billing address is required',
            'City is required',
            'State is required',
            'Valid ZIP code is required',
            'Country is required'
        ]
    };
    
    console.log('Mock backend response:', JSON.stringify(mockBackendResponse, null, 2));
    
    // Simulate frontend error mapping logic
    const validationErrors = {};
    
    mockBackendResponse.errors.forEach((error) => {
        if (error.includes('Valid billing address') || error.includes('address')) {
            if (!validationErrors.billingAddress) validationErrors.billingAddress = {};
            validationErrors.billingAddress.address = 'This field is required';
        } else if (error.includes('City')) {
            if (!validationErrors.billingAddress) validationErrors.billingAddress = {};
            validationErrors.billingAddress.city = 'This field is required';
        } else if (error.includes('State')) {
            if (!validationErrors.billingAddress) validationErrors.billingAddress = {};
            validationErrors.billingAddress.state = 'This field is required';
        } else if (error.includes('ZIP code') || error.includes('zip')) {
            if (!validationErrors.billingAddress) validationErrors.billingAddress = {};
            validationErrors.billingAddress.zipCode = 'This field is required';
        } else if (error.includes('Country')) {
            if (!validationErrors.billingAddress) validationErrors.billingAddress = {};
            validationErrors.billingAddress.country = 'This field is required';
        }
    });
    
    console.log('Mapped validation errors:', JSON.stringify(validationErrors, null, 2));
    
    // Check if billing address errors were properly mapped
    if (validationErrors.billingAddress) {
        console.log('✅ Billing address validation errors were successfully mapped!');
        console.log('Expected behavior:');
        console.log('- User should be redirected to step 3 (billing address)');
        console.log('- Individual field errors should be displayed');
        console.log('- General validation message should be shown');
    } else {
        console.log('❌ Billing address validation errors were not mapped correctly');
    }
    
    return validationErrors;
};

// Run the tests
testCheckoutErrors().catch(console.error);
testBillingAddressValidation(); 