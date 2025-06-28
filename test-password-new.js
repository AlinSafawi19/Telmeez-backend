require('dotenv').config({ path: '.env.new' });

console.log('🔍 Password Debug Test (New .env)\n');

const password = process.env.EMAIL_PASSWORD;
console.log('Password length:', password ? password.length : 'undefined');
console.log('Password contains @:', password ? password.includes('@') : 'N/A');

if (password) {
    console.log('First 3 chars:', password.substring(0, 3));
    console.log('Last 3 chars:', password.substring(password.length - 3));
    console.log('All chars (masked):', '*'.repeat(password.length));
} 