// proxy.ts
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'sr', 'de'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

export default function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const { pathname } = req.nextUrl;

  // 1. Ekstrakcija lokala za potrebe redirect-a
  const locale = pathname.split('/')[1] || 'en';

  // 2. Dekodiranje role iz JWT-a (bez validacije potpisa, to radi Backend)
  let userRole: string | null = null;
  if (token) {
    try {
      // JWT je strukture Header.Payload.Signature. Uzimamo Payload (indeks 1)
      const payloadPart = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadPart));
      userRole = decodedPayload.role;
    } catch (e) {
      console.error("Greška pri dekodiranju tokena:", e);
    }
  }

  // 3. Provera ruta
  const isAdminPage = pathname.split('/').some(segment => segment === 'admin');
  const isDashboardPage = pathname.split('/').some(segment => segment === 'dashboard');

  // Logika za /admin rutu (Samo SUPER_ADMIN)
  if (isAdminPage) {
    if (!token) {
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }
    if (userRole !== 'SUPER_ADMIN') {
      // Ako nije Super Admin, baci ga na dashboard ili login
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
    }
  }

  // Logika za /dashboard rutu (OWNER, ADMIN ili SUPER_ADMIN)
  if (isDashboardPage) {
    if (!token) {
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }
    
    const allowedRoles = ['OWNER', 'ADMIN', 'SUPER_ADMIN'];
    if (!userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/', '/(de|en|sr)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};