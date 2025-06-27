require('dotenv').config();
console.log('🔍 Password Debug Test\n');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);

const password = process.env.EMAIL_PASSWORD;
console.log('Password length:', password ? password.length : 'undefined');
console.log('Password contains @:', password ? password.includes('@') : 'N/A');
console.log('Password contains quotes:', password ? password.includes('"') : 'N/A');
console.log('Password starts with quote:', password ? password.startsWith('"') : 'N/A');
console.log('Password ends with quote:', password ? password.endsWith('"') : 'N/A');

// Show first and last few characters (safely)
if (password) {
    console.log('First 3 chars:', password.substring(0, 3));
    console.log('Last 3 chars:', password.substring(password.length - 3));
    console.log('All chars (masked):', '*'.repeat(password.length));
} 