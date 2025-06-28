require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔧 Alternative Email Settings Test\n');

// Test different configurations
const configs = [
    {
        name: 'Default (Port 465, SSL)',
        host: 'smtp.titan.email',
        port: 465,
        secure: true
    },
    {
        name: 'Port 587 (TLS)',
        host: 'smtp.titan.email',
        port: 587,
        secure: false,
        requireTLS: true
    },
    {
        name: 'Port 25 (No SSL)',
        host: 'smtp.titan.email',
        port: 25,
        secure: false
    }
];

async function testConfig(config) {
    console.log(`\n🧪 Testing: ${config.name}`);
    
    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        requireTLS: config.requireTLS,
        auth: {
            user: 'contact@telmeezlb.com',
            pass: process.env.EMAIL_PASSWORD
        }
    });

    try {
        await transporter.verify();
        console.log(`✅ ${config.name} - Connection successful!`);
        
        // Try to send a test email
        const info = await transporter.sendMail({
            from: '"Test" <contact@telmeezlb.com>',
            to: 'test@example.com',
            subject: 'Test Email',
            text: 'This is a test email'
        });
        
        console.log(`✅ ${config.name} - Authentication successful!`);
        console.log(`   Message ID: ${info.messageId}`);
        return true;
        
    } catch (error) {
        if (error.code === 'EAUTH') {
            console.log(`❌ ${config.name} - Authentication failed`);
        } else if (error.code === 'ECONNREFUSED') {
            console.log(`❌ ${config.name} - Connection refused`);
        } else {
            console.log(`❌ ${config.name} - Error: ${error.message}`);
        }
        return false;
    }
}

async function runTests() {
    console.log('Testing different SMTP configurations for Titan...\n');
    
    for (const config of configs) {
        const success = await testConfig(config);
        if (success) {
            console.log(`\n🎉 Found working configuration: ${config.name}`);
            console.log('Use these settings in your email service:');
            console.log(`Host: ${config.host}`);
            console.log(`Port: ${config.port}`);
            console.log(`Secure: ${config.secure}`);
            if (config.requireTLS) {
                console.log('Require TLS: true');
            }
            break;
        }
    }
    
    console.log('\n💡 If all tests fail, the issue is likely:');
    console.log('1. SMTP access is disabled in your Titan account');
    console.log('2. The password is incorrect for SMTP (even if it works for webmail)');
    console.log('3. Titan has restrictions on your account');
}

runTests(); 