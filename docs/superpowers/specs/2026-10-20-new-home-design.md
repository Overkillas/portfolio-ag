# Especificação: Nova Home Page — Landing "Pontossemno"

**Data:** 2026-10-20
**Status:** ⚠️ **SUPERSEDED** — Usar `2026-10-20-new-home-design-v2.md`
**Branch:** `feature/new-home`

> **AVISO:** Esta spec (v1) foi superseded pela v2 após análise visual detalhada
> comparando a implementação com o Figma. A v1 tinha 9+ gaps críticos documentados
> em `docs/superpowers/analysis/2026-10-20-gap-analysis-implementation-vs-figma.md`.
> **NÃO IMPLEMENTAR A PARTIR DESTA SPEC.** Usar a v2.
**Fonte do design:** [Figma — Pontossemno](https://www.figma.com/design/gpvzpeRYWxlqqonbHdj88g/Pontossemno?node-id=751-1318&m=dev) (node `751:1318`)

---

## 1. Objetivo

Redesenhar a home page (`app/[lang]/page.tsx`) para seguir o novo design "Pontossemno" do Figma, transformando a página "Sobre mim" atual em uma landing page mais visual e ilustrada, com:

- Hero com marca "Ágatha Sales" (manter `BrandHero` existente)
- Seção de apresentação "Olá a todos," com ilustração
- Seção "Filosofia" com crachá ilustrado
- Galeria de estudos com imagens e painel de doodles
- Seção de carreira com ilustração
- Seção de contato "Vamos trabalhar juntos?" com formulário (reutilizar `ContactForm` existente)
- Footer "Visite também" (manter `Footer` existente)
- Elementos decorativos (elipses coloridas) espalhados pela página

---

## 2. Decisões Técnicas

| Aspecto | Decisão | Justificativa |
|---------|---------|---------------|
| **Roteamento** | Manter `app/[lang]/page.tsx` | A home continua sendo a raiz `/` com prefixo de locale |
| **i18n** | Todas as strings novas vão para `dictionaries/pt-BR.json` e `dictionaries/en.json` | Regra zero do AGENTS.md: sem texto hardcoded |
| **Componentes** | Novos componentes em `components/home/` | Separação clara: cada seção é um componente |
| **Ilustrações** | SVG baixados do Figma para `public/illustrations/` e `public/images/home/` | SVG para artes vetoriais; PNG para imagens com textura (grão) |
| **Formulário** | Reutilizar `ContactForm` existente | O design do formulário no Figma é idêntico ao atual — o usuário pediu "um dedo ao formulário de contato que deve estar igual à versão atual" |
| **Fontes** | AM Novecento (display) + Clother (corpo) via Adobe Fonts (Typekit) | Já configurado no projeto via `NEXT_PUBLIC_TYPEKIT_ID` |
| **Animações** | Framer Motion (já instalado) | Branch chama `feature/new-home` — animações sutis de entrada são bem-vindas |
| **Elementos decorativos** | Ellipses como SVG com gradientes | Baixados do Figma, posicionados absolutamente |

---

## 3. Estrutura de Arquivos

### 3.1 Novos Arquivos

```
components/home/
├── GreetingSection.tsx       # "Olá a todos," + ilustração da Ágatha
├── PhilosophySection.tsx     # "Filosofia" + crachá ilustrado
├── StudiesGallery.tsx        # Galeria de estudos (imagens + doodles)
├── CareerSection.tsx         # Imagem da baleia (carreira)
├── ContactSection.tsx        # "Vamos trabalhar juntos?" + ContactForm
├── DecorativeBlob.tsx        # Elipse decorativa reutilizável
└── HomeContactForm.tsx       # Wrapper do ContactForm para a home (se necessário)

public/illustrations/
├── ola.svg                   # Ilustração principal "Olá" (já baixado)
├── ola-mao.svg               # Detalhe da mão (já baixado)
├── contato.svg               # Ilustração de contato (já baixado)
├── contato-extra.svg         # Detalhe extra de contato (já baixado)
└── extra.svg                 # Elemento decorativo extra (já baixado)

public/images/home/
├── estudos-coelhos.png       # Imagem dos coelhos (já baixado)
├── estudos-cover.png         # Capa da seção de estudos (já baixado)
├── carreira-baleia.png       # Imagem da baleia (já baixado)
├── doodles-azul.svg          # Painel de doodles azuis (já baixado)
├── cracha-exclude.svg        # Crachá azul (já baixado)
├── cracha-buraco.svg         # Furo do crachá (já baixado)
├── cracha-clip.png           # Clip do crachá (já baixado)
├── cracha-linha.svg          # Linha do crachá (já baixado)
├── cracha-union.svg          # União do crachá (já baixado)
├── ellipse-1.svg             # Ellipse decorativa 1 (já baixado)
├── ellipse-2.svg             # Ellipse decorativa 2 (já baixado)
├── ellipse-3.svg             # Ellipse decorativa 3 (já baixado)
├── ellipse-4.svg             # Ellipse decorativa 4 (já baixado)
├── ellipse-5.svg             # Ellipse decorativa 5 (já baixado)
├── send-icon.svg             # Ícone de envio (já baixado)
└── vector-1319.svg           # Vetor decorativo (já baixado)
```

### 3.2 Arquivos Modificados

| Arquivo | Modificação |
|---------|-------------|
| `app/[lang]/page.tsx` | Reescrever completamente para nova estrutura da home |
| `dictionaries/pt-BR.json` | Adicionar novas chaves de tradução para as seções |
| `dictionaries/en.json` | Adicionar as mesmas chaves em inglês |
| `app/[lang]/globals.css` | Adicionar tokens de cor rosa (`--color-pink-light`) se necessário |

---

## 4. Detalhamento das Seções

### 4.1 Hero (manter existente)
- Componente: `BrandHero` com título `dict.site.name`
- Fundo: gradiente azul existente (`bg-band`)
- Altura: responsiva (`clamp(168px, 17.5vw, 290px)`)

### 4.2 Seção "Olá a todos," (GreetingSection)
- **Layout:** Grid 2 colunas (ilustração esquerda, texto direita)
- **Ilustração:** `/illustrations/ola.svg` (Ágatha acenando)
- **Texto:**
  - Título: "Olá a todos," (AM Novecento, ~120px no Figma → usar `text-[3.5rem] md:text-[5rem]`)
  - Corpo: texto de introdução existente (`home.intro`)
- **Decorativo:** Elipse rosa atrás da ilustração (ellipse-5)

### 4.3 Seção "Filosofia" (PhilosophySection)
- **Layout:** Grid 2 colunas (texto esquerda, crachá direita)
- **Texto:**
  - Título: "Filosofia" (AM Novecento, azul #6f96ce)
  - Lead: "Para mim o design é pesquisa, ilustração e perspectiva." (Clother Bold, ~32px no Figma)
  - Corpo: parágrafos existentes (`home.philosophyBody1`, `home.philosophyBody2` com negritos inline)
- **Ilustração:** Crachá composto:
  - Base: `/images/home/cracha-exclude.svg` (crachá azul, rotacionado ~15°)
  - Clip: `/images/home/cracha-clip.png` (prendedor no topo)
  - Detalhes: `/images/home/cracha-buraco.svg`, `/images/home/cracha-union.svg`, `/images/home/cracha-linha.svg`
  - Texto no crachá: "Acredito que o design é" (P22 Typewriter — manter como SVG, não traduzir)
- **Decorativo:** Elipse ciano atrás (ellipse-2, ellipse-3)

### 4.4 Galeria "Estudos" (StudiesGallery)
- **Layout:** Grid assimétrico — esquerda 2/3 (imagens), direita 1/3 (painel azul com doodles)
- **Esquerda (2/3):**
  - Imagem superior: `/images/home/estudos-coelhos.png` (coelhos, fundo rosa #f9cedc)
  - Imagem inferior: `/images/home/carreira-baleia.png` (baleia)
- **Direita (1/3):**
  - Fundo: azul #6f96ce
  - Conteúdo: `/images/home/doodles-azul.svg` (doodles brancos de animais marinhos)
- **Altura:** ~558px no Figma (2 imagens empilhadas de ~279px cada)
- **Responsivo:** Em mobile, empilhar tudo verticalmente

### 4.5 Seção "Vamos trabalhar juntos?" (ContactSection)
- **Layout:** Grid 2 colunas (ilustração esquerda, texto + formulário direita)
- **Ilustração:** `/illustrations/contato.svg` (Ágatha com envelope)
- **Texto:**
  - Título: "Vamos trabalhar juntos?" (AM Noyente, ~120px/72px no Figma — quebrar em 3 linhas)
  - Subtítulo: "Entre em contato enviando um e-mail abaixo!" (Clother Regular, 24px)
- **Formulário:** Reutilizar `ContactForm` existente (o usuário pediu explicitamente: "um dedo ao formulário de contato que deve estar igual à versão atual onde a pessoa precisa colocar email, nome e a mensagem")
- **Decorativo:** Elipse rosa grande atrás da ilustração (ellipse-1)

### 4.6 Footer (manter existente)
- Componente: `Footer` existente
- Título: "Visite também" (já está no design do Footer atual)

---

## 5. Cores (do Figma)

| Nome | Hex | Uso |
|------|-----|-----|
| Bege clarinho | `#F9F3EA` | Fundo da página |
| Azul querido | `#6F96CE` | Títulos, textos, botões |
| Azul gelo | `#BACCEB` | Placeholders, accents |
| Azul mais escuro | `#1A2949` | Texto escuro, detalhes |
| Azul acad | `#08488F` | Fim do gradiente |
| Rosa clarinho | `#F9CEDC` | Fundo da seção de estudos |
| Azul clarinho | `#E6EEFA` | Ícone de envio |
| Ciano (decorativo) | `#7EF1F1` → transparente | Ellipses decorativas |
| Rosa (decorativo) | `#EE9CD2` → transparente | Ellipses decorativas |

---

## 6. Tipografia

| Elemento | Fonte | Peso | Tamanho (Figma) | Tamanho (código) |
|----------|-------|------|-----------------|------------------|
| Títulos de seção | AM Novecento | Regular (400) | ~120px | `text-[3.5rem] md:text-[5rem]` |
| Lead (destaque) | Clother | Bold (700) | ~32px | `text-[1.5rem] md:text-[2rem]` |
| Corpo | Clother | Light (300) | ~26px | `text-lg md:text-xl` |
| Subtítulo contato | Clother | Regular (400) | ~24px | `text-[1.125rem] md:text-[1.5rem]` |
| Texto no crachá | P22 Typewriter | Regular | ~23px | (dentro do SVG, não traduzir) |

---

## 7. Chaves de Dicionário (i18n)

Todas as novas strings devem ser adicionadas em ambos os dicionários:

```json
{
  "home": {
    // Existentes (manter):
    "greeting": "Olá a todos,",
    "greetingAlt": "Ilustração da Ágatha acenando",
    "intro": "...",
    "philosophy": "Filosofia",
    "philosophyAlt": "...",
    "philosophyLead": "...",
    "philosophyBody1": "...",
    // ... etc

    // NOVAS:
    "studiesAlt": "Ilustração de estudos — coelhos em um campo rosa",
    "studiesAltDoodles": "Painel azul com doodles de animais marinhos",
    "careerAlt": "Ilustração de uma baleia fofa com bolhas",
    "contactTitle": "Vamos trabalhar juntos?",
    "contactSubtitle": "Entre em contato enviando um e-mail abaixo!",
    "contactIllustrationAlt": "Ilustração da Ágatha com envelope"
  }
}
```

---

## 8. Assets Baixados do Figma

Todos os assets já foram baixados para `public/`:

| Asset | Caminho | Tipo | Uso |
|-------|---------|------|-----|
| Ágatha acenando | `/illustrations/ola.svg` | SVG | Seção "Olá a todos" |
| Mão (detalhe) | `/illustrations/ola-mao.svg` | SVG | Complementar à ilustração "Olá" |
| Ágatha com envelope | `/illustrations/contato.svg` | SVG | Seção de contato |
| Detalhe contato | `/illustrations/contato-extra.svg` | SVG | Complementar |
| Elemento extra | `/illustrations/extra.svg` | SVG | Decorativo |
| Coelhos | `/images/home/estudos-coelhos.png` | PNG | Galeria de estudos (topo) |
| Baleia | `/images/home/carreira-baleia.png` | PNG | Galeria de estudos (base) |
| Capa estudos | `/images/home/estudos-cover.png` | PNG | Overlay/fallback da capa |
| Doodles azuis | `/images/home/doodles-azul.svg` | SVG | Painel lateral azul |
| Crachá base | `/images/home/cracha-exclude.svg` | SVG | Ilustração da seção Filosofia |
| Crachá furo | `/images/home/cracha-buraco.svg` | SVG | Detalhe do crachá |
| Crachá clip | `/images/home/cracha-clip.png` | PNG | Prendedor do crachá |
| Crachá linha | `/images/home/cracha-linha.svg` | SVG | Linha decorativa do crachá |
| Crachá união | `/images/home/cracha-union.svg` | SVG | Elemento decorativo do crachá |
| Ellipse 1 | `/images/home/ellipse-1.svg` | SVG | Decorativo (ciano, contato) |
| Ellipse 2 | `/images/home/ellipse-2.svg` | SVG | Decorativo (rosa/ciano) |
| Ellipse 3 | `/images/home/ellipse-3.svg` | SVG | Decorativo (ciano, filosofia) |
| Ellipse 4 | `/images/home/ellipse-4.svg` | SVG | Decorativo (rosa, contato) |
| Ellipse 5 | `/images/home/ellipse-5.svg` | SVG | Decorativo (rosa, olá) |
| Ícone envio | `/images/home/send-icon.svg` | SVG | Botão do formulário |
| Vetor decorativo | `/images/home/vector-1319.svg` | SVG | Decorativo |

---

## 9. Responsividade

- **Desktop (>768px):** Layout em grid 2 colunas para todas as seções
- **Mobile (<768px):** Coluna única, ilustrações centralizadas, texto abaixo
- **Galeria de estudos:** Em mobile, empilhar imagem rosa + painel azul verticalmente
- **Elementos decorativos:** Ocultar ou reduzir em mobile (`hidden md:block`)

---

## 10. Verificação Visual

A implementação deve ser comparada com o screenshot do Figma:
- [ ] Hero idêntico ao atual (BrandHero)
- [ ] Seção "Olá a todos," com ilustração à esquerda
- [ ] Seção "Filosofia" com crachá à direita
- [ ] Galeria de estudos com grid assimétrico (2/3 + 1/3)
- [ ] Seção de contato com ilustração + formulário
- [ ] Footer "Visite também" existente
- [ ] Ellipses decorativas posicionadas corretamente
- [ ] Cores idênticas ao Figma
- [ ] Tipografia: AM Novecento para títulos, Clother para corpo

---

## 11. Quality Gates

Seguir os quality gates existentes do projeto:
- `pnpm build` deve passar (valida paridade pt-BR ↔ en)
- `pnpm lint` deve passar
- `pnpm exec tsc --noEmit` deve passar
- `./scripts/check-quality-gates.sh 3` (componentes)
- `./scripts/check-quality-gates.sh 4` (conteúdo/páginas)
- `./scripts/check-quality-gates.sh 5` (runtime)
- `./scripts/check-quality-gates.sh 6` (pre-merge)
