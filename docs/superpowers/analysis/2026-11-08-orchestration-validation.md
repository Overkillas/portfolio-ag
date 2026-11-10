# Orquestração — validação pós-merge das 3 branches de case

**Branch base:** `chore/case-assets-figma` (assets Figma + spec/plan/quality-gates)
**Branches de implementação:** `feature/case-pontos-sem-no`, `feature/case-cascavel`, `feature/case-caju`

## Sequência de merge (rebase para evitar conflitos em lib/projects.ts, dictionaries, cases/index.ts)

1. `git checkout develop && git merge chore/case-assets-figma`
2. Para cada feature branch, na ordem: `git checkout -b integration/cases-3 origin/develop && git merge feature/case-pontos-sem-no` → rodar gates → `git merge feature/case-cascavel` → gates → `git merge feature/case-caju` → gates. Resolver conflitos em `lib/projects.ts` (concatenar entradas), `dictionaries/*.json` (merge por chave), `components/case-study/cases/index.ts` (concatenar), componentes compartilhados (Lightbox etc. — manter a versão mais completa).

## Validação final na integration (Ralph loop: rodar até passar)

- [ ] `pnpm build` exit 0
- [ ] `pnpm lint` exit 0
- [ ] `pnpm exec tsc --noEmit` exit 0
- [ ] `./scripts/check-quality-gates.sh 3 4 5 6 7` sem FAIL
- [ ] `pnpm dev` e checar status 200 + sem erro no console para:
  - `/pt-BR/projetos/pontos-sem-no`, `/en/projetos/pontos-sem-no`
  - `/pt-BR/projetos/cascavel`, `/en/projetos/cascavel`
  - `/pt-BR/projetos/caju`, `/en/projetos/caju`
  - `/pt-BR/projetos` (índice com os 6 projetos, incl. os 3 novos)
- [ ] Visual vs Figma: comparar cada case com `public/images/projects/<slug>/figma/shot-full.png` (1728px desktop + 390px mobile)
- [ ] Lightbox abre/fecha/navega nas 3 páginas (teste manual ou grep dos data-lb)
- [ ] Modal intercepta a partir do índice (`@modal/(.)<slug>` p/ cada slug novo — gate 7 cobre)
- [ ] Sem assets `raw-*` referenciados no código (só nomes semânticos)
- [ ] `git status` limpo; branches feature prontas p/ PR
