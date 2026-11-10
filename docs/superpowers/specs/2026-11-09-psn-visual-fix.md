# SPEC — Correções visuais do case Pontos sem nó (Figma 17:899)

Data: 2026-11-09. Base: branch `feature/case-pontos-sem-no` (worktree /tmp/wt-psn2).
Auditoria: deleg_c28e35f9 (fatias psnA-cmp-0..3, mobile psn-m-strip, EN psnE-cmp-*).

## Escopo
Corpo do case em /pt-BR e /en/projetos/pontos-sem-no (página e modal), incl. mobile 390px.
FORA DE ESCOPO (layout compartilhado, NÃO tocar): header PROJETOS/PROJECTS, pill "Concluído"+data, balão de agradecimento+mascote, "Talvez você goste…", tarja "VISITE TAMBÉM", footer, badge "N".

## Bugs no escopo (do corpo do case)
1. **Chips e tags preenchidos em vez de vazados (outline azul)** — fatias 0–1: no Figma as 4 tags do topo e os mini-chips das etapas 01–06 têm fundo transparente/creme e contorno azul fino; o site usa preenchimento sólido (`--color-blue-pale` / `#e2e8f6`). Corrigir `.pl`/`.chip` (e o Pill do CaseShell? NÃO — o Pill é compartilhado; verificar se a tag do topo do case usa componente próprio; se usar o Pill compartilhado, criar classe local no módulo do case para outline). Conferir no Figma se é só deste case ou vale para os chips das etapas (sim, etapas 01–06 vazadas).
2. **Foto do circo aéreo (guarda-chuvas) com crop errado** — fatia 2: no Figma aparecem ~6–8 guarda-chuvas e céu acima; o recorte atual (`proto-*`/arquivo correspondente) está fechado demais. Reenquadrar o recorte do nó Figma correspondente (page-3x, escala 3.0) mostrando o grupo todo com respiro de céu.
3. **Mobile 390px**: (a) hero letterboxado/destoante (proporção ruim, mascote pequeno, flores cortadas) — usar aspect-ratio do nó 17:1003 (1352×459) com object-fit cover; (b) diagrama de garatujas e galeria 2×2 comprimidos e ilegíveis (~180px/célula) — no mobile, deixar cada bloco em largura total (1 coluna) ou mínimo legível, nunca espremer 2×2; (c) chip de data órfão alinhado à direita na 3ª linha — no mobile, alinhar chips à esquerda em fluxo normal (remover ml-auto no mobile).
4. **Deslocamento vertical ~55–75px** por métrica de texto — já ajustamos line-height para 1.125 (18px); rever quebras dos parágrafos da intro vs Figma (largura da coluna do aside layout 660/588/104) e o espaçamento entre blocos (mt-8 do CaseShell = 32px; Figma usa vãos diferentes por seção — conferir por nó).

## Fora de escopo (registrados, não corrigir)
Header, pill Concluído+data, balão/mascote do CTA, "Talvez você goste…", "VISITE TAMBÉM", footer/badge N, EN do Figma com strings PT (o site EN está correto).

## Critérios de aceite
- tsc/lint/build limpos; gates 3–7 sob `flock /tmp/portfolio-gates.lock` com Failed: 0.
- sbs.py 4 fatias: corpo do case sem as divergências acima; mobile 390 sem ilegibilidade/órfãos.
- lightbox de 14 imagens continua ok (checks-lightbox.js), sem console errors, sem broken images, sem overflowX.
