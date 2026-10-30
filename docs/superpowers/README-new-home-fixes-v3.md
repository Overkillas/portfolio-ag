# README: Correções de Fidelidade v3 — Home "Pontossemno"

**Data:** 2026-10-21
**Branch:** `feature/new-home`
**Figma:** https://www.figma.com/design/gpvzpeRYWxlqqonbHdj88g/Pontossemno?node-id=751-1318&m=dev

Esta rodada corrige **4 pontos reais** apontados pelo usuário após a entrega da home v2, e **descarta 1 falso-positivo**. Toda a cadeia de documentos está abaixo — **nada foi implementado**, apenas documentado para outra IA executar.

---

## Índice de documentos

| Documento | Caminho | Papel |
|---|---|---|
| **Análise de gaps (rodada 2)** | `docs/superpowers/analysis/2026-10-21-gap-analysis-v2-vs-figma-round2.md` | Diagnóstico completo dos 5 pontos, com medições reais (Playwright + ImageMagick + Figma MCP). **Leia primeiro.** |
| **Auditoria de assets SVG** | `docs/superpowers/analysis/2026-10-21-svg-asset-audit.md` | Auditoria completa dos SVGs da home: confirma que todos são byte-idênticos ao Figma, que as sombras baked funcionam, e refina a spec (ellipse-3 tem o mesmo stop rosa da ellipse-2). |
| **Spec (binding authority)** | `docs/superpowers/specs/2026-10-21-new-home-fixes-v3.md` | O que deve ser feito, com valores exatos do Figma e tolerâncias. |
| **Plan 1** | `docs/superpowers/plans/2026-10-21-new-home-fix-plan-1-elipses-cracha.md` | Elipse cyan de contato (gradiente + grão) + crachá (alinhamento texto/régua + Ellipse 378 real). |
| **Plan 2** | `docs/superpowers/plans/2026-10-21-new-home-fix-plan-2-footer.md` | Footer "visite também" — line-height 1 → 1.383. |
| **Plan 3** | `docs/superpowers/plans/2026-10-21-new-home-fix-plan-3-philosophy-density.md` | Filosofia — word-spacing 0.08em nos 3 parágrafos. |
| **Quality gates** | `docs/superpowers/quality-gates/2026-10-21-new-home-fixes-quality-gates.md` | Checklist visual obrigatório + medições automatizadas + gates `check-quality-gates.sh 3 4 5 6`. |

---

## Resumo dos 5 pontos apontados

| # | Ponto do usuário | Veredito | Documento |
|---|---|---|---|
| 1 | Bolas coloridas diferentes em cor/intensidade | ⚠️ **Parcial** — assets são byte-idênticos aos do Figma; a diferença é rasterização do grão (feTurbulence) no Chrome. Correção: ajustar gradiente + baseFrequency só da **elipse-2.svg** (contato), a mais discrepante. | Spec §1, Plan 1 Task 1 |
| 2 | SVGs já têm sombra, não precisa implementar (bug visual?) | ❌ **Falso-positivo** — não há sombra CSS no código; as sombras já estão baked nos SVGs corretos. **Não fazer nada** (e proibido adicionar). | Spec §5, Análise §2 |
| 3 | Desalinhamento do texto sobre a SVG da tag (crachá) | 🔴 **Confirmado** — texto gira 15.55° vs réguas 14.8° + primeira linha ~7px abaixo da pista. Correção: igualar ângulo a 14.8° e ajustar top −7px. Bônus: Ellipse 378 vira asset real (blob com sombra). | Spec §2, Plan 1 Tasks 2-3 |
| 4 | "visite tbm" do footer mais cortado | 🔴 **Confirmado** — line-height 1 (caixa 120px) vs Figma line-height auto (caixa 166px). Correção: `lineHeight: 1.383`. | Spec §3, Plan 2 |
| 5 | Texto de filosofia incompleto | ❌ **Falso-positivo no texto** (está 100% idêntico) / ⚠️ **Confirmado na densidade** — Figma usa word-spacing maior. Correção: `wordSpacing: 0.08em` nos 3 parágrafos. | Spec §4, Plan 3 |

---

## Ordem de execução recomendada

1. **Ler** a análise (`analysis/2026-10-21-gap-analysis-v2-vs-figma-round2.md`) — é a base de tudo.
2. **Ler** a spec (`specs/2026-10-21-new-home-fixes-v3.md`) — binding authority.
3. **Executar Plan 1** (elipses + crachá) → verificar → commitar.
4. **Executar Plan 2** (footer) → verificar → commitar.
5. **Executar Plan 3** (filosofia) → verificar → commitar.
6. **Rodar quality gates finais** (`quality-gates/2026-10-21-new-home-fixes-quality-gates.md`): build, lint, tsc, gates 3 4 5 6, checklist visual 100%, medições automatizadas.
7. **Revisão final de branch** (superpowers: `review-package` + `code-reviewer`).

Os 3 plans são **independentes entre si** (tocam arquivos diferentes) — podem ser executados em paralelo por 3 agentes, desde que cada um rode `pnpm build` próprio e os commits sejam feitos em sequência na branch.

---

## Regras globais (AGENTS.md + spec)

- **Figma é a autoridade** — valores exatos, não aproximações.
- **i18n:**nenhuma string nova nesta rodada (não há texto novo). Se surgir, vai para os dois dicionários na mesma mudança.
- **ContactForm.tsx intocável.**
- **Sem sombras CSS** em SVGs da home (proibido — já baked nos assets).
- **Outras páginas não quebram** (Header/Footer antigos via router pattern).
- Commits em inglês, final com `Co-Authored-By: Claude Code <noreply@anthropic.com>`.

---

## Evidências visuais (screenshots salvos)

- Figma full 1728: `/tmp/pn-visual/fig-full-1728.png`
- Figma crachá isolado: `/tmp/pn-visual/fig-cracha.png` + região com réguas: `/tmp/pn-visual/fig-cracha-regiao.png`
- Figma footer: `/tmp/pn-visual/fig-footer.png` + texto isolado: `/tmp/pn-visual/fig-visite-tbm.png`
- Figma texto filosofia (body2): `/tmp/pn-visual/fig-texto-filosofia.png`
- Figma elipses isoladas: `/tmp/pn-visual/fig-elipse-*.png`
- SVGs oficiais do Figma (para diff): `/tmp/pn-visual/fig-e26{0,1,2,3,4}.svg`
- Impl baseline (pré-correção): `/tmp/pn-visual/impl-final.png` + crops `impl-final-*.png`

> **Nota:** `/tmp` é volátil. Se os screenshots forem necessários para a próxima sessão, movê-los para `docs/superpowers/evidence/2026-10-21/` dentro do repo (gitignored ou não, decidir na hora).
