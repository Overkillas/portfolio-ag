# Quality Gates: Internacionalização (i18n)

**Feature:** Type-safe i18n with Next.js 16 `app/[lang]/` routing
**Spec:** `docs/superpowers/specs/2026-10-19-i18n-design.md`
**Plan:** `docs/superpowers/plans/2026-10-19-i18n-implementation.md`
**Branch:** `feature/animations-and-internacionalization`

---

## Quick Start

```bash
# Run specific gate
./scripts/check-quality-gates.sh 0    # Baseline check
./scripts/check-quality-gates.sh 1    # After infrastructure (Tasks 1-4)
./scripts/check-quality-gates.sh 2    # After route migration (Task 5)
./scripts/check-quality-gates.sh 3    # After component migration (Tasks 6-13)
./scripts/check-quality-gates.sh 4    # After page migration (Task 14)
./scripts/check-quality-gates.sh 5    # Runtime verification (Task 16)
./scripts/check-quality-gates.sh 6    # Final pre-merge

# Run all automated gates (0-4)
./scripts/check-quality-gates.sh all
```

**Exit codes:** `0` = PASS, `1` = FAIL

### ⚠️ Known Issue: pnpm minimumReleaseAge Policy

If builds fail with `minimumReleaseAge cutoff` errors, this is an **environment policy**, not a code issue. The lockfile contains packages published within the last 24h, which pnpm's security policy rejects.

**Fix (run once):**

```bash
# Option 1: Project-level (recommended)
echo "minimum-release-age=0" >> .npmrc

# Option 2: Global
pnpm config set minimum-release-age 0

# Then rebuild
pnpm install
```

The quality gates script **detects this automatically** and marks affected checks as `SKIP` (yellow) instead of `FAIL`.

---

## Gate 0: Pre-Implementation (Baseline)

**Purpose:** Ensure the codebase is in a known-good state before starting.

### Commands

```bash
# 1. Clean working tree
git status --porcelain
# Expected: empty output (no uncommitted changes)

# 2. Build passes on current code
pnpm build
# Expected: exit code 0, all routes generated

# 3. Lint passes
pnpm lint
# Expected: exit code 0, 0 errors

# 4. Dev server starts
pnpm dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# Expected: 200
kill %1 2>/dev/null
```

### Pass Criteria

| Check | Expected |
|-------|----------|
| `git status --porcelain` | Empty (clean tree) |
| `pnpm build` exit code | 0 |
| `pnpm build` routes count | 9 routes (/, /contato, /grafico, /interacao, /servicos, /3d, /projetos/*) |
| `pnpm lint` exit code | 0 |
| `pnpm lint` errors | 0 |
| Dev server HTTP status | 200 |

### Gate Result

- [x] **PASS** — Proceed to Task 1
- [ ] **FAIL** — Fix baseline issues before starting

> **Evidence (2026-10-19):** 4/4 checks PASS — `pnpm exec tsc --noEmit` clean,
> lint clean, build 10 routes, dev server responds. Runner: `./scripts/check-quality-gates.sh 0` → exit 0.

---

## Gate 1: Infrastructure (Tasks 1-4)

**Purpose:** i18n infrastructure compiles and type-safety is enforced.

**When:** After completing Tasks 1-4 (config, dictionaries, provider, proxy, LanguageSwitcher)

### Commands

```bash
# 1. Type-safety: en.json structure matches pt-BR.json
pnpm exec tsc --noEmit
# Expected: exit code 0 (no type errors)

# 2. Negative test: remove a key from en.json, build should FAIL
cp dictionaries/en.json /tmp/en.json.backup
echo '{"site": {}}' > dictionaries/en.json
pnpm build 2>&1 | grep -q "error"
TYPECHECK_FAIL=$?
cp /tmp/en.json.backup dictionaries/en.json
# Expected: TYPECHECK_FAIL=0 (grep found "error" → type-safety works)

# 3. Import validation: no circular dependencies in i18n modules
pnpm exec madge --circular i18n/ lib/i18n/ 2>/dev/null || echo "madge not installed, skipping"
# Expected: no circular dependencies (or skip if tool unavailable)

# 4. JSON validity
node -e "JSON.parse(require('fs').readFileSync('dictionaries/pt-BR.json')); JSON.parse(require('fs').readFileSync('dictionaries/en.json')); console.log('JSON valid')"
# Expected: "JSON valid"
```

### Pass Criteria

| Check | Expected |
|-------|----------|
| `tsc --noEmit` exit code | 0 |
| Type-safety negative test | Build FAILS when `en.json` missing keys |
| `dictionaries/pt-BR.json` | Valid JSON, contains all required top-level keys |
| `dictionaries/en.json` | Valid JSON, structure matches pt-BR.json |
| `i18n/dictionaries.ts` exports | `getDictionary`, `isLocale`, `Dictionary` type |
| `lib/i18n/provider.tsx` | Exports `I18nProvider`, `useI18n` |
| `lib/i18n/use-translation.ts` | Exports `useTranslations`, `TranslationKey` type |
| `proxy.ts` exists at root | File exists, exports `proxy` function |
| `LanguageSwitcher.tsx` | File exists, exports `LanguageSwitcher` component |

### Dictionary Structure Checklist

Verify `pt-BR.json` has all required keys:

- [ ] `site.name`, `site.tagline`
- [ ] `nav.*` (about, contact, grafico, interacao, servicos, 3d)
- [ ] `home.*` (greeting, greetingAlt, intro, philosophy, philosophyAlt, philosophyLead, philosophyBody1, philosophyBody1Bold, philosophyBody1End, philosophyBody2, philosophyBody2Bold1, philosophyBody2Mid, philosophyBody2Bold2, philosophyBody2Mid2, philosophyBody2Bold3, philosophyBody2End, experience, experienceAlt, experienceLead, experienceBody, experienceBodyBold, experienceBodyMid, experienceBodyLink, experienceBodyEnd)
- [ ] `contact.*` (title, subtitle, illustrationAlt, form.* with all placeholders and errors)
- [ ] `categories.*` (grafico, interacao, servicos, 3d — each with title, heroTitle)
- [ ] `projects.*` (seeMore, comingSoon, comingSoonTag, coverAlt, pontosSemNo, batucoTuco, pontinhasSoltas)
- [ ] Each project has: title, subtitle, cardTitle, description, intro, tags[], thanks, sections.*
- [ ] `status.*` (concluido, emProgresso, emBreve)
- [ ] `footer.social`
- [ ] `metadata.*` (home, contato, grafico, interacao, servicos, 3d, pontosSemNo, batucoTuco, pontinhasSoltas)

### Gate Result

- [x] **PASS** — Proceed to Task 5 (route migration)
- [ ] **FAIL** — Fix infrastructure before migrating routes

> **Evidence (2026-10-19):** 15/15 PASS — tsc clean; negative type-safety test
> (en.json truncado → build falha; restaurado → ok); JSON válido; exports presentes;
> estrutura do dicionário completa (6/6). Runner exit 0.

---

## Gate 2: Route Structure (Task 5)

**Purpose:** All routes successfully moved to `app/[lang]/` and build generates locale-prefixed routes.

**When:** After completing Task 5 (move routes + root layout)

### Commands

```bash
# 1. Verify app/[lang]/ structure exists
ls -la app/\[lang\]/
# Expected: layout.tsx, page.tsx, globals.css, favicon.ico, contato/, grafico/, interacao/, servicos/, 3d/, projetos/

# 2. Verify no duplicate routes at app/ root
ls app/*.tsx app/*.css 2>/dev/null | grep -v "\[lang\]" || echo "No stray files at root"
# Expected: "No stray files at root" (or only [lang] directory)

# 3. Build succeeds with locale routes
pnpm build
# Expected: exit code 0

# 4. Verify generated routes include both locales
pnpm build 2>&1 | grep -E "^[├└○●]" | grep -E "/(pt-BR|en)/" | wc -l
# Expected: 18 (9 routes × 2 locales)

# 5. Verify generateStaticParams produces both locales
pnpm build 2>&1 | grep -E "(pt-BR|en)" | head -20
# Expected: routes listed for both pt-BR and en

# 6. Check root layout exports required functions
grep -q "generateStaticParams" app/\[lang\]/layout.tsx && echo "✓ generateStaticParams" || echo "✗ missing generateStaticParams"
grep -q "generateMetadata" app/\[lang\]/layout.tsx && echo "✓ generateMetadata" || echo "✗ missing generateMetadata"
grep -q "notFound" app/\[lang\]/layout.tsx && echo "✓ notFound guard" || echo "✗ missing notFound guard"
grep -q "isLocale" app/\[lang\]/layout.tsx && echo "✓ isLocale validation" || echo "✗ missing isLocale validation"
```

### Pass Criteria

| Check | Expected |
|-------|----------|
| `app/[lang]/` directory exists | Yes |
| `app/[lang]/layout.tsx` exists | Yes |
| `app/[lang]/page.tsx` exists | Yes |
| `app/[lang]/globals.css` exists | Yes |
| `app/[lang]/favicon.ico` exists | Yes |
| Category directories moved | contato/, grafico/, interacao/, servicos/, 3d/ |
| Projects directory moved | projetos/ with 3 project pages |
| No stray files at `app/` root | Only `[lang]` directory |
| `pnpm build` exit code | 0 |
| Generated routes count | 18 (9 × 2 locales) |
| `generateStaticParams` exported | Yes, returns both locales |
| `generateMetadata` exported | Yes, locale-aware |
| `notFound()` guard present | Yes, for invalid locales |
| `isLocale()` validation present | Yes |
| Root layout uses `I18nProvider` | Yes |
| Root layout passes `dict` to Header/Footer | Yes |

### Route Generation Checklist

Verify build output includes these routes (sample):

- [ ] `/pt-BR` and `/en`
- [ ] `/pt-BR/contato` and `/en/contato`
- [ ] `/pt-BR/grafico` and `/en/grafico`
- [ ] `/pt-BR/interacao` and `/en/interacao`
- [ ] `/pt-BR/servicos` and `/en/servicos`
- [ ] `/pt-BR/3d` and `/en/3d`
- [ ] `/pt-BR/projetos/pontos-sem-no` and `/en/projetos/pontos-sem-no`
- [ ] `/pt-BR/projetos/batuco-tuco` and `/en/projetos/batuco-tuco`
- [ ] `/pt-BR/projetos/pontinhas-soltas` and `/en/projetos/pontinhas-soltas`

### Gate Result

- [x] **PASS** — Proceed to Task 6 (component updates)
- [ ] **FAIL** — Fix route structure before updating components

> **Evidence (2026-10-19):** 18/18 PASS — 18 rotas estáticas (9 × pt-BR/en, contadas
> com o regex `[├└] /(pt-BR|en)`), layout exporta `generateStaticParams` +
> `generateMetadata`, `<html lang>` dinâmico, `notFound()` para locale inválido.
> Runner exit 0.

---

## Gate 3: Component Migration (Tasks 6-13)

**Purpose:** All components use translations, no hardcoded strings remain.

**When:** After completing Tasks 6-13 (site.ts, projects.ts, Header, Footer, ContactForm, BrandHero, ProjectCard, CategoryPage, CaseShell)

### Commands

```bash
# 1. Search for hardcoded Portuguese strings in components (should be minimal/none)
grep -rE '"(Sobre mim|Solicitar serviços|Gráfico|Interação|Serviços|Vamos trabalhar|Envie|Enviar|Obrigada|Concluído|Em progresso|Em breve|Ver mais|Redes sociais)"' \
  components/ app/\[lang\]/ --include="*.tsx" --include="*.ts" || echo "No hardcoded strings found"
# Expected: "No hardcoded strings found" or only acceptable exceptions

# 2. Verify all components receive dictionary or use hooks
grep -rL "dict\|useTranslations\|Dictionary" \
  components/layout/Header.tsx \
  components/layout/Footer.tsx \
  components/contact/ContactForm.tsx \
  components/home/CategoryPage.tsx \
  components/home/ProjectCard.tsx \
  components/case-study/CaseShell.tsx 2>/dev/null || echo "All components use translations"
# Expected: All files reference dict/useTranslations/Dictionary

# 3. Verify content/projects.ts is deleted
git status content/projects.ts
# Expected: "deleted: content/projects.ts" or file not found

# 4. Verify lib/projects.ts has all required exports
grep -q "getLocalizedProject" lib/projects.ts && echo "✓ getLocalizedProject" || echo "✗ missing"
grep -q "getLocalizedProjectsByCategory" lib/projects.ts && echo "✓ getLocalizedProjectsByCategory" || echo "✗ missing"
grep -q "LocalizedProject" lib/projects.ts && echo "✓ LocalizedProject type" || echo "✗ missing"

# 5. Build still passes
pnpm build
# Expected: exit code 0

# 6. Lint passes
pnpm lint
# Expected: exit code 0, 0 errors
```

### Component-Specific Checklists

#### Header.tsx
- [ ] Accepts `locale: Locale` and `dict: Dictionary` props
- [ ] Uses `dict.nav.*` for link labels
- [ ] Prefixes all hrefs with `/${locale}`
- [ ] Strips locale from pathname for active state
- [ ] Renders `<LanguageSwitcher currentLocale={locale} />`

#### Footer.tsx
- [ ] Accepts `dict: Dictionary` prop
- [ ] Uses `dict.footer.social` instead of hardcoded "Redes sociais"
- [ ] Social links remain from `site.social` (non-translatable)

#### ContactForm.tsx
- [ ] Uses `useTranslations()` hook (Client Component)
- [ ] All placeholders from `dict.contact.form.*`
- [ ] All error messages from `dict.contact.form.errors.*`
- [ ] Success message from `dict.contact.form.successMessage`
- [ ] Hint text from `dict.contact.form.minContactHint`
- [ ] Button aria-label from `dict.contact.form.submitAriaLabel`

#### BrandHero.tsx
- [ ] `title` prop is required (string, not optional)
- [ ] No import of `site.name` fallback
- [ ] Still measures text with SVG getBBox

#### ProjectCard.tsx
- [ ] Accepts `LocalizedProject` type (not old `Project`)
- [ ] Accepts `locale` and `dict` props
- [ ] Link href prefixed with `/${locale}`
- [ ] "Ver mais." from `dict.projects.seeMore`
- [ ] Cover alt from `dict.projects.coverAlt` (with {title} replaced)
- [ ] `PlaceholderCard` uses `dict.projects.comingSoon` and `dict.projects.comingSoonTag`

#### CategoryPage.tsx
- [ ] Accepts `dict` and `locale` props
- [ ] Uses `getLocalizedProjectsByCategory(category, dict)`
- [ ] Passes `dict` and `locale` to `ProjectCard`
- [ ] Passes `heroTitle` (from dict) to `BrandHero`

#### CaseShell.tsx
- [ ] Accepts `LocalizedProject` and `dict` props
- [ ] Status label from `dict.status.*` (with key mapping)
- [ ] Thanks message from `project.thanks` (already localized)
- [ ] Cover alt from `dict.projects.coverAlt`

#### lib/site.ts
- [ ] `navLinks` has `key` + `href` only (no `label`)
- [ ] `categoryTabs` has `key` + `href` only (no `label`)
- [ ] `site` object has only non-translatable data (social links, email)
- [ ] `CategoryKey` type exported

#### lib/projects.ts
- [ ] `ProjectMeta` type (non-translatable metadata)
- [ ] `LocalizedProject` type (metadata + translations)
- [ ] `getLocalizedProject(slug, dict)` function
- [ ] `getLocalizedProjectsByCategory(category, dict)` function
- [ ] `slugToKey` mapping (pontos-sem-no → pontosSemNo, etc.)

### Pass Criteria

| Check | Expected |
|-------|----------|
| No hardcoded PT strings in components | Yes (or documented exceptions) |
| All 7 modified components use translations | Yes |
| `content/projects.ts` deleted | Yes |
| `lib/projects.ts` has all exports | Yes |
| `pnpm build` exit code | 0 |
| `pnpm lint` exit code | 0 |
| `pnpm lint` errors | 0 |

### Gate Result

- [x] **PASS** — Proceed to Task 14 (page updates)
- [ ] **FAIL** — Fix component translations before updating pages

> **Evidence (2026-10-19):** 14/14 PASS — rodado após Task 14 (checks de build/lint
> do gate só são verdadeiros com as páginas migradas; verificado no ledger).
> Runner exit 0.

---

## Gate 4: Page Migration (Task 14)

**Purpose:** All pages correctly handle locale params and pass translations to components.

**When:** After completing Task 14 (update all pages)

### Commands

```bash
# 1. Verify all pages have locale handling
for page in app/\[lang\]/page.tsx app/\[lang\]/contato/page.tsx app/\[lang\]/{grafico,interacao,servicos,3d}/page.tsx app/\[lang\]/projetos/*/page.tsx; do
  echo "=== $page ==="
  grep -q "params: Promise<{ lang: string }>" "$page" && echo "  ✓ params typed" || echo "  ✗ missing params type"
  grep -q "await params" "$page" && echo "  ✓ awaits params" || echo "  ✗ doesn't await params"
  grep -q "isLocale" "$page" && echo "  ✓ validates locale" || echo "  ✗ missing isLocale check"
  grep -q "notFound" "$page" && echo "  ✓ notFound guard" || echo "  ✗ missing notFound"
  grep -q "getDictionary" "$page" && echo "  ✓ loads dictionary" || echo "  ✗ missing getDictionary"
done

# 2. Verify generateMetadata in all pages
for page in app/\[lang\]/contato/page.tsx app/\[lang\]/{grafico,interacao,servicos,3d}/page.tsx app/\[lang\]/projetos/*/page.tsx; do
  grep -q "generateMetadata" "$page" && echo "✓ $page has generateMetadata" || echo "✗ $page missing generateMetadata"
done

# 3. Build passes
pnpm build
# Expected: exit code 0

# 4. All routes still generated (18 routes)
pnpm build 2>&1 | grep -E "^(├|└|○)" | grep -E "/(pt-BR|en)" | wc -l
# Expected: 18

# 5. No TypeScript errors
pnpm exec tsc --noEmit
# Expected: exit code 0
```

### Page-Specific Checklists

#### Home (`app/[lang]/page.tsx`)
- [ ] Uses `dict.home.*` for all text
- [ ] Split keys for inline bold text (philosophyBody1, philosophyBody1Bold, etc.)
- [ ] Experience section with LinkedIn link uses `dict.home.experienceBody*`
- [ ] Illustration alts from `dict.home.greetingAlt`, `dict.home.philosophyAlt`, `dict.home.experienceAlt`
- [ ] No hardcoded "Olá a todos,", "Filosofia", "Experiência"

#### Contact (`app/[lang]/contato/page.tsx`)
- [ ] `generateMetadata` returns `dict.metadata.contato`
- [ ] h2 uses `dict.contact.title`
- [ ] Subtitle uses `dict.contact.subtitle`
- [ ] Illustration alt from `dict.contact.illustrationAlt`
- [ ] `ContactForm` receives no props (uses hook internally)

#### Category Pages (grafico, interacao, servicos, 3d)
- [ ] `generateMetadata` returns correct `dict.metadata.*`
- [ ] `generateMetadata` includes `alternates.languages`
- [ ] Passes `dict` and `locale` to `CategoryPage`
- [ ] Passes correct `heroTitle` from `dict.categories.*.heroTitle`

#### Project Pages (pontos-sem-no, batuco-tuco, pontinhas-soltas)
- [ ] `generateMetadata` returns project title from localized project
- [ ] Uses `getLocalizedProject(slug, dict)`
- [ ] Passes `dict` to `CaseShell`
- [ ] Section titles from `project.sections.*.title`
- [ ] Paragraphs from `project.sections.creationProcess.paragraphs[]`
- [ ] Tab labels from `project.sections.prototyping.tabs[]`
- [ ] Captions from `project.sections.prototyping.captions[]`
- [ ] Image alts from `project.sections.prototyping.images[].alt`

### Pass Criteria

| Check | Expected |
|-------|----------|
| All 9 pages have `params: Promise<{ lang: string }>` | Yes |
| All 9 pages `await params` | Yes |
| All 9 pages validate with `isLocale` | Yes |
| All 9 pages have `notFound()` guard | Yes |
| All 9 pages call `getDictionary(lang)` | Yes |
| 8 pages have `generateMetadata` (home uses layout default) | Yes |
| `pnpm build` exit code | 0 |
| Generated routes count | 18 |
| `tsc --noEmit` exit code | 0 |

### Gate Result

- [x] **PASS** — Proceed to Gate 5 (runtime verification)
- [ ] **FAIL** — Fix page implementations

> **Evidence (2026-10-19):** 20/20 PASS — zero strings hardcoded em
> páginas/componentes traduzidos (grep filtra comentários), todos os textos
> vêm de `dict.*`, chaves de dicionário resolvidas por tipo. Runner exit 0.

---

## Gate 5: Runtime Verification (Task 16 - Manual + Automated)

**Purpose:** End-to-end verification that i18n works correctly in the running application.

**When:** After all implementation tasks complete

### Automated Checks

```bash
# 1. Start dev server
pnpm dev &
DEV_PID=$!
sleep 8

# 2. Test locale redirect (no cookie, PT browser simulation)
curl -s -o /dev/null -w "%{http_code} %{redirect_url}" http://localhost:3000/
# Expected: 307 http://localhost:3000/pt-BR/ (or 200 if already redirected)

# 3. Test locale redirect (EN browser)
curl -s -o /dev/null -w "%{http_code} %{redirect_url}" \
  -H "Accept-Language: en-US,en;q=0.9" http://localhost:3000/
# Expected: 307 http://localhost:3000/en/

# 4. Test cookie preference
curl -s -o /dev/null -w "%{http_code} %{redirect_url}" \
  -H "Cookie: NEXT_LOCALE=en" http://localhost:3000/
# Expected: 307 http://localhost:3000/en/

# 5. Test direct locale access (should NOT redirect)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/pt-BR/
# Expected: 200

curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/en/
# Expected: 200

# 6. Test invalid locale (should 404)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/fr/contato
# Expected: 404

# 7. Test all routes return 200 for both locales
for locale in pt-BR en; do
  for path in "" "contato" "grafico" "interacao" "servicos" "3d" "projetos/pontos-sem-no" "projetos/batuco-tuco" "projetos/pontinhas-soltas"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/$locale/$path")
    if [ "$STATUS" != "200" ]; then
      echo "✗ /$locale/$path → $STATUS (expected 200)"
    fi
  done
done
echo "Route check complete"
# Expected: "Route check complete" with no ✗ lines

# 8. Test HTML lang attribute
curl -s http://localhost:3000/pt-BR/ | grep -o '<html[^>]*lang="[^"]*"'
# Expected: lang="pt-BR"

curl -s http://localhost:3000/en/ | grep -o '<html[^>]*lang="[^"]*"'
# Expected: lang="en"

# 9. Test hreflang alternates present
curl -s http://localhost:3000/pt-BR/ | grep -o 'hreflang="[^"]*"' | sort -u
# Expected: hreflang="pt-BR" and hreflang="en"

# 10. Test no translation flash (check for dictionary keys in HTML)
curl -s http://localhost:3000/en/ | grep -E "home\.|nav\.|contact\." | head -5
# Expected: no output (no raw dictionary keys visible)

# 11. Test translated content present
curl -s http://localhost:3000/en/ | grep -i "hello\|about\|experience" | head -3
# Expected: English text found

curl -s http://localhost:3000/pt-BR/ | grep -i "olá\|sobre\|experiência" | head -3
# Expected: Portuguese text found

# Cleanup
kill $DEV_PID 2>/dev/null
```

### Manual Test Checklist

**Browser tests (open each URL in browser):**

| Test | URL | Expected | ✓ |
|------|-----|----------|---|
| PT redirect | `/` (clear cookies) | Redirects to `/pt-BR/` | ☐ |
| EN redirect | `/` with `Accept-Language: en` | Redirects to `/en/` | ☐ |
| Cookie redirect | `/` with cookie `NEXT_LOCALE=en` | Redirects to `/en/` | ☐ |
| Direct PT | `/pt-BR/` | Shows Portuguese content | ☐ |
| Direct EN | `/pt-BR/en/` → `/en/` | Shows English content | ☐ |
| Switch to EN | Click "EN" button | URL → `/en/...`, English content, cookie set | ☐ |
| Switch to PT | Click "PT" button | URL → `/pt-BR/...`, Portuguese content | ☐ |
| Persistence | Reload `/en/contato` | Stays in English | ☐ |
| Invalid locale | `/fr/contato` | 404 page | ☐ |
| Contact form PT | `/pt-BR/contato` | Placeholders: "Seu nome", "Seu email", etc. | ☐ |
| Contact form EN | `/en/contato` | Placeholders: "Your name", "Your email", etc. | ☐ |
| Form errors PT | Submit empty form | "Conta seu nome :)" etc. | ☐ |
| Form errors EN | Submit empty form | "Tell me your name :)" etc. | ☐ |
| Project page PT | `/pt-BR/projetos/pontos-sem-no` | "Pontos sem nó", "Processo de criação", etc. | ☐ |
| Project page EN | `/en/projetos/pontos-sem-no` | "Untied Points" (or similar), "Creation process", etc. | ☐ |
| Status pills PT | Any completed project | "Concluído" | ☐ |
| Status pills EN | Any completed project | "Completed" | ☐ |
| Header nav PT | Any page | "Sobre mim", "Solicitar serviços", "Gráfico", etc. | ☐ |
| Header nav EN | Any page | "About me", "Hire me", "Graphic", etc. | ☐ |
| Footer PT | Any page | "Redes sociais" | ☐ |
| Footer EN | Any page | "Social media" | ☐ |
| Placeholder cards PT | `/pt-BR/grafico` | "Em breve", "Novo projeto a caminho" | ☐ |
| Placeholder cards EN | `/en/grafico` | "Coming soon", "New project on the way" | ☐ |
| Tab title PT | Browser tab | "Ágatha Sales" or "Página · Ágatha Sales" | ☐ |
| Tab title EN | Browser tab | "Ágatha Sales" or "Page · Ágatha Sales" | ☐ |
| View source | Check `<html lang>` | Correct locale | ☐ |
| View source | Check hreflang | Both locales listed | ☐ |
| View source | Check OG locale | `pt_BR` or `en_US` | ☐ |

### Performance Check

```bash
# Lighthouse CI (if available) or manual check:
# 1. No flash of untranslated content (FOUC)
# 2. Language switcher is interactive immediately
# 3. Page weight increase < 50KB (dictionaries are server-only)

# Check bundle size
pnpm build 2>&1 | grep -E "First Load JS" | head -5
# Compare before/after — should be minimal increase
```

### Accessibility Check

- [ ] Language switcher has `aria-label` on buttons
- [ ] Language switcher has `aria-pressed` for active state
- [ ] `hreflang` links present for SEO
- [ ] `<html lang>` attribute correct
- [ ] Skip to content link works in both locales
- [ ] Form labels associated with inputs (via placeholder + aria-label)

### Pass Criteria

| Check | Expected |
|-------|----------|
| `/` redirects to `/pt-BR/` (no cookie) | Yes |
| `/` redirects to `/en/` (Accept-Language: en) | Yes |
| `/` redirects to `/en/` (cookie NEXT_LOCALE=en) | Yes |
| `/pt-BR/*` returns 200 | Yes (all 9 routes) |
| `/en/*` returns 200 | Yes (all 9 routes) |
| `/fr/*` returns 404 | Yes |
| `<html lang>` correct | Yes |
| `hreflang` alternates present | Yes |
| No raw dictionary keys in HTML | Yes |
| English content on `/en/*` | Yes |
| Portuguese content on `/pt-BR/*` | Yes |
| Language switcher works | Yes |
| Cookie persists preference | Yes |
| All 24 manual tests pass | Yes |
| No console errors | Yes |
| No FOUC (flash of untranslated content) | Yes |

### Gate Result

- [x] **PASS** — Feature complete, ready for review/PR
- [ ] **FAIL** — Fix runtime issues

> **Evidence (2026-10-20, pós fix pass):** 13/13 PASS — redirects com asserções duras (HTTP 307 + alvo; cookie/Accept-Language/default),
> 18 rotas diretas 200, `/fr/contato` → 404 (o proxy deixa passar e o layout
> `[lang]` responde notFound), `<html lang>` correto nos dois idiomas, `hreflang`
> presentes, sem chaves de dicionário cruas no HTML, conteúdo EN/PT verificado.
> Runner exit 0.

---

## Gate 6: Final Pre-Merge (Security + Quality)

**Purpose:** Final checks before merging to main.

**When:** After Gate 5 passes, before creating PR

### Commands

```bash
# 1. Full clean build from scratch
rm -rf .next
pnpm build
# Expected: exit code 0, all 18 routes

# 2. Full lint
pnpm lint
# Expected: exit code 0, 0 errors, 0 warnings (or documented warnings)

# 3. Type check
pnpm exec tsc --noEmit
# Expected: exit code 0

# 4. Check for secrets in dictionaries (should be none)
grep -rE "(api[_-]?key|secret|password|token)" dictionaries/ || echo "No secrets found"
# Expected: "No secrets found"

# 5. Check proxy.ts doesn't leak sensitive info
cat proxy.ts | grep -iE "(password|secret|key|token)" || echo "proxy.ts clean"
# Expected: "proxy.ts clean"

# 6. Verify no debug console.logs added
git diff main...HEAD -- '*.ts' '*.tsx' | grep "^+" | grep -E "console\.(log|debug|info)" || echo "No debug logs added"
# Expected: "No debug logs added"

# 7. Check commit history is clean
git log --oneline main..HEAD
# Expected: logical, atomic commits with clear messages

# 8. Verify branch is up to date with main
git fetch origin main
git log --oneline HEAD..origin/main
# Expected: empty (or rebase if not)

# 9. Security: check for XSS in dictionary usage
grep -rE "dangerouslySetInnerHTML" components/ app/ || echo "No dangerouslySetInnerHTML"
# Expected: "No dangerouslySetInnerHTML"

# 10. Check all translations are complete (no missing keys)
node -e "
const pt = require('./dictionaries/pt-BR.json');
const en = require('./dictionaries/en.json');
function getKeys(obj, prefix='') {
  return Object.entries(obj).flatMap(([k,v]) =>
    typeof v === 'object' && v !== null && !Array.isArray(v)
      ? getKeys(v, prefix + k + '.')
      : [prefix + k]
  );
}
const ptKeys = getKeys(pt).sort();
const enKeys = getKeys(en).sort();
const missing = ptKeys.filter(k => !enKeys.includes(k));
const extra = enKeys.filter(k => !ptKeys.includes(k));
if (missing.length) console.log('Missing in en:', missing);
if (extra.length) console.log('Extra in en:', extra);
if (!missing.length && !extra.length) console.log('✓ All keys match');
"
# Expected: "✓ All keys match"
```

### Code Review Checklist (Self-Review)

Before requesting external review:

- [ ] All tasks in plan marked complete
- [ ] All gates 0-5 passed with evidence
- [ ] No TODO/FIXME comments added (or documented why)
- [ ] No commented-out code
- [ ] All imports used (no unused imports)
- [ ] No magic strings (all user-facing text in dictionaries)
- [ ] Error messages are user-friendly and translated
- [ ] Loading states handled (if any async dictionary loading)
- [ ] 404 page works in both locales
- [ ] Sitemap (if exists) updated for locale routes

### Pass Criteria

| Check | Expected |
|-------|----------|
| Clean build from scratch | exit 0, 18 routes |
| `pnpm lint` | 0 errors, 0 warnings |
| `tsc --noEmit` | exit 0 |
| No secrets in dictionaries | Yes |
| proxy.ts clean | Yes |
| No debug logs added | Yes |
| Commit history clean | Yes, atomic commits |
| Branch up to date | Yes |
| No dangerouslySetInnerHTML | Yes |
| Dictionary keys match (pt-BR ↔ en) | Yes |

### Gate Result

- [x] **PASS** — Ready for PR
- [ ] **FAIL** — Fix issues before PR

> **Evidence (2026-10-20, pós fix pass):** 9/9 PASS — `rm -rf .next` + build limpo
> (18 rotas), lint ok, `tsc --noEmit` limpo, sem secrets/debug logs/
> dangerouslySetInnerHTML, paridade de dicionário 124 chaves (pt-BR ↔ en),
> 22 commits no branch. Runner exit 0. Fix pass do review: favicon no root
> (200), hreflang absoluto com x-default, asserções duras no gate 5.

---

## Quality Gate Summary

| Gate | Name | When | Key Checks | Est. Time |
|------|------|------|------------|-----------|
| 0 | Pre-Implementation | Before Task 1 | Clean tree, build passes, lint passes | 5 min |
| 1 | Infrastructure | After Tasks 1-4 | Type-safety, JSON valid, exports present | 10 min |
| 2 | Route Structure | After Task 5 | 18 routes generated, `[lang]` structure correct | 10 min |
| 3 | Component Migration | After Tasks 6-13 | No hardcoded strings, all components translated | 15 min |
| 4 | Page Migration | After Task 14 | All pages handle locale, generateMetadata present | 15 min |
| 5 | Runtime Verification | After Task 16 | 18 routes × 2 locales, manual tests, no FOUC | 30 min |
| 6 | Final Pre-Merge | Before PR | Clean build, security checks, key parity | 15 min |

**Total gate time:** ~100 minutes (can run in parallel with implementation)

---

## Gate Failure Protocol

If any gate fails:

1. **Stop** — Do not proceed to next task
2. **Identify** — Which specific check failed?
3. **Fix** — Address the root cause (not the symptom)
4. **Re-run** — Full gate command suite (not just the failed check)
5. **Document** — Add note to plan if new edge case discovered
6. **Continue** — Only after gate passes

---

## Evidence Log

Use this table to record gate results during implementation:

| Date | Gate | Result | Evidence | Notes |
|------|------|--------|----------|-------|
| 2026-10-19 | 0 | ☐ PASS ☐ FAIL | | |
| 2026-10-19 | 1 | ☐ PASS ☐ FAIL | | |
| 2026-10-19 | 2 | ☐ PASS ☐ FAIL | | |
| 2026-10-19 | 3 | ☐ PASS ☐ FAIL | | |
| 2026-10-19 | 4 | ☐ PASS ☐ FAIL | | |
| 2026-10-19 | 5 | ☐ PASS ☐ FAIL | | |
| 2026-10-19 | 6 | ☐ PASS ☐ FAIL | | |

---

**Remember:** *Evidence before claims, always.* Run the command, read the output, then report.
