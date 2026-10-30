# Plan 3/6: Philosophy Section + Crachá Completo — Nova Home "Pontossemno"

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever completamente a PhilosophySection incluindo o crachá com TODAS as 6 partes (base, clip, furo, ellipse, union, 4× linhas), rotacionado 15.24°, com elipses decorativas nas coordenadas exatas do Figma.

**Architecture:** Grid 2 colunas (texto esquerda, crachá direita). O crachá é um grupo `relative` com `rotate-[15.24deg]` contendo 6+ elementos absolute posicionados com coordenadas relativas ao grupo. Elipses decorativas são absolute no wrapper da página.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, i18n (pt-BR/en)

**Spec:** `docs/superpowers/specs/2026-10-20-new-home-design-v2.md` (seção 4.5)

**Depends on:** Plan 1 (Header + Hero), Plan 2 (Greeting + :d)

## Global Constraints

- **i18n obrigatório (AGENTS.md):** Toda string user-visible vai para `dictionaries/pt-BR.json` E `dictionaries/en.json`.
- **Sem texto hardcoded.**
- **Server Components:** recebem `dict` como prop.
- **Imagens:** `alt` do dicionário para conteúdo, `alt=""` + `aria-hidden` para decorativas.
- **eslint:** `// eslint-disable-next-line @next/next/no-img-element` antes de cada `<img>`.
- **Verificação obrigatória antes de cada commit:** `pnpm build`, `pnpm lint`, `pnpm exec tsc --noEmit`
- **Branch:** `feature/new-home`
- **Commit attribution:** `Co-Authored-By: Claude Code <noreply@anthropic.com>`
- **NÃO IMPLEMENTAR:** Figma nodes 753:1649 e 753:1653 (textos duplicados leftover no Figma).

## Review Focus

1. **Crachá completo:** TODAS as 6 partes devem estar presentes: exclude (base), clip, buraco (hole), ellipse 378, union, 4× linha. A v1 tinha apenas 3 partes (clip, exclude, buraco).
2. **Rotação:** O grupo inteiro deve estar rotacionado 15.24° (não 15° arredondado).
3. **Posições internas:** Cada parte do crachá tem coordenadas específicas relativas ao grupo (ver spec seção 4.5).
4. **4 linhas:** As 4 linhas (cracha-linha.svg) devem estar igualmente espaçadas (y offsets: 244, 285, 326, 367), cada uma rotacionada ~14.8°.
5. **Elipses:** 455px (x=27, y=1125) e 879px (x=581, y=1608) — absolute no wrapper da página, não relativo à section.
6. **Textos:** Lead 32px bold justificado, body 26px justificado, com negritos inline corretos.

---

## Task 1: Reescrever PhilosophySection com crachá completo

**Files:**
- Rewrite: `components/home/PhilosophySection.tsx`

**Interfaces:**
- Consumes: `dict: Dictionary` (prop)
- Produces: `PhilosophySection` com texto (lead 32px + body 26px justificado) e crachá completo (6 partes)
- Assets: `/images/home/cracha-exclude.svg`, `cracha-clip.png`, `cracha-buraco.svg`, `cracha-union.svg`, `cracha-linha.svg` (×4)

- [ ] **Step 1: Verificar todos os assets do crachá**

```bash
ls -la public/images/home/cracha-*.{svg,png} 2>/dev/null
```

Expected: Todos os 5 arquivos existem:
- cracha-exclude.svg (base)
- cracha-clip.png (prendedor)
- cracha-buraco.svg (furo)
- cracha-union.svg (união — decorativo)
- cracha-linha.svg (linha — usado 4×)

- [ ] **Step 2: Reescrever PhilosophySection.tsx**

```tsx
// components/home/PhilosophySection.tsx
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Crachá completo — fiel ao Figma (Group 100805):
 * - Grupo: x=1259, y=1237, 377×506, rotate 15.24°
 * - 6 partes internas com coordenadas relativas ao grupo:
 *   1. Base (exclude): left=-9px, top=56px, 361×448
 *   2. Clip: left=-9px, top=56px, 361px wide (z-index alto)
 *   3. Buraco (hole): left=73px, top=101px, 102×102
 *   4. Ellipse 378: left=132px, top=69px, 124×115 (decorativo — SVG inline se necessário)
 *   5. Union: left=108px, top=28px, 125×145
 *   6. 4× Linha: left=-44px, top=244/285/326/367px, 169×44.6, rotate 14.8° cada
 */
function Cracha({ alt }: { alt: string }) {
  const linhaTops = [244, 285, 326, 367]; // espaçamento ~41px entre linhas
  
  return (
    <div
      className="relative mx-auto"
      style={{
        width: "377px",
        height: "506px",
        transform: "rotate(15.24deg)",
      }}
    >
      {/* 1. Base do crachá (exclude) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/home/cracha-exclude.svg"
        alt={alt}
        width={361}
        height={448}
        className="absolute"
        style={{ left: "-9px", top: "56px" }}
      />

      {/* 2. Clip (prendedor) no topo — z-index alto */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/home/cracha-clip.png"
        alt=""
        aria-hidden="true"
        width={228}
        height={202}
        className="absolute z-10"
        style={{ left: "-9px", top: "56px", width: "361px" }}
      />

      {/* 3. Furo decorativo (hole) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/home/cracha-buraco.svg"
        alt=""
        aria-hidden="true"
        width={102}
        height={102}
        className="absolute"
        style={{ left: "73px", top: "101px" }}
      />

      {/* 4. Ellipse decorativa (378) — criar SVG inline se não tiver asset */}
      <div
        className="absolute rounded-full bg-[color:var(--color-blue-soft)]"
        style={{
          left: "132px",
          top: "69px",
          width: "124px",
          height: "115px",
          opacity: 0.6,
        }}
        aria-hidden="true"
      />

      {/* 5. Union — OBRIGATÓRIO (faltava na v1!) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/home/cracha-union.svg"
        alt=""
        aria-hidden="true"
        width={125}
        height={145}
        className="absolute"
        style={{ left: "108px", top: "28px" }}
      />

      {/* 6. Quatro linhas decorativas — OBRIGATÓRIAS (faltavam na v1!) */}
      {linhaTops.map((top, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src="/images/home/cracha-linha.svg"
          alt=""
          aria-hidden="true"
          width={169}
          height={45}
          className="absolute"
          style={{
            left: "-44px",
            top: `${top}px`,
            transform: "rotate(14.8deg)",
          }}
        />
      ))}
    </div>
  );
}

/**
 * Seção Philosophy — fiel ao Figma (node 751:1318):
 *
 * - Título "Filosofia": x=222, y=1266, 120px AM Novecento
 * - Lead: x=222, y=1481, w=705, Clother Bold 32px, justificado
 * - Body1: x=222, y=1590, w=702, 26px
 * - Body2: x=222, y=1704, w=702, 26px
 * - Crachá: x=1259, y=1237 (grupo rotacionado 15.24°)
 *
 * NÃO IMPLEMENTAR: Figma nodes 753:1649 e 753:1653 (duplicados leftover).
 *
 * As elipses decorativas (758:298 em x=27 y=1125, 758:112 em x=581 y=1608)
 * são posicionadas no wrapper da página (page.tsx), NÃO aqui.
 */
export function PhilosophySection({ dict }: { dict: Dictionary }) {
  const home = dict.home;
  return (
    <section className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-[1.3fr_1fr]">
      {/* Texto esquerda */}
      <div>
        {/* Título: 120px no Figma */}
        <h2 className="font-display text-[color:var(--color-blue)] text-[clamp(3rem,6.94vw,7.5rem)] leading-none mb-6">
          {home.philosophy}
        </h2>

        {/* Lead: 32px Clother Bold, justificado, max-w-[705px] */}
        <p className="mb-4 max-w-[705px] text-justify text-[2rem] font-bold leading-snug text-[color:var(--color-blue)]">
          {home.philosophyLead}
        </p>

        {/* Body1: 26px, justificado, max-w-[702px], bold "experiência humana" */}
        <p className="mb-3 max-w-[702px] text-justify text-[1.625rem] leading-relaxed text-[color:var(--color-blue)]">
          {home.philosophyBody1}
          <strong className="font-bold">{home.philosophyBody1Bold}</strong>
          {home.philosophyBody1End}
        </p>

        {/* Body2: 26px, justificado, max-w-[702px], bolds "3D", "design de interfaces", "pesquisa" */}
        <p className="max-w-[702px] text-justify text-[1.625rem] leading-relaxed text-[color:var(--color-blue)]">
          {home.philosophyBody2}
          <strong className="font-bold">{home.philosophyBody2Bold1}</strong>
          {home.philosophyBody2Mid}
          <strong className="font-bold">{home.philosophyBody2Bold2}</strong>
          {home.philosophyBody2Mid2}
          <strong className="font-bold">{home.philosophyBody2Bold3}</strong>
          {home.philosophyBody2End}
        </p>
      </div>

      {/* Crachá direita */}
      <div className="flex justify-center md:justify-end">
        <Cracha alt={home.crachaAlt} />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verificar se as chaves de dicionário existem**

```bash
cat dictionaries/pt-BR.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
home = d.get('home', {})
keys = ['philosophy', 'philosophyLead', 'philosophyBody1', 'philosophyBody1Bold', 'philosophyBody1End', 
        'philosophyBody2', 'philosophyBody2Bold1', 'philosophyBody2Mid', 'philosophyBody2Bold2', 
        'philosophyBody2Mid2', 'philosophyBody2Bold3', 'philosophyBody2End', 'crachaAlt']
for k in keys:
    status = '✓' if k in home else '✗ FALTA'
    print(f'{status} home.{k}')
"
```

Expected: Todas as chaves existem (foram adicionadas na v1).

- [ ] **Step 4: Verificar lint e tsc**

```bash
pnpm lint
pnpm exec tsc --noEmit
```

Expected: Sem erros.

- [ ] **Step 5: Commit**

```bash
git add components/home/PhilosophySection.tsx
git commit -m "feat(home): rewrite PhilosophySection with complete 6-part crachá

Crachá now includes all Figma parts:
- Base (exclude), clip, hole, ellipse 378, union, 4× linhas
- Group rotated 15.24° with exact internal coordinates
- Lead 32px bold justified, body 26px justified

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 2: Adicionar elipses da Philosophy no wrapper da página

**Files:**
- Modify: `app/[lang]/page.tsx`

**Interfaces:**
- Consumes: Página atualizada do Plan 2
- Produces: Elipses 758:298 (455px, x=27, y=1125) e 758:112 (879px, x=581, y=1608) como elementos absolute

- [ ] **Step 1: Calcular posições relativas ao wrapper**

O wrapper `relative` começa logo após o BrandHero (y=354 no Figma).

| Elipse | Figma Y | Relativo ao wrapper (Y - 354) | Figma X | % from left |
|--------|---------|------------------------------|---------|-------------|
| 758:298 (cyan 455px) | 1125 | 771px | 27 | 1.56% |
| 758:112 (cyan 879px) | 1608 | 1254px | 581 | 33.6% |

- [ ] **Step 2: Adicionar elipses no page.tsx**

Dentro do wrapper `relative` (após o `:d` e elipse rosa):

```tsx
{/* Elipse cyan pequena — Figma node 758:298: 455×455 at x=27, y=1125 */}
{/* eslint-disable-next-line @next/next/no-img-element */}
<img
  src="/images/home/ellipse-3.svg"
  alt=""
  aria-hidden="true"
  width={455}
  height={455}
  className="pointer-events-none absolute -z-10 hidden md:block"
  style={{
    left: "1.56%", // 27/1728
    top: "771px", // 1125 - 354 (hero bottom)
  }}
/>

{/* Elipse cyan grande — Figma node 758:112: 879×879 at x=581, y=1608 */}
{/* eslint-disable-next-line @next/next/no-img-element */}
<img
  src="/images/home/ellipse-1.svg"
  alt=""
  aria-hidden="true"
  width={879}
  height={879}
  className="pointer-events-none absolute -z-10 hidden md:block"
  style={{
    left: "33.6%", // 581/1728
    top: "1254px", // 1608 - 354
  }}
/>
```

> **Nota:** Estas coordenadas `top` são absolutas relativas ao wrapper. Funcionam bem em desktop (1728px). Em telas menores, as seções podem ter alturas diferentes, então as elipses podem não alinhar perfeitamente — isso é aceitável para elementos decorativos.

- [ ] **Step 3: Verificar visualmente**

```bash
pnpm dev
```

Abrir http://localhost:3000/pt-BR em 1728px e verificar:
- Elipse cyan pequena (455px) aparece à esquerda, entre greeting e philosophy
- Elipse cyan grande (879px) aparece no centro, entre philosophy e peeking character
- Ambas estão atrás do conteúdo (z-index -10)

- [ ] **Step 4: Verificar build e commit**

```bash
pnpm build && pnpm lint && pnpm exec tsc --noEmit
git add app/[lang]/page.tsx
git commit -m "feat(home): add philosophy decorative ellipses at Figma coordinates

- 758:298: 455px cyan at x=27, y=1125 (1.56%, 771px)
- 758:112: 879px cyan at x=581, y=1608 (33.6%, 1254px)

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 3: Verificação visual final do Plan 3

**Files:** (nenhum — verificação apenas)

- [ ] **Step 1: Build de produção**

```bash
pnpm build
```

- [ ] **Step 2: Quality gates**

```bash
./scripts/check-quality-gates.sh 3
./scripts/check-quality-gates.sh 4
./scripts/check-quality-gates.sh 5
```

- [ ] **Step 3: Verificação visual detalhada**

Abrir http://localhost:3000/pt-BR em 1728px.

**Checklist visual — Crachá:**

| # | Parte | Figma coords (relativo ao grupo) | Implementação | Status |
|---|-------|----------------------------------|---------------|--------|
| 1 | Base (exclude) | left=-9, top=56, 361×448 | `left:-9px, top:56px` | ☐ |
| 2 | Clip | left=-9, top=56, 361px wide, z-10 | `left:-9px, top:56px, z-10` | ☐ |
| 3 | Buraco (hole) | left=73, top=101, 102×102 | `left:73px, top:101px` | ☐ |
| 4 | Ellipse 378 | left=132, top=69, 124×115 | div rounded-full | ☐ |
| 5 | Union | left=108, top=28, 125×145 | `cracha-union.svg` | ☐ |
| 6a | Linha 1 | left=-44, top=244, 169×45, rot 14.8° | `cracha-linha.svg` | ☐ |
| 6b | Linha 2 | left=-44, top=285, 169×45, rot 14.8° | `cracha-linha.svg` | ☐ |
| 6c | Linha 3 | left=-44, top=326, 169×45, rot 14.8° | `cracha-linha.svg` | ☐ |
| 6d | Linha 4 | left=-44, top=367, 169×45, rot 14.8° | `cracha-linha.svg` | ☐ |
| 7 | Rotação grupo | 15.24° | `rotate(15.24deg)` | ☐ |
| 8 | Tamanho grupo | 377×506 | `width:377px, height:506px` | ☐ |

**Checklist visual — Textos:**

| # | Elemento | Figma | Implementação | Status |
|---|---------|-------|---------------|--------|
| 1 | Título "Filosofia" | 120px AM Novecento | `clamp(3rem,6.94vw,7.5rem)` | ☐ |
| 2 | Lead | 32px Clother Bold, justificado | `text-[2rem] font-bold text-justify` | ☐ |
| 3 | Body1 | 26px, justificado, bold inline | `text-[1.625rem] text-justify` | ☐ |
| 4 | Body2 | 26px, justificado, 3 bolds | `text-[1.625rem] text-justify` | ☐ |
| 5 | Max width | 705px (lead), 702px (body) | `max-w-[705px]`, `max-w-[702px]` | ☐ |

**Checklist visual — Elipses:**

| # | Elipse | Figma | Implementação | Status |
|---|--------|-------|---------------|--------|
| 1 | 758:298 | 455px, x=27 (1.56%), y=1125 | `ellipse-3.svg` | ☐ |
| 2 | 758:112 | 879px, x=581 (33.6%), y=1608 | `ellipse-1.svg` | ☐ |

- [ ] **Step 4: Testar em EN**

http://localhost:3000/en — verificar que textos traduzidos aparecem corretamente com os mesmos tamanhos.

- [ ] **Step 5: Testar mobile**

Redimensionar para 375px:
- Crachá aparece centralizado, rotacionado
- Elipses estão ocultas
- Textos empilhados em coluna única

- [ ] **Step 6: Commit final do Plan 3**

```bash
git add -A
git commit -m "docs(home): plan 3 complete — philosophy section with complete crachá

Quality gates: 3 ✓, 4 ✓, 5 ✓
Visual verification: 6-part crachá rotated 15.24°, ellipses at Figma coords

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Plan 3 Complete

**Próximo plan:** `2026-10-20-new-home-plan-4-gallery-peeking.md` (Studies Gallery com 2 camadas + Peeking Character ajustado)

**Checklist de entrega:**
- [ ] Crachá completo com 6 partes (não mais 3)
- [ ] Rotação 15.24° exata
- [ ] 4 linhas decorativas presentes
- [ ] Union presente
- [ ] Lead 32px bold justificado
- [ ] Body 26px justificado com bolds inline
- [ ] Elipses 758:298 e 758:112 nas coordenadas corretas
- [ ] Build + lint + tsc + quality gates passando
- [ ] Verificação visual manual concluída
