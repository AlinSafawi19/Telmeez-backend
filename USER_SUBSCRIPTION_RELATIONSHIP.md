# User-Subscription Relationship Guide

## Overview

This document explains how users are linked to subscriptions in the Telmeez backend system and provides examples of how to query these relationships.

## Current Relationship Structure

### Database Schema

**User Model** (`src/models/User.ts`):
```typescript
{
  // ... other fields
  subscriptions: [{
    type: Schema.Types.ObjectId,
    ref: 'Subscription'
  }]
}
```

**Subscription Model** (`src/models/Subscription.ts`):
```typescript
{
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  // ... other fields
}
```

### Relationship Type

- **Bidirectional Relationship**: Both User and Subscription models reference each other
- **One-to-Many**: One user can have multiple subscriptions
- **Foreign Key**: Subscription has a `user` field pointing to User's `_id`

## How Users Get Linked to Subscriptions

### During Checkout Process

1. **User Creation**: When a user completes checkout, a new User document is created
2. **Subscription Creation**: A Subscription document is created with `user: user._id`
3. **Bidirectional Update**: The User's `subscriptions` array is updated to include the new subscription

```typescript
// In checkoutController.ts
const user = new User({...});
await user.save();

const subscription = new Subscription({
  user: user._id,  // Link subscription to user
  // ... other fields
});
await subscription.save();

// Update user's subscriptions array
await User.findByIdAndUpdate(
  user._id,
  { $push: { subscriptions: subscription._id } }
);
```

## Querying User-Subscription Relationships

### 1. Get User's Subscriptions

```typescript
// Get all subscriptions for a user
const userSubscriptions = await Subscription.find({ user: userId });

// Get active subscriptions for a user
const activeSubscriptions = await Subscription.find({ 
  user: userId, 
  status: { $in: ['active', 'trialing'] } 
});

// Using the service
const userData = await UserSubscriptionService.getUserSubscriptions(userId);
```

### 2. Get User with Their Subscriptions

```typescript
// Using static method
const user = await User.findUserWithSubscriptions(userId);

// Using aggregation
const userWithSubs = await User.aggregate([
  {
    $lookup: {
      from: 'subscriptions',
      localField: '_id',
      foreignField: 'user',
      as: 'subscriptions'
    }
  },
  {
    $match: { _id: new mongoose.Types.ObjectId(userId) }
  }
]);
```

### 3. Get Subscription with User Details

```typescript
// Get subscription with populated user data
const subscription = await Subscription.findById(subscriptionId)
  .populate('user', 'firstName lastName email')
  .populate('plan', 'name monthlyPrice annualPrice');

// Using the service
const subWithUser = await UserSubscriptionService.getSubscriptionWithUser(subscriptionId);
```

### 4. Get All Users with Active Subscriptions

```typescript
// Using aggregation
const usersWithActive = await User.aggregate([
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
  }
]);

// Using the service
const activeUsers = await UserSubscriptionService.getUsersWithActiveSubscriptions();
```

### 5. Find Users by Subscription Status

```typescript
// Get users with specific subscription status
const usersWithStatus = await UserSubscriptionService.getUsersBySubscriptionStatus('active');

// Manual aggregation
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
      'subscriptions.status': 'active'
    }
  }
]);
```

## Available API Endpoints

### User Subscription Controller (`src/controllers/userSubscriptionController.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/:userId/subscriptions` | GET | Get all subscriptions for a user |
| `/api/users/:userId/subscriptions/active` | GET | Get active subscriptions for a user |
| `/api/users/with-active-subscriptions` | GET | Get all users with active subscriptions |
| `/api/users/by-subscription-status/:status` | GET | Get users by subscription status |
| `/api/subscriptions/:subscriptionId/with-user` | GET | Get subscription with user details |
| `/api/subscriptions/with-users` | GET | Get all subscriptions with user details |
| `/api/users/:userId/has-active-subscription` | GET | Check if user has active subscription |
| `/api/subscriptions/stats` | GET | Get subscription statistics |

## Service Methods

### UserSubscriptionService (`src/services/userSubscriptionService.ts`)

```typescript
// Get user's subscriptions
UserSubscriptionService.getUserSubscriptions(userId)

// Get user's active subscriptions
UserSubscriptionService.getUserActiveSubscriptions(userId)

// Get users by subscription status
UserSubscriptionService.getUsersBySubscriptionStatus(status)

// Get users with active subscriptions
UserSubscriptionService.getUsersWithActiveSubscriptions()

// Get subscription with user details
UserSubscriptionService.getSubscriptionWithUser(subscriptionId)

// Get all subscriptions with users
UserSubscriptionService.getAllSubscriptionsWithUsers()

// Check if user has active subscription
UserSubscriptionService.hasActiveSubscription(userId)

// Get subscription statistics
UserSubscriptionService.getSubscriptionStats()
```

## Static Methods on User Model

```typescript
// Get user with all subscriptions
User.findUserWithSubscriptions(userId)

// Get user with active subscriptions only
User.findUserWithActiveSubscriptions(userId)

// Get users by subscription status
User.findUsersBySubscriptionStatus(status)
```

## Testing the Relationships

Run the test script to see the relationships in action:

```bash
node test-user-subscription-relationships.js
```

This script demonstrates:
1. Getting all users with their subscription counts
2. Finding users with active subscriptions
3. Getting all subscriptions with user details
4. Subscription statistics
5. Finding users by subscription status
6. Checking specific user's subscriptions

## Common Use Cases

### 1. Dashboard - Show User's Subscriptions
```typescript
const userSubscriptions = await UserSubscriptionService.getUserActiveSubscriptions(userId);
// Display user's active subscriptions in dashboard
```

### 2. Admin Panel - List All Subscriptions
```typescript
const allSubscriptions = await UserSubscriptionService.getAllSubscriptionsWithUsers();
// Show all subscriptions with user details in admin panel
```

### 3. Access Control - Check Subscription Status
```typescript
const hasActive = await UserSubscriptionService.hasActiveSubscription(userId);
if (!hasActive) {
  // Redirect to subscription page or show upgrade prompt
}
```

### 4. Analytics - Subscription Statistics
```typescript
const stats = await UserSubscriptionService.getSubscriptionStats();
// Display subscription metrics and analytics
```

### 5. Billing - Find Users with Expiring Subscriptions
```typescript
const expiringSubs = await Subscription.find({
  currentPeriodEnd: { 
    $gte: new Date(), 
    $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
  },
  status: { $in: ['active', 'trialing'] }
}).populate('user');
```

## Best Practices

1. **Always populate related data** when you need user or plan information
2. **Use indexes** for efficient queries (already set up in Subscription model)
3. **Use the service layer** for complex queries instead of direct model calls
4. **Handle edge cases** like users without subscriptions
5. **Cache frequently accessed data** like subscription status checks

## Database Indexes

The Subscription model includes these indexes for efficient querying:
```typescript
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });
```

## Troubleshooting

### Common Issues

1. **User not found**: Check if the user ID is valid
2. **No subscriptions**: User might not have any subscriptions yet
3. **Populate not working**: Ensure the referenced documents exist
4. **Performance issues**: Use indexes and limit the data being fetched

### Debug Queries

```typescript
// Check if user exists
const user = await User.findById(userId);
console.log('User:', user);

// Check user's subscriptions array
const userWithSubs = await User.findById(userId).populate('subscriptions');
console.log('User subscriptions:', userWithSubs.subscriptions);

// Check subscriptions directly
const subs = await Subscription.find({ user: userId });
console.log('Direct subscriptions:', subs);
```
