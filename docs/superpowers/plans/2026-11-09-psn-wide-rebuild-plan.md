# PLAN — Pontos sem nó como página completa

Spec: `docs/superpowers/specs/2026-11-09-psn-wide-rebuild.md`.

1. Assets: `download_assets(nodeId, defaultScale 2)` de 17:1003, 17:1138,
   17:1165/1206/1208, 17:1283, 17:1288, 17:1407/1411/1414/1417, 17:1444, 17:1948,
   17:2026, 17:2070, 17:2072; diagrama recortado do export de 17:1294 a partir de
   x=693 (os traços passam da caixa de 17:1320). WebP q86 em 2x e 1x (metade);
   xadrez-m1/m2 = metades da grade. Apagar os JPEGs.
2. `lib/projects.ts`: `layout: 'wide'`, `opensAsPage: true`.
3. Dicionários: reconstruir `projects.pontosSemNo` (pt-BR e en) com textos do
   Figma, 17 alts/legendas, chaves partidas para "6 etapas".
4. `PontosSemNoCase.tsx` + `pontos-sem-no.module.css` reescritos (padrão Caju).
5. `components/case-study/pontos-sem-no/lightbox.ts`.
6. `app/[lang]/projetos/pontos-sem-no/page.tsx` (padrão Caju).
7. `cases/index.ts`: `caseCovers` com o hero; tirar o slot do PSN. Remover os
   componentes órfãos.
8. Gate 7 e AGENTS.md.
9. Verificar (ver gates).
