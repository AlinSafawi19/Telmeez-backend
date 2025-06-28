# Email Verification Setup Guide

## Overview
The checkout process now includes email verification when moving from step 1 to step 2. The system uses Titan Email SMTP service to send verification codes from contact@telmeezlb.com.

## Email Configuration

### 1. Titan Email Setup (Current Configuration)

#### Step 1: Titan Email Account Setup
1. Ensure you have access to the Titan Email account: contact@telmeezlb.com
2. Make sure the account is properly configured and active

#### Step 2: Get Titan Email Password
1. Use the password for the contact@telmeezlb.com account
2. This should be the regular account password (not an app password like Gmail)

#### Step 3: Update Configuration
1. Update your `.env` file:
   ```env
   EMAIL_PASSWORD=your_titan_email_password
   ```

2. The `src/services/emailService.ts` is already configured with:
   - Host: smtp.titan.email
   - Port: 465
   - Security: SSL/TLS
   - User: contact@telmeezlb.com

### 2. Create .env file
Create a `.env` file in the root directory with the following configuration:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/telmeez

# Server Configuration
PORT=3000

# Email Configuration (Titan Email)
EMAIL_PASSWORD=your_titan_email_password

# JWT Secret
JWT_SECRET=your_jwt_secret_here
```

### 3. Titan Email SMTP Configuration
The system is configured to use Titan Email SMTP:
- **SMTP Server**: smtp.titan.email
- **Port**: 465
- **Security**: SSL/TLS
- **Authentication**: Regular account password
- **From Address**: contact@telmeezlb.com

### 4. Testing Email Configuration
Run the email setup test to verify your configuration:

```bash
node test-email-connection.js
```

This will:
- Check if EMAIL_PASSWORD is set
- Test connection to Titan Email SMTP servers
- Verify authentication
- Test email sending capability

## Troubleshooting "Failed to send verification email"

### Common Issues and Solutions:

#### 1. EMAIL_PASSWORD not set
**Error**: `EMAIL_PASSWORD environment variable is not set`

**Solution**:
1. Get the Titan Email password for contact@telmeezlb.com
2. Update your `.env` file with the password
3. Restart your server

#### 2. Authentication Failed
**Error**: `Authentication failed - check EMAIL_PASSWORD`

**Solution**:
1. Make sure you're using the correct password for contact@telmeezlb.com
2. Verify the Titan Email account is active and not suspended
3. Check that the password is correct and not expired

#### 3. Connection Issues
**Error**: `Connection refused` or `Connection timeout`

**Solution**:
1. Check your internet connection
2. Verify port 465 is not blocked by your firewall
3. Try using a different network
4. Check if Titan Email servers are accessible

#### 4. SSL/TLS Issues
**Error**: `SSL/TLS connection failed`

**Solution**:
1. Verify the system supports SSL/TLS connections
2. Check if any antivirus or firewall is blocking SSL connections
3. Try updating Node.js to the latest version

### Debugging Steps:

1. **Run the email test**:
   ```bash
   node test-email-connection.js
   ```

2. **Check server logs** for detailed error messages

3. **Verify environment variables**:
   ```bash
   echo $EMAIL_PASSWORD
   ```

4. **Test with a simple email client** using the same settings:
   - Host: smtp.titan.email
   - Port: 465
   - Security: SSL/TLS
   - Username: contact@telmeezlb.com
   - Password: your_titan_email_password

5. **Check Titan Email settings**:
   - Account should be active
   - SMTP should be enabled
   - Port 465 with SSL/TLS should be accessible

### Alternative Email Services:

If Titan Email doesn't work, consider:

1. **Gmail** (with app password)
2. **SendGrid** (free tier available)
3. **Mailgun** (free tier available)
4. **Outlook/Hotmail** (with app password)

## Security Notes

- Never commit your `.env` file to version control
- Use strong passwords for email accounts
- Regularly update email account passwords
- Keep your Titan Email account secure

## Support

If you continue to experience issues:

1. Check the server logs for detailed error messages
2. Run the email setup test script
3. Verify your Titan Email account settings
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

## Migration from Gmail

If you were previously using Gmail and want to switch to Titan Email:

1. **Update the email service configuration** (already done)
2. **Update your .env file** with the Titan Email password
3. **Test the new configuration** using the test scripts
4. **Update any documentation** that references Gmail

The system will now send verification emails from contact@telmeezlb.com using Titan Email's SMTP servers. 