import Link from "next/link";
import type { Dictionary, Locale } from "@/i18n/dictionaries";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  NavBerry,
  activeNavStyle,
  navLinkClass,
  navLinkStyle,
} from "./nav-link";

/**
 * Header específico da home — fiel ao Figma "Pontossemno" (spec v2 §4.1):
 * - 102px de altura, fundo cream SÓLIDO (#F9F3EA) — sem sticky nem blur
 * - Apenas 2 links: "sobre" (esquerda) e "projetos" (direita)
 * - AM Novecento 32px, cor #BACCEB, lowercase (22/24px até o md: em mobile
 *   375px, "sobre" + switcher + "projetos" a 32px não cabem e criam overflow
 *   horizontal no root — scrollWidth 422 vs 375)
 * - LanguageSwitcher no centro exato (grid 1fr auto 1fr): o mirtilo alarga só
 *   o link ativo e não pode deslocar o seletor
 * - Padding horizontal de 120px (x=120 no canvas de 1728)
 *
 * Server Component — recebe locale+dict como props (mesmo padrão do Header).
 * Substitui o Header antigo na home e no índice /projetos, via HeaderRouter no
 * layout. No índice, `active="projects"` marca o link "projetos" com
 * aria-current="page"; na home o ativo é "sobre". O link ativo ganha azul forte,
 * sombra e o mirtilo do design (decorativo, dentro do link).
 * Hover dos links: micro-movimento do design (sobe, inclina, cresce), desligado
 * com reduced motion.
 * A cor vai inline: a regra global `a { color: inherit }` vence as utilities
 * do Tailwind no layer (mesmo padrão do Header antigo).
 */
export function HomeHeader({
  locale,
  dict,
  active,
}: {
  locale: Locale;
  dict: Dictionary;
  active?: "about" | "projects";
}) {
  const linkStyle = navLinkStyle;
  const activeStyle = activeNavStyle;
  const activeClass = "relative";
  const leftClass = "justify-self-start";
  const rightClass = "justify-self-end";
  const berry = <NavBerry side="left" />;
  const linkClass = navLinkClass;

  const projectsHref = `/${locale}/projetos`;

  return (
    <header className="h-[102px] w-full bg-[color:var(--color-cream)]">
      <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center px-6 md:px-[120px]">
        {/* Esquerda: "sobre" — aponta pra própria home (igual ao nav.about antigo) */}
        <Link
          href={`/${locale}`}
          aria-current={active === "about" ? "page" : undefined}
          className={
            active === "about"
              ? `${linkClass} ${leftClass} ${activeClass}`
              : `${linkClass} ${leftClass}`
          }
          style={active === "about" ? activeStyle : linkStyle}
        >
          {active === "about" && berry}
          {dict.nav.homeAbout}
        </Link>

        {/* Centro: seletor de idioma (componente existente, i18n obrigatório) */}
        <LanguageSwitcher currentLocale={locale} dict={dict} />

        {/* Direita: "projetos" */}
        <Link
          href={projectsHref}
          aria-current={active === "projects" ? "page" : undefined}
          className={
            active === "projects"
              ? `${linkClass} ${rightClass} ${activeClass}`
              : `${linkClass} ${rightClass}`
          }
          style={active === "projects" ? activeStyle : linkStyle}
        >
          {active === "projects" && berry}
          {dict.nav.homeProjects}
        </Link>
      </div>
    </header>
  );
}
