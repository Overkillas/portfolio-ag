<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Maintaining internationalization (i18n)

The site is bilingual: **pt-BR (default)** and **en**. Any new feature that adds
visual components MUST follow these rules. The spec is the binding authority:
`docs/superpowers/specs/2026-10-19-i18n-design.md`.

## Rule zero: no hardcoded text

Every user-visible string (headings, paragraphs, buttons, placeholders, image
alts, aria-labels, error/success messages) goes into `dictionaries/pt-BR.json`
**and** `dictionaries/en.json` — in the same change. Type safety
(`satisfies Record<Locale, Dictionary>` in `i18n/dictionaries.ts`) breaks
`pnpm build` if `en.json` is missing a key — that is expected and desired,
not a bug.

## How components get translations

- **Server Component**: receives `dict` (and `locale` when it must build URLs)
  as props, from a server page/layout. Canonical examples:
  `components/layout/Header.tsx`, `components/layout/Footer.tsx`,
  `components/home/ProjectCard.tsx`, `components/home/CategoryPage.tsx`,
  `components/case-study/CaseShell.tsx`.
- **Client Component** (`'use client'`): use the `useTranslations()` hook
  from context (`lib/i18n/use-translation.ts`) — `I18nProvider` already wraps
  the tree in the layout. Canonical example:
  `components/contact/ContactForm.tsx`. A client component may also receive
  `dict` as a prop when its parent is a server component (that is how `Header`
  does it). Never import the JSON directly into a client component for text.
- Translation keys are typed as dot-notation (`TranslationKey`); a missing key
  is a compile-time error.

## Mandatory patterns

- **Placeholders**: use `{name}` in the dictionary string and substitute at
  the call site with `.replace('{name}', value)`. Existing examples:
  `dict.projects.coverAlt` (`{title}`), `dict.nav.switchLocale` (`{name}`).
- **Inline markup** (e.g. bold in the middle of a paragraph): split into
  separate keys and interleave the JSX, **never use
  `dangerouslySetInnerHTML`**. Keys must concatenate without extra spaces (the
  dictionary values carry their own leading/trailing spaces). Canonical
  example: `dict.home.philosophy*` / `dict.home.experience*` in
  `app/[lang]/page.tsx`.
- **Links**: the locale prefix is ALWAYS added at render time —
  `` href={`/${locale}${link.href}`} `` (pattern:
  `components/layout/Header.tsx`, `components/home/ProjectCard.tsx`).
  **Important exception**: `lib/site.ts` stores `navLinks`/`categoryTabs`
  with locale-less hrefs by convention; keep them locale-less there. Never
  hardcode `/pt-BR/...` as an href.
- **Project status**: `ProjectStatus` in `lib/projects.ts` is kebab-case
  (`'concluido' | 'em-progresso' | 'em-breve'`); the mapping to dictionary
  keys (`concluido`/`emProgresso`/`emBreve`) lives in
  `components/case-study/CaseShell.tsx` (`statusKey`).
- **Images**: keep them in `public/`; `alt` comes from the dictionary
  (`dict.home.greetingAlt`, `dict.contact.illustrationAlt`, per-section alts in
  `dict.projects.<project>.sections.*`).
- **Accessibility**: `aria-label`s are translated like any other text (e.g.
  `dict.nav.switchLocale`). Spec §4.6 sketched a fixed aria-label — **that was
  superseded**: the rule is to translate.
- **Do not translate data, only text**: brand/social labels (`"IG"`, `"IN"`),
  URLs, handles, and form field `name` attributes (`nome`, `email`, … — they
  are data keys, not display text) stay as they are.
- **`favicon.ico` lives at `app/` root** — Next.js does not serve it from
  inside `app/[lang]/`. Do not move it.

## New routes/pages

Every route lives in `app/[lang]/<route>/page.tsx` and follows the pattern:

1. `const { lang } = await params;` (params is a Promise in this Next version)
2. `if (!isLocale(lang)) notFound();`
3. `const dict = await getDictionary(lang);`
4. `generateMetadata` with `title: dict.metadata.<key>` + `alternates.languages`
   (`pt-BR`, `en`, `x-default` pointing to pt-BR). **Each page defines its own
   `alternates`** — the layout's is overridden, so new pages need all three
   entries.
5. Add the new key to `dict.metadata` in **both** dictionaries.

Canonical example: `app/[lang]/contato/page.tsx`.

## New portfolio project

1. Add the slug to `slugToKey` (`lib/projects.ts`) — kebab-case slug →
   camelCase dictionary key — and the **non-translatable** metadata to
   `projectMeta` (slug, status, categories, date, accent, coverImage, `grid`
   — column/aspect/objectPosition/descLines for the bento card — and
   `featured` for the highlighted card; no text there).
2. Add the full entry to `dict.projects.<key>` in both dictionaries (title,
   subtitle, cardTitle, description, intro, tags, sections with image alts —
   `creationProcess.images[]`, `prototyping.images[]`, `finalProject.images[]`
   —, thanks).
3. Add `metadata.<key>` in both dictionaries (tab title).
4. The project page at `app/[lang]/projetos/<slug>/page.tsx` uses
   `getLocalizedProject(slug, dict)` and follows the `notFound()` pattern for
   invalid locale **and** unknown project.
5. Put the case body (everything inside `<CaseShell>`) in a component under
   `components/case-study/cases/` and register it in `caseBodies`
   (`components/case-study/cases/index.ts`); the full page and the modal share it.
6. Create `app/[lang]/projetos/@modal/(.)<slug>/page.tsx` rendering
   `<InterceptedProject params={params} slug="<slug>" />` (copy an existing one).
   It is one folder per slug, **not** a dynamic `(.)[slug]`: the dynamic form
   answers 500 under `next dev` in this Next version. Without the folder the
   project silently opens as a full page instead of the modal;
   `./scripts/check-quality-gates.sh 7` fails if a slug and its folder do not match.
7. Trap: any client-side link (`next/link`, `router.push`) from a page under
   `/[lang]/projetos/` to a case page is intercepted and opens as a modal. A link
   that must open the full page (e.g. a future "related projects" link on a case
   page) has to do a full-page navigation, as `LanguageSwitcher` does.

## Adding a new locale (someday)

Update `locales` in `i18n/config.ts`, `localeNames`, create the JSON and
register it in the map in `i18n/dictionaries.ts`; fix `alternates.languages` in
the layout and in every page; consider `x-default`; `proxy.ts` must accept
the new locale (cookie/Accept-Language detection is generic, but the 404
pass-through and the matcher must be re-evaluated).

## Mandatory verification before committing

- [ ] `pnpm build` clean (also validates pt-BR ↔ en parity)
- [ ] `pnpm lint` clean (attention: `react-hooks/immutability` — see note below)
- [ ] `pnpm exec tsc --noEmit` clean
- [ ] Applicable quality gates:
  `./scripts/check-quality-gates.sh 3` (components), `4` (content),
  `5` (runtime), `6` (pre-merge), `7` (projects page). Doc:
  `docs/superpowers/quality-gates/2026-10-19-i18n-quality-gates.md`

### Note on client components

If you need to write a cookie on the client (e.g. language preference), use
`document.cookie = ...` inside an event handler WITH the comment
`// eslint-disable-next-line react-hooks/immutability` on the line immediately
before — ESLint (React Compiler) blocks assignments to globals; the disable
directive must be the last comment line before the statement (see
`components/layout/LanguageSwitcher.tsx`).

## Where to look

- Spec (authority): `docs/superpowers/specs/2026-10-19-i18n-design.md`
- Infra: `i18n/config.ts`, `i18n/dictionaries.ts`, `lib/i18n/`
- Locale detection: `proxy.ts` (cookie `NEXT_LOCALE` > `Accept-Language` >
  pt-BR; segments that look like an invalid locale pass through and the layout
  responds 404)
- Canonical examples: `components/layout/Header.tsx` (props),
  `components/contact/ContactForm.tsx` (hook), `app/[lang]/page.tsx`
  (split keys), `components/home/ProjectCard.tsx` (placeholder `{title}`)
