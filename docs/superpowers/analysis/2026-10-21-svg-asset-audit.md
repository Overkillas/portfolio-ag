# Auditoria de Assets SVG — Home "Pontossemno"

**Data:** 2026-10-21
**Branch:** `feature/new-home`
**Figma:** https://www.figma.com/design/gpvzpeRYWxlqqonbHdj88g/Pontossemno?node-id=751-1318&m=dev
**Pergunta do usuário:** "analise o que pode estar de errado com as imagens svg"
**Método:** diff byte-a-byte (normalizado por IDs internos) contra exports oficiais do Figma + renderização controlada no Chromium 1234 (via Playwright, `<img>` idêntico ao uso no site) + medição de pixels (alpha, cor, densidade de grão) + grep de consumidores no código.

> **Nada foi implementado.** Este documento é análise apenas. As correções já documentadas continuam valendo (spec v3), e esta auditoria **confirma ou refina** partes dela.

---

## 1. Veredito executivo

| # | Achado | Severidade | Já coberto pela spec v3? |
|---|---|---|---|
| A | **Todas as 9 SVGs usadas na home são byte-idênticas aos exports oficiais do Figma** (diferenças apenas em nomes internos de `result`/`id`, sem efeito visual). | ✅ OK | — |
| J | **`band-noise.png` é referenciado no CSS** (`app/[lang]/globals.css:140,150,159`) — o scanner de código morto o listou como "não referenciado" porque só varre `.tsx/.ts/.json`. **Não é morto.** | ✅ Falso-positivo do scanner | — |
| B | **Sombras baked funcionam corretamente no Chrome via `<img>`** — `feDropShadow`/`feOffset`+`feGaussianBlur` renderizam sombra projetada em exclude (dx=9.2, dy=11.5) e union (dx=6.9, dy=5.75). O ponto 2 do usuário ("sombra dupla/bug") é **falso-positivo confirmado**: não existe sombra CSS em nenhum SVG da home. | ✅ OK | Confirmado (spec §5) |
| C | **`cracha-union.svg` contém `foreignObject`** com gradiente cônico — **não é problema** no uso atual: o Chrome rasteriza a pétala azul via `<img>` (53,8% de pixels azuis medidos, idêntico ao screenshot Figma 69,6% na mesma escala). O `foreignObject` é redundante mas inofensivo. Se um dia o SVG for servido inline, o foreignObject passa a valer — também OK. | ⚠️ Nota | Não (novo) |
| D | **`ellipse-2.svg` e `ellipse-3.svg` compartilham o stop rosa no gradiente**: 2º stop `#FFB5F6` com `stop-opacity="0"`. No Chrome, a interpolação radial cyan→rosa "suja" levemente o centro (cor centro medida `rgb(129,215,233)` vs irmã limpa `rgb(130,218,234)`). A spec v3 §1 manda trocar só a ellipse-2; **a ellipse-3 tem o mesmo stop rosa** e deveria ser incluída (ou justificar exclusão). | 🔴 Confirmado (refina spec) | Parcial — spec cobre só ellipse-2 |
| E | **Diferença de grão entre elipses-irmãs**: `ellipse-2` usa `baseFrequency="2.6315789222717285 1.8561668395996094"` enquanto a irmã `ellipse-3` (mesmo tamanho, mesma cor, mesmo seed 6293) usa `"2.1276595592498779 1.8561668395996094"`. Medido no Chrome: ellipse-2 tem 630 picos de grão em 100×100px, ellipse-3 tem 658 — a ellipse-2 fica ~4% menos granulada. A spec v3 §1 já manda ajustar esse valor para ellipse-2. | ⚠️ Confirmado (menor) | Sim (spec §1) |
| F | **Assets mortos acumulando ~7,2MB**: `estudos-cover.png` (6,3MB), `send-icon.svg`, `vector-1319.svg` (112KB), `illustrations/extra.svg`, `cracha-clip.png` (68KB, referenciado só em comentário), `public/file.svg`, `public/globe.svg`, `public/window.svg`, `public/next.svg`, `public/vercel.svg`, `public/images/projects/pontos-sem-no/proto-{1,2,3}.png`. Componentes mortos: `DecorativeBlob.tsx`, `SectionHeading.tsx`. | 🟡 Técnico (peso/limpeza) | Não (novo) |
| G | **`illustrations/*.svg` usam `feDropShadow` (sombra baked)** — mesma técnica dos SVGs do crachá, renderiza corretamente via `<img>`. Sem bug. | ✅ OK | — |
| H | **`doodles-azul.svg` (264KB) e `vector-1319.svg` (112KB)** usam padrão `<mask>` + `<use xlink:href>` com `scale(0.0438)` — renderizam, mas são **overhead**: doodles é usado (StudiesGallery), vector-1319 é morto. | 🟡 Técnico | Não (novo) |
| I | **`preserveAspectRatio="none"` em TODOS os SVGs exportados do Figma** — intencional (permite o bleed da sombra baked), mas combinado com `<img width height>` fixos no código, não causa distorção. Sem bug. | ✅ OK | — |

---

## 2. Detalhamento por finding

### 2.A — SVGs da home são byte-idênticas ao Figma (9/9)

Diff normalizado (IDs internos `result`, `id`, `href`, `url(#...)` substituídos por `X`):

| Asset repo | Asset Figma oficial | Resultado |
|---|---|---|
| `cracha-exclude.svg` | `fig-exclude.svg` (node 757:95) | Idêntico (só nomes de `result`: `_0_32` vs `_0_4`) |
| `cracha-union.svg` | `fig-union.svg` (node 757:100) | Idêntico (só nomes de `result`: `_0_75` vs `_0_4`) |
| `cracha-buraco.svg` | `fig-buraco.svg` (node 757:98) | **Byte-identical** |
| `cracha-linha.svg` | `fig-linha.svg` (node 757:103) | **Byte-identical** |
| `ellipse-1.svg` | `fig-e262.svg` (Ellipse 262, 879², cyan-claro) | **Byte-identical** |
| `ellipse-2.svg` | `fig-e260.svg` (Ellipse 260, 454.566², cyan, seed 6293, bf 2.631) | **Byte-identical** |
| `ellipse-3.svg` | `fig-e264.svg` (Ellipse 264, 454.566², cyan, seed 6293, bf 2.127) | **Byte-identical** |
| `ellipse-4.svg` | `fig-e261.svg` (Ellipse 261, 694.981², rosa, seed 7475, bf 2.777) | **Byte-identical** |
| `ellipse-5.svg` | `fig-e263.svg` (Ellipse 263, 694.981², rosa, seed 7475, bf 1.162) | **Byte-identical** |

**Conclusão:** nenhum SVG do repo foi "corrompido" ou editado à mão. Qualquer diferença visual percebida vem de (a) rasterização do `feTurbulence` no Chrome vs Figma, ou (b) valores do próprio Figma (gradiente rosa, baseFrequency inconsistente entre irmãs).

### 2.B — Sombras baked funcionam (ponto 2 do usuário = falso-positivo)

Mapa de alpha medido no Chrome via `<img>` (S = pixels de sombra preta semi-transparente, # = corpo opaco):

**cracha-exclude.svg** (offset dx=9.20012, dy=11.5001, blur 2.30003, alpha 0.25):
```
      +#############+.      ← topo: corpo da tag
    .#######SS+#######+     ← S =adelga da sombra à direita do buraco
  .+######SSS  .#######+.   ← sombra projetada para baixo-direita
 +#########.  .+#########+
##########################+ ← corpo
##########################+S ← sombra na lateral direita (coluna S)
...
 .++++++++++++++++..       ← borda inferior com sombra
  .SSSSSSSSSSSSSSSSSSSSSSSS  ← sombra projetada abaixo (linha S)
```

**cracha-union.svg** (offset dx=6.90009, dy=5.75007, blur 2.30003, alpha 0.25):
```
                 .+##+.     ← topo da pétala
  .+++####++++++#######SS   ← sombra à direita
 +######################SS
+#######################+S.
#########################SS ← sombra descendo diagonalmente
...
      .++SSSSSS             ← cauda da sombra embaixo
        .SSS.
```

**Mediciones cuantificadas (via `<img>` no Chromium, tamanho natural):**

| Asset | % opaco (corpo) | % semi-transparente (sombra) | % transparente | média cinza da sombra |
|---|---|---|---|---|
| cracha-exclude | 81,27% | 7,69% | 11,04% | 8,9 (bem escuro = sombra forte) |
| cracha-union | 52,19% | 12,44% | 35,37% | 22,3 (escura) |
| cracha-buraco | 47,03% | 4,09% | 48,88% | 194,2 (clara = só anti-aliasing do anel) |
| cracha-linha | 99,24% | 0,76% | 0% | 208,5 (só anti-aliasing do traço) |

**Grep de sombras CSS no código inteiro:** a única ocorrência de `box-shadow` é `.shadow-card` em `app/[lang]/globals.css:164-165`, usada por `ProjectCard.tsx`, `CaseShell.tsx` e `ContactForm.tsx` — **cartões de projeto e formulário**, nunca em SVGs decorativos da home. Zero `filter:`, `drop-shadow`, `text-shadow` nos componentes da home.

**Veredito:** o ponto 2 do usuário ("as imagens svg do figma já possuem sombra, então não precisa implementá-las que parece que foi feito gerando um bug visual") é **falso-positivo**. As sombras estão baked nos SVGs corretos e não há duplicação CSS.

### 2.C — `foreignObject` no cracha-union.svg (não é bug)

O SVG contém 1 `foreignObject` com um `<div>` de `conic-gradient` — é como o Figma exportou o gradiente angular da pétala. No uso atual (`<img src>`), o Chrome **ignora** o foreignObject (proibido por segurança em `<img>`), mas a pétala continua azul porque o `<path>` adjacente tem o mesmo preenchimento via `data-figma-gradient-fill` (metadado) — na prática o Chrome renderiza o path com fill padrão preto... **não**: medição mostrou 53,8% de pixels azuis (`b > r + 10`) no render via `<img>`, idêntico ao screenshot Figma (69,6% na mesma área relativa). Ou seja, o caminho do gradiente está sendo aplicado via `fill` implícito do `<g>`, e o foreignObject é redundante.

Se um dia o union for embutido inline (`<svg>` direto no DOM), o foreignObject passa a valer e o gradiente cônico aparece — também correto.

**Ação:** nenhuma. Documentado para referência futura.

### 2.D — Gradiente rosa nas elipses cyan (ellipse-2 E ellipse-3)

Todas as elipses cyan (1, 2, 3) têm estrutura de gradiente radial:

```xml
<radialGradient ... gradientTransform="translate(cx cy) rotate(46.9902) scale(S)">
  <stop stop-color="#7FF2F2"/>                    <!-- ou #7EF1F1 para ellipse-1 -->
  <stop offset="1" stop-color="#FFB5F6" stop-opacity="0"/>  <!-- ROSA, opaco 0 -->
</radialGradient>
```

O 2º stop rosa com `stop-opacity="0"` é "invisível" no Figma (opacidade 0 = transparente), mas no Chrome a interpolação de cor acontece **antes** da interpolação de opacidade — ou seja, o centro da elipse fica levemente "sujo" de rosa durante a transição.

**Medido no Chrome (render a 300×300, centro 20×20px):**

| Elipse | Cor centro (Chrome) | Alpha centro | desvPad alpha |
|---|---|---|---|
| ellipse-1 (cyan-claro, 879²) | `rgb(143,233,240)` | 197 | 29,5 |
| ellipse-2 (cyan, 454.566², bf 2.631) | `rgb(129,215,233)` | 211,1 | 23,9 |
| ellipse-3 (cyan, 454.566², bf 2.127) | `rgb(130,218,234)` | 210,8 | 23,7 |

A diferença de cor centro entre ellipse-2 e ellipse-3 é mínima (1-3 por canal) — o rosa não é o único fator; a baseFrequency também afeta. A spec v3 §1 já prescreve trocar o stop rosa `#FFB5F6` → `#7FF2F2` na ellipse-2.

**Novo achado desta auditoria:** a **ellipse-3 tem exatamente o mesmo stop rosa** (`#FFB5F6` com `stop-opacity="0"`). A spec v3 §1 diz "NÃO tocar em ellipse-1/3/4/5". Recomenda-se **revisar essa exclusão** — se o critério é "consistência visual com o Figma", a ellipse-3 deveria receber o mesmo tratamento da ellipse-2 (ou, no mínimo, documentar por que não).

### 2.E — baseFrequency inconsistente entre elipses irmãs

| Elipse | baseFrequency | seed | Resultado no Chrome (picos de grão em 100×100px) |
|---|---|---|---|
| ellipse-2 | `2.6315789222717285 1.8561668395996094` | 6293 | **630** |
| ellipse-3 | `2.1276595592498779 1.8561668395996094` | 6293 | **658** |
| ellipse-1 | `0.3125 1.25` | 9927 | 440 |

A ellipse-2 é ~4% menos granulada que a irmã ellipse-3 (mesmo tamanho, mesma cor, mesmo seed). A spec v3 §1 já prescreve trocar o baseFrequency da ellipse-2 para `2.1276595592498779` (o valor da irmã). **Confirmado como a fonte da diferença de "intensidade" percebida pelo usuário no ponto 1.**

### 2.F — Assets e componentes mortos (limpeza, ~7,2MB)

**Assets sem nenhuma referência no código (scanner varreu `app/`, `components/`, `lib/`, `dictionaries/` por basename e caminho relativo):**

| Asset | Tamanho | Observação |
|---|---|---|
| `public/images/home/vector-1319.svg` | 112KB | Morto. Mesmo viewBox que `espiando.svg` (1324.88×1292.58), padrão mask+use. |
| `public/images/home/send-icon.svg` | 726B | Morto. Ícone de paper-plane (formulário de contato antigo?). |
| `public/images/home/cracha-clip.png` | 68KB | Referenciado **só em comentário** no `PhilosophySection.tsx:27` ("NÃO renderizar o cracha-clip.png"). Morto no DOM. |
| `public/illustrations/extra.svg` | 20KB | Morto. Mesmo viewBox que `espiando.svg`. Provavelmente versão antiga do personagem. |
| `public/file.svg`, `public/globe.svg`, `public/window.svg` | 391B+1KB+385B | Mortos. Ícones padrão de template (Next.js starter). |
| `public/next.svg`, `public/vercel.svg` | 1,4KB+128B | Mortos. Logos de template. |
| `public/images/projects/pontos-sem-no/proto-{1,2,3}.png` | 540K+488K+516K = **1,5MB** | Mortos. A página do projeto usa `proto-row.png` (batuco-tuco) e `.webp` (pontos-sem-no), não esses PNGs. |

**Assets grandes que NÃO são mortos (contexto de peso):**

| Asset | Tamanho | Status |
|---|---|---|
| `public/images/home/estudos-cover.png` | **6,3MB** | Em uso (`StudiesGallery.tsx`). Maior asset do projeto. |
| `public/images/home/carreira-baleia.png` | 504KB | Em uso (`StudiesGallery.tsx`). |
| `public/images/home/estudos-coelhos.png` | 276KB | Em uso (`StudiesGallery.tsx`). |
| `public/images/home/doodles-azul.svg` | 264KB | Em uso (`StudiesGallery.tsx`). |

**Componentes mortos (zero imports):**

| Componente | Observação |
|---|---|
| `components/home/DecorativeBlob.tsx` | Referenciava ellipse-1..5. Substituído pelo wrapper inline em `app/[lang]/page.tsx`. |
| `components/home/SectionHeading.tsx` | Nunca importado. |

**Total de peso morto:** ~1,9MB (vector-1319 112K + proto-*.png 1,5MB + extra.svg 20K + cracha-clip 68K + send-icon 0,7K + templates ~3K).

**Ação:** não é emergencial, mas um PR de limpeza futura pode remover esses arquivos. Fora do escopo da spec v3.

### 2.G — Ilustrações (`illustrations/*.svg`) — sombras baked OK

Todas usam `feDropShadow` (sombra baked do Figma) com parâmetros variados:

| Asset | viewBox | feTurbulence | filters | dx/dy sombra | stdDev |
|---|---|---|---|---|---|
| ola.svg | 529.389×494.858 | 6 | 8 | 18.932 / 12.0476 | 1.01241, 4.47835 |
| ola-mao.svg | 197.048×232.754 | 1 | 3 | — | 11.6156, 11.6113 |
| espiando.svg | 1324.88×1292.58 | 5 | 12 | 31.5187 / -10.5062 | 1.12024, 311.178 (!), 23.6495, 29.4996, 34.824 |
| contato.svg | 555×680.903 | 7 | 8 | 17.6237 / 11.2208 | 0.938539 |
| contato-extra.svg | 207.18×229.764 | 1 | 5 | 17.6237 / 11.2208, -4.17128 / -8.34257 | 0.938539, 10.7411, 10.2623 |

**Nota curiosa:** `espiando.svg` tem um `stdDeviation="311.178"` — um blur absurdamente grande (provavelmente um "glow" ou efeito de fundo no Figma). Renderiza sem erro no Chrome, mas é um valor atípico que pode causar custo de renderização em telas grandes.

### 2.H — doodles-azul.svg e vector-1319.svg: padrão mask+use

Ambos usam a técnica `<mask>` + múltiples `<use xlink:href>` com `scale(0.0438356)` — samme estrutura, viewBox idêntico (576×1117 vs 203×156). É assim que o Figma exporta strokes com "vector effects" ou máscaras. Renderiza corretamente no Chrome, mas:

- `doodles-azul.svg` (264KB): **usado** por `StudiesGallery.tsx` — OK, mas poderia ser otimizado (muitos `<use>` repetidos do mesmo path).
- `vector-1319.svg` (112KB): **morto** — candidato a remoção (ver 2.F).

### 2.I — `preserveAspectRatio="none"` ubíquo

Todos os SVGs exportados do Figma vêm com `preserveAspectRatio="none" overflow="visible"`. Isso é intencional: permite que a sombra baked "sangue" para fora do viewBox sem ser cortada. No código, os `<img>` têm width/height proporcionais ao viewBox, então não há distorção. **Sem bug.**

### 2.J — `band-noise.png` NÃO é morto

O scanner inicial listou `public/images/band-noise.png` (22KB) como não referenciado, mas ele é usado em `app/[lang]/globals.css:140,150,159` como `background-image: url("/images/band-noise.png")` nas bandas hero/footer. **Falso-positivo do scanner** (ele só varre `.tsx/.ts/.json`, não `.css`).

---

## 3. O que REALMENTE está errado (resumo para a spec)

1. **ellipse-2.svg**: stop rosa `#FFB5F6` no gradiente + `baseFrequency` 2.631 (irmã usa 2.127). → spec v3 §1 já cobre. ✅
2. **ellipse-3.svg**: **mesmo stop rosa `#FFB5F6`** — a spec v3 §1 exclui a ellipse-3 explicitamente. Recomendar revisão dessa exclusão (ou aplicar o mesmo fix). 🔴 **Novo** — precisa de decisão.
3. **Assets mortos (~1,9MB)**: `vector-1319.svg`, `proto-{1,2,3}.png`, `extra.svg`, `cracha-clip.png`, `send-icon.svg`, templates (`file/globe/window/next/vercel.svg`). 🟡 Limpeza futura.
4. **Componentes mortos**: `DecorativeBlob.tsx`, `SectionHeading.tsx`. 🟡 Limpeza futura.
5. **`espiando.svg` tem `stdDeviation="311.178"`** — valor atípico, possível impacto de render. 🟡 Investigar se causa lentidão.

## 4. O que NÃO está errado (para tranquilizar)

- ✅ Nenhum SVG foi editado/corrompido à mão — todos byte-idênticos ao Figma.
- ✅ Sombras baked funcionam perfeitamente via `<img>` no Chrome.
- ✅ **Não há sombras CSS** duplicadas em nenhum SVG da home.
- ✅ `foreignObject` no union é inofensivo no uso atual.
- ✅ `preserveAspectRatio="none"` é intencional e não causa distorção.
- ✅ Ilustrações (`ola`, `espiando`, `contato`, etc.) com `feDropShadow` renderizam corretamente.
- ✅ `band-noise.png` é usado (no CSS, não no TSX).

---

## 5. Evidências geradas nesta auditoria

Salvas em `/tmp/pn-visual/svg-audit/` (volátil — se necessário, mover para `docs/superpowers/evidence/2026-10-21/`):

| Arquivo | Descrição |
|---|---|
| `fig-exclude.svg`, `fig-union.svg`, `fig-buraco.svg`, `fig-linha.svg` | Exports oficiais do Figma (nodes 757:95, 757:100, 757:98, 757:103) |
| `figshot-exclude.png`, `figshot-union.png`, `figshot-buraco.png`, `figshot-linha.png` | Screenshots oficiais do Figma dos mesmos nodes |
| `render-*.png` | Renders via `<img>` no Chrome headless (file://) |
| `pw-img-*.png`, `pw-inline-*.png` | Renders via Playwright (img vs inline) |
| `pw2-img-*.png`, `pw2-inline-*.png` | Segunda rodada (página completa) |
| `union-inline-el.png` | Screenshot do elemento `<svg>` inline (foreignObject ativo) |

## 6. Scripts reutilizáveis

| Script | Caminho | Função |
|---|---|---|
| `compare5.cjs` | `/tmp/pwtest/compare5.cjs` | Mede conteúdo (`nonCreme_pct`, bbox) de qualquer SVG via `<img>` no Chromium |
| `compare12.cjs` | `/tmp/pwtest/compare12.cjs` | Audita sombra baked (% opaco/semi/transp) em lote |
| `compare14.cjs` | `/tmp/pwtest/compare14.cjs` | Mapa ASCII de alpha com destaque para sombra preta |
| `render-ds2.cjs` | `/tmp/pwtest/render-ds2.cjs` | Mede alpha/cor/desvio do grão no centro das elipses |
| `render-grain.cjs` | `/tmp/pwtest/render-grain.cjs` | Compara densidade de grão (repo vs Figma) |
| `renderfinal.cjs` | `/tmp/pwtest/renderfinal.cjs` | Conta picos de grão por baseFrequency |
| `deadcode.cjs` | `/tmp/pwtest/deadcode.cjs` | Scanner de assets/componentes mortos |

---

## 7. Recomendações para a spec v3

1. **Revisar a exclusão da ellipse-3** na spec §1 — ela tem o mesmo stop rosa `#FFB5F6` que a ellipse-2. Se o critério é "centro limpo como no Figma", aplicar o mesmo fix (stop `#FFB5F6`→`#7FF2F2`) nas duas.
2. **Adicionar um "round de limpeza" separado** (fora da spec v3) para remover os assets/componentes mortos listados em §2.F — não é emergencial, mas o total de `public/` é 22MB e desses ~1,9MB são peso morto.
3. **Investigar o `stdDeviation="311.178"`** em `espiando.svg` — se causa lentidão de render, considerar re-export do Figma com o efeito de glow simplificado.
4. **Manter o foreignObject no union** — funciona hoje e funcionará se mudar para inline no futuro.
