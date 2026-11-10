# PLAN — Fix visual remanescente do psn

Branch: `feature/case-pontos-sem-no` (/tmp/wt-psn2).

1. Chips do topo: achar no TSX do case qual classe renderiza as tags (se for o Pill do CaseShell, criar `.tag` local no pontos-sem-no.module.css: background transparent, border 1px solid var(--color-blue), color azul) e trocar no TSX do case SOMENTE. Verificar no browser que renderiza vazado.
2. Offset vertical: rodar checks-pos.js comparando y dos blocos com a árvore Figma; ajustar margins do módulo do case (não do CaseShell).
3. Remover numerais 1–4 da faixa de ícones (componente próprio do case).
4. Flor no vidro: ajustar aspect-ratio/object-position no módulo para bater com o nó 17:899.
5. Mobile: grid de logos → 2 colunas abaixo de 767px; tiles de processo com larguras iguais (grid) e `max-width:100%` na faixa listrada.
6. Strings: corrigir "Braindumping," (tirar vírgula), uniformizar "Elementos de apoio", en.json ("Prints"/"images") com dictedit.py.
7. Verificar: dev 3107; cdp.mjs 1728 (checks-lightbox.js), 390, /en/projetos/pontos-sem-no; sbs.py 4 + tiras. Matar dev; flock: build + gates 3 4 5 6 7; tsc; lint.
8. Commits atômicos pt-BR (`git -c user.name=Jv1ctor -c user.email=jvbarr@local commit`). Sem push/merge.
