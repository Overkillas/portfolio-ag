# SPEC — Página "Minha carreira" (`/carreira`, Figma 201:53)

Data: 2026-11-17. Branch: `feature/carreira` (a partir de `refactor/minimal-adjustments`,
que ainda não entrou no `develop` e mexe no card de carreira e no footer). Figma: arquivo
`EGDJU9UG5XmLO6zV8Howwo`, frame `201:53` (1728 × 7166), o mesmo arquivo do Estudos.

## Problema

O card "Minha carreira no design" da home abre o LinkedIn. A Ágatha desenhou a página da
carreira: hero "como vim parar aqui?", faixas de janelas, "uma breve história da arte...",
"vidinha" com a boneca tricotando, "hora do desenho", "life gallery" e o footer "visite
também".

## Decisões (com o André, não reabrir)

1. **Fidelidade:** igual ao Figma, com uma única exceção, a boneca tricotando da "vidinha"
   (grupo 201:475), que ganha animação.
2. **Animação:**
   - O fio é o cachecol listrado (201:515) que sai da caixinha.
   - As "coisinhas que ela fez" são os pills Monitoria, Extensão, Estágio, Oficinas e
     Publicações acadêmicas. Cada um surge quando o fio passa por ele.
   - Roda **uma vez**, quando a cena entra na tela. As mãos mexem durante o trajeto e param
     no pose do Figma.
   - A **manivela gira junto**.
3. **Responsivo:**
   - O canvas é proporcional (1px do Figma = `100cqw / 1728`) a partir de 1024px.
   - Abaixo disso o layout é empilhado, proposto por nós (ver "Minhas escolhas").
4. **Rota e entrada:** `/pt-BR/carreira` e `/en/carreira`. O card "Minha carreira no design"
   da home abre a página (não mais o LinkedIn).
5. **Top bar:**
   - "<" leva para a home (Sobre mim).
   - "projects" com o sininho leva para `/projetos`.
   - O seletor de idioma fica no centro (regra do AGENTS.md: página sem header precisa
     dele).
6. **Camadas da boneca:** são recompostas a partir das exportações por camada do Figma, sem
   editar o arquivo. O conjunto parado tem que bater com o render do Figma (MAE ≤ 5/255).
7. **Imagens com nome de loop:** "olhar_loop", "nuvens_loop" e "turntable_personagem" ficam
   estáticas, como no Figma.

## Solução

- **Rota:**
  - `app/[lang]/carreira/page.tsx`, no padrão do Estudos.
  - `HeaderRouter` esconde o header em `carreira`.
  - `FooterRouter` usa o `HomeFooter` com "visite também" à direita (201:64).
- **Top bar:** nova variante `career` do `CaseTopBar`, com as medidas de 201:341 e 201:346.
- **Componentes:** `components/career/` tem uma seção por arquivo. O `career.module.css` usa o
  container `--u` e tudo é posicionado em px do Figma.
- **Texto:** vem do dicionário `career` (pt-BR + en). Os negritos do hero usam chaves
  partidas.
- **Arte:**
  - A arte com grão, sombra ou máscara é o render @2x do nó, em WebP lossless.
  - As fotos da gallery são o render @2x do nó (recorte, rotação e sombra do Figma), em WebP
    lossy.
- **`KnittingDoll` (client):**
  - **Camadas:** base sem as mãos, mão direita (201:500), mão esquerda (201:505), caixa sem
    a manivela, manivela, cachecol e pills em HTML.
  - **Animação:** só `transform` e `opacity`. O cachecol aparece com um par de wrappers que
    andam em sentidos opostos (`translateX`). O atraso de cada pill vem da posição x dele
    no cachecol.
  - **Estado inicial:** o servidor renderiza o estado final. O estado escondido só é ligado
    depois da hidratação, então quem está sem JS ou com movimento reduzido vê o Figma.

## Fora de escopo

- **`HomeFooter`:** fica como está, apesar de duas diferenças com o Figma desta página.
  - O 201:64 tem "Redes sociais" e "IG"/"IN" com 32px e o handle com 20px, enquanto o
    componente compartilhado usa 24/16.
  - A pílula "voltar ao topo" está no componente e não aparece no Figma.
  - Mexer nele mudaria a home e os cases. Diferença registrada para a Ágatha decidir.
- **Leftovers do Figma:**
  - `201:76` (Vector 1319, fora do canvas, x=2255) não é implementado.
  - As anotações "Contato" e "O que acredito" vieram copiadas da home e não viram código.

## Emendas da execução

1. **Os "loops" são GIFs animados.**
   - "olhar_loop" tem 16 quadros (com piscada), "nuvens_loop" tem 3 e "turntable_personagem"
     tem 8.
   - O modo dev mostra só o 1º quadro. O André decidiu animar, revendo a decisão 7.
   - Os GIFs viram WebP animado, e o 1º quadro em WebP estático entra com movimento reduzido.
   - Nas faixas, o recorte já traz o 1º quadro do olhar, e o GIF roda por cima. Todos os
     quadros cobrem o 1º (verificado), então o quadro de baixo nunca aparece.
2. **Os exports do MCP vêm opacos, sobre o creme do frame.**
   - **Arte estática:** recortes do render 2x do frame (`download_assets` do 201:53, scale 2).
     O fundo creme é o mesmo da página, e os recortes ficam longe de texto.
   - **Onde uma arte cobre outra** (boneca, cachecol, tartaruga atrás do "h" do título): a cor
     vem do export do Figma e o alfa do SVG do Figma rasterizado. A cor é desmisturada com o
     fundo conhecido, sem editar o arquivo.
   - **Erro contra o Figma:** boneca recomposta (base + mãos + sombra) 0.118/255, cachecol
     0.065, tartaruga 0.099.
   - **Pixels de peças vizinhas:** os recortes da lousa e dos botões continham partes de
     outras peças (tartaruga e orelha do coelho), e esses pixels viraram transparentes.
3. **A boneca tem uma sombra só, a do grupo** (drop shadow 18.93/12.05, σ 1.01, preto 23%),
   e as mãos são círculos lisos `#FADAE7`.
   - A base é o render do Figma sem a sombra e sem as mãos. Embaixo das mãos fica o SVG
     rasterizado, que só aparece nas frestas durante o movimento.
   - As mãos são os círculos do SVG. A sombra é aplicada ao vivo sobre a união (CSS
     `drop-shadow` com os parâmetros do Figma), para acompanhar as mãos. É o efeito do próprio
     Figma, não uma sombra nova.
4. **A manivela oscila ±12° em torno do eixo (48, 82) da caixa**, 5 ciclos de 0.7 s no tempo
   do fio (3.5 s). Uma volta inteira levaria a ponta, que está na mão esquerda, a percorrer
   ~100px. A mão esquerda acompanha a ponta, e a mão direita balança em fase oposta.
5. **Entrelinha do texto do corpo:** 31px a 26px (1.1923), medida nas caixas do Figma. O
   `normal` do Chrome para a Clother fica mais alto.
6. **Recuo dos parágrafos numerados** (`text-indent`), medido no render 2x: 54 / 56.5 / 54 /
   48 / 71.
7. **Inglês:**
   - O h1 tem quebra explícita ("how did I\nget here?"), senão "get" cobre o doodle de nuvem.
   - "vidinha" virou "my life" (curto), para não cobrir o coelho no título alinhado à direita.
8. **Fidelidade a 1728 em movimento reduzido (estado final):** MAE por região contra o render
   1:1 do Figma de 0.8 a 2.8/255. A exceção é o footer compartilhado (6.0), pela diferença de
   tipografia registrada em "Fora de escopo".

## Emenda 2 — olhos que seguem o cursor (2026-11-17)

**Pedido:** os olhos das bonecas do "olhar" (faixas azul e rosa) seguem o cursor do mouse.

**Decisões com o André:**
- Com mouse, os olhos seguem o cursor e o loop do GIF sai. No toque, fica o GIF original.
- A íris se move só na horizontal, como no GIF.
- Sem cursor, volta à pose do Figma.

**Como foi feito:**
- **O que o GIF mostra:**
  - Os quadros pares são 5 poses distintas: 0, 2, 4, 6, 8 (10/12/14 repetem 6/4/2).
  - Os quadros ímpares são intermediários borrados.
  - A íris é uma faixa que muda de largura e inclinação conforme vai para os lados, então
    não é rígida.
- **Assets** (`public/images/carreira/`, extraídos do GIF sem editar o Figma):
  - `olhar-rosto.webp`: rosto sem íris.
  - `olhar-iris-<olho>.webp`: tira com as 5 íris de cada olho.
  - `olhar-olho-<olho>.png`: máscara da abertura de cada olho.
  - Cada quadro-chave recomposto difere do GIF em MAE ≈ 0.1/255.
- **`OlharFace`** (client):
  - Para a posição p entre dois quadros-chave, desloca os dois até p e mistura (crossfade
    aditivo, `plus-lighter`), como os intermediários do próprio GIF.
  - O cursor à esquerda ou à direita do rosto (±45% da largura da janela) cobre o curso
    medido no GIF.
  - Em repouso exato, a camada some e fica o 1º quadro já assado no recorte da faixa (MAE
    da região dos olhos contra o Figma: 2.06, igual ao de antes).
- **Movimento reduzido:** nada se mexe e fica o 1º quadro.
- **Removido:** `olhar-static.webp`, que não era usado (o 1º quadro já está na faixa).

## Emenda 3 — lousa mágica e blocos das ferramentas (2026-11-18)

**Pedido:**
- Os cubos das ferramentas (201:621) começam virados para trás. Um clique gira o cubo e revela a
  ferramenta.
- Um clique na ferramenta revelada faz a caneta da lousa (201:413) sair sozinha e desenhar o
  ícone dela, cada um com uma grafia própria.
- Depois do primeiro desenho, dá para apagar puxando a bolinha do trilho e para segurar a caneta
  e desenhar.

**Decisões com o André:**
- **O verso** é o mesmo cubo com a face lisa (sem o ícone).
- **Antes de cada desenho a bolinha apaga a lousa sozinha** (vai até o fim do trilho e volta).
- **O traço** é o azul de giz dos rabiscos do Figma.
- **Exceção de fidelidade:**
  - Em repouso, os cubos ficam de verso.
  - Sem JS ou com movimento reduzido, aparecem revelados (o Figma).
  - A lousa em repouso é o Figma.

**Como foi feito** (`components/career/board/`):
- **Camadas da lousa** (sistema "B" = frame + (−5, +6), ver `geometry.ts`). São recortes do
  render 2x (o `lousa.webp` de antes), e o conjunto recompõe o Figma com MAE 0.19/255:
  - `base.webp`: tela branca e suporte vazio. O suporte é repintado com o SVG do 201:462 sem a
    caneta e sem o cordão, só na área do recesso, porque os cantos do SVG não seguem o recorte
    da lousa. A bolinha é coberta com o trilho deslocado.
  - `tinta.webp`: os 6 rabiscos rasterizados dos SVGs do Figma.
  - `grao.webp`: o grão rosa da tela. Ele fica **por cima** da tinta (no Figma, os pontinhos
    rosa cobrem os rabiscos). O alfa foi desmisturado do branco + tinta, com MAE 0.29.
  - `cordao.webp`: o cordão em repouso.
  - Caneta e bolinha: a caneta é o SVG do Figma, chapado. A bolinha é uma `div` `#F9F3EA` com
    raio 11.
- **O pincel** é o carimbo `stroke0` dos rabiscos do Figma (`pincel.png`). Na máscara do
  Figma ele vai na escala 0.0321794 (11.75px), com rotação aleatória, na cor `#B7CAEA`. O
  cordão em movimento usa o mesmo carimbo em `#FFF6E7`, com 18px.
- **A tinta** é um canvas com log de operações (imagem, traço com semente, faixa apagada). No
  resize ele é refeito nítido. Apagar é `destination-out` com borda macia, e a varredura
  completa esvazia o log.
- **Os cubos** são o SVG do Figma numa caixa de 125.897 × 144.398 girada 24.72° (do
  `get_design_context` do 201:621). A metadata dá o x do wrapper com 60.5 a mais, e isso foi
  registrado contra o render (MAE 1.3/255). O verso é o mesmo SVG só com as faces
  `Ellipse 452/453/454`. O giro é `rotateY` num card 3D com `backface-visibility`.
- **Sequência** (`machine.ts`, testada no vitest):
  - Com um desenho: idle → erasing → drawing → returning → idle.
  - Com a caneta na mão: idle → holding → returning → idle.
  - Escolher outra ferramenta no meio é ignorado.
- **Interação:**
  - Pointer events com captura. `touch-action: none` só na caneta e na bolinha, para a
    rolagem do celular continuar.
  - A bolinha é `role="slider"`: setas, PageUp/PageDown, Home e End apagam.
  - Os cubos são botões com label traduzido.
  - Uma região viva anuncia o desenho. Bolinha e caneta bloqueadas fazem os cubos de verso
    balançarem e anunciam "escolha uma ferramenta primeiro".
- **Movimento reduzido:** os cubos já vêm revelados, o clique apaga e desenha na hora, e a
  bolinha e a caneta manuais continuam funcionando.
- **Fidelidade a 1728, em repouso:**
  - Lousa: MAE 0.39/255.
  - Blocos com movimento reduzido: 2.9/255.
  - Blocos de verso: 14.1/255, que é a diferença pedida (os ícones escondidos).
- **Removidos:** `lousa.webp` e `ferramentas.webp` (substituídos pelas camadas).

**Grafias (minha escolha, para a Ágatha revisar):**
- **Blender:** o anel com o "olho" e as três hastes.
- **Figma:** as cinco formas, uma a uma.
- **Clip Studio Paint:** a espiral num traço só, terminando na pena.
- **Ae, Id, An, Ps, Ai:** o quadradinho do app mais as letras, cada um com um estilo:
  - Ae: bolhuda.
  - Id: bastão com serifa, num quadrado de canto vivo.
  - An: com risquinhos de movimento.
  - Ps: cursiva.
  - Ai: pontuda, com estrelinha no pingo.

As grafias são polilinhas em `glyphs.ts`, com um tremor de mão determinístico.

**Outras escolhas minhas:**
- A caneta desenha a ~650 px/s e fica girada −155° na mão (ponta para baixo à esquerda,
  corpo subindo para o suporte). Quem segura a caneta desenha com a ponta no ponteiro.
- ~~Ao soltar a caneta, ela volta ao suporte.~~ Substituído pela Emenda 4.
- A bolinha fica onde é solta.

## Emenda 4 — caneta de clicar e faixa que apaga (2026-11-18)

**Pedido do André:**
- Um clique na caneta a pega; desenhar é segurar o botão esquerdo; um clique no suporte
  ("o lugarzinho de guardar a caneta") a guarda de volta.
- Ao apagar, a faixa bege da esquerda (201:474) anda junto com a bolinha, mostrando que é ela
  que apaga.

**Como foi feito:**
- **Caneta** (`MagicBoard.tsx`), fase `holding` da máquina (que não mudou):
  - O `pointerdown` na caneta em repouso faz `grab`, e a ponta vai para o ponteiro.
  - Na mão, a ponta segue o ponteiro pela página (`pointermove` na `window`, e também na
    rolagem). Ela fica limitada a `HELD_BOUNDS` para o cordão não sair do canvas dele. O
    cursor do sistema some sobre a lousa, porque a ponta é o cursor.
  - Só sai tinta entre `pointerdown` e `pointerup` na lousa, com captura. Mover sem botão
    não desenha. O toque também funciona: tocar desenha e a lousa trava a rolagem só com a
    caneta na mão.
  - Um clique no suporte (`HOLDER`, o recesso do 201:462, com cursor de mãozinha) ou Esc faz
    `release`, e a caneta volta animada.
  - A caneta ignora cliques enquanto está na mão (`pointer-events: none`).
- **Faixa** (`faixa.webp`): recorte **sem perda** do `base.webp` (2x, 64 × 1066 → B (49, 68,
  32 × 533)). Em repouso fica em cima da faixa assada na base, então o repouso continua
  idêntico ao Figma.
  - Ela corre numa caixa com o recorte da tela (cantos direitos com raio 16.254) e anda
    `stripShift(bolinha)`, de 0 a 891.5 (no fim do trilho encosta na borda direita da tela).
  - A régua de apagar passou a ser exatamente a faixa (`ERASE_HALF = 16`, borda macia de 4).
    A tinta some embaixo dela. O teste do vitest amarra faixa e régua.
  - O que a faixa descobre à esquerda é branco com o grão rosa (as primeiras colunas do
    `grao.webp`), 1px mais largo por baixo da tela para a borda assada não vazar em escala
    fracionária.

## Minhas escolhas (para revisão)

- **Abaixo de 1024px:** uma coluna. As faixas continuam proporcionais, porque são arte. Os
  pills da cena da boneca saem de cima do fio e viram uma linha embaixo da cena, para não
  ficarem com ~5px. A colagem da gallery continua proporcional, com os textos no fluxo.
- **Animação:** cerca de 3,5 s para o fio. As mãos fazem um círculo pequeno, em fase oposta.
- **Textos em inglês:** rascunho para revisão da Ágatha.

## Emenda 5 — Figma novo (226:56): trem, publicações, momentos e sobre (2026-11-21)

**Pedido do André:** terminar a página pelo frame novo `226:56` (1728 × 10344), que
substitui o 201:53. O trem é animado com os GIFs da Ágatha (a boneca passa por cima de cada
card e, quando o trem chega, o card faz uma animação e ela dá tchau). Os cards dos
"momentos memoráveis" passam de um lado para o outro, num carrossel infinito. O nome do dev
é **André Garcia** (o Figma diz "André gracia").

**Decisões com o André:**
- **Escopo:** a página inteira pelo 226:56 (textos novos, ordem nova e 3 seções novas).
- **Trem em loop contínuo,** pausando fora da tela. Com movimento reduzido fica o Figma.
- **Links que faltam ficam preparados** em `lib/site.ts` (`career`): sem URL, o elemento
  aparece sem link. São o link da publicação e os LinkedIns dos devs.
  - O canal de música veio da anotação do Figma no 226:497 (id do canal no YouTube).
- **GIFs viram vídeo:** os 6 GIFs (26 MB) ficam em `imports_figma/carreira-trem/` (local,
  fora do git). Na página entra um MP4 só (3,7 MB).

**O que mudou de lugar** (mesma arte, conferida contra o render novo):
- **Boneca tricotando:** `+33, −1015`, MAE só na granulação.
  - Os pills mudaram de posição (Estágio e Publicações) e de cor: texto #08488f cheio
    (`CareerPill strong`).
- **Lousa:** `+51.66, +2109.13`. **Blocos:** `+51.91, +2096.31`.
- **Faixas:** azul em y 3000 (MAE 0.07) e rosa em y 4886.13 (0.94).
  - O trem saiu da faixa azul e virou o `CareerTrain`.
- **Fantasminha:** MAE 0.
- **Doodle de nuvem:** +72.5 em x.
- **Tartaruga:** 0.7735 do tamanho.
- **Maçã do balão:** 1.0765.
- **Boneca girando:** agora numa caixa de 606 × 722 com overflow.
- **Balão:** caixa girada de 798.581, o GIF de 847 cortado à direita.

**Arte nova:**
- **Exports 2x do Figma** (opacos sobre o creme, registrados contra o render 2x):
  - água-viva 226:57 (MAE 9.8 por causa do título por cima);
  - maçãs 226:926 (0.64), coelho 226:205 (2.2), colagem 226:508 (3.4) e cabecinha do
    "sobre" 226:780 (1.3);
  - avatares recortados do 226:802.
- **A ordem no DOM resolve as sobreposições:** a arte vem antes do texto que encosta na
  caixa dela. A cabecinha não encosta nos glifos do título (conferido no render).
- **Fotos dos momentos:** as originais das fills, já no recorte de cada caixa do Figma
  (w/h/left/top % ou cover) e em 2x. MAE ≈ 5 contra o render.
  - O export do 226:703 vem cortado na largura da página e não serve para os cards que
    ficam fora da tela.

**Trem (`CareerTrain`):**
- **O vídeo:** os quadros dos GIFs vão por pipe (sharp) para o ffmpeg a 50 fps, cada quadro
  repetido delay/20 vezes, então o tempo é exato. O filtro `concat` perdia o último quadro
  de cada GIF.
  - Ordem: tchau 1, 1→2, tchau 2, 2→3, tchau 3, 3→1. São 19.48 s em loop.
  - Os limites entre GIFs batem com MAE ≈ 1/255.
  - H.264 CRF 24. A altura vai a 498 (par) e a janela de 497 corta a linha extra.
- **O card aceso sai do `currentTime`:** da chegada (o giro para a frente, 3 quadros antes
  do fim de cada caminhada) até a partida.
  - Ao acender, o card faz pop (anotações 226:314/226:316) com a casca #a2de84 e o miolo
    #daf0bb.
  - No repouso, o card 1 já está aceso e não faz pop.
- **Pôster:** é o 1º quadro (o Figma). O vídeo só carrega a 200px da tela.

**Publicações (`CareerPublications`):**
- **Camadas:** os SVGs do Figma nas caixas do `get_design_context`. Cada ticket de trás
  aparece duas vezes, como no Figma.
  - A granulação é a do feTurbulence no Chrome, um pouco diferente da do Figma (MAE da
    seção 5.6).
- **"próxima":** o ticket da frente gira em `rotateX` no eixo da argola até ficar de lado,
  troca a publicação e volta (anotação 226:393). O botão ">" é o controle acessível.
- **Texto:** P22 Typewriter fica fora do kit, então usa o mesmo fallback do crachá da home.

**Momentos (`CareerMoments`):** só CSS.
- Cada fileira tem 3 cópias (as de fora são aria-hidden) e anda um período (largura + gap)
  a 32 px/s. As direções alternam: ←, →, ←.
- Repouso e movimento reduzido são o Figma.
- Não pausa com o mouse em cima (pedido do André). Pausa só com o foco do teclado (a área
  é focável), para quem navega por teclado poder parar o movimento.

**Entrelinhas:**
- **Novecento:** nos blocos em fluxo, `line-height: 1.383` (o "auto" do Figma). O normal do
  Chrome dá 1.33 e empurrava as fileiras 5px.
- **Clother:** 1.1923 nos textos novos.
- **Item 03 da história da arte:** recuo 50 (medido 52). Com 52, "recesso," não cabe na
  1ª linha, porque a Clother no Chrome é ~1px mais larga.

**Textos:** os do Figma, com 4 erros de digitação corrigidos (para a Ágatha conferir):
- "acretido" → "acredito";
- "priemrio" → "primeiro";
- "Pimeira" → "Primeira";
- "musica"/"academicas" → "música"/"acadêmicas".

Ficou como no Figma, e vai para a Ágatha revisar: o 226:506 repete a frase das animações
("(curta) Avatar e O Segredo Além do Jardim são minhas animações favoritas!").

**Fidelidade a 1728** (movimento reduzido, MAE por seção contra o render 1:1):
- 2.75: herói;
- 3.33: história da arte;
- 1.91: caminhos;
- 1.55: faixa azul + trem;
- 5.57: publicações;
- 1.35: faixa rosa;
- 3.85: galeria;
- 2.07: desenho;
- 6.00: momentos (bordas das fotos);
- 2.61: sobre;
- 5.13: footer (a diferença já registrada em "Fora de escopo").

**Removidos:** `faixa-trem.webp`, `botoes-macas.webp`, `galeria-a.webp`, `galeria-b.webp` e
as chaves `career.life`/`career.nextStop`. O que eram `career.life` agora é
`career.paths`.

**Gate 9:** passou a checar o vídeo, as fotos, os avatares, as camadas dos tickets, o
"André Garcia" e os marcadores novos no HTML.

## Emenda 6 — um pincel por ferramenta (2026-11-23)

**Pedido do André:** cada ferramenta, quando escolhida, desenha com um pincel diferente. Um
frame da lousa por ferramenta mostra o pincel:

| Ferramenta | Frame | Pincel do Figma Draw |
|---|---|---|
| Figma | 238:48 | DOO_WOP (scatter) |
| Animate | 238:358 | DOO_WOP espaçado + efeito Texture |
| Clip Studio Paint | 238:172 | SHOEGAZE (scatter) |
| InDesign | 238:482 | WITCH_HOUSE (scatter) |
| Illustrator | 238:234 | NOIR (stretch) |
| After Effects | 238:110 | NEW_WAVE (stretch) |
| Photoshop | 238:296 | PROPAGANDA (stretch) |
| Blender | 238:420 | ROM_COM (stretch) |

**Decisões com o André:**
- A lousa em repouso continua a do 226:56. Os 8 frames só mostram os pincéis (os mesmos
  rabiscos, a mesma cor `#B7CAEA`).
- O desenho automático usa o pincel da ferramenta. A caneta na mão usa o pincel da
  **última ferramenta desenhada**.
- Figma e Animate são os dois "doo wop", e cada um sai como no seu frame: o do Animate
  tem gap 1.27 (um colar de bolinhas) e o efeito Texture nos grupos.
- Para medir os pincéis, o Claude criou um arquivo de rascunho separado no Figma
  ("rascunho pincéis lousa", `YFFxbYp4WltQOPucRAF6qz`, na equipe pessoal do André), com uma
  linha reta de cada pincel. O arquivo do portfólio não foi alterado. O rascunho pode ser
  apagado.

**Como foi feito** (`components/career/board/brushes.ts`, `ink.ts`, `texture.ts`):
- **Parâmetros:** são os `complexStrokeProperties` dos rabiscos de cada frame, lidos pela
  Plugin API (38 dos 41 vetores com espessura 9.046, e 3 com 10.539). A espessura na lousa
  é a dos rabiscos do 226:56 (`INK_STAMP` = 11.75), e o que é medido em px (a textura) vai
  na mesma proporção.
- **Scatter** (conferido nas linhas retas de 600 px do rascunho):
  - O carimbo tem o lado maior igual à espessura e o centro na linha.
  - O passo é `gap × espessura` (DOO_WOP 2.804 = 0.31 × 9.046; Animate 11.488 = 1.27 ×
    9.046).
  - `wiggle` desloca o carimbo para o lado até `wiggle × espessura` (±2.98 no SHOEGAZE) e
    ao longo do traço até a metade disso.
  - O tamanho é `1 ± sizeJitter`, com mínimo de 0.35 (no WITCH_HOUSE o Figma vai de 0.38 a
    2.66).
  - O ângulo é a tangente + `rotation` ± `angularJitter`.
- **Carimbos:** o DOO_WOP é o `pincel.png` de antes (MAE 4.7/255 contra o do rascunho, só
  reamostragem). SHOEGAZE e WITCH_HOUSE são o `stroke0` do SVG do Figma, em 160 px brancos
  (`lousa/pinceis/shoegaze.png`, `witch-house.png`).
- **Stretch:** a faixa é a mesma com 150, 600 ou 1200 px (o SVG muda só na escala de x), e
  ocupa exatamente comprimento × espessura.
  - A linha reta de 600 vira `lousa/pinceis/<pincel>.png` (2400 × 36, branca).
  - No canvas, a faixa é desenhada em fatias de 1 px de design ao longo do traço. A direção
    de cada fatia é a corda de ± meia espessura, para as quinas virarem leque e não fenda.
    As fatias se sobrepõem ¾ px de tela.
  - **Desenho automático:** o comprimento já é conhecido, então a faixa sai aos poucos,
    meia espessura atrás da ponta (a direção precisa do que vem depois).
  - **À mão:** como no Figma, a faixa se estica no comprimento até ali. A tela de antes do
    traço fica guardada e o traço é redesenhado uma vez por quadro. No fim, o comprimento
    final vai para o log, e o replay sai igual.
- **Textura do Animate** (`texture.ts`):
  - O Figma usa feTurbulence (fractal, 3 oitavas, 1/6.78) + feDisplacementMap (±5.0) e
    prende o resultado à forma. Aqui é um value noise de 3 oitavas na mesma escala.
  - Cada carimbo passa pela textura num recorte à parte. O deslocamento depende só da
    posição na tela, então o resultado é o mesmo de deslocar o traço inteiro, e o replay
    sai idêntico.
  - Se o ponto buscado cai fora da silhueta (o alfa borrado com gama 0.2), o pixel fica
    como estava, e a bolinha continua redonda.
- **Testes:**
  - O vitest cobre:
    - o mapa ferramenta → pincel e as imagens em `public/`;
    - os limites do carimbo;
    - o caminhante ao vivo = o replay, com o carimbo de um toque;
    - a polilinha da faixa e o alisamento na quina;
    - o ruído.
  - O gate 9 checa as imagens de `BRUSH_IMAGES` e o uso de `TOOL_BRUSH`.
- **Conferido no Playwright a 1728:**
  - As 8 ferramentas, desenhadas pela caneta, batem com os seus frames.
  - À mão: o Animate sai em bolinhas e o Illustrator em faixa noir.
  - Console sem erros.
- **Removido:** `INK_SPACING` (o passo agora é do pincel).
