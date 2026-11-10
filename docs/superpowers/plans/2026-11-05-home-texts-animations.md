# Home — textos, animações e hovers do protótipo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar na home atual os textos novos, as animações e os hovers do protótipo About (`for-implement/portfolio-about/`), sem mudar layout, imagens nem formulário.

**Architecture:** Os textos vão para os dicionários (pt-BR verbatim do protótipo, en da spec). As animações contínuas são keyframes globais aplicadas por classes utilitárias. O hover dos quadros é um CSS module do `StudiesGallery`. O personagem espiando ganha um client component pequeno, com scroll em `requestAnimationFrame`. A verificação é a gate 8 do script (estática + curl) mais um script Playwright fora do repo.

**Tech Stack:** Next.js 16 (App Router, SSG), React 19, Tailwind, CSS Modules, Playwright 1.64.1 em `/tmp/pwtest` (fora do repo), ImageMagick `magick`.

**Spec:** `docs/superpowers/specs/2026-11-05-home-texts-animations-design.md` (binding). A §9 fecha as dúvidas do builder check.

## Global Constraints

- Branch `feature/new-texts-and-new-page-project`; BASE = `535defa`.
- AGENTS.md:
  - toda string visível vai em `dictionaries/pt-BR.json` **e** `en.json` na mesma mudança;
  - negrito no meio do texto usa chaves separadas intercaladas no JSX, sem `dangerouslySetInnerHTML`;
  - antes de API do Next, ler `node_modules/next/dist/docs/`.
- Textos: pt-BR **verbatim** do protótipo; en **verbatim** das tabelas da spec §3.
- Animação só com `transform`/`opacity`, nunca propriedades de layout. Sem `filter`/`box-shadow`/opacity estática nova na arte. Exceções: o véu dos quadros, a opacidade animada dos dedos e das elipses, e o contorno de foco inset dos quadros (spec §5).
- `prefers-reduced-motion: reduce` desliga flutuar, respirar, balanço, empurrão e `bob`, e põe o espiando no estado final.
- Intocados: `components/contact/ContactForm.tsx`, `Header`/`HomeHeader`, as rotas. Sem dependências novas no `package.json`.
- Assets copiados de `for-implement/` (que está no `.gitignore`) para `public/images/home/`, com os nomes da spec.
- Curvas:
  - `--ease-out: cubic-bezier(.2,.8,.2,1)`
  - `--ease-spring: cubic-bezier(.2,.9,.3,1.4)`
  - `--ease-bouncy: cubic-bezier(.2,.9,.3,1.6)`
- Commits em inglês. Mensagem termina com exatamente `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Antes de cada commit: `pnpm build && pnpm lint && pnpm exec tsc --noEmit` e `./scripts/check-quality-gates.sh 3`.
- **Servidor:** nunca matar um processo `next` que a task não iniciou. Se :3000 estiver ocupado, subir em outra porta e passar `GATE_BASE_URL=http://localhost:<porta>`.

## Review Focus

1. **Tablet/toque em ≥ md** (`hover: none`): o texto dos quadros tem que aparecer sem hover. Teste na Task 5 (contexto Playwright com `hasTouch`/`isMobile` em 1024).
2. **Crachá no extremo do empurrão (3.5°), em 768–1440:** não pode cobrir o texto da filosofia. Teste na Task 4 (overlap com rotação forçada).
3. **Inglês mais longo nos quadros, em 768:** o texto não pode sair do quadro. Teste na Task 5 (bbox do texto ⊂ bbox do quadro, 768–1920, dois idiomas).
4. **Recarregar no meio da página, ou sem JS:** o espiando não pode sumir nem piscar; sem JS ele fica no estado final. Teste na Task 6 (`javaScriptEnabled: false`).
5. **Movimento reduzido:** nada anima e o hover ainda mostra o texto. Teste na Task 8 (`emulateMedia({ reducedMotion: 'reduce' })`).

---

### Task 1: Quality gates (doc + gate 8 + e2e) — o "teste que falha"

**Modelo:** sonnet.

**Files:**
- Create: `docs/superpowers/quality-gates/2026-11-05-home-texts-animations-quality-gates.md`
- Modify: `scripts/check-quality-gates.sh`: adicionar `gate_8`, a linha no cabeçalho, o `8)` no `case` e o usage. Não entra no `all`, como a 7.
- Create (fora do git): `.superpowers/sdd/2026-11-05-home-texts-animations/e2e.mjs`
- Create (fora do git): `.superpowers/sdd/2026-11-05-home-texts-animations/baseline/` com os prints de referência.

**Interfaces:**
- Produces:
  - `./scripts/check-quality-gates.sh 8`.
  - `node .superpowers/sdd/2026-11-05-home-texts-animations/e2e.mjs [grupo...]`. Grupos: `overflow`, `cracha`, `tiles`, `peek`, `reduced`, `static`, `footer`, `all`. Ele lê `GATE_BASE_URL` (padrão `http://localhost:3000`).
  - Cada grupo imprime uma linha `PASS`/`FAIL` por verificação. O script sai com 1 se houver algum FAIL.
  - As tasks seguintes rodam o grupo delas.

- [ ] **Step 1: Escrever a gate 8 (bash), no padrão da `gate_7`.**

  **Estáticas:**
  - Paridade pt-BR ↔ en das chaves:
    - `home.intro`, `home.philosophyBody1`, `home.philosophyBody2*`;
    - `home.philosophyColUx`, `ColUxBold`, `ColUxEnd`;
    - `home.philosophyCol3d`, `Col3dBold1`, `Col3dMid`, `Col3dBold2`, `Col3dEnd`;
    - `home.tiles.{studies,career,gallery}.{title,text}`.
  - `home.philosophyBody1Bold` e `home.philosophyBody1End` **ausentes** nos dois idiomas.
  - `home.intro` (pt-BR) começa com `Prazer, sou a Ágatha!`.
  - Arquivos existem:
    - `public/images/home/espiando-cabeca.png`
    - `public/images/home/espiando-dedos.png`
    - `public/images/home/icones/{estudos,carreira,galeria}.png`
  - `app/[lang]/globals.css` contém `@keyframes float`, `breathe`, `swing`, `swingHover` e um bloco `@media (prefers-reduced-motion: reduce)` que cita as quatro classes de animação da Task 3/4.
  - Nenhuma string de quadro hardcoded em `components/` ou `app/`. Mesmo regex de ancoragem da gate 7, para: `Minha carreira no design`, `Minha galeria`, `estudos despretensiosos`, `My design career`, `My gallery`.
  - `git diff --quiet 535defa -- components/contact/ContactForm.tsx`.
  - O arquivo do client do espiando (Task 6) começa com `'use client'` ou `"use client"`.

  **Runtime** (curl em `${GATE_BASE_URL:-http://localhost:3000}`; vira SKIP se não responder):
  - HTML de `/pt-BR`: contém o início da intro nova, os 3 títulos de quadro e `id="top"`.
  - HTML de `/en`: o mesmo, com os textos em inglês.
  - Em ambos, o footer tem o link "voltar ao topo" / "back to top", o texto de `projectsPage.backToTop`.

- [ ] **Step 2: Escrever o `e2e.mjs`.**

  Usa Playwright via `createRequire('/tmp/pwtest/node_modules/playwright')`. Se faltar: `cd /tmp && mkdir -p pwtest && cd pwtest && npm init -y && npm i playwright@1.64.1`. Chromium sempre com `executablePath: '/home/jvbarr/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome'`.

  Grupos (larguras `W = [390,768,1024,1280,1366,1440,1728,1920]`, os dois idiomas salvo indicação):

  | grupo | o que verifica |
  |---|---|
  | `overflow` | `scrollWidth − clientWidth === 0` em cada W |
  | `cracha` | em 768–1728, com `.cracha` forçado a `rotate(3.5deg)`, `rotate(-2deg)` e `rotate(1.2deg)` (estilo inline, animação desligada), a interseção do retângulo do corpo do crachá com a coluna de texto da filosofia (h2, p e as duas colunas) dá **área 0** |
  | `tiles` | (a) em 1728, hover em cada quadro → depois de 700ms, véu `opacity ≥ .99` e texto `opacity ≥ .99`; o mesmo com `focus()` + Tab (`:focus-visible`). (b) em 768–1920, com hover, o retângulo do texto de cada quadro fica ⊂ retângulo do quadro, nos dois idiomas. (c) em 390, e em 1024 num contexto `hasTouch: true, isMobile: true`: texto visível sem hover (`opacity ≥ .99`) e véu entre .5 e .6 |
  | `peek` | em 1728: rolar até o topo da galeria em `y = vh` → cabeça com `translateY` ≥ 90% e dedos `opacity ≤ .01`. Até `y = vh × .725` → cabeça entre 10% e 90%. Até `y = vh × .4` → cabeça `translateY ≤ 1%` e dedos `opacity ≥ .99`. Com `javaScriptEnabled: false` → cabeça em 0% e dedos em 1 |
  | `reduced` | com `emulateMedia({ reducedMotion: 'reduce' })`: `getAnimations().length === 0` para personagens, elipses e `.cracha`; o espiando no estado final sem rolar; e o hover do quadro ainda deixa o texto visível |
  | `static` | com movimento reduzido, em 1728: `locator.screenshot()` do personagem do olá, do do contato, de cada elipse, do `.cracha` e dos 3 quadros sem hover, comparados por MAE com `baseline/` → ≤ 2/255. O espiando é comparado só acima do topo da galeria → ≤ 5/255 (spec §9.1) |
  | `footer` | em `/pt-BR` e `/en`, clicar no "voltar ao topo" → `scrollY === 0`; hover no link social → a seta ↗ fica com `opacity ≥ .99` |

- [ ] **Step 3: Gerar o baseline.**

  Com a árvore em BASE (antes de qualquer task), build + start, depois:

  `node e2e.mjs --write-baseline static`

  Isso grava os prints do grupo `static` em `baseline/`.

  Os locators do `static` têm que funcionar antes **e** depois das tasks:

  | peça | locator |
  |---|---|
  | olá | `img[src$="ola-personagem.png"]` |
  | contato | `img[src$="contato-personagem.png"]` |
  | elipses | `img[src*="/ellipse-"]` (5) |
  | crachá | `.cracha` |
  | quadros | a célula de `img[src$="estudos-cover.png"]`, `img[src$="carreira-baleia.png"]` e `img[src$="doodles-azul.svg"]`, via `img.closest('[data-tile]') ?? img.parentElement` |

  **Espiando:** o print é um recorte da página, não de elemento. O retângulo é o do `espiando.png` em BASE, guardado como offset relativo ao canto superior esquerdo da `<section>` da galeria e cortado no topo da galeria. Depois da Task 6, o mesmo offset é aplicado ao topo da galeria da árvore atual, porque a filosofia cresce na Task 2 e empurra tudo.

- [ ] **Step 4: Rodar e confirmar que falha.**

  Rodar `./scripts/check-quality-gates.sh 8` e `node .../e2e.mjs all`.

  Esperado: FAIL nas chaves, nos assets, nas keyframes e nos grupos `tiles`, `peek`, `reduced` e `footer`. PASS em `overflow`, `cracha` e `static`. Anotar a saída no relatório.

- [ ] **Step 5: Escrever o doc de quality gates.**

  Formato do `2026-10-23-projects-page-quality-gates.md`:
  - quick start;
  - uma seção por task com os comandos e o resultado esperado;
  - a regra "nenhum item marcado sem evidência no relatório da task".

- [ ] **Step 6: Commit.**

  ```bash
  git add scripts/check-quality-gates.sh docs/superpowers/quality-gates/2026-11-05-home-texts-animations-quality-gates.md
  git commit -m "test(gates): add gate 8 for home texts, animations and hovers"
  ```

### Task 2: Textos novos (dicionários + filosofia)

**Modelo:** haiku. É transcrição da spec §3.

**Files:**
- Modify: `dictionaries/pt-BR.json`, `dictionaries/en.json` (bloco `home`)
- Modify: `components/home/PhilosophySection.tsx` (bloco de texto, ~linhas 250–275)

**Interfaces:**
- Produces: as chaves `home.philosophyColUx*`, `home.philosophyCol3d*` e `home.tiles.{studies,career,gallery}.{title,text}`, com os nomes exatos da spec §3. A Task 5 consome `home.tiles.*`.

- [ ] **Step 1: Atualizar os dois dicionários.**

  Seguir as tabelas da spec §3.1–§3.3, valores verbatim:
  - mudam `home.intro`, `home.philosophyBody1` e `home.philosophyBody2*`;
  - saem `home.philosophyBody1Bold` e `home.philosophyBody1End`;
  - entram as colunas e `home.tiles`.

  O `philosophyColUx` em inglês é a string vazia `""`. As chaves `experience*` ficam como estão.

- [ ] **Step 2: Atualizar a `PhilosophySection`.**

  - O parágrafo 1 vira só `{home.philosophyBody1}`.
  - Depois do parágrafo 2, entra um `<div>` de colunas:
    - `grid grid-cols-1 md:grid-cols-2`;
    - `md:gap-x-[4.99vw]` (86.3/1728);
    - `mt-[21px]`, `gap-y-[21px]` no mobile;
    - `max-w-[702px]`.
  - Cada coluna é um `<p>` com as mesmas classes e o mesmo `style` (`wordSpacing: 0.08em`) do parágrafo 2, intercalando `<strong className="font-bold">` como o parágrafo 2.

- [ ] **Step 3: Verificar.**

  Build, lint, tsc, gate 3. Na gate 8, as verificações de chave passam (as de asset e keyframe continuam FAIL). `e2e.mjs cracha overflow` → PASS.

- [ ] **Step 4: Commit.** `feat(home): new intro and philosophy texts with UX and 3D columns`

### Task 3: Animações contínuas — flutuar e respirar

**Modelo:** haiku.

**Files:**
- Modify: `app/[lang]/globals.css`
- Modify: `components/home/GreetingSection.tsx`
- Modify: `components/home/ContactSection.tsx`
- Modify: `app/[lang]/page.tsx` (as 5 `<img>` de elipse)

**Interfaces:**
- Produces, em `globals.css`:
  - as variáveis de curva da Global Constraints no `:root`;
  - `@keyframes float` (`0%,100% { transform: translateY(0) } 50% { transform: translateY(-1vw) }`);
  - `@keyframes breathe` (`0%,100% { transform: scale(1); opacity: .9 } 50% { transform: scale(1.08); opacity: 1 }`);
  - as classes `.anim-float` (3.4s ease-in-out infinite), `.anim-float-2` (3.8s ease-in-out .6s infinite) e `.anim-breathe` (6s ease-in-out infinite, `transform-origin: center`);
  - o bloco `@media (prefers-reduced-motion: reduce)` com `animation: none` para elas. A Task 4 acrescenta a sua classe ao mesmo bloco.

- [ ] **Step 1: Adicionar curvas, keyframes, classes e o bloco de movimento reduzido.**
- [ ] **Step 2: Aplicar as classes.**
  - Envolver a img do olá num `<div className="anim-float">` sem mexer nas classes da img.
  - O mesmo com a do contato, usando `anim-float-2`.
  - Pôr `anim-breathe` em cada uma das 5 img de elipse.
- [ ] **Step 3: Verificar.**
  - Build, lint, tsc, gate 3.
  - `e2e.mjs overflow static`: PASS. O grupo `static` roda com movimento reduzido, então o estado parado é igual ao baseline.
  - Em 1728, `getAnimations()` da img do olá (via wrapper) e das elipses mostra animação rodando.
- [ ] **Step 4: Commit.** `feat(home): float characters and breathing ellipses`

### Task 4: Crachá balançando

**Modelo:** sonnet. Exige medir a reserva.

**Files:**
- Modify: `app/[lang]/globals.css`
- Modify: `components/home/PhilosophySection.tsx` (`.cracha` e a reserva `md:pr-[100px]` da coluna de texto)

**Interfaces:**
- Consumes: o bloco de movimento reduzido da Task 3.
- Produces:
  - `@keyframes swing` (`0%,100% { rotate(-1.2deg) } 50% { rotate(1.2deg) }`);
  - `@keyframes swingHover` (`0% 0 · 30% 3.5deg · 60% -2deg · 85% .8deg · 100% 0`);
  - a classe `.cracha-swing` (`animation: swing 5s ease-in-out infinite; transform-origin: 27.1% 30.4%`);
  - `.cracha-swing:hover { animation: swingHover 1.6s ease-in-out }`;
  - `.cracha-swing` incluída no bloco de movimento reduzido.

- [ ] **Step 1: Rodar `e2e.mjs cracha` com a classe já aplicada mas a reserva antiga.** Anotar a sobreposição máxima por largura. É esperado falhar em 3.5° nas larguras estreitas.
- [ ] **Step 2: Adicionar keyframes e classe e aplicar no box `.cracha`.**
- [ ] **Step 3: Recalcular a reserva da coluna de texto.**
  - A nova reserva é o menor valor inteiro em px que zera o grupo `cracha` em todas as larguras, com 3.5°, −2° e 1.2°. A expectativa é ~125px.
  - Atualizar o comentário que explica os 100px.
  - Em 1728 o texto não pode mudar de largura (máx. 705px numa coluna de 1037px). Confirmar com `e2e.mjs static`.
- [ ] **Step 4: Verificar.** `e2e.mjs cracha overflow static` PASS; build, lint, tsc, gate 3.
- [ ] **Step 5: Commit.** `feat(home): cracha sways from its hole and swings on hover`

### Task 5: Hover dos quadros da galeria

**Modelo:** sonnet.

**Files:**
- Create: `components/home/StudiesGallery.module.css`
- Modify: `components/home/StudiesGallery.tsx`
- Create:
  - `public/images/home/icones/estudos.png`
  - `public/images/home/icones/carreira.png`
  - `public/images/home/icones/galeria.png`

  São cópias de `for-implement/portfolio-about/public/about/icones/`.

**Interfaces:**
- Consumes: `home.tiles.*` da Task 2.
- Produces: cada quadro com a classe `tile` do module e os filhos `tileImg` (wrapper das imagens), `veil`, `tileText`, `tileTitle`, `tileIcon` e `tileDesc`. O e2e localiza os quadros por `[data-tile="studies|career|gallery"]` e o texto por `[data-tile-text]`.

- [ ] **Step 1: Rodar `e2e.mjs tiles` e confirmar FAIL.**
- [ ] **Step 2: Escrever o module com os valores da spec §5 e §9.5.**
  - Véu `rgba(20,37,71,.88)`.
  - Tempos e curvas da tabela da §5.
  - Posições em % do quadro:
    - Estudos e Carreira: `left 5.556%`; `width 33.30%` e `34.95%`; `top 67.56%` e `62.25%`.
    - Galeria: `left 19.50%`, `top 42.8%`, `white-space: nowrap`.
  - Fontes:
    - título `clamp(15px, 1.389vw, 24px)`, peso 600, uppercase;
    - descrição `clamp(13px, 1.157vw, 20px)`, peso 400, justificada;
    - margem entre os dois `clamp(8px, 1.047vw, 18.1px)`.
  - Cor `var(--color-cream)`.
  - Ícone com `mask-image` e fundo creme. Hover: `rotate(-12deg) scale(1.1)`.
  - Foco: `:focus-visible` com `box-shadow: inset 0 0 0 3px var(--color-cream)`.
  - `@media (max-width: 767.98px), (hover: none)`: véu `opacity .55`, texto sempre visível, `top: auto; bottom: 16px; left: 16px; right: 16px; width: auto; white-space: normal`. Tamanhos: título 15px, descrição 13px, ícone 16px.
  - O bloco de movimento reduzido zera as transições.
- [ ] **Step 3: Montar o markup.**
  - Cada quadro é um `<div data-tile=… tabIndex={0} role="group" aria-label={`${title}: ${text}`}>`.
  - As imagens atuais vão num wrapper `tileImg`, sem mudar o estilo delas. No Estudos, as duas camadas vão juntas.
  - Depois: véu (`aria-hidden`) e o bloco de texto (`data-tile-text`), com o ícone `aria-hidden`.
  - Nenhum link.
- [ ] **Step 4: Verificar.**
  - `e2e.mjs tiles overflow static` PASS. Se algum texto sair do quadro, subir o `top` só daquele quadro e documentar (spec §9.5).
  - Build, lint, tsc, gate 3.
- [ ] **Step 5: Commit.** `feat(home): gallery tiles reveal title and description on hover and focus`

### Task 6: Personagem espiando com scroll

**Modelo:** sonnet.

**Files:**
- Create: `components/home/PeekingReveal.tsx` (`'use client'`)
- Modify: `components/home/PeekingCharacter.tsx`
- Create:
  - `public/images/home/espiando-cabeca.png` (de `for-implement/portfolio-about/public/about/`)
  - `public/images/home/espiando-dedos.png`
- Delete: `public/images/home/espiando.png`, só depois de `grep -rn 'espiando\.png' app components lib` dar zero.

**Interfaces:**
- Produces: `PeekingReveal({ alt }: { alt: string })`, renderizado pelo `PeekingCharacter` (server).
  - Nós para o e2e: `[data-peek-head]` (a img dentro do recorte) e `[data-peek-fingers]`.
  - O `alt` vai num texto só para leitores de tela. As duas imgs são `aria-hidden`.

- [ ] **Step 1: Rodar `e2e.mjs peek` e confirmar FAIL.**
- [ ] **Step 2: Registrar as peças.**
  - Em `/tmp` ou no scratchpad, varrer offset e escala da cabeça e dos dedos sobre o `espiando.png` atual. Escala: as peças ~1x contra o PNG @2x, então testar fatores perto de 766.5/744.
  - Usar o offset de MAE mínimo na área da arte.
  - Se o mínimo passar de 5/255, usar as camadas de `for-implement/assets_about/` (spec §9.1) e registrar do mesmo jeito.
  - Anotar no relatório os offsets, a escala e os MAEs.
- [ ] **Step 3: Implementar o `PeekingReveal`.**
  - Fórmulas da spec §4.4:
    - `p = clamp((vh − line)/(vh·0.55),0,1)`, com `line` = borda de baixo do recorte da cabeça;
    - `e = p²(3−2p)`;
    - cabeça `translateY((1−e)·100%)`;
    - `f = clamp((p−0.9)/0.1,0,1)`;
    - dedos `opacity: f`, `translateY((1−f)·−60%)`.
  - rAF no máximo 1 por frame. Atualiza o estado só com variação > 0.005. Listeners passivos de scroll e resize, removidos no unmount.
  - O estado inicial (SSR) é `p = 1`. Com movimento reduzido, fica em `p = 1`. Usar um hook próprio de `matchMedia`, no padrão do `hooks/useReducedMotion.ts` do protótipo.
  - Transições: cabeça `transform .35s var(--ease-out)`; dedos `opacity .35s ease, transform .45s var(--ease-bouncy)`.
- [ ] **Step 4: Montar a estrutura (spec §9.2).**
  - O box atual do `PeekingCharacter` vira a âncora.
  - Dentro dele:
    - o recorte `overflow: hidden`, com a borda de baixo exatamente no topo da galeria;
    - os dedos, posicionados pelo registro, com `z` acima da galeria.
  - O `-mb` é recalculado para a galeria continuar no mesmo lugar em relação à filosofia.
  - Atualizar o comentário de geometria.
- [ ] **Step 5: Verificar.**
  - `e2e.mjs peek static overflow` PASS. No `static`, o crop do espiando é só acima do topo da galeria.
  - Build, lint, tsc, gate 3, gate 8 (a parte `'use client'`).
- [ ] **Step 6: Commit.** `feat(home): peeking character rises from behind the gallery on scroll`

### Task 7: Footer da home — hover social e "voltar ao topo"

**Modelo:** haiku.

**Files:**
- Modify: `components/layout/HomeFooter.tsx`
- Modify: `app/[lang]/page.tsx` (alvo `#top`)

- [ ] **Step 1: Rodar `e2e.mjs footer` e confirmar FAIL.**
- [ ] **Step 2: Ativar na home.**
  - No `HomeFooter`, a seta ↗, o `group/social` e o link "voltar ao topo" passam a valer nas duas variantes. O `variant` continua existindo, sem efeito visual, e o comentário é atualizado.
  - Na home, envolver o conteúdo do `page.tsx` num `<div id="top" tabIndex={-1} className="outline-none">`, para o link ter destino e foco, como faz `ProjectsIndex`.
- [ ] **Step 3: Verificar.**
  - `e2e.mjs footer overflow` PASS.
  - A gate 7 continua PASS (a página de projetos não muda).
  - Build, lint, tsc, gate 3.
- [ ] **Step 4: Commit.** `feat(home): social link hover and back-to-top in the home footer`

### Task 8: Verificação final

**Modelo:** sonnet.

- [ ] **Step 1: Rodar tudo.**
  - `pnpm build && pnpm lint && pnpm exec tsc --noEmit`
  - `./scripts/check-quality-gates.sh 3`, `4`, `5`, `7`, `8`, `6`, com o servidor de produção no ar
  - `node .superpowers/sdd/2026-11-05-home-texts-animations/e2e.mjs all`

  Esperado: 0 FAIL.
- [ ] **Step 2: Conferência visual.**
  - Prints de `/pt-BR` e `/en` em 1728 e 390.
  - Hover de cada quadro em 1024.
  - O espiando em 3 posições de rolagem.

  Salvar no workspace e anotar no relatório os caminhos e o que foi olhado.
- [ ] **Step 3: Commit.** Só se algo foi corrigido, com a correção ligada ao grupo que falhou.
