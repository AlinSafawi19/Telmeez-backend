# Email Verification Setup Guide

## Overview
The checkout process now includes email verification when moving from step 1 to step 2. The system uses Gmail SMTP service to send verification codes.

## Email Configuration

### 1. Gmail Setup (Recommended)

#### Step 1: Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification** (if not already enabled)

#### Step 2: Generate App Password
1. Go to **Security → 2-Step Verification**
2. Scroll down to **App Passwords**
3. Click **Generate** for "Mail"
4. Copy the 16-character app password (format: `abcd efgh ijkl mnop`)

#### Step 3: Update Configuration
1. Update your `.env` file:
   ```env
   EMAIL_PASSWORD=your_16_character_app_password
   ```

2. Update `src/services/emailService.ts`:
   - Replace `your-gmail@gmail.com` with your actual Gmail address in two places:
     - Line 8: `user: 'your-gmail@gmail.com'`
     - Line 108: `from: '"Telmeez" <your-gmail@gmail.com>'`

### 2. Create .env file
Create a `.env` file in the root directory with the following configuration:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/telmeez

# Server Configuration
PORT=3000

# Email Configuration (Gmail)
EMAIL_PASSWORD=your_gmail_app_password

# JWT Secret
JWT_SECRET=your_jwt_secret_here
```

### 3. Gmail SMTP Configuration
The system is configured to use Gmail SMTP:
- **SMTP Server**: smtp.gmail.com
- **Port**: 587
- **Security**: TLS
- **Authentication**: App Password

### 4. Testing Email Configuration
Run the Gmail setup test to verify your configuration:

```bash
node test-gmail-setup.js
```

This will:
- Check if EMAIL_PASSWORD is set
- Test connection to Gmail SMTP servers
- Verify authentication
- Test email sending capability

## Troubleshooting "Failed to send verification email"

### Common Issues and Solutions:

#### 1. EMAIL_PASSWORD not set
**Error**: `EMAIL_PASSWORD environment variable is not set`

**Solution**:
1. Generate a Gmail app password
2. Update your `.env` file with the app password
3. Restart your server

#### 2. Authentication Failed
**Error**: `Authentication failed - check EMAIL_PASSWORD`

**Solution**:
1. Make sure you're using a Gmail **app password**, not your regular Gmail password
2. Verify 2-Step Verification is enabled on your Google account
3. Generate a new app password if needed
4. Check that you've updated the Gmail address in the code

#### 3. Gmail Address Not Updated
**Error**: `Invalid sender address`

**Solution**:
1. Update `src/services/emailService.ts` with your actual Gmail address
2. Replace `your-gmail@gmail.com` in both places

#### 4. 2-Step Verification Not Enabled
**Error**: `Username and Password not accepted`

**Solution**:
1. Enable 2-Step Verification on your Google account
2. Generate an app password
3. Use the app password in your `.env` file

#### 5. Connection Issues
**Error**: `Connection refused` or `Connection timeout`

**Solution**:
1. Check your internet connection
2. Verify port 587 is not blocked by your firewall
3. Try using a different network

### Debugging Steps:

1. **Run the Gmail test**:
   ```bash
   node test-gmail-setup.js
   ```

2. **Check server logs** for detailed error messages

3. **Verify environment variables**:
   ```bash
   echo $EMAIL_PASSWORD
   ```

4. **Test with a simple email client** using the same settings

5. **Check Gmail settings**:
   - 2-Step Verification should be enabled
   - App password should be generated for "Mail"
   - Port 587 with TLS

### Alternative Email Services:

If Gmail doesn't work, consider:

1. **SendGrid** (free tier available)
2. **Mailgun** (free tier available)
3. **Outlook/Hotmail** (with app password)

## Security Notes

- Never commit your `.env` file to version control
- Use app passwords, not regular passwords
- Regularly rotate app passwords
- Keep your Google account secure

## Support

If you continue to experience issues:

1. Check the server logs for detailed error messages
2. Run the Gmail setup test script
3. Verify your Google account settings
4. Contact support with the specific error messages

## Email Templates

The system includes email templates in:
- English (en)
- Arabic (ar) 
- French (fr)

Templates are automatically selected based on the user's language preference.

## How It Works

### 1. Step 1 to Step 2 Transition
When a user completes step 1 (account information) and clicks "Continue":
- The system validates the email format
- Checks if the email is already registered
- Generates a 6-digit verification code
- Sends the code via email to the user
- Automatically moves to step 2

### 2. Step 2 - Email Verification
- User receives a verification code via email
- User enters the 6-digit code in the verification input
- System validates the code against the database
- If valid, user can proceed to step 3
- If invalid, user can request a new code

### 3. Verification Code Features
- **6-digit numeric codes**
- **10-minute expiration**
- **One-time use** (codes are marked as used after verification)
- **Automatic cleanup** (expired codes are automatically deleted)
- **Multi-language support** (English, Arabic, French)

## API Endpoints

### Send Verification Code
```
POST /api/checkout/send-verification
Content-Type: application/json
Accept-Language: en|ar|fr

{
  "email": "user@example.com"
}
```

### Verify Code
```
POST /api/checkout/verify-code
Content-Type: application/json
Accept-Language: en|ar|fr

{
  "email": "user@example.com",
  "code": "123456"
}
```

## Error Handling

### Common Error Messages
- **"Email is required"** - Email field is empty
- **"Invalid email format"** - Email format is invalid
- **"User with this email already exists"** - Email is already registered
- **"Failed to send verification email"** - Email service error
- **"Invalid or expired verification code"** - Code is wrong or expired
- **"Email and verification code are required"** - Missing required fields

### User Experience
- **Automatic code sending** when reaching step 2
- **Resend functionality** if code doesn't arrive
- **Real-time validation** of verification code
- **Clear error messages** in user's language
- **Timeout handling** for network requests

## Security Features

### Code Security
- **Random 6-digit generation** using cryptographically secure random
- **Time-based expiration** (10 minutes)
- **Single-use codes** (cannot be reused)
- **Email validation** before sending codes
- **Rate limiting** (can be implemented if needed)

### Database Security
- **Automatic cleanup** of expired codes
- **Indexed queries** for performance
- **Email normalization** (lowercase, trimmed)
- **Audit trail** (creation timestamps)

## Testing

### Manual Testing
1. Start the backend server
2. Navigate to the checkout page
3. Fill in step 1 with a valid email
4. Click "Continue" to trigger code sending
5. Check email for verification code
6. Enter the code in step 2
7. Verify successful progression to step 3

### API Testing
Use the provided test files or tools like Postman to test the endpoints directly.

## Troubleshooting

### Email Not Received
1. Check spam/junk folder
2. Verify email address is correct
3. Check Gmail account settings
4. Verify EMAIL_PASSWORD in .env file
5. Check server logs for email errors

### Code Not Working
1. Ensure code is entered within 10 minutes
2. Check for extra spaces in code input
3. Verify email matches the one used in step 1
4. Try requesting a new code

### Server Errors
1. Check MongoDB connection
2. Verify all environment variables are set
3. Check server logs for detailed error messages
4. Ensure all dependencies are installed

## Future Enhancements

### Potential Improvements
- **Rate limiting** for code requests
- **SMS verification** as backup
- **Voice call verification** for accessibility
- **Two-factor authentication** integration
- **Email templates** customization
- **Analytics** for verification success rates 