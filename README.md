# Telmeez Backend - Checkout System

A Node.js/Express/TypeScript backend for a subscription checkout system with support for multiple payment methods suitable for Lebanon.

## 🚀 Features

- **Multi-Payment Support**: Credit cards, bank transfers, and cash on delivery
- **Real Promo Code System**: Database-driven promo codes with validation
- **Subscription Management**: Complete subscription lifecycle
- **User Management**: User registration with roles
- **Billing & Payments**: Comprehensive billing address and payment tracking
- **Add-ons System**: Flexible add-on management for different user types
- **Trial Periods**: Automatic trial periods for starter plans

## 🏗️ Architecture

### Database Collections
- **Users**: User accounts with roles
- **Plans**: Subscription plans (Starter, Standard, Enterprise)
- **Subscriptions**: Active user subscriptions
- **Payments**: Payment records with multiple payment methods
- **BillingAddresses**: User billing addresses
- **PaymentDetails**: Stored payment method details
- **PromoCodes**: Real promo codes with validation rules
- **PromoCodeUsage**: Usage tracking for promo codes
- **UserRoles**: User role definitions

### Payment Methods Supported
- **💳 Credit/Debit Cards**: Visa, Mastercard, American Express
- **🏦 Bank Transfer**: Direct bank transfers with instructions
- **💵 Cash on Delivery**: Payment upon service delivery

## 🛠️ Setup

### Prerequisites
- Node.js (v16+)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd telmeez-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/telmeez
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   npm run seed
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

## 📊 Database Seeding

The seeding script creates:
- **Plans**: Starter ($49), Standard ($99), Enterprise ($299)
- **User Roles**: Super Admin, Admin, Teacher, Student, Parent, Child
- **Promo Codes**: WELCOME10 (10% discount)

**Note**: New users created during checkout are assigned the "Super Admin" role by default.

```bash
npm run seed
```

## 🔌 API Endpoints

### Checkout Endpoints

#### `POST /api/checkout`
Process complete checkout with multiple payment methods.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "institutionName": "Test University",
  "password": "password123",
  "billingAddress": {
    "address": "123 Main St",
    "city": "Beirut",
    "state": "Beirut",
    "zipCode": "12345",
    "country": "lebanon"
  },
  "paymentInfo": {
    "cardNumber": "4242424242424242",
    "expiryDate": "12/25",
    "cvv": "123"
  },
  "planId": "plan_id_here",
  "billingCycle": "monthly",
  "addOns": [
    {
      "type": "admin",
      "quantity": 2,
      "price": 1.50
    }
  ],
  "totalAmount": 55.25,
  "promoCode": "WELCOME10",
  "discount": 10,
  "paymentMethod": "card"
}
```

**Payment Methods:**
- `"card"` - Credit/debit card payment
- `"bank_transfer"` - Bank transfer with instructions
- `"cash_on_delivery"` - Cash payment on delivery

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "subscription": {
      "id": "subscription_id",
      "plan": "Starter",
      "status": "active",
      "billingCycle": "monthly",
      "totalAmount": 55.25
    },
    "payment": {
      "id": "payment_id",
      "amount": 55.25,
      "status": "pending",
      "paymentMethod": "card"
    },
    "promoCode": {
      "code": "WELCOME10",
      "discount": 10,
      "description": "10% off for first-time subscribers",
      "savings": 5.25
    }
  }
}
```

#### `POST /api/checkout/validate-promo`
Validate promo codes before checkout.

**Request Body:**
```json
{
  "promoCode": "WELCOME10",
  "email": "user@example.com"
}
```

#### `GET /api/checkout/plans`
Get available subscription plans.

#### `GET /api/checkout/payment-methods`
Get available payment methods for Lebanon.

## 💳 Payment Integration

### Current Implementation
The system is designed to work with any payment gateway. Currently configured for:
- **Generic Payment Processing**: Framework ready for gateway integration
- **Bank Transfer Instructions**: Automatic generation of transfer details
- **Cash on Delivery**: Service delivery confirmation

## 🚨 Error Handling

### Frontend Error Handling
The checkout system includes comprehensive error handling with user-friendly error messages:

#### Error Types Handled
- **Validation Errors**: Missing required fields, invalid data formats
- **Server Errors**: Database issues, configuration problems
- **Network Errors**: Connection timeouts, network failures
- **Business Logic Errors**: Duplicate emails, invalid promo codes, plan availability

#### Error Display Features
- **Prominent Error Banner**: Red error box with clear messaging
- **Auto-scroll**: Automatically scrolls to error message
- **Retry Functionality**: One-click retry without re-filling form
- **Error Clearing**: Errors clear when user starts typing or changes steps
- **Action Buttons**: Dismiss, Retry, and Refresh options

#### Error Messages
- **Duplicate Email**: "An account with this email already exists. Please use a different email or try signing in."
- **Invalid Plan**: "The selected plan is no longer available. Please refresh the page and try again."
- **System Error**: "System configuration error. Please contact support."
- **Network Timeout**: "Request timed out. Please check your internet connection and try again."
- **Server Error**: "Server error. Please try again in a few moments."

#### Testing Error Handling
Run the error handling test script:
```bash
node test-checkout-errors.js
```

This script tests various error scenarios to ensure proper error handling.

### Recommended Payment Gateways for Lebanon
1. **PayTabs** - Popular in MENA region
2. **HyperPay** - Works in Lebanon
3. **PayFort** - Available in Lebanon
4. **Checkout.com** - Supports Lebanon
5. **Adyen** - Available in Lebanon

### Integration Steps
1. Choose a payment gateway
2. Install their SDK
3. Update the payment processing logic in `checkoutController.ts`
4. Configure webhook endpoints for payment status updates

## 🧪 Testing

### Run API Tests
```bash
node test-api.js
```

### Test Coverage
- ✅ Plan retrieval
- ✅ Payment method listing
- ✅ Promo code validation
- ✅ Checkout processing (all payment methods)
- ✅ Error handling
- ✅ Duplicate email prevention

## 🔧 Development

### Project Structure
```
src/
├── config/
│   └── db.ts                 # Database configuration
├── controllers/
│   └── checkoutController.ts # Main checkout logic
├── middleware/
│   └── validation.ts         # Request validation
├── models/
│   ├── User.ts              # User model
│   ├── Plan.ts              # Plan model
│   ├── Subscription.ts      # Subscription model
│   ├── Payment.ts           # Payment model
│   ├── BillingAddress.ts    # Billing address model
│   ├── PaymentDetail.ts     # Payment details model
│   ├── PromoCode.ts         # Promo code model
│   ├── PromoCodeUsage.ts    # Promo code usage tracking
│   └── UserRole.ts          # User role model
├── routes/
│   └── checkout.ts          # Checkout routes
└── scripts/
    └── seedDatabase.ts      # Database seeding
```

### Key Features

#### Promo Code System
- Real promo codes stored in database
- Validation on apply (not during checkout)
- Usage tracking and limits
- Date-based validity

#### Payment Processing
- Multiple payment method support
- Payment status tracking
- Transaction metadata storage
- Error handling and retry logic

#### Subscription Management
- Automatic trial periods
- Billing cycle management
- Add-ons support
- Status tracking

## 🌍 Lebanon-Specific Features

### Payment Methods
- **Bank Transfer**: Local Lebanese bank integration
- **Cash on Delivery**: Common in Lebanon
- **Credit Cards**: International card support

### Currency
- All amounts in USD
- Support for LBP conversion (future enhancement)

### Compliance
- Lebanese banking regulations
- Data protection compliance
- Tax considerations

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Configure production MongoDB
3. Set up payment gateway credentials
4. Configure webhook endpoints
5. Set up monitoring and logging

### Environment Variables
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/telmeez
NODE_ENV=production
PAYMENT_GATEWAY_API_KEY=your_gateway_key
PAYMENT_GATEWAY_SECRET=your_gateway_secret
WEBHOOK_SECRET=your_webhook_secret
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Note**: This system is specifically designed for the Lebanese market with appropriate payment methods and compliance considerations. 