# Plan 4/6: Studies Gallery + Peeking Character — Nova Home "Pontossemno"

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever a StudiesGallery com a célula rosa em **2 camadas** (coelhos como fundo + cover como camada visível) e ajustar o PeekingCharacter para a posição correta (52% from left, 676px, overlap de ~21px com a galeria).

**Architecture:** Gallery usa grid `2fr 1fr` (esquerda 2/3 com 2 células empilhadas, direita 1/3 sidebar). A célula rosa tem 2 `<img>` absolute (coelhos scaled 161.56% como fundo, cover 1727×558 como topo visível). PeekingCharacter usa margin-left de 52.2% e negative margin-bottom de ~21px.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, i18n (pt-BR/en)

**Spec:** `docs/superpowers/specs/2026-10-20-new-home-design-v2.md` (seções 4.6, 4.7)

**Depends on:** Plan 1, 2, 3

## Global Constraints

- **i18n obrigatório (AGENTS.md):** Toda string user-visible vai para `dictionaries/pt-BR.json` E `dictionaries/en.json`.
- **Sem texto hardcoded.**
- **Server Components:** recebem `dict` como prop.
- **Imagens:** `alt` do dicionário para conteúdo, `alt=""` + `aria-hidden` para decorativas/fundo.
- **eslint:** `// eslint-disable-next-line @next/next/no-img-element` antes de cada `<img>`.
- **Verificação obrigatória antes de cada commit:** `pnpm build`, `pnpm lint`, `pnpm exec tsc --noEmit`
- **Branch:** `feature/new-home`
- **Commit attribution:** `Co-Authored-By: Claude Code <noreply@anthropic.com>`

## Review Focus

1. **Duas camadas na célula rosa:** CRÍTICO — a célula rosa DEVE ter `estudos-coelhos.png` como camada de fundo (scaled 161.56%) E `estudos-cover.png` como camada visível por cima (1727×558 at x=-95). A v1 mostrava apenas coelhos.
2. **Cover visível:** O `estudos-cover.png` é a imagem que o usuário VÊ. Ela deve estar por cima (z-index maior ou depois no DOM).
3. **Peeking position:** 52.2% from left (não centralizado), 676px de largura (não 500px).
4. **Overlap:** Peeking character deve sobrepor a galeria em ~21px (não 80px).
5. **Baleia position:** Na célula azul, a baleia deve estar com height 153.99%, top -28.29%, left -4.16%, width 110.24%.
6. **Sidebar:** O `doodles-azul.svg` preenche toda a altura (1117px = soma das 2 células esquerdas).

---

## Task 1: Reescrever StudiesGallery com 2 camadas na célula rosa

**Files:**
- Rewrite: `components/home/StudiesGallery.tsx`

**Interfaces:**
- Consumes: `dict: Dictionary` (prop)
- Produces: `StudiesGallery` com grid 2fr/1fr, célula rosa em 2 camadas, célula azul com baleia, sidebar com doodles
- Assets: `/images/home/estudos-coelhos.png`, `/images/home/estudos-cover.png`, `/images/home/carreira-baleia.png`, `/images/home/doodles-azul.svg`

- [ ] **Step 1: Verificar todos os assets**

```bash
ls -la public/images/home/estudos-coelhos.png public/images/home/estudos-cover.png public/images/home/carreira-baleia.png public/images/home/doodles-azul.svg
file public/images/home/estudos-*.png public/images/home/carreira-baleia.png
```

Expected: Todos existem. `estudos-cover.png` é grande (6.3MB, 4096×1323).

- [ ] **Step 2: Reescrever StudiesGallery.tsx**

```tsx
// components/home/StudiesGallery.tsx
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Galeria de estudos — fiel ao Figma Pontossemno (canvas 1728px):
 *
 * Layout: grid 2fr 1fr (esquerda 1152px = 2/3, direita 576px = 1/3)
 * Altura total: 1117px (2 células de 558px + sidebar 1117px)
 *
 * Célula rosa (Frame 8, x=0, y=2234, 1152×558, bg #F9CEDC) — DUAS CAMADAS:
 *   1. Fundo: estudos-coelhos.png (h=161.56%, top=-8.61%, left=-1.36%, w=117.38%)
 *   2. Topo (VISÍVEL): estudos-cover.png (1727×558 at x=-95, object-cover)
 *
 * Célula azul (Frame 10, x=0, y=2793, 1152×558, bg #6F96CE):
 *   - carreira-baleia.png (h=153.99%, top=-28.29%, left=-4.16%, w=110.24%)
 *
 * Sidebar (Frame 9, x=1152, y=2234, 576×1117):
 *   - doodles-azul.svg (tem gradiente próprio #485699→#5C76B4→#6F95CE)
 */
export function StudiesGallery({ dict }: { dict: Dictionary }) {
  const home = dict.home;
  return (
    <section className="grid grid-cols-1 md:grid-cols-[2fr_1fr]">
      {/* Coluna esquerda (2/3): duas células empilhadas */}
      <div className="flex flex-col">
        {/* Célula ROSA — DUAS CAMADAS OBRIGATÓRIAS */}
        <div className="relative h-[300px] overflow-hidden bg-[color:var(--color-pink-light)] md:h-[558px]">
          {/* Camada 1 (fundo): coelhos — scaled para mostrar mais da imagem */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/home/estudos-coelhos.png"
            alt=""
            aria-hidden="true"
            width={735}
            height={490}
            className="absolute max-w-none object-cover"
            style={{
              height: "161.56%",
              top: "-8.61%",
              left: "-1.36%",
              width: "117.38%",
            }}
          />
          {/* Camada 2 (topo, VISÍVEL): cover — a imagem que o usuário vê */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/home/estudos-cover.png"
            alt={home.studiesAlt}
            width={1727}
            height={558}
            className="absolute max-w-none object-cover"
            style={{
              left: "-95px",
              top: "0.18px",
              width: "1727px",
              height: "558px",
            }}
          />
        </div>

        {/* Célula AZUL — baleia */}
        <div className="relative h-[300px] overflow-hidden bg-[color:var(--color-blue)] md:h-[558px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/home/carreira-baleia.png"
            alt={home.careerAlt}
            width={869}
            height={588}
            className="absolute max-w-none object-cover"
            style={{
              height: "153.99%",
              top: "-28.29%",
              left: "-4.16%",
              width: "110.24%",
            }}
          />
        </div>
      </div>

      {/* Coluna direita (1/3): sidebar com doodles */}
      <div className="relative min-h-[400px] md:min-h-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/home/doodles-azul.svg"
          alt={home.studiesDoodlesAlt}
          width={576}
          height={1117}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </section>
  );
}
```

> **CRÍTICO:** A célula rosa tem **2 `<img>`**. O segundo (`estudos-cover.png`) é o que fica visível. Se o cover não aparecer, verificar se o caminho está correto e se as dimensões não estão sendo sobrescritas por CSS global.

- [ ] **Step 3: Verificar chaves de dicionário**

```bash
cat dictionaries/pt-BR.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
home = d.get('home', {})
for k in ['studiesAlt', 'careerAlt', 'studiesDoodlesAlt']:
    print(f'{\"✓\" if k in home else \"✗\"} home.{k}')
"
```

Expected: Todas existem.

- [ ] **Step 4: Verificar lint e tsc**

```bash
pnpm lint
pnpm exec tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add components/home/StudiesGallery.tsx
git commit -m "feat(home): rewrite StudiesGallery with 2-layer pink cell

Pink cell (Frame 8) now has TWO image layers:
- Background: estudos-coelhos.png scaled 161.56% (-8.61% top, -1.36% left, 117.38% width)
- Top (visible): estudos-cover.png 1727×558 at x=-95

Blue cell: baleia at 153.99% height, -28.29% top, -4.16% left, 110.24% width.
Sidebar: doodles-azul.svg object-cover full height.

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 2: Ajustar PeekingCharacter (posição 52%, tamanho 676px, overlap 21px)

**Files:**
- Rewrite: `components/home/PeekingCharacter.tsx`

**Interfaces:**
- Consumes: `dict: Dictionary` (prop)
- Produces: `PeekingCharacter` posicionado em 52.2% from left, 676px wide, -mb-[21px]

- [ ] **Step 1: Reescrever PeekingCharacter.tsx**

```tsx
// components/home/PeekingCharacter.tsx
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Personagem espiando por cima da galeria — fiel ao Figma (Group 100804):
 *
 * - Posição: x=901.7, y=1894, 676×361
 * - 901.7/1728 = 52.2% from left (NÃO centralizado!)
 * - Bottom do personagem (1894+361=2255) sobrepõe top da galeria (2234) em ~21px
 * - A ilustração "vaza" por cima da borda da galeria
 */
export function PeekingCharacter({ dict }: { dict: Dictionary }) {
  return (
    <div className="relative z-10 hidden md:block">
      <div className="container-narrow">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/espiando.svg"
          alt={dict.home.peekingAlt}
          width={676}
          height={361}
          className="-mb-[21px]" // overlap de ~21px com a galeria
          style={{
            marginLeft: "52.2%", // 901.7/1728 — NÃO centralizado!
            width: "676px",
            maxWidth: "none",
          }}
        />
      </div>
    </div>
  );
}
```

> **Mudanças da v1:**
> - v1: `flex justify-center` + `max-w-[500px]` + `-mb-[80px]` (centralizado, pequeno, overlap grande)
> - v2: `marginLeft: 52.2%` + `width: 676px` + `-mb-[21px]` (à direita do centro, tamanho correto, overlap correto)

- [ ] **Step 2: Verificar visualmente**

```bash
pnpm dev
```

Abrir http://localhost:3000/pt-BR em 1728px e verificar:
- Personagem aparece à direita do centro (~52% from left)
- Personagem tem ~676px de largura
- Personagem sobrepõe a galeria em ~21px (a cabeça "vaza" por cima da borda rosa)

- [ ] **Step 3: Verificar build e commit**

```bash
pnpm build && pnpm lint && pnpm exec tsc --noEmit
git add components/home/PeekingCharacter.tsx
git commit -m "fix(home): adjust PeekingCharacter position to 52% from left

- Was: centered (justify-center), max-w-[500px], -mb-[80px]
- Now: margin-left 52.2%, width 676px, -mb-[21px]
- Matches Figma Group 100804: x=901.7, y=1894, 676×361

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 3: Verificação visual final do Plan 4

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

**Checklist visual — Studies Gallery:**

| # | Elemento | Figma | Implementação | Status |
|---|---------|-------|---------------|--------|
| 1 | Layout grid | 2fr 1fr (1152px + 576px) | `md:grid-cols-[2fr_1fr]` | ☐ |
| 2 | Altura células | 558px cada | `md:h-[558px]` | ☐ |
| 3 | Altura sidebar | 1117px (2×558+1) | automático (full height) | ☐ |
| 4 | Célula rosa bg | #F9CEDC | `bg-[color:var(--color-pink-light)]` | ☐ |
| 5 | **Camada 1 (coelhos)** | h=161.56%, top=-8.61%, left=-1.36%, w=117.38% | inline style | ☐ |
| 6 | **Camada 2 (cover)** | 1727×558 at x=-95, VISÍVEL | inline style, `<img>` depois no DOM | ☐ |
| 7 | Célula azul bg | #6F96CE | `bg-[color:var(--color-blue)]` | ☐ |
| 8 | Baleia | h=153.99%, top=-28.29%, left=-4.16%, w=110.24% | inline style | ☐ |
| 9 | Sidebar | doodles-azul.svg object-cover | `absolute inset-0 h-full w-full object-cover` | ☐ |
| 10 | **Cover é a imagem visível** | estudos-cover.png por cima | segundo `<img>` no DOM | ☐ |

**Checklist visual — Peeking Character:**

| # | Elemento | Figma | Implementação | Status |
|---|---------|-------|---------------|--------|
| 1 | Posição X | 901.7px (52.2%) | `marginLeft: 52.2%` | ☐ |
| 2 | Largura | 676px | `width: 676px` | ☐ |
| 3 | Altura | 361px | `height={361}` | ☐ |
| 4 | Overlap com galeria | ~21px | `-mb-[21px]` | ☐ |
| 5 | Z-index | Acima da galeria | `z-10` | ☐ |
| 6 | Mobile | Oculto | `hidden md:block` | ☐ |

- [ ] **Step 4: Testar em EN**

http://localhost:3000/en — verificar alts traduzidos.

- [ ] **Step 5: Testar mobile**

Redimensionar para 375px:
- Gallery empilha em coluna única (rosa, azul, sidebar)
- Peeking character está oculto
- Imagens mantêm proporção (h-[300px])

- [ ] **Step 6: Commit final do Plan 4**

```bash
git add -A
git commit -m "docs(home): plan 4 complete — gallery with 2-layer pink cell + peeking char

Quality gates: 3 ✓, 4 ✓, 5 ✓
Visual verification: cover visible over coelhos, peeking at 52% from left

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Plan 4 Complete

**Próximo plan:** `2026-10-20-new-home-plan-5-contact.md` (Contact Section com título 3 linhas + elipses)

**Checklist de entrega:**
- [ ] Célula rosa com 2 camadas (coelhos fundo + cover visível)
- [ ] Cover é a imagem que aparece (não coelhos)
- [ ] Célula azul com baleia nas proporções corretas
- [ ] Sidebar com doodles
- [ ] Peeking character em 52.2% from left
- [ ] Peeking com 676px de largura
- [ ] Overlap de ~21px com a galeria
- [ ] Build + lint + tsc + quality gates passando
- [ ] Verificação visual manual concluída
