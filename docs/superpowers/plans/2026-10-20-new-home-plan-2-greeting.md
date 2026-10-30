# Plan 2/6: Greeting Section + ":d" Gigante — Nova Home "Pontossemno"

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever completamente a GreetingSection para corresponder ao Figma: ilustração ola.svg com overlay de mão acenando (ola-mao.svg), título "Olá a todos," em 120px, intro justificado em 26px, e o texto ":d" gigante (338px) posicionado absolutamente entre o hero e a section.

**Architecture:** A GreetingSection usa grid 2 colunas (ilustração esquerda, texto direita). A mão acenando é um overlay absolute sobre a ilustração. O ":d" gigante é posicionado absolute no wrapper da página (não dentro da section). A elipse rosa (695px) é posicionada absolute no wrapper da página.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, i18n (pt-BR/en)

**Spec:** `docs/superpowers/specs/2026-10-20-new-home-design-v2.md` (seções 4.3, 4.4)

**Depends on:** Plan 1 (Header + Hero) deve estar completo.

## Global Constraints

- **i18n obrigatório (AGENTS.md):** Toda string user-visible vai para `dictionaries/pt-BR.json` E `dictionaries/en.json` na mesma mudança.
- **Sem texto hardcoded:** Zero exceções. O ":d" é decorativo (aria-hidden), não precisa de tradução.
- **Links:** Sempre `/${locale}`-prefixados at render time.
- **Server Components:** recebem `dict` como prop.
- **Imagens:** `alt` vem do dicionário. Imagens decorativas usam `alt=""` e `aria-hidden`.
- **eslint:** Usar `// eslint-disable-next-line @next/next/no-img-element` antes de cada `<img>`.
- **Verificação obrigatória antes de cada commit:** `pnpm build`, `pnpm lint`, `pnpm exec tsc --noEmit`
- **Branch:** `feature/new-home`
- **Commit attribution:** `Co-Authored-By: Claude Code <noreply@anthropic.com>`

## Review Focus

1. **Mão acenando:** O `ola-mao.svg` DEVE aparecer sobre a ilustração ola.svg, rotacionado -4.66°, na posição correta (x=121, y=882 relativo à página = offset -139, +325 relativo ao ola.svg).
2. **":d" gigante:** Deve ser 338px (19.57vw), cor #BACCEB, posicionado absolute entre hero e greeting — NÃO dentro da GreetingSection.
3. **Tamanhos de fonte:** Título 120px (6.94vw), intro 26px (1.625rem) — significativamente maiores que a v1 (40/64px e 18/20px).
4. **Justificado:** O texto intro deve ter `text-justify`.
5. **Elipse rosa:** 695×695, absolute, x=1394 (80.6%), y=436 (relativo ao wrapper da página).
6. **Mobile:** Em mobile, a mão acenando e a elipse podem ser ocultadas ou redimensionadas.

---

## Task 1: Reescrever GreetingSection com mão acenando

**Files:**
- Rewrite: `components/home/GreetingSection.tsx`

**Interfaces:**
- Consumes: `dict: Dictionary` (prop)
- Produces: `GreetingSection` com ilustração + mão overlay + título 120px + intro 26px justificado
- Assets usados: `/illustrations/ola.svg` (513×477), `/illustrations/ola-mao.svg` (215×248)

- [ ] **Step 1: Ler o componente atual (para referência)**

```bash
cat components/home/GreetingSection.tsx
```

- [ ] **Step 2: Verificar assets disponíveis**

```bash
ls -la public/illustrations/ola.svg public/illustrations/ola-mao.svg
file public/illustrations/ola.svg public/illustrations/ola-mao.svg
```

Expected: Ambos existem e são SVGs válidos.

- [ ] **Step 3: Reescrever GreetingSection.tsx**

```tsx
// components/home/GreetingSection.tsx
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Seção de saudação — fiel ao Figma Pontossemno (node 751:1318):
 *
 * Layout (canvas 1728px):
 * - Ilustração ola.svg: x=260, y=557, 513×477 (esquerda)
 * - Mão acenando ola-mao.svg: x=121, y=882, 215×248, rotate -4.66° (overlay na ilustração)
 * - Título "Olá a todos,": x=1031, y=575, 120px AM Novecento #6F96CE, 2 linhas
 * - Intro: x=843, y=948, w=648, 26px Clother Light, justificado, 2 parágrafos
 *
 * A elipse rosa (695×695, x=1394, y=436) e o ":d" gigante são posicionados
 * no wrapper da página (page.tsx), NÃO aqui.
 */
export function GreetingSection({ dict }: { dict: Dictionary }) {
  const home = dict.home;
  return (
    <section className="relative grid grid-cols-1 items-start gap-8 md:grid-cols-[1fr_1.3fr]">
      {/* Ilustração + mão acenando (overlay) */}
      <div className="relative mx-auto md:mx-0">
        {/* Ilustração principal: Ágatha acenando */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/ola.svg"
          alt={home.greetingAlt}
          width={513}
          height={477}
          className="w-full max-w-[400px] md:max-w-[513px]"
        />
        {/* Mão acenando — overlay absolute sobre a ilustração */}
        {/* Posição relativa ao ola.svg: x=121-260=-139, y=882-557=325 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/ola-mao.svg"
          alt=""
          aria-hidden="true"
          width={215}
          height={248}
          className="absolute hidden md:block"
          style={{
            left: '-139px',
            top: '325px',
            transform: 'rotate(-4.66deg)',
          }}
        />
      </div>

      {/* Texto */}
      <div className="md:pt-4">
        {/* Título: 120px no Figma = clamp(3rem, 6.94vw, 7.5rem) */}
        <h2 className="font-display text-[color:var(--color-blue)] text-[clamp(3rem,6.94vw,7.5rem)] leading-[0.9] mb-8">
          {home.greeting}
        </h2>
        {/* Intro: 26px no Figma = text-[1.625rem], justificado, max-w-[648px] */}
        <div className="max-w-[648px] space-y-4 text-[1.625rem] leading-[1.26] text-justify text-[color:var(--color-blue)]">
          {home.intro ? (
            <p>{home.intro}</p>
          ) : (
            <>
              <p>{home.introPara1}</p>
              <p>{home.introPara2}</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
```

> **Nota sobre o intro:** A spec v2 sugere split em `introPara1` e `introPara2`. Verificar se a chave `home.intro` atual já contém os 2 parágrafos separados por `\n\n` ou se precisa adicionar novas chaves. Se `home.intro` já tem tudo em um texto, manter como está por enquanto (outro plan pode refinar).

- [ ] **Step 4: Verificar se precisa adicionar chaves introPara1/introPara2**

```bash
cat dictionaries/pt-BR.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(repr(d['home'].get('intro', 'NÃO EXISTE')[:200]))"
```

Se `home.intro` contém os 2 parágrafos em um texto só, manter assim por enquanto. Se precisar de split, adicionar as novas chaves (mas isso pode ser feito em outro plan).

- [ ] **Step 5: Verificar lint e tsc**

```bash
pnpm lint
pnpm exec tsc --noEmit
```

Expected: Sem erros.

- [ ] **Step 6: Commit**

```bash
git add components/home/GreetingSection.tsx
git commit -m "feat(home): rewrite GreetingSection with waving hand overlay

- Add ola-mao.svg overlay (x=121, y=882, rotate -4.66°)
- Title 120px (clamp 6.94vw), intro 26px justified
- Grid layout: illustration left, text right

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 2: Adicionar ":d" gigante e elipse rosa no wrapper da página

**Files:**
- Modify: `app/[lang]/page.tsx`

**Interfaces:**
- Consumes: `dict: Dictionary`, `GreetingSection` do Task 1
- Produces: Página com wrapper `relative` contendo `:d` (338px absolute) e elipse rosa (695px absolute)

- [ ] **Step 1: Ler a página atual**

```bash
cat app/[lang]/page.tsx
```

- [ ] **Step 2: Reescrever page.tsx com wrapper relative**

```tsx
// app/[lang]/page.tsx
import { notFound } from "next/navigation";
import { BrandHero } from "@/components/layout/BrandHero";
import { GreetingSection } from "@/components/home/GreetingSection";
import { PhilosophySection } from "@/components/home/PhilosophySection";
import { PeekingCharacter } from "@/components/home/PeekingCharacter";
import { StudiesGallery } from "@/components/home/StudiesGallery";
import { ContactSection } from "@/components/home/ContactSection";
import { getDictionary, isLocale } from "@/i18n/dictionaries";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.metadata.home,
    alternates: {
      languages: { "pt-BR": "/pt-BR", en: "/en", "x-default": "/pt-BR" },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <BrandHero title={dict.site.name} />

      {/* Wrapper relativo para elementos absolutos entre hero e philosophy */}
      <div className="relative">
        {/* ":d" gigante — Figma: x=819, y=499, 338.2px AM Novecento #BACCEB */}
        {/* Posição relativa ao wrapper: y=499 - 354 (hero bottom) = 145px */}
        <div
          className="pointer-events-none absolute select-none font-display text-[color:var(--color-blue-soft)]"
          style={{
            fontSize: "clamp(120px, 19.57vw, 338px)",
            left: "47.4%", // 819/1728
            top: "145px", // 499 - 354 (hero height)
            lineHeight: 1,
            zIndex: 0,
          }}
          aria-hidden="true"
        >
          :d
        </div>

        {/* Elipse rosa — Figma node 758:297: 695×695 at x=1394, y=436 */}
        {/* Posição relativa ao wrapper: y=436 - 354 = 82px */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/home/ellipse-5.svg"
          alt=""
          aria-hidden="true"
          width={695}
          height={695}
          className="pointer-events-none absolute -z-10 hidden md:block"
          style={{
            left: "80.6%", // 1394/1728
            top: "82px", // 436 - 354
          }}
        />

        {/* Greeting Section */}
        <div className="container-narrow py-12 md:py-20">
          <GreetingSection dict={dict} />
        </div>

        {/* Philosophy Section (será reescrita no Plan 3) */}
        <div className="container-narrow py-12 md:py-20">
          <PhilosophySection dict={dict} />
        </div>
      </div>

      {/* Peeking Character (será ajustado no Plan 4) */}
      <PeekingCharacter dict={dict} />

      {/* Studies Gallery (será reescrita no Plan 4) */}
      <StudiesGallery dict={dict} />

      {/* Contact Section (será reescrita no Plan 5) */}
      <div className="container-narrow py-12 md:py-20">
        <ContactSection dict={dict} />
      </div>
    </>
  );
}
```

> **Nota:** As seções Philosophy, Peeking, Gallery e Contact ainda usam as versões antigas (v1). Elas serão reescritas nos próximos plans. Esta task só adiciona o wrapper e os elementos absolutos da greeting.

- [ ] **Step 3: Verificar visualmente**

```bash
pnpm dev
```

Abrir http://localhost:3000/pt-BR em 1728px:

| Check | Esperado |
|-------|---------|
| `:d` | Aparece gigante (338px), cor #BACCEB, entre hero e greeting |
| `:d` posição | ~47% from left, logo abaixo do hero |
| Elipse rosa | 695px, canto superior direito, atrás do conteúdo |
| Mão acenando | Visível sobre a ilustração ola.svg |
| Título "Olá a todos," | 120px, 2 linhas, azul #6F96CE |
| Intro | 26px, justificado |

- [ ] **Step 4: Verificar build, lint, tsc**

```bash
pnpm build && pnpm lint && pnpm exec tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add app/[lang]/page.tsx
git commit -m "feat(home): add giant :d text and pink ellipse as absolute page elements

- :d: 338px AM Novecento #BACCEB at 47.4% from left
- Pink ellipse: 695px at x=1394, y=436 (Figma node 758:297)
- Both positioned absolute in page wrapper (not inside sections)

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 3: Ajustar espaçamentos verticais (coordenadas Y do Figma)

**Files:**
- Modify: `app/[lang]/page.tsx`

**Interfaces:**
- Consumes: Página atualizada do Task 2
- Produces: Espaçamentos verticais que correspondem às coordenadas Y do Figma

- [ ] **Step 1: Calcular espaçamentos a partir do Figma**

| Transição | Y Figma | Cálculo | Padding/Margin sugerido |
|-----------|---------|---------|------------------------|
| Hero bottom → :d top | 354 → 499 | 145px gap | `:d` top: 145px (já feito) |
| :d → Greeting illustration top | 499 → 557 | illustration starts at 557 | Greeting section padding-top ~203px (557-354) |
| Greeting intro bottom → Philosophy title | ~1240 → 1266 | ~26px | Section spacing ~py-6 |
| Philosophy body bottom → Peeking char | ~1810 → 1894 | ~84px | margin-top ~84px |
| Peeking char → Gallery top | 2255 → 2234 | -21px (overlap) | negative margin -21px |
| Gallery bottom → Contact illustration | 3351 → 3437 | 86px | py-20 (80px) ✓ |
| Contact form bottom → Footer top | ~4092 → 4345 | ~253px | mt-20 + py-12 (já existe) |

- [ ] **Step 2: Ajustar page.tsx com espaçamentos corretos**

```tsx
// Ajustar o espaçamento da GreetingSection
// Figma: illustration top at y=557, hero bottom at y=354 → gap = 203px
<div className="container-narrow pt-[203px] pb-12 md:pb-20">
  <GreetingSection dict={dict} />
</div>

// Ajustar o espaçamento da PhilosophySection
// Figma: philosophy title at y=1266, greeting intro bottom ~y=1240 → gap = 26px
<div className="container-narrow pt-6 pb-12 md:pb-20">
  <PhilosophySection dict={dict} />
</div>
```

> **Nota:** Estes valores são para desktop (1728px). Em mobile, usar espaçamentos menores (py-12 padrão).

- [ ] **Step 3: Verificar visualmente**

Comparar com o Figma lado a lado. Os espaçamentos verticais devem corresponder aproximadamente.

- [ ] **Step 4: Verificar build e commit**

```bash
pnpm build && pnpm lint && pnpm exec tsc --noEmit
git add app/[lang]/page.tsx
git commit -m "fix(home): adjust vertical spacing to match Figma Y coordinates

- Greeting section: pt-[203px] (557-354)
- Philosophy section: pt-6 (1266-1240)

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 4: Verificação visual final do Plan 2

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

Abrir http://localhost:3000/pt-BR em 1728px e http://localhost:3000/en em 1728px.

**Checklist visual (Figma vs Implementação):**

| # | Elemento | Figma | Implementação | Status |
|---|---------|-------|---------------|--------|
| 1 | `:d` tamanho | 338.2px | `clamp(120px, 19.57vw, 338px)` | ☐ |
| 2 | `:d` cor | #BACCEB | `text-[color:var(--color-blue-soft)]` | ☐ |
| 3 | `:d` posição X | 819px (47.4%) | `left: 47.4%` | ☐ |
| 4 | `:d` posição Y | 499px (145px do hero bottom) | `top: 145px` | ☐ |
| 5 | Mão acenando | x=121, y=882, 215×248, rot -4.66° | overlay absolute | ☐ |
| 6 | ola.svg | 513×477 at x=260 | `max-w-[513px]` | ☐ |
| 7 | Título "Olá a todos," | 120px, 2 linhas | `clamp(3rem,6.94vw,7.5rem)` | ☐ |
| 8 | Intro | 26px, justificado, w=648 | `text-[1.625rem] text-justify max-w-[648px]` | ☐ |
| 9 | Elipse rosa | 695×695 at x=1394, y=436 | `ellipse-5.svg` absolute | ☐ |
| 10 | Espaçamento hero→greeting | 203px | `pt-[203px]` | ☐ |

- [ ] **Step 4: Testar troca de idioma**

Clicar no LanguageSwitcher e verificar que a página em EN também mostra o `:d` e a mão acenando corretamente.

- [ ] **Step 5: Testar mobile**

Redimensionar para 375px e verificar:
- `:d` aparece menor (clamp)
- Mão acenando está oculta (`hidden md:block`)
- Elipse rosa está oculta (`hidden md:block`)
- Layout empilha em coluna única

- [ ] **Step 6: Commit final do Plan 2**

```bash
git add -A
git commit -m "docs(home): plan 2 complete — greeting section with waving hand and giant :d

Quality gates: 3 ✓, 4 ✓, 5 ✓
Visual verification: :d 338px, ola-mao overlay, pink ellipse, 120px title

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Plan 2 Complete

**Próximo plan:** `2026-10-20-new-home-plan-3-philosophy.md` (Philosophy Section + Crachá completo)

**Checklist de entrega:**
- [ ] GreetingSection reescrita com mão acenando (ola-mao.svg)
- [ ] Título 120px (não mais 40/64px)
- [ ] Intro 26px justificado (não mais 18/20px)
- [ ] `:d` gigante 338px absolute na página (não dentro da section)
- [ ] Elipse rosa 695px absolute na página
- [ ] Espaçamentos verticais ajustados para coordenadas Y do Figma
- [ ] Build + lint + tsc + quality gates passando
- [ ] Verificação visual manual concluída (desktop + mobile + EN)
