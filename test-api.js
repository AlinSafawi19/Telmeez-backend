const axios = require('axios');

const BASE_URL = process.env.BASE_URL;

// Test data
const testCheckoutData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  institutionName: 'Test University',
  password: 'password123',
  billingAddress: {
    address: '123 Main St',
    address2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'lebanon',
    customCountry: ''
  },
  paymentInfo: {
    cardNumber: '4242424242424242',
    expiryDate: '12/25',
    cvv: '123'
  },
  planId: '507f1f77bcf86cd799439011', // This should be a real plan ID from your database
  billingCycle: 'monthly',
  addOns: [
    {
      type: 'admin',
      quantity: 2,
      price: 1.50
    },
    {
      type: 'teacher',
      quantity: 5,
      price: 0.75
    }
  ],
  totalAmount: 55.25,
  promoCode: 'WELCOME10',
  discount: 10,
  paymentMethod: 'card'
};

async function testAPI() {
  console.log('🚀 Starting API Tests...\n');

  try {
    // Test 1: Get Plans
    console.log('📋 Test 1: Getting Plans');
    try {
      const plansResponse = await axios.get(`${BASE_URL}/api/checkout/plans`);
      console.log('✅ Plans retrieved successfully');
      console.log('Plans:', plansResponse.data.data);
      
      // Update the test data with a real plan ID
      if (plansResponse.data.data.length > 0) {
        testCheckoutData.planId = plansResponse.data.data[0]._id;
        console.log(`Updated plan ID to: ${testCheckoutData.planId}`);
      }
    } catch (error) {
      console.log('❌ Failed to get plans:', error.response?.data || error.message);
    }
    console.log('');

    // Test 2: Get Payment Methods
    console.log('💳 Test 2: Getting Payment Methods');
    try {
      const paymentMethodsResponse = await axios.get(`${BASE_URL}/api/checkout/payment-methods`);
      console.log('✅ Payment methods retrieved successfully');
      console.log('Payment methods:', paymentMethodsResponse.data.data);
    } catch (error) {
      console.log('❌ Failed to get payment methods:', error.response?.data || error.message);
    }
    console.log('');

    // Test 3: Validate Promo Code
    console.log('🎫 Test 3: Validating Promo Code');
    try {
      const promoResponse = await axios.post(`${BASE_URL}/api/checkout/validate-promo`, {
        promoCode: 'WELCOME10'
      });
      console.log('✅ Promo code validation successful');
      console.log('Promo code data:', promoResponse.data.data);
    } catch (error) {
      console.log('❌ Promo code validation failed:', error.response?.data || error.message);
    }
    console.log('');

    // Test 4: Validate Invalid Promo Code
    console.log('🚫 Test 4: Validating Invalid Promo Code');
    try {
      const invalidPromoResponse = await axios.post(`${BASE_URL}/api/checkout/validate-promo`, {
        promoCode: 'INVALID123'
      });
      console.log('❌ This should have failed');
    } catch (error) {
      console.log('✅ Invalid promo code correctly rejected');
      console.log('Error message:', error.response?.data?.message);
    }
    console.log('');

    // Test 5: Process Checkout with Card Payment
    console.log('💳 Test 5: Processing Checkout with Card Payment');
    console.log('Note: New users will be assigned Super Admin role by default');
    try {
      const checkoutResponse = await axios.post(`${BASE_URL}/api/checkout`, testCheckoutData);
      console.log('✅ Checkout processed successfully');
      console.log('Checkout result:', checkoutResponse.data.data);
    } catch (error) {
      console.log('❌ Checkout failed:', error.response?.data || error.message);
    }
    console.log('');

    // Test 6: Process Checkout with Bank Transfer
    console.log('🏦 Test 6: Processing Checkout with Bank Transfer');
    try {
      const bankTransferData = { ...testCheckoutData };
      bankTransferData.email = 'bank.transfer@example.com';
      bankTransferData.paymentMethod = 'bank_transfer';
      
      const bankTransferResponse = await axios.post(`${BASE_URL}/api/checkout`, bankTransferData);
      console.log('✅ Bank transfer checkout processed successfully');
      console.log('Payment instructions:', bankTransferResponse.data.data.paymentInstructions);
    } catch (error) {
      console.log('❌ Bank transfer checkout failed:', error.response?.data || error.message);
    }
    console.log('');

    // Test 7: Process Checkout with Cash on Delivery
    console.log('💵 Test 7: Processing Checkout with Cash on Delivery');
    try {
      const cashOnDeliveryData = { ...testCheckoutData };
      cashOnDeliveryData.email = 'cash.delivery@example.com';
      cashOnDeliveryData.paymentMethod = 'cash_on_delivery';
      
      const cashOnDeliveryResponse = await axios.post(`${BASE_URL}/api/checkout`, cashOnDeliveryData);
      console.log('✅ Cash on delivery checkout processed successfully');
      console.log('Payment instructions:', cashOnDeliveryResponse.data.data.paymentInstructions);
    } catch (error) {
      console.log('❌ Cash on delivery checkout failed:', error.response?.data || error.message);
    }
    console.log('');

    // Test 8: Test Duplicate Email
    console.log('📧 Test 8: Testing Duplicate Email');
    try {
      const duplicateResponse = await axios.post(`${BASE_URL}/api/checkout`, testCheckoutData);
      console.log('❌ This should have failed due to duplicate email');
    } catch (error) {
      console.log('✅ Duplicate email correctly rejected');
      console.log('Error message:', error.response?.data?.message);
    }
    console.log('');

    // Test 9: Test Missing Required Fields
    console.log('⚠️ Test 9: Testing Missing Required Fields');
    try {
      const incompleteData = { ...testCheckoutData };
      delete incompleteData.firstName;
      delete incompleteData.email;
      
      const incompleteResponse = await axios.post(`${BASE_URL}/api/checkout`, incompleteData);
      console.log('❌ This should have failed due to missing fields');
    } catch (error) {
      console.log('✅ Missing fields correctly rejected');
      console.log('Error message:', error.response?.data?.message);
    }
    console.log('');

    // Test 10: Test Invalid Plan ID
    console.log('🔍 Test 10: Testing Invalid Plan ID');
    try {
      const invalidPlanData = { ...testCheckoutData };
      invalidPlanData.planId = 'invalid-plan-id';
      
      const invalidPlanResponse = await axios.post(`${BASE_URL}/api/checkout`, invalidPlanData);
      console.log('❌ This should have failed due to invalid plan');
    } catch (error) {
      console.log('✅ Invalid plan correctly rejected');
      console.log('Error message:', error.response?.data?.message);
    }
    console.log('');

    console.log('🎉 All tests completed!');

  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
}

// Run the tests
testAPI();

// Check if axios is available
try {
  require.resolve('axios');
  testAPI();
} catch (e) {
  console.log('📦 Installing axios for testing...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install axios', { stdio: 'inherit' });
    console.log('✅ Axios installed successfully');
    testAPI();
  } catch (installError) {
    console.error('❌ Failed to install axios:', installError.message);
    console.log('Please run: npm install axios');
  }
} 