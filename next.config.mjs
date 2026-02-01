// next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

// Ako ti je request.ts u root folderu i18n/request.ts:
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ovde ne dodaj i18n: { locales... } jer to je za Pages rutera, ne za App ruter!
};

export default withNextIntl(nextConfig);