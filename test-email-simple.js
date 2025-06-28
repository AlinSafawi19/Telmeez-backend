require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔧 Simple Email Test\n');

// Create transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.titan.email',
    port: 465,
    secure: true,
    auth: {
        user: 'contact@telmeezlb.com',
        pass: process.env.EMAIL_PASSWORD
    }
});

async function testConnection() {
    try {
        console.log('Testing connection to smtp.titan.email...');
        await transporter.verify();
        console.log('✅ Connection successful!');
        
        console.log('\nTesting authentication...');
        // Try to send a test email (it will fail due to invalid recipient, but we can see if auth works)
        const info = await transporter.sendMail({
            from: '"Test" <contact@telmeezlb.com>',
            to: 'invalid@example.com',
            subject: 'Test',
            text: 'Test'
        });
        
        console.log('✅ Authentication successful!');
        console.log('Message ID:', info.messageId);
        
    } catch (error) {
        if (error.code === 'EAUTH') {
            console.log('❌ Authentication failed');
            console.log('💡 The password is incorrect or SMTP access is disabled');
            console.log('💡 Try:');
            console.log('   1. Verify the password for contact@telmeezlb.com');
            console.log('   2. Check if you need an app password');
            console.log('   3. Enable SMTP access in Titan settings');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('❌ Connection refused');
            console.log('💡 Check your internet connection and firewall');
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

testConnection(); 