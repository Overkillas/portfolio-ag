# QUALITY GATES — fix visual Pontos sem nó

1. `pnpm exec tsc --noEmit` exit 0; `pnpm lint` 0 errors; `pnpm build` exit 0 (páginas pt-BR/en do psn geradas).
2. `flock /tmp/portfolio-gates.lock bash -c 'for g in 3 4 5 6 7; do ./scripts/check-quality-gates.sh $g; done'` — todos exit 0, Failed: 0 (dev server morto; gate 5 usa porta 3000).
3. CDP em /pt-BR/projetos/pontos-sem-no (1728): 14 botões data-lb, lightbox abre/navega/Esc, sem brokenImages, sem consoleErrors, overflowX false.
4. Mobile 390: overflowX false, hero com proporção correta (sem letterbox), galerias em 1 coluna legível, chips alinhados à esquerda.
5. `python3 ~/.hermes/cache/scratch/sbs.py pontos-sem-no <impl.png> <prefixo> 4` — corpo do case bate com o Figma (chips outline, foto do circo enquadrada, espaçamentos); sobras apenas de layout compartilhado (fora de escopo).
6. /en/projetos/pontos-sem-no: 100% EN, mesma estrutura.
