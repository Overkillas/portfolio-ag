# SPEC — Correção de bugs visuais do case Caju (Figma 17:5070)

Data: 2026-11-09. Base: branch `feature/case-caju` (worktree /tmp/wt-caju2).
Fonte da verdade visual: Figma node 17:5070 (frame 1728×7422). Animações: ANIMACOES-projetos.md §4.
Auditoria: deleg_4d7e732d (2 agentes, fatias lado a lado Figma|site, mobile 390, EN).

## Escopo
Corpo do case caju em `/pt-BR/projetos/caju` e `/en/projetos/caju` (página e modal), incl. mobile. FORA DE ESCOPO (layout compartilhado, não tocar): header PROJECTS, chip "Concluído"+data, balão de agradecimento com avatar, "Talvez você goste…", footer "visite também"/redes sociais.

## Bugs a corrigir (consolidado, por severidade)

### Alta
1. **Pilha "Páginas do livro" vira grade rígida 2×3** — CajuCase renderiza `.stackGrid` dentro do CajuStack; o CSS do leque (`.stack .sCard` absolute 48.68cqw, `.sRow1/.sRow2` com `var(--e1/--e2)`) existe mas não é usado. Esperado (17:5473..5481 + ANIMACOES §4.1): 6 páginas 662×662 em 2 colunas (x189/x886, y 4371/4676/4981) sobrepostas em leque dentro de wrapper sticky de 3,6 telas; linha 2 sobe entre 8–46% e linha 3 entre 54–92% do percurso (smoothstep). Corrigir: usar as classes `.sCol0/.sCol1/.sRow0/.sRow1/.sRow2/.sCard` do caju.module.css dentro do CajuStack, na ordem do Figma.
2. **i18n quebrado na rota pt-BR**: `sections.readingSim` (title/aiNote/hint/counter/next/prev/backToCover) está em INGLÊS no `dictionaries/pt-BR.json` → página PT mostra "Reading simulation" + nota de IA em inglês. Corrigir pt-BR.json para PT e revisar en.json.
3. **Tradução EN incorreta**: "Caju: Semen has no tooth" — "semente" traduzido como "semen"; deve ser "seed" ("A seed has no tooth"). Varificar todo en.json por traduções literais/erradas.
4. **Ordem/posição dos blocos de processo**: no site, "Brainstorming" e "Painel visual - Imagem a" estão dentro de "Prototipagem"; no Figma ficam na seção anterior (acima do título Prototipagem, y≈1913..2525). "Projeto final | Ferramentas | Mídia impressa" aparece deslocado para baixo (deveria estar antes da pilha, por volta de y 3768). Reordenar conforme árvore Figma.
5. **Galeria de páginas com conteúdo/ordem errados**: o site mostra páginas diferentes das do Figma (labirinto, página sem texto etc. em posições trocadas). Usar exatamente as 6 páginas dos nós 17:5475/5476/5477/5478/5479/5480 na ordem/colunas do Figma, com sombra e border-radius alto.
6. **Legenda x imagem trocadas**: "Pintura das páginas e diagramação" está sobre imagem de rascunho line-art. Conferir cada legenda (captions) com a imagem real do nó correspondente.
7. **Imagens do bloco superior da seção do livro trocadas** (bebê de fralda / menina no espelho no lugar de leitura na cama + cuidador com bebê). Recortar do Figma os nós corretos.

### Média
8. **Mascote da trava de leitura**: `mascotSrc` usa `capa-versoes.jpg` (colagem do aside). Extrair do Figma o rosto da mascote (nó 17:5492, x1431 y6485 w139 h132) como PNG transparente e usar ali.
9. **Card "Paleta de cores"** mostra `capa-versoes.jpg`; extrair os swatches do nó 17:5263 (x1133 y1045 w175 h199, com image 38/39/40/42) e usar no card.
10. **EN com sobras em PT** nas legendas (ex.: "Rascunho dos desenhos…" em /en). Paridade total EN no en.json.
11. **Mobile (390px)**: vãos vazios gigantes no meio da página (lazy-load não carregou ou espaçadores), texto final em cinza ilegível/truncado, imagens tocando as bordas laterais, vãos anômalos entre seções. Verificar `loading="lazy"` + o scroll do cdp.mjs (que rola a página) e os espaçamentos do CSS mobile.

### Baixa
12. Hero ligeiramente mais alto que no Figma (17:5177 1354×461) — ajustar aspect-ratio do recorte.
13. Tag "ilustração digital" em minúscula entre tags capitalizadas — padronizar caixa nas tags do dicionário.

## Critérios de aceite
- tsc, lint, build e gates 3–7 verdes (sob lock /tmp/portfolio-gates.lock).
- Comparação lado a lado (sbs.py) das 6 fatias: corpo do case equivalente ao Figma; divergências restantes documentadas e só de layout compartilhado (fora de escopo).
- pt-BR 100% PT e en 100% EN (checar com grep por "semen" etc.).
- Pilha em leque com animação de scroll; flipbook e trava funcionando (checks-caju-book2/lock4).
- Sem erros de console, sem imagens quebradas, sem overflowX em 1728 e 390.
