# PLANO — Identidade de evento: 15 anos como página completa + grade de /projetos

Spec: `docs/superpowers/specs/2026-11-09-identidade-evento-wide-rebuild.md`.

1. Assets: 30 nós do frame 17:4752 (`download_assets`, escala 2) → WebP q86 2x e
   1x (metade, Lanczos) em `public/images/projects/identidade-evento-15-anos/`;
   fontes em `imports_figma/cases/identidade-evento-15-anos/`. Mapa em
   `docs/superpowers/analysis/figma-identidade-evento-15-anos-assets.md`.
   Removidos `cover`, `banners`, `painel-led`, `menu-tags`.
2. `lib/projects.ts`: `layout: 'wide'`, `opensAsPage: true`, `coverImage` → `hero`.
3. Dicionários pt-BR e en: 6 tags, `heroAlt`, Prototipagem em 2 itens, alts por peça.
4. `IdentidadeEventoCase.tsx` + `identidade.module.css` (padrão Caju, corpo de
   1354 como o Cascavel) e `IdentidadeEventoHero`.
5. `components/case-study/identidade-evento/lightbox.ts` (30 itens).
6. Página no padrão `caju/page.tsx` (BatucoMotion, CaseTopBar, RelatedProjects).
7. `cases/index.ts`: hero em `caseCovers`.
8. Grade de `/projetos`: aspects e colunas (890 por coluna), ordem de `projectMeta`,
   recorte do Caju.
9. Gate 7 (checagem do CaseHeader genérica, links de todos os slugs), AGENTS.md
   (listas de cases `opensAsPage`, regra de balanceamento da grade) e a skill
   `portfolio-workflows`.
10. Verificar (gates em `docs/superpowers/quality-gates/2026-11-09-identidade-evento-wide-rebuild-gates.md`).
