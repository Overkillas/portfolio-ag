# Quality Gates: Home — textos, animações e hovers do protótipo About

**Feature:** textos novos, animações (flutuar, respirar, balançar, espiando com scroll) e hovers (quadros da galeria, footer) na home
**Spec:** `docs/superpowers/specs/2026-11-05-home-texts-animations-design.md`
**Plan:** `docs/superpowers/plans/2026-11-05-home-texts-animations.md`
**Branch:** `feature/new-texts-and-new-page-project`
**BASE:** `e619d17` (o código da home ainda é o de antes; só a spec e o plan foram acrescentados)
**Data:** 2026-11-05

Cada gate tem que passar **antes** de seguir para a próxima task do plan indicada.
Nenhum item pode ser marcado sem a evidência (saída do comando, print ou medição)
anotada no relatório da task em `.superpowers/sdd/2026-11-05-home-texts-animations/`.

---

## Quick start

```bash
# Obrigatórios antes de cada commit (AGENTS.md):
pnpm build && pnpm lint && pnpm exec tsc --noEmit

# Gates de script (servidor de produção em :3000 para a parte de runtime):
./scripts/check-quality-gates.sh 3   # componentes (i18n)
./scripts/check-quality-gates.sh 8   # NOVO: esta feature (estático + runtime)

# Gates de navegador (Playwright, fora do repo — .superpowers/sdd é ignorado pelo git):
node .superpowers/sdd/2026-11-05-home-texts-animations/e2e.mjs [grupo...]
# grupos: overflow cracha tiles peek reduced static footer all
```

- Servidor: `pnpm build && pnpm start` (sempre produção; baseline e comparações usam o
  mesmo tipo de servidor). Se :3000 estiver ocupado, subir em outra porta e passar
  `GATE_BASE_URL=http://localhost:<porta>` (vale para a gate 8 e para o e2e).
  Nunca matar um processo `next` que a task não iniciou.
- Playwright: o chromium 1234 já está em `~/.cache/ms-playwright/`. Se `/tmp/pwtest`
  não existir: `mkdir -p /tmp/pwtest && cd /tmp/pwtest && npm init -y && npm i playwright@1.64.1 pngjs`.
  O e2e sempre abre o chromium com `executablePath` explícito.
- Medir sempre o que o navegador renderiza (valores computados), não o arquivo.
- A gate 8 não entra no `all` (como a 7): roda por task. A parte de runtime vira SKIP
  se nada responde no servidor.
- `e2e.mjs --write-baseline static` grava `baseline/` (PNGs + `espiando.json`). Rodar só
  com a árvore em BASE; o diretório é ignorado pelo git de propósito.

**Exit codes:** `0` = PASS, `1` = FAIL.

---

## Gate H0 — Baseline e teste que falha (Task 1)

- [ ] `./scripts/check-quality-gates.sh 8` falha nas chaves, nos assets, nas keyframes,
      no bloco de movimento reduzido, no `PeekingReveal` e no HTML (BASE).
- [ ] `e2e.mjs all` em BASE: PASS em `overflow` e `static`; FAIL em `tiles`, `peek`,
      `reduced` e `footer`. O grupo `cracha` pode falhar em BASE: a rotação forçada contra a
      reserva de 100px é o que a Task 4 corrige.
- [ ] `baseline/` gerado em BASE: `ola`, `contato`, `elipse-1..5`, `cracha`,
      `tile-studies`, `tile-career`, `tile-gallery`, `espiando` (+ `espiando.json`).
- [ ] `e2e.mjs static` logo em seguida, sem mudar nada: MAE 0.

## Gate H1 — Textos e dicionários (Task 2)

- [ ] `pnpm build` passa (paridade pt-BR ↔ en via `satisfies`).
- [ ] `./scripts/check-quality-gates.sh 8`: a parte das chaves passa (`home.intro`,
      `philosophyBody1`, `philosophyBody2*`, `philosophyColUx*`, `philosophyCol3d*`,
      `tiles.{studies,career,gallery}.{title,text}`); `philosophyBody1Bold` e
      `philosophyBody1End` ausentes nos dois idiomas; `home.intro` pt-BR começa com
      `Prazer, sou a Ágatha!`.
- [ ] Nenhuma string de quadro hardcoded em `components/` ou `app/`
      (`Minha carreira no design`, `Minha galeria`, `estudos despretensiosos`,
      `My design career`, `My gallery`).
- [ ] `ContactForm.tsx` sem diff desde `535defa`.
- [ ] `e2e.mjs overflow` PASS (a filosofia mais alta não gera rolagem horizontal).
- [ ] `e2e.mjs static`: PASS. A filosofia cresce e empurra a página, mas os prints são por
      elemento e o do espiando é por offset da galeria.

## Gate H2 — Animações de personagens e elipses (Task 3)

- [ ] `@keyframes float` e `breathe` em `app/[lang]/globals.css`; bloco
      `@media (prefers-reduced-motion: reduce)` com `.anim-float`, `.anim-float-2`,
      `.anim-breathe`.
- [ ] `e2e.mjs overflow static` PASS (o `static` roda com movimento reduzido: o estado
      parado bate com o baseline, MAE ≤ 2/255).
- [ ] Em 1728, `getAnimations()` do wrapper do olá e das elipses mostra animação rodando.

## Gate H3 — Crachá balançando (Task 4)

- [ ] `@keyframes swing` e `swingHover`; `.cracha-swing` no bloco de movimento reduzido.
- [ ] `e2e.mjs cracha`: área de sobreposição **0** entre o corpo do crachá e a coluna de
      texto da filosofia, de 768 a 1728, nos dois idiomas, com `rotate(3.5deg)`,
      `rotate(-2deg)` e `rotate(1.2deg)` forçados.
- [ ] A reserva `md:pr-[...]` é o menor inteiro em px que zera o grupo; comentário do
      componente atualizado.
- [ ] `e2e.mjs cracha overflow static` PASS.

## Gate H4 — Hover dos quadros (Task 5)

- [ ] `e2e.mjs tiles` PASS:
  - hover e foco (`:focus-visible`) a 1728: véu e texto com `opacity ≥ .99` após 700ms;
  - de 768 a 1920, nos dois idiomas, o retângulo do texto fica dentro do quadro;
  - em 390 e em 1024 com `hasTouch`/`isMobile`: texto visível sem hover e véu entre
    .5 e .6.
- [ ] Locators fixos: `[data-tile="studies|career|gallery"]` e `[data-tile-text]`; o véu é o
      filho do quadro com fundo `rgba(20,37,71,…)` (ou o filho `aria-hidden` sem imagem).
- [ ] Ícones em `public/images/home/icones/{estudos,carreira,galeria}.png`.
- [ ] `e2e.mjs overflow static` PASS.

## Gate H5 — Personagem espiando (Task 6)

- [ ] `components/home/PeekingReveal.tsx` começa com `'use client'`; home continua SSG.
- [ ] `public/images/home/espiando-cabeca.png` e `espiando-dedos.png` existem.
- [ ] `e2e.mjs peek` PASS, em 1728:
  - topo da galeria em y = vh: cabeça com `translateY ≥ 90%`, dedos `opacity ≤ .01`;
  - y = vh × .725: cabeça entre 10% e 90%;
  - y = vh × .4: cabeça `≤ 1%`, dedos `≥ .99`;
  - `javaScriptEnabled: false`: cabeça em 0% e dedos em 1.
- [ ] Locators fixos: `[data-peek-head]` e `[data-peek-fingers]`.
- [ ] `e2e.mjs static`: o espiando, acima do topo da galeria, MAE ≤ 5/255 contra o baseline
      (offset relativo à `<section>` da galeria, spec §9.1; as elipses ficam ocultas na captura).

## Gate H6 — Footer (Task 7)

- [ ] `e2e.mjs footer` PASS em `/pt-BR` e `/en`: "voltar ao topo" / "back to top"
      leva a `scrollY === 0`; hover no link social deixa a seta ↗ com `opacity ≥ .99`.
- [ ] `./scripts/check-quality-gates.sh 8`: runtime passa (`id="top"`, link do footer,
      textos novos nos dois idiomas).

## Gate H7 — Movimento reduzido e fechamento (Task 8)

- [ ] `e2e.mjs reduced` PASS: com `emulateMedia({ reducedMotion: 'reduce' })`,
      `getAnimations()` vazio para personagens, elipses e `.cracha` (inclusive em hover);
      espiando no estado final sem rolar; hover do quadro ainda mostra o texto.
- [ ] `e2e.mjs all` PASS.
- [ ] `./scripts/check-quality-gates.sh 8`, `3`, `4`, `5`, `6`, `7` passam.
- [ ] `pnpm build && pnpm lint && pnpm exec tsc --noEmit` limpos.
- [ ] Servidor iniciado pela task foi parado.

---

## Regra de evidência

Nenhum item acima é marcado sem a saída do comando (linhas `PASS`/`FAIL`), print ou
medição anotada no relatório da task. "Deveria passar" não conta.
