import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, type Locale } from './i18n/config';

const PUBLIC_FILE = /\.(.*)$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, _next internals, and files with extensions
  if (pathname.startsWith('/_next') || PUBLIC_FILE.test(pathname)) {
    return;
  }

  // Already has locale prefix? Let it through
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  if (pathnameHasLocale) return;

  // Segmento inicial parece um locale não suportado (ex.: /fr/contato)? Deixa
  // passar: o layout [lang] valida o locale e responde 404 direto — sem um
  // redirect intermediário. Todas as rotas reais têm mais de 2 letras ('contato',
  // 'grafico') ou começam com dígito ('3d'), então nada legítimo cai aqui.
  const firstSegment = pathname.split('/')[1] ?? '';
  if (firstSegment && /^[a-z]{2}(-[a-zA-Z0-9]{2,8})?$/i.test(firstSegment)) {
    return;
  }

  // Detect locale: cookie > Accept-Language > default
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const acceptLang = request.headers.get('accept-language') ?? '';

  let locale: Locale = defaultLocale;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    locale = cookieLocale as Locale;
  } else if (acceptLang.toLowerCase().includes('en')) {
    locale = 'en';
  }

  // Redirect: /contato → /pt-BR/contato
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};