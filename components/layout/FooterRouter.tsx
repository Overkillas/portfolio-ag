'use client';

import { useSelectedLayoutSegments } from 'next/navigation';
import { Footer } from './Footer';
import { HomeFooter } from './HomeFooter';
import type { Dictionary } from '@/i18n/dictionaries';

/**
 * Alterna entre o Footer antigo (bg-band, outras páginas) e o HomeFooter novo
 * (Figma "Pontossemno", spec v2 §4.9 — "visite também" gigante transbordando
 * acima da banda) conforme a rota. Espelha o HeaderRouter: o footer vive no
 * layout, e a rota só é conhecível no cliente. A decisão usa os segmentos
 * ativos abaixo do layout [lang] (useSelectedLayoutSegments), não o pathname,
 * para não trocar de footer atrás do modal de case (a URL vira
 * /projetos/<slug>, mas o slot `children` segue em ['projetos']). Home = []
 * (sem segmentos); índice = exatamente ['projetos'] — ambos usam o HomeFooter.
 */
export function FooterRouter({ dict }: { dict: Dictionary }) {
  const segments = useSelectedLayoutSegments();
  const isHome = segments.length === 0;
  const isProjectsIndex = segments.length === 1 && segments[0] === 'projetos';

  if (isHome) return <HomeFooter dict={dict} />;
  if (isProjectsIndex) return <HomeFooter dict={dict} variant="projects" />;
  return <Footer dict={dict} />;
}
