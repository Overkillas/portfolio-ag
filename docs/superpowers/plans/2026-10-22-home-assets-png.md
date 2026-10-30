# Home Assets PNG Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 12 noise-rendering SVG/overlay assets of the home page with flattened PNGs exported @2x from the Figma file (Chrome rasterizes `feTurbulence`/`feFlood`/`feComposite` far denser than Figma; only baked pixels fix the grain/broken overlap).

**Architecture:** Figma MCP render (get_screenshot, contentsOnly) → PNG per node in `public/images/home/` → src-swap / overlay-removal in 5 code files + deletion of `DecorativeBlob.tsx` (dead). Text (crachá saying) STAYS live `<p>`; réguas stay `cracha-linha.svg` (no noise filter). Placement geometry comes from the Figma metadata bboxes already recorded in the spec.

**Tech Stack:** Next.js SSG bilingual portfolio, Figma MCP (`gpvzpeRYWxlqqonbHdj88g`), Playwright @1.64.1 (verification harness at `/tmp/pwtest`), ImageMagick (`magick`).

**Spec:** `docs/superpowers/specs/2026-10-22-home-assets-png-design.md` (binding; the plan argues from it)

## Global Constraints

- Branch: `fix/home-assets-png`, derived from `feature/new-home` (`git checkout -b fix/home-assets-png feature/new-home`). BASE commit = `b2a9e7b`.
- **i18n rule zero:** every visible string in both dictionaries in the same change. This swap introduces NO new strings — alts (`greetingAlt`, `contactIllustrationAlt`, `peekingAlt`, crachá alt) are kept from the existing keys. Crachá saying stays the live `<p>` (`dict.home.crachaSaying`), rulers stay SVG.
- All new PNGs in `public/images/home/`. All @2x (device-pixel-ratio 2). Transparent background, no CSS opacity/shadow/filter added.
- Text/images: no text goes inside any PNG. `ContactForm.tsx` untouched. Header/Footer untouched.
- Old asset files: delete ONLY after `grep -rn "<name>" --include="*.tsx" --include="*.ts" app components` returns no consumer other than the one being rewritten.
- Commits: English subjects, trailer `Co-Authored-By: Claude Code <noreply@anthropic.com>`.
- Gates: `pnpm build` + `pnpm lint` + `pnpm exec tsc --noEmit` every task; `./scripts/check-quality-gates.sh 3 4 5 6` at final task. (ESLint note: cookie writes irrelevant here; do not add `document.cookie`.)
- Verification tooling: Playwright NOT in repo. If `/tmp/pwtest/node_modules/playwright` missing: `cd /tmp && mkdir -p pwtest && cd pwtest && npm init -y && npm i playwright@1.64.1`; launch ALWAYS with `executablePath: '/home/jvbarr/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome'` (headless-shell path is broken in this install). ImageMagick: `magick` (not `convert`).

## Figma MCP conventions (every task)

- The implementing agent calls `mcp__plugin_figma_figma__create_session(fileKey="gpvzpeRYWxlqqonbHdj88g", description="...")` once, then passes the returned `sessionId` on every file-tool call.
- Export one node: `mcp__plugin_figma_figma__get_screenshot(nodeId, fileKey, maxDimension, contentsOnly=true)` → returns a short-lived URL + `curl` instructions; download immediately to the listed path.
- `maxDimension` = round(2 × expected CSS display size's longest edge). After download, `magick identify` the PNG: expected pixel dims = 2× the CSS size listed below. If the PNG's dims are ≥15% off the expectation, re-request with adjusted `maxDimension` — and if content looks scaled/clipped, drop `contentsOnly=false` or export the parent node (rule §3.3: baked shadow never gets a straight edge).
- **Upright, not AABB-rotated:** precedent (Phase 1, `cracha-elipse-378.png` 228×202 vs natural 103.33×91.306, commit 02f5abb) confirms get_screenshot renders node CONTENT upright including its shadow bleed — so crachá src-swaps keep the existing rotate-wrapper chain unmodified.
- Reference render for pixel-match (must exist before Task 7; re-download if `/tmp/pn-visual/` vanished — it has before): `get_screenshot(nodeId="751:1318", maxDimension=1728)` → `mkdir -p /tmp/pn-visual && curl -o /tmp/pn-visual/fig-full-1x-1728.png <url>` (expected 1728×4614).

## Asset manifest (Task 1 produces; Tasks 2-6 consume)

All paths relative to repo root; all in `public/images/home/`.

| # | PNG file | Figma node | Figma bbox (x, y, w×h) | CSS display size (PX = PNG dims/2) | Replaces |
|---|---|---|---|---|---|
| 1 | `ellipse-1.png` | 758:112 | 581, 1608, 879×879 | 879×879 | `ellipse-1.svg` (page.tsx:100) |
| 2 | `ellipse-2.png` | 758:110 | 1131, 3486, 454.566×454.566 | 455×455 | `ellipse-2.svg` (page.tsx:149) |
| 3 | `ellipse-3.png` | 758:298 | 27, 1125, 454.566×454.566 | 455×455 | `ellipse-3.svg` (page.tsx:84) |
| 4 | `ellipse-4.png` | 758:111 | 74, 3669, 694.981×694.981 | 695×695 | `ellipse-4.svg` (page.tsx:165) |
| 5 | `ellipse-5.png` | 758:297 | 1394, 436, 694.981×694.981 | 695×695 | `ellipse-5.svg` (page.tsx:68) |
| 6 | `ola-personagem.png` | 751:1399 | 121, 557, 651.959×557 | 652×557 | `ola.svg` + `ola-mao.svg` overlay (GreetingSection) |
| 7 | `cracha-corpo.png` | 757:95 | AABB 361.355×448.188 | ≈282×408 (upright canvas, measured) | `cracha-exclude.svg` (PhilosophySection:70) |
| 8 | `cracha-anel.png` | 757:98 | AABB 102.322² | ≈84×84 (measured) | `cracha-buraco.svg` (PhilosophySection:98) |
| 9 | `cracha-elipse-378.png` | 757:99 | 123.702×115.263 | 113.68×100.507 (re-export; precedent is 228×202) | (current PNG) |
| 10 | `cracha-petala.png` | 757:100 | AABB 125.164×145.207 | ≈108×135 (measured) | `cracha-union.svg` (PhilosophySection:162) |
| 11 | `espiando.png` | 751:1329 | 901.74, 1894, 676.02×360.52 | 676×361 | `espiando.svg` + hand-mapped stretch (PeekingCharacter) |
| 12 | `contato-personagem.png` | 751:1360 | 254, 3437, 555×675.61 | 555×676 | `contato.svg` + `contato-extra.svg` overlay (ContactSection) |

**Consume rule for every src-swap (all of Tasks 2-6):** set the `<img>` `width`/`height` (and any explicit CSS size) to the MEASURED PNG dims ÷ 2, keeping the existing positioning wrapper (left/top/percentage geometry) untouched. If `identify` shows dims >15% different from the manifest's CSS size, do NOT silently stretch: anchor by opaque content instead — `magick png -alpha extract -format "%@" info:` gives the opaque bbox inside the PNG; position/size so that opaque bbox lands exactly on the Figma bbox coordinates listed above. The pixel-match crop is the judge.

## Review Focus

- **Bleed anchoring** — a PNG canvas that includes shadow bleed must not shift the art when swapped for a canvas that doesn't (or vice-versa). Expectation: opaque content sits at the Figma bbox from the manifest, so the full-page crop pixel-match is Δ≤5 in mean alpha. Test: Task 7 crops.
- **Envelope singularidade** — after Task 5 the envelope appears EXACTLY once (baked in `contato-personagem.png`); `contato-extra.svg` must be deleted. Test: Task 5 grep zero refs + visual crop.
- **Mobile** — greeting/contact PNG is one file for all breakpoints; the hand now shows <md (approved call, spec §3.2). Expectation: at 390px viewport the char renders centered, no horizontal scrollbar, hand visible. Test: Task 7 step.
- **Other pages** — `Illustration.tsx` maps `/images/contato.png` (different file) and study/case PNGs are untouched; deleted names must not be referenced outside home. Test: Task 7 regression step visits /pt-BR/estudos, /pt-BR/contato, one case study.
- **Asset weight** — noise-texture @2x PNGs can balloon. Expectation: every PNG ≲1.5MB; the final `ls -la` is listed in the plan-close check. Test: Task 7 step.

---

### Task 1: Branch + export 12 PNGs + asset commit

**Files:**
- Create: `public/images/home/{ellipse-1,ellipse-2,ellipse-3,ellipse-4,ellipse-5,ola-personagem,cracha-corpo,cracha-anel,cracha-elipse-378,cracha-petala,espiando,contato-personagem}.png`

**Interfaces:**
- Consumes: Figma MCP session; manifest table above.
- Produces: the 12 PNG files at the exact manifest paths (later tasks reference `src="/images/home/<file>`.png"`); measured-dims table recorded in the task report.

- [ ] **Step 1: Derive the branch** — `git status` must be clean of NEW unrelated code (the pre-existing dirty `ola.svg`/`ola_.svg` are expected and stay untouched — they die in Task 3). Run: `git checkout -b fix/home-assets-png feature/new-home`. Expected: branch created at `b2a9e7b`.

- [ ] **Step 2: Export the 12 nodes** via the Figma MCP conventions above, one `get_screenshot` per manifest row (ellipses: 1758/909/909/1390/1390; personagens: 1304, ~820, ~210, 228, ~270, 1352, 1352 — use the manifest CSS size ×2), curl each URL straight to `public/images/home/`. Record in the task report: node id → file path → measured pixel dims.

- [ ] **Step 3: Verify each PNG** — `magick identify` every file; alpha channel present (`-alpha extract` non-degenerate), no straight opaque edge clipped around baked shadows on the crachá/group assets (open the 4 crachá + 2 group PNGs and check the shadow fades to transparent, not cut). Flag any file >1.5MB in the report (do not silently downscale).

- [ ] **Step 4: Commit assets only**

```bash
git add public/images/home/*.png
git commit -m "assets(home): add 12 flattened figma pngs @2x replacing filtered svgs"
```

(commit message ends with the trailer line; body lists measured dims per file)

### Task 2: Ellipses swap (page.tsx) + delete dead SVG map

**Files:**
- Modify: `app/[lang]/page.tsx:68,84,100,149,165` (5 `src` values)
- Delete: `public/images/home/ellipse-{1,2,3,4,5}.svg`, `components/home/DecorativeBlob.tsx`

**Interfaces:**
- Consumes: `ellipse-{1..5}.png` (Task 1).
- Produces: nothing consumed downstream; page compiles with zero references to the old SVGs.

- [ ] **Step 1: Swap the 5 `src` attributes** — `/images/home/ellipse-N.svg` → `/images/home/ellipse-N.png` (N ∈ 1..5, each at the line in Files). Keep `width`/`height`, `left`/`top` style, `hidden md:block`, comments untouched.

- [ ] **Step 2: Delete dead component first, then SVGs** — `git rm components/home/DecorativeBlob.tsx` (dead component; only non-home referencer of the ellipse SVGs — its deletion must land in the SAME commit as the src swap), then `grep -rn 'ellipse-[1-5].svg' app components lib` must return zero before `git rm -q public/images/home/ellipse-1.svg public/images/home/ellipse-2.svg public/images/home/ellipse-3.svg public/images/home/ellipse-4.svg public/images/home/ellipse-5.svg`. If an unexpected consumer appears besides the five srcs just swapped, STOP and report (do not delete; report which page uses it).

- [ ] **Step 3: Verify visually** — build + serve, screenshot `/pt-BR` full page @1728 (harness in Global Constraints), crop the rosa-topo region (e.g. `magick full.png -crop 700x560+0+60 /tmp/crop-e5.png` and analogously contact-region 660x500+1000+3380). Expected: alpha-mean within ±5 of the same crops of the Figma reference render; dense static grain gone vs current impl.

- [ ] **Step 4: Gates + commit** — `pnpm build && pnpm lint && pnpm exec tsc --noEmit` clean.

```bash
git add app/"[lang]"/page.tsx && git rm -q public/images/home/ellipse-1.svg public/images/home/ellipse-2.svg public/images/home/ellipse-3.svg public/images/home/ellipse-4.svg public/images/home/ellipse-5.svg && git rm -q components/home/DecorativeBlob.tsx
git commit -m "fix(home): flattened figma ellipses as png @2x"
```

### Task 3: Greeting character — one flattened PNG

**Files:**
- Modify: `components/home/GreetingSection.tsx:31-61` (illustration block + overlay removal)
- Delete: `public/illustrations/ola.svg` (carries a pre-existing uncommitted re-export — documented in spec §3.2 as discarded), `public/illustrations/ola_.svg` (untracked backup)

**Interfaces:**
- Consumes: `ola-personagem.png` (652×557 CSS, hand baked).
- Produces: GreetingSection renders a single img; no overlay layer remains.

- [ ] **Step 1: Replace the illustration block** — inside the existing `<div className="relative mx-auto md:mx-0">` keep exactly ONE img: `src="/images/home/ola-personagem.png"`, `alt={home.greetingAlt}` (unchanged key), measured dims (≈652×557). Desktop: `md:ml-[-8.05vw] md:w-[37.73vw] h-auto` (manifest: art starts at x=121 while the column starts at 15.05vw=260px → −139px/1728; width 651.959/1728). Mobile: `mx-auto` (already on the wrapper) and full-column width via `w-full`. Delete the `ola-mao.svg` overlay img and its comment block entirely. Update the doc comment (§ lines about ola.svg x=260 and the mão overlay) to describe the flattened PNG at Figma x=121.

- [ ] **Step 2: Delete old files** — `grep -rn 'ola.svg\|ola_.svg' app components lib` zero refs (besides none; the `ola_.svg` is untracked), then `git rm public/illustrations/ola.svg && rm public/illustrations/ola_.svg`.

- [ ] **Step 3: Verify visually** — serve, screenshot @1728, crop `900x900+60+700`. Expected: hand overlaps the cheek as in the Figma reference (not detached, no straight-clip shadow), head + hand grain matches Figma, alpha-mean Δ≤5 vs reference crop. At 390px viewport: char centered in column, no horizontal scrollbar (Review Focus).

- [ ] **Step 4: Gates + commit** — as Global Constraints.

```bash
git add components/home/GreetingSection.tsx && git rm -f -q public/illustrations/ola.svg
git commit -m "fix(home): flattened greeting character bake-in hand overlap and shadows"
```

(`git rm -f` because ola.svg carries an uncommitted modification — the discarded re-export documented in spec §3.2. `rm public/illustrations/ola_.svg` — untracked, no git add; delete before committing and say so in the body.)

### Task 4: Peeking character — replace hand-tuned stretch

**Files:**
- Modify: `components/home/PeekingCharacter.tsx:23-51` (inner img + doc comment)

**Interfaces:**
- Consumes: `espiando.png` (676×361 CSS in the existing `peeking-box`).
- Produces: flat img filling `peeking-box`; no offsets/stretch values remain.

- [ ] **Step 1: Swap the img** — `src="/images/home/espiando.png"`, `alt={dict.home.peekingAlt}` unchanged, remove the absolute offset/stretch style (`left/top/width/maxWidth`, the SVG-bleed mapping comment) — replace with the flat render: `width={676} height={361}` `className="absolute inset-0"` (or per the measured dims if the PNG canvas ≠ 1352×721 — apply the manifest Consume rule). Keep wrapper geometry: `peeking-box`, −mb-[21px], marginLeft 53.77%, overflow-x clip (Plan 4 seam frozen — spec §3.4). Update doc comment.

- [ ] **Step 2: Delete old file** — grep zero refs → `git rm public/illustrations/espiando.svg`. (If non-home refs exist — spec predicts none — STOP and report.)

- [ ] **Step 3: Verify visually** — crop `660x400+1050+1800` of /pt-BR @1728. Expected: char matches Figma reference (opaque bbox at 901.74,1894; no non-uniform distortion; ~21px overlap with gallery preserved).

- [ ] **Step 4: Gates + commit**

```bash
git add components/home/PeekingCharacter.tsx && git rm -q public/illustrations/espiando.svg
git commit -m "fix(home): flat peeking-character render replaces stretched svg mapping"
```

### Task 5: Contact character + envelope — one flattened PNG

**Files:**
- Modify: `components/home/ContactSection.tsx:37-68` (illustration block, overlay removal, doc comment)
- Delete: `public/illustrations/contato.svg`, `public/illustrations/contato-extra.svg`

**Interfaces:**
- Consumes: `contato-personagem.png` (555×676 CSS — equals the current column width 32.12vw@1728; envelope baked).
- Produces: single img; overlay gone.

- [ ] **Step 1: Replace the illustration block** — keep ONE img: `src="/images/home/contato-personagem.png"`, `alt={home.contactIllustrationAlt}`, `width={555} height={676}` (correct to measured/2), `h-auto w-full` (column already 32.12vw). Delete the `contato-extra.svg` overlay img + its comment. Update doc comment (envelope now baked; remove the %-offset recipe lines).

- [ ] **Step 2: Delete old files** — grep zero → `git rm public/illustrations/contato.svg public/illustrations/contato-extra.svg`. NOTE: `Illustration.tsx:15` maps `/images/contato.png` — a DIFFERENT file for other pages; it must remain; the grep distinguishing this is `contato.svg`/`contato-extra.svg`, not `contato.png`.

- [ ] **Step 3: Verify visually** — crop `700x660+60+3480` of /pt-BR @1728. Expected: exactly ONE envelope (on the char's letter pad, as Figma), hand on face correct, alpha-mean Δ≤5; no double envelope from a lingering overlay.

- [ ] **Step 4: Gates + commit**

```bash
git add components/home/ContactSection.tsx && git rm -q public/illustrations/contato.svg public/illustrations/contato-extra.svg
git commit -m "fix(home): flattened contact character includes baked envelope"
```

### Task 6: Crachá — src-swaps in the untouched rotate chain

**Files:**
- Modify: `components/home/PhilosophySection.tsx:70,98,133,162` (4 `src` + measured dims) + doc comment lines 8-21 (asset refs)
- Delete: `public/images/home/cracha-exclude.svg`, `cracha-buraco.svg`, `cracha-union.svg` (KEEP `cracha-linha.svg` — rulers render byte-faithful, no noise filter; KEEP the current `cracha-elipse-378.png` until overwritten by the re-export)

**Interfaces:**
- Consumes: `cracha-{corpo,anel,petala}.png` + `cracha-elipse-378.png` re-export (Task 1). Rotation chain (15.24° wrappers, bleed insets, ruler 14.8°, saying wrapper at left −1.7/top 237.3) UNMODIFIED, including the `<p>` with `dict.home.crachaSaying`.
- Produces: crachá renders grain-free with baked shadows/petal/hole; text stays translatable.

- [ ] **Step 1: Swap 4 srcs + set measured dims** — `cracha-exclude.svg`→`cracha-corpo.png`, `cracha-buraco.svg`→`cracha-anel.png`, `cracha-union.svg`→`cracha-petala.png` (both img lines + `width`/`height` props at the manifest's measured/2 values — for the 378 PNG also update the `width`/`height` inline style if the re-export's dims differ from 228×202, adjusting the inset-% bleed values proportionally if the canvas ratio changed). The `alt={alt}` prop stays on the corpo img (badge = the alt-bearer); anel/pétala keep `alt="" aria-hidden`.

- [ ] **Step 2: Delete replaced files** — grep zero for `cracha-exclude.svg|cracha-buraco.svg|cracha-union.svg` → `git rm`. Do NOT delete `cracha-linha.svg` or `cracha-clip.png` (other pages may use clip).

- [ ] **Step 3: Verify visually** — crop `450x450+1150+1200` of /pt-BR @1728. Expected: hole reads as cream-through (opaque hole = FAIL — check by overlaying crop vs reference), petal grain-free (no silver noise), corpo shadow organic; saying text still rendered as live text on top (crop shows text pixelated as text, i.e. not baked — compare /pt-BR vs /en crops: saying differs between locales, art identical).

- [ ] **Step 4: Gates + commit**

```bash
git add components/home/PhilosophySection.tsx && git rm -q public/images/home/cracha-exclude.svg public/images/home/cracha-buraco.svg public/images/home/cracha-union.svg
git commit -m "fix(home): flattened cracha parts keep live text and rulers"
```

### Task 7: Full verification + final commit

**Files:**
- Modify (if pixel-match catches drift): any of Tasks 2-6's files.

**Interfaces:**
- Consumes: everything above; Figma reference render re-downloaded (see conventions).

- [ ] **Step 1: Gates** — `pnpm build && pnpm lint && pnpm exec tsc --noEmit && ./scripts/check-quality-gates.sh 3 4 5 6` — all PASS (gate script = 14 checks; any FAIL is fixed, not waived).

- [ ] **Step 2: Full-region pixel-match** — screenshot /pt-BR @1728 full page; crop + alpha-mean every region from spec §5.2 (greeting char, crachá, ellipse-contact region, contact char, peek, rosa-topo). Target: Δ≤5 mean alpha per crop vs the Figma reference, no visible structural divergence (grain, hole, petal, hand-on-cheek, organic shadows).

- [ ] **Step 3: Locales + regression** — `/pt-BR` and `/en`: saying translated over the art; alts correct (inspect `img` elements in the served HTML). `/pt-BR/estudos`, `/pt-BR/contato`(page), one `/pt-BR/projetos/*` case: load 200 and look right (other-page PNGs untouched).

- [ ] **Step 4: Asset weight** — `ls -la public/images/home/*.png`: report the 12 byte sizes; flag anything >~1.5MB.

- [ ] **Step 5: Final commit (if fixes) + close report** — commit any drift fixes with the trailer; report lists: commits, pixel-match table (crop → impl alpha → figma alpha), byte sizes, gate status.