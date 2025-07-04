import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';
import Subscription from './src/models/Subscription';
import Payment from './src/models/Payment';
import BillingAddress from './src/models/BillingAddress';
import PaymentDetail from './src/models/PaymentDetail';
import Plan from './src/models/Plan';
import UserRole from './src/models/UserRole';
import PromoCode from './src/models/PromoCode';
import PromoCodeUsage from './src/models/PromoCodeUsage';

dotenv.config();

const MONGO_URI = process.env['MONGO_URI']; 

async function checkAllCollections() {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    console.log('\n=== Database Collections Summary ===');

    // Check Users
    const userCount = await User.countDocuments();
    console.log(`Users: ${userCount}`);

    // Check Subscriptions
    const subscriptionCount = await Subscription.countDocuments();
    console.log(`Subscriptions: ${subscriptionCount}`);

    // Check Payments
    const paymentCount = await Payment.countDocuments();
    console.log(`Payments: ${paymentCount}`);

    // Check Billing Addresses
    const billingAddressCount = await BillingAddress.countDocuments();
    console.log(`Billing Addresses: ${billingAddressCount}`);

    // Check Payment Details
    const paymentDetailCount = await PaymentDetail.countDocuments();
    console.log(`Payment Details: ${paymentDetailCount}`);

    // Check Plans
    const planCount = await Plan.countDocuments();
    console.log(`Plans: ${planCount}`);

    // Check User Roles
    const userRoleCount = await UserRole.countDocuments();
    console.log(`User Roles: ${userRoleCount}`);

    // Check Promo Codes
    const promoCodeCount = await PromoCode.countDocuments();
    console.log(`Promo Codes: ${promoCodeCount}`);

    // Check Promo Code Usage
    const promoCodeUsageCount = await PromoCodeUsage.countDocuments();
    console.log(`Promo Code Usage: ${promoCodeUsageCount}`);

    // If there are users, show details
    if (userCount > 0) {
      console.log('\n=== User Details ===');
      const users = await User.find({}).populate('role').limit(5);
      users.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log(`- Name: ${user.firstName} ${user.lastName}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Role: ${(user.role as any)?.role || 'Unknown'}`);
        console.log(`- Created: ${user.createdAt}`);
      });
    }

    // If there are subscriptions, show details
    if (subscriptionCount > 0) {
      console.log('\n=== Subscription Details ===');
      const subscriptions = await Subscription.find({}).populate('user plan').limit(5);
      subscriptions.forEach((sub, index) => {
        console.log(`\nSubscription ${index + 1}:`);
        console.log(`- User: ${(sub.user as any)?.email || 'Unknown'}`);
        console.log(`- Plan: ${(sub.plan as any)?.name || 'Unknown'}`);
        console.log(`- Status: ${sub.status}`);
        console.log(`- Amount: $${sub.totalAmount}`);
        console.log(`- Created: ${sub.createdAt}`);
      });
    }

    // If there are payments, show details
    if (paymentCount > 0) {
      console.log('\n=== Payment Details ===');
      const payments = await Payment.find({}).populate('user').limit(5);
      payments.forEach((payment, index) => {
        console.log(`\nPayment ${index + 1}:`);
        console.log(`- User: ${(payment.user as any)?.email || 'Unknown'}`);
        console.log(`- Amount: $${payment.amount}`);
        console.log(`- Status: ${payment.status}`);
        console.log(`- Method: ${payment.paymentMethod}`);
        console.log(`- Created: ${payment.createdAt}`);
      });
    }

    // Show Plans
    if (planCount > 0) {
      console.log('\n=== Plans ===');
      const plans = await Plan.find({});
      plans.forEach((plan, index) => {
        console.log(`\nPlan ${index + 1}:`);
        console.log(`- Name: ${plan.name}`);
        console.log(`- Monthly Price: $${plan.monthlyPrice}`);
        console.log(`- Annual Discount: ${plan.discount_annual}%`);
        console.log(`- Max Storage: ${plan.maxStorage}`);
      });
    }

    // Show User Roles
    if (userRoleCount > 0) {
      console.log('\n=== User Roles ===');
      const roles = await UserRole.find({});
      roles.forEach((role) => {
        console.log(`- ${role.role}`);
      });
    }

    // Show Promo Codes
    if (promoCodeCount > 0) {
      console.log('\n=== Promo Codes ===');
      const promoCodes = await PromoCode.find({});
      promoCodes.forEach((promo, index) => {
        console.log(`\nPromo Code ${index + 1}:`);
        console.log(`- Code: ${promo.code}`);
        console.log(`- Discount: ${promo.discount}%`);
        console.log(`- Description: ${promo.description}`);
        console.log(`- Active: ${promo.active}`);
        console.log(`- Usage Count: ${promo.usage_count || 0}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkAllCollections(); 