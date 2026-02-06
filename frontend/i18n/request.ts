import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

const locales = ['en', 'sr', 'de'];

export default getRequestConfig(async ({ locale: localeParam }) => {
  
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get('NEXT_LOCALE')?.value;

  const headerList = await headers();
  const pathname = headerList.get('x-next-intl-pathname') || '';
  const localeFromUrl = locales.find(l => pathname.startsWith(`/${l}`));

  const finalLocale = localeParam || localeFromUrl || localeFromCookie || 'en';

  console.log("🚀 FINAL LOCALE DETERMINED:", finalLocale);

  return {
    locale: finalLocale,
    messages: (await import(`../messages/${finalLocale}.json`)).default
  };
});