const crypto = require('crypto');

// Generate JWT secrets
const jwtSecret = crypto.randomBytes(64).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');

console.log('🔐 Secure JWT Secrets Generated:');
console.log('');
console.log('JWT_SECRET=' + jwtSecret);
console.log('');
console.log('JWT_REFRESH_SECRET=' + jwtRefreshSecret);
console.log('');
console.log('📝 Copy these to your .env file');
console.log('⚠️  Keep these secrets secure and never commit them to version control!'); 