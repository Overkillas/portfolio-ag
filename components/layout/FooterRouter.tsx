'use client';

import { useSelectedLayoutSegments } from 'next/navigation';
import { Footer } from './Footer';
import { HomeFooter } from './HomeFooter';
import type { Dictionary } from '@/i18n/dictionaries';
import { isFullPageCase } from '@/lib/projects';

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
  // Cases de página completa (Batuco-tuco, Pontinhas soltas) abertos direto: o mesmo
  // footer padrão, com o voltar ao topo.
  const isFullPage = segments.length === 2 && segments[0] === 'projetos' && isFullPageCase(segments[1]);
  // Estudos: o mesmo footer do Figma ("visite também", node 17:2252).
  const isStudies = segments.length === 1 && segments[0] === 'estudos';
  // Minha carreira: "visite também" à direita (Figma 201:64, x=919 numa banda de 1728).
  const isCareer = segments.length === 1 && segments[0] === 'carreira';

  // "visite também" à direita na home (Figma 17:69), na carreira e nas telas de
  // projetos (índice e cases de página completa); só Estudos o mantém à esquerda.
  if (isHome || isFullPage || isCareer) return <HomeFooter dict={dict} visitAlign="right" />;
  if (isStudies) return <HomeFooter dict={dict} />;
  if (isProjectsIndex) return <HomeFooter dict={dict} variant="projects" visitAlign="right" />;
  return <Footer dict={dict} />;
}
