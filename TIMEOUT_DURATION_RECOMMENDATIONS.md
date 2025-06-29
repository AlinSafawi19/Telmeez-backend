# Timeout Duration Recommendations ⏱️

## Current Configuration

### Rate Limiting
- **Window**: 15 minutes
- **Max Attempts**: 5 attempts per 15 minutes
- **Wait Time**: 15 minutes

### Account Lockout
- **Base Duration**: 15 minutes
- **Progressive Lockout**: 15min → 30min → 60min → 120min → 24h max

### IP-Based Lockout
- **Duration**: 1 hour (60 minutes)

## Industry Standard Recommendations

### 1. **Rate Limiting** (Most Common)
**Recommended Settings:**
```env
RATE_LIMIT_MAX=5                    # 5 attempts
AUTH_WINDOW_MS=900000               # 15 minutes (current)
```

**Alternative Options:**
- **Conservative**: 3 attempts per 10 minutes
- **Balanced**: 5 attempts per 15 minutes (current) ✅
- **Liberal**: 10 attempts per 30 minutes

### 2. **Account Lockout** (Brute Force Protection)
**Recommended Settings:**
```env
MAX_LOGIN_ATTEMPTS=5                # 5 failed attempts
LOCKOUT_DURATION=900000             # 15 minutes (current)
PROGRESSIVE_LOCKOUT=true            # Enable progressive lockout
LOCKOUT_MULTIPLIER=2                # Double each time
MAX_LOCKOUT_DURATION=86400000       # 24 hours max
```

**Progressive Lockout Timeline:**
- 1st lockout: 15 minutes
- 2nd lockout: 30 minutes
- 3rd lockout: 60 minutes
- 4th lockout: 120 minutes (2 hours)
- 5th+ lockout: 24 hours

### 3. **IP-Based Lockout** (Distributed Attacks)
**Recommended Settings:**
```env
IP_TRACKING=true                    # Enable IP tracking
MAX_ATTEMPTS_PER_IP=10              # 10 attempts per IP
IP_LOCKOUT_DURATION=3600000         # 1 hour (current)
```

## Environment-Specific Recommendations

### Development Environment
```env
# More lenient for development
RATE_LIMIT_MAX=10                   # 10 attempts per 15 minutes
MAX_LOGIN_ATTEMPTS=10               # 10 failed attempts
LOCKOUT_DURATION=300000             # 5 minutes
IP_LOCKOUT_DURATION=1800000         # 30 minutes
```

### Staging Environment
```env
# Similar to production but slightly more lenient
RATE_LIMIT_MAX=7                    # 7 attempts per 15 minutes
MAX_LOGIN_ATTEMPTS=7                # 7 failed attempts
LOCKOUT_DURATION=600000             # 10 minutes
IP_LOCKOUT_DURATION=2700000         # 45 minutes
```

### Production Environment
```env
# Current settings are good for production
RATE_LIMIT_MAX=5                    # 5 attempts per 15 minutes
MAX_LOGIN_ATTEMPTS=5                # 5 failed attempts
LOCKOUT_DURATION=900000             # 15 minutes
IP_LOCKOUT_DURATION=3600000         # 1 hour
PROGRESSIVE_LOCKOUT=true            # Enable progressive lockout
```

## Security vs User Experience Trade-offs

### High Security (Financial/Banking)
```env
RATE_LIMIT_MAX=3                    # 3 attempts per 15 minutes
MAX_LOGIN_ATTEMPTS=3                # 3 failed attempts
LOCKOUT_DURATION=1800000            # 30 minutes
PROGRESSIVE_LOCKOUT=true
LOCKOUT_MULTIPLIER=3                # Triple each time
```

### Balanced Security (E-commerce/Education)
```env
# Current settings are perfect for this category
RATE_LIMIT_MAX=5                    # 5 attempts per 15 minutes
MAX_LOGIN_ATTEMPTS=5                # 5 failed attempts
LOCKOUT_DURATION=900000             # 15 minutes
PROGRESSIVE_LOCKOUT=true
```

### User-Friendly (Social Media/Content)
```env
RATE_LIMIT_MAX=10                   # 10 attempts per 15 minutes
MAX_LOGIN_ATTEMPTS=10               # 10 failed attempts
LOCKOUT_DURATION=600000             # 10 minutes
PROGRESSIVE_LOCKOUT=false           # Disable progressive lockout
```

## Best Practices

### 1. **Clear Communication**
- Always show remaining time to users
- Use specific error messages
- Provide alternative login methods (email reset, admin contact)

### 2. **Graceful Degradation**
- Allow password reset even during lockout
- Provide admin contact information
- Consider manual unlock options

### 3. **Monitoring & Alerts**
- Log all lockout events
- Alert security team for suspicious patterns
- Track lockout rates by IP and time

### 4. **User Experience**
- Remember successful logins
- Allow "Remember Me" to extend sessions
- Provide clear instructions on what to do

## Implementation Examples

### Environment Variables
```env
# Development
NODE_ENV=development
RATE_LIMIT_MAX=10
MAX_LOGIN_ATTEMPTS=10
LOCKOUT_DURATION=300000

# Production
NODE_ENV=production
RATE_LIMIT_MAX=5
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900000
PROGRESSIVE_LOCKOUT=true
```

### Frontend Messages
```typescript
// Rate limit exceeded
"Too many login attempts. Please try again in 15 minutes."

// Account locked
"Account temporarily locked due to multiple failed attempts. Please try again in 15 minutes."

// Progressive lockout
"Account locked due to repeated failed attempts. Lockout duration has been increased for security. Please try again in 30 minutes."
```

## Summary

**Current settings are well-balanced for an educational platform:**

✅ **Rate Limiting**: 15 minutes (reasonable for legitimate users)  
✅ **Account Lockout**: 15 minutes base (good balance)  
✅ **Progressive Lockout**: Prevents repeated attacks  
✅ **IP Lockout**: 1 hour (protects against distributed attacks)  

**Recommendation**: Keep current settings for production. They provide good security without being too restrictive for legitimate users. 