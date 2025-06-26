const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/telmeez';

async function checkUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get the User model
    const User = require('./src/models/User').default;

    // Find all users
    const users = await User.find({}).populate('role');
    console.log('\n=== All Users in Database ===');
    
    if (users.length === 0) {
      console.log('No users found in database');
    } else {
      users.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log(`- ID: ${user._id}`);
        console.log(`- Name: ${user.firstName} ${user.lastName}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Phone: ${user.phone}`);
        console.log(`- Role: ${user.role?.role || 'Unknown'}`);
        console.log(`- Active: ${user.isActive}`);
        console.log(`- Email Verified: ${user.emailVerified}`);
        console.log(`- Created: ${user.createdAt}`);
      });
    }

    // Check specific user by email
    const testEmail = 'test@example.com'; // Change this to the email you want to check
    const specificUser = await User.findOne({ email: testEmail }).populate('role');
    
    if (specificUser) {
      console.log(`\n=== User Found: ${testEmail} ===`);
      console.log(`- Name: ${specificUser.firstName} ${specificUser.lastName}`);
      console.log(`- Role: ${specificUser.role?.role}`);
      console.log(`- Active: ${specificUser.isActive}`);
      console.log(`- Email Verified: ${specificUser.emailVerified}`);
    } else {
      console.log(`\n=== User Not Found: ${testEmail} ===`);
    }

    // Count total users
    const userCount = await User.countDocuments();
    console.log(`\n=== Summary ===`);
    console.log(`Total users in database: ${userCount}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkUsers(); 