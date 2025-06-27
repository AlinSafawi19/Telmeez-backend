const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telmeez');

// Import models
const User = require('./dist/models/User').default;
const Subscription = require('./dist/models/Subscription').default;
const Plan = require('./dist/models/Plan').default;

async function testUserSubscriptionRelationships() {
  try {
    console.log('🔍 Testing User-Subscription Relationships...\n');

    // 1. Get all users with their subscriptions
    console.log('1. Getting all users with their subscriptions:');
    const usersWithSubscriptions = await User.aggregate([
      {
        $lookup: {
          from: 'subscriptions',
          localField: '_id',
          foreignField: 'user',
          as: 'subscriptions'
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          subscriptionCount: { $size: '$subscriptions' }
        }
      }
    ]);
    
    console.log(`Found ${usersWithSubscriptions.length} users:`);
    usersWithSubscriptions.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email}): ${user.subscriptionCount} subscriptions`);
    });

    // 2. Get users with active subscriptions
    console.log('\n2. Getting users with active subscriptions:');
    const usersWithActiveSubs = await User.aggregate([
      {
        $lookup: {
          from: 'subscriptions',
          localField: '_id',
          foreignField: 'user',
          as: 'subscriptions'
        }
      },
      {
        $match: {
          'subscriptions.status': { $in: ['active', 'trialing'] }
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          activeSubscriptions: {
            $filter: {
              input: '$subscriptions',
              as: 'sub',
              cond: { $in: ['$$sub.status', ['active', 'trialing']] }
            }
          }
        }
      }
    ]);

    console.log(`Found ${usersWithActiveSubs.length} users with active subscriptions:`);
    usersWithActiveSubs.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName}: ${user.activeSubscriptions.length} active subscriptions`);
    });

    // 3. Get all subscriptions with user details
    console.log('\n3. Getting all subscriptions with user details:');
    const subscriptionsWithUsers = await Subscription.find()
      .populate('user', 'firstName lastName email')
      .populate('plan', 'name monthlyPrice annualPrice')
      .sort({ createdAt: -1 });

    console.log(`Found ${subscriptionsWithUsers.length} subscriptions:`);
    subscriptionsWithUsers.forEach(sub => {
      const user = sub.user;
      const plan = sub.plan;
      console.log(`  - ${user?.firstName} ${user?.lastName} (${user?.email}): ${plan?.name} - $${sub.totalAmount} - ${sub.status}`);
    });

    // 4. Get subscription statistics
    console.log('\n4. Getting subscription statistics:');
    const stats = await Subscription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    console.log('Subscription statistics:');
    stats.forEach(stat => {
      console.log(`  - ${stat._id}: ${stat.count} subscriptions, $${stat.totalAmount.toFixed(2)} total`);
    });

    // 5. Find users by subscription status
    console.log('\n5. Finding users by subscription status:');
    const statuses = ['active', 'trialing', 'cancelled', 'inactive'];
    
    for (const status of statuses) {
      const usersWithStatus = await User.aggregate([
        {
          $lookup: {
            from: 'subscriptions',
            localField: '_id',
            foreignField: 'user',
            as: 'subscriptions'
          }
        },
        {
          $match: {
            'subscriptions.status': status
          }
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            email: 1
          }
        }
      ]);

      console.log(`  ${status.toUpperCase()}: ${usersWithStatus.length} users`);
      usersWithStatus.forEach(user => {
        console.log(`    - ${user.firstName} ${user.lastName} (${user.email})`);
      });
    }

    // 6. Check specific user's subscriptions
    console.log('\n6. Checking specific user subscriptions:');
    const firstUser = await User.findOne();
    if (firstUser) {
      const userSubscriptions = await Subscription.find({ user: firstUser._id })
        .populate('plan', 'name monthlyPrice annualPrice');

      console.log(`User: ${firstUser.firstName} ${firstUser.lastName} (${firstUser.email})`);
      console.log(`Has ${userSubscriptions.length} subscriptions:`);
      
      userSubscriptions.forEach(sub => {
        const plan = sub.plan;
        console.log(`  - ${plan?.name}: $${sub.totalAmount} (${sub.status}) - ${sub.billingCycle}`);
      });
    }

    console.log('\n✅ User-Subscription relationship testing completed!');

  } catch (error) {
    console.error('❌ Error testing user-subscription relationships:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the test
testUserSubscriptionRelationships();
