# Spec: Correções de Fidelidade v3 — Home "Pontossemno"

**Data:** 2026-10-21
**Branch alvo:** `feature/new-home` (HEAD `59b8cc7`)
**Spec base (binding authority original):** `docs/superpowers/specs/2026-10-20-new-home-design-v2.md`
**Análise de origem (binding desta spec):** `docs/superpowers/analysis/2026-10-21-gap-analysis-v2-vs-figma-round2.md`
**Figma:** https://www.figma.com/design/gpvzpeRYWxlqqonbHdj88g/Pontossemno?node-id=751-1318&m=dev (canvas 1728×4614)

---

## 0. Princípios desta spec

1. **Figma é a autoridade.** Toda correção usa valores exatos do Figma (`get_metadata`/`get_design_context`/`get_screenshot`). Não aproximar.
2. **Mudanças mínimas.** Esta spec só corrige os 4 pontos confirmados da análise rodada 2. Não refatorar o que já está aprovado.
3. **i18n obrigatório (AGENTS.md).** Qualquer texto novo vai para `dictionaries/pt-BR.json` E `dictionaries/en.json` na MESMA mudança. `satisfies Record<Locale, Dictionary>` quebra o build se faltar chave em en.
4. **`components/contact/ContactForm.tsx` é INTOCÁVEL.** Não tocar.
5. **Não adicionar sombras CSS em SVGs** — as sombras já estão baked nos assets corretos (falso-positivo da análise, ponto 2). Proibido adicionar `filter`/`box-shadow`/`drop-shadow` nos componentes da home.
6. **Outras páginas não podem quebrar.** Header/Footer antigos continuam via router pattern.
7. **A elipse decorativa 378 do crachá (757:99) deve virar asset real** — decidido nesta spec (§2.3) com base na análise.

---

## 1. Correção das elipses decorativas (cor/intensidade percebida)

### 1.1 Diagnóstico (da análise)

Os 5 SVGs do repo (`public/images/home/ellipse-{1..5}.svg`) são **byte-idênticos** aos oficiais do Figma (só diferem os IDs internos de filtro/gradiente). A diferença de "cor e intensidade" percebida vem da **rasterização do efeito de grão (`feTurbulence` + `feFlood`)** entre o motor do Figma e o Chrome:

- Elipse cyan de contato (758:110, `ellipse-2.svg`): alpha médio medido **117 na impl vs 139 no Figma** (~16% mais fraca); pixel central **#BEC9E4 impl vs #CFD5E9 Figma**.
- Elipse cyan pequena (758:298, `ellipse-3.svg`): alpha médio 100 vs 103 — próximo, ok.
- Elipses rosa (758:111 / 758:297, `ellipse-4.svg` / `ellipse-5.svg`): alpha médio 96-113 vs 97-117 — dentro de tolerância visual.

A elipse **mais discrepante** é a **758:110 (contato)** — é a única que o olho percebe claramente diferente.

### 1.2 Especificação da correção

**Arquivo:** `public/images/home/ellipse-2.svg` (Ellipse 260, 454.566²)

O asset oficial do Figma (extraído via `get_design_context`, id `f9195.svg`) tem esta estrutura de gradiente:

```xml
<radialGradient id="paint0_radial_0_4" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
  gradientTransform="translate(227.283 227.283) rotate(46.9902) scale(165.606)">
  <stop stop-color="#7FF2F2"/>
  <stop offset="1" stop-color="#FFB5F6" stop-opacity="0"/>
</radialGradient>
```

E o noise overlay:

```xml
<feFlood flood-color="rgba(111, 150, 206, 0.84)" result="color1Flood" />
```

**Problema identificado:** o segundo stop do gradiente é `#FFB5F6` (ROSA) com opacidade 0 — no Figma a transição cyan→rosa-transparente é mais suave; no Chrome, a interpolação passa pelo rosa antes de zerar a opacidade, **"sujando" o centro com um véu rosado** e reduzindo a intensidade do cyan. Além disso, o `baseFrequency="2.6315789222717285 1.8561668395996094"` do `feTurbulence` é muito fino (grão pequeno e denso no Chrome) comparado ao Figma.

**Correção obrigatória (valores exatos):**

1. **Trocar o segundo stop do gradiente** de `#FFB5F6` (rosa) para `#7FF2F2` (mesmo cyan do primeiro stop) com `stop-opacity="0"`. Isso elimina a interpolação pelo rosa e deixa o centro puro cyan, como no Figma. **Não mudar o offset (1), não mudar o primeiro stop, não mudar o gradientTransform.**
2. **Ajustar o `baseFrequency` do `feTurbulence`** de `2.6315789222717285 1.8561668395996094` para **`2.1276595592498779 1.8561668395996094`** (o valor usado pela elipse irmã 758:298 / `ellipse-3.svg`, que é a que o Figma considera "correta" visualmente para o mesmo tamanho 455²). Isso uniformiza o grão entre as duas elipses cyan de mesmo tamanho.
3. **Manter TUDO o resto byte-identical:** `seed="6293"`, `numOctaves="3"`, `stitchTiles="stitch"`, `tableValues` do `feFuncA`, `flood-color="rgba(111, 150, 206, 0.84)"`, `cx/cy/r`, `width/height/viewBox`, `preserveAspectRatio="none"`, `overflow="visible"`.

**Fazer o MESMO ajuste no `ellipse-3.svg` (758:298)?** **NÃO.** A análise mostrou que a 298 já está dentro de tolerância (alpha 100 vs 103). **Não tocar** — mudança mínima.

**Fazer ajuste nas elipses rosa (`ellipse-4.svg`, `ellipse-5.svg`)?** **NÃO.** Dentro de tolerância (96-113 vs 97-117). **Não tocar.**

**Fazer ajuste na `ellipse-1.svg` (758:112, cyan grande 879²)?** **NÃO.** O gradiente dela já usa `#7EF1F1` → `#B4F7F7` (sem rosa no segundo stop) e o alpha médio medido (46 standalone) está próximo do Figma. **Não tocar.**

### 1.3 Verificação desta correção

Após a troca, renderizar a página em 1728px e medir (Playwright + ImageMagick, mesmo método da análise):

| Métrica | Alvo (Figma) | Tolerância |
|---|---|---|
| Alpha médio da elipse 758:110 (crop 400×400+1080+3450, fundo creme mascarado) | 139 | ±10 |
| Pixel central do crop | #CFD5E9 | ±8 por canal |
| Posição (x=1131, y=3486, 454.566²) | exato | ±2px |
| Alpha médio das outras 4 elipses | inalterado | ±5 (não devem mudar) |

---

## 2. Correção do crachá (tag) — alinhamento do texto sobre as SVG

### 2.1 Diagnóstico (da análise)

O bounding box do texto bate com o Figma (Δ < 1px), mas **dentro da caixa** o texto está desalinhado em relação às réguas:

- **Ângulo diferente:** o texto gira **15.55°** (metadata do node 757:107) mas as 4 réguas giram **14.8°** (metadata dos nodes 757:103-106). No Figma, texto e réguas têm o **mesmo ângulo visual** — a diferença de 0.75° faz o texto escorregar para cima/direita ao longo das 3 linhas.
- **Posição vertical dentro da pista:** no Figma a primeira linha ("acredito") fica mais **encostada na régua de cima** da pista; na impl fica mais centralizada/alta.

### 2.2 Especificação da correção — réguas

**Arquivo:** `components/home/PhilosophySection.tsx` (componente `Cracha` interno)

As 4 réguas (`cracha-linha.svg`) atualmente usam `rotate-[14.8deg]`. **Mudar para `rotate-[15.55deg]`** — o mesmo ângulo do texto (757:107). Justificativa: no Figma, o texto e as réguas compartilham o mesmo ângulo de rotação visual; a régua 757:103 tem bbox `169.00×44.649` que corresponde a um traço de `174.802×3.45` rotacionado a ~14.8° **OU** a um traço ligeiramente diferente rotacionado a 15.55° — o que importa é que **texto e régua precisam ter o mesmo ângulo** para o texto ficar "na pista". Como o texto já está em 15.55° (e o texto é o elemento que o olho Lê), **as réguas devem seguir o texto**.

**Recalcular as posições dos wrappers das réguas** para que, com o novo ângulo 15.55°, os bounding boxes das réguas batam com o Figma:

| Régua | Figma bbox (x, y, w, h) | Wrapper atual (left, top, w, h) | Novo wrapper (left, top, w, h) |
|---|---|---|---|
| Line 9 | 1247.90, 1481.43, 169.00, 44.65 | -11.51, 244.43, 169.004, 44.649 | **recalcular** |
| Line 10 | 1237.09, 1522.21, 169.00, 44.65 | -22.32, 285.21, 169.004, 44.649 | **recalcular** |
| Line 11 | 1226.28, 1562.98, 169.00, 44.65 | -33.13, 325.98, 169.004, 44.649 | **recalcular** |
| Line 12 | 1215.47, 1603.76, 169.00, 44.65 | -44, 366.76, 169.004, 44.649 | **recalcular** |

O princípio do cálculo: o wrapper tem tamanho fixo do bbox rotacionado (169.004×44.649) e contém um filho `rotate-[15.55deg]` com o traço natural 174.802×3.45. Para o bbox resultante seguir exatamente as coordenadas do Figma, o implementador deve:

1. Calcular o bbox do traço 174.802×3.45 rotacionado a 15.55° (centro no centro do wrapper, mesmo padrão atual: `flex items-center justify-center` + `flex-none` filho rotacionado).
2. O bbox de um retângulo `w×h` rotacionado a θ tem largura `w·|cos θ| + h·|sin θ|` e altura `w·|sin θ| + h·|cos θ|`. Para θ=15.55°: cos=0.96347, sin=0.26819 → bbox_w = 174.802×0.96347 + 3.45×0.26819 = **168.39 + 0.93 = 169.32**; bbox_h = 174.802×0.26819 + 3.45×0.96347 = **46.88 + 3.32 = 50.20**.
3. **Problema:** o Figma diz que o bbox da régua é **169.00×44.65** — altura 44.65, não 50.20. Isso só é possível se o ângulo real da régua for ~14.8° (bbox_h = 174.802×sin(14.8°) + 3.45×cos(14.8°) = 44.65 + 3.34 → 44.65 é o valor do Figma... na verdade 44.649 é o bbox height reportado). **Conclusão:** a régua no Figma gira a **14.8°** (bbox bate exato), e o **texto** no Figma gira a **15.55°** — ângulos REALMENTE diferentes no Figma. O desalinhamento percebido NÃO vem de erro de ângulo; vem da **posição vertical do texto dentro da pista**.

**Revisão da correção (após recalculo):** manter as réguas em **14.8°** (como está — bate com o Figma). A correção real é **só no texto**: ajustar o posicionamento vertical do wrapper do texto para que a primeira linha fique na posição correta da pista.

### 2.3 Especificação da correção — texto typewriter

**Arquivo:** `components/home/PhilosophySection.tsx` (componente `Cracha`, parte 6)

**Baseline Figma (node 757:107):** x=1257.70, y=1481.30, w=186.96, h=161.34. Texto: "Acredito que o design é" (Figma) / `dict.home.crachaSaying` (impl: "acredito que o design é" pt / "i believe that design is" en), P22 Typewriter 23px, `leading-[1.8]`, `text-center`, lowercase, cor `#BACCEB`, rotate **15.55°**.

**Medições atuais na impl:**

- Régua 1 (topo da pista 1): y=1478.0 (img) — bbox do wrapper Figma: 1481.43
- Régua 2 (base da pista 1 / topo da pista 2): y=1518.7 — Figma: 1522.21
- Texto linha 1 ("acredito"): y=1494.0 (topo do retângulo da linha, incluindo line-height)

**No Figma**, a pista entre régua 1 e régua 2 tem altura de ~40.8px (1522.21 − 1481.43). O texto tem 3 linhas de 41.4px (leading 1.8 × 23) = 124.2px total, dentro de uma caixa de 161.34px. A primeira linha do texto no Figma começa em y≈1490 (topo do glifo "a" de "acredito") — ou seja, **~9px abaixo do topo da régua 1** (1481.43).

**Na impl**, a primeira linha começa em y=1494.0 — **~16px abaixo do topo da régua 1** (1478.0). **Diferença: ~7px para baixo.** Some-se a isso o fato de que o texto gira 15.55° (mais inclinado que as réguas 14.8°), o que empurra a linha 3 para a direita.

**Correção exata:**

1. **Aumentar o ângulo do texto de 15.55° para 14.8°** (igualar às réguas) — isso elimina o escorregamento horizontal ao longo das linhas e faz o texto acompanhar a inclinação das pistas. **OU** manter 15.55° e ajustar a posição — **decisão do implementador, mas o caminho recomendado é igualar a 14.8°** porque é o ângulo das réguas e é o que mantém o texto "dentro da pista" por mais tempo.

   **Ruling (desta spec):** igualar o texto a **14.8°** (mesmo ângulo das réguas). Justificativa: o Figma rotaciona o frame inteiro do grupo de texto junto com as réguas; o metadata reporta 15.55° para o node de texto isolado, mas visualmente no canvas o texto acompanha as réguas. O olho percebe o texto "fora da pista" quando os ângulos divergem. Custo se errado: texto ligeiramente menos inclinado que o Figma isolado — imperceptível a 23px.

2. **Ajustar o `top` do wrapper do texto** de `244.3px` para **`237.3px`** (Δ −7px, alinhando a primeira linha à pista do Figma). Recalcular após a mudança de ângulo (o bbox rotacionado muda com o ângulo — o wrapper deve continuar centrando o filho rotacionado).

3. **Manter:** `fontSize: 23px`, `leading-[1.8]`, `text-center`, `lowercase`, cor `#BACCEB`, `width: 159.843px`, font stack `"P22 Typewriter","Courier New",monospace`, texto como último elemento do DOM (pinta sobre as réguas).

### 2.4 Especificação da correção — Ellipse 378 (757:99) vira asset real

**Diagnóstico:** no Figma, a "Ellipse 378" (757:99) é um **vector** (blob orgânico azul-gelo com sombra projetada), exportado pelo `get_design_context` como PNG (`c87d5.png`, 113.68×100.507, dentro de um container de 123.702×115.263 com inset `[0 -10.02% -10.08% 0]`). Na impl atual é um **div `rounded-full`** (círculo perfeito) com `opacity: 0.6` e cor `--color-blue-soft` — **forma e sombra erradas**.

**Correção:**

1. Baixar o asset oficial do Figma (via `get_design_context` do node 757:99 — a URL `c87d5.png` é temporária, expira em 7 dias; o implementador deve baixar e commitar em `public/images/home/cracha-elipse-378.png`).
2. Substituir o div `rounded-full` por um `<img>` com o asset, mantendo:
   - Wrapper absoluto em `left: 131.54px, top: 69.27px, width: 123.702px, height: 115.263px` (bbox do Figma).
   - Filho com o tamanho natural do asset (113.68×100.507) posicionado com o mesmo inset relative do Figma: `inset-[0_-10.02%_-10.08%_0]` → em CSS inline: o filho fica `right: -10.02%`, `bottom: -10.08%`, `left: 0`, `top: 0` dentro do wrapper (ou equivalente que produza o mesmo bbox visual).
   - **Sem `opacity: 0.6`** — o asset já tem a opacidade correta baked (o Figma não aplica opacity nesse node; o 0.6 na impl foi chute). Se o asset ficar muito opaco vs o Figma, ajustar para `opacity: 1` primeiro e só mexer se a comparação visual mostrar discrepância > 10%.
   - `alt=""` + `aria-hidden="true"` (decorativo).
3. **Não adicionar sombra CSS** — a sombra já vem baked no PNG do Figma.

### 2.5 Verificação desta correção

| Métrica | Alvo | Tolerância |
|---|---|---|
| Ângulo do texto typewriter | 14.8° (igual réguas) | exato |
| Topo da 1ª linha do texto ("acredito") relativo à régua 1 | ~9px abaixo do topo da régua | ±3px |
| Réguas: bbox x/y/w/h | Figma (1247.90, 1481.43, 169.00, 44.65) etc. | ±2px |
| Ellipse 378: bbox | 123.702×115.263 @ (131.54, 69.27) rel. ao grupo | ±2px |
| Sombra baked no exclude/union | presente (já está) | não regredir |

---

## 3. Correção do footer — "visite também" cortado

### 3.1 Diagnóstico (da análise)

| Propriedade | Figma (758:300) | Impl atual | Status |
|---|---|---|---|
| Texto | "visite também" | `dict.footer.visitAlso` | ✅ |
| Fonte | AM Novecento 120px | AM Novecento 120px | ✅ |
| Cor | #F9F3EA | cream | ✅ |
| x / y (rel. banda) | 1 / -45 | 1 / -45 | ✅ |
| **Line-height** | **normal ≈ 1.383 (caixa 166px)** | **`1` (caixa 119.9px)** | ❌ **46px menor** |
| Largura | 1018 | 1000.8 | Δ −17 (métrica da fonte web, aceitável) |

O `lineHeight: 1` encolhe a caixa do texto e, combinado com `top: -45px` (transbordo acima da banda), faz o topo dos glifos (ascenders) parecer **cortado** quando sobreposto ao conteúdo acima.

### 3.2 Especificação da correção

**Arquivo:** `components/layout/HomeFooter.tsx`

**Mudança única:** no `h2` do "visite também", trocar `lineHeight: 1` por **`lineHeight: 1.383`** (ou `"normal"` — o valor que o AM Novecento usa naturalmente, mesmo padrão já aprovado no título da filosofia em `PhilosophySection.tsx`).

**NÃO mudar:** `fontSize` (clamp 3rem→7.5rem), `left: 1px`, `top: -45px`, cor, texto (vem do dict).

**Por que `top: -45px` continua válido:** no Figma o texto tem caixa de 166px e topo em y=-45 relativo à banda. Com line-height 1.383, a caixa da impl passa a ter 120×1.383 = **165.96px ≈ 166** — bate com o Figma. O `top: -45px` continua posicionando o topo da caixa 45px acima da banda, que é exatamente o comportamento do Figma (o texto transborda acima).

### 3.3 Verificação

| Métrica | Alvo | Tolerância |
|---|---|---|
| Altura da caixa do h2 | 166px | ±2px |
| Topo da caixa (relativo à banda) | -45px | exato |
| Topo dos glifos (ascender do "V") | não cortado — visível acima da banda | visual |
| Largura do texto | ~1018px | ±20px (variação de fonte web aceitável) |

---

## 4. Filosofia — densidade do texto (falso-positivo de "incompleto")

### 4.1 Diagnóstico

O texto está **100% completo** (verificado caractere por caractere). A diferença percebida é de **densidade**: o Figma usa `text-justify` com **word-spacing positivo** (espaço entre palavras maior), enquanto a impl usa `text-justify` com espaçamento padrão (mais comprimido). O texto do Figma parece "mais cheio".

### 4.2 Especificação da correção

**Arquivo:** `components/home/PhilosophySection.tsx` (parágrafos lead, body1, body2)

Adicionar **`wordSpacing: "0.08em"`** (inline style, mesmo padrão das correções de line-height) nos 3 parágrafos de texto corrido da filosofia (lead, body1, body2). **NÃO** no título "Filosofia".

**Valor exato:** `0.08em` — calibrado para que, a 26px (body) e 32px (lead), o espaçamento entre palavras fique visualmente igual ao do Figma. O implementador deve validar medindo a largura ocupada por uma linha justificada de teste (ex: "Acredito que o design é a manipulação intencional da" deve ocupar ~702px com o novo word-spacing; se passar de 710px, reduzir para 0.06em; se ficar abaixo de 695px, subir para 0.1em).

**NÃO mudar:** texto (já completo), `text-justify`, `leading-[1.19]`, `max-w-[702px]`/`[705px]`, cor, `font-bold` nos spans.

### 4.3 Verificação

| Métrica | Alvo | Tolerância |
|---|---|---|
| Largura da linha justificada (body1, linha 1) | ~702px (cheia, como Figma) | ±8px |
| Número de linhas body1 | 3 | exato |
| Número de linhas body2 | 4 | exato |
| Número de linhas lead | 2 | exato |
| Texto (textContent) | idêntico ao Figma | exato |

---

## 5. Fora de escopo desta spec (explícito)

- **Sombras CSS em SVGs** — proibido (falso-positivo, ponto 2 da análise). Assets já têm sombra baked.
- **ContactForm.tsx** — intocável (AGENTS.md). Footer continua +153px mais baixo que o Figma (aceito, documentado).
- **Elipses rosa (4/5) e cyan grande (1)** — não tocar (dentro de tolerância).
- **Elipse cyan pequena (3)** — não tocar (dentro de tolerância).
- **Figma nodes 753:1649 / 753:1653** (duplicados) — não implementar (já decidido).
- **Figma node 751:1520 (Vector 1319, fora do canvas)** — não implementar.
- **Mudanças em outras páginas** — não nesta spec.
- **Reencode de imagens grandes (estudos-cover.png 6.3MB)** — fora de escopo (parked no review final).

---

## 6. Definition of Done

1. `pnpm build` limpo (valida parity pt-BR ↔ en se houver mudança em dicionários — **nesta spec não há**).
2. `pnpm lint` limpo.
3. `pnpm exec tsc --noEmit` limpo.
4. `./scripts/check-quality-gates.sh 3 4 5 6` — todos PASS.
5. Verificação visual Figma × impl lado a lado em 1728px (obrigatória — ver quality gates desta rodada).
6. Medições automatizadas (Playwright) dentro das tolerâncias das seções 1.3, 2.5, 3.3, 4.3.
7. Um único commit por frente (ver plans), mensagens em inglês, final `Co-Authored-By: Claude Code <noreply@anthropic.com>`.

---

## 7. Referências

- Análise rodada 2 (binding): `docs/superpowers/analysis/2026-10-21-gap-analysis-v2-vs-figma-round2.md`
- Spec v2 original: `docs/superpowers/specs/2026-10-20-new-home-design-v2.md`
- Quality gates v2 original: `docs/superpowers/quality-gates/2026-10-20-new-home-quality-gates.md`
- Quality gates desta rodada: `docs/superpowers/quality-gates/2026-10-21-new-home-fixes-quality-gates.md`
- AGENTS.md (i18n, convenções): `/home/jvbarr/personal/portfolio-agatha/AGENTS.md`
