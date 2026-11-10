# Mapeamento de assets — Identidade de evento: 15 anos (Figma node 17:4752)

Página completa do case (layout `wide`, `opensAsPage`), no padrão do Caju e do
Cascavel. Cada imagem é o **export do nó do Figma em 2x** (`download_assets`,
escala 2), convertido para WebP (q86; todas opacas, e o lossless nunca ficou a
≤ 1,3× do q86) em `public/images/projects/identidade-evento-15-anos/`, com a versão
1x (metade, Lanczos) ao lado. As caixas (w × h em px do Figma) e a largura de cada
arquivo 2x estão em `eventoImages`
(`components/case-study/cases/IdentidadeEventoCase.tsx`); o lightbox
(`components/case-study/identidade-evento/lightbox.ts`) usa os arquivos 2x.

| Arquivo | Nó | Caixa no Figma | Conteúdo |
|---|---|---|---|
| `hero` | 17:4857 | 1354 × 674 | Capa (frame branco com a arte final do jardim) |
| `painel-1`, `painel-2` | 17:4897, 17:4907 | 673.01 × 487.36 | Painéis de referências - Versão 1 e 2 (colagens achatadas) |
| `proto-1..5` | 17:4951, 17:4954, 17:4957, 17:4960, 17:4963 | 261.975 × 358.464 | Teste de diagramação, rascunho, ilustração crua, 1ª versão do Save the Date, teste de cores |
| `convite-1` | 17:4969 | 337.662 × 450.216 | Esboço a lápis (recorte `object-bottom` do Figma já no export) |
| `convite-2..4` | 17:4970..4972 | 328.865 × 449.99 | Ilustração e convites finais |
| `banner-1`, `banner-2` | 17:5003, 17:5004 | 674.93 × 168.732 | Banners horizontais empilhados |
| `banner-3` | 17:5005 | 679.149 × 339.575 | Arte com o monograma e ornamentos |
| `led-1`, `led-2` | 17:5010, 17:5011 | 674.93 × 337.465 | Arte para painel de Led (suave / saturada) |
| `menu-1`, `menu-2` | 17:5016, 17:5017 | 357.029 / 357.174 × 728.338 | Frente e verso do menu (no Figma, recortes da mesma imagem) |
| `tag-1..3` | 17:5020..5022 | 200.429 × 343.853 | Tags de sandálias 39/40, 35/36, 37/38 (recortes da mesma imagem) |
| `adesivo` | 17:5024 | 274.112 × 376.601 | Adesivo de caixa de fatia de bolo |
| `tag-bem-vividos` | 17:5025 | 235.906 × 236.21 | Tag de lembrancinha |
| `evento-1..6` | 17:5031..5033, 17:5035..5037 | 445.64 × 594.18 (5–6: 445.575 × 594.1) | Aplicações no evento (fotos) |

O texto dentro das peças (monograma, "15 anos", frases das tags, menu) está em
português nos dois idiomas: é o material entregue à cliente; os alts em inglês
traduzem as frases.
