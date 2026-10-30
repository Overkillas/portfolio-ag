'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navLinks, categoryTabs } from '@/lib/site';
import type { Dictionary, Locale } from '@/i18n/dictionaries';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const pathname = usePathname();
  // Strip locale prefix for comparison: /pt-BR/contato → /contato
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  // Figma (get_design_context 365:429): a cor de TODOS os itens é #6f96ce; o
  // item ativo se distingue só pelo PESO — Clother Black (900) — e os inativos
  // são Clother Regular (400), SEM fade de opacidade.
  //
  // A COR vai inline (não via classe `text-[color:...]`): a regra global solta
  // `a { color: inherit }` (globals.css) vence as utilities do Tailwind no layer,
  // então o link herdava o ink (#1a2949) do body. Inline style ganha de tudo —
  // mesmo padrão que o ProjectCard usa pra sobrescrever a regra global de h1-h4.
  const linkStyle = { color: 'var(--color-blue)' } as const;
  const linkClass = (active: boolean) =>
    `whitespace-nowrap transition-opacity hover:opacity-70 ${active ? 'font-black' : 'font-normal'}`;

  return (
    <header className="w-full bg-[color:var(--color-cream)]/95 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--color-cream)]/80 sticky top-0 z-30">
      {/* Fiel ao Figma: header NÃO centralizado — ocupa a largura cheia com
          ~40px de respiro nas laterais (nav à esquerda, abas à direita).
          Mobile: px-6 + text-sm (padrão do HomeHeader, ad4bacd) — em 375px,
          os dois links + switcher a 16px/px-10 estouram ~415px e os links
          quebram em duas linhas; a 14px/px-6 cabe em uma. */}
      <div className="flex w-full flex-col gap-3 px-6 py-4 text-sm md:flex-row md:items-center md:justify-between md:px-10 md:text-base">
        {/* Esquerda: Sobre mim · Solicitar serviços + seletor de idioma */}
        <div className="flex flex-wrap items-center gap-6">
          <nav className="flex items-center gap-4">
            {navLinks.map((link) => {
              const active = pathWithoutLocale === link.href;
              return (
                <Link
                  key={link.href}
                  href={`/${locale}${link.href}`}
                  aria-current={active ? 'page' : undefined}
                  className={linkClass(active)}
                  style={linkStyle}
                >
                  {dict.nav[link.key]}
                </Link>
              );
            })}
          </nav>
          <LanguageSwitcher currentLocale={locale} dict={dict} />
        </div>

        {/* Direita: Gráfico · Interação · Serviços · 3D */}
        <nav className="flex items-center gap-4">
          {categoryTabs.map((tab) => {
            const active = pathWithoutLocale === tab.href;
            return (
              <Link
                key={tab.href}
                href={`/${locale}${tab.href}`}
                aria-current={active ? 'page' : undefined}
                className={linkClass(active)}
                style={linkStyle}
              >
                {dict.nav[tab.key]}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}