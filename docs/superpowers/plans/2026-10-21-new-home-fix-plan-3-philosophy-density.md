# Plan 3: Correção da densidade do texto da filosofia (word-spacing)

**Data:** 2026-10-21
**Spec (binding authority):** `docs/superpowers/specs/2026-10-21-new-home-fixes-v3.md` (§4)
**Branch:** `feature/new-home`
**Dependências:** nenhuma (independente dos plans 1 e 2)

---

## Contexto

A análise rodada 2 **descartou** o ponto "texto de filosofia está incompleto" como falta de texto (o texto está 100% idêntico ao Figma, caractere por caractere). O que o usuário percebe é **densidade**: no Figma o texto justificado tem **espaço maior entre palavras** (word-spacing positivo), enquanto na impl o `text-justify` comprime o espaço. O texto do Figma parece "mais cheio".

**Arquivo único:** `components/home/PhilosophySection.tsx` (parágrafos lead, body1, body2 — NÃO o título "Filosofia").

---

## Global Constraints

- **Valor exato:** `wordSpacing: "0.08em"` (inline style, mesmo padrão das correções de line-height já no componente). **Calibrar** medindo a largura de uma linha justificada (ver Task 2) — se fugir da tolerância, ajustar para 0.06em ou 0.1em e documentar no commit.
- **Mudança mínima:** só adicionar `wordSpacing` nos 3 parágrafos de texto corrido. Não mudar texto, `text-justify`, `leading-[1.19]`, `max-w`, cor, `font-bold` nos spans, ou o título.
- **i18n:** nenhuma string muda (o texto já existe nos dois dicionários e está completo).
- **Outras páginas não quebram:** `PhilosophySection` só é usado na home.
- Commit em inglês, final com `Co-Authored-By: Claude Code <noreply@anthropic.com>`.

---

## Task 1: Adicionar word-spacing nos 3 parágrafos da filosofia

**Arquivo:** `components/home/PhilosophySection.tsx`

**Baseline Figma (metadados):**

| Parágrafo | Node | x | y | w | h | linhas Figma |
|---|---|---|---|---|---|---|
| Lead | 751:1435 | 222 | 1481 | 705 | 76 | 2 ("Para mim o design é pesquisa, ilustração e / perspectiva.") |
| Body1 | 751:1436 | 222 | 1590 | 702 | 93 | 3 ("Acredito que o design é a manipulação intencional da / experiência humana: uma ferramenta capaz de impactar / hábitos e devolver humanidade ao nosso cotidiano.") |
| Body2 | 751:1437 | 222 | 1704 | 702 | 124 | 4 ("Nesse contexto, encaro o 3D, o design de interfaces e a / pesquisa como extensões de um mesmo propósito: construir / experiências que sejam verdadeiramente prestativas, / memoráveis e sensíveis.") |

**Mudança exata (spec §4.2):** adicionar `wordSpacing: "0.08em"` no `style` inline de cada um dos 3 `<p>` (lead, body1, body2). Os parágrafos **já têm** `text-justify` e `leading-[1.19]` — manter.

Exemplo (body1):

```tsx
<p className="max-w-[702px] text-[1.625rem] leading-[1.19] text-justify text-[color:var(--color-blue)] mb-[21px]"
   style={{ wordSpacing: "0.08em" }}>
```

**NÃO adicionar** no título `h2` "Filosofia".

---

## Task 2: Calibrar o valor medindo a largura da linha

**Obrigatório** — o valor 0.08em é o ponto de partida; calibrar com medição real:

```bash
pnpm build && pnpm start &  # :3000
# Playwright @1728, para cada um dos 3 parágrafos:
#   - medir a largura ocupada pela PRIMEIRA linha justificada completa
#     (Range.getClientRects() no conteúdo até a quebra — ou medir o <p> e
#      dividir pela primeira linha via client rects)
#   - Alvo: a linha cheia deve ocupar ~702px (body) / ~705px (lead) — ou seja,
#     "cheia" como no Figma, não encolhida.
# Se a linha medir < 695px → word-spacing muito pequeno → subir para 0.1em
# Se a linha medir > 710px → word-spacing muito grande → descer para 0.06em
# Repetir até a linha ficar dentro de 695-710px.
```

**Também medir:** número de linhas de cada parágrafo (deve continuar 2 / 3 / 4 — se mudar, o word-spacing está grande demais e está quebrando linha antes; reduzir).

---

## Task 3: Verificação + gates

**Obrigatório:**

1. `pnpm build` limpo.
2. `pnpm lint` limpo.
3. `pnpm exec tsc --noEmit` limpo.
4. `./scripts/check-quality-gates.sh 3 4 5` — PASS.
5. **Medição Playwright @1728** (spec §4.3):
   - Lead: 2 linhas, largura ~705px, altura ~76px.
   - Body1: 3 linhas, largura ~702px, altura ~93px.
   - Body2: 4 linhas, largura ~702px, altura ~124px.
   - `textContent` dos 3 parágrafos: **idêntico** ao Figma (não mudou texto).
   - Posições (x=222, y=1481/1590/1704): ±2px (não devem mudar — word-spacing não altera posição vertical).
6. **Visual:** comparar `/tmp/pn-visual/fig-texto-filosofia.png` (body2 do Figma) com crop da impl — o espaçamento entre palavras deve parecer igual.
7. **Idiomas:** `/en` — os parágrafos em inglês também ficam com word-spacing (é estilo, não texto).
8. **Regressão:** o crachá à direita não é afetado (word-spacing só nos `<p>` da coluna de texto).

Commit: `fix(home): add word-spacing 0.08em to philosophy paragraphs to match figma density`

---

## Report

Retornar: STATUS, o commit SHA, o valor final calibrado de word-spacing (se mudou de 0.08em), as larguras medidas das linhas, e a confirmação de que o número de linhas não mudou (2/3/4).

---

## Referências

- Spec: `docs/superpowers/specs/2026-10-21-new-home-fixes-v3.md` (§4)
- Análise: `docs/superpowers/analysis/2026-10-21-gap-analysis-v2-vs-figma-round2.md` (§5)
- Componente atual: `components/home/PhilosophySection.tsx` (ler antes)
- Screenshot Figma do body2: `/tmp/pn-visual/fig-texto-filosofia.png`
