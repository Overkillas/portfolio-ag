# PLAN — Lista de tarefas para as 3 branches de case

Base: `chore/case-assets-figma` (já contém assets Figma em `public/images/projects/*/figma/` e trees em `docs/superpowers/analysis/`).
Spec: `docs/superpowers/specs/2026-11-08-three-case-pages-design.md`.

## Comum às 3 branches

1. `lib/projects.ts`: adicionar slug em `slugToKey` e em `projectMeta` (coverImage = capa vinda dos raws Figma, grid bento p/ o índice, accent, status, date, categories).
2. `dictionaries/pt-BR.json` + `dictionaries/en.json`: entrada `projects.<key>` completa (title, subtitle, cardTitle, description, intro, tags, sections.* incl. alts de imagens, thanks) + `metadata.<key>` — mesma mudança nos 2 arquivos (build quebra sem paridade).
3. Copiar/renomear assets: `public/images/projects/<slug>/figma/raw-*.png|jpg` → nomes semânticos (`hero.png`, `poster-cabe.png`, `etapa-01.png`, ...) em `public/images/projects/<slug>/`. Documentar o mapeamento num comentário ou em `docs/superpowers/analysis/figma-<slug>-assets.md`.
4. `app/[lang]/projetos/<slug>/page.tsx` (copiar padrão de pontos-sem-no existente).
5. `app/[lang]/projetos/@modal/(.)<slug>/page.tsx` (copiar padrão existente — pasta por slug).
6. `components/case-study/cases/<Nome>Case.tsx` + registrar em `cases/index.ts` (`caseBodies`).
7. Componentes compartilhados (só na branch que primero as cria; as outras fazem rebase/merge): `components/case-study/Lightbox.tsx`, `CaseImageButton.tsx`, `Reveal` (rv + IO fallback), `CursorAmpliar.tsx`, CSS module com tokens `--u`/easings.
8. Animações conforme ANIMACOES (ver spec §2 por projeto).
9. Gates: `pnpm build && pnpm lint && pnpm exec tsc --noEmit && ./scripts/check-quality-gates.sh 3 4 5 6 7` — tudo verde antes de considerar pronto.
10. Commits atômicos por passo.

## Específico por branch

- **feature/case-pontos-sem-no**: refazer o case existente p/ Figma 17:899 — etapas 01–06 com chips, pôsteres CABE/Hoje, grid de prototyping, bloco final do manual; 14 imagens no lightbox.
- **feature/case-cascavel**: Figma 17:4049 — fluxo de diálogo, colagem de renders absoluto, grade 3×3 de telas, pan scroll nas 6 imagens grandes; 23 imagens no lightbox.
- **feature/case-caju**: Figma 17:5070 — grid processo (6 cards), prototyping (várias), pilha sticky 3.6× tela, flipbook 16 folhas, trava de leitura 3 gestos + mascote.

## Validação do orquestrador (após as 3 branches)

- `pnpm build` na develop após merge das 3.
- gates 3 4 5 6 7 na develop.
- conférence visual: `next dev`, comparar cada página com `public/images/projects/<slug>/figma/shot-full.png` em pt-BR/en, 1728px e 390px.
- checar que `git status` não tem asset de exemplo antigo e que o lightbox abre/fecha/navega nas 3 páginas.
