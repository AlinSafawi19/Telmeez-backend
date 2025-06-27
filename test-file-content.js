const fs = require('fs');

try {
    const content = fs.readFileSync('.env', 'utf8');
    console.log('Raw content:', JSON.stringify(content));
    console.log('Lines:', content.split('\n').length);
    console.log('First line:', JSON.stringify(content.split('\n')[0]));
} catch (error) {
    console.error('Error reading file:', error.message);
} 