# Internacionalização (i18n) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add type-safe internationalization (pt-BR + en) to the portfolio using Next.js 16 native `app/[lang]/` routing with `proxy.ts` for locale detection and redirects.

**Architecture:** Move all routes under `app/[lang]/`, create type-safe JSON dictionaries (`typeof ptBR` as source of truth), add `proxy.ts` at project root for locale detection (cookie > Accept-Language > default), and create a `LanguageSwitcher` client component in the header. Server Components use `getDictionary(lang)` directly; Client Components use `I18nProvider` context + `useTranslations()` hook.

**Tech Stack:** Next.js 16.2.6 (App Router) + TypeScript + React 19 + Tailwind CSS v4

**Spec:** `docs/superpowers/specs/2026-10-19-i18n-design.md`
**Quality Gates:** `docs/superpowers/quality-gates/2026-10-19-i18n-quality-gates.md`

## Quality Gates

**MANDATORY:** Each gate must PASS before proceeding to the next task group. Evidence required.

| Gate | After Tasks | Purpose | Doc Reference |
|------|-------------|---------|---------------|
| **Gate 0** | Before Task 1 | Baseline: clean tree, build passes | `docs/superpowers/quality-gates/2026-10-19-i18n-quality-gates.md#gate-0` |
| **Gate 1** | Tasks 1-4 | Infrastructure: type-safety works | `#gate-1` |
| **Gate 2** | Task 5 | Routes: 18 locale-prefixed routes generated | `#gate-2` |
| **Gate 3** | Tasks 6-13 | Components: no hardcoded strings | `#gate-3` |
| **Gate 4** | Task 14 | Pages: all handle locale correctly | `#gate-4` |
| **Gate 5** | Task 16 | Runtime: end-to-end verification | `#gate-5` |
| **Gate 6** | Before PR | Security + final quality | `#gate-6` |

**Iron Law:** No completion claims without fresh verification evidence. Run the gate commands, read the output, then report.

---

## Global Constraints

- **Locales:** `pt-BR` (default) and `en` only — adding more requires updating `i18n/config.ts` and creating new JSON files
- **URL structure:** All routes MUST be prefixed with locale (`/pt-BR/...`, `/en/...`)
- **Type-safety:** `dictionaries/pt-BR.json` is the source of truth; `en.json` MUST match its structure exactly (validated at build time via `typeof`)
- **No new dependencies:** Use only Next.js built-in features (no next-intl, no i18n libraries)
- **Preserve content:** All existing text must be migrated to dictionaries without loss — mark incomplete translations with `(PLACEHOLDER)` suffix as the spec requires
- **Git history:** Use `git mv` when moving files from `app/` to `app/[lang]/` to preserve history
- **Cookie name:** `NEXT_LOCALE` with 1-year max-age, `SameSite=Lax`, `path=/`
- **Styling:** LanguageSwitcher uses existing design tokens (`--color-blue`, `--color-blue-soft`, `--color-cream`)
- **Next.js 16 specifics:** `proxy.ts` replaces `middleware.ts` (function named `proxy`, not `middleware`); `params` is a Promise in layouts/pages (must be awaited)

## Review Focus

1. **Locale detection edge cases** — proxy.ts must handle: no cookie + no Accept-Language header (fallback to `pt-BR`), invalid cookie value (fallback to detection), and paths with file extensions (skip redirect)
2. **Type-safety validation** — removing a key from `en.json` must fail `pnpm build`; verify this works before marking Task 2 complete
3. **Client/Server Component boundary** — `ContactForm` is a Client Component and needs translations via context, not direct dictionary access; verify the provider wraps the entire app
4. **URL construction** — all `Link` components must prefix hrefs with `/${locale}`; missing prefix breaks navigation between locales
5. **Static generation** — `generateStaticParams` in root layout must generate routes for both locales; verify `/pt-BR/` and `/en/` both resolve after build

---

## Task 1: Create i18n Configuration and Dictionary Infrastructure

**Files:**
- Create: `i18n/config.ts`
- Create: `i18n/dictionaries.ts`
- Create: `dictionaries/pt-BR.json`
- Create: `dictionaries/en.json`

**Interfaces:**
- Produces: `Locale` type, `locales` array, `defaultLocale`, `getDictionary(locale)`, `isLocale(lang)` — consumed by all subsequent tasks
- `Dictionary` type is `typeof ptBR` — every other JSON must match this structure

- [ ] **Step 1: Create `i18n/config.ts`**

```ts
export const locales = ['pt-BR', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'pt-BR';

export const localeNames: Record<Locale, string> = {
  'pt-BR': 'PT',
  en: 'EN',
};
```

- [ ] **Step 2: Create `dictionaries/pt-BR.json` with ALL existing content**

Extract every translatable string from the codebase. Required structure (see spec section 5 for full content):

```json
{
  "site": { "name": "Ágatha Sales", "tagline": "..." },
  "nav": { "about": "Sobre mim", "contact": "Solicitar serviços", "grafico": "Gráfico", "interacao": "Interação", "servicos": "Serviços", "3d": "3D" },
  "home": {
    "greeting": "Olá a todos,",
    "greetingAlt": "Ilustração da Ágatha acenando",
    "intro": "Não sou boa com textinhos...",
    "philosophy": "Filosofia",
    "philosophyAlt": "Ilustração da Ágatha pensando",
    "philosophyLead": "Para mim o design é pesquisa...",
    "philosophyBody1": "Acredito que o design é a manipulação intencional da ",
    "philosophyBody1Bold": "experiência humana",
    "philosophyBody1End": ": uma ferramenta capaz...",
    "philosophyBody2": "Nesse contexto, encaro o ",
    "philosophyBody2Bold1": "3D",
    "philosophyBody2Mid": ", o ",
    "philosophyBody2Bold2": "design de interfaces",
    "philosophyBody2Mid2": " e a ",
    "philosophyBody2Bold3": "pesquisa",
    "philosophyBody2End": " como extensões...",
    "experience": "Experiência",
    "experienceAlt": "Ilustração da Ágatha sentada",
    "experienceLead": "O futuro está na atividade humana...",
    "experienceBody": "Fico contente em lhe receber...",
    "experienceBodyBold": "currículo",
    "experienceBodyMid": " ou perfil do ",
    "experienceBodyLink": "LinkedIn",
    "experienceBodyEnd": "."
  },
  "contact": { /* title, subtitle, form placeholders, errors — see spec */ },
  "categories": { "grafico": { "title": "Design Gráfico", "heroTitle": "Design Gráfico" }, /* ... */ },
  "projects": {
    "seeMore": "Ver mais.",
    "comingSoon": "Em breve",
    "comingSoonTag": "Novo projeto a caminho",
    "coverAlt": "Capa do projeto {title}",
    "pontosSemNo": { /* full project content — see spec section 5 */ },
    "batucoTuco": { /* ... */ },
    "pontinhasSoltas": { /* ... */ }
  },
  "status": { "concluido": "Concluído", "emProgresso": "Em progresso", "emBreve": "Em breve" },
  "footer": { "social": "Redes sociais" },
  "metadata": { "home": "Ágatha Sales", "contato": "Vamos trabalhar juntos?", /* ... */ }
}
```

**Action:** Read these source files and extract ALL strings:
- `app/page.tsx` (home content)
- `app/contato/page.tsx` (contact title/subtitle)
- `app/grafico/page.tsx`, `app/interacao/page.tsx`, `app/servicos/page.tsx`, `app/3d/page.tsx` (category titles)
- `app/projetos/*/page.tsx` (project content, tabs, captions, image alts)
- `components/contact/ContactForm.tsx` (placeholders, error messages)
- `components/layout/Header.tsx` (nav labels from `lib/site.ts`)
- `components/layout/Footer.tsx` ("Redes sociais")
- `components/home/ProjectCard.tsx` ("Ver mais.", "Em breve", "Novo projeto a caminho")
- `components/case-study/CaseShell.tsx` (status labels, "Obrigada por ter chegado até aqui!")
- `content/projects.ts` (project titles, subtitles, descriptions, intros, tags)

- [ ] **Step 3: Create `dictionaries/en.json` with English translations**

Mirror the EXACT structure of `pt-BR.json`. Translate all values to English. For project content that is incomplete in Portuguese (marked with `(PLACEHOLDER)`), translate the complete part and keep `(PLACEHOLDER)` suffix.

Example:
```json
{
  "site": { "name": "Ágatha Sales", "tagline": "Graphic design, UX/UI, 3D and service design." },
  "nav": { "about": "About me", "contact": "Hire me", "grafico": "Graphic", "interacao": "Interaction", "servicos": "Services", "3d": "3D" }
}
```

- [ ] **Step 4: Create `i18n/dictionaries.ts` with type-safe loader**

```ts
import 'server-only';
import type { Locale } from './config';
import ptBR from '@/dictionaries/pt-BR.json';

export type Dictionary = typeof ptBR;

const dictionaries = {
  'pt-BR': () => import('@/dictionaries/pt-BR.json').then((m) => m.default as Dictionary),
  en: () => import('@/dictionaries/en.json').then((m) => m.default as Dictionary),
} satisfies Record<Locale, () => Promise<Dictionary>>;

export type { Locale };
export const isLocale = (lang: string): lang is Locale =>
  lang === 'pt-BR' || lang === 'en';

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();
```

- [ ] **Step 5: Verify type-safety works**

Temporarily remove one key from `en.json` (e.g., delete `"site"` object), run `pnpm build`, confirm it fails with a TypeScript error. Restore the key.

- [ ] **Step 6: Commit**

```bash
git add i18n/ dictionaries/
git commit -m "feat: add i18n config and type-safe dictionaries (pt-BR, en)"
```

---

## Task 2: Create Client-Side i18n Provider and Hooks

**Files:**
- Create: `lib/i18n/provider.tsx`
- Create: `lib/i18n/use-translation.ts`

**Interfaces:**
- Consumes: `Dictionary`, `Locale` from `i18n/dictionaries.ts`
- Produces: `I18nProvider` component, `useI18n()` hook, `useTranslations()` hook, `createTranslator()` helper, `TranslationKey` type

- [ ] **Step 1: Create `lib/i18n/provider.tsx`**

```tsx
'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Dictionary, Locale } from '@/i18n/dictionaries';

type I18nContextValue = {
  dict: Dictionary;
  locale: Locale;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  dict,
  locale,
  children,
}: {
  dict: Dictionary;
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ dict, locale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
```

- [ ] **Step 2: Create `lib/i18n/use-translation.ts`**

```ts
'use client';

import { useI18n } from './provider';
import type { Dictionary } from '@/i18n/dictionaries';

type Path<T, P extends string = ''> = T extends string
  ? P
  : T extends object
    ? { [K in keyof T & string]: Path<T[K], P extends '' ? K : `${P}.${K}`> }[keyof T & string]
    : never;

export type TranslationKey = Path<Dictionary>;

export function useTranslations() {
  const { dict, locale } = useI18n();

  const t = (key: TranslationKey): string => {
    const value = key.split('.').reduce<unknown>((obj, k) => {
      if (obj && typeof obj === 'object' && k in obj) {
        return (obj as Record<string, unknown>)[k];
      }
      return undefined;
    }, dict);

    if (typeof value !== 'string') {
      console.warn(`Missing translation: ${key} (locale: ${locale})`);
      return key;
    }
    return value;
  };

  return { t, locale, dict };
}

export function createTranslator(dict: Dictionary, locale: string) {
  return (key: TranslationKey): string => {
    const value = key.split('.').reduce<unknown>((obj, k) => {
      if (obj && typeof obj === 'object' && k in obj) {
        return (obj as Record<string, unknown>)[k];
      }
      return undefined;
    }, dict);

    if (typeof value !== 'string') {
      console.warn(`Missing translation: ${key} (locale: ${locale})`);
      return key;
    }
    return value;
  };
}
```

- [ ] **Step 3: Verify imports compile**

Run `pnpm build` — expect success (no consumers yet, but validates the files compile).

- [ ] **Step 4: Commit**

```bash
git add lib/i18n/
git commit -m "feat: add I18nProvider and useTranslations hook for client components"
```

---

## Task 3: Create proxy.ts for Locale Detection and Redirects

**Files:**
- Create: `proxy.ts` (project root)

**Interfaces:**
- Consumes: `locales`, `defaultLocale`, `Locale` from `i18n/config.ts`
- Produces: HTTP redirects from `/path` to `/pt-BR/path` or `/en/path`

- [ ] **Step 1: Create `proxy.ts` at project root**

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, type Locale } from './i18n/config';

const PUBLIC_FILE = /\.(.*)$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, _next internals, and files with extensions
  if (pathname.startsWith('/_next') || PUBLIC_FILE.test(pathname)) {
    return;
  }

  // Already has locale prefix? Let it through
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  if (pathnameHasLocale) return;

  // Detect locale: cookie > Accept-Language > default
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const acceptLang = request.headers.get('accept-language') ?? '';

  let locale: Locale = defaultLocale;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    locale = cookieLocale as Locale;
  } else if (acceptLang.toLowerCase().includes('en')) {
    locale = 'en';
  }

  // Redirect: /contato → /pt-BR/contato
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

- [ ] **Step 2: Verify matcher excludes static assets**

The matcher `'/((?!api|_next/static|_next/image|favicon.ico).*)'` must exclude:
- API routes (`/api/*`)
- Static files (`/_next/static/*`)
- Image optimization (`/_next/image/*`)
- Favicon and other public files with extensions (handled by `PUBLIC_FILE` regex)

- [ ] **Step 3: Commit**

```bash
git add proxy.ts
git commit -m "feat: add proxy.ts for locale detection and redirects"
```

---

## Task 4: Create LanguageSwitcher Component

**Files:**
- Create: `components/layout/LanguageSwitcher.tsx`

**Interfaces:**
- Consumes: `locales`, `localeNames`, `Locale` from `i18n/config.ts`
- Props: `{ currentLocale: Locale }`

- [ ] **Step 1: Create `components/layout/LanguageSwitcher.tsx`**

```tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { locales, localeNames, type Locale } from '@/i18n/config';

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: Locale) => {
    // Persist preference (1 year)
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // Swap locale prefix: /pt-BR/contato → /en/contato
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');

    router.push(newPath);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1 rounded-full bg-[color:var(--color-blue-soft)]/30 p-1">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          aria-label={`Switch to ${localeNames[locale]}`}
          aria-pressed={locale === currentLocale}
          className={`rounded-full px-3 py-1 text-sm transition-all ${
            locale === currentLocale
              ? 'bg-[color:var(--color-blue)] text-[color:var(--color-cream)] font-bold'
              : 'text-[color:var(--color-blue)] hover:bg-[color:var(--color-blue-soft)]/50 font-normal'
          }`}
        >
          {localeNames[locale]}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/LanguageSwitcher.tsx
git commit -m "feat: add LanguageSwitcher component (PT | EN toggle)"
```

---

## Task 5: Move All Routes to app/[lang]/ and Update Root Layout

**Files:**
- Move: `app/layout.tsx` → `app/[lang]/layout.tsx` (via `git mv`)
- Move: `app/page.tsx` → `app/[lang]/page.tsx`
- Move: `app/globals.css` → `app/[lang]/globals.css`
- Move: `app/favicon.ico` → `app/[lang]/favicon.ico`
- Move: `app/contato/page.tsx` → `app/[lang]/contato/page.tsx`
- Move: `app/grafico/page.tsx` → `app/[lang]/grafico/page.tsx`
- Move: `app/interacao/page.tsx` → `app/[lang]/interacao/page.tsx`
- Move: `app/servicos/page.tsx` → `app/[lang]/servicos/page.tsx`
- Move: `app/3d/page.tsx` → `app/[lang]/3d/page.tsx`
- Move: `app/projetos/pontos-sem-no/page.tsx` → `app/[lang]/projetos/pontos-sem-no/page.tsx`
- Move: `app/projetos/batuco-tuco/page.tsx` → `app/[lang]/projetos/batuco-tuco/page.tsx`
- Move: `app/projetos/pontinhas-soltas/page.tsx` → `app/[lang]/projetos/pontinhas-soltas/page.tsx`
- Modify: `app/[lang]/layout.tsx`

**Interfaces:**
- Consumes: `getDictionary`, `isLocale`, `Locale` from `i18n/dictionaries.ts`; `locales` from `i18n/config.ts`; `I18nProvider` from `lib/i18n/provider.tsx`
- Produces: Root layout that validates locale, loads dictionary, wraps app in `I18nProvider`

- [ ] **Step 1: Create `app/[lang]/` directory and move files using git mv**

```bash
mkdir -p app/\[lang\]
git mv app/layout.tsx app/\[lang\]/layout.tsx
git mv app/page.tsx app/\[lang\]/page.tsx
git mv app/globals.css app/\[lang\]/globals.css
git mv app/favicon.ico app/\[lang\]/favicon.ico
git mv app/contato app/\[lang\]/contato
git mv app/grafico app/\[lang\]/grafico
git mv app/interacao app/\[lang\]/interacao
git mv app/servicos app/\[lang\]/servicos
git mv app/3d app/\[lang\]/3d
git mv app/projetos app/\[lang\]/projetos
```

- [ ] **Step 2: Rewrite `app/[lang]/layout.tsx`**

The new root layout must:
1. Accept `params: Promise<{ lang: string }>` (Next.js 16 — params is a Promise)
2. Validate locale with `isLocale(lang)` → `notFound()` if invalid
3. Load dictionary with `getDictionary(lang)`
4. Set `<html lang={lang}>`
5. Wrap children in `<I18nProvider dict={dict} locale={lang}>`
6. Include `generateStaticParams()` returning both locales
7. Include `generateMetadata()` with locale-aware title/description and `alternates.languages`

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary, isLocale } from '@/i18n/dictionaries';
import { locales } from '@/i18n/config';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { I18nProvider } from '@/lib/i18n/provider';
import './globals.css';

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const dict = await getDictionary(lang);

  return {
    title: {
      default: dict.site.name,
      template: `%s · ${dict.site.name}`,
    },
    description: dict.site.tagline,
    openGraph: {
      title: dict.site.name,
      description: dict.site.tagline,
      locale: lang === 'pt-BR' ? 'pt_BR' : 'en_US',
      type: 'website',
    },
    alternates: {
      languages: {
        'pt-BR': '/pt-BR',
        en: '/en',
      },
    },
  };
}

const TYPEKIT_ID = process.env.NEXT_PUBLIC_TYPEKIT_ID;

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <html lang={lang} className="h-full" suppressHydrationWarning>
      <head>
        {TYPEKIT_ID ? (
          <>
            <link rel="preconnect" href="https://use.typekit.net" />
            <link
              rel="stylesheet"
              href={`https://use.typekit.net/${TYPEKIT_ID}.css`}
            />
          </>
        ) : null}
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <I18nProvider dict={dict} locale={lang}>
          <Header locale={lang} dict={dict} />
          <main className="flex-1">{children}</main>
          <Footer dict={dict} />
        </I18nProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Run `pnpm build` to verify structure**

Expected: Build may fail because pages still reference old imports — that's OK for now. Fix imports in subsequent tasks.

- [ ] **Step 4: Commit**

```bash
git add app/
git commit -m "refactor: move all routes to app/[lang]/ and add locale-aware root layout"
```

---

## Task 6: Refactor lib/site.ts — Remove Hardcoded Labels

**Files:**
- Modify: `lib/site.ts`

**Interfaces:**
- Consumes: nothing (pure data)
- Produces: `CategoryKey` type, `navLinks` (keys only, no labels), `categoryTabs` (keys + hrefs), `site` (social links only)

- [ ] **Step 1: Rewrite `lib/site.ts`**

Remove `label` fields from `navLinks` and `categoryTabs`. Labels now come from the dictionary via keys.

```ts
export type CategoryKey = 'grafico' | 'interacao' | 'servicos' | '3d';

// Keys only — labels come from dictionary (dict.nav.*)
export const navLinks = [
  { key: 'about', href: '/' },
  { key: 'contact', href: '/contato' },
] as const;

export const categoryTabs = [
  { key: 'grafico', href: '/grafico' },
  { key: 'interacao', href: '/interacao' },
  { key: 'servicos', href: '/servicos' },
  { key: '3d', href: '/3d' },
] as const;

// Non-translatable site data
export const site = {
  email: 'agatha@example.com',
  social: {
    instagram: { handle: '@aggy_colon', url: 'https://instagram.com/aggy_colon' },
    linkedin: { handle: 'Ágatha Ferreira', url: 'https://www.linkedin.com/in/agatha-ferreira-sales' },
  },
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add lib/site.ts
git commit -m "refactor: remove hardcoded labels from lib/site.ts (now in dictionary)"
```

---

## Task 7: Create lib/projects.ts — Localized Project Helpers

**Files:**
- Create: `lib/projects.ts`
- Delete: `content/projects.ts` (after migration)

**Interfaces:**
- Consumes: `Dictionary` from `i18n/dictionaries.ts`, `CategoryKey` from `lib/site.ts`
- Produces: `ProjectMeta` type, `LocalizedProject` type, `getLocalizedProject(slug, dict)`, `getLocalizedProjectsByCategory(category, dict)`, `projectsByCategory`

- [ ] **Step 1: Create `lib/projects.ts`**

Move metadata (non-translatable) from `content/projects.ts` here. All text content comes from the dictionary.

```ts
import type { Dictionary } from '@/i18n/dictionaries';
import type { CategoryKey } from './site';

// Non-translatable metadata
export type ProjectMeta = {
  slug: string;
  status: 'concluido' | 'em-progresso' | 'em-breve';
  categories: CategoryKey[];
  date?: string;
  accent: 'blue' | 'orange' | 'pink';
  coverImage?: string;
};

// Full project with translations applied
export type LocalizedProject = ProjectMeta & {
  title: string;
  subtitle: string;
  cardTitle?: string;
  description: string;
  intro: string;
  tags: string[];
  thanks: string;
  sections: {
    creationProcess: {
      title: string;
      paragraphs: string[];
    };
    prototyping?: {
      title: string;
      tabs: string[];
      captions: string[];
      images: { alt: string }[];
    };
    finalProject?: {
      title: string;
    };
  };
};

// Slug → dictionary key mapping
const slugToKey = {
  'pontos-sem-no': 'pontosSemNo',
  'batuco-tuco': 'batucoTuco',
  'pontinhas-soltas': 'pontinhasSoltas',
} as const;

// Static metadata (no text)
const projectMeta: ProjectMeta[] = [
  {
    slug: 'pontos-sem-no',
    status: 'concluido',
    categories: ['grafico'],
    date: '08.12.2025',
    accent: 'blue',
    coverImage: '/images/projects/pontos-sem-no/cover.webp',
  },
  {
    slug: 'batuco-tuco',
    status: 'em-progresso',
    categories: ['interacao'],
    date: '04.12.2025',
    accent: 'orange',
    coverImage: '/images/projects/batuco-tuco/cover.png',
  },
  {
    slug: 'pontinhas-soltas',
    status: 'concluido',
    categories: ['3d'],
    date: '08.12.2025',
    accent: 'pink',
    coverImage: '/images/projects/pontinhas-soltas/cover.png',
  },
];

export function getLocalizedProject(
  slug: string,
  dict: Dictionary
): LocalizedProject | undefined {
  const meta = projectMeta.find((p) => p.slug === slug);
  if (!meta) return undefined;

  const key = slugToKey[slug as keyof typeof slugToKey];
  if (!key) return undefined;

  const i18n = dict.projects[key];

  return {
    ...meta,
    title: i18n.title,
    subtitle: i18n.subtitle,
    cardTitle: i18n.cardTitle,
    description: i18n.description,
    intro: i18n.intro,
    tags: i18n.tags,
    thanks: i18n.thanks,
    sections: {
      creationProcess: i18n.sections.creationProcess,
      prototyping: i18n.sections.prototyping,
      finalProject: i18n.sections.finalProject,
    },
  };
}

export function getLocalizedProjectsByCategory(
  category: CategoryKey,
  dict: Dictionary
): LocalizedProject[] {
  return projectMeta
    .filter((p) => p.categories.includes(category))
    .map((p) => getLocalizedProject(p.slug, dict)!)
    .filter(Boolean);
}

// Alias for compatibility
export const projectsByCategory = getLocalizedProjectsByCategory;
```

- [ ] **Step 2: Delete `content/projects.ts`**

```bash
git rm content/projects.ts
```

- [ ] **Step 3: Commit**

```bash
git add lib/projects.ts content/projects.ts
git commit -m "refactor: replace content/projects.ts with type-safe lib/projects.ts"
```

---

## Task 8: Update Header Component with Translations and LanguageSwitcher

**Files:**
- Modify: `components/layout/Header.tsx`

**Interfaces:**
- Consumes: `navLinks`, `categoryTabs` from `lib/site.ts`; `LanguageSwitcher` from `./LanguageSwitcher`
- Props: `{ locale: Locale; dict: Dictionary }`

- [ ] **Step 1: Rewrite `components/layout/Header.tsx`**

Key changes:
- Accept `locale` and `dict` props
- Use `dict.nav.*` for link labels
- Prefix all hrefs with `/${locale}`
- Strip locale prefix from pathname for active state comparison
- Render `<LanguageSwitcher currentLocale={locale} />`

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navLinks, categoryTabs } from '@/lib/site';
import type { Dictionary, Locale } from '@/i18n/dictionaries';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const pathname = usePathname();
  // Strip locale prefix for comparison: /pt-BR/contato → /contato
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  const linkStyle = { color: 'var(--color-blue)' } as const;
  const linkClass = (active: boolean) =>
    `transition-opacity hover:opacity-70 ${active ? 'font-black' : 'font-normal'}`;

  return (
    <header className="w-full bg-[color:var(--color-cream)]/95 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--color-cream)]/80 sticky top-0 z-30">
      <div className="flex w-full flex-col gap-3 px-10 py-4 text-base md:flex-row md:items-center md:justify-between">
        {/* Left: nav links + Language Switcher */}
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-4">
            {navLinks.map((link) => {
              const active = pathWithoutLocale === link.href;
              return (
                <Link
                  key={link.href}
                  href={`/${locale}${link.href}`}
                  aria-current={active ? 'page' : undefined}
                  className={linkClass(active)}
                  style={linkStyle}
                >
                  {dict.nav[link.key]}
                </Link>
              );
            })}
          </nav>
          <LanguageSwitcher currentLocale={locale} />
        </div>

        {/* Right: category tabs */}
        <nav className="flex items-center gap-4">
          {categoryTabs.map((tab) => {
            const active = pathWithoutLocale === tab.href;
            return (
              <Link
                key={tab.href}
                href={`/${locale}${tab.href}`}
                aria-current={active ? 'page' : undefined}
                className={linkClass(active)}
                style={linkStyle}
              >
                {dict.nav[tab.key]}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/Header.tsx
git commit -m "feat: add translations and LanguageSwitcher to Header"
```

---

## Task 9: Update Footer Component

**Files:**
- Modify: `components/layout/Footer.tsx`

**Interfaces:**
- Props: `{ dict: Dictionary }`

- [ ] **Step 1: Rewrite `components/layout/Footer.tsx`**

Replace hardcoded `"Redes sociais"` with `dict.footer.social`.

```tsx
import { site } from '@/lib/site';
import type { Dictionary } from '@/i18n/dictionaries';

export function Footer({ dict }: { dict: Dictionary }) {
  return (
    <footer className="bg-band mt-20 w-full text-[color:var(--color-cream)]">
      <div className="w-full px-10 py-10 text-base">
        <p className="font-normal">{dict.footer.social}</p>
        <ul className="mt-2 flex flex-col gap-1">
          <li className="flex items-center gap-3">
            <span className="w-5 shrink-0 font-normal">IG</span>
            <a
              href={site.social.instagram.url}
              target="_blank"
              rel="noreferrer"
              className="font-light underline decoration-from-font hover:opacity-80"
            >
              {site.social.instagram.handle}
            </a>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-5 shrink-0 font-normal">IN</span>
            <a
              href={site.social.linkedin.url}
              target="_blank"
              rel="noreferrer"
              className="font-light underline decoration-from-font hover:opacity-80"
            >
              {site.social.linkedin.handle}
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/Footer.tsx
git commit -m "feat: add translations to Footer"
```

---

## Task 10: Update ContactForm Component (Client Component)

**Files:**
- Modify: `components/contact/ContactForm.tsx`

**Interfaces:**
- Consumes: `useTranslations()` from `lib/i18n/use-translation.ts`
- Produces: Form with translated placeholders, error messages, success message

- [ ] **Step 1: Rewrite `components/contact/ContactForm.tsx`**

This is a Client Component — use `useTranslations()` hook. Replace all hardcoded strings:
- Placeholders: `dict.contact.form.namePlaceholder`, etc.
- Hint: `dict.contact.form.minContactHint`
- Button aria-label: `dict.contact.form.submitAriaLabel`
- Success: `dict.contact.form.successMessage`
- Errors: `dict.contact.form.errors.*`
- EmailJS messages: `dict.contact.form.emailjsNotConfigured`, `dict.contact.form.sendFailed`

The Zod schema error messages must come from the dictionary — restructure to use translated messages in `.refine()` calls or map error paths to dictionary keys.

- [ ] **Step 2: Commit**

```bash
git add components/contact/ContactForm.tsx
git commit -m "feat: add translations to ContactForm (placeholders, errors, success)"
```

---

## Task 11: Update BrandHero Component

**Files:**
- Modify: `components/layout/BrandHero.tsx`

**Interfaces:**
- Consumes: `dict.site.name` as default title (or accept `title` prop from dictionary)
- Props: `{ title?: string }` — title now comes from caller (page passes `dict.categories.*.heroTitle` or `dict.site.name`)

- [ ] **Step 1: Update `components/layout/BrandHero.tsx`**

Remove dependency on `site.name` from `lib/site.ts`. The component already accepts an optional `title` prop — callers will pass the translated value. If no title is passed, default to empty string (callers must always pass a title now).

Actually, better: keep the component as-is but ensure all callers pass the translated title. The component itself doesn't need changes — it already accepts `title` as a prop. Just remove the `site.name` fallback:

```tsx
// Remove this import:
// import { site } from "@/lib/site";

// Change default from `site.name` to empty string or make title required:
export function BrandHero({ title }: { title: string }) {
  const text = title;
  // ... rest unchanged
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/BrandHero.tsx
git commit -m "refactor: make BrandHero title required (translations come from caller)"
```

---

## Task 12: Update ProjectCard and CategoryPage Components

**Files:**
- Modify: `components/home/ProjectCard.tsx`
- Modify: `components/home/CategoryPage.tsx`

**Interfaces:**
- Consumes: `LocalizedProject` from `lib/projects.ts`, `Dictionary` from `i18n/dictionaries.ts`
- `ProjectCard` props: `{ project: LocalizedProject; locale: Locale; dict: Dictionary }`
- `CategoryPage` props: `{ category: CategoryKey; dict: Dictionary; locale: Locale }`

- [ ] **Step 1: Update `components/home/ProjectCard.tsx`**

- Change `project` prop type from `Project` to `LocalizedProject`
- Prefix link href with `/${locale}`: `href={`/${locale}/projetos/${project.slug}`}`
- Use `dict.projects.seeMore` for "Ver mais."
- Use `dict.projects.coverAlt` with `{title}` replaced

- [ ] **Step 2: Update `components/home/CategoryPage.tsx`**

- Accept `dict` and `locale` props
- Pass `dict` to `getLocalizedProjectsByCategory(category, dict)`
- Pass `locale` and `dict` to `ProjectCard`
- Use `dict.projects.comingSoon` and `dict.projects.comingSoonTag` for placeholder card
- Pass translated `heroTitle` to `BrandHero`

- [ ] **Step 3: Update `PlaceholderCard` (in ProjectCard.tsx)**

Accept `dict` prop and use `dict.projects.comingSoon` / `dict.projects.comingSoonTag`.

- [ ] **Step 4: Commit**

```bash
git add components/home/ProjectCard.tsx components/home/CategoryPage.tsx
git commit -m "feat: add translations to ProjectCard and CategoryPage"
```

---

## Task 13: Update CaseShell Component

**Files:**
- Modify: `components/case-study/CaseShell.tsx`

**Interfaces:**
- Consumes: `LocalizedProject` from `lib/projects.ts`, `Dictionary` from `i18n/dictionaries.ts`
- Props: `{ project: LocalizedProject; dict: Dictionary; children: ReactNode; cover?: ReactNode }`

- [ ] **Step 1: Update `components/case-study/CaseShell.tsx`**

- Change `project` prop type to `LocalizedProject`
- Accept `dict` prop
- Use `dict.status[project.status]` for status label (map: `concluido` → `dict.status.concluido`, `em-progresso` → `dict.status.emProgresso`, `em-breve` → `dict.status.emBreve`)
- Use `project.thanks` (already translated) instead of hardcoded "Obrigada por ter chegado até aqui!"
- Use `dict.projects.coverAlt` with `{title}` replaced for cover image alt

Note: The status mapping needs a key transformation:
```ts
const statusKey: Record<ProjectMeta['status'], keyof Dictionary['status']> = {
  'concluido': 'concluido',
  'em-progresso': 'emProgresso',
  'em-breve': 'emBreve',
};
```

- [ ] **Step 2: Commit**

```bash
git add components/case-study/CaseShell.tsx
git commit -m "feat: add translations to CaseShell (status labels, thanks message)"
```

---

## Task 14: Update All Page Components

**Files:**
- Modify: `app/[lang]/page.tsx` (home)
- Modify: `app/[lang]/contato/page.tsx`
- Modify: `app/[lang]/grafico/page.tsx`
- Modify: `app/[lang]/interacao/page.tsx`
- Modify: `app/[lang]/servicos/page.tsx`
- Modify: `app/[lang]/3d/page.tsx`
- Modify: `app/[lang]/projetos/pontos-sem-no/page.tsx`
- Modify: `app/[lang]/projetos/batuco-tuco/page.tsx`
- Modify: `app/[lang]/projetos/pontinhas-soltas/page.tsx`

**Interfaces:**
- All pages: `params: Promise<{ lang: string }>` (Next.js 16 — await it)
- Validate locale: `if (!isLocale(lang)) notFound()`
- Load dict: `const dict = await getDictionary(lang)`
- Pass `dict` and `locale` to child components

- [ ] **Step 1: Update `app/[lang]/page.tsx` (Home)**

Replace all hardcoded text with `dict.home.*`. The home page has complex JSX with inline `<strong>` tags — use the split-key pattern from the dictionary (`philosophyBody1`, `philosophyBody1Bold`, `philosophyBody1End`, etc.).

Use `site.social.linkedin.url` for the LinkedIn link (from `lib/site.ts` — non-translatable).

- [ ] **Step 2: Update `app/[lang]/contato/page.tsx`**

- Add `params` handling
- Use `dict.contact.title` for h2
- Use `dict.contact.subtitle` for paragraph
- Use `dict.contact.illustrationAlt` for Illustration alt
- Pass nothing extra to `ContactForm` (it uses `useTranslations()` internally)
- Set metadata: `title: dict.metadata.contato`

- [ ] **Step 3: Update category pages (`grafico`, `interacao`, `servicos`, `3d`)**

Pattern for each:
```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary, isLocale } from '@/i18n/dictionaries';
import { CategoryPage } from '@/components/home/CategoryPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.metadata.grafico, // or interacao, servicos, "3d"
    alternates: {
      languages: {
        'pt-BR': '/pt-BR/grafico',
        en: '/en/grafico',
      },
    },
  };
}

export default async function GraficoPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <CategoryPage
      category="grafico"
      dict={dict}
      locale={lang}
    />
  );
}
```

Note: `CategoryPage` accepts `heroTitle` — pass `dict.categories.grafico.heroTitle`.

- [ ] **Step 4: Update project pages (`pontos-sem-no`, `batuco-tuco`, `pontinhas-soltas`)**

Pattern:
```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary, isLocale } from '@/i18n/dictionaries';
import { getLocalizedProject } from '@/lib/projects';
import { CaseShell, CaseSection, CaseImage } from '@/components/case-study/CaseShell';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const project = getLocalizedProject('pontos-sem-no', dict);
  return { title: project?.title ?? dict.site.name };
}

export default async function PontosSemNoPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const project = getLocalizedProject('pontos-sem-no', dict);
  if (!project) notFound();

  const base = '/images/projects/pontos-sem-no';
  const protoTabs = project.sections.prototyping?.tabs ?? [];
  const protoCaptions = project.sections.prototyping?.captions ?? [];
  const protoImages = project.sections.prototyping?.images ?? [];

  return (
    <CaseShell project={project} dict={dict}>
      <CaseSection title={project.sections.creationProcess.title}>
        {project.sections.creationProcess.paragraphs.map((p, i) => (
          <p key={i} className="font-light text-[1rem] leading-relaxed text-[color:var(--color-blue)]">
            {p}
          </p>
        ))}
      </CaseSection>

      {/* Images with translated alt text */}
      <CaseImage
        src={`${base}/sistema.png`}
        alt={protoImages[0]?.alt ?? ''}
      />

      {project.sections.prototyping && (
        <CaseSection title={project.sections.prototyping.title}>
          <div className="mb-6 flex flex-wrap gap-4">
            {protoTabs.map((tab) => (
              <span key={tab} className="...">{tab}</span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-[clamp(0.75rem,4cqw,2rem)]">
            {protoImages.map((img, i) => (
              <figure key={img.alt}>
                <img src={`${base}/proto-${i + 1}.png`} alt={img.alt} className="block aspect-square w-full" />
                {protoCaptions[i] && (
                  <figcaption className="mt-2 text-[1rem] font-normal text-[color:var(--color-blue)]">
                    {protoCaptions[i]}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </CaseSection>
      )}

      {project.sections.finalProject && (
        <CaseSection title={project.sections.finalProject.title}>
          <CaseImage src={`${base}/projeto-final.webp`} alt={protoImages[1]?.alt ?? ''} />
        </CaseSection>
      )}
    </CaseShell>
  );
}
```

Apply the same pattern to `batuco-tuco` and `pontinhas-soltas`, adjusting for their specific image structure.

- [ ] **Step 5: Run `pnpm build`**

Expected: Build succeeds with all routes generated for both locales.

- [ ] **Step 6: Commit**

```bash
git add app/\[lang\]/
git commit -m "feat: update all pages for i18n (locale params, dictionaries, translations)"
```

---

## Task 15: Update Illustration Component Alt Text

**Files:**
- Modify: `components/home/Illustration.tsx`

**Interfaces:**
- The `alt` prop is already passed by callers — no change needed to the component itself
- Callers (pages) must pass translated alt text from dictionary

Actually, no changes needed here — the `alt` prop is already dynamic. Pages pass `dict.home.greetingAlt`, `dict.contact.illustrationAlt`, etc.

- [ ] **Step 1: Skip — no changes needed**

- [ ] **Step 2: Note in commit**

This task is a no-op. The Illustration component already accepts `alt` as a prop.

---

## Task 16: Final Verification and Testing

**Files:**
- No file changes — verification only

- [ ] **Step 1: Run full build**

```bash
pnpm build
```

Verify output includes routes for both locales:
```
├ ○ /en
├ ○ /en/3d
├ ○ /en/contato
├ ○ /en/grafico
├ ○ /en/interacao
├ ○ /en/projetos/batuco-tuco
├ ○ /en/projetos/pontinhas-soltas
├ ○ /en/projetos/pontos-sem-no
├ ○ /en/servicos
├ ○ /pt-BR
├ ○ /pt-BR/3d
├ ○ /pt-BR/contato
... (etc)
```

- [ ] **Step 2: Run dev server and test manually**

```bash
pnpm dev
```

Test checklist (from spec section 10.3):

| Test | Expected Result |
|------|-----------------|
| Visit `/` (no cookie, PT browser) | Redirects to `/pt-BR/` |
| Visit `/` (no cookie, EN browser) | Redirects to `/en/` |
| Visit `/` with cookie `NEXT_LOCALE=en` | Redirects to `/en/` |
| Click "EN" button | URL becomes `/en/...`, content in English, cookie set |
| Click "PT" button | URL becomes `/pt-BR/...`, content in Portuguese |
| Reload `/en/contato` | Stays in English |
| Visit `/fr/contato` | 404 Not Found |
| Check tab title on each page | Translated correctly |
| Check contact form | Placeholders and errors in correct language |
| Check project page | Title, description, sections, tags translated |
| View page source | `<html lang="pt-BR">` or `<html lang="en">` |
| View page source | `alternates.languages` meta tags present |

- [ ] **Step 3: Verify type-safety**

```bash
# Remove a key from en.json temporarily
echo '{"site": {}}' > dictionaries/en.json
pnpm build
# Should FAIL with TypeScript error about missing properties
# Restore:
git checkout dictionaries/en.json
pnpm build
# Should succeed
```

- [ ] **Step 4: Run lint**

```bash
pnpm lint
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete i18n implementation (pt-BR + en)

- Add type-safe dictionaries with typeof ptBR validation
- Move all routes to app/[lang]/ with proxy.ts locale detection
- Add LanguageSwitcher component in header
- Translate all pages, components, and project content
- Add hreflang alternates for SEO
- All routes statically generated for both locales"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | i18n config + dictionaries | `i18n/config.ts`, `i18n/dictionaries.ts`, `dictionaries/*.json` |
| 2 | Client provider + hooks | `lib/i18n/provider.tsx`, `lib/i18n/use-translation.ts` |
| 3 | proxy.ts (locale detection) | `proxy.ts` |
| 4 | LanguageSwitcher | `components/layout/LanguageSwitcher.tsx` |
| 5 | Move routes + root layout | `app/[lang]/*` |
| 6 | Refactor lib/site.ts | `lib/site.ts` |
| 7 | Create lib/projects.ts | `lib/projects.ts`, delete `content/projects.ts` |
| 8 | Update Header | `components/layout/Header.tsx` |
| 9 | Update Footer | `components/layout/Footer.tsx` |
| 10 | Update ContactForm | `components/contact/ContactForm.tsx` |
| 11 | Update BrandHero | `components/layout/BrandHero.tsx` |
| 12 | Update ProjectCard + CategoryPage | `components/home/ProjectCard.tsx`, `components/home/CategoryPage.tsx` |
| 13 | Update CaseShell | `components/case-study/CaseShell.tsx` |
| 14 | Update all pages | `app/[lang]/**/*.tsx` |
| 15 | Illustration (no-op) | — |
| 16 | Final verification | — |

**Estimated tasks:** 15 (one is no-op)
**Estimated commits:** 14
**Build verification:** Required after Task 5 (structure), Task 14 (all pages), and Task 16 (final)
