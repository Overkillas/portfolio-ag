# Nova Home "Pontossemno" — Documentação v2 (Pós-Análise de Gaps)

**Data:** 2026-10-20
**Branch:** `feature/new-home`
**Status:** Documentação completa — pronta para implementação por outro modelo

---

## 📋 Índice de Documentos

### 1. Análise de Gaps (LEIA PRIMEIRO)
**Arquivo:** `analysis/2026-10-20-gap-analysis-implementation-vs-figma.md`

Análise detalhada comparando a implementação atual (v1, commits `891305c` a `3c47fe4`) com o Figma. Contém:
- 9 gaps críticos identificados
- 2 gaps altos
- 8 elementos ausentes
- 4+ elementos do design antigo ainda presentes
- Métricas de fidelidade visual (~38% atual, meta 100%)
- Lições aprendidas

**Leia este documento para entender O QUE está errado e POR QUÊ.**

---

### 2. Especificação v2 (AUTORIDADE)
**Arquivo:** `specs/2026-10-20-new-home-design-v2.md`

Especificação completa e detalhada da nova home page, reescrita após a análise de gaps. Contém:
- Estrutura completa da página (top → bottom) com coordenadas Y do Figma
- Especificação detalhada por componente (Header, Hero, Greeting, Philosophy, Gallery, Contact, Footer)
- Todas as coordenadas exatas do Figma (canvas 1728×4614)
- Tokens de design (cores, gradientes com ângulos exatos)
- Tabela de conversão Figma px → CSS (vw, clamp)
- Chaves de dicionário completas (pt-BR + en)
- Checklist de verificação visual
- Seção 12: Tabela completa dos 12 gaps da v1 → v2

**Este é o documento de referência obrigatório.** O implementador deve seguir esta spec seção por seção.

---

### 3. Plans de Implementação (6 plans, executar em ordem)
**Diretório:** `plans/2026-10-20-new-home-plan-{1..6}-*.md`

| Plan | Arquivo | Escopo | Dependências |
|------|---------|--------|--------------|
| **Plan 1** | `2026-10-20-new-home-plan-1-header-hero.md` | Header (reescrever) + Hero (ajustar) | — |
| **Plan 2** | `2026-10-20-new-home-plan-2-greeting.md` | Greeting (reescrever) + `:d` gigante + elipse rosa | Plan 1 |
| **Plan 3** | `2026-10-20-new-home-plan-3-philosophy.md` | Philosophy (reescrever) + crachá completo (6 partes) + elipses | Plans 1-2 |
| **Plan 4** | `2026-10-20-new-home-plan-4-gallery-peeking.md` | Gallery (2 camadas) + Peeking (posição 52%) | Plans 1-3 |
| **Plan 5** | `2026-10-20-new-home-plan-5-contact.md` | Contact (título 3 linhas) + elipses | Plans 1-4 |
| **Plan 6** | `2026-10-20-new-home-plan-6-footer-final.md` | Footer ("visite também") + verificação final completa | Plans 1-5 |

Cada plan contém:
- Goal, Architecture, Tech Stack
- Global Constraints (i18n, eslint, verification)
- Review Focus (o que verificar)
- Tasks detalhadas com steps numerados
- Código de exemplo onde aplicável
- Comandos de verificação (build, lint, tsc)
- Commit messages sugeridos
- Checklist de verificação visual

**Execute os plans NA ORDEM (1 → 6).** Cada plan depende dos anteriores.

---

### 4. Quality Gates
**Arquivo:** `quality-gates/2026-10-20-new-home-quality-gates.md`

Quality gates específicos para esta feature, incluindo:
- **Gate de Verificação Visual (OBRIGATÓRIO):** Checklist manual de 100+ itens comparando com o Figma
- **Gate 3:** Componentes (build, lint, tsc, grep checks)
- **Gate 4:** Conteúdo (dicionários, assets, rotas)
- **Gate 5:** Runtime (dev server, console, network, formulário)
- **Gate 6:** Pre-Merge (build produção, todas as rotas, git limpo)
- Matriz de verificação rápida
- Troubleshooting (problemas comuns e soluções)
- Registro de execução (formulário para preencher)
- Definition of Done (checklist final)

**A verificação visual manual é OBRIGATÓRIA.** Build/lint/tsc não detectam problemas visuais.

---

## 🚀 Como Implementar (para o outro modelo)

### Passo 1: Ler a documentação (nesta ordem)
1. `analysis/2026-10-20-gap-analysis-implementation-vs-figma.md` — entender os problemas
2. `specs/2026-10-20-new-home-design-v2.md` — entender a solução completa
3. `quality-gates/2026-10-20-new-home-quality-gates.md` — entender como verificar

### Passo 2: Executar os plans (na ordem)
1. Abrir `plans/2026-10-20-new-home-plan-1-header-hero.md`
2. Seguir cada task, step por step
3. Verificar com os comandos indicados (build, lint, tsc)
4. Commitar ao final de cada task
5. Passar para o próximo plan

### Passo 3: Verificação visual (OBRIGATÓRIA)
Após cada plan (ou pelo menos após o Plan 6):
1. Abrir o Figma: https://www.figma.com/design/gpvzpeRYWxlqqonbHdj88g/Pontossemno?node-id=751-1318
2. Abrir http://localhost:3000/pt-BR em 1728px de largura
3. Usar o checklist em `quality-gates/2026-10-20-new-home-quality-gates.md` (seção "Gate de Verificação Visual")
4. Marcar cada item, seção por seção

### Passo 4: Quality gates finais
```bash
pnpm build
pnpm lint
pnpm exec tsc --noEmit
./scripts/check-quality-gates.sh 3
./scripts/check-quality-gates.sh 4
./scripts/check-quality-gates.sh 5
./scripts/check-quality-gates.sh 6
```

---

## ⚠️ Regras Críticas (AGENTS.md)

Estas regras são **obrigatórias** e não negociáveis:

1. **i18n:** Toda string user-visible vai para `dictionaries/pt-BR.json` E `dictionaries/en.json` na mesma mudança
2. **Sem texto hardcoded:** Zero exceções
3. **Type safety:** `satisfies Record<Locale, Dictionary>` quebra o build se faltar chave em en
4. **Server Components:** recebem `dict` como prop
5. **Client Components:** usan `useTranslations()` hook
6. **Links:** sempre `/${locale}`-prefixados at render time
7. **Imagens:** `alt` do dicionário (conteúdo) ou `alt=""` + `aria-hidden` (decorativo)
8. **eslint:** `// eslint-disable-next-line @next/next/no-img-element` antes de cada `<img>`
9. **ContactForm:** NÃO MODIFICAR — reutilizar como está
10. **Outras páginas:** NÃO QUEBRAR — Header/Footer antigos continuam via Router

---

## 📊 O que mudou da v1 para v2

| Aspecto | v1 (implementação) | v2 (spec) |
|---------|-------------------|-----------|
| Header | 6 links + category tabs | 2 links (about/projects) + LanguageSwitcher |
| Hero altura | 17.5vw (290px max) | 14.58vw (252px @1728) |
| Hero gradiente | -70.88° | -62.1° |
| `:d` | 56px dentro da section | 338px absolute na página |
| Mão acenando | AUSENTE | presente (ola-mao.svg overlay) |
| Títulos | 40-64px | 120px (clamp 6.94vw) |
| Body text | 18-24px | 26px (1.625rem) Justificado |
| Crachá | 3 partes (clip, exclude, buraco) | 6 partes (+union, +4 linhas, +elipse) |
| Crachá rotação | 15° | 15.24° |
| Gallery rosa | Só coelhos (object-cover) | 2 camadas (coelhos fundo + cover visível) |
| Peeking posição | Centralizado, 500px | 52.2% from left, 676px |
| Peeking overlap | 80px | 21px |
| Contact título | 2 linhas (Vamos / trabalhar juntos?) | 3 linhas (vAMOS / TRABALHAR / JUNTOS?) |
| Footer | Sem "visite também" | "visite também" 120px transbordando acima |
| Elipses | Relativas à section | Absolutas no wrapper da página (coordenadas Figma) |
| Design antigo | Presente (category tabs, links extras) | ZERO (removido completamente) |

---

## 📁 Estrutura de Arquivos (esperada após implementação)

```
docs/superpowers/
├── README-new-home-v2.md                          ← ESTE ARQUIVO (índice)
├── analysis/
│   └── 2026-10-20-gap-analysis-implementation-vs-figma.md
├── specs/
│   ├── 2026-10-19-i18n-design.md                  (existente, não mexer)
│   ├── 2026-10-20-new-home-design.md              (v1, superseded)
│   └── 2026-10-20-new-home-design-v2.md           ← SPEC AUTORITATIVA
├── plans/
│   ├── 2026-10-19-i18n-implementation.md          (existente)
│   ├── 2026-10-20-new-home-implementation.md      (v1, superseded)
│   ├── 2026-10-20-new-home-plan-1-header-hero.md  ← EXECUTAR PRIMEIRO
│   ├── 2026-10-20-new-home-plan-2-greeting.md
│   ├── 2026-10-20-new-home-plan-3-philosophy.md
│   ├── 2026-10-20-new-home-plan-4-gallery-peeking.md
│   ├── 2026-10-20-new-home-plan-5-contact.md
│   └── 2026-10-20-new-home-plan-6-footer-final.md ← EXECUTAR POR ÚLTIMO
└── quality-gates/
    ├── 2026-10-19-i18n-quality-gates.md           (existente)
    └── 2026-10-20-new-home-quality-gates.md       ← QUALITY GATES DESTA FEATURE
```

---

## ✅ Definition of Done (resumo)

A feature está completa quando:

- [ ] Todos os 6 plans executados e commitados
- [ ] `pnpm build` passa (paridade i18n)
- [ ] `pnpm lint` passa (0 errors)
- [ ] `pnpm exec tsc --noEmit` passa
- [ ] Quality gates 3, 4, 5, 6 passam
- [ ] **Verificação visual manual 100%** (checklist completo no quality gates doc)
- [ ] Desktop PT (1728px) verificado
- [ ] Desktop EN (1728px) verificado
- [ ] Mobile (375px) verificado
- [ ] Zero elementos do design antigo
- [ ] ContactForm intacto
- [ ] Outras páginas funcionando
- [ ] Git status limpo

---

## 📞 Suporte

Se encontrar ambiguidades ou problemas durante a implementação:

1. **Consultar a Spec v2 primeiro** — ela é a autoridade
2. **Consultar a Análise de Gaps** — explica o porquê de cada decisão
3. **Consultar o Figma diretamente** — usar `get_metadata` para coordenadas exatas
4. **Consultar os Quality Gates** — para saber como verificar

**Boa implementação! 🎨**
