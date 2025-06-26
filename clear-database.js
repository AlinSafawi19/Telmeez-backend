const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/telmeez';

async function clearDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Collections to clear (user data)
    const collectionsToClear = [
      'users',
      'subscriptions', 
      'payments',
      'billingaddresses',
      'paymentdetails',
      'emailverifications',
      'promocodeusages'
    ];

    // Collections to preserve (system data)
    const collectionsToPreserve = [
      'plans',
      'userroles',
      'promo_codes'
    ];

    console.log('\n=== Clearing User Data ===');
    
    for (const collectionName of collectionsToClear) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        
        if (count > 0) {
          await collection.deleteMany({});
          console.log(`✅ Cleared ${count} documents from ${collectionName}`);
        } else {
          console.log(`ℹ️  No documents in ${collectionName}`);
        }
      } catch (error) {
        console.log(`❌ Error clearing ${collectionName}:`, error.message);
      }
    }

    console.log('\n=== Preserving System Data ===');
    for (const collectionName of collectionsToPreserve) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`✅ Preserved ${count} documents in ${collectionName}`);
      } catch (error) {
        console.log(`ℹ️  Collection ${collectionName} not found`);
      }
    }

    console.log('\n=== Database Clear Summary ===');
    const allCollections = await db.listCollections().toArray();
    
    for (const collection of allCollections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`${collection.name}: ${count} documents`);
    }

    console.log('\n✅ Database cleared successfully!');
    console.log('📝 User data has been removed');
    console.log('🔒 System data (plans, roles, promo codes) has been preserved');

  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Ask for confirmation
console.log('⚠️  WARNING: This will delete all user data!');
console.log('📋 This will clear: users, subscriptions, payments, billing addresses, etc.');
console.log('🔒 This will preserve: plans, user roles, promo codes');
console.log('\nTo proceed, run: node clear-database.js --confirm');

if (process.argv.includes('--confirm')) {
  clearDatabase();
} else {
  console.log('\n❌ Database clear cancelled. Add --confirm flag to proceed.');
} 