# QUALITY GATES — fix visual remanescente psn

1. tsc exit 0; lint 0 errors; build exit 0.
2. `flock /tmp/portfolio-gates.lock bash -c 'for g in 3 4 5 6 7; do ./scripts/check-quality-gates.sh $g; done'` — Failed: 0 (dev morto; gate 5 porta 3000).
3. CDP 1728 /pt-BR/projetos/pontos-sem-no: 14 botões data-lb, lightbox ok, sem erros/imagens quebradas/overflowX.
4. 390: overflowX false, grid de logos legível (2 col), tiles de processo dentro das margens, sem faixa estourando.
5. sbs.py 4 fatias + psnE: chips do topo vazados, sem numerais sobre ícones, flor no vidro na proporção certa, en sem "Printers"/"Imaginary".
