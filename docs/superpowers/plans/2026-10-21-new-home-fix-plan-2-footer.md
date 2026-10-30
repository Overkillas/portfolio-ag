# Plan 2: Correção do footer — "visite também" cortado (line-height)

**Data:** 2026-10-21
**Spec (binding authority):** `docs/superpowers/specs/2026-10-21-new-home-fixes-v3.md` (§3)
**Branch:** `feature/new-home`
**Dependências:** nenhuma (independente dos plans 1 e 3)

---

## Contexto

A análise rodada 2 confirmou: o texto "visite também" do footer da home aparece **mais cortado** na implementação porque o `h2` usa `lineHeight: 1` (caixa de 119.9px), enquanto no Figma o texto tem line-height automático do AM Novecento (caixa de **166px**, ≈ 1.383 × 120px). A caixa menor + o transbordo de −45px acima da banda faz o topo dos glifos (ascenders de V, T, M, B) parecer cortado.

**Arquivo único:** `components/layout/HomeFooter.tsx` (linhas 27-37, o `h2` do `dict.footer.visitAlso`).

---

## Global Constraints

- **Valores exatos do Figma** — line-height 1.383 (o mesmo já aprovado no título "Filosofia" em `PhilosophySection.tsx`).
- **Mudança mínima:** UMA propriedade (`lineHeight`). Não mudar `fontSize`, `left`, `top`, cor, texto, ou qualquer outra coisa no footer.
- **i18n:** nenhuma string muda (o texto já vem de `dict.footer.visitAlso` nos dois dicionários).
- **Outras páginas não quebram:** `HomeFooter` só é usado na home (outras páginas usam o `Footer` antigo via `FooterRouter`). Mesmo assim, verificar `/pt-BR/contato` continua ok.
- Commit em inglês, final com `Co-Authored-By: Claude Code <noreply@anthropic.com>`.

---

## Task 1: Corrigir line-height do h2 "visite também"

**Arquivo:** `components/layout/HomeFooter.tsx`

**Mudança exata (spec §3.2):**

No `h2` (linhas 27-37), trocar:

```tsx
style={{
  fontSize: "clamp(3rem, 6.94vw, 7.5rem)", // 120px @1728
  left: "1px",
  top: "-45px", // transborda acima!
  lineHeight: 1,
}}
```

por:

```tsx
style={{
  fontSize: "clamp(3rem, 6.94vw, 7.5rem)", // 120px @1728
  left: "1px",
  top: "-45px", // transborda acima!
  lineHeight: 1.383, // caixa 166px = Figma (AM Novecento line-height auto)
}}
```

**Atualizar o doc comment** do componente (linhas 9-10) que diz "x=1, y=-45 relativos à banda" — adicionar nota: "caixa de 166px (lineHeight 1.383 — mesmo padrão do título Filosofia)".

**NÃO mudar mais nada no arquivo.**

---

## Task 2: Verificação + gates

**Obrigatório:**

1. `pnpm build` limpo.
2. `pnpm lint` limpo.
3. `pnpm exec tsc --noEmit` limpo.
4. `./scripts/check-quality-gates.sh 3 4 5` — PASS.
5. **Medição Playwright @1728** (spec §3.3):
   - Altura da caixa do `h2` (getBoundingClientRect): **166px ±2px**.
   - Topo da caixa relativo à banda (footerBand.y): **-45px** (exato).
   - Topo do glifo "V" (via `Range.getClientRects()` no primeiro caractere): deve estar **acima** da banda (y < footerBand.y) e **não cortado** — comparar com `/tmp/pn-visual/fig-visite-tbm.png`.
   - Largura do texto: ~1018px (tolerância ±20px por variação de fonte web).
6. **Visual:** crop 1728×269+0+4498 da impl vs `/tmp/pn-visual/fig-footer.png` — o texto deve ocupar a mesma faixa vertical e não parecer "achatado".
7. **Idiomas:** `/pt-BR` ("visite também") e `/en` (verificar o texto em inglês — `dict.footer.visitAlso` em en.json) — ambos com a caixa de 166px.
8. **Regressão:** `/pt-BR/contato` continua com o Footer antigo (não quebrou).

Commit: `fix(footer): restore visite também line-height 1.383 to match figma text box`

---

## Report

Retornar: STATUS, o commit SHA, a altura medida da caixa do h2, e a confirmação visual (não cortado).

---

## Referências

- Spec: `docs/superpowers/specs/2026-10-21-new-home-fixes-v3.md` (§3)
- Análise: `docs/superpowers/analysis/2026-10-21-gap-analysis-v2-vs-figma-round2.md` (§4)
- Componente atual: `components/layout/HomeFooter.tsx` (ler antes)
- Padrão de line-height 1.383 já aprovado: `components/home/PhilosophySection.tsx` (título "Filosofia")
- Screenshot Figma do footer: `/tmp/pn-visual/fig-footer.png`, crop do texto: `/tmp/pn-visual/fig-visite-tbm.png`
