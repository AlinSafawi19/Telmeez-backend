import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '../models/Plan';
import UserRole from '../models/UserRole';
import PromoCode from '../models/PromoCode';

dotenv.config();

const MONGO_URI = process.env['MONGO_URI'] || 'mongodb://localhost:27017/telmeez';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for individuals or small teams getting started.',
    monthlyPrice: 49,
    currency: 'USD',
    discount_annual: 20,
    maxStorage: '10 GB',
    maxUsers: {
      admin: 3,
      teacher: 25,
      student: 250,
      parent: 125
    }
  },
  {
    name: 'Standard',
    description: 'For growing teams that need more features and flexibility.',
    monthlyPrice: 99,
    currency: 'USD',
    discount_annual: 20,
    maxStorage: '100 GB',
    maxUsers: {
      admin: 10,
      teacher: 150,
      student: 1500,
      parent: 750
    },
    recommended: true
  },
  {
    name: 'Enterprise',
    description: 'Best for large organizations with custom needs.',
    monthlyPrice: 299,
    currency: 'USD',
    discount_annual: 20,
    maxStorage: 'unlimited',
    maxUsers: {
      admin: 'unlimited',
      teacher: 'unlimited',
      student: 'unlimited',
      parent: 'unlimited'
    }
  }
];

const userRoles = [
  { role: 'Super Admin' },
  { role: 'Admin' },
  { role: 'Teacher' },
  { role: 'Parent' },
  { role: 'Student' },
  { role: 'Child' }
];

const promoCodes = [
  {
    code: 'WELCOME10',
    description: '10% off for first-time subscribers',
    discount: 10,
    applies_to: 'first_time',
    active: true,
    usage_limit_per_user: 1
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Plan.deleteMany({});
    await UserRole.deleteMany({});
    await PromoCode.deleteMany({});
    console.log('Cleared existing data');

    // Insert plans
    const createdPlans = await Plan.insertMany(plans);
    console.log(`Created ${createdPlans.length} plans`);

    // Insert user roles
    const createdUserRoles = await UserRole.insertMany(userRoles);
    console.log(`Created ${createdUserRoles.length} user roles`);

    // Insert promo codes
    const createdPromoCodes = await PromoCode.insertMany(promoCodes);
    console.log(`Created ${createdPromoCodes.length} promo codes`);

    console.log('Database seeding completed successfully!');
    
    // Display created data
    console.log('\nCreated Plans:');
    createdPlans.forEach(plan => {
      console.log(`- ${plan.name}: $${plan.monthlyPrice}/month`);
    });

    console.log('\nCreated User Roles:');
    createdUserRoles.forEach(role => {
      console.log(`- ${role.role}`);
    });

    console.log('\nCreated Promo Codes:');
    createdPromoCodes.forEach(promo => {
      console.log(`- ${promo.code}: ${promo.discount}% off - ${promo.description}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedDatabase(); 