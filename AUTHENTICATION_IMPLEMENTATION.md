# Authentication Implementation

This document describes the complete authentication system implementation for the Telmeez application.

## Overview

The authentication system includes:
- Backend API endpoints for signin and profile management
- Frontend authentication service and context
- JWT token-based authentication
- Protected routes with middleware
- Multi-language error handling

## Backend Implementation

### Files Created/Modified

1. **`src/controllers/authController.ts`** - Authentication controller
   - `signin()` - Handles user authentication
   - `getProfile()` - Retrieves user profile

2. **`src/routes/auth.ts`** - Authentication routes
   - `POST /api/auth/signin` - Public signin endpoint
   - `GET /api/auth/profile` - Protected profile endpoint

3. **`src/middleware/auth.ts`** - Authentication middleware
   - `authenticateToken()` - Verifies JWT tokens
   - `requireRole()` - Role-based access control

4. **`src/index.ts`** - Updated to include auth routes

### API Endpoints

#### POST /api/auth/signin
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Sign in successful",
  "data": {
    "user": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com",
      "phone": "+1234567890",
      "institutionName": "Test Institution",
      "role": {
        "name": "admin",
        "permissions": ["read", "write", "delete", "admin"]
      },
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### GET /api/auth/profile
**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "phone": "+1234567890",
    "institutionName": "Test Institution",
    "role": {
      "name": "admin",
      "permissions": ["read", "write", "delete", "admin"]
    },
    "isActive": true,
    "subscriptions": [],
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

## Frontend Implementation

### Files Created/Modified

1. **`telmeez-frontend/src/services/authService.ts`** - Authentication service
   - Handles API calls to backend
   - Manages token storage in localStorage
   - Provides authentication state management

2. **`telmeez-frontend/src/contexts/AuthContext.tsx`** - Authentication context
   - Provides authentication state across the app
   - Handles user login/logout
   - Manages loading states

3. **`telmeez-frontend/src/pages/SignIn.tsx`** - Updated signin page
   - Integrated with authentication service
   - Added error handling and loading states
   - Multi-language support for errors

4. **`telmeez-frontend/src/App.tsx`** - Updated to include AuthProvider

5. **Translation files** - Added authentication error messages
   - English, Arabic, and French translations
   - Error messages for various authentication scenarios

### Frontend Usage

#### Using the Auth Context
```tsx
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, signIn, signOut, isLoading } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn({ email: 'user@example.com', password: 'password123' });
      // Navigate to dashboard or handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.firstName}!</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <button onClick={handleSignIn}>Sign In</button>
      )}
    </div>
  );
};
```

#### Using the Auth Service Directly
```tsx
import authService from '../services/authService';

// Sign in
const response = await authService.signIn({ email, password });

// Get profile
const profile = await authService.getProfile();

// Check authentication status
const isAuth = authService.isAuthenticated();

// Sign out
authService.signOut();
```

## Environment Variables

Add the following to your `.env` file:

```env
JWT_SECRET=your-secret-key-here
MONGODB_URI=mongodb://localhost:27017/telmeez
PORT=3000
```

## Testing

### Test Scripts

1. **`test-auth.js`** - Basic authentication tests
2. **`test-auth-complete.js`** - Comprehensive authentication tests
3. **`create-test-user.js`** - Creates a test user for testing

### Running Tests

```bash
# Build the project first
npm run build

# Create a test user
node create-test-user.js

# Run basic tests
node test-auth.js

# Run comprehensive tests
node test-auth-complete.js
```

### Test User Credentials

After running `create-test-user.js`:
- Email: `test@telmeez.com`
- Password: `testpassword123`

## Security Features

1. **Password Hashing** - Passwords are hashed using bcrypt
2. **JWT Tokens** - Secure token-based authentication
3. **Token Expiration** - Tokens expire after 24 hours
4. **Input Validation** - Server-side validation of all inputs
5. **Error Handling** - Secure error messages that don't leak information
6. **CORS Configuration** - Proper CORS setup for security

## Error Handling

The system handles various error scenarios:

1. **Invalid Credentials** - Returns generic error message
2. **Missing Fields** - Validates required fields
3. **Account Deactivated** - Handles inactive accounts
4. **Invalid Tokens** - Proper token validation
5. **Network Errors** - Graceful error handling

## Multi-language Support

Error messages are available in:
- English
- Arabic
- French

All authentication-related UI text is properly translated and supports RTL languages.

## Next Steps

1. **Password Reset** - Implement forgot password functionality
2. **Email Verification** - Add email verification for new accounts
3. **Session Management** - Implement session timeout and refresh tokens
4. **Rate Limiting** - Add rate limiting for authentication endpoints
5. **Two-Factor Authentication** - Add 2FA support
6. **OAuth Integration** - Add social login options

## Troubleshooting

### Common Issues

1. **JWT_SECRET not set** - Ensure JWT_SECRET is set in environment variables
2. **Database connection** - Verify MongoDB is running and accessible
3. **CORS issues** - Check CORS configuration for frontend domain
4. **Token expiration** - Tokens expire after 24 hours, implement refresh logic

### Debug Mode

To enable debug logging, add to your `.env`:
```env
DEBUG=auth:*
```

This will log authentication-related operations for debugging purposes. 