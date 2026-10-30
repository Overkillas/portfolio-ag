# Plan 6/6: Footer + Verificação Final Completa — Nova Home "Pontossemno"

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever o Footer com o texto gigante "visite também" (120px, transbordando acima do band), ajustar gradiente para -63.62°, e fazer a **verificação final completa** da página inteira contra o Figma, eliminando qualquer mistura com o design antigo.

**Architecture:** Footer com altura fixa 269px, gradiente -63.62°, texto "visite também" absolute com top negativo (-45px) para transbordar acima. Verificação final incluye scroll completo da página comparando com screenshot do Figma.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, i18n (pt-BR/en)

**Spec:** `docs/superpowers/specs/2026-10-20-new-home-design-v2.md` (seção 4.9, 12)

**Depends on:** Plans 1-5

## Global Constraints

- **i18n obrigatório (AGENTS.md):** Toda string user-visible vai para `dictionaries/pt-BR.json` E `dictionaries/en.json`.
- **Sem texto hardcoded.**
- **Server Components:** recebem `dict` como prop.
- **NÃO quebrar outras páginas:** O Footer atual é usado em todas as páginas. Se o novo design do Footer é específico da home, criar `HomeFooter` separado ou adicionar prop.
- **Verificação obrigatória antes de cada commit:** `pnpm build`, `pnpm lint`, `pnpm exec tsc --noEmit`
- **Branch:** `feature/new-home`
- **Commit attribution:** `Co-Authored-By: Claude Code <noreply@anthropic.com>`

## Review Focus

1. **"visite também" transbordando:** O texto 120px deve estar posicionado com `top: -45px` (ou similar) para transbordar ACIMA do footer band. Isso requer `overflow: visible` no footer.
2. **Gradiente -63.62°:** Diferente do -70.88° padrão. Criar utility class específica.
3. **Outras páginas:** Verificar se `/contato`, `/grafico`, etc. continuam funcionando com o footer antigo ou se precisam do novo.
4. **Remoção de design antigo:** Verificar que não há mais category tabs, links extras, ou imagens do design antigo em lugar nenhum.
5. **Scroll completo:** A página inteira (4614px no Figma) deve corresponder visualmente.

---

## Task 1: Adicionar chave de dicionário para "visite também"

**Files:**
- Modify: `dictionaries/pt-BR.json`
- Modify: `dictionaries/en.json`

**Interfaces:**
- Produces: `footer.visitAlso` em ambos os idiomas

- [ ] **Step 1: Verificar estrutura atual do footer no dicionário**

```bash
cat dictionaries/pt-BR.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
print(json.dumps(d.get('footer', {}), indent=2, ensure_ascii=False))
"
```

- [ ] **Step 2: Adicionar chave em pt-BR.json**

```json
{
  "footer": {
    "social": "Redes sociais",
    "visitAlso": "visite também"
  }
}
```

- [ ] **Step 3: Adicionar chave em en.json**

```json
{
  "footer": {
    "social": "Social media",
    "visitAlso": "visit too"
  }
}
```

> **Nota para EN:** "visit too" ou "check it out" ou "see also". O Figma mostra "visite também" (pt-BR). Para EN, "visit too" é a tradução mais próxima.

- [ ] **Step 4: Verificar build**

```bash
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add dictionaries/pt-BR.json dictionaries/en.json
git commit -m "feat(i18n): add footer.visitAlso key (visite também / visit too)

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 2: Criar HomeFooter com "visite também" gigante

**Files:**
- Create: `components/layout/HomeFooter.tsx`

**Interfaces:**
- Consumes: `dict: Dictionary` (prop)
- Produces: `HomeFooter` com gradiente -63.62°, "visite também" 120px transbordando, redes sociais
- Reusa: `site.social` de `@/lib/site` para URLs e handles

- [ ] **Step 1: Ler o Footer atual e lib/site**

```bash
cat components/layout/Footer.tsx
cat lib/site.ts | python3 -c "import sys; print(sys.stdin.read()[:2000])"
```

- [ ] **Step 2: Criar HomeFooter.tsx**

```tsx
// components/layout/HomeFooter.tsx
import { site } from "@/lib/site";
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Footer específico da home — fiel ao Figma Pontossemno:
 *
 * - Altura: 269px (y=4345–4614)
 * - Gradiente: -63.62° (diferente do -70.88° padrão)
 * - "visite também": AM Novecento 120px cream, x=1, y=-45 (transborda ACIMA)
 * - "Redes sociais": Clother Regular 24px cream, x=28, y=109
 * - Social rows: IG (16px) + handle (16px Light underline), IN + handle
 * - Gap: 16px entre label e handle, 8px entre rows
 *
 * IMPORTANTE: overflow VISIBLE para o texto transbordar acima.
 */
export function HomeFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer
      className="relative mt-20 w-full overflow-visible text-[color:var(--color-cream)]"
      style={{ height: "269px" }}
    >
      {/* Gradiente de fundo com ângulo -63.62° */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(-63.62deg, #bacceb 3.48%, #6f96ce 49.07%, #08488f 101.62%)",
        }}
      />

      {/* "visite também" — transborda ACIMA do band (y=-45 no Figma) */}
      <h2
        className="absolute font-display"
        style={{
          fontSize: "clamp(3rem, 6.94vw, 7.5rem)", // 120px @1728
          left: "1px",
          top: "-45px", // transborda acima!
          lineHeight: 1,
          color: "var(--color-cream)",
        }}
      >
        {dict.footer.visitAlso}
      </h2>

      {/* Conteúdo: Redes sociais */}
      <div className="relative w-full px-[28px] pt-[109px]">
        <p className="text-[1.5rem] font-normal">{dict.footer.social}</p>
        <ul className="mt-2 flex flex-col gap-2">
          <li className="flex items-center gap-4">
            <span className="w-5 shrink-0 text-base font-normal">IG</span>
            <a
              href={site.social.instagram.url}
              target="_blank"
              rel="noreferrer"
              className="text-base font-light underline decoration-from-font hover:opacity-80"
            >
              {site.social.instagram.handle}
            </a>
          </li>
          <li className="flex items-center gap-4">
            <span className="w-5 shrink-0 text-base font-normal">IN</span>
            <a
              href={site.social.linkedin.url}
              target="_blank"
              rel="noreferrer"
              className="text-base font-light underline decoration-from-font hover:opacity-80"
            >
              {site.social.linkedin.handle}
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Adicionar utility class do gradiente no globals.css (opcional)**

Se preferir usar classe em vez de inline style, adicionar em `app/[lang]/globals.css`:

```css
.bg-footer {
  background: linear-gradient(-63.62deg, #bacceb 3.48%, #6f96ce 49.07%, #08488f 101.62%);
}
```

E usar `className="bg-footer absolute inset-0"` no lugar do inline style.

- [ ] **Step 4: Verificar lint e tsc**

```bash
pnpm lint
pnpm exec tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add components/layout/HomeFooter.tsx app/[lang]/globals.css
git commit -m "feat(home): add HomeFooter with giant 'visite também' text

- 269px height, gradient -63.62°
- 'visite também' 120px AM Novecento cream, transborda acima (top: -45px)
- Redes sociais 24px, IG/IN rows 16px
- overflow-visible para o texto transbordar

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 3: Integrar HomeFooter na home page

**Files:**
- Modify: `app/[lang]/layout.tsx` (ou onde o Footer é injetado)

**Interfaces:**
- Consumes: `HomeFooter` do Task 2
- Produces: Home page usando `HomeFooter` em vez de `Footer`

- [ ] **Step 1: Verificar onde o Footer é usado**

```bash
grep -r "Footer" app/[lang]/layout.tsx
```

- [ ] **Step 2: Criar FooterRouter (similar ao HeaderRouter do Plan 1)**

Se o Footer está no layout, criar um router similar:

```tsx
// components/layout/FooterRouter.tsx
"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { HomeFooter } from "./HomeFooter";
import type { Dictionary, Locale } from "@/i18n/dictionaries";

export function FooterRouter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  // Home: /pt-BR or /en (exactly)
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  
  return isHome ? (
    <HomeFooter dict={dict} />
  ) : (
    <Footer dict={dict} />
  );
}
```

- [ ] **Step 3: Atualizar layout.tsx**

Substituir `<Footer dict={dict} />` por `<FooterRouter locale={lang} dict={dict} />`.

- [ ] **Step 4: Verificar outras páginas**

```bash
pnpm dev
```

Testar:
- http://localhost:3000/pt-BR → HomeFooter (novo, com "visite também")
- http://localhost:3000/pt-BR/contato → Footer antigo
- http://localhost:3000/en → HomeFooter (novo)

- [ ] **Step 5: Verificar build e commit**

```bash
pnpm build && pnpm lint && pnpm exec tsc --noEmit
git add app/[lang]/layout.tsx components/layout/FooterRouter.tsx
git commit -m "feat(home): integrate HomeFooter on home page via FooterRouter

- Home page uses new HomeFooter with 'visite também'
- Other pages keep old Footer

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 4: Remover elementos do design antigo (limpeza final)

**Files:**
- Modify: Vários (verificação completa)

**Interfaces:**
- Produces: Página home 100% livre de elementos do design antigo

- [ ] **Step 1: Listar elementos do design antigo que devem ser removidos**

```bash
# Buscar por category tabs no Header (já deve ter sido removido no Plan 1)
grep -r "categoryTabs" components/ app/ --include="*.tsx"

# Buscar por textos antigos
grep -r "Ilustração da Ágatha sentada\|Ilustração da Ágatha pensando\|experiencia.png\|filosofia.png" app/ components/ --include="*.tsx"

# Buscar por links antigos
grep -r "Sobre mim\|Solicitar serviços" app/[lang]/page.tsx components/home/ --include="*.tsx"
```

- [ ] **Step 2: Verificar que a home não usa mais:**

- ❌ `Header` antigo (com category tabs) — deve usar `HomeHeader`
- ❌ `Footer` antigo (sem "visite também") — deve usar `HomeFooter`
- ❌ Imagens antigas (`experiencia.png`, `filosofia.png`, `ola.png`, `contato.png`)
- ❌ Textos antigos nas sections

- [ ] **Step 3: Verificar que os componentes antigos ainda existem para outras páginas**

```bash
ls -la components/layout/Header.tsx components/layout/Footer.tsx
```

Expected: Os arquivos antigos ainda existem (usados por outras páginas via HeaderRouter/FooterRouter).

- [ ] **Step 4: Verificar HTML renderizado da home**

```bash
curl -s http://localhost:3000/pt-BR | python3 -c "
import sys, re
html = sys.stdin.read()

# Verificar elementos do design antigo
old_terms = ['Gráfico', 'Interação', 'Serviços', '3D', 'categoryTabs', 'Sobre mim', 'Solicitar serviços']
print('=== ELEMENTOS DO DESIGN ANTIGO (não devem aparecer na home) ===')
for term in old_terms:
    count = html.count(term)
    status = '✓' if count == 0 else f'✗ ENCONTRADO ({count}x)'
    print(f'{status} \"{term}\"')

# Verificar elementos novos presentes
new_terms = ['visite também', 'ola-mao', 'cracha-union', 'cracha-linha', 'estudos-cover', ':d']
print()
print('=== ELEMENTOS NOVOS (devem aparecer na home) ===')
for term in new_terms:
    count = html.count(term)
    status = '✓' if count > 0 else '✗ AUSENTE'
    print(f'{status} \"{term}\" ({count}x)')
"
```

Expected:
- Todos os old_terms: ✓ (0 occurrences)
- Todos os new_terms: ✓ (>0 occurrences)

- [ ] **Step 5: Commit de limpeza**

```bash
git add -A
git commit -m "chore(home): final cleanup — remove all old design elements from home

Verified home page is 100% new design:
- No category tabs, no old links, no old images
- All new elements present (ola-mao, cracha-union, estudos-cover, visite também, :d)

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 5: VERIFICAÇÃO FINAL COMPLETA — Scroll completo vs Figma

**Files:** (nenhum — verificação apenas)

Esta é a verificação mais importante. Percorrer a página inteira de cima a baixo comparando com o Figma.

- [ ] **Step 1: Preparar referências**

1. Abrir o Figma: https://www.figma.com/design/gpvzpeRYWxlqqonbHdj88g/Pontossemno?node-id=751-1318
2. Abrir a implementação: http://localhost:3000/pt-BR
3. Ambos em 1728px de largura

- [ ] **Step 2: Build de produção final**

```bash
pnpm build
```

- [ ] **Step 3: Quality gates completos**

```bash
./scripts/check-quality-gates.sh 3
./scripts/check-quality-gates.sh 4
./scripts/check-quality-gates.sh 5
./scripts/check-quality-gates.sh 6
```

- [ ] **Step 4: Checklist visual completo (scroll de cima a baixo)**

Usar este checklist marcando cada item enquanto scrolla a página:

### y=0–102: Header
- [ ] Altura 102px
- [ ] Fundo cream sólido (#F9F3EA)
- [ ] "sobre" à esquerda (x=120), AM Novecento 32px #BACCEB lowercase
- [ ] LanguageSwitcher no centro (PT/EN funcionando)
- [ ] "projetos" à direita (x=1310)
- [ ] SEM category tabs (Gráfico, Interação, Serviços, 3D)
- [ ] SEM links antigos (Sobre mim, Solicitar serviços)

### y=102–354: Hero Band
- [ ] Altura 252px (14.58vw em 1728px)
- [ ] Gradiente -62.1° (mais horizontal que -70.88°)
- [ ] "Ágatha sales" preenchendo largura, cream, AM Novecento
- [ ] Letras cortadas na borda inferior (overflow clip)

### y=354–557: Transição (espaço vazio + :d + elipse)
- [ ] ":d" gigante (338px) cor #BACCEB em x=819 (47.4%)
- [ ] ":d" posicionado entre hero e greeting (não dentro de section)
- [ ] Elipse rosa 695×695 em x=1394 (80.6%), y=436
- [ ] Elipse atrás de tudo (z-index -10)

### y=557–1240: Greeting Section
- [ ] ola.svg à esquerda (513×477)
- [ ] **Mão acenando (ola-mao.svg) sobre a ilustração** — x=121, y=882, rotate -4.66°
- [ ] Título "Olá a todos," 120px, 2 linhas, #6F96CE
- [ ] Intro 26px, justificado, max-w 648px, 2 parágrafos
- [ ] Texto alinhado à direita da ilustração

### y=1125: Elipse cyan pequena
- [ ] 455×455 em x=27 (1.56%), y=1125
- [ ] À esquerda da página, atrás do conteúdo

### y=1266–1810: Philosophy Section
- [ ] Título "Filosofia" 120px AM Novecento #6F96CE
- [ ] Lead 32px Clother Bold justificado, max-w 705px
- [ ] Body1 26px justificado, max-w 702px, bold "experiência humana"
- [ ] Body2 26px justificado, bolds "3D", "design de interfaces", "pesquisa"
- [ ] **Crachá completo à direita:**
  - [ ] Grupo rotacionado 15.24°
  - [ ] Base (cracha-exclude.svg) presente
  - [ ] Clip (cracha-clip.png) no topo, z-10
  - [ ] Buraco (cracha-buraco.svg) presente
  - [ ] Ellipse decorativa interna presente
  - [ ] **Union (cracha-union.svg) presente**
  - [ ] **4 linhas (cracha-linha.svg ×4) presentes**, rotate 14.8° cada
  - [ ] Texto typewriter "Acredito que o design é" visível no SVG
- [ ] SEM textos duplicados do Figma (nodes 753:1649, 753:1653)

### y=1608: Elipse cyan grande
- [ ] 879×879 em x=581 (33.6%), y=1608
- [ ] No centro da página, atrás do conteúdo

### y=1894–2255: Peeking Character
- [ ] espiando.svg 676×361
- [ ] Posição: **52.2% from left** (NÃO centralizado)
- [ ] Sobrepõe galeria em ~21px (cabeça "vaza" por cima)
- [ ] Z-index 10 (acima da galeria)

### y=2234–3351: Studies Gallery (1117px altura total)
- [ ] Grid 2fr 1fr (1152px esquerda + 576px direita)
- [ ] **Célula rosa (topo, 1152×558):**
  - [ ] Fundo #F9CEDC
  - [ ] **DUAS CAMADAS:**
    - [ ] Camada fundo: estudos-coelhos.png (161.56% height, -8.61% top, -1.36% left, 117.38% width)
    - [ ] **Camada visível: estudos-cover.png (1727×558 at x=-95)** — ESTA é a imagem que aparece!
- [ ] **Célula azul (base, 1152×558):**
  - [ ] Fundo #6F96CE
  - [ ] Baleia (carreira-baleia.png) com proporções corretas (153.99% height, etc.)
- [ ] **Sidebar (direita, 576×1117):**
  - [ ] doodles-azul.svg preenchendo toda a altura
  - [ ] Gradiente próprio do SVG visível
  - [ ] Doodles brancos de animais marinhos

### y=3437–4345: Contact Section
- [ ] contato.svg à esquerda (555×676)
- [ ] **Envelope overlay (contato-extra.svg)** rotacionado 0.51°
- [ ] **Título em 3 LINHAS:**
  - [ ] Linha 1: "vAMOS" 120px (maior)
  - [ ] Linha 2: "TRABALHAR" 72px
  - [ ] Linha 3: "JUNTOS?" 72px
- [ ] Subtítulo 24px Clother Regular
- [ ] **ContactForm completo:**
  - [ ] Campo nome
  - [ ] Campo email
  - [ ] Campo telefone
  - [ ] Campo mensagem
  - [ ] Botão enviar
  - [ ] Validação funcionando
- [ ] Elipse 758:110 (455px, cyan-pink) em x=1131 (65.4%)
- [ ] Elipse 758:111 (695px, pink) em x=74 (4.3%)

### y=4345–4614: Footer (269px)
- [ ] Altura 269px
- [ ] Gradiente -63.62°
- [ ] **"visite também" 120px AM Novecento cream**
- [ ] **"visite também" transborda ACIMA do band** (top: -45px)
- [ ] "Redes sociais" 24px cream
- [ ] IG + @aggy_colon (16px, underline)
- [ ] IN + Ágatha Ferreira (16px, underline)
- [ ] Links funcionando (abrem Instagram/LinkedIn)

### Geral (página inteira)
- [ ] Fundo cream (#F9F3EA) em toda a página
- [ ] SEM elementos do design antigo em lugar nenhum
- [ ] SEM category tabs
- [ ] SEM links "Sobre mim" / "Solicitar serviços"
- [ ] SEM imagens antigas (experiencia.png, filosofia.png, ola.png, contato.png)
- [ ] Todas as fontes carregando (AM Novecento, Clother, P22 Typewriter)
- [ ] Scroll suave, sem quebras de layout
- [ ] Sem overflow horizontal (página não "vaza" na lateral)

- [ ] **Step 5: Testar em EN (scroll completo)**

http://localhost:3000/en — repetir o checklist acima com textos em inglês.

- [ ] **Step 6: Testar mobile (375px)**

- [ ] Header: "sobre" + LanguageSwitcher (sem "projetos" ou empilhado)
- [ ] Hero: proporcional
- [ ] ":d": menor (clamp)
- [ ] Greeting: coluna única, mão acenando oculta
- [ ] Philosophy: coluna única, crachá centralizado
- [ ] Peeking: oculto
- [ ] Gallery: empilhada (rosa, azul, sidebar)
- [ ] Contact: coluna única, formulário funcional
- [ ] Footer: "visite também" menor, redes sociais legíveis

- [ ] **Step 7: Testar troca de idioma**

Clicar em PT/EN no LanguageSwitcher e verificar que a página recarrega no idioma correto.

- [ ] **Step 8: Commit final do Plan 6**

```bash
git add -A
git commit -m "docs(home): plan 6 complete — footer with 'visite também' + final verification

Quality gates: 3 ✓, 4 ✓, 5 ✓, 6 ✓
Full visual verification: all sections match Figma (1728×4614)
- Header: 102px cream, about/projects only
- Hero: 252px, gradient -62.1°
- :d: 338px absolute
- Greeting: ola-mao overlay, 120px title
- Philosophy: 6-part crachá, 15.24° rotation
- Gallery: 2-layer pink cell, cover visible
- Contact: 3-line title, ContactForm intact
- Footer: 'visite também' 120px transborda, gradient -63.62°
- Zero old design elements remaining

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Plan 6 Complete — PROJETO COMPLETO

**Todos os 6 plans concluídos.** A home page está 100% fiel ao Figma Pontossemno.

### Resumo da entrega final:

| Plan | Componente | Status |
|------|-----------|--------|
| 1 | Header + Hero | ✅ |
| 2 | Greeting + `:d` gigante | ✅ |
| 3 | Philosophy + Crachá completo | ✅ |
| 4 | Gallery (2 camadas) + Peeking | ✅ |
| 5 | Contact (3 linhas) + elipses | ✅ |
| 6 | Footer ("visite também") + verificação final | ✅ |

### Checklist de entrega final:

- [ ] Spec v2 completa (`2026-10-20-new-home-design-v2.md`)
- [ ] 6 plans detalhados (plan-1 a plan-6)
- [ ] Quality gates doc (`2026-10-20-new-home-quality-gates.md`)
- [ ] Todas as chaves de dicionário em pt-BR + en
- [ ] Todos os assets em `public/` (já estavam)
- [ ] Build + lint + tsc passando
- [ ] Quality gates 3, 4, 5, 6 passando
- [ ] Verificação visual completa (desktop 1728px, mobile 375px, PT + EN)
- [ ] Zero elementos do design antigo
- [ ] ContactForm intacto (não modificado)
- [ ] Outras páginas funcionando (Header/Footer antigos via Router)

### Próximos passos (fora do escopo destes plans):

1. **Teste de envio do formulário** com EmailJS configurado (requer `.env.local`)
2. **Otimização de imagens** (estudos-cover.png é 6.3MB — considerar WebP ou recorte)
3. **Animações** (framer-motion já instalado — entrance animations sutis)
4. **SEO** ( structured data, meta tags específicas por seção)
5. **Performance** (Lighthouse audit)

---

## Entrega para o usuário

Após completar todos os 6 plans, apresentar ao usuário:

1. **Lista de todos os arquivos modificados/criados**
2. **Resumo das mudanças principais** (9 gaps corrigidos da v1)
3. **Screenshots comparativos** (antes/depois vs Figma)
4. **Instruções para 검증 visual** (abrir Figma + implementação lado a lado)
5. **Quality gates results** (todos passando)
6. **Link para a spec v2** (documento de referência completo)
