# Spec: Home — textos novos, animações e hovers do protótipo About

**Data:** 2026-11-05
**Branch:** `feature/new-texts-and-new-page-project` (atual, árvore limpa)
**Fonte:** protótipo em `for-implement/portfolio-about/` (`data/about.ts`,
`ANIMACOES.md`, `components/about/*`) e peças em `for-implement/assets_about/`.
`for-implement/` está no `.gitignore`: tudo o que for usado é **copiado** para
`public/`.

---

## 1. Intenção

O protótipo About foi feito à parte, com outra arquitetura (CSS Modules, rota
`/about`, frame de 1728 escalado por `cqw`, textos fixos em português). A
usuária quer **só três coisas** dele aplicadas na home atual:

1. os **textos novos**;
2. as **animações**;
3. os **hovers**.

Todo o resto da home atual fica como está: layout, posições, imagens (os PNGs
achatados do Figma), i18n, header e formulário.

## 2. Não-objetivos e anti-objetivos

**Não-objetivos (ficam como estão):**
- O layout e as posições da home. As seções, colunas, margens e o encaixe
  personagem↔galeria já foram acertados contra o Figma.
- As imagens da home. Exceções: o personagem espiando vira duas peças (§4.4) e
  entram os ícones dos quadros (§5).
- A arquitetura do protótipo: CSS Modules, `--u`/`cqw`, rota `/about` e os
  títulos em imagem. A home continua em Tailwind e com texto vivo.
- As fontes do protótipo (Outfit, Courier Prime). A home continua com as
  fontes atuais.
- **O formulário de contato.** O nosso tem nome, e-mail, telefone e mensagem; o
  do protótipo é outro. Os placeholders, a mensagem de sucesso e as animações de
  foco, botão e toast do protótipo **não** entram. `ContactForm.tsx` fica
  intocado.
- **O hover da navegação.** O header da home é outro desenho (*meu call*: não
  entra).
- **Links nos quadros.** O protótipo aponta para `/galeria`, que não existe. Os
  quadros ganham só o hover e não viram links.

**Anti-objetivos (seria fracasso mesmo funcionando):**
- O estado parado da home (fim das animações, sem hover) deixar de bater com o
  Figma em 1728.
- Texto dentro de imagem, ou string sem chave nos dois dicionários.
- Animação que cause rolagem horizontal, ou que esconda texto em alguma largura
  entre 768 e 1920.
- Animação que anime layout (`top`, `width`, `margin`). Só `transform` e
  `opacity`.
- Ignorar `prefers-reduced-motion`.

## 3. Textos novos (i18n)

Regras do AGENTS.md: as chaves vão em `dictionaries/pt-BR.json` **e**
`dictionaries/en.json` na mesma mudança. Negrito no meio do parágrafo usa
chaves separadas intercaladas no JSX, como hoje, sem `dangerouslySetInnerHTML`.
O pt-BR é o texto do protótipo, **verbatim**. O inglês é tradução minha (*meu
call*, para a usuária revisar).

### 3.1 Intro do "Olá" — `home.intro` (substitui)

- **pt-BR:** "Prazer, sou a Ágatha! A designer do seu bairro, da sua empresa
  multinacional e do seu jogo indie fofinho. Trabalho com pesquisa (UX e UI),
  ilustração e Design 3D."
- **en:** "Nice to meet you, I'm Ágatha! The designer from your neighborhood,
  your multinational company and your cute indie game. I work with research
  (UX and UI), illustration and 3D Design."

### 3.2 Filosofia

O título "Filosofia" e o subtítulo `philosophyLead` ("Para mim o design é
pesquisa, ilustração e perspectiva.") **não mudam**.

**Parágrafo 1:** `philosophyBody1`, agora sem negrito. As chaves
`philosophyBody1Bold` e `philosophyBody1End` saem dos dois dicionários.
- **pt-BR:** "Acredito que o design traduz como enxergo o mundo e como gostaria
  de projetá-lo, de coração aberto às pessoas, culturas e histórias que
  encontro."
- **en:** "I believe design translates how I see the world and how I'd like to
  shape it, with an open heart to the people, cultures and stories I come
  across."

**Parágrafo 2:** mesma estrutura de chaves de hoje (`philosophyBody2`, `Bold1`,
`Mid`, `Bold2`, `Mid2`, `Bold3`, `End`), com valores novos.

| chave | pt-BR | en |
|---|---|---|
| `philosophyBody2` | "Por isso, encaro a " | "That's why I see " |
| `philosophyBody2Bold1` | "pesquisa" | "research" |
| `philosophyBody2Mid` | ", as " | ", " |
| `philosophyBody2Bold2` | "interfaces" | "interfaces" |
| `philosophyBody2Mid2` | " e o " | " and " |
| `philosophyBody2Bold3` | "3D" | "3D" |
| `philosophyBody2End` | " como extensões de um mesmo propósito: escutar realidades que não são minhas e transformá-las em experiências e mundos especialmente sensíveis." | " as extensions of one purpose: listening to realities that aren't mine and turning them into especially sensitive experiences and worlds." |

**Duas colunas novas, abaixo do parágrafo 2:**

| chave | pt-BR | en |
|---|---|---|
| `philosophyColUx` | "O " | "" |
| `philosophyColUxBold` | "UX" | "UX" |
| `philosophyColUxEnd` | " me aproxima da vivência do outro e faz da pesquisa um momento de escuta e partilha, em que descobrimos juntos." | " brings me closer to other people's lived experience and turns research into a moment of listening and sharing, where we discover things together." |
| `philosophyCol3d` | "No " | "In " |
| `philosophyCol3dBold1` | "3D" | "3D" |
| `philosophyCol3dMid` | " e na " | " and in " |
| `philosophyCol3dBold2` | "ilustração" | "illustration" |
| `philosophyCol3dEnd` | ", conto o que ouvi em cenas miúdas, das que fazem parar para ver uma joaninha subir a folha." | ", I tell what I've heard in tiny scenes, the kind that make you stop to watch a ladybug climb a leaf." |

**Layout das colunas** (o único acréscimo de layout; vem do protótipo e é
convertido para a home):
- ficam dentro da coluna de texto atual da filosofia, logo depois do parágrafo 2;
- grid de 2 colunas iguais a partir de `md`; abaixo de `md`, empilhadas;
- column-gap = 86.3/1728 da largura do frame, em vw;
- mesma tipografia, cor, justificação e `wordSpacing` dos parágrafos atuais;
  negrito igual ao negrito atual;
- espaço vertical igual ao espaço entre os parágrafos atuais.

A filosofia fica mais alta e empurra o resto da página para baixo. Isso é
esperado. O encaixe do personagem espiando com a galeria tem que continuar
igual (§4.4).

### 3.3 Quadros da galeria — `home.tiles.*` (novo)

| chave | pt-BR | en |
|---|---|---|
| `tiles.studies.title` | "Estudos" | "Studies" |
| `tiles.studies.text` | "Alguns estudos despretensiosos e outros nem tanto :0" | "Some casual studies, and some not so casual :0" |
| `tiles.career.title` | "Minha carreira no design" | "My design career" |
| `tiles.career.text` | "Um pouquinho sobre minha trajetória em diferentes áreas do design e como cheguei às minhas áreas dominantes hoje :)" | "A little about my path through different areas of design and how I got to the ones I focus on today :)" |
| `tiles.gallery.title` | "Minha galeria" | "My gallery" |
| `tiles.gallery.text` | "Compilei algumas artes minhas aqui ^^" | "I've gathered some of my art here ^^" |

O título aparece em maiúsculas via CSS (`uppercase`), não no texto da chave.
As chaves de alt atuais (`studiesAlt`, `careerAlt`, `studiesDoodlesAlt`)
continuam.

## 4. Animações

Valores do `ANIMACOES.md` do protótipo. Onde ele mede em `u` (1px do frame de
1728), a home usa a fração equivalente em vw, ou px quando o elemento já é em
px.

**Curvas:** ficam disponíveis como valores reutilizáveis (tokens CSS ou classes
utilitárias):
- `ease-out`: `cubic-bezier(.2,.8,.2,1)`
- `ease-spring`: `cubic-bezier(.2,.9,.3,1.4)`
- `ease-bouncy`: `cubic-bezier(.2,.9,.3,1.6)`

### 4.1 Personagens flutuando

O personagem do "Olá" (`ola-personagem.png`) e o do contato
(`contato-personagem.png`) **só flutuam**. A mão já está embutida no PNG e vai
junto.

- **"Olá":** `translateY(0 → −1vw → 0)`, 3.4s ease-in-out, infinito.
  −17.3u ≈ 1% da largura.
- **Contato:** a mesma animação, 3.8s, atraso de .6s, para ficar fora de fase.
- O `transform` da animação vai num wrapper, para não brigar com as margens e
  os `%` que posicionam a img.

### 4.2 Elipses "respirando"

As 5 elipses PNG da home: `scale(1 → 1.08)` e `opacity(.9 → 1)`, 6s
ease-in-out, infinito, `transform-origin` no centro.

- O protótipo faz as elipses com CSS e `blur`. Aqui ficam os PNGs e **não**
  entra `blur` (a regra é sem filtros CSS novos).
- O `scale` não pode criar rolagem horizontal. Os dois wrappers da home já
  fazem `overflow-x: clip`.

### 4.3 Crachá balançando

O crachá inteiro (box `.cracha`, com corpo, anel, 378, pétala, réguas e texto
vivo) gira como uma peça só.

- **Balanço contínuo:** `rotate(−1.2deg ↔ 1.2deg)`, 5s ease-in-out, infinito.
- **Pivô:** o centro do furo, convertido para a geometria da home. No box de
  377×506, o anel está em left 60.6 / top 112 com 83.5px, então o centro é
  ≈ (102.35, 153.75) px, ou ≈ 27.1% 30.4%.
- **Empurrão no hover:** `0 → 3.5° → −2° → .8° → 0`, 1.6s ease-in-out, uma vez.
  Durante o hover, essa animação substitui o balanço.
- O texto é vivo e gira junto. Ninguém mexe nos valores de rotação das peças.
- A área de hover é o box do crachá. A margem `md:pr-[100px]` da coluna de texto
  continua protegendo o texto em 768–1440, agora com o balanço incluído.

### 4.4 Personagem espiando (scroll)

Ele sobe de trás da galeria conforme a página rola. No fim, os dedos aparecem
agarrando a borda.

**Peças:** saem do protótipo, que as cortou dos originais da usuária, e são
copiadas para `public/images/home/`:
- `espiando-cabeca.png` (744×321)
- `espiando-dedos.png` (744×99)

As peças soltas de `for-implement/assets_about/` (camadas do grupo 751:1329 do
Figma) são a reserva, se o recorte do protótipo não servir.

*Meu call:* essas peças estão em ~1x, enquanto os outros PNGs da home são @2x.
Fico com elas. Não dá para exportar do Figma a cabeça sem os dedos sem editar o
arquivo, e editar o arquivo é proibido.

**Estado final** (p = 1, e também o estado com movimento reduzido): cabeça e
dedos montados **nas mesmas coordenadas de página** do `espiando.png` atual. O
crop da região do personagem tem que bater com o render 1:1 do Figma, como hoje.

**Mecânica,** do protótipo:
- `line` = topo da galeria (borda de baixo do recorte da cabeça).
- `p = clamp((vh − line) / (vh × 0.55), 0, 1)`
- `e = p² × (3 − 2p)`
- **Cabeça:** dentro de um recorte `overflow: hidden` cuja borda de baixo é o
  topo da galeria. `translateY((1 − e) × 100%)`, com transição `.35s ease-out`.
- **Dedos:** por cima da galeria (z acima dela). `f = clamp((p − 0.9)/0.1, 0, 1)`.
  Aplicam `opacity: f` e `translateY((1 − f) × −60%)`. Transições: opacity .35s,
  transform .45s ease-bouncy.
- O cálculo roda no máximo uma vez por frame (`requestAnimationFrame`) e só
  atualiza o estado quando a variação passa de 0.5%. Os listeners de scroll e
  resize são passivos.
- Com `prefers-reduced-motion`, p = 1 direto.
- Só o necessário vira client component. A home continua SSG: um componente
  cliente pequeno dentro do `PeekingCharacter`.
- No mobile o personagem continua escondido (`hidden md:block`, como hoje).
- **Antes de ativar o JS** (SSR e primeiro paint), o personagem renderiza no
  estado final. Não pode aparecer piscando nem "subir do zero" se o JS falhar.
  *Meu call:* o SSR renderiza p = 1; ao montar, o componente mede e passa a
  seguir o scroll.

### 4.5 Footer

O `HomeFooter` já tem, só na variante `projects`:
- o hover dos links sociais (seta ↗ aparecendo e sublinhado afastando);
- o link "voltar ao topo" com a seta balançando (`bob`, 1.8s).

**Os dois passam a valer também na home.** O texto continua da chave existente
(`projectsPage.backToTop`). O destino é o topo da página.

## 5. Hovers dos quadros da galeria

Os três quadros do `StudiesGallery` (Estudos rosa, Carreira azul, Galeria de
doodles) ganham o mesmo hover. As imagens continuam as atuais.

**Etapas:**

| Etapa | O que muda | Duração / curva / atraso |
|---|---|---|
| Zoom | a camada de imagem `scale(1 → 1.04)`. No Estudos, as duas camadas (coelhos + cover) vão juntas num wrapper | 1.2s ease-out |
| Painel | véu `rgba(20,37,71,.88)`, `opacity 0 → 1` | .5s ease-out |
| Texto | título e descrição juntos: `opacity 0 → 1` e `translateY(20.7/1728 vw → 0)` | opacity .45s ease / transform .6s ease-out, atraso 50ms |
| Ícone | `rotate(−12deg) scale(1.1)` | .5s ease-bouncy |

**Posição do texto** (do protótipo):
- Estudos: `left 64/1728`, `top 67.56%`, largura 383.6/1728.
- Carreira: `left 64/1728`, `top 62.25%`, largura 402.6/1728.
- Galeria: `left 112.3/1728`, `top 42.8%`, numa linha só.

**Tipografia:**
- título: 24/1728 de largura, peso 600, maiúsculas, com o ícone à esquerda;
- descrição: 20/1728, peso 400, justificada, a 18.1/1728 abaixo do título;
- cor creme `#F9F3EA` (a cor creme do site);
- fonte do site.

**Ícones:** `estudos.png`, `carreira.png` e `galeria.png` vêm do protótipo
(`public/about/icones/`) e são copiados para `public/images/home/icones/`.
Entram como `mask-image` com fundo creme.

**Teclado:** cada quadro recebe `tabIndex={0}`, `role="group"` e um `aria-label`
"título: descrição" traduzido. O foco (`:focus-visible`) dispara o mesmo efeito
do hover, com um contorno creme interno (`inset 0 0 0 3px`).

**Mobile (< md):** não há hover. O véu fica fixo em 55% e o texto sempre
visível, colado ao rodapé do quadro (16px das bordas). Tamanhos: título 15px,
descrição 13px, ícone 16px.

## 6. Movimento reduzido

Com `prefers-reduced-motion: reduce`:
- param o flutuar, o respirar, o balanço, o empurrão e o `bob`;
- as transições de hover viram instantâneas. O hover ainda mostra o texto, sem
  movimento;
- o personagem espiando fica no estado final.

## 7. Restrições

- **Ler antes de usar APIs do Next:** `node_modules/next/dist/docs/` (AGENTS.md).
  Para o client component, usar a diretiva `'use client'` e os padrões desta
  versão.
- **Sem dependências novas.** framer-motion já existe no projeto, mas o
  protótipo é CSS + rAF e assim continua.
- **Sem `box-shadow`, `filter` ou `opacity` estáticos novos na arte.** O véu e a
  opacidade animada dos dedos e das elipses fazem parte do efeito pedido.
- **Intocados:** `ContactForm.tsx`, `Header`, as rotas.

## 8. Verificação (resumo; detalhe no doc de quality gates)

- `pnpm build`, `pnpm lint`, `pnpm exec tsc --noEmit` e as gates 3–7 existentes
  passam.
- **Gate nova** para esta mudança (script + doc):
  - paridade das chaves novas nos dois idiomas, sem chave órfã;
  - keyframes e tokens presentes, e regra de `prefers-reduced-motion` cobrindo
    tudo;
  - **runtime:**
    - nenhuma rolagem horizontal em 390/768/1024/1280/1366/1440/1728/1920, nos
      dois idiomas;
    - crachá (com o balanço no extremo) sem sobrepor o texto da filosofia em
      768–1728;
    - hover e foco de cada quadro levam o véu a 1 e o texto a visível;
    - o personagem espiando em 3 posições de scroll (escondido, no meio, final);
    - com movimento reduzido emulado, nada anima e o personagem está no final.
- **Fidelidade estática:** com as animações pausadas no estado neutro, os crops
  de 1728 das regiões que não mudaram de conteúdo continuam batendo com o
  Figma.

## 9. Decisões fechadas no builder check

Todas são *meu call*, salvo quando a usuária já tinha decidido.

1. **Posição das peças do espiando.** O builder registra cabeça e dedos contra o
   `espiando.png` atual por alinhamento de pixels. É uma varredura de offset
   mínimo, como nas tasks de assets de 2026-10-22, e não "a olho".
   - **Tolerância:** se a melhor sobreposição ficar acima de MAE 5/255 na área da
     arte, trocam-se as peças do protótipo pelas camadas de
     `for-implement/assets_about/`, montadas do mesmo jeito.
   - **Composição final:** é a do protótipo. A cabeça é cortada na linha do topo
     da galeria, e só os dedos ficam por cima dela. Por isso o estado final
     **pode** diferir do PNG atual na faixa de ~14px abaixo do topo da galeria,
     onde hoje boca e mão cruzam a borda. Isso é consequência da animação que a
     usuária escolheu. O crop de fidelidade do personagem exclui essa faixa.
   - **Sombra e grão:** a perda de sombra ou grão que as peças não tenham é
     aceita.
2. **Estrutura.** O `PeekingCharacter` continua no mesmo lugar do DOM, entre a
   filosofia e a galeria.
   - O box atual vira a âncora de posição.
   - Dentro dele vão: o recorte da cabeça, com a borda de baixo exatamente no
     topo da galeria, e a camada dos dedos, acima da galeria no z-order.
   - O `-mb` é recalculado para a galeria continuar em y=2234 em 1728 (antes do
     acréscimo de texto da §3.2).
   - Não há portal.
3. **Medida ao montar.** Se a galeria está fora da tela ao carregar, a troca de
   p=1 para p≈0 não aparece. Se está à vista (recarregar no meio da página), o
   personagem anda até o p real com a transição de .35s. Aceito. Sem
   `opacity: 0` antes de medir, para manter o no-JS.
4. **Crachá.** Igual ao protótipo: no hover, a animação de empurrão substitui o
   balanço, e o pulo para 0° no início é aceito. Depois de 1.6s, com o mouse
   ainda em cima, fica parado em 0°. Ao sair, volta a balançar. O box é fixo
   (377×506 px), então o pivô em % é estável.
5. **Texto dos quadros em larguras menores.**
   - `left`, `top` e `width` são em **% do quadro**, convertidos da geometria do
     protótipo para a nossa:
     - Estudos e Carreira (1152×558): left 64/1152, largura 383.6/1152 e
       402.6/1152;
     - Galeria (576×1117): left 112.3/576;
     - os `top` em % ficam como no protótipo.
   - Fonte com piso:
     - título `clamp(15px, 24/1728·100vw, 24px)`;
     - descrição `clamp(13px, 20/1728·100vw, 20px)`.
   - O bloco de texto pode crescer para baixo a partir do `top`, mas **não pode
     sair do quadro**. A gate mede isso de 768 a 1920 nos dois idiomas. Se sair,
     o builder sobe o `top` só naquele quadro e documenta.
6. **Ordem no DOM:** respondida no item 2.
7. **Véu de 55% no mobile:** faz parte do efeito pedido, então está dentro da
   exceção da §7.
8. **Toque em telas ≥ md** (iPad etc.): `@media (hover: none)` usa o mesmo modo
   do mobile, com véu fixo e texto sempre visível, mas mantém o layout de
   desktop.
9. **Inglês mais longo:** coberto pelo item 5. O texto cresce e a gate verifica
   que não transborda.
10. **"Voltar ao topo" na home.** A usuária aprovou explicitamente.
    - Entra na mesma posição e no mesmo tamanho da variante `projects` do
      `HomeFooter`.
    - O crop do footer em 1728 fica fora da comparação com o Figma.
    - A chave continua `projectsPage.backToTop`: sem renomear, para não mexer na
      página de projetos.

## 10. Execução

O plano marca o modelo de cada task. As tasks mecânicas vão para modelo menor,
a pedido da usuária: dicionários, cópia de assets, keyframes. As de
integração (personagem espiando, quadros) ficam com modelo médio. A revisão
final da branch usa o modelo mais capaz.

## Emendas da execução

Mudanças em relação ao texto acima, decididas durante a execução.

- **Texto dos quadros da Galeria (R4):** entre 768 e 959.98px o texto quebra
  linha (`white-space: normal`, `right: 5.556%`) em vez de ficar em nowrap.
  Um nowrap ali vaza do quadro de 256px, e o §9.5 diz que o texto nunca pode
  sair do quadro. Custo: o título da Galeria quebra em 2 linhas em tablets.
- **Gate 7 (R5):** a asserção do header da home foi alinhada ao design do link
  ativo. O "sobre" da home tem `aria-current="page"` e o "projetos" não tem. A
  falha era pré-existente (commit 465c2ff, anterior à base da branch); só o
  teste mudou, o header não.
- **Alvo do "voltar ao topo" (R6):** passa a existir um único
  `<div id="top" tabIndex={-1} className="outline-none" />` em
  `app/[lang]/layout.tsx`, antes do `HeaderRouter`. Saem o `id`/`tabIndex` do
  wrapper da home (o wrapper some) e do `ProjectsIndex`. Assim o próximo Tab
  depois de voltar ao topo cai no header, em todas as páginas, com ou sem JS, e
  sem `id` duplicado. Antes, o Tab levava à galeria, cerca de 2000px abaixo.
- **Colunas UX/3D (R7):** o §3.2 pedia 2 colunas a partir de `md`. Passam a
  ser 2 colunas a partir de `xl` (1280px); abaixo disso ficam empilhadas, com
  `gap-y-[21px]`. Motivo, medido de 768 a 1920 (passo de 16px), nos 2 idiomas:
  com 2 colunas a partir de `md`, em pt-BR as colunas tinham 135px em 768 e
  236,6px em 1264, e "descobrimos" vazava da coluna entre 768 e 800; em en as
  colunas ficavam abaixo de 240px até 1104. A partir de 1280 todas as colunas
  têm 242,8px ou mais (pt-BR) e 274,6px ou mais (en), sem palavra fora delas.
- **Reserva de texto do crachá (Task 4):** a reserva passou de 100 para 121px
  (`md:pr-[121px]`). É o menor inteiro que zera a sobreposição em qualquer
  ângulo, largura e idioma; com 120px ainda sobrepunha 43 a 92 px².
- **Botão "voltar ao topo" como pílula azul (pedido posterior da usuária,
  substitui o quadrado só de ícone):** o link `#top` do `HomeFooter` (home e
  /projetos) é agora uma pílula no estilo dos botões de filtro de /projetos
  (`.pill`: `border-radius` 999px, `700 14.5px`, padding `5px 11px`, borda
  tracejada de 1,5px, halo de 3px, hover `translateY(-2px) rotate(-1.5deg)` só
  com `(hover: hover)`, active `scale(.94)`), em azul: miolo `#E7ECF2`, texto,
  ícone e tracejado `#527FB0`, halo `#BACCEA`. Mostra a seta pra cima (a
  silhueta do "‹" da usuária traçada em SVG, `currentColor`, ~14px, com o
  `bob`) e o texto VISÍVEL `projectsPage.backToTop`; `aria-label` e `title`
  saíram, o nome acessível é o texto. Estilos em `HomeFooter.module.css`. A gate
  8 e o e2e checam o texto visível nos dois idiomas.
- **Formulário do protótipo na home, contradizendo o não-objetivo da §2:** a
  home agora usa `HomeContactForm` (e-mail com asterisco + solicitação com o
  botão de enviar no canto, animações da ANIMACOES.md §7), a pedido da usuária.
  O `ContactForm` antigo segue só em `/contato`. Textos novos em
  `home.contactForm`, nos dois dicionários.
- **Envio real via EmailJS:** diferente do protótipo, que só simulava, o
  `HomeContactForm` envia pelo mesmo EmailJS e as mesmas env vars
  `NEXT_PUBLIC_EMAILJS_*` do `ContactForm`, validando com zod (e-mail e
  mensagem de 5 caracteres ou mais) e reaproveitando as mensagens de erro de
  `contact.form`. O e2e (grupo `form`) intercepta a requisição; nunca envia
  e-mail de verdade.
- **Ícones do formulário da home:** o asterisco e o avião de enviar do
  `HomeContactForm` são agora os SVGs originais da usuária
  (`public/images/home/form/asterisco.svg` e `enviar.svg`, sem alteração),
  renderizados como `<img alt="" aria-hidden>` em tamanho nativo (29×27 e 23×26;
  menores abaixo de `md`), no lugar dos SVGs inline do protótipo.
