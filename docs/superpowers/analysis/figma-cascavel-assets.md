# Mapeamento de assets — Cascavel (Figma node 17:4049)

Fonte: `download_assets(nodeId, defaultScale 2)` de cada nó do arquivo
`EGDJU9UG5XmLO6zV8Howwo` (2026-11-09), salvos em `imports_figma/cases/cascavel/`
(fora do git). Cada export vira WebP q86 em `public/images/projects/cascavel/`:
`<nome>@2x.webp` (o export) e `<nome>.webp` (metade). Cartões e letreiros são
WebP **lossless**: no lossy a subamostragem de cor vazava 2–3px nas bordas das
cores chapadas (MAE 10.8 → 3.1). Coordenadas em px do Figma; larguras e alturas
em `cascavelImages` (`components/case-study/cases/CascavelCase.tsx`).

| Arquivo | Nó | Caixa (w × h) | Conteúdo |
|---|---|---|---|
| `hero` | 17:4156 | 1354 × 436 | Capa: `view3 1` com blur 4.257 + selo SVG da serpente, achatados |
| `fluxo` | 17:4190 | 1353 × 242.13 | Mapa de fluxo do jogo |
| `paineis` | 17:4215 | 762 × 333.94 | Painéis de referência ao lado de "Prototipagem" |
| `imagem-a` | 17:4218 | 1354 × 1457 | "Imagem a": quadro #333 com as 6 pranchas (17:4221…17:4228), achatado |
| `escolinha` | 17:4236 | 775.57 × 603.24 | Imagem b: cena da feirinha com os cartões no varal |
| `pintura` | 17:4234 | 566.01 × 377.34 | Imagem b: pintura da Cascavel |
| `blender` | 17:4235 | 566.01 × 214.67 | Imagem b: captura do Blender |
| `cartoes` | 17:4255, 4259, 4283, 4344, 4374, 4434, 4363, 4238 + sol 17:4418 | 775.31 × 112.48 | Recorte do export 2x da colagem 17:4231 (x 0, y 645.89) |
| `fruta` | 17:4237 | 119.83² | Imagem b: textura da fruta |
| `casarao` | 17:4232 | 362.26 × 363.19 | Imagem b: casarão azul |
| `letreiros` | 17:4480, 17:4600, 17:4633 | 971.28 × 206.47 | Recorte do export 2x da colagem 17:4231 (x 0, y 802.87) |
| `seta-a/b/c` | 17:4655…17:4661 (vetores 1351–1357) | ver `arrows` | SVGs do Figma rasterizados em 2x (sharp/librsvg) e compostos com o inset de cada vetor; ficam por cima das fotos, então não dá para recortar do export |
| `versao-1…3` | 17:4665…17:4667 | 448.3 × 336.23 | Primeiras versões, fotos 4:3 |
| `versao-4…9` | 17:4669…17:4675 | 448.41 × 252.23 | Primeiras renderizações 16:9 |
| `render-1…6` | 17:4708…17:4713 | 1354.36 × 677.18 (4: 693.21, 5: 761.83) | Renders finais |

O `hero.webp` é também o `coverImage` do card (`lib/projects.ts`).

Lightbox (26 itens, ordem de `LB` / `getCascavelLightbox`): hero, fluxo, painéis,
Imagem a, escolinha, pintura, blender, cartões, fruta, casarão, letreiros,
versao-1…9, render-1…6.

Leftovers do frame, não implementados: 17:4050 "Frame 83" (fora do canvas,
y = 11701) e 17:4139 "Frame 100885" (frame vazio).
