# Spec: Home — assets achatados em PNG (fidelidade total ao Figma)

**Data:** 2026-10-22
**Branch base:** `feature/new-home` (derivada: `fix/home-assets-png`)
**Spec anterior (binding authority do layout):** `docs/superpowers/specs/2026-10-20-new-home-design-v2.md` + `2026-10-21-new-home-fixes-v3.md`
**Figma:** https://www.figma.com/design/gpvzpeRYWxlqqonbHdj88g/Pontossemno?node-id=751-1318 (canvas 1728×4614)
**Render de referência 1:1 (já baixado):** `/tmp/pn-visual/fig-full-1x-1728.png` (1728×4614, baixado 2026-10-22 do MCP; expira — re-baixar se sumir)

---

## 1. Por quê

O usuário reporta que **todas as imagens** da home saem "bugadas": grão de ruído
denso ("está estático") em tudo que tem textura, círculos de cor sujos, furo da
etiqueta opaco em vez de atravessado, mão do "olá" destacada do rosto (no Figma
ela sobrepõe a bochecha) e sombra da cabeça com borda reta de clip.

**Diagnóstico (recon 2026-10-22, crops em /tmp/recon-v4/ vs /tmp/pn-visual/):**

1. **Grão:** os SVG são byte-idênticos aos exports do Figma (auditoria
   2026-10-21 provou) — a divergência é o **Chrome rasterizando os filtros
   SVG (`feTurbulence`/`feFlood`/`feComposite`) muito mais forte e denso que o
   Figma**. Atinge: cabelos, olhos, corpo da tag, pétala, e as 5 elipses.
   Nenhuma correção no SVG resolve — o render do Figma precisa vir no asset.
2. **Crachá:** o stack `exclude`/`buraco`/`union` não se recompõe igual no
   Chrome — furo opaco escuro (Figma: creme atravessando), anel cinza chapado,
   pétala prata-noise.
3. **Mão + cabeça:** na impl a mão (`ola-mao.svg` overlay, rotate −4.66°) fica
   destacada do rosto; no Figma a mão (751:1420) sobrepõe a bochecha dentro do
   grupo 751:1399. A sombra da cabeça aparece com borda reta (clip do elemento).

**Direção (decisão do usuário):** extrair do Figma via MCP e commitar
**PNGs achatados** de boa resolução, substituindo os SVGs/overlays, e corrigir
a sobreposição — ela vem baked no PNG; o que sobra no CSS/JSX é só posição.

## 2. Princípios

1. **PNG achatado do Figma é a autoridade visual** (render do Figma baked:
   grão, gradientes, sombras, furo, pétala, overlap da mão).
2. **i18n inviolável (AGENTS.md):** nenhum texto do site vai para dentro de
   imagem. O dizer da tag continua `<p>` vivo (`dict.home.crachaSaying`);
   alts continuam do dicionário. Nenhuma string nova prevista.
3. **Coordenadas do metadata do Figma** para posicionar cada PNG — nada de
   valores derivados por olho.
4. **Outras páginas não quebram**: estudos/cases/contato usam os assets deles
   (PNGs já existentes); essa troca só toca os componentes da home.
5. **Sem shadows/filters CSS novos.**
6. **ContactForm.tsx intocável.**

## 3. Escopo — 12 PNGs no commit (11 novos + 1 re-export do cracha-elipse-378), 5 arquivos de código afetados

Arquivos de código: `app/[lang]/page.tsx`, `components/home/GreetingSection.tsx`,
`PhilosophySection.tsx` (Cracha), `PeekingCharacter.tsx`, `ContactSection.tsx`
(+ deletar `components/home/DecorativeBlob.tsx` — componente morto, único
referenciador extra dos SVGs de elipse; auditoria 2026-10-21 já o marcou morto).

### 3.1 Círculos de cor (5 PNGs, substituem os 5 SVGs)

| Asset novo | Node Figma | bbox (x, y, w, h) | Uso atual |
|---|---|---|---|
| `ellipse-1.png` | 758:112 | 581, 1608, 879², cyan grande | contact/filosofia ctx |
| `ellipse-2.png` | 758:110 | 1131, 3486, 454.566² | contato |
| `ellipse-3.png` | 758:298 | 27, 1125, 454.566² | topo esquerdo |
| `ellipse-4.png` | 758:111 | 74, 3669, 694.981² | rosa do contato |
| `ellipse-5.png` | 758:297 | 1394, 436, 694.981² | rosa do topo |

Fundo transparente, grão baked, sem opacidade CSS extra. Onde o componente
posiciona, mantém o mesmo left/top/width atual (os bboxes batem com o layout
atual — os SVGs estavam nesses valores).

**Decisão (call):** resolução **@2x** (device-pixel-ratio 2 cobre telas
retina; o layout é 1728 fixo com scale responsivo). Manter os SVGs antigos no
repo somente se outra página referenciar (verificar com grep; a previsão é
não — eles são só da home; nesse caso apagar) .

### 3.2 Personagem do olá (mão + cabeça) — 1 PNG achatado

- **Export:** grupo **751:1399** (`Group 100769`, x=121, y=557, w=651.959,
  h=557) — inclui cabeça (751:1400) + **mão 751:1420 já sobreposta como no
  Figma** + sombras orgânicas baked.
- **Mobile:** a implementação atual esconde a mão em <md (`ola-mao.svg` é
  `hidden md:block`; mobile vê só a cabeça). O PNG achatado carrega a mão
  para todo breakpoint — **decisão (call): fidelidade única**; o mesmo PNG
  serve mobile, escalado pelo padrão responsivo do clamp existente. No desktop
  a imagem é mais larga que a coluna atual (651.959 vs coluna 513px
  ancorada a 15.05vw) → margem negativa ≈ −8.05vw (desktop, derivável do
  metadata); em mobile, centralizada (mx-auto) dentro do container.
  Se o mobile com mão desagradar, é ajuste fácil depois (crop CSS), não
  refaz o asset.
- **Estado sujo do git pré-existente:** `public/illustrations/ola.svg` tem uma
  modificação não commitada (re-export da mesma arte, ids renomeados) e
  `ola_.svg` não-trackeado (backup do SVG antigo). Como §3.2 deleta os dois
  arquivos de qualquer forma, o descarte deles acontece na troca — nenhum
  conteúdo é perdido (confirmado por diff: mesmos paths, só renomeação/fmt).
- **Substitui:** `illustrations/ola.svg` + `ola-mao.svg` + o overlay com rotate
  −4.66° no `components/home/GreetingSection.tsx` — vira UM `<img>` em
  left=121, top (rel. à seção), 651.959×557.
- O texto "Olá a todos," (751:1430) já é texto vivo — fica como está.
- Alt: `dict.home.greetingAlt` (continua).

### 3.3 Crachá — 3 PNGs achatados + réguas SVG mantidas + texto vivo

O grupo 757:94 não pode ser inteiro achatado porque contém o texto (757:107)
que é `dict.home.crachaSaying` — texto não vai para imagem. Exportar as partes
gráficas uma a uma:

| Asset novo | Node | bbox (x, y, w, h) | Obs |
|---|---|---|---|
| `cracha-corpo.png` | 757:95 Exclude | 1249.78, 1293.26, 361.35×448.19 | sombra baked |
| `cracha-anel.png` | 757:98 Ellipse 377 | 1332.04, 1338.29, 102.32² | furo + anel baked |
| `cracha-elipse-378.png` | 757:99 | 1390.94, 1306.27, 123.70×115.26 | **substituir o PNG atual** — re-export @2x da mesma origem |
| `cracha-petala.png` | 757:100 Union | 1367.48, 1265.03, 125.16×145.21 | pétala baked |

- **Forma do export:** cada node é re-renderizado pelo MCP como no Figma
  (precedente: 02f5abb — o PNG da 378 veio com sombra baked no render).
  Se algum export clipar a sombra (borda reta), trocar o node de export pelo
  pai/superframe correspondente e usar os deslocamentos de bbox; **a regra é:
  sombra orgânica inteira no asset, nunca clip reta**.
- **Rotação:** os 4 assets são trocas de `src` na cadeia atual de wrappers
  (rotate 15.24°, bleeds) — a cadeia CSS permanece; se o export vier com a
  rotação baked no bitmap, adaptar (imgs planas) mantendo a geometria final
  idêntica ao Figma (réguas/texto continuam com os seus 14.8° em CSS).
  O render impl final deve bater com o render 1:1 do Figma — é isso que
  decide, não a técnica.
- **Réguas (757:103–106):** MANTER os `cracha-linha.svg` — traço liso sem
  filtro; o Chrome renderiza byte-fiel (revisões anteriores mediram ≤0.4px).
- **Texto (757:107):** MANTER o `<p>` vivo com `rotate-[14.8deg]`, top 237.3px
  etc. (estado atual já aprovado na v3). Posição relativa ao grupo é mantida
  se o wrapper do grupo continuar em x=1259.4, y=1237 (377.286×505.654).
- Ordem de camadas (do fundo p/ frente): corpo → anel → elipse 378 → pétala →
  réguas → texto (a atual; sem mudança).
- Resultado no Chrome: grão/sombras/pétala/furo exatamente como o Figma.

### 3.4 Personagem que espia (filosofia) — 1 PNG achatado

- **Export:** grupo **751:1329** (`Group 100804`, x=901.74, y=1894,
  676.02×360.52).
- Substitui o `<img>` esticado no `PeekingCharacter.tsx` (mapeamento
  hand-tuned do SVG 1324.88×1292.58 dentro de 676×360.52) — o PNG substitui
  TODO o mapeamento: img plana de 676.02×360.52 na posição do Figma, sem
  stretch/offset.
- **Plan 4 pendente:** o peek está no seam de um Plan 4 (comentários no
  page.tsx). Nesta rodada: posicionar exatamente pelo Figma como está, manter
  o overlap da galeria (−mb-[21px]) e o `overflow-x: clip` congelados como
  snapshot — o Plan 4 reabrirá essa costura.

### 3.5 Personagem do contato — 1 PNG achatado

- **Export:** grupo **751:1360** (`Group 100787`, x=254, y=3437, 555×675.61)
  — inclui a mão no rosto sobreposta corretamente + sombras baked **E o
  envelope** (751:1389 `Group 100785`, 312.43, 3814.23, 207.72×229.14 —
  filho interno, exatamente o bbox do overlay `contato-extra.svg` atual).
- Substitui no `components/home/ContactSection.tsx`: `contato.svg` +
  `contato-extra.svg` + o overlay com rotate 0.51°/offsets proporcionais —
  vira UM `<img>` em left=254, top 3437, 555×675.61.
- `contato-extra.svg` é **deletado** (o envelope está baked no PNG).
- A elipse rosa 758:111 e a cyan 758:110 ficam ATRÁS, separadas (transparentes)
  — a sobreposição delas com o personagem é por z-index de posicionamento atual,
  que o Figma confirma (elas não fazem parte do grupo do personagem).
- O `contato.png` do `Illustration.tsx` serve outras páginas — **não tocar**.

## 4. Como extrair

`get_design_context(nodeId, fileKey="gpvzpeRYWxlqqonbHdj88g")` retorna os
assets com URL temporária (expira ~7 dias) — baixar imediatamente com curl para
`public/images/home/` (e `public/illustrations/` para o personagem do olá? **Decisão:** manter TODOS os novos assets em `public/images/home/` para uniformizar). Se um
asset vier num formato estranho (webp/sem alpha), re-exportar com o
download_assets do MCP. @2x: pedir o asset em 2× (o get_design_context às
vezes fornece 1×; se vier 1×, escalar NÃO — usar get_screenshot com
maxDimension=2×w por node para garantir a resolução; preferir export nativo
2x via download_assets quando disponível).

Fallback robusto por node (se o design_context não der PNG @2x com alpha):
`get_screenshot(nodeId, maxDimension = round(2×max(w,h)))` — renderiza o node
sozinho em fundo transparente (contentsOnly=true) → PNG com alpha na medida.

## 5. Verificação (quality gates desta rodada)

1. `pnpm build`, `pnpm lint`, `pnpm exec tsc --noEmit`,
   `./scripts/check-quality-gates.sh 3 4 5` — todos PASS.
2. **Pixel-match por região (obrigatório):** render impl @1728 vs
   `/tmp/pn-visual/fig-full-1x-1728.png`, crops:
   - greeting char (900×900+60+700), crachá (450×450+1150+1200),
     elipse-contato (660×500+1000+3380), contato char (700×660+60+3480),
     espiando (660×400+1050+1800), rosa topo (700×560+0+60 ctx da 758:297
     e 758:298 — ajustar por região visual).
   - Alvo: alpha médio por crop Δ≤5 do crop do Figma e nenhuma diferença
     estrutural visível lado a lado (grão, furo, petala, mão no rosto,
     sombras orgânicas).
3. **Sobreposição:** mão do olá sobrepõe a bochecha como no Figma; no contato
   a mão no rosto idem; furo da etiqueta mostra o creme atravessando.
4. **Idiomas:** /pt-BR e /en — o dizer do crachá traduzido sobre a imagem;
   alts corretos.
5. **Regressão:** outras páginas (estudos/cases/contato) intactas;
   `FooterRouter`/Header intactos.
6. **Peso dos assets:** listar os bytes dos 12 PNGs (11 novos + re-export da
   378) no commit; alarme se algum único PNG passar de ~1.5MB @2x
   (re-avaliar resolução nesse caso).

## 6. Fora de escopo

- Reencodes dos PNGs de estudos/cases (parked).
- Animações/motion; responsivo < 1728 além de não quebrar o clamp existente.
- ContactForm, Header, Footer, outras páginas.
- Trocar fontes/textos: nada muda de tipografia.

## 7. Definition of Done

- 12 PNGs commitados em `public/images/home/` (11 novos + re-export da 378)
  nos bboxes/tolerâncias da §5; SVGs substituídos deletados (grep antes:
  `ola.svg`, `ola-mao.svg`, `espiando.svg`, `contato.svg`, `contato-extra.svg`,
  `ellipse-1..5.svg` — apagar só se nenhum grep bater; incluir a deleção de
  `DecorativeBlob.tsx`).
- Zero `feTurbulence` residual renderizando com grão denso na home (os únicos
  SVGs restantes com filtro: `cracha-linha.svg` — sem filtro de grão, ok);
  grep de sombras CSS segue limpo.
- Gates todos PASS + pixel-match por região + verificação de idiomas.
- Commits em inglês com trailer `Co-Authored-By: Claude Code <noreply@anthropic.com>`.

## 8. Referências

- Render 1:1 do Figma: /tmp/pn-visual/fig-full-1x-1728.png
- Crops do recon: /tmp/recon-v4/ (impl atual) e /tmp/pn-visual/fig-*.png
- Auditoria SVG (por que os SVGs são fiéis e o Chrome não): docs/superpowers/analysis/2026-10-21-svg-asset-audit.md
## Emendas da execução

Decisões tomadas durante a execução (rulings do controller, registradas no
ledger da rodada). Onde conflitam com o texto acima, **estas emendas valem**;
as seções anteriores ficam como foram escritas.

- **R3 — âncora pelo conteúdo opaco medido (§3, manifest/estimativas):** a regra
  de âncora deixou de ser "fallback" e virou OBRIGATÓRIA. Todos os consumers
  (Tasks 2–6) posicionam e escalam pelo conteúdo opaco medido no relatório do
  Task 1 (origens em coordenadas de página), não pelas estimativas de bbox do
  manifest. Motivo: os PNGs exportados do Figma trazem bleed/canvas diferente do
  estimado e usar o manifest causaria drift de 10–20% no corpo, na 378 e no
  contato.
- **R8 — o node 751:1389 é a MÃO, não um envelope (§3.5):** a spec o chama de
  "envelope", o que está errado. O node é a mão no rosto (`Group 100785`,
  207.72×229.14 em 312.4,3814.2 — a geometria do antigo overlay
  `contato-extra.svg`); não existe envelope separado no render do Figma. A
  asserção "exatamente um" vale para a MÃO. Correção apenas documental: o
  comportamento é idêntico.
- **R9 — o render do Figma vence a metadata no corpo do crachá (§3.3):** a
  divergência entre render e metadata do node Exclude se resolve PELO RENDER
  (princípio 1: o render do Figma é a autoridade visual). O corpo fica ~100px à
  esquerda e 79px abaixo do box do grupo (`left −99.4px`, `top 79px`); o antigo
  corpo estava inclinado ao contrário e com as réguas vazando. A leitura de que o
  "~103px à esquerda" era bug do render MCP estava errada: era o Figma correto.
- **R10 — o dizer fica ENTRE as réguas (§3.3, "MANTER top 237.3"):** o `<p>`
  vivo ficava EM CIMA das réguas; no Figma fica ENTRE elas. O wrapper do texto
  passa de `left −1.7 / top 237.3` para `left −36.7 / top 247.3` (rotate, fonte,
  leading e réguas intocados), medido contra o render em pt-BR e en. Isso
  substitui o "MANTER top 237.3" da §3.3.
- **R11 — mobile: centralização do bbox visual do crachá (§3.3):** com o corpo
  em −99.4px, ~75px saíam da tela em 390px. Só abaixo de `md`, a composição
  (corpo + réguas + texto) é deslocada para centralizar o bbox visual na coluna
  (`margin-left: calc(50% − 67.6px)`, `justify-start`); o desktop fica
  inalterado. As imgs de arte levam `max-md:max-w-none`.
- **R15 — ellipse-5 sem corte reto acima de 1728px (§3.1, ellipse-5):** o PNG
  da ellipse-5 exportado do Figma é o corte do frame (668×1390 @2x = 334px CSS),
  deixando uma borda reta visível em viewports > ~1735px. O re-export SÓ-LEITURA
  (`exportAsync` do node 758:297, sem editar o arquivo do Figma) continuou
  cortado pelo frame, então o PNG passou a ser composto: os 668px reais da
  esquerda da e5 + a parte direita do `ellipse-4.png` (mesmo gradiente; só a
  baseFrequency X do ruído difere). O `<img>` volta a `width={695}`, sangrando
  como o SVG original, escondido pelo `overflow-x: clip` do wrapper.
