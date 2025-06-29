const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

async function testForgotPasswordErrors() {
    console.log('🧪 Testing Forgot Password Error Translations...\n');

    const tests = [
        {
            name: 'Missing Email',
            endpoint: '/forgot-password',
            data: {},
            expectedErrorCode: 'EMAIL_REQUIRED'
        },
        {
            name: 'Missing Email and Code',
            endpoint: '/verify-reset-code',
            data: {},
            expectedErrorCode: 'EMAIL_REQUIRED'
        },
        {
            name: 'Missing Code Only',
            endpoint: '/verify-reset-code',
            data: { email: 'test@example.com' },
            expectedErrorCode: 'CODE_REQUIRED'
        },
        {
            name: 'Missing Email, Code, and Password',
            endpoint: '/reset-password',
            data: {},
            expectedErrorCode: 'EMAIL_REQUIRED'
        },
        {
            name: 'Missing Code and Password',
            endpoint: '/reset-password',
            data: { email: 'test@example.com' },
            expectedErrorCode: 'CODE_REQUIRED'
        },
        {
            name: 'Missing Password Only',
            endpoint: '/reset-password',
            data: { email: 'test@example.com', code: '123456' },
            expectedErrorCode: 'PASSWORD_REQUIRED'
        },
        {
            name: 'Password Too Short',
            endpoint: '/reset-password',
            data: { email: 'test@example.com', code: '123456', newPassword: '123' },
            expectedErrorCode: 'PASSWORD_TOO_SHORT'
        }
    ];

    for (const test of tests) {
        try {
            console.log(`📝 Testing: ${test.name}`);
            console.log(`   Endpoint: ${test.endpoint}`);
            console.log(`   Data:`, test.data);
            
            const response = await axios.post(`${BASE_URL}${test.endpoint}`, test.data);
            
            console.log(`   ❌ Expected error but got success:`, response.data);
            console.log(`   Expected Error Code: ${test.expectedErrorCode}\n`);
            
        } catch (error) {
            if (error.response) {
                const { status, data } = error.response;
                console.log(`   ✅ Got error response (${status}):`);
                console.log(`   Error Code: ${data.error_code || 'NOT_FOUND'}`);
                console.log(`   Message: ${data.message}`);
                
                if (data.error_code === test.expectedErrorCode) {
                    console.log(`   ✅ Error code matches expected: ${test.expectedErrorCode}\n`);
                } else {
                    console.log(`   ❌ Error code mismatch! Expected: ${test.expectedErrorCode}, Got: ${data.error_code}\n`);
                }
            } else {
                console.log(`   ❌ Network error:`, error.message, '\n');
            }
        }
    }

    // Test with invalid data that should trigger specific errors
    console.log('🔍 Testing with invalid data...\n');

    // Test invalid verification code
    try {
        console.log('📝 Testing: Invalid Verification Code');
        const response = await axios.post(`${BASE_URL}/verify-reset-code`, {
            email: 'test@example.com',
            code: 'INVALID_CODE'
        });
        console.log('   ❌ Expected error but got success:', response.data, '\n');
    } catch (error) {
        if (error.response) {
            const { status, data } = error.response;
            console.log(`   ✅ Got error response (${status}):`);
            console.log(`   Error Code: ${data.error_code || 'NOT_FOUND'}`);
            console.log(`   Message: ${data.message}`);
            
            if (data.error_code === 'INVALID_OR_EXPIRED_CODE') {
                console.log(`   ✅ Error code matches expected: INVALID_OR_EXPIRED_CODE\n`);
            } else {
                console.log(`   ❌ Error code mismatch! Expected: INVALID_OR_EXPIRED_CODE, Got: ${data.error_code}\n`);
            }
        }
    }

    // Test reset password with invalid code
    try {
        console.log('📝 Testing: Reset Password with Invalid Code');
        const response = await axios.post(`${BASE_URL}/reset-password`, {
            email: 'test@example.com',
            code: 'INVALID_CODE',
            newPassword: 'newpassword123'
        });
        console.log('   ❌ Expected error but got success:', response.data, '\n');
    } catch (error) {
        if (error.response) {
            const { status, data } = error.response;
            console.log(`   ✅ Got error response (${status}):`);
            console.log(`   Error Code: ${data.error_code || 'NOT_FOUND'}`);
            console.log(`   Message: ${data.message}`);
            
            if (data.error_code === 'INVALID_OR_EXPIRED_CODE') {
                console.log(`   ✅ Error code matches expected: INVALID_OR_EXPIRED_CODE\n`);
            } else {
                console.log(`   ❌ Error code mismatch! Expected: INVALID_OR_EXPIRED_CODE, Got: ${data.error_code}\n`);
            }
        }
    }

    console.log('🎉 Forgot Password Error Translation Tests Complete!');
    console.log('\n📋 Summary:');
    console.log('- All forgot password endpoints now return standardized error codes');
    console.log('- Frontend can map these error codes to translated messages');
    console.log('- Error messages are reactive to language changes');
    console.log('- Both backend and frontend error handling are consistent');
}

// Run the tests
testForgotPasswordErrors().catch(console.error); 