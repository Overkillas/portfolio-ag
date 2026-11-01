# Quality Gates: Página de Projetos + modal de case

**Feature:** `/[lang]/projetos` (grade bento, busca, mascote, filtros, cursor) + modal de case via rota interceptada
**Spec:** `docs/superpowers/specs/2026-10-23-projects-page-design.md`
**Plan:** `docs/superpowers/plans/2026-10-23-projects-page.md`
**Branch:** `feature/project-page`
**Data:** 2026-10-23

Cada gate tem que passar **antes** de seguir para a próxima task do plan indicada.
Nenhum item pode ser marcado sem a evidência (saída do comando, print ou medição)
anotada no relatório da task em `.superpowers/sdd/2026-10-23-projects-page/`.

---

## Quick start

```bash
# Obrigatórios antes de cada commit (AGENTS.md):
pnpm build && pnpm lint && pnpm exec tsc --noEmit

# Gates de script (dev server rodando em :3000 para 5 e 7):
./scripts/check-quality-gates.sh 3   # componentes (i18n)
./scripts/check-quality-gates.sh 4   # páginas (i18n)
./scripts/check-quality-gates.sh 5   # runtime (i18n)
./scripts/check-quality-gates.sh 7   # NOVO: página de projetos (criado no plan)
./scripts/check-quality-gates.sh 6   # pre-merge (só no final)

# Gates de navegador (Playwright, fora do repo — .superpowers/sdd é ignorado pelo git):
node .superpowers/sdd/2026-10-23-projects-page/e2e.mjs
```

Playwright: o chromium 1234 já está em `~/.cache/ms-playwright/`. Se
`/tmp/pwtest` não existir: `mkdir -p /tmp/pwtest && cd /tmp/pwtest && npm init -y && npm i playwright@1.64.1`.
Medir sempre o que o navegador renderiza, não o arquivo.

**Exit codes:** `0` = PASS, `1` = FAIL.

---

## Gate P0 — Baseline (antes de qualquer código)

- [ ] `pnpm build`, `pnpm lint`, `pnpm exec tsc --noEmit` passam no estado atual
      (se algo já falha, anotar como pré-existente antes de começar).
- [ ] Snapshot do HTML do `<article>` das 3 páginas de case, nos 2 idiomas, salvo em
      `.superpowers/sdd/2026-10-23-projects-page/baseline/<locale>-<slug>.html`
      (servidor de produção: `pnpm build && pnpm start`; extrair só o `<article>…</article>`).
- [ ] Prints em 1728px de `/pt-BR` (home) e das 3 páginas de case, para comparação.

## Gate P1 — Extração do corpo dos cases (sem mudança visível)

- [ ] build / lint / tsc limpos.
- [ ] O `<article>` das 3 páginas de case nos 2 idiomas é **idêntico** ao baseline
      (diff vazio). Qualquer diferença bloqueia.
- [ ] `CaseShell` sem a opção de animação renderiza exatamente como antes.

## Gate P2 — Dados, dicionários e assets

- [ ] `pnpm build` passa (valida paridade pt-BR ↔ en via `satisfies`).
- [ ] Toda chave nova existe nos **dois** JSON com o mesmo formato (gate 6 → paridade).
- [ ] Nenhuma string visível hardcoded nos componentes novos: grep pelas frases do
      design (`Olha que legal`, `Clica pra ver`, `Achei`, `DESTAQUE`, `abrir`,
      `voltar aos projetos`, `próximo`, `Pesquise por`, `limpar busca`,
      `Nenhum projeto`, `voltar ao topo`, `todos`, `design gráfico`…) em
      `components/` e `app/` retorna vazio.
- [ ] Placeholders (`{count}`, `{title}`) presentes nas duas línguas.
- [ ] `projectMeta` tem os dados de grade da spec §5.4; nenhum texto em `projectMeta`.
- [ ] Assets em `public/images/projetos/`: `mascote.png` e `icones/{coelho,servicos,3d,interacao,grafico}.png`.
- [ ] **Nenhum** asset de exemplo do design no repo:
      `git ls-files public | grep -E 'peixes|coelhinhos|jardim|cidade-3d|portfolio-banner|footer-bg|nav-(about|projects)'` vazio.
- [ ] Nenhum import de `dictionaries/*.json` em Client Component.

## Gate P3 — Página índice (servidor)

Com `pnpm dev` (ou `pnpm start`) em :3000:

- [ ] `GET /pt-BR/projetos` e `GET /en/projetos` → 200.
- [ ] Banner: o SVG do título ocupa a largura toda da banda (largura do SVG ≥ 100%
      da banda, não os 74% do modo curto) nos 2 idiomas, e a parte de baixo das
      letras fica cortada pela borda inferior, como em `portfolio-banner.png`
      (conferir no gate P6/visual — o curl só confirma que a página responde).
- [ ] `GET /projetos` sem cookie → redireciona para `/pt-BR/projetos`.
- [ ] `GET /fr/projetos` → 404.
- [ ] `<title>` = `Projetos · Ágatha Sales` / `Projects · Ágatha Sales`.
- [ ] hreflang `pt-BR`, `en`, `x-default` presentes e absolutos, apontando para `/…/projetos`.
- [ ] O link "projetos" do header aponta para `/{locale}/projetos` (na home e na página).
- [ ] Os 3 projetos aparecem com `href="/{locale}/projetos/<slug>"` (locale certo em cada idioma).
- [ ] Nenhuma chave crua do dicionário no HTML (`projectsPage.` etc.).
- [ ] `/pt-BR/projetos/batuco-tuco` (acesso direto) → 200 com a página completa, **sem** dialog.
- [ ] `/pt-BR/projetos/nao-existe` → 404.

## Gate P4 — Modal e navegação (Playwright, 1728px, nos 2 idiomas)

- [ ] Clique num card → URL vira `/{locale}/projetos/<slug>` e aparece `role="dialog"`
      com `aria-modal="true"`, rotulado pelo título do projeto.
- [ ] O conteúdo do modal tem as mesmas seções da página completa (subtítulo, status,
      tags, intro, títulos das seções, agradecimento) e as imagens do case carregam (sem 404).
- [ ] **Header e footer não trocam** com o modal aberto: o header continua o
      `HomeHeader` (link "sobre"/"about", não "Sobre mim"/"About me") durante todo o
      tempo em que o modal está aberto.
- [ ] Foco inicial no botão "voltar aos projetos"; Tab e Shift+Tab nunca saem do modal
      (testar ≥ 30 tabs em cada direção).
- [ ] `body` com `overflow: hidden` enquanto aberto; restaurado ao fechar.
- [ ] Esc fecha → URL volta para `/{locale}/projetos`, sem dialog.
- [ ] Botão "voltar aos projetos" fecha igual ao Esc.
- [ ] Botão voltar do navegador fecha igual ao Esc.
- [ ] Após fechar: `window.scrollY` igual ao de antes de abrir (±2px) e o foco está no card que abriu.
- [ ] "Próximo" → URL do próximo slug (ordem de `projectMeta`, cíclica), conteúdo
      troca, folha volta ao topo, e **um único** voltar do navegador leva à grade.
- [ ] Clique do meio / `Ctrl+clique` num card abre a página completa em nova aba.
- [ ] Recarregar a página com o modal aberto mostra a página completa (sem dialog).
- [ ] **Troca de idioma numa página de case aberta direto** (`/pt-BR/projetos/batuco-tuco`
      → clicar EN): termina em `/en/projetos/batuco-tuco` com a **página completa**
      (Header antigo, `<article>`, **sem** dialog). Repetir EN → PT e para os 3 slugs.
- [ ] Troca de idioma em `/pt-BR/projetos` (índice) continua navegação no cliente e
      termina em `/en/projetos` com a grade.

## Gate P5 — Interações da grade (Playwright)

- [ ] Busca "grafico" (sem acento) acha `pontos-sem-no`; busca "xyz" mostra estado
      vazio, mascote triste e o botão limpar; clicar em limpar restaura os 3.
- [ ] Filtro "design 3d" mostra só `pontinhas-soltas`; clicar de novo na mesma pílula volta a "todos".
- [ ] Filtro "design de serviços" mostra o estado vazio.
- [ ] `aria-pressed` correto nas pílulas; o balão (`role="status"`) muda a frase
      conforme a spec (padrão, hover destaque, hover outro, busca, filtro 1/n, vazio), nos 2 idiomas.
- [ ] Hover no card de destaque mostra o selo DESTAQUE/FEATURED; nos outros, não.
- [ ] Cursor personalizado aparece sobre os cards em ponteiro fino; não é montado
      com `hasTouch`/`hover: none` emulado.
- [ ] Com `hover: none`: véu, texto e selo dos cards sempre visíveis.

## Gate P6 — Responsivo e movimento reduzido (Playwright)

- [ ] Sem overflow horizontal (`document.documentElement.scrollWidth === innerWidth`)
      em **390, 768, 1024, 1280, 1366, 1728, 1920**, em `/pt-BR/projetos` e `/en/projetos`,
      e com o modal aberto em 390 e 1728.
- [ ] ≤ 900px as colunas quebram; ≤ 700px a busca fica abaixo do mascote.
- [ ] Nenhum texto cortado/sobreposto nos cards, pílulas e balão nos 2 idiomas
      (o inglês tende a ser mais curto, o pt-BR mais longo — conferir ambos).
- [ ] `reducedMotion: 'reduce'`: nenhuma animação CSS ativa na página nem no modal
      (`document.getAnimations().length === 0` após carregar e após abrir o modal);
      rolar não aplica transform no banner; mover o mouse não inclina card nem gira o mascote.

## Gate P7 — Regressões

- [ ] Home `/pt-BR` e `/en` em 1728 e 390: idênticas ao print do P0 (exceto o
      `href` do link "projetos" e, se implementado, o hover do header).
- [ ] Páginas de case abertas direto: Header/Footer antigos, conteúdo idêntico ao baseline.
- [ ] Páginas de categoria e `/contato` sem mudanças.
- [ ] Os outros usos do `BrandHero` (home, contato, categorias) renderizam igual ao P0
      (as props novas são opcionais e desligadas por padrão).
- [ ] Gates de script 3, 4 e 5 passam.

## Gate visual manual (obrigatório, não automatizado)

Com `ANIMACOES.md` aberto ao lado (`for-implement/portfolio-projetos/ANIMACOES.md`),
conferir cada linha da tabela de animações em 1728px:

- [ ] Banner com parallax suave ao rolar (não passa de 900px de rolagem).
- [ ] Busca cresce no foco; mascote flutua, segue o cursor (±10°), fica feliz/triste.
- [ ] Balão "pula" a cada frase nova (inclusive frases seguidas).
- [ ] Pílulas: hover, clique e estado ativo.
- [ ] Cards entram em cascata (110ms × índice); inclinação 3D; sombra; zoom + desfoque;
      véu azul; texto em cascata 50/120/190ms; selo com quique.
- [ ] Cursor com atraso suave; aparece/some com escala.
- [ ] Modal: fade do fundo, capa expandindo por clip-path, texto subindo (350ms / 500ms),
      hover do voltar e da seta do próximo; animações rodam de novo no "próximo".
- [ ] Footer: "voltar ao topo" com seta balançando; seta ↗ no hover dos links sociais.
- [ ] Mesma conferência rápida em `/en`.

## Gate final (pré-merge)

- [ ] `./scripts/check-quality-gates.sh 6` passa (build limpo, lint, tsc, paridade, sem `dangerouslySetInnerHTML`).
- [ ] `./scripts/check-quality-gates.sh 7` passa.
- [ ] `e2e.mjs` passa por inteiro.
- [ ] Gate visual manual 100% marcado.
- [ ] Revisão de código final sem achados críticos.
