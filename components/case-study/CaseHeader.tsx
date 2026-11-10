'use client';

import Link from 'next/link';
import type { Ref } from 'react';
import { useTranslations } from '@/lib/i18n/use-translation';
import { NavBerry, activeNavStyle, navLinkClass } from '@/components/layout/nav-link';

/**
 * Header dos cases (Figma "Identidade de evento", topo do frame): só o botão
 * redondo de voltar à esquerda e "projetos" (com o mirtilo) à direita, alinhados
 * à coluna do case. 40px do topo (y=40 no canvas de 1728).
 *
 * Duas formas:
 * - com `onBack` (modal sobre o índice): os dois são botões que fecham o modal,
 *   já que fechar é voltar para a grade de projetos;
 * - sem `onBack` (página completa, aberta pela URL): os dois são links para o índice.
 */
export function CaseHeader({
  onBack,
  backRef,
  wide = false,
}: {
  onBack?: () => void;
  /** Recebe o foco ao abrir o modal. */
  backRef?: Ref<HTMLButtonElement>;
  /** Case com layout 'wide' (no modal): alinha à coluna de 1352px (`.container-wide`). */
  wide?: boolean;
}) {
  const { t, locale } = useTranslations();
  const href = `/${locale}/projetos`;
  const backLabel = t('projectsPage.back');
  const projectsLabel = t('nav.homeProjects');

  // Figma: 48px, preenchimento #eaeef4, borda tracejada #527fb0 e anel #baccEB.
  // A seta leva a cor no próprio SVG: no <Link>, `a { color: inherit }` vence as utilities.
  const backClass =
    'inline-flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-[#527fb0] bg-[linear-gradient(180deg,#eef2f8,#e4eaf3)] shadow-[0_0_0_2px_#eaeef4,0_0_0_4px_#baccEB] transition-transform duration-[250ms] ease-[cubic-bezier(.2,.9,.3,1.4)] hover:-translate-x-1 focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-[#0e488b] motion-reduce:transition-none';
  const chevron = (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M15 5l-7 7 7 7"
        fill="none"
        stroke="#527fb0"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
  const projectsClass = `${navLinkClass} relative cursor-pointer bg-transparent p-0`;

  return (
    <header className={`${wide ? 'container-wide' : 'container-case'} flex items-center justify-between pt-10`}>
      {onBack ? (
        <>
          <button
            ref={backRef}
            type="button"
            onClick={onBack}
            aria-label={backLabel}
            className={backClass}
          >
            {chevron}
          </button>
          <button type="button" onClick={onBack} className={projectsClass} style={activeNavStyle}>
            {projectsLabel}
            <NavBerry />
          </button>
        </>
      ) : (
        <>
          <Link href={href} aria-label={backLabel} className={backClass}>
            {chevron}
          </Link>
          <Link href={href} className={projectsClass} style={activeNavStyle}>
            {projectsLabel}
            <NavBerry />
          </Link>
        </>
      )}
    </header>
  );
}
