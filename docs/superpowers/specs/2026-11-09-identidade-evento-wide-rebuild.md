# SPEC — Identidade de evento: 15 anos como página completa (Figma 17:4752) + grade de /projetos

Data: 2026-11-09. Branch: `feature/identidade-evento-15-anos`. Figma: arquivo
`EGDJU9UG5XmLO6zV8Howwo`, seção "Identidade de evento", frame `17:4752`
(1728 × 6823).

## Problema

O case existia (commit 6c0519c) no layout estreito do `CaseShell`: abria no
modal, com o header do site, imagens 1x achatadas em blocos (`banners`,
`painel-led`, `menu-tags`) e só 2 tags. O frame novo é uma página completa como
os outros cases 'wide' (barra de voltar, "Talvez você goste…", "visite também").
Era o último case estreito.

A grade de `/projetos` estava desbalanceada: com o `aspect` como altura em px de
design, as colunas somavam 590 | 574 | 1278 (15 anos, Caju e Cascavel na
terceira), sobrando ~500px vazios sob as duas primeiras a 1180px.

## Decisões (com o usuário)

1. Página completa (`layout: 'wide'` + `opensAsPage: true`), fiel ao Figma.
   Fora do Figma só as animações nas imagens, o lightbox e o seletor de idioma
   (`CaseTopBar`), como Caju e Pontinhas soltas.
2. Lightbox: cada painel de referências (colagem de 6 e 8 fotos) é um item só,
   achatado; as outras peças abrem uma a uma — 30 itens com o hero.
3. "Talvez você goste…": o `RelatedProjects` compartilhado (2 aleatórios). O
   Figma mostra Pontinhas + a própria capa do 15 anos, que é placeholder.
4. Tags: as 6 do Figma (pt literal, en traduzido).
5. Grade: 3 colunas balanceadas (estreita | larga | larga), o card DESTAQUE
   continua alto; redistribuir e mudar só os aspects necessários. Não há frame
   da grade no Figma (veio do protótipo da designer).

## Solução

- `IdentidadeEventoCase` no padrão do `CajuCase`: `eventoImages` (caixas do
  Figma + largura do arquivo 2x), `LB`, `eventoSrc`, `Pic`; texto no dicionário.
  Corpo de 1354px (`.body`, como o Cascavel) e hero de 1354 × 674
  (`IdentidadeEventoHero`, registrado em `caseCovers`).
- Fileiras flex com pesos = larguras do Figma e vãos do Figma em px; abaixo de
  48rem viram grade (2 colunas nas peças em retrato). Os banners (1358.22) e as
  fotos do evento (1357) passam alguns px da coluna, como no Figma.
- As pills das ferramentas somam 680px numa caixa de 641 no Figma: não quebram
  a partir de 1434px (coluna cheia), senão "Projeto final" desceria 21px.
- `identidade-evento/lightbox.ts`: 30 itens 2x; legenda de cada grupo é um texto
  que já está na página; aria-label com o alt quando a legenda é compartilhada.
- Dicionário: 6 tags, `heroAlt`, parágrafo de Prototipagem em 2 itens (o `<br>`
  do Figma, renderizado com `<br/>` em JSX), alts por peça (3 banners, 2 LED,
  7 menu/tags/adesivos).
- `BatucoTucoHero` e `PontinhasSoltasHero`: o `"heroAlt" in project` deixou de
  estreitar o tipo (agora todo projeto tem `heroAlt`); trocado por `isProject`.
- Grade: cada coluna soma 890 + 1 vão — PSN 459/590 + Caju 459/300 |
  15 anos 612/590 + Pontinhas 612/300 | Batuco 612/445 + Cascavel 612/445.
  Piso de 300: a 1180px o texto do hover precisa de ~186px num card estreito.
  `projectMeta` reordenado (15 anos antes de Pontinhas). Caju com
  `objectPosition: '20% center'` para a personagem aparecer no card estreito e
  no "Talvez você goste…".
- Gate 7: a checagem do `CaseHeader` usa o primeiro case não `opensAsPage`, se
  houver (hoje nenhum → passa avisando); links checados para todos os slugs.

## Fora de escopo

- `Frame 83` (17:4753): fica em y = 7534, fora do frame de 6823 (sobra no arquivo).
- Componentes compartilhados (`CaseTopBar`, `ThanksBubble`, `RelatedProjects`,
  `HomeFooter`, `DashedPill`). Pills levemente mais largas que no Figma (Clother no
  Chrome), como nos outros cases.
- O título e o parágrafo de "Projeto final" no Figma começam com um espaço
  (" Identidade de evento: 15 anos", " O projeto entregue…"), que os desloca 5px
  e 2px para a direita. Não reproduzido — aguardando a decisão do usuário.
- Entre 901 e ~1100px os cards da grade ficam menores que o texto do hover (já
  acontecia antes com Pontinhas a 1024).
