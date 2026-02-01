// i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'sr', 'de'] as const;

// Opciono: definiši rutiranje (preporučeno u novijim verzijama)
export const routing = defineRouting({
  locales: locales,
  defaultLocale: 'en'
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);