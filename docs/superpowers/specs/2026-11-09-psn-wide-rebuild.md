# SPEC — Pontos sem nó como página completa (Figma 17:899)

Data: 2026-11-09. Branch: `feature/case-pontos-sem-no`. Figma: arquivo
`EGDJU9UG5XmLO6zV8Howwo`, frame `17:899` (1728 × 8255).

## Problema

O case tinha sido refeito do frame 17:899, mas no sistema antigo: layout estreito
do `CaseShell`, `Lightbox` + `CursorAmpliar` + `CaseImageButton` próprios,
`caseSlots` com seletores `:has()` sobre o `CaseShell`, header e footer antigos.
O frame é uma página completa como Batuco-tuco, Pontinhas soltas e Caju (barra
de voltar com seletor de idioma, "Talvez você goste…", "visite também").
Divergências medidas a 1728: pill "Concluído" e data que não existem no Figma;
tags sem a pill tracejada; intro 16px Light sem o negrito em "6 etapas";
numerais 01–06 escondidos por engano; diagrama cortado (aspect 659/190);
agradecimento em texto em vez do balão; página com 9940px de altura.

## Decisões (com o usuário)

1. Manual (17:1444) e pôsteres (CABE, Jogo do tempo, colagem final) ficam como
   imagem achatada do Figma, texto em português nos dois idiomas; os alts em
   inglês avisam isso.
2. Seguir o Figma: numerais 01–06 de volta; sem status e data; "Elemento de
   apoio" no singular na 1ª legenda; grafia "Brainsotrming" mantida em pt-BR.
   Os textos em pt-BR seguem o Figma palavra por palavra (Processo de criação e
   Prototipagem tinham sido reescritos).
3. Lightbox com um item por nó do Figma: 17 itens (Construção da marca vira 3;
   a grade de logos entra).
4. Assets reexportados por nó em 2x (`download_assets`, escala 2) → WebP 1x/2x.

**Revoga** na spec `2026-11-09-psn-visual-fix2.md`: item 3 (os "1 2 3 4" fazem
parte da arte do diagrama; o fix escondia os numerais do painel) e o plural
uniforme do item 6.

## Solução

- `projectMeta`: `layout: 'wide'`, `opensAsPage: true`.
- Página no padrão do Caju: `BatucoMotion`, `ZoomButton` no hero, `CaseTopBar`,
  `RelatedProjects`, `thanksMotion`.
- `PontosSemNoCase` no padrão do `CajuCase` (dados de layout no código, texto no
  dicionário); `pontos-sem-no/lightbox.ts` monta itens e aria-labels.
- Painel das etapas com a régua `--u = 100cqw / 660` (1px do Figma na coluna).
- Dicionário `projects.pontosSemNo` reorganizado: `heroAlt`, `sections.gallery`,
  `sections.tools`, `aiNote` no topo, `stepsLead*` para o negrito.
- Removidos `CaseImageButton`, `CursorAmpliar`, `Lightbox`, `Reveal` e
  `case-study.module.css` (só o PSN antigo usava) e os JPEGs antigos.
- Gate 7: o teste do header do site usa `identidade-evento-15-anos`.

## Fora de escopo

Componentes compartilhados (`CaseTopBar`, `ThanksBubble`, `RelatedProjects`,
`HomeFooter`). O vão entre os cards de "Talvez você goste…" e o footer é
≈127px no site contra 66px no Figma; é do `CaseShell`/`HomeFooter`, igual nos
outros cases 'wide'.
