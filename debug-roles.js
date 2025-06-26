const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/telmeez';

async function debugRoles() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get the UserRole model - using ts-node to load TypeScript
    const UserRole = require('ts-node/register') ? require('./src/models/UserRole').default : require('./src/models/UserRole');

    // Find all roles
    const allRoles = await UserRole.find({});
    console.log('\nAll roles in database:');
    allRoles.forEach(role => {
      console.log(`- ID: ${role._id}, Role: "${role.role}"`);
    });

    // Try different queries for Super Admin
    console.log('\nTrying different queries for Super Admin:');
    
    const exactMatch = await UserRole.findOne({ role: 'Super Admin' });
    console.log('Exact match "Super Admin":', exactMatch ? 'Found' : 'Not found');
    
    const caseInsensitive = await UserRole.findOne({ 
      role: { $regex: /^super\s*admin$/i } 
    });
    console.log('Case insensitive regex match:', caseInsensitive ? 'Found' : 'Not found');
    
    const containsSuper = await UserRole.findOne({ 
      role: { $regex: /super/i } 
    });
    console.log('Contains "super":', containsSuper ? 'Found' : 'Not found');

    const containsAdmin = await UserRole.findOne({ 
      role: { $regex: /admin/i } 
    });
    console.log('Contains "admin":', containsAdmin ? 'Found' : 'Not found');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

debugRoles(); 