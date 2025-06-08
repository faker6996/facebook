// lib/i18n/getMessages.ts
import { type Locale } from '@/i18n.config';

export const getMessages = async (locale: Locale) => {
  return (await import(`@/locales/${locale}.json`)).default;
};
