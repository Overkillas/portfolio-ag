# SPEC — Cascavel como página completa (Figma 17:4049)

Data: 2026-11-09. Branch: `feature/case-cascavel`. Figma: arquivo
`EGDJU9UG5XmLO6zV8Howwo`, frame `17:4049` (1728 × 10990).

## Problema

O case tinha sido feito do frame 17:4049 (commit 406a34d), mas no sistema
antigo: layout estreito do `CaseShell`, `CaseImageButton` + `Lightbox` +
`CursorAmpliar` + `Reveal` próprios, `CascavelPan`, `caseSlots`, header e footer
antigos, JPEGs recortados de um export 3x da página e regex sobre o texto do
dicionário para negrito e sublinhado. O frame é uma página completa como os
outros cases 'wide' (barra de voltar, "Talvez você goste…", "visite também").

## Decisões (com o usuário)

1. Página completa: `layout: 'wide'` + `opensAsPage: true`, padrão Caju/PSN.
   Fora do Figma só as animações nas imagens, o lightbox e o seletor de idioma.
2. Imagem b: cartões de diálogo (Xilosa) e letreiros (Asteristico) entram como
   arte achatada do Figma, com texto em português nos dois idiomas; os alts em
   inglês avisam isso e transcrevem o texto.
3. Sem o pan ligado ao scroll nos renders finais (ANIMACOES §3): só zoom no
   hover, reveal e lightbox, como nos outros cases 'wide'.
4. Imagem a é um item só do lightbox (quadro achatado, zoom de quadro grande).
5. Assets reexportados por nó em 2x → WebP 1x/2x.

## Solução

- `CascavelCase` no padrão do `CajuCase` (layout no código, texto no
  dicionário); `cascavel/lightbox.ts` monta 26 itens e os aria-labels.
- O corpo do case é o frame de 1354px do Figma (`.body`, 2px mais largo que a
  coluna de 1352 do `CaseShell`), assim as imagens de largura total e as
  colunas em % de 1354 ficam 1:1; o hero também tem 1354.
- Colagem da Imagem b com as caixas do `get_metadata` em % da colagem
  (1351.69 × 1009.33, x = 2.31); abaixo de 48rem as peças empilham.
- Dicionário `projects.cascavel` reorganizado: `heroAlt`, `sections.gallery`
  (legendas e alts), `tools`, `credits` (segmentos + autores com links reais do
  Sketchfab, como no Figma), `execution`, `aiNote` no topo; negrito em
  Amanda/Raquel/Felipe com chaves partidas. Sai `lightbox.items`.
- Intro: quebra simples entre os dois primeiros parágrafos (`\n`) e linha em
  branco antes do terceiro (`\n\n`), como no nó 17:4184.
- Removidos `CascavelPan`, `CaseImageButton`, `CursorAmpliar`, `Lightbox`,
  `Reveal` e `case-study.module.css` (só o Cascavel antigo usava) e os JPEGs.

## Fora de escopo

Componentes compartilhados (`CaseTopBar`, `ThanksBubble`, `RelatedProjects`,
`HomeFooter`). Pills levemente mais largas que no Figma (Clother no Chrome),
como nos outros cases.
