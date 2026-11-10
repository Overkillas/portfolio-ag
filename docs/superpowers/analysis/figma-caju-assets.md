# Mapeamento de assets — Caju (Figma node 17:5070)

Página completa do case (layout `wide`, `opensAsPage`), no padrão do Batuco-tuco e
do Pontinhas soltas. Cada imagem é o **export do nó do Figma em 2x**
(`download_assets`, escala 2), convertido para WebP (q86) em
`public/images/projects/caju/`, com a versão 1x (metade, Lanczos) ao lado. As
caixas (w × h em px do Figma) e a largura de cada arquivo 2x estão em `cajuImages`
(`components/case-study/cases/CajuCase.tsx`); o lightbox
(`components/case-study/caju/lightbox.ts`) usa os arquivos 2x.

| Arquivo | Nó | Caixa no Figma | Conteúdo |
|---|---|---|---|
| `hero` | 17:5177 | 1354 × 461 | Capa do case (duas páginas do livro) |
| `quadro` | 17:5216 | 631 × 568.46 | Quadro de planejamento (texto em PT dentro da arte, nos dois idiomas) |
| `brainstorm-1..3` | 17:5353, 17:5354, 17:5355 | 316.83 × 212.04, 316.8 × 322.8, 404.04 × 538.72 | Brainstorming |
| `painel-visual` | 17:5358 | 626.13 × 538.72 | Painel visual - Imagem a (colagem) |
| `teste-cores` | 17:5404 | 733.63 × 349.89 | Teste de cores e storyboard |
| `design-personagens` | 17:5416 | 608.15 × 349.79 | Design de personagens - Imagem b |
| `rafe-1`, `rafe-2` | 17:5431, 17:5432 | 668.88 × 366.84 / 366.63 | Rafes das páginas |
| `pintura-1`, `pintura-2` | 17:5438, 17:5439 | 665.54 × 364.43 / 386.67 | Pintura das páginas (coluna esquerda) |
| `diagramacao-1`, `diagramacao-2` | 17:5441, 17:5442 | 665.54 × 296.76 / 451.4 | Diagramação (coluna direita) |
| `impresso-1..3` | 17:5469..5471 | 520.78 / 520.78 / 292.94 × 390.58 | Mídia impressa |
| `pilha/pagina-1..6` | 17:5475, 17:5476, 17:5477, 17:5479, 17:5480, 17:5481 | 662 × 662 | Pilha em leque: imagem de preenchimento original (1103 × 1103); cantos de 30px e as sombras externa/interna do Figma vêm do CSS |
| `livro/face-00..31` | — | 631 × 631 | Faces do livro da "Simulação de leitura" (capa, dedicatória, páginas, contracapa), baixadas do canvas do Claude Design (`ProjetoCaju.dc.html`, na ordem das folhas) |

O livro segue a animação do canvas do Claude Design (não o Figma, que mostra só a
capa estática, nó 17:5487). Pilha e livro fazem snap ao chegar perto
(`lib/hooks/use-snap-into-view.ts`), sem trava de rolagem, e não abrem o lightbox.
