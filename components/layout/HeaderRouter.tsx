'use client';

import { useSelectedLayoutSegments } from 'next/navigation';
import { Header } from './Header';
import { HomeHeader } from './HomeHeader';
import { CaseHeader } from '@/components/case-study/CaseHeader';
import type { Dictionary, Locale } from '@/i18n/dictionaries';
import { isFullPageCase } from '@/lib/projects';

/**
 * Alterna entre o Header antigo (sticky, 6 links + category tabs) e o
 * HomeHeader novo (Figma "Pontossemno", spec v2 §4.1) conforme a rota:
 * a home v2 e o índice /projetos usam o header limpo (com o link da página atual
 * marcado: "sobre" na home, "projetos" no índice); o case aberto direto
 * (/projetos/<slug>) usa o CaseHeader (voltar + "projetos", como no Figma); as
 * outras páginas (contato, categorias) continuam no Header antigo.
 *
 * Client wrapper porque a rota só é conhecível no cliente (leitura de URL em
 * Server Component não é suportada no App Router por design — o layout é
 * preservado entre navegações). A decisão usa os SEGMENTOS ATIVOS abaixo do
 * layout [lang] (useSelectedLayoutSegments), e não o pathname: com o modal de
 * case aberto sobre o índice a URL vira /projetos/<slug>, mas o slot `children`
 * continua em ['projetos'] — então o header não troca atrás do modal. Home =
 * [] (sem segmentos); índice = exatamente ['projetos']; um case aberto direto
 * = ['projetos', '<slug>'] e usa o CaseHeader.
 */
export function HeaderRouter({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const segments = useSelectedLayoutSegments();
  const isHome = segments.length === 0;
  const isProjectsIndex = segments.length === 1 && segments[0] === 'projetos';
  // Cases de página completa (Batuco-tuco, Pontinhas soltas) abertos direto: o frame do
  // Figma não tem header (só a barra de voltar, desenhada pelo próprio case). Com o modal
  // aberto os segmentos continuam ['projetos'].
  const isFullPage = segments.length === 2 && segments[0] === 'projetos' && isFullPageCase(segments[1]);
  // Estudos (Figma 17:2174): também sem header — a página desenha a própria barra.
  const isStudies = segments.length === 1 && segments[0] === 'estudos';

  if (isFullPage || isStudies) return null;
  if (isHome || isProjectsIndex) {
    return (
      <HomeHeader
        locale={locale}
        dict={dict}
        active={isProjectsIndex ? 'projects' : 'about'}
      />
    );
  }
  // Case aberto direto (/projetos/<slug>): header do Figma, só voltar + "projetos".
  if (segments.length === 2 && segments[0] === 'projetos') {
    return <CaseHeader />;
  }
  return <Header locale={locale} dict={dict} />;
}
