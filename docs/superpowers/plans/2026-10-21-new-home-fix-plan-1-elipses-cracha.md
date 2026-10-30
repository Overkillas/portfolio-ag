# Plan 1: Correção das elipses (cor/intensidade) + crachá (alinhamento texto/régua + Ellipse 378 real)

**Data:** 2026-10-21
**Spec (binding authority):** `docs/superpowers/specs/2026-10-21-new-home-fixes-v3.md` (§1 e §2)
**Branch:** `feature/new-home`
**Dependências:** nenhuma (roda primeiro; plans 2 e 3 são independentes entre si)

---

## Contexto

A análise rodada 2 (`docs/superpowers/analysis/2026-10-21-gap-analysis-v2-vs-figma-round2.md`) confirmou 4 pontos e descartou 1. Este plan corrige:

1. **Elipse cyan de contato** (758:110, `ellipse-2.svg`) — intensidad percebida ~16% mais fraca que no Figma e centro "sujo" de rosa (interpolação do gradiente passa por `#FFB5F6`).
2. **Crachá (tag)** — texto typewriter desalinhado verticalmente dentro da pista (primeira linha ~7px abaixo do esperado) e com ângulo (15.55°) diferente das réguas (14.8°), fazendo o texto escorregar.
3. **Ellipse 378 do crachá** (757:99) — na impl é um círculo perfeito translúcido; no Figma é um blob orgânico azul-gelo **com sombra baked** (PNG `c87d5.png`, 113.68×100.507).

**NÃO fazer neste plan:** sombras CSS em SVGs (proibido — já baked), mexer nas elipses rosa (4/5), cyan pequena (3) ou cyan grande (1), ContactForm, outras páginas.

---

## Global Constraints

- **Valores exatos do Figma** — não aproximar. Toda coordenada vem do metadata já medido (repetido abaixo para conveniência).
- **i18n (AGENTS.md):** nenhuma string nova neste plan (não há texto novo — o dizer do crachá já existe em `home.crachaSaying` nos dois dicionários). Se surgir qualquer texto novo, vai para **ambos** `dictionaries/pt-BR.json` e `en.json` na mesma mudança.
- **Sem sombras CSS** (`filter`, `box-shadow`, `drop-shadow`) em nenhum componente da home.
- **ContactForm.tsx intocável.**
- **Outras páginas não quebram** — este plan só toca `public/images/home/ellipse-2.svg`, `components/home/PhilosophySection.tsx` e adiciona `public/images/home/cracha-elipse-378.png`.
- Commits em inglês, final com `Co-Authored-By: Claude Code <noreply@anthropic.com>`.

---

## Task 1: Corrigir `ellipse-2.svg` (gradiente + grão)

**Arquivo:** `public/images/home/ellipse-2.svg`

**Mudanças exatas (spec §1.2):**

1. No `<radialGradient>` (`paint0_radial_0_80`), trocar o segundo `<stop>`:
   - **De:** `<stop offset="1" stop-color="#FFB5F6" stop-opacity="0"/>`
   - **Para:** `<stop offset="1" stop-color="#7FF2F2" stop-opacity="0"/>`
   - Manter o primeiro stop (`#7FF2F2`), o offset (1), o `gradientTransform="translate(227.283 227.283) rotate(46.9902) scale(165.606)"` e os ids.
2. No `<feTurbulence>`, trocar `baseFrequency="2.6315789222717285 1.8561668395996094"` por `baseFrequency="2.1276595592498779 1.8561668395996094"` (valor da irmã 758:298).
3. **Manter TODO o resto byte-identical:** `seed="6293"`, `numOctaves="3"`, `stitchTiles="stitch"`, `tableValues`, `flood-color="rgba(111, 150, 206, 0.84)"`, `cx/cy/r`, `width/height/viewBox`, `preserveAspectRatio="none"`, `overflow="visible"`.

**NÃO tocar em `ellipse-1.svg`, `ellipse-3.svg`, `ellipse-4.svg`, `ellipse-5.svg`.**

**Verificação (antes de commitar):**

```bash
pnpm build && pnpm start &  # :3000
# Playwright @1728, medir crop 400x400+1080+3450 (elipse 758:110):
#   - alpha médio (fundo creme #F9F3EA mascarado com fuzz 3%): alvo 139 ±10
#   - pixel central (200,200 do crop): alvo #CFD5E9 ±8 por canal
# Medir também as outras 4 elipses nos mesmos crops da análise — alpha não deve mudar ±5.
```

Commit: `fix(home): fix ellipse-2 gradient stop and noise frequency to match figma grain`

---

## Task 2: Corrigir alinhamento do texto typewriter no crachá

**Arquivo:** `components/home/PhilosophySection.tsx` (componente `Cracha`, parte 6 — o `<p>` do dizer)

**Baseline Figma (node 757:107):** x=1257.70, y=1481.30, w=186.96, h=161.34; texto "Acredito que o design é"; P22 Typewriter 23px; leading 1.8; text-center; lowercase; #BACCEB; rotate 15.55°.

**Mudanças exatas (spec §2.3):**

1. **Ângulo:** trocar `rotate-[15.55deg]` por **`rotate-[14.8deg]`** (igualar às réguas — ruling da spec §2.3).
2. **Posição vertical:** ajustar o `top` do wrapper do texto de `244.3px` para **`237.3px`** (Δ −7px) para alinhar a primeira linha à pista do Figma.
3. **Recalcular o tamanho do wrapper** se necessário para continuar centrando o filho rotacionado (`flex items-center justify-center` + `flex-none` filho). O wrapper deve continuar com tamanho próximo de 186.96×161.34 (o bbox do texto rotacionado a 14.8°: recalcular com cos(14.8°)=0.96676, sin(14.8°)=0.25551 — se o implementador preferir, pode manter o wrapper em 186.964×161.345 e só ajustar o `top`, desde que a verificação visual mostre o texto alinhado).
4. **Manter:** `fontSize: 23px` (via `text-[23px]`), `leading-[1.8]`, `text-center`, `lowercase`, cor `text-[color:var(--color-blue-soft)]`, `width: 159.843px`, `fontFamily: '"P22 Typewriter","Courier New",monospace'`, o texto como **último** elemento do DOM do crachá (pinta sobre as réguas), e o `<p>` dentro do filho rotacionado dentro do wrapper flex.

**NÃO mudar:** as 4 réguas (continuam em 14.8° com as posições atuais — já batem com o Figma), o exclude/buraco/union, o texto em si (vem de `home.crachaSaying`).

**Verificação (antes de commitar):**

```bash
# Playwright @1728:
#   - ângulo do texto: getComputedStyle no pai do <p> → matrix deve dar ~14.8°
#   - topo da 1ª linha do texto ("acredito") vs topo da régua 1: ~9px abaixo (±3px)
#   - régua 1 bbox: (1247.90, 1481.43, 169.00, 44.65) ±2px (não mudou)
#   - screenshot do crop 450x280+1180+1420 e comparar com /tmp/pn-visual/fig-cracha-regiao.png
```

Commit: `fix(home): align cracha typewriter text with ruler lines (14.8deg, top -7px)`

---

## Task 3: Trocar Ellipse 378 do crachá por asset real do Figma

**Arquivos:**
- **Novo:** `public/images/home/cracha-elipse-378.png` (baixado do Figma)
- **Editado:** `components/home/PhilosophySection.tsx` (componente `Cracha`, parte 3)

**Passo 1 — baixar o asset (via Figma MCP, node 757:99):**

```
get_design_context(fileKey="gpvzpeRYWxlqqonbHdj88g", nodeId="757-99")
→ retorna assetPathPrefix + "/c87d5.png" (URL temporária, expira em 7 dias)
curl -L -o public/images/home/cracha-elipse-378.png "<url>"
```

O asset tem tamanho natural **113.68×100.507** (o Figma reporta o container como 123.702×115.263 com inset `[0 -10.02% -10.08% 0]` — ou seja, o asset "sangra" para direita/baixo além do bbox do vector).

**Passo 2 — substituir o div pelo img (spec §2.4):**

- **De:** `<div className="absolute rounded-full bg-[color:var(--color-blue-soft)]" style={{ left: "131.54px", top: "69.27px", width: "123.702px", height: "115.263px", opacity: 0.6 }} aria-hidden="true" />`
- **Para:** um `<img>` dentro de um wrapper nas mesmas coordenadas:

```tsx
{/* 3. Ellipse decorativa (378) — asset real do Figma (blob azul-gelo com
    sombra baked), NÃO um círculo: o Figma node 757:99 é um vector, não
    um círculo perfeito. Sem opacity extra — a opacidade já está no asset. */}
<div
  className="absolute"
  style={{ left: "131.54px", top: "69.27px", width: "123.702px", height: "115.263px" }}
>
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img
    src="/images/home/cracha-elipse-378.png"
    alt=""
    aria-hidden="true"
    width={113.68}
    height={100.507}
    className="absolute"
    style={{ left: 0, top: 0 }}
  />
</div>
```

- **Sem `opacity: 0.6`** — o asset já tem a opacidade correta baked. Se a verificação visual mostrar o asset muito mais opaco que o Figma, **NÃO** adicionar opacity CSS — re-baixar o asset ou reportar; opacity só como último recurso e documentado no commit.
- **Sem rotação** — o asset já vem na orientação correta do Figma.
- **Sem sombra CSS** — a sombra vem baked no PNG.

**Verificação (antes de commitar):**

```bash
# Playwright @1728:
#   - bbox do img da elipse 378: relativo ao .cracha (377×506 em x=1259.4, y=1237),
#     o centro do asset deve estar ~em (131.54 + 123.702/2, 69.27 + 115.263/2) = (193.4, 126.9)
#   - conferrir visual: blob orgânico (não círculo) com sombra suave embaixo-direita
# pnpm lint (o eslint @next/next/no-img-element precisa do disable comment)
```

Commit: `fix(home): replace cracha ellipse-378 div with real figma asset (blob + baked shadow)`

---

## Task 4: Verificação visual final do plan + gates

**Obrigatório (não pular):**

1. `pnpm build` limpo.
2. `pnpm lint` limpo.
3. `pnpm exec tsc --noEmit` limpo.
4. `./scripts/check-quality-gates.sh 3 4 5` — PASS.
5. **Visual Figma × impl lado a lado em 1728px** (obrigatório — ver `docs/superpowers/quality-gates/2026-10-21-new-home-fixes-quality-gates.md` §Gate Visual, itens 1-3):
   - Elipse cyan de contato: intensidad e centro batendo com o Figma.
   - Crachá: texto typewriter alinhado às réguas (primeira linha na pista correta).
   - Ellipse 378: blob orgânico com sombra (não círculo chapado).
6. **Regression check:** as outras 4 elipses (rosa topo, rosa footer, cyan pequena, cyan grande) **não mudaram** visualmente — comparar crops lado a lado com `/tmp/pn-visual/fig-*.png`.
7. Idiomas: `/pt-BR` e `/en` — o dizer do crachá continua traduzido (`acredito que o design é` / `i believe that design is`), sem quebrar.

---

## Report

O implementador retorna: STATUS (DONE/DONE_WITH_CONCERNS/BLOCKED), os 3 commits (SHAs), as medições de verificação (alpha da elipse-2, ângulo do texto, bbox da elipse-378), e qualquer desvio dos valores exatos acima com justificativa.

---

## Referências

- Spec: `docs/superpowers/specs/2026-10-21-new-home-fixes-v3.md` (§1, §2)
- Análise: `docs/superpowers/analysis/2026-10-21-gap-analysis-v2-vs-figma-round2.md` (§1, §3)
- Componente atual: `components/home/PhilosophySection.tsx` (ler antes — doc interno tem toda a geometria do crachá)
- Asset atual da elipse: `public/images/home/ellipse-2.svg` (ler antes — tem o gradiente e o filtro de grão)
- Screenshots de referência: `/tmp/pn-visual/fig-full-1728.png`, `/tmp/pn-visual/fig-cracha-regiao.png`, `/tmp/pn-visual/fig-elipse-cyan-grande-ctx.png`
