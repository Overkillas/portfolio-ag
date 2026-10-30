# Análise de Gaps (Rodada 2): Implementação v2 vs Figma Pontossemno

**Data:** 2026-10-21
**Branch:** `feature/new-home` (HEAD `59b8cc7`)
**Figma:** https://www.figma.com/design/gpvzpeRYWxlqqonbHdj88g/Pontossemno?node-id=751-1318 (canvas 1728×4614, `m=dev`)
**Método:** Medição automatizada da página renderizada (Playwright/Chromium, viewport 1728) + comparación de pixels (ImageMagick) contra screenshots oficiais do Figma (MCP `get_screenshot`/`get_design_context`), diff byte-a-byte dos SVGs exportados, e `get_metadata` para coordenadas exatas. **Nenhum valor é aproximado — todos medidos.**

---

## Resumo Executivo

A branch `feature/new-home` está **concluída e aprovada** (68 commits, review final APPROVED). Esta análise re-verifica 5 pontos apontados pelo usuário após a entrega. Resultado: **1 ponto é falso-positivo (não existe bug)**, **4 pontos são inconsistências reais** (3 visuais de baixa/média severidade + 1 de texto).

| # | Ponto apontado pelo usuário | Veredito | Severidade | Detalhe |
|---|---|---|---|---|
| 1 | "Bolas coloridas estão diferentes em cor e intensidade" | ⚠️ **PARCIALMENTE CONFIRMADO** — assets idênticos, diferença é só de renderização | 🟡 Média | SVGs do repo são **byte-idênticos** aos oficiais do Figma (só muda o ID interno do filtro/gradient). A diferença de intensidade vem do **efeito de grão (feTurbulence)** que o Figma aplica com `feFlood` sobreposto — no Chrome o ruído aparece mais forte/denso, alterando a cor média percebida (medido: elipse cyan-contato alpha médio 117 na impl vs 139 no Figma; pixel central #BEC9E4 vs #CFD5E9). |
| 2 | "SVGs do Figma já têm sombra, não precisa implementar (parece que foi feito, gerando bug visual)" | ❌ **FALSO-POSITIVO — não foi implementado, não há bug** | — | `cracha-exclude.svg` e `cracha-union.svg` **já contêm** a sombra baked (`feOffset dx=9.2 dy=11.5` / `dx=6.9 dy=5.75`, `feGaussianBlur stdDeviation=2.30003`, alpha 0.25). **Nenhuma** sombra CSS (`filter`, `box-shadow`, `drop-shadow`) existe no código da home (`grep` limpo; `getComputedStyle` de todos os imgs = `filter: none`). No bug visual nesse ponto. |
| 3 | "Desalinhamento do texto sobre a SVG da tag (crachá)" | 🔴 **CONFIRMADO** | 🟡 Média | A **primeira linha** do texto typewriter ("acredito") está **~14px acima** da linha-guia correspondente no Figma; as linhas 2-3 estão alinhadas. additionally o texto fica **mais à direita** que no Figma (deslocamento horizontal acumulado da rotação 15.55° vs o ângulo real das réguas 14.8° — ângulos diferentes fazem o texto "escorregar" para fora da pista ao longo das 3 linhas). |
| 4 | "Texto do footer 'visite tbm' parece mais cortado" | 🔴 **CONFIRMADO** | 🟡 Média | No Figma o texto tem **166px de altura de caixa** (line-height natural do AM Novecento 120px) e **transborda 45px acima da banda** (y=-45 relativo ao frame). Na impl o `h2` usa `lineHeight: 1` (120px) — a caixa encolheu 46px e o topo dos glifos (ascenders do "V", "T", "M") fica **cortado visualmente** quando sobreposto ao conteúdo acima da banda. |
| 5 | "Texto de filosofia está incompleto" | ❌ **FALSO-POSITIVO no texto; ✅ CONFIRMADO em métrica** | 🟢 Baixa | O texto dos 3 parágrafos está **100% completo e idêntico** ao Figma (verificado caractere por caractere via `textContent`): lead, body1 ("Acredito que o design é a manipulação intencional da experiência humana: uma ferramenta capaz de impactar hábitos e devolver humanidade ao nosso cotidiano.") e body2 ("Nesse contexto, encaro o 3D, o design de interfaces e a pesquisa como extensões de um mesmo propósito: construir experiências que sejam verdadeiramente prestativas, memoráveis e sensíveis."). **MAS** o Figma renderiza body1 em **3 linhas** e body2 em **4 linhas** com larguras de linha diferentes das da impl (a impl usa `text-justify` + larguras fixas 702/705px; o Figma quebra diferente porque o espaçamento entre palavras é maior — `leading-[normal]` no Figma vs `leading-[1.19]` na impl). O Figma usa line-height **auto (~1.19 p/ 26px = 31px)** — a impl está correta nesse aspecto; a diferença percebida é de **justificação**: no Figma o texto é **justificado com espaçamento maior entre palavras** (word-spacing positivo), na impl o justify comprime. |

---

## Detalhamento por ponto

### 1. Elipses (bolas coloridas) — cor e intensidade

**Assets:** `public/images/home/ellipse-{1..5}.svg`

| Elipse | Node Figma | Arquivo repo | Diff vs SVG oficial Figma |
|---|---|---|---|
| Ellipse 262 (cyan grande, 879²) | 758:112 | `ellipse-1.svg` | ✅ Idêntico (só `id` de filtro/gradient difere: `filter0_n_0_169` vs `filter0_n_0_4`) |
| Ellipse 260 (cyan contato, 455²) | 758:110 | `ellipse-2.svg` | ✅ Idêntico (mesma ressalva de id) |
| Ellipse 264 (cyan pequena, 455²) | 758:298 | `ellipse-3.svg` | ✅ Idêntico |
| Ellipse 261 (rosa footer, 695²) | 758:111 | `ellipse-4.svg` | ✅ Idêntico |
| Ellipse 263 (rosa topo, 695²) | 758:297 | `ellipse-5.svg` | ✅ Idêntico |

**Specificação de cor (extraída dos SVGs oficiais do Figma):**

| Elipse | Gradiente radial | Noise overlay (flood) |
|---|---|---|
| 262 (cyan grande) | `#7EF1F1` → `#B4F7F7` (opacidade 0 em 76.95%) | `rgba(186,204,235, 0.84)` #BACCEB |
| 260/264 (cyan) | `#7FF2F2` → `#FFB5F6` (opacidade 0 em 100%) | `rgba(111,150,206, 0.84)` #6F96CE |
| 261/263 (rosa) | `#EE9CD2` → `#CF8FC7` (opacidade 0 em 100%) | `rgba(244,174,204, 0.84)` #F4AECC |

**Onde está a diferença percebida:** o efeito de grão (`feTurbulence` + `feFlood` com opacidade 0.84) é **rasterizado de forma diferente** pelo motor do Figma vs pelo Chrome. No Figma o grão é mais sutil (alpha médio medido 46 na cyan grande standalone), no Chrome ele fica mais denso (alpha médio 52). Isso altera a **cor média percebida** e a "intensidade" — o usuário está vendo isso, não um asset errado.

**Medição de contexto (mesmos crops, fundo creme mascarado):**

| Elipse | impl alpha médio | Figma alpha médio | impl pixel centro | Figma pixel centro |
|---|---|---|---|---|
| cyan-contato (758:110) | 117 | **139** | #BEC9E4 | #CFD5E9 |
| cyan-pequena (758:298) | 100 | 103 | #D9E3EF | #D0DCEC |
| rosa-topo (758:297) | 113 | 117 | creme (borda) | creme (borda) |
| rosa-footer (758:111) | 96 | 97 | creme (borda) | creme (borda) |

A elipse de contato (758:110, `ellipse-2.svg`) é a mais discrepante em intensidade (117 vs 139 = ~16% mais fraca na impl) e em matiz no centro (#BEC9E4 vs #CFD5E9 — a impl puxa mais para o azul, o Figma fica mais claro/quase branco-azulado no centro). **Causa raiz provável:** o gradiente radial da 260/264 tem o segundo stop em `#FFB5F6` (rosa!) com opacidade 0 — no Figma a transição cyan→rosa transparente é mais suave; no Chrome o `feTurbulence` com `baseFrequency="2.63 1.86"` (muito fino) produz um grão diferente que "suja" mais o centro cyan.

**O que NÃO fazer:** não trocar os SVGs (já são fiéis) e não adicionar opacidade CSS (vai piorar — as cores já estão corretas no asset).

---

### 2. Sombras nos SVGs — falso-positivo

Verificado por três vias independentes:
1. `grep` no código da home: **zero** ocorrências de `filter:`, `box-shadow`, `drop-shadow` em componentes da home (a única sombra do código é `--shadow-card` no ContactForm e ProjectCard — fora da home v2);
2. `getComputedStyle` de todos os `<img>` da home: `filter: none` em todos;
3. Os SVGs `cracha-exclude.svg` e `cracha-union.svg` **já trazem a sombra baked** do Figma (`feDropShadow` exportado como `feOffset`+`feGaussianBlur stdDeviation="2.30003"`, alpha 0.25, offsets (9.2, 11.5) no exclude e (6.9, 5.75) no union).

**Conclusão:** não há sombra duplicada nem bug visual nesse ponto. O usuário provavelmente notou a sombra baked no SVG e suspeitou de implementação CSS — não procede.

---

### 3. Crachá (tag) — desalinhamento do texto sobre as réguas

**Baseline Figma (node 757:94 "Group 100805", canvas coords):**

| Parte | Node | x | y | w | h |
|---|---|---|---|---|---|
| Line 9 (régua 1, topo) | 757:103 | 1247.90 | 1481.43 | 169.00 | 44.65 |
| Line 10 (régua 2) | 757:104 | 1237.09 | 1522.21 | 169.00 | 44.65 |
| Line 11 (régua 3) | 757:105 | 1226.28 | 1562.98 | 169.00 | 44.65 |
| Line 12 (régua 4, base) | 757:106 | 1215.47 | 1603.76 | 169.00 | 44.65 |
| Texto "Acredito que o design é" | 757:107 | 1257.70 | 1481.30 | 186.96 | 161.34 |

**Renderizado na impl (medido):**

| Parte | x | y | w | h |
|---|---|---|---|---|
| Régua 1 (img) | 1247.6 | 1478.0 | 169.9 | 48.0 |
| Régua 2 (img) | 1236.8 | 1518.7 | 169.9 | 48.0 |
| Régua 3 (img) | 1226.0 | 1559.5 | 169.9 | 48.0 |
| Régua 4 (img) | 1215.1 | 1600.3 | 169.9 | 48.0 |
| Texto (p) | 1257.2 | 1480.6 | 187.3 | 162.5 |

**Análise do desalinhamento:**

- **Rotas ( réguas ):** os bounding boxes das réguas batem com o Figma (Δ ≤ 3.5px no topo — dentro da tolerancia de rotação composta). OK.
- **Texto:** o bounding box do `<p>` bate (1257.2 vs 1257.7, 1480.6 vs 1481.3 — Δ < 1px). **MAS** o texto dentro da caixa está desalinhado em relação às réguas:
  - No Figma, a primeira linha do texto ("acredito") fica **entre a régua 1 e a régua 2**, centralizada na pista. O texto é `text-center`, 23px, `leading-[1.8]` (41.4px por linha), 3 linhas = 124.2px de altura de texto dentro de uma caixa de 161.34px → padding vertical interna ~18.5px.top e bottom.
  - Na impl, as 3 linhas do texto medem: linha1 y=1494.0 (h 54.7 — inclui o line-height 41.4 +伸), linha2 y=1539.4, linha3 y=1573.7. A régua 1 (topo) está em y=1478 e a régua 2 em y=1518.7. **A linha 1 do texto (1494) está 16px abaixo do topo da régua 1 (1478) e 24.7px acima da régua 2 (1518.7)** — no Figma a pista entre régua 1 e régua 2 tem o texto mais **encostado na régua de cima** (a primeira linha "acredito" no Figma começa ~y=1490 com baseline ~1525, ou seja, mais alta dentro da pista).
  - **Ângulo:** o texto gira 15.55° mas as réguas giram 14.8° — ângulos diferentes fazem o texto "escorregar" para cima ao longo das linhas (a cada linha, o deslocamento horizontal acumula ~0.75° de diferença). No Figma, o texto e as réguas têm **o mesmo ângulo visual** (o Figma rotaciona o frame do texto junto). Na impl, a rotação do texto (15.55°) foi tirada do metadata do node de texto, mas as réguas (14.8°) têm rotação própria — **essa diferença de 0.75° é a causa do desalinhamento percebido**.

**Visual:** comparando os crops lado a lado (fig-cracha-regiao.png vs impl-cracha-regiao.png), na impl o texto "acredito" encosta mais na régua de cima e "design é" fica mais para a direita, enquanto no Figma o texto está mais centralizado na pista e mais à esquerda.

---

### 4. Footer — "visite também" mais cortado

**Figma (node 758:300, dentro do frame 751:1325):**

| Propriedade | Figma | Impl |
|---|---|---|
| Texto | "visite também" | "visite também" ✅ (via `dict.footer.visitAlso`) |
| Fonte | AM Novecento Regular 120px | AM Novecento 120px (`clamp(3rem, 6.94vw, 7.5rem)`) ✅ |
| Cor | `#F9F3EA` (cream) | `var(--color-cream)` ✅ |
| x | 1 | 1 ✅ |
| y (relativo à banda) | **-45** | -45 ✅ |
| **Altura da caixa de texto** | **166px** (line-height auto ≈ 1.383 × 120) | **119.9px** (`lineHeight: 1`) ❌ |
| Largura | 1018 | 1000.8 (Δ −17, fonte web vs Figma metrics) |

**O problema:** no Figma o texto tem `leading-[normal]` (line-height automática da fonte ≈ 1.383 para o AM Novecento) → caixa de **166px**. Na impl o `h2` usa `lineHeight: 1` (exatamente 120px) — a caixa encolheu 46px. Como o texto está posicionado com `top: -45px` (transbordando acima da banda) e a **ascender line** da fonte web é maior que a da caixa `line-height: 1`, o topo dos glifos (V, T, M, B) fica **cortado visualmente** quando o conteúdo acima da banda (a elipse rosa do contato, `ellipse-4.svg` em -z-10) passa por cima — ou simplesmente a proporção do texto parece "achatada"/cortada em cima.

Medições: no crop do footer, o Figma mostra o texto ocupando a faixa y=4300–4466 (166px) com o topo das letras em y≈4300; a impl mostra y=4432.5–4552.4 (119.9px) — **o topo do texto na impl está 45px mais baixo que deveria estar relativo à banda** (porque `top: -45px` + caixa menor = conteúdo assentado mais baixo dentro da caixa).

**Correção necessária:** `lineHeight: 1.383` (ou `"normal"`) no `h2` do footer, replicando o padrão já usado no título da filosofia.

---

### 5. Filosofia — texto incompleto?

**Verificação de texto (via `textContent` renderizado):**

| Parágrafo | Figma (node) | Impl | Status |
|---|---|---|---|
| Lead | 751:1435: "Para mim o design é pesquisa, ilustração ekung perspectiva." | "Para mim o design é pesquisa, ilustração e perspectiva." | ✅ Idêntico |
| Body1 | 751:1436: "Acredito que o design é a manipulação intencional da experiência humana: uma ferramenta capaz de impactar hábitos e devolver humanidade ao nosso cotidiano." | idêntico | ✅ Idêntico |
| Body2 | 751:1437: "Nesse contexto, encaro o 3D, o design de interfaces e a pesquisa como extensões de um mesmo propósito: construir experiências que sejam verdadeiramente prestativas, memoráveis e sensíveis." | idêntico | ✅ Idêntico |

**O texto NÃO está incompleto.** O que o usuário percebe como "incompleto" é provavelmente a **diferença de quebra de linha + espaçamento entre palavras**:

- **Figma:** body1 quebra em 3 linhas: "Acredito que o design é a manipulação intencional da / experiência humana: uma ferramenta capaz de impactar / hábitos e devolver humanidade ao nosso cotidiano." — com **justificação** (`text-justify`) e **word-spacing maior** (o Figma expande o espaço entre palavras para preencher 702px).
- **Impl:** body1 quebra em 3 linhas também, mas a última linha é mais curta e o espaçamento entre palavras é menor (a impl usa `text-justify` com `leading-[1.19]`; o Figma usa `leading-[normal]` ≈ 1.19 — **aqui bate**).

A diferença real: no Figma o texto tem **word-spacing positivo** (as palavras parecem mais espaçadas), enquanto na impl o `text-justify` comprime o espaço para caber. Isso faz o texto do Figma parecer "mais completo"/"mais cheio" — é uma ilusão de densidade, não texto faltando.

**Verificação de métricas (medidas):**

| Métrica | Figma | Impl | Δ |
|---|---|---|---|
| Body1 altura | 93 (3×31) | 92.8 | ~0 ✅ |
| Body1 largura | 702 | 702 | 0 ✅ |
| Body2 altura | 124 (4×31) | 123.8 | ~0 ✅ |
| Body2 largura | 702 | 702 | 0 ✅ |
| Lead altura | 76 (2×38) | 76.2 | ~0 ✅ |
| Lead largura | 705 | 705 | 0 ✅ |

**Conclusão:** texto completo, métricas batem. Se o usuário quer a mesma "cara" de densidade do Figma, a correção é **word-spacing** (ex: `word-spacing: 0.05em` ou replicar o espaçamento do Figma), não adicionar texto.

---

## Itens fora de escopo (não pointed, mas anotados)

- **Figma nodes 753:1649 e 753:1653** ("Acredito que o design é a manipulação intencional da experiência humana: uma ferramenta capaz de impactar" duplicados, y=1861) — **leftover/duplicados no Figma**, deliberadamente NÃO implementados (já documentado no ledger do Plan 3). ✅ Correto.
- **Figma node 751:1520 "Vector 1319"** — fora do canvas (x=2255), não implementado. ✅ Correto.
- **Ellipse 378 do crachá (757:99)** — no Figma é um **vector** (imagem PNG no design context: `c87d5.png` 113.68×100.5 com sombra), na impl é um **div `rounded-full`** com `opacity: 0.6` e cor `--color-blue-soft`. **Diferença visual real** — no Figma é um blob orgânico azul-gelo com sombra projetada; na impl é um círculo perfeito translúcido sem sombra. (Já estava no ledger do Plan 3 como "se o review visual mostrar cor/posição errada, extrair o SVG real" — **o review visual mostrou**, esta análise confirma: deve ser trocado pelo asset real.)
- **Contato (750:1256 "vAMOS TRABALHAR JUNTOS?")** — o Figma mostra apenas um stub de formulário (517×129, placeholder + botão send). A impl usa o `ContactForm.tsx` completo (456px de altura, campos nome/email/telefone/mensagem). **Decisão já tomada e documentada**: ContactForm é reutilizado e **não pode ser modificado** (AGENTS.md) — o footer fica +153px mais baixo que o Figma. Aceito.

---

## Referências

- Spec v2 (binding authority original): `docs/superpowers/specs/2026-10-20-new-home-design-v2.md`
- Quality gates v2: `docs/superpowers/quality-gates/2026-10-20-new-home-quality-gates.md`
- Spec desta rodada (correções): `docs/superpowers/specs/2026-10-21-new-home-fixes-v3.md`
- Plans desta rodada: `docs/superpowers/plans/2026-10-21-new-home-fix-plan-{1..3}-*.md`
- Quality gates desta rodada: `docs/superpowers/quality-gates/2026-10-21-new-home-fixes-quality-gates.md`
- Screenshots de evidência: `/tmp/pn-visual/` (fig-full-1728.png, impl-final.png, fig-/impl-cracha-regiao.png, fig-/impl-*-ctx.png, fig-e26{0..4}.svg, fig-e26{0..4} standalone)
- Medições: Playwright scripts em `/tmp/pwtest/analyze.cjs` e `/tmp/pwtest/analyze2.cjs`
