import Link from 'next/link';
import type { Dictionary, Locale } from '@/i18n/dictionaries';
import { LanguageSwitcher } from './LanguageSwitcher';

/**
 * Header específico da home — fiel ao Figma "Pontossemno" (spec v2 §4.1):
 * - 102px de altura, fundo cream SÓLIDO (#F9F3EA) — sem sticky nem blur
 * - Apenas 2 links: "sobre" (esquerda) e "projetos" (direita)
 * - AM Novecento 32px, cor #BACCEB, lowercase (22/24px até o md: em mobile
 *   375px, "sobre" + switcher + "projetos" a 32px não cabem e criam overflow
 *   horizontal no root — scrollWidth 422 vs 375)
 * - LanguageSwitcher no centro
 * - Padding horizontal de 120px (x=120 no canvas de 1728)
 *
 * Server Component — recebe locale+dict como props (mesmo padrão do Header).
 * Substitui o Header antigo SÓ na home, via HeaderRouter no layout.
 * A cor vai inline: a regra global `a { color: inherit }` vence as utilities
 * do Tailwind no layer (mesmo padrão do Header antigo).
 */
export function HomeHeader({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const linkStyle = { color: 'var(--color-blue-soft)' } as const;
  const linkClass =
    'font-display text-[22px] lowercase leading-none transition-opacity hover:opacity-70 sm:text-[24px] md:text-[32px]';

  // Sem rota /projetos única no repo (só /projetos/<slug>): o link aponta para
  // o case principal "Pontossemno" — decisão documentada no relatório do plan.
  const projectsHref = `/${locale}/projetos/pontos-sem-no`;

  return (
    <header className="h-[102px] w-full bg-[color:var(--color-cream)]">
      <div className="flex h-full items-center justify-between px-6 md:px-[120px]">
        {/* Esquerda: "sobre" — aponta pra própria home (igual ao nav.about antigo) */}
        <Link
          href={`/${locale}`}
          className={linkClass}
          style={linkStyle}
        >
          {dict.nav.homeAbout}
        </Link>

        {/* Centro: seletor de idioma (componente existente, i18n obrigatório) */}
        <LanguageSwitcher currentLocale={locale} dict={dict} />

        {/* Direita: "projetos" */}
        <Link
          href={projectsHref}
          className={linkClass}
          style={linkStyle}
        >
          {dict.nav.homeProjects}
        </Link>
      </div>
    </header>
  );
}