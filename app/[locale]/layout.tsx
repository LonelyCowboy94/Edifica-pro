// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import "../globals.css";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // MORA biti Promise
}) {
  // 1. Čekamo params da dobijemo locale
  const { locale } = await params;

  // 2. Provera validnosti
  const locales = ['en', 'sr', 'de'];
  if (!locales.includes(locale)) {
    notFound();
  }

  // 3. Uzimamo poruke SPECIFIČNE za taj locale
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        {/* 4. Prosleđujemo locale i poruke provajderu */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}