# Plan 5/6: Contact Section — Nova Home "Pontossemno"

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever a ContactSection com o título em **3 linhas** (vAMOS / TRABALHAR / JUNTOS?), subtítulo 24px, envelope overlay rotacionado, e elipses decorativas nas coordenadas do Figma. **Manter o ContactForm existente intacto** (nome, email, telefone, mensagem — usuário exigiu).

**Architecture:** Grid 2 colunas (ilustração esquerda, texto+form direito). Título usando 3 dictionary keys separadas (`contactTitleLine1/2/3`). Elipses absolute no wrapper da página (não dentro da section).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, i18n (pt-BR/en)

**Spec:** `docs/superpowers/specs/2026-10-20-new-home-design-v2.md` (seção 4.8)

**Depends on:** Plans 1-4

## Global Constraints

- **i18n obrigatório (AGENTS.md):** Toda string user-visible vai para `dictionaries/pt-BR.json` E `dictionaries/en.json`.
- **Sem texto hardcoded.**
- **NÃO MODIFICAR `ContactForm.tsx`** — reutilizar como está (Zod, EmailJS, nome/email/telefone/mensagem).
- **Server Components:** recebem `dict` como prop.
- **Imagens:** `alt` do dicionário para conteúdo, `alt=""` + `aria-hidden` para decorativas.
- **eslint:** `// eslint-disable-next-line @next/next/no-img-element` antes de cada `<img>`.
- **Verificação obrigatória antes de cada commit:** `pnpm build`, `pnpm lint`, `pnpm exec tsc --noEmit`
- **Branch:** `feature/new-home`
- **Commit attribution:** `Co-Authored-By: Claude Code <noreply@anthropic.com>`

## Review Focus

1. **Título em 3 linhas:** CRÍTICO — deve ser "vAMOS" (120px) / "TRABALHAR" (72px) / "JUNTOS?" (72px) como 3 spans separados. A v1 tinha apenas 2 linhas ("Vamos" / "trabalhar juntos?").
2. **ContactForm intacto:** O formulário deve continuar com nome, email, telefone, mensagem, validação Zod, envio via EmailJS. NÃO simplificar para o textarea único do Figma.
3. **Envelope overlay:** `contato-extra.svg` deve estar absolute sobre `contato.svg`, rotacionado 0.51°.
4. **Elipses:** 758:110 (455px, x=1131, y=3486) e 758:111 (695px, x=74, y=3669) — absolute no wrapper da página.
5. **Hierarchy:** Linha 1 (120px) é maior que linhas 2-3 (72px).

---

## Task 1: Adicionar novas chaves de dicionário para título de 3 linhas

**Files:**
- Modify: `dictionaries/pt-BR.json`
- Modify: `dictionaries/en.json`

**Interfaces:**
- Produces: `home.contactTitleLine1`, `home.contactTitleLine2`, `home.contactTitleLine3`

- [ ] **Step 1: Verificar chaves atuais**

```bash
cat dictionaries/pt-BR.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
home = d.get('home', {})
for k in ['contactTitle', 'contactTitleLine1', 'contactTitleLine2', 'contactTitleLine3']:
    v = home.get(k, 'NÃO EXISTE')
    print(f'home.{k} = {repr(v)}')
"
```

- [ ] **Step 2: Atualizar pt-BR.json**

Substituir as chaves antigas por 3 novas:

```json
{
  "home": {
    "contactTitleLine1": "vAMOS",
    "contactTitleLine2": "TRABALHAR",
    "contactTitleLine3": "JUNTOS?"
  }
}
```

**Remover** (se existirem): `contactTitle`, `contactTitleLine1` (valor antigo "Vamos"), `contactTitleLine2` (valor antigo "trabalhar juntos?").

> **Nota:** O Figma mostra "vAMOS" com "v" minúsculo e "AMOS" maiúsculo. Para pt-BR, manter exatamente como no Figma: "vAMOS" / "TRABALHAR" / "JUNTOS?".

- [ ] **Step 3: Atualizar en.json**

```json
{
  "home": {
    "contactTitleLine1": "LET'S",
    "contactTitleLine2": "WORK",
    "contactTitleLine3": "TOGETHER?"
  }
}
```

> **Nota para EN:** "LET'S WORK TOGETHER?" em 3 linhas. Se preferir manter o estilo do Figma (primeira letra diferente), usar "lET'S" / "WORK" / "TOGETHER?". Mas o importante é a estrutura de 3 linhas.

- [ ] **Step 4: Verificar build (paridade)**

```bash
pnpm build
```

Expected: Build passa (se falhar, falta chave em um dos dicionários).

- [ ] **Step 5: Commit**

```bash
git add dictionaries/pt-BR.json dictionaries/en.json
git commit -m "feat(i18n): split contact title into 3 lines (vAMOS/TRABALHAR/JUNTOS?)

Matches Figma 3-line heading: 120px line 1, 72px lines 2-3.
EN: LET'S / WORK / TOGETHER?

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 2: Reescrever ContactSection com título 3 linhas

**Files:**
- Rewrite: `components/home/ContactSection.tsx`

**Interfaces:**
- Consumes: `dict: Dictionary` (prop), `ContactForm` de `@/components/contact/ContactForm`
- Produces: `ContactSection` com ilustração + envelope overlay + título 3 linhas + subtítulo + ContactForm
- Assets: `/illustrations/contato.svg` (555×676), `/illustrations/contato-extra.svg` (208×229, rotate 0.51°)

- [ ] **Step 1: Ler o ContactForm atual (para referência de import)**

```bash
head -20 components/contact/ContactForm.tsx
```

- [ ] **Step 2: Reescrever ContactSection.tsx**

```tsx
// components/home/ContactSection.tsx
import type { Dictionary } from "@/i18n/dictionaries";
import { ContactForm } from "@/components/contact/ContactForm";

/**
 * Seção de contato — fiel ao Figma Pontossemno (node 751:1318):
 *
 * - Ilustração contato.svg: x=254, y=3437, 555×676 (esquerda)
 * - Envelope contato-extra.svg: x=312, y=3814, 208×229, rotate 0.51° (overlay)
 *   - Offset relativo ao contato.svg: x=312-254=58, y=3814-3437=377
 * - Título: x=891, y=3522 — 3 LINHAS:
 *   - Linha 1 "vAMOS": 120px AM Novecento uppercase #6F96CE
 *   - Linha 2 "TRABALHAR": 72px AM Novecento uppercase #6F96CE
 *   - Linha 3 "JUNTOS?": 72px AM Novecento uppercase #6F96CE
 * - Subtítulo: x=893, y=3908, w=517, Clother Regular 24px
 * - Formulário: ContactForm existente (nome/email/telefone/mensagem)
 *
 * As elipses decorativas (758:110 em x=1131 y=3486, 758:111 em x=74 y=3669)
 * são posicionadas no wrapper da página (page.tsx), NÃO aqui.
 */
export function ContactSection({ dict }: { dict: Dictionary }) {
  const home = dict.home;
  return (
    <section className="relative grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_1.2fr]">
      {/* Ilustração + envelope overlay */}
      <div className="relative mx-auto">
        {/* Ilustração principal: Ágatha com envelope */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/contato.svg"
          alt={home.contactIllustrationAlt}
          width={555}
          height={676}
          className="w-full max-w-[380px] md:max-w-[450px]"
        />
        {/* Envelope extra — overlay absolute, rotate 0.51° */}
        {/* Offset relativo ao contato.svg: left=58px, top=377px */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/contato-extra.svg"
          alt=""
          aria-hidden="true"
          width={208}
          height={229}
          className="absolute"
          style={{
            left: "58px",
            top: "377px",
            transform: "rotate(0.51deg)",
          }}
        />
      </div>

      {/* Texto + formulário */}
      <div>
        {/* Título em 3 LINHAS — Figma: vAMOS (120px) / TRABALHAR (72px) / JUNTOS? (72px) */}
        <h2 className="mb-6 font-display uppercase leading-none text-[color:var(--color-blue)]">
          {/* Linha 1: 120px no Figma = clamp(3rem, 6.94vw, 7.5rem) */}
          <span className="block text-[clamp(3rem,6.94vw,7.5rem)]">
            {home.contactTitleLine1}
          </span>
          {/* Linha 2: 72px no Figma = clamp(1.875rem, 4.17vw, 4.5rem) */}
          <span className="block text-[clamp(1.875rem,4.17vw,4.5rem)]">
            {home.contactTitleLine2}
          </span>
          {/* Linha 3: 72px (mesmo tamanho da linha 2) */}
          <span className="block text-[clamp(1.875rem,4.17vw,4.5rem)]">
            {home.contactTitleLine3}
          </span>
        </h2>

        {/* Subtítulo: 24px no Figma = text-[1.5rem] */}
        <p className="mb-6 text-[1.5rem] font-normal leading-relaxed text-[color:var(--color-blue)]">
          {home.contactSubtitle}
        </p>

        {/* Formulário — REUTILIZAR ContactForm existente (não modificar!) */}
        <ContactForm />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verificar lint e tsc**

```bash
pnpm lint
pnpm exec tsc --noEmit
```

Expected: Sem erros. Se houver erro de chave faltando, voltar ao Task 1.

- [ ] **Step 4: Commit**

```bash
git add components/home/ContactSection.tsx
git commit -m "feat(home): rewrite ContactSection with 3-line title

Title now matches Figma: vAMOS (120px) / TRABALHAR (72px) / JUNTOS? (72px).
Envelope overlay rotated 0.51° at correct offset.
ContactForm reused as-is (nome/email/telefone/mensagem).

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 3: Adicionar elipses do Contact no wrapper da página

**Files:**
- Modify: `app/[lang]/page.tsx`

**Interfaces:**
- Consumes: Página atualizada dos plans anteriores
- Produces: Elipses 758:110 (455px, x=1131, y=3486) e 758:111 (695px, x=74, y=3669)

- [ ] **Step 1: Calcular posições relativas**

A galeria termina em y=3351 (2234 + 1117). O contato começa em y=3437.

Elipse 758:110: x=1131, y=3486 → relativo à página: left=65.4%, top=3486
Elipse 758:111: x=74, y=3669 → relativo à página: left=4.3%, top=3669

Como estamos no wrapper do contato (que começa após a galeria), precisamos calcular relativo ao wrapper do contato ou usar o wrapper principal da página.

**Approach recomendada:** Adicionar as elipses dentro de um wrapper `relative` que engloba a ContactSection.

```tsx
{/* Wrapper para a seção de contato com elipses absolutas */}
<div className="relative">
  {/* Elipse cyan-pink — Figma node 758:110: 455×455 at x=1131, y=3486 */}
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img
    src="/images/home/ellipse-2.svg"
    alt=""
    aria-hidden="true"
    width={455}
    height={455}
    className="pointer-events-none absolute -z-10 hidden md:block"
    style={{
      left: "65.4%", // 1131/1728
      top: "-849px", // 3486 - 4335 (aprox: gallery bottom + contact section top)
      // NOTA: Este valor precisa ser ajustado visualmente
    }}
  />

  {/* Elipse pink — Figma node 758:111: 695×695 at x=74, y=3669 */}
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img
    src="/images/home/ellipse-4.svg"
    alt=""
    aria-hidden="true"
    width={695}
    height={695}
    className="pointer-events-none absolute -z-10 hidden md:block"
    style={{
      left: "4.3%", // 74/1728
      top: "-666px", // 3669 - 4335 (aprox)
      // NOTA: Este valor precisa ser ajustado visualmente
    }}
  />

  <div className="container-narrow py-12 md:py-20">
    <ContactSection dict={dict} />
  </div>
</div>
```

> **Nota importante:** Os valores `top` negativos são aproximados. O implementador deve **ajustar visualmente** comparando com o Figma. O importante é que as elipses apareçam nas posições corretas relativas à seção de contato.

- [ ] **Step 2: Ajustar posições visualmente**

```bash
pnpm dev
```

Abrir http://localhost:3000/pt-BR em 1728px e ajustar os valores `top` até que as elipses apareçam nas posições corretas do Figma:
- Elipse 455px (cyan-pink): canto superior direito da seção de contato
- Elipse 695px (pink): canto inferior esquerdo da seção de contato

- [ ] **Step 3: Verificar build e commit**

```bash
pnpm build && pnpm lint && pnpm exec tsc --noEmit
git add app/[lang]/page.tsx
git commit -m "feat(home): add contact decorative ellipses at Figma coordinates

- 758:110: 455px cyan-pink at x=1131, y=3486 (65.4% from left)
- 758:111: 695px pink at x=74, y=3669 (4.3% from left)

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 4: Verificação visual final do Plan 5

**Files:** (nenhum — verificação apenas)

- [ ] **Step 1: Build de produção**

```bash
pnpm build
```

- [ ] **Step 2: Quality gates**

```bash
./scripts/check-quality-gates.sh 3
./scripts/check-quality-gates.sh 4
./scripts/check-quality-gates.sh 5
```

- [ ] **Step 3: Verificação visual detalhada**

Abrir http://localhost:3000/pt-BR em 1728px.

**Checklist visual — Contact Section:**

| # | Elemento | Figma | Implementação | Status |
|---|---------|-------|---------------|--------|
| 1 | Layout | Grid 1fr 1.2fr | `md:grid-cols-[1fr_1.2fr]` | ☐ |
| 2 | Ilustração contato.svg | 555×676 | `width={555} height={676}` | ☐ |
| 3 | Envelope overlay | x=312-254=58, y=3814-3437=377, rot 0.51° | `left:58px, top:377px, rotate(0.51deg)` | ☐ |
| 4 | **Título linha 1** | "vAMOS" 120px | `contactTitleLine1` + `text-[clamp(3rem,6.94vw,7.5rem)]` | ☐ |
| 5 | **Título linha 2** | "TRABALHAR" 72px | `contactTitleLine2` + `text-[clamp(1.875rem,4.17vw,4.5rem)]` | ☐ |
| 6 | **Título linha 3** | "JUNTOS?" 72px | `contactTitleLine3` + `text-[clamp(1.875rem,4.17vw,4.5rem)]` | ☐ |
| 7 | Subtítulo | 24px Clother Regular | `text-[1.5rem]` | ☐ |
| 8 | **ContactForm** | nome/email/telefone/mensagem | `<ContactForm />` (não modificado) | ☐ |
| 9 | Elipse 758:110 | 455px, x=1131 (65.4%) | `ellipse-2.svg` absolute | ☐ |
| 10 | Elipse 758:111 | 695px, x=74 (4.3%) | `ellipse-4.svg` absolute | ☐ |

**Checklist visual — ContactForm (não deve ter mudado):**

| # | Campo | Status |
|---|-------|--------|
| 1 | Nome | ☐ Presente |
| 2 | Email | ☐ Presente |
| 3 | Telefone | ☐ Presente |
| 4 | Mensagem | ☐ Presente |
| 5 | Validação Zod | ☐ Funcionando |
| 6 | Envio EmailJS | ☐ Configurado |
| 7 | Mensagens de erro/sucesso | ☐ Traduzidas |

- [ ] **Step 4: Testar formulário**

Preencher o formulário e verificar:
- Validação funciona (campos obrigatórios)
- Mensagens de erro aparecem em português
- Submit tenta enviar (pode falhar sem config EmailJS, mas não deve dar erro de código)

- [ ] **Step 5: Testar em EN**

http://localhost:3000/en — verificar:
- Título: "LET'S / WORK / TOGETHER?"
- Subtítulo traduzido
- Formulário com labels em inglês

- [ ] **Step 6: Testar mobile**

Redimensionar para 375px:
- Layout empilha em coluna única
- Ilustração centralizada
- Formulário funcional
- Elipses ocultas

- [ ] **Step 7: Commit final do Plan 5**

```bash
git add -A
git commit -m "docs(home): plan 5 complete — contact section with 3-line title

Quality gates: 3 ✓, 4 ✓, 5 ✓
Visual verification: vAMOS/TRABALHAR/JUNTOS?, envelope overlay, ContactForm intact

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Plan 5 Complete

**Próximo plan:** `2026-10-20-new-home-plan-6-footer-final.md` (Footer com "visite também" + verificação final completa)

**Checklist de entrega:**
- [ ] Título em 3 linhas (vAMOS / TRABALHAR / JUNTOS?)
- [ ] Hierarquia correta (120px / 72px / 72px)
- [ ] Envelope overlay rotacionado 0.51°
- [ ] ContactForm intacto (não modificado)
- [ ] Subtítulo 24px
- [ ] Elipses 758:110 e 758:111 nas posições corretas
- [ ] Chaves de dicionário: contactTitleLine1/2/3 (pt-BR + en)
- [ ] Build + lint + tsc + quality gates passando
- [ ] Verificação visual manual concluída
