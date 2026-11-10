* [ ] 

---
name: portfolio-workflows
description: Step-by-step checklists for adding a new portfolio project (case study page, dictionaries, modal interceptor folder) or a new locale to this bilingual Next.js site. Use when creating a project/case or adding a language.
---
# Portfolio workflows

Moved out of `AGENTS.md` so it loads only when needed. The i18n rules, the
interception trap and the verification checklist stay in `AGENTS.md`.

## New portfolio project

1. Add the slug to `slugToKey` (`lib/projects.ts`) — kebab-case slug →
   camelCase dictionary key — and the **non-translatable** metadata to
   `projectMeta` (slug, status, categories, date, accent, coverImage, `grid`
   — column/aspect/objectPosition/descLines for the bento card — and
   `featured` for the highlighted card; no text there). Keep the bento
   balanced: the second number of each `aspect` is the card height in design
   px, and every column must sum the same (see the comment above `projectMeta`).
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
7. Mind the interception trap in `AGENTS.md` ("Links into case pages") for any
   link that must open a case as a full page.

## Adding a new locale (someday)

Update `locales` in `i18n/config.ts`, `localeNames`, create the JSON and
register it in the map in `i18n/dictionaries.ts`; fix `alternates.languages` in
the layout and in every page; consider `x-default`; `proxy.ts` must accept
the new locale (cookie/Accept-Language detection is generic, but the 404
pass-through and the matcher must be re-evaluated).
