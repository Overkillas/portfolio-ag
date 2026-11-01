'use client';

import { useSelectedLayoutSegments } from 'next/navigation';
import { Header } from './Header';
import { HomeHeader } from './HomeHeader';
import type { Dictionary, Locale } from '@/i18n/dictionaries';

/**
 * Alterna entre o Header antigo (sticky, 6 links + category tabs) e o
 * HomeHeader novo (Figma "Pontossemno", spec v2 §4.1) conforme a rota:
 * a home v2 e o índice /projetos usam o header limpo (com o link da página atual
 * marcado: "sobre" na home, "projetos" no índice); TODAS as outras páginas (contato,
 * categorias, cases em /projetos/<slug>) continuam no Header antigo, que é
 * renderizado no layout.
 *
 * Client wrapper porque a rota só é conhecível no cliente (leitura de URL em
 * Server Component não é suportada no App Router por design — o layout é
 * preservado entre navegações). A decisão usa os SEGMENTOS ATIVOS abaixo do
 * layout [lang] (useSelectedLayoutSegments), e não o pathname: com o modal de
 * case aberto sobre o índice a URL vira /projetos/<slug>, mas o slot `children`
 * continua em ['projetos'] — então o header não troca atrás do modal. Home =
 * [] (sem segmentos); índice = exatamente ['projetos']; um case aberto direto
 * = ['projetos', '<slug>'] e cai no Header antigo, como sempre.
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

  if (isHome || isProjectsIndex) {
    return (
      <HomeHeader
        locale={locale}
        dict={dict}
        active={isProjectsIndex ? 'projects' : 'about'}
      />
    );
  }
  return <Header locale={locale} dict={dict} />;
}
