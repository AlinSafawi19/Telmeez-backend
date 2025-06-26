import { en } from './en';
import { ar } from './ar';
import { fr } from './fr';

export type Language = 'en' | 'ar' | 'fr';

const translations = {
  en,
  ar,
  fr
};

export const getTranslation = (language: Language = 'en') => {
  return translations[language] || translations.en;
};

export { en, ar, fr }; 