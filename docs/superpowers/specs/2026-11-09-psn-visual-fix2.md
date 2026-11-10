# SPEC — Fixes visuais remanescentes do Pontos sem nó (17:899)

Data: 2026-11-09. Base: branch `feature/case-pontos-sem-no` (/tmp/wt-psn2). Auditoria: deleg_61b1ad4e task-0 (pós-fixes 9d0f7d9/62746b8/1f83b02).

## Confirmados como OK (não mexer)
- Crop da foto do circo aéreo (amplo, com céu) — fatia 2.
- Mobile: hero sem letterbox (1352/459 cover), galerias com célula mín. 220px, chip de data à esquerda no fluxo.

## Bugs remanescentes (corpo do case)
1. **ALTA — Chips de categoria do topo ainda PREENCHIDOS.** Figma: 4 pills vazadas (fundo transparente, contorno azul fino, texto azul). Site: azul sólido ~#A9C4EE com texto branco. O commit 9d0f7d9 não surtiu no render — investigar em `pontos-sem-no.module.css`/componente usado: provavelmente a classe aplicada é a do Pill preenchido e não a `.pl` vazada, ou há outra regra com maior Flags specificity. Corrigir para outline; se usar componente compartilhado, estilo local no módulo do case.
2. **MÉDIA — Offset vertical ~70px no corpo** (fatia 1: site começa com conteúdo extra e desce tudo). Conferir margin/padding do bloco de data do CaseShell dentro deste case e espaçamentos entre seções vs posições da árvore figma-pontos-sem-no-tree.xml (checks-pos.js).
3. **MÉDIA — Numerais 1–4 sobre a faixa de ícones** (coelho→flor→água-viva→peixe) presentes só no site; remover (ou só no desktop? no Figma não há — remover).
4. **MÉDIA — Foto da flor no vidro mais alta no site** (fatia 3, ocupa ~12–39% vs achatada no Figma): ajustar aspect-ratio/object-position para bater com o nó do Figma.
5. **MÉDIA — Mobile 390:** (a) grid de logos 4×2 com tiles ~75px e wordmark ilegível → no mobile passar para 2 colunas (tiles ≥ 160px); (b) 4º tile de processo comprimido (~38px) e estourando margem direita + faixa listrada estourando a margem → corrigir larguras (grid consistente) e overflow (max-width 100%).
6. **BAIXA — Mobile/i18n:** chip "Braindumping," com vírgula residual (corrigir a string em dictionaries); quebras de chips 2+2+1 com "Impressão" órfã (ok se natural, mas remover vírgula); legendas "Elemento de apoio" vs "Elementos de apoio" inconsistentes (uniformizar plural, pt-BR e en); microtextos ilegíveis em tiles/ilustrações no mobile (aceitável se forem imagens do Figma — só garantir que não há texto HTML pequeno demais); vão excessivo entre bolo e jogo da velha (ajustar margin).
7. **BAIXA — EN:** mistraduções — "Printers" por "Impressão/Impressos" → "Prints"/"Printed materials"; "Imaginary" no lugar de "imagens" → "images". Corrigir em `dictionaries/en.json` (mantendo paridade com pt-BR via dictedit.py).

## Fora de escopo (não tocar)
Header, pill "Concluído"+data, balão+mascote, "Talvez você goste…", "VISITE TAMBÉM", footer/badge N.

## Critérios de aceite
- tsc/lint/build limpos; gates 3–7 sob `flock /tmp/portfolio-gates.lock` Failed: 0.
- sbs.py 4 fatias + psnE + mobile 390: corpo bate com o Figma nos itens acima; sem consoleErrors/brokenImages/overflowX.
- lightbox (14 imgs) continua funcionando (checks-lightbox.js).
