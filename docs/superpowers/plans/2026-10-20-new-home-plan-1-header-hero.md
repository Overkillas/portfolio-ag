# Plan 1/6: Header + Hero Band — Nova Home "Pontossemno"

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever o Header e ajustar o Hero Band para corresponder exatamente ao Figma (nav bar 102px cream com apenas "about"/"projects", hero 252px com gradiente -62.1°).

**Architecture:** Header vira um componente simples (não mais sticky/blur com category tabs). Hero mantem a abordagem SVG getBBox mas com altura e gradiente ajustados. Adicionar novas chaves de dicionário para os novos labels de navegação.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, i18n (pt-BR/en com `satisfies Record<Locale, Dictionary>`)

**Spec:** `docs/superpowers/specs/2026-10-20-new-home-design-v2.md` (seções 4.1, 4.2, 6)

## Global Constraints

- **i18n obrigatório (AGENTS.md):** Toda string user-visible vai para `dictionaries/pt-BR.json` E `dictionaries/en.json` na mesma mudança. Type safety quebra o build se faltar chave.
- **Sem texto hardcoded:** Zero exceções.
- **Links:** Sempre `/${locale}`-prefixados at render time. `lib/site.ts` mantem hrefs locale-less.
- **Server Components:** recebem `dict` como prop. Client Components usam `useTranslations()`.
- **Acessibilidade:** aria-labels traduzidos.
- **Verificação obrigatória antes de cada commit:** `pnpm build`, `pnpm lint`, `pnpm exec tsc --noEmit`
- **NÃO mexer em:** `ContactForm.tsx`, outras páginas que não a home, `proxy.ts`, config de i18n.
- **Branch:** `feature/new-home`
- **Commit attribution:** `Co-Authored-By: Claude Code <noreply@anthropic.com>`

## Review Focus

1. **Header visual:** Ao abrir a home em 1728px, o header deve ter exatamente 102px de altura, fundo cream sólido, apenas 2 links de texto + LanguageSwitcher.
2. **Hero proporción:** A banda deve ter 252px de altura em 1728px (14.58vw), não 290px.
3. **Gradiente:** O ângulo visual deve corresponder a -62.1° (mais horizontal que o -70.88° atual).
4. **LanguageSwitcher:** Deve continuar funcionando (trocar de idioma deve redirecionar corretamente).
5. **Outras páginas:** O Header é usado em outras páginas também — verificar se a mudança quebra `/contato`, `/grafico`, etc. Se o novo design do Header só serve para a home, considerar criar um `HomeHeader` separado ou passar uma prop.

---

## Task 1: Adicionar chaves de dicionário para novo Header

**Files:**
- Modify: `dictionaries/pt-BR.json`
- Modify: `dictionaries/en.json`

**Interfaces:**
- Produces: Novas chaves `nav.about`, `nav.projects` disponíveis via `dict.nav.about` e `dict.nav.projects`

- [ ] **Step 1: Ler os dicionários atuais**

```bash
cat dictionaries/pt-BR.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(json.dumps(d.get('nav', {}), indent=2, ensure_ascii=False))"
cat dictionaries/en.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(json.dumps(d.get('nav', {}), indent=2, ensure_ascii=False))"
```

- [ ] **Step 2: Adicionar novas chaves em pt-BR.json**

Adicionar dentro da seção `"nav"` existente (ou criar se não existir):

```json
{
  "nav": {
    "about": "sobre",
    "projects": "projetos",
    "switchLocale": "...",  // manter existente
    // ... outras chaves existentes
  }
}
```

> **Nota:** O Figma mostra "About" e "Projects" em lowercase. Em pt-BR usar "sobre" e "projetos" (serão renderizados em lowercase via CSS `lowercase`).

- [ ] **Step 3: Adicionar as mesmas chaves em en.json**

```json
{
  "nav": {
    "about": "about",
    "projects": "projects",
    // ...
  }
}
```

- [ ] **Step 4: Verificar build (paridade pt-BR ↔ en)**

```bash
pnpm build
```

Expected: Build passa sem erros de tipo (se falhar, falta chave em um dos dicionários).

- [ ] **Step 5: Commit**

```bash
git add dictionaries/pt-BR.json dictionaries/en.json
git commit -m "feat(i18n): add nav.about and nav.projects keys for new home header

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 2: Criar novo componente HomeHeader

**Files:**
- Create: `components/layout/HomeHeader.tsx`

**Interfaces:**
- Consumes: `locale: Locale`, `dict: Dictionary` (props, padrão Server Component)
- Produces: Componente `HomeHeader` que renderiza nav bar estilo Figma (102px, cream, 2 links + LanguageSwitcher)
- Reusa: `LanguageSwitcher` de `./LanguageSwitcher`

- [ ] **Step 1: Ler o LanguageSwitcher atual**

```bash
cat components/layout/LanguageSwitcher.tsx
```

Entender a interface: recebe `currentLocale` e `dict`?

- [ ] **Step 2: Ler o Header atual para referência**

```bash
cat components/layout/Header.tsx
```

- [ ] **Step 3: Criar HomeHeader.tsx**

```tsx
// components/layout/HomeHeader.tsx
import Link from "next/link";
import type { Dictionary, Locale } from "@/i18n/dictionaries";
import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * Header específico da home page — fiel ao Figma Pontossemno:
 * - 102px de altura, fundo cream sólido (#F9F3EA)
 * - Apenas 2 links: "sobre" (esquerda) e "projetos" (direita)
 * - AM Novecento 32px, cor #BACCEB, lowercase
 * - LanguageSwitcher no centro
 * - Padding horizontal de 120px (x=120 no Figma)
 */
export function HomeHeader({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <header className="h-[102px] w-full bg-[color:var(--color-cream)]">
      <div className="flex h-full items-center justify-between px-[120px]">
        {/* Esquerda: "sobre" (about) */}
        <Link
          href={`/${locale}`}
          className="font-display text-[32px] lowercase text-[color:var(--color-blue-soft)] transition-opacity hover:opacity-70"
        >
          {dict.nav.about}
        </Link>

        {/* Centro: LanguageSwitcher */}
        <LanguageSwitcher currentLocale={locale} dict={dict} />

        {/* Direita: "projetos" (projects) */}
        <Link
          href={`/${locale}/projetos`}
          className="font-display text-[32px] lowercase text-[color:var(--color-blue-soft)] transition-opacity hover:opacity-70"
        >
          {dict.nav.projects}
        </Link>
      </div>
    </header>
  );
}
```

> **Nota importante:** Verificar se `/projetos` é uma rota válida. Se não existir, usar a rota de projetos existente ou criar um link para a section de projetos da home (anchor link `#projetos`).

- [ ] **Step 4: Verificar lint e tsc**

```bash
pnpm lint
pnpm exec tsc --noEmit
```

Expected: Sem erros.

- [ ] **Step 5: Commit**

```bash
git add components/layout/HomeHeader.tsx
git commit -m "feat(home): add HomeHeader component matching Figma nav bar

- 102px cream bar with only about/projects links
- AM Novecento 32px #BACCEB lowercase
- LanguageSwitcher in center
- 120px horizontal padding

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 3: Ajustar BrandHero para o novo design

**Files:**
- Modify: `components/layout/BrandHero.tsx`
- Modify: `app/[lang]/globals.css` (adicionar novo token de gradiente)

**Interfaces:**
- Consumes: `title: string` (prop existente)
- Produces: Hero band com 252px (14.58vw) e gradiente -62.1°

- [ ] **Step 1: Adicionar novo token de gradiente no globals.css**

Em `app/[lang]/globals.css`, dentro de `@theme inline`:

```css
@theme inline {
  /* ... tokens existentes ... */
  --gradient-hero: linear-gradient(-62.1deg, #bacceb 3.48%, #6f96ce 49.07%, #08488f 101.62%);
}
```

E criar uma utility class:

```css
.bg-hero {
  background: var(--gradient-hero);
  position: relative;
}

.bg-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("/images/band-noise.png");
  background-size: 180px 180px;
  mix-blend-mode: overlay;
  pointer-events: none;
}
```

- [ ] **Step 2: Ajustar BrandHero.tsx**

Mudar a altura e o background:

```tsx
// Mudar de:
<div className="bg-band relative w-full overflow-hidden h-[clamp(168px,17.5vw,290px)]">

// Para:
<div className="bg-hero relative w-full overflow-hidden h-[14.58vw] min-h-[168px]">
```

> **Nota:** Se o BrandHero é usado em outras páginas, considerar adicionar uma prop `variant?: "default" | "home"` ou criar um `HomeHero` separado. Verificar onde BrandHero é usado:

```bash
grep -r "BrandHero" app/ components/ --include="*.tsx"
```

- [ ] **Step 3: Verificar visualmente**

```bash
pnpm dev
```

Abrir http://localhost:3000/pt-BR e verificar:
- Hero tem ~252px de altura em 1728px de largura
- Gradiente parece mais horizontal (-62.1°)
- Título "Ágatha sales" continua preenchendo a largura corretamente

- [ ] **Step 4: Verificar build, lint, tsc**

```bash
pnpm build && pnpm lint && pnpm exec tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add components/layout/BrandHero.tsx app/[lang]/globals.css
git commit -m "fix(home): adjust BrandHero height to 14.58vw and gradient to -62.1deg

Matches Figma Pontossemno hero band (252px @1728, gradient -62.1°).

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 4: Integrar HomeHeader na home page

**Files:**
- Modify: `app/[lang]/layout.tsx` (se Header é injetado no layout)
- OU Modify: `app/[lang]/page.tsx` (se Header é usado diretamente na página)

**Interfaces:**
- Consumes: `HomeHeader` do Task 2
- Produces: Home page usando `HomeHeader` em vez de `Header`

- [ ] **Step 1: Verificar onde o Header é usado**

```bash
grep -r "Header" app/[lang]/layout.tsx app/[lang]/page.tsx
```

- [ ] **Step 2a: Se Header está no layout (comum em Next.js)**

Opção A: Criar um layout específico para a home, ou
Opção B: Passar uma prop `variant` para o Header, ou
Opção C: **Recomendada** — Remover Header do layout e colocar HomeHeader diretamente em `page.tsx`, e adicionar o Header antigo nas outras páginas.

Verificar `app/[lang]/layout.tsx`:

```tsx
// Se tiver algo como:
<Header locale={lang} dict={dict} />

// Mudar para passar uma prop ou usar condicional baseado na rota
```

**Opção recomendada (mais simples):**

Em `app/[lang]/layout.tsx`, manter o Header antigo para todas as páginas EXCETO a home. Ou melhor: remover o Header do layout e cada página adiciona seu próprio header.

Mas para minimizar mudanças: adicionar uma verificação no layout:

```tsx
// app/[lang]/layout.tsx
// Se estiver na home (/ ou /pt-BR ou /en), usar HomeHeader
// Se não, usar Header antigo
```

- [ ] **Step 2b: Implementar a lógica**

A approach mais limpa: **remover Header do layout** e adicionar em cada página individualmente. Mas isso é uma mudança grande.

Approach mínima: Em `app/[lang]/layout.tsx`:

```tsx
import { Header } from "@/components/layout/Header";
import { HomeHeader } from "@/components/layout/HomeHeader";
import { headers } from "next/headers";

// ... no body:
const headersList = await headers();
const pathname = headersList.get("x-pathname") || "";
const isHome = /^\/(pt-BR|en)\/?$/.test(pathname);

{isHome ? (
  <HomeHeader locale={lang} dict={dict} />
) : (
  <Header locale={lang} dict={dict} />
)}
```

> **Nota:** `x-pathname` pode não estar disponível. Alternativa: usar `usePathname()` em um client component wrapper, ou passar uma prop do page para o layout (não é possível diretamente no App Router).

**Approach mais simples e recomendada:**

Mover o `<Header />` do layout para as páginas individuais que precisam dele (contato, grafico, etc.), e colocar `<HomeHeader />` apenas na home. Mas isso é muito trabalho para este plan.

**Approach final (mínima mudança):**

Em `app/[lang]/layout.tsx`, usar um Client Component wrapper que detecta a rota:

Criar `components/layout/HeaderRouter.tsx`:

```tsx
"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { HomeHeader } from "./HomeHeader";
import type { Dictionary, Locale } from "@/i18n/dictionaries";

export function HeaderRouter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  // Home: /pt-BR or /en (exactly)
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  
  return isHome ? (
    <HomeHeader locale={locale} dict={dict} />
  ) : (
    <Header locale={locale} dict={dict} />
  );
}
```

E no layout:

```tsx
<HeaderRouter locale={lang} dict={dict} />
```

- [ ] **Step 3: Verificar que outras páginas continuam funcionando**

```bash
pnpm dev
```

Testar:
- http://localhost:3000/pt-BR → deve mostrar HomeHeader (novo)
- http://localhost:3000/pt-BR/contato → deve mostrar Header antigo
- http://localhost:3000/en → deve mostrar HomeHeader (novo)

- [ ] **Step 4: Verificar build, lint, tsc**

```bash
pnpm build && pnpm lint && pnpm exec tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add app/[lang]/layout.tsx components/layout/HeaderRouter.tsx components/layout/HomeHeader.tsx
git commit -m "feat(home): integrate HomeHeader on home page via HeaderRouter

- Home page uses new HomeHeader (Figma style)
- Other pages keep old Header
- HeaderRouter detects route and switches

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 5: Verificação visual final do Plan 1

**Files:** (nenhum — verificação apenas)

- [ ] **Step 1: Build de produção**

```bash
pnpm build
```

- [ ] **Step 2: Lint e tsc**

```bash
pnpm lint && pnpm exec tsc --noEmit
```

- [ ] **Step 3: Quality gates**

```bash
./scripts/check-quality-gates.sh 3
./scripts/check-quality-gates.sh 4
./scripts/check-quality-gates.sh 5
```

- [ ] **Step 4: Verificação visual manual**

Abrir http://localhost:3000/pt-BR em 1728px de largura e verificar:

| Check | Esperado |
|-------|---------|
| Header altura | 102px exatos |
| Header fundo | Cream sólido (#F9F3EA), sem blur |
| Header links | Apenas "sobre" (esquerda) e "projetos" (direita) |
| Header fonte | AM Novecento 32px #BACCEB lowercase |
| LanguageSwitcher | Presente no centro, funcionando |
| Hero altura | 252px (14.58vw) |
| Hero gradiente | Ângulo -62.1° (mais horizontal que antes) |
| Hero título | "Ágatha sales" preenchendo largura, cream |
| Outras páginas | Header antigo continua funcionando |

- [ ] **Step 5: Commit final do Plan 1**

```bash
git add -A
git commit -m "docs(home): plan 1 complete — header and hero match Figma

Quality gates: 3 ✓, 4 ✓, 5 ✓
Visual verification: header 102px cream, hero 252px -62.1° gradient

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Plan 1 Complete

**Próximo plan:** `2026-10-20-new-home-plan-2-greeting.md` (Greeting Section + :d gigante)

**Checklist de entrega:**
- [ ] Header reescrito (102px, cream, 2 links + LanguageSwitcher)
- [ ] Hero ajustado (252px, gradiente -62.1°)
- [ ] Chaves de dicionário adicionadas (nav.about, nav.projects)
- [ ] Outras páginas não quebradas
- [ ] Build + lint + tsc + quality gates passando
- [ ] Verificação visual manual concluída
