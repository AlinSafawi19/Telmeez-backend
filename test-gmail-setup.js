require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔧 Gmail Setup Test\n');

// Check if EMAIL_PASSWORD is set
if (!process.env.EMAIL_PASSWORD) {
    console.log('❌ EMAIL_PASSWORD environment variable is not set!');
    console.log('\n📝 To fix this:');
    console.log('1. Get your Gmail app password:');
    console.log('   - Go to https://myaccount.google.com/');
    console.log('   - Security → 2-Step Verification → App Passwords');
    console.log('   - Generate app password for "Mail"');
    console.log('2. Update your .env file:');
    console.log('   EMAIL_PASSWORD=your_16_character_app_password');
    console.log('3. Update the Gmail address in src/services/emailService.ts');
    process.exit(1);
}

console.log('✅ EMAIL_PASSWORD is set');

// Create Gmail transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // use TLS
    auth: {
        user: 'alinsafawi19@gmail.com', // Using the configured Gmail address
        pass: process.env.EMAIL_PASSWORD
    }
});

async function testGmailConnection() {
    try {
        console.log('\n🔍 Testing Gmail SMTP connection...');
        
        // Verify connection
        await transporter.verify();
        console.log('✅ Gmail SMTP connection successful!');
        
        // Test sending a simple email
        console.log('\n📧 Testing email sending...');
        
        const testMailOptions = {
            from: '"Telmeez Test" <alinsafawi19@gmail.com>', // Using the configured Gmail address
            to: 'alinsafawi19@gmail.com', // This will fail but we can see if auth works
            subject: 'Gmail SMTP Test',
            text: 'This is a test email to verify Gmail SMTP is working.'
        };
        
        try {
            const info = await transporter.sendMail(testMailOptions);
            console.log('✅ Gmail authentication successful!');
            console.log('Message ID:', info.messageId);
            console.log('\n🎉 Gmail setup is working perfectly!');
        } catch (sendError) {
            if (sendError.code === 'EAUTH') {
                console.log('❌ Authentication failed');
                console.log('💡 Make sure you\'re using a Gmail app password, not your regular password');
                console.log('💡 Also check that you\'ve updated the Gmail address in the code');
            } else if (sendError.code === 'EENVELOPE') {
                console.log('⚠️  Connection works but recipient email is invalid (expected for test@example.com)');
                console.log('✅ This means your Gmail configuration is working!');
            } else {
                console.log('❌ Email sending failed:', sendError.message);
            }
        }
        
    } catch (error) {
        console.log('❌ Gmail SMTP connection failed!');
        console.log('Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Possible solutions:');
            console.log('1. Check your internet connection');
            console.log('2. Verify smtp.gmail.com is accessible');
            console.log('3. Check if your firewall is blocking port 587');
        } else if (error.code === 'EAUTH') {
            console.log('\n💡 Authentication failed - check your Gmail app password');
            console.log('\n📝 Steps to fix:');
            console.log('1. Go to https://myaccount.google.com/');
            console.log('2. Security → 2-Step Verification (enable if not already)');
            console.log('3. App Passwords → Generate new password for "Mail"');
            console.log('4. Copy the 16-character password');
            console.log('5. Update your .env file with the new password');
        }
    }
}

// Run the test
testGmailConnection(); 