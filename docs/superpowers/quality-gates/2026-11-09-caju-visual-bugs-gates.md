# QUALITY GATES — fix visual do case Caju

Todos abaixo DEVEM passar na branch `feature/case-caju` antes de considerar pronto.

1. `pnpm exec tsc --noEmit` → exit 0.
2. `pnpm lint` → 0 errors (warnings toleráveis só se pré-existentes).
3. `pnpm build` → exit 0, página /pt-BR/projetos/caju e /en/projetos/caju geradas (static export OK).
4. Sob `flock /tmp/portfolio-gates.lock`: `./scripts/check-quality-gates.sh 3 4 5 6 7` → cada um exit 0 e "Failed: 0" (gate 5 usa porta 3000 — dev server deve estar morto).
5. Checagens comportamentais via CDP (ferramentas em ~/.hermes/cache/scratch):
   - checks-lightbox.js em /pt-BR/projetos/caju: 12 botões data-lb, abrir/setas/Esc, foco volta, sem imagens quebradas, consoleErrors vazio.
   - checks-caju-book2.js: abrir capa → "Páginas 1–2 de 30", virar 2×, voltar 1×.
   - checks-caju-lock4.js: trava encaixa, 3 gestos mostram g1/g2/g3 e solta rolando.
   - mobile 390: overflowX false, brokenImages vazio, sem vãos vazios gigantes no meio da página.
6. Visual: `python3 sbs.py caju <impl.png> <prefixo> 6` + inspecionar as 6 fatias — corpo do case sem incongruências novas vs Figma; sobras apenas de layout compartilhado (listadas como fora de escopo na spec).
7. i18n: `grep -i semen dictionaries/en.json` → 0; pt-BR.json sem "Reading simulation"; paridade de chaves pt/en (o build já valida).
