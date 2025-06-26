const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/telmeez';

async function checkDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log('\n=== Available Collections ===');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Check users collection
    console.log('\n=== Users Collection ===');
    const users = await db.collection('users').find({}).toArray();
    console.log(`Total users: ${users.length}`);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log(`- ID: ${user._id}`);
        console.log(`- Name: ${user.firstName} ${user.lastName}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Phone: ${user.phone}`);
        console.log(`- Role: ${user.role}`);
        console.log(`- Active: ${user.isActive}`);
        console.log(`- Email Verified: ${user.emailVerified}`);
        console.log(`- Created: ${user.createdAt}`);
      });
    }

    // Check subscriptions collection
    console.log('\n=== Subscriptions Collection ===');
    const subscriptions = await db.collection('subscriptions').find({}).toArray();
    console.log(`Total subscriptions: ${subscriptions.length}`);
    
    if (subscriptions.length > 0) {
      for (let i = 0; i < subscriptions.length; i++) {
        const sub = subscriptions[i];
        console.log(`\nSubscription ${i + 1}:`);
        console.log(`- ID: ${sub._id}`);
        console.log(`- User: ${sub.user}`);
        console.log(`- Plan ID: ${sub.plan}`);
        
        // Look up plan name
        const plan = await db.collection('plans').findOne({ _id: new mongoose.Types.ObjectId(sub.plan) });
        console.log(`- Plan Name: ${plan ? plan.name : 'Unknown'}`);
        
        console.log(`- Status: ${sub.status}`);
        console.log(`- Billing Cycle: ${sub.billingCycle}`);
        console.log(`- Total Amount: $${sub.totalAmount}`);
        console.log(`- Trial Start: ${sub.trialStart ? new Date(sub.trialStart).toLocaleDateString() : 'N/A'}`);
        console.log(`- Trial End: ${sub.trialEnd ? new Date(sub.trialEnd).toLocaleDateString() : 'N/A'}`);
        console.log(`- Current Period Start: ${new Date(sub.currentPeriodStart).toLocaleDateString()}`);
        console.log(`- Current Period End: ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`);
        console.log(`- Created: ${new Date(sub.createdAt).toLocaleDateString()}`);
      }
    }

    // Check payments collection
    console.log('\n=== Payments Collection ===');
    const payments = await db.collection('payments').find({}).toArray();
    console.log(`Total payments: ${payments.length}`);
    
    if (payments.length > 0) {
      payments.forEach((payment, index) => {
        console.log(`\nPayment ${index + 1}:`);
        console.log(`- ID: ${payment._id}`);
        console.log(`- User: ${payment.user}`);
        console.log(`- Amount: $${payment.amount}`);
        console.log(`- Status: ${payment.status}`);
        console.log(`- Payment Method: ${payment.paymentMethod}`);
        console.log(`- Created: ${payment.createdAt}`);
      });
    }

    // Check billing addresses collection
    console.log('\n=== Billing Addresses Collection ===');
    const addresses = await db.collection('billingaddresses').find({}).toArray();
    console.log(`Total billing addresses: ${addresses.length}`);

    // Check email verifications collection
    console.log('\n=== Email Verifications Collection ===');
    const verifications = await db.collection('emailverifications').find({}).toArray();
    console.log(`Total email verifications: ${verifications.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkDatabase(); 