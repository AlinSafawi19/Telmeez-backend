# Backend Translation System

This directory contains the translation files for the Telmeez backend API.

## Supported Languages

- **English (en)** - Default language
- **Arabic (ar)** - Arabic translations
- **French (fr)** - French translations

## File Structure

```
translations/
├── index.ts      # Main translation export and utility functions
├── en.ts         # English translations
├── ar.ts         # Arabic translations
├── fr.ts         # French translations
└── README.md     # This file
```

## Usage

### In Controllers

```typescript
import { getTranslation, Language } from '../translations';

export const someController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get language from request headers (default to 'en')
    const language = (req.headers['accept-language'] as Language) || 'en';
    const t = getTranslation(language);

    // Use translations
    res.status(400).json({
      success: false,
      message: t.checkout.server_errors.promo_code_required
    });
  } catch (error) {
    // Handle errors with translations
    const language = (req.headers['accept-language'] as Language) || 'en';
    const t = getTranslation(language);
    
    res.status(500).json({
      success: false,
      message: t.checkout.server_errors.general_error
    });
  }
};
```

### Frontend Integration

The frontend should send the current language in the `Accept-Language` header:

```typescript
const response = await fetch('/api/checkout/validate-promo', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Accept-Language': currentLanguage // 'en', 'ar', or 'fr'
  },
  body: JSON.stringify(data)
});
```

## Translation Keys

### Checkout Errors (`checkout.server_errors`)

- `promo_code_required` - Promo code is required
- `invalid_promo_code` - Invalid or inactive promo code
- `promo_code_not_valid_yet` - Promo code is not yet valid
- `promo_code_expired` - Promo code has expired
- `promo_code_first_time_only` - This promo code is only valid for first-time users
- `email_required_for_promo` - Email is required to validate first-time user promo code
- `validation_error` - An error occurred while validating promo code
- `checkout_error` - An error occurred during checkout
- `missing_required_fields` - Missing required fields
- `user_already_exists` - User with this email already exists
- `invalid_plan` - Invalid plan selected
- `super_admin_role_not_found` - Super Admin role not found in system
- `general_error` - An error occurred during checkout

### Checkout Success (`checkout.success`)

- `checkout_completed` - Checkout completed successfully
- `promo_code_validated` - Promo code validated successfully

## Adding New Languages

1. Create a new file `[language-code].ts` (e.g., `es.ts` for Spanish)
2. Export an object with the same structure as the existing language files
3. Add the new language to the `translations` object in `index.ts`
4. Update the `Language` type in `index.ts`

## Adding New Translation Keys

1. Add the new key to all language files (`en.ts`, `ar.ts`, `fr.ts`)
2. Provide translations for all supported languages
3. Use the new key in your controllers

## Testing

You can test the translation system using the test file:

```bash
node test-translations.js
```

This will output translations for different languages to verify they're working correctly. 