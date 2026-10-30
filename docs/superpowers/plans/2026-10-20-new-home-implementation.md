# Nova Home Page — Implementation Plan (v1)

> ⚠️ **SUPERSEDED** — This plan (v1) has been replaced by 6 detailed plans:
> - `2026-10-20-new-home-plan-1-header-hero.md`
> - `2026-10-20-new-home-plan-2-greeting.md`
> - `2026-10-20-new-home-plan-3-philosophy.md`
> - `2026-10-20-new-home-plan-4-gallery-peeking.md`
> - `2026-10-20-new-home-plan-5-contact.md`
> - `2026-10-20-new-home-plan-6-footer-final.md`
>
> See `docs/superpowers/specs/2026-10-20-new-home-design-v2.md` for the authoritative spec.
> See `docs/superpowers/analysis/2026-10-20-gap-analysis-implementation-vs-figma.md` for gap analysis.
> **DO NOT IMPLEMENT FROM THIS PLAN.**

---

# Nova Home Page — Implementation Plan (ORIGINAL v1 — SUPERSEDED)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar a nova home page baseada no design "Pontossemno" do Figma (node 751:1318), com seções ilustradas, galeria de estudos, crachá decorativo e formulário de contato reutilizado.

**Architecture:** Reescrever `app/[lang]/page.tsx` para montar seções modulares em `components/home/`. Cada seção é um Server Component que recebe `dict` como prop. O formulário de contato reutiliza o `ContactForm` existente (Client Component). Assets já estão baixados em `public/`.

**Tech Stack:** Next.js 16.2.6 (App Router) + TypeScript + React 19 + Tailwind CSS v4 + Framer Motion (animações sutis)

**Spec:** `docs/superpowers/specs/2026-10-20-new-home-design.md`

## Quality Gates

**MANDATORY:** Cada gate deve PASSAR antes de prosseguir. Evidence required.

| Gate | Após Tasks | Propósito |
|------|-----------|-----------|
| **Gate 0** | Antes Task 1 | Baseline: branch limpa, build passa |
| **Gate 1** | Tasks 1-2 | Dicionários: paridade pt-BR ↔ en, build passa |
| **Gate 2** | Tasks 3-6 | Componentes: sem texto hardcoded, lint passa |
| **Gate 3** | Task 7 | Página: build passa, rotas corretas |
| **Gate 4** | Task 8 | Runtime: verificação visual no navegador |
| **Gate 5** | Antes PR | Pre-merge final |

**Iron Law:** Sem claims de conclusão sem evidência de verificação. Rodar os comandos, ler o output, reportar.

---

## Global Constraints

- **i18n obrigatório:** Toda string user-visible vai para `dictionaries/pt-BR.json` E `dictionaries/en.json` na mesma mudança. Type-safety quebra o build se faltar chave.
- **Sem texto hardcoded** em componentes (AGENTS.md regra zero).
- **Server Components** recebem `dict` via props. **Client Components** usam `useTranslations()`.
- **Placeholders** usan `{name}` no dicionário e `.replace('{name}', value)` no call site.
- **Links** sempre prefixados com `/${locale}`.
- **Imagens** ficam em `public/`; `alt` vem do dicionário.
- **Sem `dangerouslySetInnerHTML`** — negrito inline é feito com split de keys + JSX intercalado.
- **Assets já baixados:** Todos os SVGs/PNGs do Figma já estão em `public/illustrations/` e `public/images/home/`.
- **Formulário:** Reutilizar `ContactForm` existente sem modificá-lo (o design é idêntico).
- **Next.js 16:** `params` é Promise — sempre `await params`.

## Review Focus

1. **Paridade de dicionários** — toda chave nova em pt-BR deve ter equivalente em en; build valida isso via `satisfies`
2. **Posicionamento de assets** — cada asset deve estar na posição correta do design (verificar com screenshot do Figma)
3. **Responsividade** — grid 2 colunas vira coluna única em mobile; elementos decorativos somem em telas pequenas
4. **Acessibilidade** — `alt` traduzido em todas as imagens; aria-labels traduzidos
5. **Performance** — imagens grandes (estudos-cover.png é 6.3MB) devem usar `next/image` ou `<img>` com lazy loading

---

## Task 1: Adicionar chaves de tradução aos dicionários

**Files:**
- Modify: `dictionaries/pt-BR.json`
- Modify: `dictionaries/en.json`

**Interfaces:**
- Produces: Novas chaves em `dict.home.*` usadas pelos componentes das próximas tasks

- [ ] **Step 1: Adicionar novas chaves em `dictionaries/pt-BR.json`**

Adicionar dentro de `home` (mantendo as chaves existentes):

```json
"studiesAlt": "Ilustração de estudos — coelhos em um campo rosa com flores",
"studiesDoodlesAlt": "Painel azul com doodles de animais marinhos",
"careerAlt": "Ilustração de uma baleia fofa nadando com bolhas",
"contactTitle": "Vamos trabalhar juntos?",
"contactSubtitle": "Entre em contato enviando um e-mail abaixo!",
"contactIllustrationAlt": "Ilustração da Ágatha segurando um envelope",
"crachaAlt": "Crachá azul com os dizeres 'Acredito que o design é'"
```

- [ ] **Step 2: Adicionar as mesmas chaves em `dictionaries/en.json`**

```json
"studiesAlt": "Illustration of studies — rabbits in a pink field with flowers",
"studiesDoodlesAlt": "Blue panel with sea animal doodles",
"careerAlt": "Illustration of a cute whale swimming with bubbles",
"contactTitle": "Let's work together?",
"contactSubtitle": "Get in touch by sending an email below!",
"contactIllustrationAlt": "Illustration of Ágatha holding an envelope",
"crachaAlt": "Blue badge with the words 'I believe design is'"
```

- [ ] **Step 3: Verificar que o build passa (valida paridade de tipos)**

```bash
pnpm build
```

Expected: exit code 0 (a página atual ainda não usa as novas chaves, mas o build valida que en.json corresponde à estrutura de pt-BR.json)

- [ ] **Step 4: Commit**

```bash
git add dictionaries/pt-BR.json dictionaries/en.json
git commit -m "feat(i18n): add new home page translation keys (pt-BR + en)"
```

---

## Task 2: Criar componente `DecorativeBlob`

**Files:**
- Create: `components/home/DecorativeBlob.tsx`

**Interfaces:**
- Consumes: `variant` (1-5), `className` (posicionamento Tailwind)
- Produces: `<DecorativeBlob variant={1} className="absolute ..." />` — ellipse decorativa posicionada absolutamente

- [ ] **Step 1: Criar `components/home/DecorativeBlob.tsx`**

```tsx
import type { CSSProperties } from "react";

/**
 * Ellipses decorativas (gradientes radiais) extraídas do Figma.
 * Cada variante aponta para um SVG diferente em /images/home/.
 * Posicionamento absoluto — o pai deve ser `relative`.
 */
const BLOBS = {
  1: { src: "/images/home/ellipse-1.svg", width: 879, height: 879 },   // ciano grande
  2: { src: "/images/home/ellipse-2.svg", width: 455, height: 455 },   // rosa/ciano
  3: { src: "/images/home/ellipse-3.svg", width: 455, height: 455 },   // ciano
  4: { src: "/images/home/ellipse-4.svg", width: 695, height: 695 },   // rosa
  5: { src: "/images/home/ellipse-5.svg", width: 695, height: 695 },   // rosa
} as const;

export type BlobVariant = keyof typeof BLOBS;

export function DecorativeBlob({
  variant,
  className = "",
  alt = "",
}: {
  variant: BlobVariant;
  className?: string;
  alt?: string;
}) {
  const { src, width, height } = BLOBS[variant];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      aria-hidden={alt === ""}
      className={`pointer-events-none absolute ${className}`}
    />
  );
}
```

- [ ] **Step 2: Verificar lint e TypeScript**

```bash
pnpm lint
pnpm exec tsc --noEmit
```

Expected: exit code 0

- [ ] **Step 3: Commit**

```bash
git add components/home/DecorativeBlob.tsx
git commit -m "feat(home): add DecorativeBlob component for Figma ellipses"
```

---

## Task 3: Criar componente `GreetingSection`

**Files:**
- Create: `components/home/GreetingSection.tsx`

**Interfaces:**
- Consumes: `dict: Dictionary` (props do Server Component pai)
- Produces: Seção "Olá a todos," com ilustração SVG à esquerda e texto à direita

- [ ] **Step 1: Criar `components/home/GreetingSection.tsx`**

Estrutura basata no Figma (node 751:1399, 751:1430, 751:1431):
- Grid 2 colunas: ilustração esquerda (~40%), texto direita (~60%)
- Ilustração: `/illustrations/ola.svg` (Ágatha acenando, 529×495px)
- Título: `:D` (AM Novecento, azul) + `home.greeting` (AM Noeschichte, azul)
- Corpo: `home.intro` (Clother Light, azul)
- Decorativo: `DecorativeBlob variant={5}` atrás da ilustração (rosa, canto superior direito)

```tsx
import type { Dictionary } from "@/i18n/dictionaries";
import { DecorativeBlob } from "./DecorativeBlob";

export function GreetingSection({ dict }: { dict: Dictionary }) {
  const home = dict.home;
  return (
    <section className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_1.3fr]">
      {/* Ellipse decorativa rosa atrás da ilustração */}
      <DecorativeBlob
        variant={5}
        className="-right-20 -top-16 -z-10 hidden opacity-70 md:block"
        alt=""
      />

      {/* Ilustração */}
      <div className="relative mx-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/ola.svg"
          alt={home.greetingAlt}
          width={529}
          height={495}
          className="w-full max-w-[400px]"
        />
      </div>

      {/* Texto */}
      <div>
        <p className="font-display text-[3.5rem] leading-none text-[color:var(--color-blue)] mb-2">
          :D
        </p>
        <h2 className="font-display uppercase tracking-tight text-[color:var(--color-blue)] text-[2.5rem] md:text-[4rem] leading-none mb-4">
          {home.greeting}
        </h2>
        <p className="text-lg md:text-xl leading-relaxed text-[color:var(--color-blue)]">
          {home.intro}
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar lint e TypeScript**

```bash
pnpm lint
pnpm exec tsc --noEmit
```

Expected: exit code 0

- [ ] **Step 3: Commit**

```bash
git add components/home/GreetingSection.tsx
git commit -m "feat(home): add GreetingSection component"
```

---

## Task 4: Criar componente `PhilosophySection`

**Files:**
- Create: `components/home/PhilosophySection.tsx`

**Interfaces:**
- Consumes: `dict: Dictionary`
- Produces: Seção "Filosofia" com texto à esquerda e crachá ilustrado à direita

- [ ] **Step 1: Criar `components/home/PhilosophySection.tsx`**

Estrutura basada no Figma (node 751:1433, 751:1435, 751:1436, 751:1437, 757:94):
- Grid 2 colunas: texto esquerda (~60%), crachá direita (~40%)
- Título: `home.philosophy` (AM Novecento, azul, grande)
- Lead: `home.philosophyLead` (Clother Bold, ~32px)
- Corpo: `home.philosophyBody1` + negrito + `home.philosophyBody1End` (split keys pattern)
- Corpo 2: `home.philosophyBody2` + 3 negritos intercalados (split keys pattern)
- Crachá: composição de SVGs rotacionados (~15°):
  - Base: `/images/home/cracha-exclude.svg` (crachá azul, 282×408px)
  - Clip: `/images/home/cracha-clip.png` (prendedor, 228×202px) no topo
  - Furo: `/images/home/cracha-buraco.svg` (83×83px)
  - União: `/images/home/cracha-union.svg` (107×135px)
  - Linhas: 4x `/images/home/cracha-linha.svg` (175×3px)
  - O texto "Acredito que o design é" está DENTRO do SVG (não traduzir — é parte da arte)
- Decorativo: `DecorativeBlob variant={3}` atrás do crachá (ciano)

```tsx
import type { Dictionary } from "@/i18n/dictionaries";
import { DecorativeBlob } from "./DecorativeBlob";

/** Crachá composto por SVGs do Figma — rotacionado ~15° como no design. */
function Cracha({ alt }: { alt: string }) {
  return (
    <div className="relative mx-auto w-[280px] rotate-[15deg]">
      {/* Clip/prendedor no topo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/home/cracha-clip.png"
        alt=""
        width={228}
        height={202}
        className="absolute -top-8 left-1/2 z-10 w-[140px] -translate-x-1/2"
      />
      {/* Base do crachá */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/home/cracha-exclude.svg"
        alt={alt}
        width={282}
        height={408}
        className="w-full"
      />
      {/* Furo decorativo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/home/cracha-buraco.svg"
        alt=""
        width={83}
        height={83}
        className="absolute left-[15%] top-[8%] w-[60px]"
      />
    </div>
  );
}

export function PhilosophySection({ dict }: { dict: Dictionary }) {
  const home = dict.home;
  return (
    <section className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-[1.3fr_1fr]">
      {/* Texto */}
      <div>
        <h2 className="font-display uppercase tracking-tight text-[color:var(--color-blue)] text-[2.5rem] md:text-[4rem] leading-none mb-4">
          {home.philosophy}
        </h2>
        <p className="font-bold text-[1.25rem] md:text-[1.5rem] leading-snug text-[color:var(--color-blue)] mb-4">
          {home.philosophyLead}
        </p>
        <p className="text-lg md:text-xl leading-relaxed text-[color:var(--color-blue)] mb-3">
          {home.philosophyBody1}
          <strong className="font-bold">{home.philosophyBody1Bold}</strong>
          {home.philosophyBody1End}
        </p>
        <p className="text-lg md:text-xl leading-relaxed text-[color:var(--color-blue)]">
          {home.philosophyBody2}
          <strong className="font-bold">{home.philosophyBody2Bold1}</strong>
          {home.philosophyBody2Mid}
          <strong className="font-bold">{home.philosophyBody2Bold2}</strong>
          {home.philosophyBody2Mid2}
          <strong className="font-bold">{home.philosophyBody2Bold3}</strong>
          {home.philosophyBody2End}
        </p>
      </div>

      {/* Crachá + ellipse decorativa */}
      <div className="relative">
        <DecorativeBlob
          variant={3}
          className="-left-16 -top-10 -z-10 hidden opacity-60 md:block"
          alt=""
        />
        <Cracha alt={home.crachaAlt} />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar lint e TypeScript**

```bash
pnpm lint
pnpm exec tsc --noEmit
```

Expected: exit code 0

- [ ] **Step 3: Commit**

```bash
git add components/home/PhilosophySection.tsx
git commit -m "feat(home): add PhilosophySection with badge illustration"
```

---

## Task 5: Criar componente `StudiesGallery`

**Files:**
- Create: `components/home/StudiesGallery.tsx`

**Interfaces:**
- Consumes: `dict: Dictionary`
- Produces: Galeria de estudos com grid assimétrico (2/3 imagens + 1/3 painel azul)

- [ ] **Step 1: Criar `components/home/StudiesGallery.tsx`**

Estrutura basada no Figma (node 751:1326, 751:1327, 751:1328):
- Grid: `md:grid-cols-[2fr_1fr]` — esquerda 2/3, direita 1/3
- **Esquerda (2/3):**
  - Imagem topo: `/images/home/estudos-coelhos.png` (735×490px, fundo rosa #f9cedc)
  - Imagem base: `/images/home/carreira-baleia.png` (869×588px)
  -Empilhadas verticalmente, cada uma ~50% da altura total
- **Direita (1/3):**
  - Fundo: `bg-[color:var(--color-blue)]` (#6f96ce)
  - Conteúdo: `/images/home/doodles-azul.svg` (576×1117px) — doodles brancos
  - A imagem ocupa a altura total da coluna
- **Altura total:** ~558px no Figma (proporcional: aspect ratio da área toda)
- **Mobile:** Empilhar: coelhos → baleia → painel azul (grid-cols-1)

```tsx
import type { Dictionary } from "@/i18n/dictionaries";

export function StudiesGallery({ dict }: { dict: Dictionary }) {
  const home = dict.home;
  return (
    <section className="grid grid-cols-1 md:grid-cols-[2fr_1fr]">
      {/* Coluna esquerda: duas imagens empilhadas */}
      <div className="flex flex-col">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/home/estudos-coelhos.png"
          alt={home.studiesAlt}
          width={735}
          height={490}
          className="h-auto w-full object-cover"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/home/carreira-baleia.png"
          alt={home.careerAlt}
          width={869}
          height={588}
          className="h-auto w-full object-cover"
        />
      </div>

      {/* Coluna direita: painel azul com doodles */}
      <div className="flex items-center justify-center bg-[color:var(--color-blue)] p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/home/doodles-azul.svg"
          alt={home.studiesDoodlesAlt}
          width={576}
          height={1117}
          className="h-auto w-full max-w-[300px]"
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar lint e TypeScript**

```bash
pnpm lint
pnpm exec tsc --noEmit
```

Expected: exit code 0

- [ ] **Step 3: Commit**

```bash
git add components/home/StudiesGallery.tsx
git commit -m "feat(home): add StudiesGallery with asymmetric grid layout"
```

---

## Task 6: Criar componente `ContactSection`

**Files:**
- Create: `components/home/ContactSection.tsx`

**Interfaces:**
- Consumes: `dict: Dictionary`
- Produces: Seção de contato com ilustração à esquerda e formulário à direita
- Usa: `ContactForm` existente (Client Component, sem props — usa `useTranslations()` internamente)

- [ ] **Step 1: Criar `components/home/ContactSection.tsx`**

Estrutura basada no Figma (node 751:1360, 750:1256, 750:1258, 750:1259):
- Grid 2 colunas: ilustração esquerda (~45%), texto + formulário direita (~55%)
- Ilustração: `/illustrations/contato.svg` (555×681px — Ágatha com envelope)
- Título: `home.contactTitle` (AM Novecento, azul, ~120px/72px → quebrar em linhas)
- Subtítulo: `home.contactSubtitle` (Clother Regular, 24px)
- Formulário: `<ContactForm />` (reutilizado, sem props)
- Decorativo: `DecorativeBlob variant={1}` atrás da ilustração (ciano grande) + `variant={4}` (rosa)

```tsx
import type { Dictionary } from "@/i18n/dictionaries";
import { ContactForm } from "@/components/contact/ContactForm";
import { DecorativeBlob } from "./DecorativeBlob";

export function ContactSection({ dict }: { dict: Dictionary }) {
  const home = dict.home;
  return (
    <section className="relative grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_1.2fr]">
      {/* Ilustração + ellipses decorativas */}
      <div className="relative mx-auto">
        <DecorativeBlob
          variant={1}
          className="-left-24 -top-20 -z-10 hidden opacity-50 md:block"
          alt=""
        />
        <DecorativeBlob
          variant={4}
          className="-bottom-16 -right-10 -z-10 hidden opacity-60 md:block"
          alt=""
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/contato.svg"
          alt={home.contactIllustrationAlt}
          width={555}
          height={681}
          className="w-full max-w-[380px]"
        />
      </div>

      {/* Texto + formulário */}
      <div>
        <h2 className="font-display uppercase tracking-tight text-[color:var(--color-blue)] text-[2.5rem] md:text-[3.5rem] leading-none mb-4">
          {home.contactTitle}
        </h2>
        <p className="font-normal text-[1.125rem] md:text-[1.5rem] text-[color:var(--color-blue)] mb-6 leading-relaxed">
          {home.contactSubtitle}
        </p>
        <ContactForm />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar lint e TypeScript**

```bash
pnpm lint
pnpm exec tsc --noEmit
```

Expected: exit code 0

- [ ] **Step 3: Commit**

```bash
git add components/home/ContactSection.tsx
git commit -m "feat(home): add ContactSection with illustration and form"
```

---

## Task 7: Reescrever `app/[lang]/page.tsx`

**Files:**
- Modify: `app/[lang]/page.tsx`

**Interfaces:**
- Consumes: `GreetingSection`, `PhilosophySection`, `StudiesGallery`, `ContactSection`, `BrandHero`
- Produces: Nova home page completa

- [ ] **Step 1: Reescrever `app/[lang]/page.tsx`**

Manter a estrutura de metadata existente e montar as novas seções:

```tsx
import { notFound } from "next/navigation";
import { BrandHero } from "@/components/layout/BrandHero";
import { GreetingSection } from "@/components/home/GreetingSection";
import { PhilosophySection } from "@/components/home/PhilosophySection";
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

      {/* Seção 1: Saudação */}
      <div className="container-narrow py-12 md:py-20">
        <GreetingSection dict={dict} />
      </div>

      {/* Seção 2: Filosofia */}
      <div className="container-narrow py-12 md:py-20">
        <PhilosophySection dict={dict} />
      </div>

      {/* Seção 3: Galeria de estudos (full-width, sem container) */}
      <StudiesGallery dict={dict} />

      {/* Seção 4: Contato */}
      <div className="container-narrow py-12 md:py-20">
        <ContactSection dict={dict} />
      </div>
    </>
  );
}
```

**Nota:** A galeria de estudos (`StudiesGallery`) é full-width (sem `container-narrow`) para ocupar a largura toda como no Figma. As outras seções usam o container centralizado.

- [ ] **Step 2: Verificar build, lint e TypeScript**

```bash
pnpm build
pnpm lint
pnpm exec tsc --noEmit
```

Expected: todos exit code 0

- [ ] **Step 3: Rodar quality gate 4 (conteúdo/páginas)**

```bash
./scripts/check-quality-gates.sh 4
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/\[lang\]/page.tsx
git commit -m "feat(home): rewrite home page with new Pontossemno design sections"
```

---

## Task 8: Verificação visual e ajustes finos

**Files:**
- Modify: componentes conforme necessário após verificação visual

- [ ] **Step 1: Iniciar dev server e verificar no navegador**

```bash
pnpm dev
```

Abrir `http://localhost:3000/pt-BR` e `http://localhost:3000/en` e verificar:
- [ ] Hero "Ágatha Sales" aparece corretamente
- [ ] Seção "Olá a todos," com ilustração à esquerda e `:D` acima do título
- [ ] Seção "Filosofia" com crachá rotacionado à direita
- [ ] Galeria de estudos: coelhos (topo), baleia (base), painel azul com doodles (direita)
- [ ] Seção "Vamos trabalhar juntos?" com ilustração e formulário funcional
- [ ] Footer "Visite também" aparece no final
- [ ] Ellipses decorativas visíveis nos lugares certos (apenas desktop)
- [ ] Versão EN mostra textos em inglês
- [ ] Mobile: tudo empilhado em coluna única, sem elementos decorativos

- [ ] **Step 2: Comparar com screenshot do Figma**

O screenshot está em: `/home/jvbarr/.claude/projects/-home-jvbarr-personal-portfolio-agatha/b64a9125-4303-46d8-8407-b524273dd6a2/tool-results/mcp-plugin_figma_figma-blob-1792548973197-3gjwjh.png`

Pontos de atenção:
- Proporções das ilustrações (não esticadas)
- Cores exatas (#6f96ce, #f9cedc, #bacceb, etc.)
- Espaçamento entre seções (py-12 md:py-20)
- Rotação do crachá (~15°)

- [ ] **Step 3: Ajustar espaçamentos/cores se necessário**

- [ ] **Step 4: Rodar quality gates finais**

```bash
./scripts/check-quality-gates.sh 3  # componentes
./scripts/check-quality-gates.sh 5  # runtime
./scripts/check-quality-gates.sh 6  # pre-merge
```

Expected: todos PASS

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "fix(home): visual adjustments after Figma comparison"
```

---

## Checklist de Verificação Final

- [ ] `pnpm build` limpo (valida paridade pt-BR ↔ en)
- [ ] `pnpm lint` limpo
- [ ] `pnpm exec tsc --noEmit` limpo
- [ ] `./scripts/check-quality-gates.sh 3` PASS (componentes)
- [ ] `./scripts/check-quality-gates.sh 4` PASS (conteúdo)
- [ ] `./scripts/check-quality-gates.sh 5` PASS (runtime)
- [ ] `./scripts/check-quality-gates.sh 6` PASS (pre-merge)
- [ ] Sem texto hardcoded nos novos componentes
- [ ] Todas as imagens têm `alt` traduzido
- [ ] Formulário de contato funciona igual à versão atual
- [ ] Assets todos presentes em `public/` (sem URLs temporárias do Figma)
- [ ] Responsivo: desktop grid 2 colunas, mobile coluna única
- [ ] Ellipses decorativas só aparecem em desktop (`hidden md:block`)
- [ ] Spec documentada em `docs/superpowers/specs/2026-10-20-new-home-design.md`
- [ ] Plano documentado em `docs/superpowers/plans/2026-10-20-new-home-implementation.md`
