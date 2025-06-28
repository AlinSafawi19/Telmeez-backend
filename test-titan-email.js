const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🔧 Titan Email Configuration Test\n');

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

// Create transporter for Titan Email
const transporter = nodemailer.createTransport({
    host: 'smtp.titan.email',
    port: 465,
    secure: true, // use SSL/TLS
    auth: {
        user: 'contact@telmeezlb.com',
        pass: process.env.EMAIL_PASSWORD
    }
});

async function testTitanEmail() {
    try {
        console.log('\n🔍 Testing Titan Email server connection...');
        console.log('📧 SMTP Server: smtp.titan.email');
        console.log('🔌 Port: 465');
        console.log('🔒 Security: SSL/TLS');
        console.log('👤 User: contact@telmeezlb.com');
        
        // Verify connection
        await transporter.verify();
        console.log('✅ Titan Email server connection successful!');
        
        // Test sending a verification email
        console.log('\n📧 Testing verification email sending...');
        
        const testMailOptions = {
            from: '"Telmeez" <contact@telmeezlb.com>',
            to: 'alinsafawi19@gmail.com', // This will fail but we can see the connection works
            subject: 'Telmeez Verification Code Test',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Test Verification Email</title>
                </head>
                <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #4c51bf; text-align: center; margin-bottom: 30px;">Telmeez Verification Code</h1>
                        <div style="text-align: center; background-color: #f7fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                            <span style="font-size: 32px; font-weight: bold; color: #4c51bf; letter-spacing: 8px; font-family: monospace;">123456</span>
                        </div>
                        <p style="color: #718096; text-align: center; margin: 20px 0;">
                            This is a test verification code. The email service is working correctly!
                        </p>
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="color: #a0aec0; font-size: 12px;">
                                © 2024 Telmeez. All rights reserved.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        
        try {
            const info = await transporter.sendMail(testMailOptions);
            console.log('✅ Verification email test successful!');
            console.log('📧 Message ID:', info.messageId);
            console.log('📤 From:', testMailOptions.from);
            console.log('📥 To:', testMailOptions.to);
        } catch (sendError) {
            if (sendError.code === 'EAUTH') {
                console.log('❌ Authentication failed - check your EMAIL_PASSWORD');
                console.log('💡 Make sure you\'re using the correct password for contact@telmeezlb.com');
            } else if (sendError.code === 'EENVELOPE') {
                console.log('⚠️  Connection works but recipient email is invalid (expected for alinsafawi19@gmail.com)');
                console.log('✅ This means your Titan Email configuration is working!');
                console.log('📧 You can now send verification emails to real users.');
            } else {
                console.log('❌ Email sending failed:', sendError.message);
            }
        }
        
    } catch (error) {
        console.log('❌ Titan Email server connection failed!');
        console.log('Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Possible solutions:');
            console.log('1. Check your internet connection');
            console.log('2. Verify smtp.titan.email is accessible');
            console.log('3. Check if your firewall is blocking port 465');
            console.log('4. Try using a different network');
        } else if (error.code === 'EAUTH') {
            console.log('\n💡 Authentication failed - check your EMAIL_PASSWORD');
            console.log('🔐 Make sure you\'re using the correct password for contact@telmeezlb.com');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('\n💡 Connection timeout - check if Titan Email servers are accessible');
        }
    }
}

// Run the test
testTitanEmail(); 