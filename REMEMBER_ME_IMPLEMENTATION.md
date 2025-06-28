# Remember Me Implementation

## Overview

The "Remember Me" functionality has been implemented to provide users with the option to stay logged in for extended periods. When enabled, authentication tokens have longer expiry times, allowing users to remain authenticated across browser sessions.

## How It Works

### Backend Implementation

1. **Token Expiry Configuration**: The system uses two types of tokens:
   - **Access Token**: Short-lived token for API requests
   - **Refresh Token**: Long-lived token for renewing access tokens

2. **Remember Me Logic**: When `rememberMe` is `true`:
   - Access Token: 7 days (instead of 1 hour)
   - Refresh Token: 30 days (instead of 7 days)
   - Cookie `maxAge`: Set to match token expiry times

3. **Cookie-Based Authentication**: Tokens are stored in secure HTTP-only cookies:
   - `accessToken`: Contains the JWT access token
   - `refreshToken`: Contains the JWT refresh token

### Frontend Implementation

1. **User Interface**: The sign-in form includes a "Remember Me" checkbox
2. **State Management**: The `rememberMe` state is passed through the authentication flow
3. **API Integration**: The `rememberMe` parameter is sent to the backend during sign-in
4. **Preference Persistence**: The checkbox state is saved to localStorage and restored on page load
5. **Automatic Cleanup**: The preference is cleared when the user signs out

## User Experience Features

### Preference Persistence
- **Saves User Choice**: When a user checks/unchecks "Remember Me", their preference is saved to localStorage
- **Auto-Restore**: When the user returns to the sign-in page, their previous choice is automatically restored
- **Sign Out Cleanup**: When the user signs out, their preference is cleared for security

### User Flow
1. User visits sign-in page → Previous preference is loaded (if any)
2. User checks/unchecks "Remember Me" → Preference is immediately saved
3. User signs in → Backend applies the preference to token expiry
4. User signs out → Preference is cleared from localStorage

## Security Considerations

### Token Expiry Times

| Remember Me | Access Token | Refresh Token | Cookie Expiry |
|-------------|--------------|---------------|---------------|
| `false`     | 1 hour       | 7 days        | 1 hour / 7 days |
| `true`      | 7 days       | 30 days       | 7 days / 30 days |

### Security Features

1. **HTTP-Only Cookies**: Tokens are stored in HTTP-only cookies to prevent XSS attacks
2. **Secure Cookies**: In production, cookies are set with the `secure` flag
3. **SameSite Policy**: Cookies use `strict` same-site policy
4. **Automatic Refresh**: Access tokens are automatically refreshed using refresh tokens
5. **Preference Cleanup**: Remember Me preference is cleared on sign out

## API Changes

### Sign In Endpoint

**Endpoint**: `POST /api/auth/signin`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": true
}
```

**Response**: Same as before, but cookie expiry times vary based on `rememberMe`

## Frontend Changes

### AuthService Interface

```typescript
export interface SignInCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

### SignIn Component

The sign-in form now includes:
- Remember Me checkbox with persistent state
- Automatic preference saving to localStorage
- Preference restoration on page load

### Utility Functions

```typescript
// Get the saved remember me preference
getRememberMePreference(): boolean

// Save the remember me preference
setRememberMePreference(value: boolean): void

// Clear the remember me preference (used on sign out)
clearRememberMePreference(): void
```

## Testing

Use the provided test scripts to verify the functionality:

```bash
# Test the backend remember me functionality
node test-remember-me.js

# Test the frontend preference storage
node test-remember-me-preference.js
```

These scripts test:
1. Sign in without remember me
2. Sign in with remember me
3. Invalid credentials handling
4. Preference saving and restoration
5. Preference cleanup on sign out

## User Experience

### When Remember Me is Enabled

- Users remain logged in for 7 days (access token)
- Automatic token refresh for up to 30 days (refresh token)
- No need to re-enter credentials frequently
- Preference is remembered across browser sessions

### When Remember Me is Disabled

- Users are logged out after 1 hour of inactivity
- Refresh tokens expire after 7 days
- More secure for shared or public computers
- Preference is remembered across browser sessions

## Best Practices

1. **User Education**: Inform users about the security implications
2. **Default Behavior**: Consider the security context when setting defaults
3. **Clear Sign Out**: Provide a clear way to sign out and clear tokens
4. **Session Management**: Monitor and log authentication events
5. **Preference Management**: Allow users to change their preference easily

## Future Enhancements

1. **Device Management**: Allow users to view and manage active sessions
2. **Geographic Restrictions**: Limit remember me based on location
3. **Risk-Based Authentication**: Adjust remember me behavior based on risk factors
4. **Biometric Integration**: Use biometric authentication for remember me
5. **Preference Settings**: Add a user settings page to manage remember me preference 