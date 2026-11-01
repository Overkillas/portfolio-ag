# Página de Projetos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar `/[lang]/projetos` (banner, busca, mascote, filtros, grade bento, cursor) com os 3 projetos reais, e um modal de case que abre por rota interceptada (`/[lang]/projetos/<slug>`) sem mudar as páginas de case abertas direto.

**Architecture:** O corpo de cada case sai das páginas para Server Components reutilizáveis; as páginas completas e o modal (slot `@modal` com `(.)[slug]`) renderizam o mesmo `CaseShell` + corpo. A página índice é um Client Component com o estado de busca/filtro/hover, estilizado por um CSS Module portado do design. Header/footer continuam no layout `[lang]`, mas os routers passam a decidir por segmentos ativos, para não trocar com o modal aberto.

**Tech Stack:** Next.js 16.2.6 (App Router, Intercepting + Parallel Routes), React 19.2, TypeScript, Tailwind v4 + CSS Modules, pnpm. Testes: `scripts/check-quality-gates.sh` (bash + curl) e Playwright 1.64.1 rodando fora do repo.

**Spec:** `docs/superpowers/specs/2026-10-23-projects-page-design.md`
**Quality gates:** `docs/superpowers/quality-gates/2026-10-23-projects-page-quality-gates.md`
**Fonte do design (local, ignorada pelo git):** `for-implement/portfolio-projetos/` — `ANIMACOES.md`, `components/projetos/*.tsx`, `components/projetos/projetos.module.css`.

## Global Constraints

- Ler `AGENTS.md` antes de começar. Ler os docs em `node_modules/next/dist/docs/` de qualquer API do Next que usar (em especial `03-api-reference/03-file-conventions/intercepting-routes.md`, `parallel-routes.md`, `04-functions/use-selected-layout-segments.md`).
- Nenhum texto visível hardcoded: tudo em `dictionaries/pt-BR.json` **e** `dictionaries/en.json` na mesma mudança. Placeholders `{count}`/`{title}` com `.replace`. Setas (← → ↑ ↗) ficam fora do dicionário, em `<span aria-hidden>`.
- Links sempre com prefixo de locale no render: `` `/${locale}/projetos/${slug}` ``. Nunca `/pt-BR/...` hardcoded.
- Client Components pegam texto com `useTranslations()` (`lib/i18n/use-translation.ts`) ou `dict` por prop; nunca importam o JSON.
- Nenhuma dependência nova no `package.json`. Playwright/pixelmatch vivem em `/tmp/pwtest`.
- Fontes do site: `--font-body` (Clother) e `--font-display` (AM Novecento). Nada de Nunito/Outfit. `globals.css` força h1–h4 para a display; sobrescrever com `style={{ fontFamily: 'var(--font-body)' }}` quando o texto não for display.
- `pnpm lint` (React Compiler) não aceita escrita em `ref.current` durante o render nem `setState` síncrono dentro de `useEffect`. Hooks de media query usam `useSyncExternalStore`.
- Animação por JS (inclinação, cursor, parallax, mascote) escreve em `element.style.transform` via `requestAnimationFrame`, sem re-render, e é desligada com `prefers-reduced-motion: reduce`.
- Props novas em componentes compartilhados (`CaseShell`, `BrandHero`, `HomeHeader`, `HomeFooter`) são opcionais e, desligadas, produzem **exatamente** o HTML de hoje (sem espaço extra em `className`, sem `style` novo).
- Antes de cada commit: `pnpm build && pnpm lint && pnpm exec tsc --noEmit` limpos.
- Commits em português no estilo do repo (`feat(projetos): …`, `refactor(case): …`), terminando com a linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Relatório de cada task em `.superpowers/sdd/2026-10-23-projects-page/task-N-report.md` (pasta ignorada pelo git), com a saída dos gates.

## Review Focus

1. **Teclado sem mouse:** Tab até um card mostra véu/texto (focus-visible) e Enter abre o modal; Esc fecha e o foco volta ao card. → teste `keyboard opens modal` na Task 6.
2. **Clique duplo rápido num card:** abre um modal só; **um** Esc/voltar volta à grade. → teste `double click opens once` na Task 4.
3. **Avançar do navegador depois de fechar:** reabre o modal do mesmo projeto, com o HomeHeader ainda atrás. → teste `forward reopens modal` na Task 4.
4. **Busca com caixa, acento e espaços:** `"  GRÁFICO "` e `"grafico"` acham `pontos-sem-no`. → teste `search normalizes` na Task 7.
5. **Caminho cruzado de locale:** abrir `/en/projetos/pontos-sem-no` direto → clicar "projects" no header → clicar um card → modal em inglês, URL `/en/projetos/<slug>`. → teste `case page to index to modal (en)` na Task 4.

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `components/case-study/cases/PontosSemNoCase.tsx`, `BatucoTucoCase.tsx`, `PontinhasSoltasCase.tsx` | Corpo de cada case (o que hoje está entre `<CaseShell>` e `</CaseShell>`). Server. |
| `components/case-study/cases/index.ts` | Registro `caseBodies` slug → componente. |
| `components/case-study/CaseShell.tsx` | + prop opcional `motion`. |
| `lib/projects.ts` | + dados de grade, `featured`, `projectSlugs`, `getLocalizedProjects`, `getNextSlug`. |
| `lib/projects-search.ts` | Funções puras: normalização, filtro, colunas, frase do balão. |
| `lib/hooks/use-media-query.ts` | `useReducedMotion()`, `useFinePointer()`. |
| `app/[lang]/projetos/layout.tsx` | Renderiza `children` + slot `modal`. |
| `app/[lang]/projetos/page.tsx` | Índice. Server. |
| `app/[lang]/projetos/@modal/default.tsx` | `null`. |
| `app/[lang]/projetos/@modal/(.)[slug]/page.tsx` | Modal interceptado. Server. |
| `components/projects/ProjectsIndex.tsx` | Estado da página (busca, filtro, hover) e composição. Client. |
| `components/projects/BentoCard.tsx` | Card com hover, inclinação, selo. Client. |
| `components/projects/CustomCursor.tsx` | Cursor "abrir projeto". Client. |
| `components/projects/SearchAndFilters.tsx` | Busca, mascote, balão, pílulas. Client. |
| `components/projects/CategoryIcon.tsx` | Ícones das pílulas (máscara) e lupa. |
| `components/projects/ProjectModal.tsx` | Folha do modal: foco, Esc, trava de scroll, voltar/próximo. Client. |
| `components/projects/projects.module.css` | Tokens, estilos, keyframes, responsivo, reduced motion (portado do design). |
| `components/layout/{HeaderRouter,FooterRouter,HomeHeader,HomeFooter,BrandHero,LanguageSwitcher}.tsx` | Ajustes da spec §4.1, §4.2, §5.1, §5.2, §5.5. |
| `dictionaries/{pt-BR,en}.json` | Namespace `projectsPage` + `metadata.projetos`. |
| `public/images/projetos/` | `mascote.png`, `icones/{coelho,servicos,3d,interacao,grafico}.png`. |
| `scripts/check-quality-gates.sh` | + `gate_7` (página de projetos). |
| `.superpowers/sdd/2026-10-23-projects-page/` (ignorado) | `snapshot-articles.sh`, `e2e.mjs`, `baseline/`, relatórios. |

---

### Task 1: Baseline, harness de testes e extração do corpo dos cases

Gate da task: **P0** e **P1**.

**Files:**
- Create: `.superpowers/sdd/2026-10-23-projects-page/snapshot-articles.sh`, `.superpowers/sdd/2026-10-23-projects-page/e2e.mjs`
- Create: `components/case-study/cases/PontosSemNoCase.tsx`, `BatucoTucoCase.tsx`, `PontinhasSoltasCase.tsx`, `index.ts`
- Modify: `app/[lang]/projetos/pontos-sem-no/page.tsx`, `batuco-tuco/page.tsx`, `pontinhas-soltas/page.tsx`

**Interfaces:**
- Produces: `export function PontosSemNoCase({ project }: { project: LocalizedProject }): JSX.Element` (idem `BatucoTucoCase`, `PontinhasSoltasCase`); `export const caseBodies: Record<Slug, (props: { project: LocalizedProject }) => React.ReactNode>`.
- Produces (harness): `node e2e.mjs [grupo…]` roda só os grupos pedidos (sem argumento roda todos); sai com código 1 se qualquer asserção falhar e imprime `PASS`/`FAIL <nome do teste>` por linha. Helper `openPage({ path, width = 1728, height = 1000, locale, reducedMotion = false, mobile = false })` que devolve `{ page, context }`, e `shot(page, file)`, que antes do print full-page rola a página inteira (para disparar as imagens com `loading="lazy"` da home), volta ao topo e espera `networkidle` + `document.fonts.ready` (a fonte vem do Typekit — sem isso os prints não batem). `BASE_URL` padrão `http://localhost:3000`. Baseline e comparações sempre contra o **mesmo** tipo de servidor (`pnpm build && pnpm start`).

- [ ] **Step 1: Baseline de build.** Rodar `pnpm build && pnpm lint && pnpm exec tsc --noEmit` no estado atual. Anotar no relatório. Se algo já falha, anotar como pré-existente e avisar o controlador antes de continuar.
- [ ] **Step 2: Escrever `snapshot-articles.sh <outdir>`:** para `locale ∈ {pt-BR, en}` × `slug ∈ {pontos-sem-no, batuco-tuco, pontinhas-soltas}`, faz `curl` em `http://localhost:3000/$locale/projetos/$slug` e grava só o trecho `<article…</article>` em `<outdir>/$locale-$slug.html`.
- [ ] **Step 3: Montar o Playwright** em `/tmp/pwtest` (`npm init -y && npm i playwright@1.64.1 pixelmatch@6 pngjs@7`; chromium 1234 já está em `~/.cache/ms-playwright/`) e escrever `e2e.mjs` com o helper acima e o grupo `baseline`, que salva prints full-page em `baseline/shots/`: `/pt-BR` e `/en` a 1728 e 390; as 3 páginas de case em pt-BR a 1728; `/pt-BR/grafico` e `/pt-BR/contato` a 1728. O `e2e.mjs` importa o Playwright pelo caminho absoluto de `/tmp/pwtest/node_modules`.
- [ ] **Step 4: Capturar o baseline.** `pnpm build && pnpm start` (em background), depois `snapshot-articles.sh baseline/` e `node e2e.mjs baseline`. Esperado: 6 arquivos `.html` não vazios e 9 prints.
- [ ] **Step 5: Extrair os corpos.** Mover para cada `XCase` exatamente o JSX que hoje fica entre `<CaseShell …>` e `</CaseShell>` (com a constante `base` e as variáveis derivadas), devolvido num Fragment. As 3 páginas passam a renderizar `<CaseShell project={project} dict={dict}><XCase project={project} /></CaseShell>`. Criar `caseBodies` em `index.ts`.
- [ ] **Step 6: Verificar P1.** Rebuild + start, `snapshot-articles.sh after/` e `diff -r baseline/ after/`. Esperado: diff vazio. Build/lint/tsc limpos.
- [ ] **Step 7: Commit** — `refactor(case): extrai o corpo de cada case para componentes reutilizáveis`.

---

### Task 2: Dados de grade, dicionários, assets e gate 7 estático

Gate da task: **P2**.

**Files:**
- Modify: `lib/projects.ts`, `dictionaries/pt-BR.json`, `dictionaries/en.json`, `scripts/check-quality-gates.sh`
- Create: `public/images/projetos/mascote.png`, `public/images/projetos/icones/{coelho,servicos,3d,interacao,grafico}.png` (copiados de `for-implement/portfolio-projetos/public/projetos/`)

**Interfaces:**
- Produces (`lib/projects.ts`):
  ```ts
  export type ProjectGrid = { column: 0 | 1 | 2; aspect: string; objectPosition: string; descLines: number };
  // ProjectMeta ganha: featured?: boolean; grid: ProjectGrid;
  export const projectSlugs: Slug[];                                   // ordem de projectMeta
  export function getLocalizedProjects(dict: Dictionary): LocalizedProject[]; // todos, na ordem de projectMeta
  export function getNextSlug(slug: Slug): Slug;                       // próximo, cíclico
  ```
- Produces (dicionário): `dict.projectsPage` com as chaves abaixo e `dict.metadata.projetos`.

- [ ] **Step 1: Escrever `gate_7` (parte estática)** em `scripts/check-quality-gates.sh`, registrado no `case` (`7) gate_7 ;;`) e na mensagem de uso. Checks:
  - os 6 PNGs acima existem;
  - `git ls-files public` e `find public` não acham `peixes|coelhinhos|jardim|cidade-3d|portfolio-banner|footer-bg|nav-about|nav-projects`;
  - `grep -rnE "(['\">\`])(Olha que legal|Clica pra ver|Achei |Esse é o meu favorito|nada por aqui|DESTAQUE|voltar aos projetos|próximo:|Pesquise por|limpar busca|Nenhum projeto|voltar ao topo|Look how cool|Click to see|FEATURED|back to projects)" components app` vazio;
  - um `node -e` que lista os caminhos de chave de `projectsPage` nos dois JSON e confere que são iguais e não vazios, e que `metadata.projetos` existe nos dois;
  - nenhum `import … from '@/dictionaries/` em arquivo com `'use client'`.
- [ ] **Step 2: Rodar** `./scripts/check-quality-gates.sh 7`. Esperado: FAIL (assets e chaves ausentes).
- [ ] **Step 3: Dados de grade** em `projectMeta` (valores da spec §5.4): `pontos-sem-no` → `featured: true`, `{ column: 0, aspect: '459 / 590', objectPosition: 'left center', descLines: 4 }`; `batuco-tuco` → `{ column: 1, aspect: '612 / 344', objectPosition: 'left center', descLines: 2 }`; `pontinhas-soltas` → `{ column: 1, aspect: '612 / 230', objectPosition: 'left center', descLines: 1 }`. Implementar as três funções.
- [ ] **Step 4: Dicionários.** Adicionar nos dois JSON (texto exato da spec §7):

  | chave | pt-BR | en |
  |---|---|---|
  | `projectsPage.title` | Portfólio | Portfolio |
  | `projectsPage.controlsLabel` | Busca e filtros | Search and filters |
  | `projectsPage.searchLabel` | Pesquisar projetos | Search projects |
  | `projectsPage.searchPlaceholder` | Pesquise por um tópico | Search by topic |
  | `projectsPage.filtersLabel` | Filtrar por área | Filter by area |
  | `projectsPage.filters.all` | todos | all |
  | `projectsPage.filters.servicos` | design de serviços | service design |
  | `projectsPage.filters.3d` | design 3d | 3d design |
  | `projectsPage.filters.interacao` | design de interação | interaction design |
  | `projectsPage.filters.grafico` | design gráfico | graphic design |
  | `projectsPage.bubble.idle` | Olha que legal! | Look how cool! |
  | `projectsPage.bubble.featured` | Esse é o meu favorito! | This one's my favorite! |
  | `projectsPage.bubble.hover` | Clica pra ver! | Click to see! |
  | `projectsPage.bubble.found` | Achei {count}! | Found {count}! |
  | `projectsPage.bubble.filteredOne` | {count} projeto! | {count} project! |
  | `projectsPage.bubble.filteredMany` | {count} projetos! | {count} projects! |
  | `projectsPage.bubble.empty` | Hmm… nada por aqui | Hmm… nothing here |
  | `projectsPage.listHeading` | Projetos ({count}) | Projects ({count}) |
  | `projectsPage.openProject` | Abrir projeto {title} | Open project {title} |
  | `projectsPage.featuredBadge` | DESTAQUE | FEATURED |
  | `projectsPage.cursorLine1` | abrir | open |
  | `projectsPage.cursorLine2` | projeto | project |
  | `projectsPage.emptyText` | Nenhum projeto com esse tópico… ainda! | No projects on this topic… yet! |
  | `projectsPage.clearFilters` | limpar busca e filtros | clear search and filters |
  | `projectsPage.back` | voltar aos projetos | back to projects |
  | `projectsPage.next` | próximo: {title} | next: {title} |
  | `projectsPage.backToTop` | voltar ao topo | back to top |
  | `metadata.projetos` | Projetos | Projects |
- [ ] **Step 5: Copiar os 6 PNGs** para `public/images/projetos/` (mantendo `icones/`).
- [ ] **Step 6: Verificar.** `./scripts/check-quality-gates.sh 7` → PASS; build/lint/tsc limpos; P1 continua (diff de `snapshot-articles.sh` vazio).
- [ ] **Step 7: Commit** — `feat(projetos): dados de grade, textos bilíngues e assets da página de projetos`.

---

### Task 3: Rotas, página índice mínima e link do header

Gate da task: **P3** (menos as linhas de banner, que fecham na Task 5).

**Files:**
- Create: `app/[lang]/projetos/layout.tsx`, `app/[lang]/projetos/page.tsx`, `app/[lang]/projetos/@modal/default.tsx`, `components/projects/ProjectsIndex.tsx`
- Modify: `components/layout/HomeHeader.tsx`, `components/layout/HeaderRouter.tsx`, `components/layout/FooterRouter.tsx`, `scripts/check-quality-gates.sh`

**Interfaces:**
- Consumes: `getLocalizedProjects(dict)` (Task 2).
- Produces: `export function ProjectsIndex({ projects }: { projects: LocalizedProject[] })` (Client). Nesta task: raiz `<div id="top">`, `<BrandHero variant="home" title={t('projectsPage.title')} />` e uma lista simples de `<Link href={`/${locale}/projetos/${slug}`} scroll={false}>` com o título. As Tasks 5–7 completam.
- Produces: `HomeHeader` ganha `active?: 'projects'` → `aria-current="page"` no link "projetos".
- Produces (routers): `const segments = useSelectedLayoutSegments(); const isHome = segments.length === 0; const isProjectsIndex = segments.length === 1 && segments[0] === 'projetos';`. HeaderRouter: `isHome || isProjectsIndex` → `HomeHeader` (com `active="projects"` no índice); senão `Header`. FooterRouter: `isHome || isProjectsIndex` → `HomeFooter`; senão `Footer`.

- [ ] **Step 1: Escrever a parte de runtime do `gate_7`** (pula com SKIP se `:3000` não responder), com os checks do gate P3 da doc de gates: 200 em `/pt-BR/projetos` e `/en/projetos`; `/projetos` sem cookie → redirect para `/pt-BR/projetos`; `/fr/projetos` → 404; `<title>` `Projetos · Ágatha Sales` / `Projects · Ágatha Sales`; hreflang `pt-BR`, `en`, `x-default` absolutos terminando em `/projetos`; `href="/pt-BR/projetos"` no header de `/pt-BR` e de `/pt-BR/projetos` (idem `en`); os 3 `href="/{locale}/projetos/<slug>"` em cada idioma; nenhum `projectsPage\.` cru no HTML; `/pt-BR/projetos/batuco-tuco` → 200 sem `role="dialog"`; `/pt-BR/projetos/nao-existe` → 404.
- [ ] **Step 2: Rodar** `./scripts/check-quality-gates.sh 7` com `pnpm dev` no ar. Esperado: FAIL nos checks de runtime.
- [ ] **Step 3: Implementar** as rotas: `layout.tsx` devolve `<>{children}{modal}</>` (tipar as props conforme a doc de parallel routes desta versão); `@modal/default.tsx` devolve `null`; `page.tsx` segue o padrão do AGENTS.md (`await params`, `isLocale` → `notFound()`, `getDictionary`, `generateMetadata` com `title: dict.metadata.projetos` e `alternates.languages` `pt-BR: '/pt-BR/projetos'`, `en: '/en/projetos'`, `x-default: '/pt-BR/projetos'`) e renderiza `<ProjectsIndex projects={getLocalizedProjects(dict)} />`. Se o dev server reclamar do slot `children` numa navegação direta, criar `app/[lang]/projetos/default.tsx` (ver docs) e anotar no relatório.
- [ ] **Step 4: HomeHeader e routers.** `projectsHref` → `` `/${locale}/projetos` `` e apagar o comentário da gambiarra; prop `active`; routers por segmentos (Interfaces acima).
- [ ] **Step 5: Verificar.** `gate_7` → PASS (runtime + estático); `./scripts/check-quality-gates.sh 5` → PASS; build/lint/tsc; P1 (diff de artigos) vazio.
- [ ] **Step 6: Commit** — `feat(projetos): rota /projetos com metadados bilíngues e link do header`.

---

### Task 4: Modal por rota interceptada

Gate da task: **P4**.

**Files:**
- Create: `app/[lang]/projetos/@modal/(.)[slug]/page.tsx`, `components/projects/ProjectModal.tsx`
- Modify: `components/layout/LanguageSwitcher.tsx`; se o Step 5 falhar: create `lib/modal-open-store.ts` e modify `HeaderRouter.tsx`/`FooterRouter.tsx`

**Interfaces:**
- Consumes: `caseBodies` (Task 1), `getLocalizedProject`, `getNextSlug` (Task 2), `CaseShell`.
- Produces: `export function ProjectModal({ title, nextHref, nextTitle, children }: { title: string; nextHref: string; nextTitle: string; children: React.ReactNode })` (Client). A Task 8 só troca o estilo.
- Produces (fallback, só se necessário): `lib/modal-open-store.ts` com `setModalOpen(open: boolean): void` e `useModalOpen(): boolean` (`useSyncExternalStore`).

- [ ] **Step 1: Escrever o grupo `modal` no `e2e.mjs`**, rodando em `pt-BR` e `en`, com estes testes (nomes exatos):
  - `click opens dialog` — clicar no card `batuco-tuco` → URL termina em `/{locale}/projetos/batuco-tuco`; existe `[role=dialog][aria-modal=true]` com `aria-label` = título do projeto; o dialog contém o subtítulo do case, o título "Processo de criação"/equivalente em en, e o agradecimento; nenhuma resposta 4xx de imagem.
  - `header stays during modal` — com o dialog aberto, o header tem o link `sobre`/`about` e não tem `Sobre mim`/`About me`; o footer tem o texto de `footer.visitAlso`.
  - `focus and tab trap` — foco inicial no botão voltar; 30× Tab e 30× Shift+Tab mantêm `document.activeElement` dentro do dialog.
  - `scroll lock` — `getComputedStyle(document.body).overflow === 'hidden'` aberto; volta ao valor anterior fechado.
  - `esc closes` / `back button closes` / `browser back closes` — cada um volta para `/{locale}/projetos`, sem dialog, com `scrollY` igual ao de antes de abrir (rolar 600px antes de abrir; tolerância ±2px) e foco no card que abriu.
  - `next replaces` — "próximo" a partir de `pontinhas-soltas` vai para `pontos-sem-no` (cíclico); a folha está no topo; um único `goBack()` leva a `/{locale}/projetos`.
  - `double click opens once` — duplo clique no card, depois um Esc → `/{locale}/projetos` sem dialog.
  - `forward reopens modal` — abrir, Esc, `goForward()` → dialog do mesmo projeto, header ainda o HomeHeader.
  - `reload shows full page` — com o dialog aberto, `reload()` → página completa (`article`, Header antigo), sem dialog.
  - `middle click opens full page` — `click({ button: 'middle' })` abre nova aba com a página completa, sem dialog.
  - `language switch on case page` — abrir direto `/pt-BR/projetos/<slug>` para os 3 slugs, clicar EN → `/en/projetos/<slug>` com `article`, Header antigo e **sem** dialog; repetir EN → PT.
  - `language switch on index` — em `/pt-BR/projetos`, clicar EN → `/en/projetos` com a grade.
  - `case page to index to modal (en)` — abrir direto `/en/projetos/pontos-sem-no`, clicar o link "projects" do header, clicar um card → dialog em inglês, URL `/en/projetos/<slug>`.
- [ ] **Step 2: Rodar** `node e2e.mjs modal`. Esperado: FAIL em `click opens dialog`.
- [ ] **Step 3: Página interceptada.** `(.)[slug]/page.tsx`: padrão do AGENTS.md (`isLocale` e slug desconhecido → `notFound()`); renderiza `<ProjectModal title={project.title} nextHref={`/${lang}/projetos/${next}`} nextTitle={nextProject.title}><CaseShell project={project} dict={dict}><Body project={project} /></CaseShell></ProjectModal>` com `Body = caseBodies[slug]`. Se o `(.)[slug]` dinâmico não interceptar as pastas estáticas, trocar por uma pasta `(.)<slug>` por projeto e anotar no relatório.
- [ ] **Step 4: `ProjectModal`.** Folha `fixed inset-0 z-[60] overflow-y-auto` com fundo creme (estilo provisório em Tailwind; a Task 8 aplica o do design). `role="dialog"`, `aria-modal="true"`, `aria-label={title}`. Ao montar: guarda o elemento focado, trava `document.body.style.overflow`, foca o botão voltar. Ao desmontar: restaura overflow e foco. Esc e botão voltar → `router.back()`. Tab/Shift+Tab ciclam entre os focáveis da folha. "Próximo" → `router.replace(nextHref, { scroll: false })`; ao mudar o `usePathname()`, a folha volta ao topo e o conteúdo remonta (`key={pathname}`). Textos: `projectsPage.back`, `projectsPage.next` com `{title}`; setas `aria-hidden`.
- [ ] **Step 5: `LanguageSwitcher`.** Se o pathname casar `^/[^/]+/projetos/[^/]+$`, depois de gravar o cookie fazer `window.location.assign(newPath)`; senão manter `router.push` + `router.refresh()`.
- [ ] **Step 6: Rodar** `node e2e.mjs modal`. Se só `header stays during modal`/`forward reopens modal` falharem porque os routers trocam, implementar o fallback (`lib/modal-open-store.ts`: o `ProjectModal` marca aberto ao montar e fechado ao desmontar; os routers guardam a última decisão enquanto `useModalOpen()` for `true`) e rodar de novo. Esperado: tudo PASS.
- [ ] **Step 7: Verificar** build/lint/tsc, `gate_7`, P1 (diff vazio).
- [ ] **Step 8: Commit** — `feat(projetos): modal de case por rota interceptada`.

---

### Task 5: Banner, header e footer da página

Gate da task: linhas de banner do **P3**, regressões do **P7** para home/contato/categorias.

**Files:**
- Create: `lib/hooks/use-media-query.ts`
- Modify: `components/layout/BrandHero.tsx`, `components/layout/HomeHeader.tsx`, `components/layout/HomeFooter.tsx`, `components/layout/FooterRouter.tsx`, `components/projects/ProjectsIndex.tsx`, `app/[lang]/globals.css` (só se precisar do keyframe `bob`)

**Interfaces:**
- Produces: `useReducedMotion(): boolean`, `useFinePointer(): boolean` (`(hover: hover) and (pointer: fine)`), ambos com `useSyncExternalStore` e snapshot de servidor `false`.
- Produces: `BrandHero` ganha `fullWidth?: boolean` (ignora a regra de título curto), `bleedBottom?: number` (fração da altura das letras que fica abaixo da borda da banda; o design pede `0.16`), `parallax?: boolean`.
- Produces: `HomeFooter` ganha `variant?: 'home' | 'projects'`. FooterRouter passa `variant="projects"` no índice.

- [ ] **Step 1: Escrever o grupo `chrome` no `e2e.mjs`** (pt-BR e en, 1728 e 390):
  - `banner full width` — em `/{locale}/projetos`, largura do SVG do título ≥ 99% da largura da banda.
  - `banner bleeds bottom` — a base do texto fica abaixo da borda inferior da banda em 14–18% da altura das letras (medir pelo `getBBox` do `<text>` e o retângulo da banda).
  - `banner parallax` — após `scrollTo(0, 500)` e um frame, o `transform` do SVG contém `translateY(90` ; com `reducedMotion: 'reduce'`, nenhum `transform` de parallax.
  - `footer back to top` — `/{locale}/projetos` tem link `href="#top"` com o texto de `projectsPage.backToTop`; `/{locale}` (home) não tem.
  - `home unchanged` — print full-page de `/pt-BR` e `/en` a 1728 e 390 comparado ao baseline com pixelmatch: 0 pixels diferentes fora da área do header (o hover não aparece num print parado, então espera-se 0 no total).
  - `other heroes unchanged` — `/pt-BR/grafico` e `/pt-BR/contato` a 1728 iguais ao baseline (0 pixels).
- [ ] **Step 2: Rodar** `node e2e.mjs chrome`. Esperado: FAIL em `banner full width`.
- [ ] **Step 3: Implementar** o hook; as props do `BrandHero` (com `bleedBottom`, o `viewBox` termina em `capHeight × (1 − bleedBottom)` acima da base, de modo que o recorte da banda corte as letras; o parallax segue a spec §5.2: `translateY(y × 0.18) scale(1 + y × 0.00012)`, `y = min(scrollY, 900)`, por rAF, composto com qualquer `transform` existente, desligado com reduced motion); o hover do `HomeHeader` (`translateY(-3px) rotate(-2deg) scale(1.04)`, .35s `cubic-bezier(.2,.9,.3,1.4)`, sem transição com reduced motion); a variante `projects` do `HomeFooter` (link "voltar ao topo" com `↑` balançando — `translateY(0 → 6px → 0)`, 1.8s, infinito — e `↗` que aparece no hover dos links sociais, `translate(-4px, 4px) → 0`). No `ProjectsIndex`: `<BrandHero variant="home" title={…} fullWidth bleedBottom={0.16} parallax />`.
- [ ] **Step 4: Verificar.** `node e2e.mjs chrome modal` → PASS; build/lint/tsc; P1 vazio.
- [ ] **Step 5: Commit** — `feat(projetos): banner com parallax, hover do header e footer com voltar ao topo`.

---

### Task 6: Grade bento, cards e cursor

Gate da task: parte de cards do **P5**.

**Files:**
- Create: `components/projects/projects.module.css`, `components/projects/BentoCard.tsx`, `components/projects/CustomCursor.tsx`, `lib/projects-search.ts`
- Modify: `components/projects/ProjectsIndex.tsx`

**Interfaces:**
- Produces (`lib/projects-search.ts`): `export type BentoColumn = { key: 0 | 1 | 2; wide: boolean; items: { project: LocalizedProject; index: number }[] }`; `export function distributeColumns(projects: LocalizedProject[]): BentoColumn[]` (agrupa por `grid.column`, numera `index` na ordem de saída, remove colunas vazias; `wide = key !== 0`).
- Produces: `BentoCard({ project, index, tiltDegrees, hideCursor, onHover }: { project: LocalizedProject; index: number; tiltDegrees: number; hideCursor: boolean; onHover: (slug: string | null) => void })`; `CustomCursor({ active }: { active: boolean })`.
- Produces: `ProjectsIndex` com `const SETTINGS = { customCursor: true, tiltDegrees: 5, parallax: true }` e estado `hovered: string | null`.

- [ ] **Step 1: Escrever o grupo `grid` no `e2e.mjs`:**
  - `two columns` — a 1728: 3 cards; `pontos-sem-no` sozinho numa coluna à esquerda; os outros dois empilhados à direita; contêiner da grade ≤ 1180px e centralizado.
  - `card aspect` — razão largura/altura de cada card dentro de ±1% de 459/590, 612/344, 612/230.
  - `card link` — cada card é `a[href="/{locale}/projetos/<slug>"]` com `aria-label` = `projectsPage.openProject` com o título; a `img` tem `alt` = `projects.coverAlt` com o título e `object-position` começando por `0%`/`left`.
  - `featured badge` — hover no `pontos-sem-no` → selo com o texto de `projectsPage.featuredBadge` com opacidade 1 após 700ms; os outros cards não têm selo.
  - `hover reveals text` — hover num card → título, descrição e tags com opacidade 1 após 800ms.
  - `keyboard opens modal` — Tab até o primeiro card → véu com opacidade 1; Enter → dialog aberto; Esc → foco de volta no card.
  - `cursor fine pointer` — com mouse, o cursor personalizado existe e escala para 1 sobre um card; com contexto `isMobile: true, hasTouch: true`, ele não existe no DOM.
  - `touch shows content` — no contexto móvel, véu/texto/selo com opacidade 1 sem hover.
- [ ] **Step 2: Rodar** `node e2e.mjs grid`. Esperado: FAIL em `two columns`.
- [ ] **Step 3: CSS Module.** Portar de `projetos.module.css` as seções TOKENS, GRADE BENTO, CURSOR PERSONALIZADO, o keyframe `rise`, o foco visível, o `@media (max-width: 900px)`, o `@media (hover: none)` e o reduced motion. Trocar fontes por `var(--font-body)` e as cores iguais às globais pelos tokens globais (spec §8). Grade com `max-width: 1180px; margin-inline: auto`.
- [ ] **Step 4: Componentes.** `BentoCard` como `<Link scroll={false}>` com `aspectRatio` e `animationDelay = index × 110ms` inline, imagem `coverImage` com `objectPosition` de `grid`, descrição cortada em `grid.descLines`, selo com `/images/projetos/icones/coelho.png` só se `featured`, inclinação por rAF (`perspective(1000px) rotateX(−py × 5°) rotateY(px × 5°) translateY(-6px)`). `CustomCursor` com lerp 0.22 e textos `cursorLine1`/`cursorLine2` + `→` `aria-hidden`; montado só se `useFinePointer()`. `ProjectsIndex` com título sr-only `projectsPage.listHeading` (`{count}`).
- [ ] **Step 5: Verificar.** `node e2e.mjs grid modal chrome` → PASS; build/lint/tsc.
- [ ] **Step 6: Commit** — `feat(projetos): grade bento com hover, inclinação e cursor personalizado`.

---

### Task 7: Busca, mascote, balão e filtros

Gate da task: restante do **P5**.

**Files:**
- Create: `components/projects/SearchAndFilters.tsx`, `components/projects/CategoryIcon.tsx`
- Modify: `lib/projects-search.ts`, `components/projects/ProjectsIndex.tsx`, `components/projects/projects.module.css`

**Interfaces:**
- Produces (`lib/projects-search.ts`):
  ```ts
  export type ProjectFilter = 'all' | CategoryKey;
  export const filterOrder: ProjectFilter[] = ['all', 'servicos', '3d', 'interacao', 'grafico'];
  export function normalizeText(s: string): string; // trim + minúsculas + sem diacríticos (NFD)
  export function filterProjects(projects: LocalizedProject[], query: string, filter: ProjectFilter, categoryLabels: Record<CategoryKey, string>): LocalizedProject[];
  export type BubbleKey = 'idle' | 'featured' | 'hover' | 'found' | 'filteredOne' | 'filteredMany' | 'empty';
  export function bubbleKey(args: { hovered: LocalizedProject | undefined; query: string; filter: ProjectFilter; count: number }): BubbleKey;
  ```
  Busca em `title`, `description`, `tags` e no rótulo de cada categoria do projeto, no idioma atual. Ordem do `bubbleKey` (a do design): hover → `featured`/`hover`; senão `count === 0` → `empty`; senão query não vazia → `found`; senão filtro ≠ `all` → `filteredOne`/`filteredMany`; senão `idle`. Humor do mascote: hover → `happy`, `count === 0` → `sad`, senão `idle`.
- Produces: `SearchAndFilters({ query, onQuery, filter, onFilter, bubble, mood }: { query: string; onQuery: (v: string) => void; filter: ProjectFilter; onFilter: (f: ProjectFilter) => void; bubble: string; mood: 'idle' | 'happy' | 'sad' })`; `CategoryIcon({ category }: { category: CategoryKey })`; `SearchIcon()`.

- [ ] **Step 1: Escrever o grupo `filters` no `e2e.mjs`** (pt-BR e en):
  - `search normalizes` — `"grafico"`, `"  GRÁFICO "` (pt) e `"graphic"` (en) deixam só `pontos-sem-no`.
  - `search empty` — `"xyz"` → nenhum card, texto `projectsPage.emptyText`, mascote com a classe triste, balão `projectsPage.bubble.empty`; clicar `projectsPage.clearFilters` → 3 cards e busca vazia.
  - `filter toggles` — clicar `projectsPage.filters.3d` → só `pontinhas-soltas`, `aria-pressed="true"` nela, balão `{count} projeto!`/`{count} project!` com 1; clicar de novo → 3 cards, `all` pressionada.
  - `filter empty` — `projectsPage.filters.servicos` → estado vazio.
  - `bubble phrases` — sem interação → `bubble.idle`; hover no destaque → `bubble.featured`; hover noutro → `bubble.hover`; busca com 1 resultado → `Achei 1!`/`Found 1!`.
  - `pill order` — rótulos das pílulas na ordem de `filterOrder`.
- [ ] **Step 2: Rodar** `node e2e.mjs filters`. Esperado: FAIL.
- [ ] **Step 3: CSS Module.** Portar a seção BUSCA + MASCOTE + FILTROS (busca crescendo no foco, `float`, `popA`/`popB`, mascote feliz/triste, pílulas com hover/active/ativa, ícones por máscara apontando para `/images/projetos/icones/*.png`) e o `@media (max-width: 700px)`.
- [ ] **Step 4: Implementar.** Estado `query`/`filter` no `ProjectsIndex`; clicar na pílula ativa (≠ `all`) volta para `all`. Mascote `/images/projetos/mascote.png` decorativo (`alt=""`), girando até ±10° na direção do mouse (`(clientX − innerWidth/2) / 60`) por rAF, desligado com reduced motion. Balão com `role="status"` `aria-live="polite"`, `key={bubble}` e direção do pop alternando a cada frase nova **sem escrever ref no render** (ex.: guardar `{ text, flip }` em state e atualizar quando `bubble` mudar, padrão "informação de renders anteriores" da doc do React; se o lint recusar, alternar pela paridade de um contador de mudanças). Textos com `.replace('{count}', …)`.
- [ ] **Step 5: Verificar.** `node e2e.mjs filters grid modal chrome` → PASS; build/lint/tsc; `gate_7`.
- [ ] **Step 6: Commit** — `feat(projetos): busca, mascote com balão e filtros por área`.

---

### Task 8: Visual e animações do modal

Gate da task: linhas de modal do gate visual; P1 de novo.

**Files:**
- Modify: `components/case-study/CaseShell.tsx`, `components/projects/ProjectModal.tsx`, `components/projects/projects.module.css`, `app/[lang]/projetos/@modal/(.)[slug]/page.tsx`

**Interfaces:**
- Produces: `CaseShell` ganha `motion?: { cover: string; header: string; body: string }`. `cover` vai na `<img>` da capa; `header` na linha de subtítulo/status, na linha de tags/data e no bloco da intro; `body` no contêiner das seções e no parágrafo de agradecimento. Sem `motion`, o HTML é idêntico ao de hoje.

- [ ] **Step 1: Escrever o grupo `modal-motion` no `e2e.mjs`:**
  - `cover expands` — logo após abrir, a `img` da capa no dialog tem `animation-name` contendo `heroIn` e `animation-duration` `0.9s`.
  - `reveal delays` — blocos de cabeçalho com `animation-delay` `0.35s`; seções com `0.5s`.
  - `next replays` — após "próximo", a capa nova tem `heroIn` rodando de novo (`getAnimations()` não vazio).
  - `sheet reduced motion` — com `reducedMotion: 'reduce'`, `document.getAnimations().length === 0` com o dialog aberto.
- [ ] **Step 2: Rodar** `node e2e.mjs modal-motion`. Esperado: FAIL.
- [ ] **Step 3: CSS Module.** Portar a seção PÁGINA DO PROJETO: `.sheet` (fade .5s), `.sheetInner`, `.backBtn` (pílula tracejada, hover `translateX(-4px)`), `.nextLink`/`.arrow` (hover `translateX(6px)`), keyframes `fadeIn` e `heroIn` (`inset(30% 25% 30% 25% round 24px)` → `inset(0 round 8px)`, .9s `cubic-bezier(.7,0,.2,1)`), classes `heroIn`, `revealHeader` (`rise` .7s, atraso .35s) e `revealBody` (`rise` .7s, atraso .5s). Reduced motion cobre `.sheet *`.
- [ ] **Step 4: Implementar** a prop `motion` no `CaseShell` (sem mudar o HTML quando ausente), aplicar as classes do módulo na página interceptada e trocar o estilo provisório do `ProjectModal` pelas classes da folha.
- [ ] **Step 5: Verificar.** `node e2e.mjs modal-motion modal` → PASS; P1 (`snapshot-articles.sh` + `diff -r`) vazio; build/lint/tsc.
- [ ] **Step 6: Commit** — `feat(projetos): animações do modal (capa expandindo e texto subindo)`.

---

### Task 9: Responsivo, movimento reduzido, regressões e gates finais

Gate da task: **P6**, **P7**, **final**.

**Files:**
- Modify: o que os testes apontarem (CSS Module, componentes da página).

- [ ] **Step 1: Escrever os grupos `responsive`, `reduced` e `regression` no `e2e.mjs`:**
  - `no horizontal overflow` — `scrollWidth === innerWidth` em 390, 768, 1024, 1280, 1366, 1728, 1920 × `/pt-BR/projetos` e `/en/projetos`; e com o dialog aberto em 390 e 1728.
  - `columns wrap at 900` — a 900px os dois blocos de coluna ficam um embaixo do outro; a 901px, lado a lado.
  - `search below mascot at 700` — a 700px o campo de busca fica abaixo do mascote; a 701px, ao lado.
  - `no clipped text` — em todas as larguras acima e nos 2 idiomas, nenhuma pílula, balão ou título de card com `scrollWidth > clientWidth` (exceto a descrição, que é cortada de propósito).
  - `reduced motion page` — `reducedMotion: 'reduce'`: `getAnimations().length === 0` após carregar; mover o mouse sobre um card não muda o `transform` dele; o mascote não gira; rolar não muda o banner.
  - `regression shots` — home (`/pt-BR`, `/en` a 1728 e 390), `/pt-BR/grafico`, `/pt-BR/contato` e as 3 páginas de case a 1728 iguais ao baseline (pixelmatch 0).
- [ ] **Step 2: Rodar** e corrigir até tudo passar. Cada correção anotada no relatório com a largura e o idioma que falhava.
- [ ] **Step 3: Prints para o gate visual** em `.superpowers/sdd/2026-10-23-projects-page/visual/`: `/pt-BR/projetos` e `/en/projetos` a 1728, 1024 e 390; hover no card de destaque; busca vazia; filtro ativo; modal aberto (topo e fim, com o "próximo"). O controlador confere o gate visual manual com esses prints e o `ANIMACOES.md`.
- [ ] **Step 4: Gates finais.** `./scripts/check-quality-gates.sh 3`, `4`, `5`, `7`, `6`; `node e2e.mjs` (todos os grupos). Esperado: tudo PASS.
- [ ] **Step 5: Commit** — `fix(projetos): ajustes de responsivo e movimento reduzido` (só se houve correções).
