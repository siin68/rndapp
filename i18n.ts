import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getRequestLocale } from 'next-intl/server';

export const locales = ['en', 'vi'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // This now works in combination with the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale as Locale)) {
    locale = 'en'; // Default to 'en' if no valid locale
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
