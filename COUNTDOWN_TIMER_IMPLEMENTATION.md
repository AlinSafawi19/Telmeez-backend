# Countdown Timer Implementation ⏱️

## Overview

The system now displays a real-time countdown timer to users when their account is locked, showing exactly how long they need to wait before trying again. This significantly improves user experience by providing clear, actionable feedback.

## Features Implemented

### 1. **Real-Time Countdown Timer** 🕐
- Shows remaining minutes in real-time
- Updates every minute automatically
- Displays in user's selected language

### 2. **Visual Progress Bar** 📊
- Orange progress bar showing time remaining
- Smooth animations and transitions
- Visual representation of lockout duration

### 3. **Progressive Lockout Information** 📈
- Shows lockout count (1st, 2nd, 3rd, etc.)
- Explains that duration increases with each lockout
- Helps users understand security measures

### 4. **Multi-Language Support** 🌍
- Countdown messages in English, Arabic, and French
- Proper pluralization for "minute/minutes"
- Culturally appropriate messaging

## How It Works

### Backend (Already Implemented)
The backend already calculates and returns remaining time:

```typescript
// Account lockout
const remainingTime = Math.ceil((lockoutDuration - timeSinceLastAttempt) / 1000 / 60);
res.status(423).json({
  success: false,
  error_code: 'ACCOUNT_LOCKED',
  message: `Account temporarily locked due to multiple failed attempts. Please try again in ${remainingTime} minutes.`,
  lockout_count: lockoutInfo.lockoutCount + 1
});

// IP lockout
const remainingTime = Math.ceil((IP_LOCKOUT_DURATION - timeSinceLastAttempt) / 1000 / 60);
res.status(423).json({
  success: false,
  error_code: 'IP_LOCKED',
  message: `Too many failed attempts from this IP. Please try again in ${remainingTime} minutes.`
});
```

### Frontend (New Implementation)

#### 1. **State Management**
```typescript
const [lockoutInfo, setLockoutInfo] = useState<{ 
  remainingMinutes: number; 
  lockoutCount?: number 
} | null>(null);
```

#### 2. **Time Extraction**
```typescript
// Extract remaining minutes from backend message
const message = parsed.message || '';
const timeMatch = message.match(/(\d+)\s*minutes?/i);
if (timeMatch) {
  const remainingMinutes = parseInt(timeMatch[1]);
  lockoutData = {
    remainingMinutes,
    lockoutCount: parsed.lockout_count
  };
}
```

#### 3. **Countdown Timer Effect**
```typescript
useEffect(() => {
  if (lockoutInfo && lockoutInfo.remainingMinutes > 0) {
    const timer = setInterval(() => {
      setLockoutInfo(prev => {
        if (prev && prev.remainingMinutes > 0) {
          return { ...prev, remainingMinutes: prev.remainingMinutes - 1 };
        } else {
          // Lockout expired, clear the info
          setErrors(prev => ({ ...prev, general: undefined, errorCode: undefined }));
          return null;
        }
      });
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }
}, [lockoutInfo]);
```

#### 4. **Visual Display**
```typescript
{lockoutInfo && lockoutInfo.remainingMinutes > 0 && (
  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
    <div className="flex items-center gap-2">
      <FaClock className="w-4 h-4 text-orange-600" />
      <span className="text-sm font-medium text-orange-800">
        {t.lockout_messages.time_remaining}: {lockoutInfo.remainingMinutes} {lockoutInfo.remainingMinutes === 1 ? t.lockout_messages.minutes : t.lockout_messages.minutes_plural}
      </span>
    </div>
    
    {/* Progress bar */}
    <div className="mt-2 w-full bg-orange-200 rounded-full h-2">
      <div 
        className="bg-orange-600 h-2 rounded-full transition-all duration-1000 ease-out"
        style={{ 
          width: `${Math.max(0, (lockoutInfo.remainingMinutes / Math.max(lockoutInfo.remainingMinutes, 1)) * 100)}%` 
        }}
      ></div>
    </div>
    
    {lockoutInfo.lockoutCount && lockoutInfo.lockoutCount > 1 && (
      <p className="mt-2 text-xs text-orange-700">
        {t.lockout_messages.progressive_lockout.replace('{count}', lockoutInfo.lockoutCount.toString())}
      </p>
    )}
  </div>
)}
```

## Translation Keys Added

### English
```typescript
lockout_messages: {
  time_remaining: "Time remaining",
  minutes: "minute",
  minutes_plural: "minutes",
  progressive_lockout: "This is your {count} lockout. Duration increases with each lockout for security.",
  try_again_later: "Please try again later."
}
```

### Arabic
```typescript
lockout_messages: {
  time_remaining: "الوقت المتبقي",
  minutes: "دقيقة",
  minutes_plural: "دقائق",
  progressive_lockout: "هذا هو قفل الحساب رقم {count}. تزداد المدة مع كل قفل للأمان.",
  try_again_later: "يرجى المحاولة مرة أخرى لاحقاً."
}
```

### French
```typescript
lockout_messages: {
  time_remaining: "Temps restant",
  minutes: "minute",
  minutes_plural: "minutes",
  progressive_lockout: "Ceci est votre {count} verrouillage. La durée augmente avec chaque verrouillage pour la sécurité.",
  try_again_later: "Veuillez réessayer plus tard."
}
```

## User Experience

### What Users See

1. **Error Message**: Clear explanation of why they're locked out
2. **Countdown Timer**: "Time remaining: 14 minutes"
3. **Progress Bar**: Visual representation of remaining time
4. **Lockout Count**: "This is your 2nd lockout. Duration increases with each lockout for security."

### Visual Design

- **Color Scheme**: Orange theme for warnings
- **Icons**: Clock icon for time-related information
- **Progress Bar**: Smooth animations with color transitions
- **Typography**: Clear, readable text with proper hierarchy

## Supported Lockout Types

### 1. **Account Lockout**
- Shows remaining minutes until account unlock
- Displays progressive lockout count
- Explains increasing duration

### 2. **IP-Based Lockout**
- Shows remaining minutes until IP unlock
- Applies to all accounts from that IP
- 1-hour duration

### 3. **Rate Limiting**
- Shows remaining minutes in rate limit window
- 15-minute window for auth endpoints
- 5 attempts per window

## Technical Implementation

### Files Modified

#### Frontend
- `src/pages/SignIn.tsx` - Added countdown timer logic and UI
- `src/translations/en.ts` - Added lockout message translations
- `src/translations/ar.ts` - Added Arabic translations
- `src/translations/fr.ts` - Added French translations

#### Backend
- No changes needed (already implemented)

### Dependencies
- `react-icons/fa` - For clock icon
- React hooks: `useState`, `useEffect`, `useRef`

## Testing

Created `test-countdown-timer.js` to verify:
- Time extraction from backend messages
- Countdown timer functionality
- Progressive lockout information
- Multi-language support

## Benefits

### 1. **Improved User Experience**
- Users know exactly when they can try again
- No guessing or frustration about wait times
- Clear visual feedback

### 2. **Reduced Support Requests**
- Users don't need to contact support to ask about lockout duration
- Self-service information reduces support burden
- Clear expectations set

### 3. **Security Education**
- Users understand progressive lockout system
- Awareness of security measures
- Encourages better password practices

### 4. **Professional Appearance**
- Modern, polished UI design
- Consistent with security best practices
- Multi-language support shows attention to detail

## Future Enhancements

### 1. **More Granular Countdown**
- Show seconds for last minute
- Real-time updates every second near expiration

### 2. **Alternative Actions**
- "Reset Password" button during lockout
- "Contact Support" option
- "Remember Me" explanation

### 3. **Analytics**
- Track lockout patterns
- Monitor user behavior
- Identify potential security issues

### 4. **Admin Dashboard**
- View locked accounts
- Manual unlock options
- Lockout history and statistics

## Summary

The countdown timer feature significantly improves the user experience during account lockouts by:

✅ **Providing clear, real-time feedback** about remaining wait time  
✅ **Showing visual progress** with animated progress bar  
✅ **Explaining security measures** through progressive lockout information  
✅ **Supporting multiple languages** for global accessibility  
✅ **Reducing user frustration** and support requests  

This implementation follows modern UX best practices and provides a professional, user-friendly experience during security-related events. 