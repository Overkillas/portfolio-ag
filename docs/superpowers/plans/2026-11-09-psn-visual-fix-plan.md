# PLAN — Fix visual do Pontos sem nó

Branch: `feature/case-pontos-sem-no` (/tmp/wt-psn2).

1. **Chips/tags outline**: em `pontos-sem-no.module.css`, `.pl` e `.chip` viram vazados (background transparent, `box-shadow: inset 0 0 0 1px var(--color-blue)` ou border, texto azul). Se a tag do topo usar o Pill compartilhado do CaseShell, não alterar o Pill — criar estilo local no módulo do case para as tags (o Figma mostra outline só neste frame; manter o Pill padrão nos outros cases).
2. **Recorte do circo aéreo**: localizar o nó da foto dos guarda-chuvas na árvore figma-pontos-sem-no-tree.xml, recortar do page-3x.png (escala 3.0) com o enquadramento do Figma (céu acima, grupo completo), salvar no lugar do arquivo atual.
3. **Mobile** (max-width 767px no módulo): hero com aspect-ratio 1352/459 + object-fit cover; `.row` com 1 item por linha quando a célula ficaria < 220px (galeria 2×2 e diagrama); remover `ml-auto`/alinhamento à direita do chip de data no mobile.
4. **Espaçamento vertical**: comparar positions via checks-pos.js (já existe em ~/.hermes/cache/scratch) com a árvore Figma e ajustar margins entre secciones só dentro do módulo do case.
5. **Verificar**: dev na 3107; cdp.mjs com checks-lightbox.js em 1728, audit 390 e /en; sbs.py 4 fatias + visão; matar dev; flock gates: build + 3 4 5 6 7 Failed: 0; tsc; lint.
6. **Commits atômicos** pt-BR: `git -c user.name=Jv1ctor -c user.email=jvbarr@local commit` (css; asset; verificação). Sem push/merge.

Fora de escopo (não tocar): header, pills de status/data no CaseShell, balão/mascote, "Talvez você goste", footer.
