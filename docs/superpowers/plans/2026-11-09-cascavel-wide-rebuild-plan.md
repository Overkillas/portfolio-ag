# PLAN — Cascavel como página completa

Spec: `docs/superpowers/specs/2026-11-09-cascavel-wide-rebuild.md`.

1. Assets: `download_assets(nodeId, defaultScale 2)` de 17:4156, 17:4190,
   17:4215, 17:4218, 17:4231 (colagem inteira, para os recortes), 17:4232,
   17:4234–4237, 17:4665–4667, 17:4669–4671, 17:4673–4675, 17:4708–4713; SVGs dos
   vetores 1351–1357 para as setas. WebP q86 em 2x e 1x; cartões e letreiros
   lossless. Apagar os JPEGs. Mapa: `docs/superpowers/analysis/figma-cascavel-assets.md`.
2. `lib/projects.ts`: `layout: 'wide'`, `opensAsPage: true`, capa `hero.webp`.
3. Dicionários: reconstruir `projects.cascavel` (pt-BR literal do Figma, en).
4. `CascavelCase.tsx` + `cascavel.module.css` reescritos (padrão Caju/PSN).
5. `components/case-study/cascavel/lightbox.ts`.
6. `app/[lang]/projetos/cascavel/page.tsx` (padrão Caju).
7. `cases/index.ts`: `caseCovers` com o hero; tirar o slot do Cascavel.
   Remover os componentes órfãos.
8. AGENTS.md: Cascavel nas listas de cases `opensAsPage`.
9. Verificar: build, lint, tsc, gates 3–7; Playwright a 1728 contra o render
   1:1 do Figma (deslocamento e MAE por região); 390–1920 nos dois idiomas sem
   rolagem horizontal; lightbox (26 itens, teclado, Esc).
