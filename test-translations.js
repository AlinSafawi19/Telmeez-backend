const { getTranslation } = require('./dist/translations');

// Test the translation system
console.log('Testing English translations:');
const enTranslations = getTranslation('en');
console.log('Promo code required:', enTranslations.checkout.server_errors.promo_code_required);
console.log('Invalid promo code:', enTranslations.checkout.server_errors.invalid_promo_code);

console.log('\nTesting Arabic translations:');
const arTranslations = getTranslation('ar');
console.log('Promo code required:', arTranslations.checkout.server_errors.promo_code_required);
console.log('Invalid promo code:', arTranslations.checkout.server_errors.invalid_promo_code);

console.log('\nTesting French translations:');
const frTranslations = getTranslation('fr');
console.log('Promo code required:', frTranslations.checkout.server_errors.promo_code_required);
console.log('Invalid promo code:', frTranslations.checkout.server_errors.invalid_promo_code);

console.log('\nTesting fallback to English:');
const fallbackTranslations = getTranslation('invalid');
console.log('Promo code required:', fallbackTranslations.checkout.server_errors.promo_code_required); 