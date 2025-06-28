const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./dist/models/User').default;
const UserRole = require('./dist/models/UserRole').default;

async function createTestUser() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telmeez');
        console.log('✅ Connected to database');

        // Find or create admin role
        let adminRole = await UserRole.findOne({ name: 'admin' });
        if (!adminRole) {
            adminRole = await UserRole.create({
                name: 'admin',
                permissions: ['read', 'write', 'delete', 'admin']
            });
            console.log('✅ Created admin role');
        } else {
            console.log('✅ Found existing admin role');
        }

        // Check if test user already exists
        const existingUser = await User.findOne({ email: 'test@telmeez.com' });
        if (existingUser) {
            console.log('✅ Test user already exists');
            console.log('Email: test@telmeez.com');
            console.log('Password: testpassword123');
            return;
        }

        // Create test user
        const testUser = await User.create({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@telmeez.com',
            phone: '+1234567890',
            institutionName: 'Test Institution',
            password: 'testpassword123',
            role: adminRole._id,
            isActive: true
        });

        console.log('✅ Test user created successfully!');
        console.log('Email: test@telmeez.com');
        console.log('Password: testpassword123');
        console.log('User ID:', testUser._id);

    } catch (error) {
        console.error('❌ Error creating test user:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from database');
    }
}

// Run the script
createTestUser(); 