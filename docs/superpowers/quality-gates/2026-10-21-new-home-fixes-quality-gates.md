# Quality Gates: Correções de Fidelidade v3 — Home "Pontossemno"

**Feature:** 4 correções de fidelidade Figma apontadas pelo usuário (elipses, crachá, footer, densidade filosofia)
**Spec:** `docs/superpowers/specs/2026-10-21-new-home-fixes-v3.md`
**Análise de origem:** `docs/superpowers/analysis/2026-10-21-gap-analysis-v2-vs-figma-round2.md`
**Plans:** `docs/superpowers/plans/2026-10-21-new-home-fix-plan-{1..3}-*.md`
**Branch:** `feature/new-home`
**Data:** 2026-10-21

---

## Quick Start

```bash
# Gates automatizados (rodar após CADA plan e no final):
./scripts/check-quality-gates.sh 3    # Componentes
./scripts/check-quality-gates.sh 4    # Conteúdo/páginas
./scripts/check-quality-gates.sh 5    # Runtime
./scripts/check-quality-gates.sh 6    # Pre-merge (apenas no final, após os 3 plans)

# Build/lint/tsc (obrigatórios antes de cada commit):
pnpm build && pnpm lint && pnpm exec tsc --noEmit

# Verificação visual manual OBRIGATÓRIA (não automatizada — ver §Gate Visual)
# 1. Figma: https://www.figma.com/design/gpvzpeRYWxlqqonbHdj88g/Pontossemno?node-id=751-1318&m=dev
# 2. http://localhost:3000/pt-BR em 1728px
# 3. Comparar seção por seção (checklist abaixo)
```

**Exit codes:** `0` = PASS, `1` = FAIL

---

## Gate de Verificação Visual (OBRIGATÓRIO — não automatizado)

Este gate é **manual e obrigatório**. Build/lint/tsc não detectam os problemas visuais que esta rodada corrige.

### Como executar

1. Abrir o Figma (node 751:1318, `m=dev`) em uma aba.
2. Abrir http://localhost:3000/pt-BR em 1728px de largura em outra aba (usar DevTools device toolbar para travar 1728px).
3. Alternar entre as abas comparando seção por seção, **na ordem do checklist**.
4. Marcar cada item. **100% obrigatório antes de considerar completo.**
5. Repetir para `/en` (versão em inglês) — o dizer do crachá e o footer traduzidos.

### Checklist Visual — Obrigatório 100%

#### 1. Elipses decorativas (cor e intensidade)

- [ ] **Elipse cyan de contato** (direita da seção contato, node 758:110): intensidad visual igual ao Figma — **não** mais fraca, centro não "sujo" de rosa.
- [ ] **Elipse cyan pequena** (esquerda, entre philosophy e peeking, node 758:298): 2ª parada do gradiente **idêntica ao export Figma**: `#FFB5F6` stop-opacity 0 — estado ORIGINAL do arquivo, restabelecido por novo ruling (2026-10-21) que **reverte** a decisão anterior (que pedia `#7FF2F2`). Visual esperado **na impl**: véu rosa/lavanda externa com núcleo cyan, igual ao render Figma fresco (ver nota na tabela de cores).
- [ ] **Elipse cyan grande** (atrás da filosofia, node 758:112): **inalterada** visualmente (regression check).
- [ ] **Elipse rosa do topo** (direita do hero, node 758:297): **inalterada** visualmente (regression check).
- [ ] **Elipse rosa do contato** (esquerda do contato, node 758:111): **inalterada** visualmente (regression check).
- [ ] Nenhuma elipse tem sombra CSS adicionada (inspecionar elemento: `filter: none`, `box-shadow: none`).

#### 2. Crachá (tag) — texto sobre as réguas

- [ ] **Texto typewriter** ("acredito que o design é" / "i believe that design is"): 3 linhas, **alinhadas às réguas** — a primeira linha ("acredito") fica ~9px abaixo da régua de cima da pista, **não** escorregando para cima nem para fora da pista.
- [ ] **Ângulo do texto = ângulo das réguas** (14.8°) — inspecionar: o texto accompagne a inclinação das linhas.
- [ ] **Ellipse 378** (blob azul-gelo no topo do crachá): é um **blob orgânico com sombra suave** (asset real do Figma) — **não** um círculo perfeito chapado sem sombra.
- [ ] **Sem sombra CSS** no exclude, union, buraco, linhas, texto (inspecionar cada img: `filter: none`).
- [ ] **Sombra baked** do exclude/union continua visível (não regrediu): sombra suave embaixo-direita do crachá.

#### 3. Footer — "visite também"

- [ ] Texto **não cortado** no topo: ascenders de V, T, M, B visíveis acima da banda gradient.
- [ ] Caixa do texto com **166px de altura** (inspecionar o h2: `line-height: 1.383` → caixa ~166px).
- [ ] Texto começa em x=1 e transborda 45px acima da banda (topo do texto acima do início do gradiente).
- [ ] Largura do texto ~1018px (±20px por variação de fonte web — aceitável).
- [ ] Em `/en`: mesmo comportamento (texto traduzido, mesma caixa).

#### 4. Filosofia — densidade do texto

- [ ] **Lead** ("Para mim o design é pesquisa, ilustração e perspectiva."): 2 linhas, espaçamento entre palavras igual ao Figma (texto "cheio", não comprimido).
- [ ] **Body1** ("Acredito que o design é a manipulação..."): 3 linhas, mesma densidade.
- [ ] **Body2** ("Nesse contexto, encaro o 3D..."): 4 linhas, mesma densidade.
- [ ] **Nenhum texto mudou** (o conteúdo é idêntico ao Figma — comparar com `/tmp/pn-visual/fig-texto-filosofia.png`).
- [ ] **Número de linhas não mudou** (2 / 3 / 4) — se mudou, o word-spacing está errado.
- [ ] Título "Filosofia" **inalterado** (sem word-spacing, mesma posição).

#### 5. Regressões gerais (rápido)

- [ ] Header da home (102px, "sobre" + "projetos", LanguageSwitcher) — inalterado.
- [ ] Hero band (gradiente, título gigante) — inalterado.
- [ ] Saudação + ilustração — inalterado.
- [ ] Personagem espiando (peeking) — inalterado.
- [ ] Galeria de estudos — inalterada.
- [ ] Contato (título + ContactForm intocado) — inalterado.
- [ ] Outras páginas (`/pt-BR/contato`, `/pt-BR/grafico`, etc.): Header/Footer antigos funcionando, sem regressões.
- [ ] Mobile 375px: sem overflow horizontal (`scrollWidth === 375`).

---

## Verificação Automatizada por Métrica (Playwright — obrigatória)

Além do visual manual, rodar medições automatizadas. Valores-alvos (tolerâncias da spec):

```bash
# Instalar Playwright se /tmp/pwtest foi limpo (versão 1.64.1, chromium-1234 cacheado):
#   mkdir -p /tmp/pwtest && cd /tmp/pwtest && npm init -y && npm i playwright@1.64.1
# Chromium: ~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome
```

### Tabela de âncoras (viewport 1728px, /pt-BR)

| Âncora | x | y | w | h | Tol. |
|---|---|---|---|---|---|
| Elipse 758:110 (contato) | 1131 | 3486 | 454.57 | 454.57 | ±2px |
| Elipse 758:298 (pequena) | 27 | 1125 | 454.57 | 454.57 | ±2px |
| Elipse 758:112 (grande) | 581 | 1608 | 879 | 879 | ±2px |
| Elipse 758:297 (rosa topo) | 1394 | 436 | 695 | 695 | ±2px |
| Elipse 758:111 (rosa contato) | 74 | 3669 | 695 | 695 | ±2px |
| Régua 1 do crachá | 1247.90 | 1481.43 | 169.00 | 44.65 | ±2px |
| Régua 2 | 1237.09 | 1522.21 | 169.00 | 44.65 | ±2px |
| Régua 3 | 1226.28 | 1562.98 | 169.00 | 44.65 | ±2px |
| Régua 4 | 1215.47 | 1603.76 | 169.00 | 44.65 | ±2px |
| Texto typewriter (p) | 1257.70 | 1481.30 | 186.96 | 161.34 | ±2px |
| Topo 1ª linha texto vs topo régua 1 | ~+9px | — | — | — | ±3px |

> **Nota knob M3 (crachá):** a 1ª linha do texto typewriter mediu **+6,2px**
> abaixo do topo da régua-1 (alvo 9±3 — no limite da tolerância). Se um
> render futuro divergir, o knob de ajuste é o `top` do wrapper do texto
> (hoje `237.3px`) em `components/home/PhilosophySection.tsx`.
| Ellipse 378 (img) — centro rel. ao .cracha | ~193.4 | ~126.9 | 123.70 | 115.26 | ±2px |
| Texto footer h2 (caixa) | 1 | banda−45 | ~1018 | **166** | ±2px |
| Filosofia lead | 222 | 1481 | 705 | 76 | ±2px |
| Filosofia body1 | 222 | 1590 | 702 | 93 | ±2px |
| Filosofia body2 | 222 | 1704 | 702 | 124 | ±2px |

### Métricas de cor (ImageMagick, crops idênticos Figma × impl)

| Métrica | Alvo (Figma) | Tol. |
|---|---|---|
| Elipse 758:110 alpha médio (crop 400×400+1080+3450, creme mascarado fuzz 3%) | 139 | ±10 |
| Elipse 758:110 pixel central | #CFD5E9 | ±8/canal |
| Elipse 758:298 alpha médio (crop 400×400+20+1080) | **102,6 ±5** (alvo final: render Figma fresco 1:1 1728×4614, medido 2026-10-21). Estado final da impl: parada rosa original, byte-idêntica ao export Figma. Histórico apenas (não é alvo): 103 ±5 (pré-ruling, impl 100,1); 117,9 (pós-ruling com a parada `#7FF2F2`, impl medida antes da reversão) | 102,6 ±5 (Figma fresco) |
| Elipse 758:112 alpha médio (crop região própria) | inalterado vs baseline | ±5 |
| Elipse 758:297 alpha médio (crop 400×400+1290+640) | 117 | ±5 (inalterada) |
| Elipse 758:111 alpha médio (crop 400×400+20+3620) | 97 | ±5 (inalterada) |
| Filosofia body1 linha 1 justificada — largura | ~702 (cheia) | ±8px |
| Filosofia: nº de linhas lead/body1/body2 | 2 / 3 / 4 | exato |

> **Nota elipse 758:298 (estado final, 2026-10-21):** a 2ª parada do
> gradiente de `public/images/home/ellipse-3.svg` foi trocada de
> `#FFB5F6` → `#7FF2F2` (stop-opacity 0) durante o implement — decisão do
> usuário que **revia a spec v3 §1.2 "não tocar"** (auditoria SVG achou a
> mesma segunda parada rosa na irmã 758:110). Essa decisão foi depois
> **falsificada por medição** e **revertida por novo ruling**: o render
> Figma fresco 1:1 (1728×4614) do próprio 758:298 mede alpha **102,628** —
> ou seja, o Figma **mantém** o véu rosa externa — e o estado pré-ruling
> (impl 100,1) estava dentro de ±5, enquanto o estado pós-ruling mediu
> **117,9** (+15,3 além do Figma, cyan limpo sem véu). Conclusão: as duas
> irmãs renderam diferente no Figma (758:110 = 133,68 vs 758:298 = 102,6)
> **apesar da mesma parada rosa**, então a parada rosa não era a causa da
> divergência de 758:298. Estado final: parada rosa original, byte-idêntica
> ao export Figma; alvo **102,6 ±5**. A irmã 758:110 (`#7FF2F2`) **permanece
>** exata (impl 133,5 vs figma 133,68). Não reverter 758:110 sem novo ruling.

---

## Gate Automatizado (scripts/check-quality-gates.sh)

| Gate | Comando | Quando | O que valida |
|---|---|---|---|
| 3 — Componentes | `./scripts/check-quality-gates.sh 3` | após cada plan | Estrutura de componentes, i18n hardcoded-string grep, convenções |
| 4 — Conteúdo | `./scripts/check-quality-gates.sh 4` | após cada plan | Páginas, dicionários parity pt-BR ↔ en |
| 5 — Runtime | `./scripts/check-quality-gates.sh 5` | após cada plan | Build, rotas, smoke test |
| 6 — Pre-merge | `./scripts/check-quality-gates.sh 6` | **apenas no final** (após os 3 plans) | Tudo + revisão final |

**Build/lint/tsc obrigatórios antes de CADA commit:**

```bash
pnpm build && pnpm lint && pnpm exec tsc --noEmit
```

---

## Definition of Done (esta rodada)

- [ ] 3 plans executados (1 commit por task, mensagens em inglês, `Co-Authored-By: Claude Code <noreply@anthropic.com>` no final).
- [ ] `pnpm build` / `pnpm lint` / `pnpm exec tsc --noEmit` limpos.
- [ ] `./scripts/check-quality-gates.sh 3 4 5 6` — todos PASS.
- [ ] Checklist visual 100% (5 seções acima).
- [ ] Medições automatizadas dentro das tolerâncias.
- [ ] **Falso-positivos confirmados como não-bug** (para o relatório final): sombras CSS em SVGs (não existem, não devem existir) e "texto incompleto" (texto está completo — o que mudou foi densidade/word-spacing).
- [ ] Revisão final de branch (review-package + code-reviewer) após os 3 plans.

---

## Referências

- Spec: `docs/superpowers/specs/2026-10-21-new-home-fixes-v3.md`
- Análise: `docs/superpowers/analysis/2026-10-21-gap-analysis-v2-vs-figma-round2.md`
- Quality gates v2 (original): `docs/superpowers/quality-gates/2026-10-20-new-home-quality-gates.md`
- Screenshots de referência (Figma): `/tmp/pn-visual/fig-full-1728.png`, `/tmp/pn-visual/fig-cracha.png`, `/tmp/pn-visual/fig-footer.png`, `/tmp/pn-visual/fig-texto-filosofia.png`, `/tmp/pn-visual/fig-visite-tbm.png`, `/tmp/pn-visual/fig-elipse-*.png`
- Screenshots de referência (impl, baseline pré-correção): `/tmp/pn-visual/impl-final.png`
