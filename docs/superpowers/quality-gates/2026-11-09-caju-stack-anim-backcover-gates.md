# QUALITY GATES — pilha animada + contracapa (Caju)

1. `pnpm exec tsc --noEmit` exit 0; `pnpm lint` 0 errors; `pnpm build` exit 0.
2. `flock /tmp/portfolio-gates.lock bash -c 'for g in 3 4 5 6 7; do ./scripts/check-quality-gates.sh $g; done'` — todos Failed: 0 (dev server morto antes; gate 5 usa porta 3000).
3. CDP viewport 1000px em /pt-BR/projetos/caju:
   - transform de `.sRow1`/`.sRow2` (getComputedStyle) muda ao rolar dentro do wrapper (ex.: 0% → translateY diferente de 100%);wrapper mede ~3,6×vh.
   - flipbook: virar até o fim → rótulo "Contracapa", última face com `<img>` (não fbPlain), botão "Voltar para a capa" funciona.
   - sem consoleErrors, brokenImages vazio, overflowX false em 1728 e 390.
4. `python3 ~/.hermes/cache/scratch/sbs.py caju <impl.png> <prefixo> 6` — vão entre as seções saneado (sem blocos gigantes), pilha visível em leque.
5. Commits presentes na branch; nada commitado fora de /tmp/wt-caju2.
