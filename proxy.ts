// proxy.ts
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

// 1. Inicijalizujemo standardni i18n middleware
const intlMiddleware = createMiddleware({
  locales: ['en', 'sr', 'de'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

// 2. Eksportujemo funkciju koja kombinuje logiku
export default function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token');
  const { pathname } = req.nextUrl;

  // Proveravamo da li korisnik pokušava da uđe na dashboard
  // Pathname obično izgleda ovako: /sr/dashboard ili /en/dashboard
  const isDashboardPage = pathname.split('/').some(segment => segment === 'dashboard');

  if (isDashboardPage) {
    if (!token) {
      // Ako nema tokena, izvlačimo trenutni jezik iz URL-a da bismo ga vratili na ispravan login
      // npr. ako je na /sr/dashboard -> šaljemo ga na /sr/login
      const locale = pathname.split('/')[1] || 'en';
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }
  }

  // Ako nije dashboard ili korisnik ima token, pusti ga kroz i18n middleware
  return intlMiddleware(req);
}

export const config = {
  // Matcher ostaje isti, on pokriva sve bitne rute
  matcher: ['/', '/(de|en|sr)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};