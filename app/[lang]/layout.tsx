import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { notFound } from 'next/navigation';
import { getDictionary, isLocale } from '@/i18n/dictionaries';
import { locales } from '@/i18n/config';
import { HeaderRouter } from '@/components/layout/HeaderRouter';
import { FooterRouter } from '@/components/layout/FooterRouter';
import { I18nProvider } from '@/lib/i18n/provider';
import './globals.css';

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const dict = await getDictionary(lang);

  return {
    // hreflang exige URL absoluta (Google valida full-qualified); o SITE_URL é
    // a origem pública do site (definido no deploy). O x-default aponta para o
    // locale padrão — padrão de mercado para sets hreflang.
    metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
    title: {
      default: dict.site.name,
      template: `%s · ${dict.site.name}`,
    },
    description: dict.site.tagline,
    openGraph: {
      title: dict.site.name,
      description: dict.site.tagline,
      locale: lang === 'pt-BR' ? 'pt_BR' : 'en_US',
      type: 'website',
    },
    alternates: {
      languages: {
        'pt-BR': '/pt-BR',
        en: '/en',
        'x-default': '/pt-BR',
      },
    },
  };
}

// Kit Adobe Fonts (AM Novecento 400 + Clother 300/400/700, com itálicos). O ID
// é público (aparece no HTML), então fica como padrão no código; a env var
// NEXT_PUBLIC_TYPEKIT_ID só serve para trocar de kit.
const TYPEKIT_ID = process.env.NEXT_PUBLIC_TYPEKIT_ID || 'zey0cjx';

// Nunito (OFL) — textos do app no case Batuco-tuco. Arquivo variável (400–800,
// subset latin do Google Fonts) versionado no repo: o next/font/google baixa a
// fonte durante o build e falhava quando a rede oscilava. Exposta como
// --font-nunito-next e consumida por --font-nunito (globals.css).
const nunito = localFont({
  src: '../fonts/nunito-latin-wght.woff2',
  weight: '400 800',
  display: 'swap',
  variable: '--font-nunito-next',
});

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <html lang={lang} className={`h-full ${nunito.variable}`} suppressHydrationWarning>
      <head>
        {/* Adobe Fonts (Typekit): am-novecento e clother, consumidas por
            --font-display / --font-body em globals.css. */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
        <link rel="preconnect" href="https://p.typekit.net" crossOrigin="" />
        <link rel="stylesheet" href={`https://use.typekit.net/${TYPEKIT_ID}.css`} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <I18nProvider dict={dict} locale={lang}>
          {/* Single back-to-top target, before the header so the next Tab lands on the nav */}
          <div id="top" tabIndex={-1} className="outline-none" />
          {/* Roteia: home v2 usa HomeHeader (Figma Pontossemno); demais
              páginas mantêm o Header antigo */}
          <HeaderRouter locale={lang} dict={dict} />
          <main className="flex-1">{children}</main>
          {/* Roteia: home v2 usa HomeFooter (Figma Pontossemno); demais
              páginas mantêm o Footer antigo */}
          <FooterRouter dict={dict} />
        </I18nProvider>
      </body>
    </html>
  );
}