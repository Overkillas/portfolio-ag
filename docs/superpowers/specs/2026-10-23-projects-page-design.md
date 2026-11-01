# Spec: Página de Projetos (`/[lang]/projetos`) com modal de case

**Data:** 2026-10-23
**Branch:** `feature/project-page`
**Fonte do design:** `for-implement/portfolio-projetos/` (local, **ignorada pelo git** — ver `.gitignore`). Contém o protótipo Next.js do design: `README.md`, `ANIMACOES.md` (tabela de cada animação), `components/projetos/*.tsx`, `components/projetos/projetos.module.css` (tokens, keyframes, responsivo) e `public/projetos/*` (assets).
**Regras obrigatórias:** `AGENTS.md` (i18n) e `docs/superpowers/specs/2026-10-19-i18n-design.md`.

---

## 1. Intenção

O site não tem uma página que liste todos os projetos. Hoje o link "projetos" do
header da home aponta direto para o case `pontos-sem-no` (gambiarra registrada em
`components/layout/HomeHeader.tsx`). A designer entregou um design de "aba
Projetos": banner "PORTFÓLIO", busca, mascote que reage, filtros por área, grade
bento de cards com hover rico e um modal de projeto com animações.

O objetivo é implementar esse design **com os projetos reais do site** (os 3 que
já existem em `lib/projects.ts` + `dict.projects.*`) e **sem quebrar** as páginas de
case que já existem.

## 2. Decisões da usuária (não reabrir)

1. **Clique no card abre um modal** (não navega para outra página).
2. **O modal mantém o estilo e as animações do design**, mas o **conteúdo segue a
   estrutura de case já estabelecida** no site (a mesma de `CaseShell` + corpo de
   cada `app/[lang]/projetos/<slug>/page.tsx`: capa, subtítulo + status, tags +
   data, intro, processo de criação, prototipagem, projeto final, agradecimento).
   As colunas CONTEXTO / PROCESSO / RESULTADO do design **não** são usadas.
3. **Ao abrir o modal, a URL muda para `/{locale}/projetos/<slug>`** (Intercepting
   + Parallel Routes do App Router). O botão voltar do navegador fecha o modal;
   o link é compartilhável; quem abre a URL direto (ou dá refresh) vê a **página
   completa que já existe hoje**.
4. **Usar os projetos que já existem** no app — **não** as imagens/projetos de
   exemplo do design (`peixes.jpg`, `coelhinhos.jpg`, `jardim.jpg`,
   `cidade-3d.jpg`, `pontos-sem-no.jpg` NÃO entram no repo).
5. Seguir `AGENTS.md` integralmente.

## 3. Objetivos, não-objetivos, anti-objetivos

**Objetivos**
- Nova rota `app/[lang]/projetos/page.tsx` com: header, banner com parallax,
  busca + mascote + balão + filtros, grade bento, cursor personalizado e footer.
- Modal de projeto via rota interceptada, com as animações do design.
- Todas as animações de `ANIMACOES.md` portadas (com as adaptações da §6).
- Bilíngue (pt-BR/en) com paridade total de chaves.
- Link "projetos" do `HomeHeader` passa a apontar para `/{locale}/projetos`.

**Não-objetivos**
- Reescrever textos dos projetos (as descrições com `(PLACEHOLDER)` no dicionário
  continuam como estão — dívida de conteúdo, fora do escopo).
- Mexer nas páginas de categoria (`/grafico`, `/interacao`, `/servicos`, `/3d`) ou
  no `Header` antigo com abas de categoria.
- Reordenação animada ao filtrar (framer-motion `layout`) e prévia em vídeo — são
  "ideias pra evoluir" do design, ficam de fora.
- Adicionar dependências novas.

**Anti-objetivos (falha mesmo que "funcione")**
- Qualquer texto visível hardcoded, ou texto do site dentro de imagem.
- Página de case aberta direto pela URL ficar diferente do que é hoje.
- Header/footer da página trocando visivelmente quando o modal abre ou fecha, ou a
  rolagem da grade "pulando" ao fechar o modal.
- Overflow horizontal em qualquer largura.
- Movimento que ignora `prefers-reduced-motion`.

## 4. Arquitetura de rotas

```
app/[lang]/projetos/
  layout.tsx                 ← NOVO: renderiza {children} e {modal}
  page.tsx                   ← NOVO: índice (grade). Server Component.
  default.tsx                ← NOVO se necessário (fallback do slot children; ver docs)
  @modal/
    default.tsx              ← NOVO: return null
    (.)[slug]/page.tsx       ← NOVO: modal (intercepta /[lang]/projetos/[slug])
  pontos-sem-no/page.tsx     ← EXISTENTE: passa a usar o corpo extraído
  batuco-tuco/page.tsx       ← EXISTENTE: idem
  pontinhas-soltas/page.tsx  ← EXISTENTE: idem
```

- Ler **antes** `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/intercepting-routes.md`
  e `parallel-routes.md` (seção *Modals*). Esta versão do Next (16.2.6) difere do
  que você conhece.
- **Corpo dos cases extraído** para Server Components reutilizáveis, um por
  projeto (ex.: `components/case-study/cases/PontosSemNoCase.tsx` etc.), mais um
  registro `slug → componente`. As 3 páginas existentes passam a renderizar
  `<CaseShell project dict><XCase project={project} /></CaseShell>` e o modal
  renderiza o mesmo conteúdo. **A saída HTML das páginas completas não pode mudar.**
- O modal é um Client Component que **envolve** conteúdo renderizado no servidor
  (padrão "Modal + children" da doc de parallel routes) — o case continua Server
  Component.
- O `(.)[slug]/page.tsx` segue o padrão de rota do AGENTS.md:
  `await params`, `isLocale` → `notFound()`, `getLocalizedProject` → `notFound()`
  para slug desconhecido.
- Os cards são `<Link href={`/${locale}/projetos/${slug}`} scroll={false}>` (o
  locale é prefixado no render, como manda o AGENTS.md). Clique normal → modal
  (interceptado); clique do meio / nova aba → página completa.
- **Fechar o modal** = `router.back()` (botão "voltar aos projetos", tecla Esc,
  botão voltar do navegador).
- **"Próximo"** = `router.replace` para o próximo slug (ordem de `projectMeta`,
  cíclica, **ignora o filtro ativo**), para que o voltar do navegador leve sempre
  de volta à grade e não percorra os projetos um a um.

### 4.1 Troca de idioma numa página de case aberta direto (ponto crítico)

Nesta versão do Next a interceptação acontece sempre que a URL **atual** é a rota
interceptadora **ou qualquer rota abaixo dela** (confirmado em
`node_modules/next/dist/lib/generate-interception-routes-rewrites.js`). O
`LanguageSwitcher` troca de idioma com `router.push` (navegação no cliente). Numa
página de case aberta direto (`/pt-BR/projetos/x` → `/en/projetos/x`), essa
navegação seria interceptada e mostraria o modal por cima de um fallback, em vez
da página completa — quebra o anti-objetivo da §3.

**Correção exigida:** quando a rota atual for `/{locale}/projetos/<slug>`, o
`LanguageSwitcher` faz navegação de página inteira (ex.: `window.location.assign`)
em vez de `router.push`. Nas outras rotas o comportamento continua o mesmo de
hoje. O cookie `NEXT_LOCALE` continua sendo gravado antes. Com o modal aberto o
switcher fica coberto pela folha, então esse caminho não precisa funcionar ali.

Mesmo cuidado para qualquer outro link no cliente que leve de uma página abaixo de
`/projetos/` para outra página de case: hoje não existe nenhum (o "projetos" do
header leva ao índice, e as páginas de categoria ficam fora de `/projetos`), mas se
aparecer, tem que fazer o mesmo.

### 4.2 Header e footer durante o modal (ponto crítico)

O header e o footer são escolhidos em `app/[lang]/layout.tsx` por
`HeaderRouter`/`FooterRouter` a partir do `usePathname()`. Com o modal aberto a URL
vira `/projetos/<slug>`, então pelo pathname eles trocariam para o Header/Footer
antigos atrás do modal e voltariam ao fechar — anti-objetivo da §3.

**Abordagem:** os routers passam a decidir pelos **segmentos ativos**
(`useSelectedLayoutSegments()`, chamado de dentro do layout `[lang]`) em vez do
pathname. Esperado:
- home `/{locale}` → `[]` → HomeHeader/HomeFooter (como hoje);
- `/{locale}/projetos` → `['projetos']` → estilo "projetos" (§5.1/§5.5);
- modal interceptado sobre `/projetos` → o slot `children` continua em
  `['projetos']` → **não troca**;
- `/{locale}/projetos/batuco-tuco` aberto direto → `['projetos','batuco-tuco']`
  → Header/Footer antigos (como hoje).

Isso **precisa ser verificado em runtime** (gate). Se o hook não se comportar
assim nesta versão, o fallback é: o modal registra "aberto" num store mínimo de
módulo (`useSyncExternalStore`) e os routers congelam a última decisão enquanto ele
estiver aberto. Qualquer das duas é aceitável desde que o resultado da §3 valha.

## 5. A página

### 5.1 Header
Usa o **`HomeHeader` existente** ("sobre" · seletor de idioma · "projetos"), não as
imagens `nav-about.png`/`nav-projects.png` do design (texto em inglês dentro de
imagem não é traduzível). Ajustes:
- link "projetos" → `/{locale}/projetos` (e remover o comentário da gambiarra);
- `aria-current="page"` no link "projetos" quando estiver na página de projetos;
- hover dos dois links com o micro-movimento do design
  (`translateY(-3px) rotate(-2deg) scale(1.04)`, .35s `--ease-spring`) — **só se**
  não alterar a home visualmente além do hover.

### 5.2 Banner "PORTFÓLIO"
Usa o **`BrandHero variant="home"`** com título vindo do dicionário
(`Portfólio` / `Portfolio`), não `portfolio-banner.png`. É a mesma fonte (AM
Novecento) e o mesmo gradiente.

**Atenção:** o `BrandHero` trata títulos com ≤ 10 caracteres como "curtos" (74% da
largura, centralizado) — "Portfólio"/"Portfolio" têm 9. O design quer a palavra
**de borda a borda**, com a parte de baixo das letras cortada pela borda inferior
da banda (ver `portfolio-banner.png`, 1728×232: topo das letras em y≈60, centro do
"O" em y≈165, banda termina em 232 → cerca de **16% da altura das letras** fica
abaixo da borda; o acento do "Ó" encosta no topo da banda). O `BrandHero` ganha então props **opcionais e desligadas
por padrão** (nenhuma outra página muda):
- uma que força o modo "largura total" mesmo para título curto, com o corte
  inferior do design;
- uma de parallax: o SVG do título recebe
`translateY(scrollY × 0.18) scale(1 + scrollY × 0.00012)`, limitado a 900px de
rolagem, via `requestAnimationFrame`, desligado com reduced motion. Se o SVG já
  tiver um `transform` (ex.: o `translateX(-50%)` do modo curto), o parallax
  compõe com ele em vez de sobrescrever.

### 5.3 Busca, mascote, balão e filtros
Como no design (`SearchAndFilters.tsx`), com:
- **Busca**: filtra por título, descrição, tags e rótulos de categoria **no idioma
  atual**, sem diferenciar maiúsculas **nem acentos** ("grafico" acha "gráfico").
- **Filtros (pílulas)**: `todos` + as 4 `CategoryKey` de `lib/site.ts`, na ordem do
  design: serviços, 3d, interação, gráfico. Rótulos novos no dicionário, em
  minúsculas como no design. Clicar na pílula ativa volta para "todos".
  `servicos` hoje não tem projeto → mostra o estado vazio (é esperado).
- **Ícones das pílulas**: PNGs do design usados como máscara (herdam a cor do texto).
- **Mascote + balão**: frases do balão no dicionário; plural via chaves separadas
  (`{count} projeto!` / `{count} projetos!`), substituição com `.replace`.
  Humor: feliz no hover de card, triste sem resultados, neutro no resto.
- **Contraste**: o design usa `#D68AAA` sobre `#FADAE7` nas pílulas (abaixo de
  WCAG AA). Manter o tom do design, como o README dele recomenda por padrão.

### 5.4 Grade bento
- Estrutura do design: colunas com `flex` 3fr (estreita) / 4fr (larga); cada
  projeto declara coluna e proporção. Colunas vazias somem ao filtrar.
- **Dados de layout** (não traduzíveis) vão para `projectMeta` em `lib/projects.ts`
  (ex.: `grid: { column, aspect, objectPosition, descLines }` e `featured?`).
- Valores iniciais (minha escolha — as capas são todas faixas 1864×658 com o título
  à esquerda, então o corte é ancorado à esquerda para o título da capa aparecer):

  | Projeto | Coluna | Proporção | Ancoragem | Linhas da descrição | Destaque |
  |---|---|---|---|---|---|
  | pontos-sem-no | 0 (estreita) | 459 / 590 | esquerda | 4 | **sim** |
  | batuco-tuco | 1 (larga) | 612 / 344 | esquerda | 2 | não |
  | pontinhas-soltas | 1 (larga) | 612 / 230 | esquerda | 1 | não |

  Assim a coluna estreita e a larga têm praticamente a mesma altura (igual às duas
  primeiras colunas do design).
- **Largura máxima da grade: 1180px, centralizada** (minha escolha — com 2 colunas
  ocupando a tela toda a 1728px o card alto passaria da altura da tela).
- **Card**: imagem = `coverImage` do projeto; `alt` = `dict.projects.coverAlt`
  com `{title}`. No hover: título (`title`), descrição (`description`, cortada em
  `descLines` linhas) e `tags` do dicionário. Selo "DESTAQUE" com o coelhinho só no
  projeto em destaque. `aria-label` do link traduzido ("Abrir projeto {title}").
- Até 900px as colunas quebram (mínimo 300px), como no design.

### 5.5 Footer
Usa o **`HomeFooter`** existente ("visite também" + redes sociais vindas de
`lib/site.ts`), não `footer-bg.png`. Na página de projetos ele ganha, via prop
opcional (a home fica idêntica):
- link "voltar ao topo" com a seta que balança (`bob`);
- seta ↗ que aparece no hover dos links sociais.

### 5.6 Cursor personalizado
Círculo "abrir projeto →" seguindo o mouse com lerp 0.22, só em
`(hover: hover) and (pointer: fine)`; nesses dispositivos os cards usam
`cursor: none`. Texto do dicionário; o elemento é `aria-hidden`.

## 6. O modal

- **Moldura e movimento do design** (`ProjectSheet.tsx` + `ANIMACOES.md` §5):
  folha creme em tela cheia (`position: fixed; inset: 0`, z-index acima do header
  sticky), fade-in .5s; botão "voltar aos projetos" no topo (estilo pílula
  tracejada do design, hover `translateX(-4px)`); no fim, "próximo: {title} →"
  (seta com hover `translateX(6px)`).
- **Conteúdo = case existente**: `CaseShell` + corpo do projeto (§4). Com animação:
  - capa: expansão por `clip-path` `inset(30% 25% 30% 25% round 24px)` →
    `inset(0 round 8px)` em .9s `--ease-inout`;
  - bloco subtítulo/status/tags/intro: `rise` .7s com 350ms de atraso;
  - seções seguintes: `rise` .7s com 500ms de atraso.

  O `CaseShell` ganha um jeito opcional de receber essas classes de animação
  (desligado por padrão → páginas completas inalteradas). O formato fica a
  critério de quem implementa.
- Ao trocar de projeto ("próximo"), o conteúdo remonta (animações rodam de novo) e
  a folha volta ao topo.
- **Acessibilidade**: `role="dialog"`, `aria-modal="true"`, rotulado pelo título
  do projeto; foco vai para o botão voltar ao abrir; **Tab fica preso dentro do
  modal**; Esc fecha; o foco volta para o card que abriu; scroll do `body` travado
  enquanto aberto e restaurado ao fechar; a posição de rolagem da grade é a mesma
  antes e depois.

## 7. i18n (AGENTS.md)

Tudo em `dictionaries/pt-BR.json` **e** `en.json` na mesma mudança. Chaves
sugeridas (nomes finais a critério de quem implementa, desde que fiquem num
namespace próprio, ex. `projectsPage`):

| Uso | pt-BR | en |
|---|---|---|
| título do banner | Portfólio | Portfolio |
| `metadata.projetos` (aba) | Projetos | Projects |
| rótulo da seção de controles | Busca e filtros | Search and filters |
| rótulo da busca (sr-only) | Pesquisar projetos | Search projects |
| placeholder | Pesquise por um tópico | Search by topic |
| rótulo do grupo de filtros | Filtrar por área | Filter by area |
| filtro todos | todos | all |
| filtro serviços / 3d / interação / gráfico | design de serviços / design 3d / design de interação / design gráfico | service design / 3d design / interaction design / graphic design |
| balão padrão | Olha que legal! | Look how cool! |
| balão destaque | Esse é o meu favorito! | This one's my favorite! |
| balão hover | Clica pra ver! | Click to see! |
| balão busca | Achei {count}! | Found {count}! |
| balão filtro (1) | {count} projeto! | {count} project! |
| balão filtro (n) | {count} projetos! | {count} projects! |
| balão vazio | Hmm… nada por aqui | Hmm… nothing here |
| título sr-only da lista | Projetos ({count}) | Projects ({count}) |
| aria-label do card | Abrir projeto {title} | Open project {title} |
| selo | DESTAQUE | FEATURED |
| cursor (2 linhas) | abrir / projeto | open / project |
| estado vazio | Nenhum projeto com esse tópico… ainda! | No projects on this topic… yet! |
| botão limpar | limpar busca e filtros | clear search and filters |
| voltar do modal | voltar aos projetos | back to projects |
| próximo do modal | próximo: {title} | next: {title} |
| voltar ao topo | voltar ao topo | back to top |

- Setas (←, →, ↑, ↗) **não** vão no dicionário: são `<span aria-hidden>` decorativos.
- `generateMetadata` da nova página com `title: dict.metadata.projetos` e os três
  `alternates.languages` (`pt-BR`, `en`, `x-default` → pt-BR) para `/projetos`.
- Client Components pegam texto via `useTranslations()` ou `dict` por prop vindo de
  Server Component; nunca importam o JSON.

## 8. Estilo e assets

- **Fontes do site**, não as do design: Clother (`--font-body`) no lugar de
  Nunito/Outfit e AM Novecento (`--font-display`) nos títulos display. Pesos 800/900
  do design viram o bold disponível do Clother. Lembrar que `globals.css` força
  h1–h4 para a fonte display; sobrescrever onde preciso (padrão já usado no repo).
- **CSS Module** portado de `projetos.module.css` (tokens escopados na raiz da
  página, keyframes, media queries de responsivo, `hover: none` e reduced motion).
  Cores que já existem em `globals.css` usam o token global
  (`#f9f3ea` → `--color-cream`, `#6f96ce` → `--color-blue`, `#e6eefa` →
  `--color-blue-pale`); o resto fica como token local do módulo.
- **Assets copiados** do design para `public/images/projetos/`:
  `mascote.png`, `icones/coelho.png`, `icones/servicos.png`, `icones/3d.png`,
  `icones/interacao.png`, `icones/grafico.png`. Nenhum outro asset do design entra.
- `SETTINGS` do design mantido como constante (cursor ligado, inclinação 5°,
  parallax ligado).
- **Performance**: inclinação, cursor, parallax e giro do mascote mexem em
  `style.transform` via `requestAnimationFrame`, sem re-render.
- **React Compiler / ESLint**: o protótipo escreve em `ref.current` durante o
  render (`SearchAndFilters` alterna popA/popB assim; `ProjectSheet` faz
  `onCloseRef.current = onClose`). Isso não passa no `pnpm lint` deste repo —
  reescrever de forma equivalente.

## 9. Responsivo e movimento reduzido

- Comportamento do design: até 900px colunas quebram; até 700px a busca vai para
  baixo do mascote; touch (`hover: none`) mostra véu/texto/selo sempre e não monta
  o cursor; `prefers-reduced-motion: reduce` desliga todas as animações/transições
  da página e do modal, e o JS pula parallax, inclinação e giro do mascote.
- Verificar em **390, 768, 1024, 1280, 1366, 1728 e 1920px**, nos dois idiomas
  (regressões deste repo já apareceram em 768–1440 e 1920, não só nos extremos).

## 10. O que fica a critério de quem implementa

- Nomes de componentes, hooks e chaves (respeitando os padrões do AGENTS.md).
- `next/image` ou `<img>` (o repo usa `<img>` com eslint-disable; manter lint limpo).
- Como o `CaseShell` expõe os ganchos de animação e como o modal prende o Tab.
- Interceptador dinâmico `(.)[slug]` ou um por slug — o que funcionar nesta versão.
- Ajustes finos de espaçamento para encaixar o design nas fontes do site.

## 11. Escolhas minhas (para a usuária conferir)

1. Header = `HomeHeader` (texto traduzível) em vez das imagens ABOUT/PROJECTS.
2. Banner = `BrandHero` com "Portfólio"/"Portfolio" do dicionário, de borda a
   borda e com o corte inferior do design, com parallax.
3. Footer = `HomeFooter` + "voltar ao topo" + seta ↗ no hover.
4. Fontes do site (Clother/AM Novecento) no lugar de Nunito/Outfit.
5. Grade de 2 colunas com `pontos-sem-no` em destaque no card alto, capas cortadas
   ancoradas à esquerda; grade com no máximo 1180px.
6. Rótulos das pílulas em minúsculas, como no design (inclusive "design de
   interação", diferente do "UX e UI Design" das páginas de categoria).
7. "Próximo" percorre todos os projetos, ignorando o filtro; usa `replace`.
8. Busca ignora acentos.
9. Pílula "design de serviços" mantida mesmo sem projetos (mostra o estado vazio).
10. Linhas da descrição no hover: 4 / 2 / 1, as mesmas dos cards do design com a
    mesma proporção.
