const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🔧 Email Connection Test\n');

// Check if EMAIL_PASSWORD is set
if (!process.env.EMAIL_PASSWORD) {
    console.log('❌ EMAIL_PASSWORD environment variable is not set!');
    console.log('\n📝 To fix this:');
    console.log('1. Create a .env file in the backend root directory');
    console.log('2. Add your Titan email password:');
    console.log('   EMAIL_PASSWORD=your_actual_titan_email_password');
    console.log('\n🔐 Make sure to use your actual Titan email password for contact@telmeezlb.com');
    process.exit(1);
}

console.log('✅ EMAIL_PASSWORD is set');

// Create transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.titan.email',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'contact@telmeezlb.com',
        pass: process.env.EMAIL_PASSWORD
    }
});

async function testEmailConnection() {
    try {
        console.log('\n🔍 Testing email server connection...');
        
        // Verify connection
        await transporter.verify();
        console.log('✅ Email server connection successful!');
        
        // Test sending a simple email
        console.log('\n📧 Testing email sending...');
        
        const testMailOptions = {
            from: '"Telmeez Test" <contact@telmeezlb.com>',
            to: 'test@example.com', // This will fail but we can see the connection works
            subject: 'Test Email Connection',
            text: 'This is a test email to verify the connection works.'
        };
        
        try {
            const info = await transporter.sendMail(testMailOptions);
            console.log('✅ Email sending test successful!');
            console.log('Message ID:', info.messageId);
        } catch (sendError) {
            if (sendError.code === 'EAUTH') {
                console.log('❌ Authentication failed - check your EMAIL_PASSWORD');
                console.log('💡 Make sure you\'re using the correct password for contact@telmeezlb.com');
            } else if (sendError.code === 'EENVELOPE') {
                console.log('⚠️  Connection works but recipient email is invalid (expected for test@example.com)');
                console.log('✅ This means your email configuration is working!');
            } else {
                console.log('❌ Email sending failed:', sendError.message);
            }
        }
        
    } catch (error) {
        console.log('❌ Email server connection failed!');
        console.log('Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Possible solutions:');
            console.log('1. Check your internet connection');
            console.log('2. Verify smtp.titan.email is accessible');
            console.log('3. Check if your firewall is blocking port 465');
        } else if (error.code === 'EAUTH') {
            console.log('\n💡 Authentication failed - check your EMAIL_PASSWORD');
        }
    }
}

// Run the test
testEmailConnection(); 