# Especificação v2: Nova Home Page — Landing "Pontossemno" (Reescrita pós-análise de gaps)

**Data:** 2026-10-20
**Status:** Aprovado para reespecificação
**Branch:** `feature/new-home`
**Fonte do design:** [Figma — Pontossemno](https://www.figma.com/design/gpvzpeRYWxlqqonbHdj88g/Pontossemno?node-id=751-1318&m=dev) (node `751:1318`, canvas **1728×4614**)
**Versão anterior:** `2026-10-20-new-home-design.md` (v1 — superseded)

> **⚠️ AVISO CRÍTICO PARA O IMPLEMENTADOR:**
> Esta é a especificação **v2**, reescrita após análise visual detalhada comparando a implementação atual com o Figma. A implementação atual (commits `891305c` a `3c47fe4`) tem **9 gaps críticos** documentados na seção 12. **NÃO reutilize o código atual como base** — siga esta spec do zero, seção por seção.

---

## 1. Objetivo

Reescrever completamente a home page (`app/[lang]/page.tsx`) para reproduzir com **fidelidade pixel-perfect** o design "Pontossemno" do Figma (canvas 1728×4614), eliminando qualquer mistura com o design antigo.

### O que deve mudar (alto nível)

| Componente | Ação | Motivo |
|------------|------|--------|
| `Header.tsx` | **REESCREVER** | Atual tem 6 links + category tabs (design antigo). Figma pede apenas "about" e "projects" |
| `BrandHero.tsx` | **AJUSTAR** | Altura e ângulo do gradiente diferentes do Figma |
| `GreetingSection.tsx` | **REESCREVER** | Falta mão acenando, `:d` deve ser gigante (338px), tamanhos de fonte errados |
| `PhilosophySection.tsx` | **REESCREVER** | Crachá incompleto (faltam union + 4 linhas), elipses mal posicionadas |
| `PeekingCharacter.tsx` | **AJUSTAR** | Posição errada (centralizado vs 52% from left) |
| `StudiesGallery.tsx` | **REESCREVER** | Layering errado (falta estudos-cover.png como camada visível) |
| `ContactSection.tsx` | **REESCREVER** | Título deve ser 3 linhas (não 2), elipses mal posicionadas |
| `Footer.tsx` | **REESCREVER** | Falta texto gigante "visite também" 120px |
| `page.tsx` | **REESCREVER** | Nova estrutura com coordenadas absolutas do Figma |

---

## 2. Princípios de Fidelidade ao Figma

### 2.1 Canvas de referência

- **Largura do canvas: 1728px** — todas as coordenadas do Figma são relativas a este canvas
- **Conversão para CSS:** usar `vw` quando o elemento deve escalar com a viewport, ou `px` dividido por 17.28 para conversión proporcional (ex: 120px no Figma = `6.94vw` ou ~`clamp()` com min/max)
- **Regra de ouro:** o design deve parecer idêntico ao Figma quando visualizado em 1728px de largura

### 2.2 Posicionamento absoluto vs relativo

O Figma usa **posicionamento absoluto** para quase tudo. Na implementação web:

- **Seções inteiras** (hero, greeting, philosophy, gallery, contact, footer): usar fluxo normal (block) com espaçamentos verticais calculados a partir das coordenadas Y do Figma
- **Elementos decorativos** (elipses, `:d`, mão acenando, envelope extra): usar `position: absolute` com coordenadas relativas à seção pai (`position: relative`)
- **Dentro de uma seção:** usar grid/flex para o layout principal, absolute para decorações

### 2.3 O que NÃO fazer (lições da v1)

| ❌ Erro da v1 | ✅ Correto na v2 |
|-------------|----------------|
| `:D` pequeno (3.5rem) dentro da section | `:d` gigante (338.2px) posicionado absolutamente ENTRE hero e greeting |
| Crachá com 3 partes (clip, exclude, buraco) | Crachá com TODAS as 6 partes (clip, exclude, buraco, union, 4× linha, ellipse 378) |
| Galeria rosa mostrando só coelhos | Galeria rosa com **2 camadas**: coelhos embaixo (161.56% height) + cover em cima (visível) |
| Peeking character centralizado | Peeking character em **52% from left** (x=901.7) |
| Footer sem "visite também" | Footer com texto gigante "visite também" 120px que transborda acima do band |
| Header com category tabs | Header limpo: apenas "about" + "projects" + LanguageSwitcher |
| Elipses posicionadas relativa à section | Elipses posicionadas com **coordenadas absolutas da página** (wrapper `relative` na página inteira) |

---

## 3. Estrutura da Página (Top → Bottom)

```
┌─────────────────────────────────────────┐  y=0
│  HEADER (cream, 102px)                  │
│  about (x=120)          projects (x=1310)│
├─────────────────────────────────────────┤  y=102
│  HERO BAND (gradiente, 252px)           │
│  "Ágatha sales" 209.886px cream         │  ← overflow clip na banda
├─────────────────────────────────────────┤  y=354
│                                         │
│  :d (338.2px #BACCEB)                   │  ← x=819, y=499 (entre hero e greeting)
│                                         │
│  GREETING SECTION (y≈557-1240)          │
│  ┌──────────┐  ┌────────────────────┐   │
│  │ ola.svg  │  │ "Olá a todos,"     │   │  ← x=260 / x=1031
│  │ 513×477  │  │ 120px, 2 linhas    │   │
│  │          │  │                    │   │
│  │          │  │ intro 26px justif  │   │  ← w=648
│  └──────────┘  └────────────────────┘   │
│  ola-mao.svg (x=121, y=882, rot -4.66°) │  ← overlay na ilustração
│  ellipse rosa (695px, x=1394, y=436)   │  ← decorativo
├─────────────────────────────────────────┤  y≈1237
│  PHILOSOPHY SECTION (y≈1266-1810)       │
│  ┌────────────────────┐  ┌──────────┐   │
│  │ "Filosofia" 120px  │  │  CRACHÁ  │   │  ← x=222 / x=1259
│  │ lead 32px bold     │  │  377×506 │   │
│  │ body 26px ×2       │  │  rot 15.24°│  │
│  └────────────────────┘  └──────────┘   │
│  ellipse cyan (455px, x=27, y=1125)    │  ← decorativo
│  ellipse cyan (879px, x=581, y=1608)   │  ← decorativo
├─────────────────────────────────────────┤  y≈1894
│  PEEKING CHARACTER (676×361)            │  ← x=901.7 (52% from left)
│  (sobrepõe galeria em ~21px)            │
├─────────────────────────────────────────┤  y=2234
│  STUDIES GALLERY (1117px altura)        │
│  ┌─────────────────────┬────────────┐   │
│  │ ROSA (1152×558)     │  SIDEBAR   │   │  ← 2/3 + 1/3
│  │ coelhos + cover     │  576×1117  │   │
│  ├─────────────────────┤  doodles   │   │
│  │ AZUL (1152×558)     │  azul.svg  │   │
│  │ baleia              │            │   │
│  └─────────────────────┴────────────┘   │
├─────────────────────────────────────────┤  y≈3437
│  CONTACT SECTION (y≈3437-4345)          │
│  ┌──────────┐  ┌────────────────────┐   │
│  │ contato  │  │ "vAMOS" 120px      │   │  ← x=254 / x=891
│  │ .svg     │  │ "TRABALHAR" 72px   │   │  ← 3 linhas no total
│  │ 555×676  │  │ "JUNTOS?"         │   │
│  │          │  │                    │   │
│  │ envelope │  │ subtítulo 24px     │   │
│  │ extra    │  │ ContactForm        │   │  ← reutilizar componente existente
│  └──────────┘  └────────────────────┘   │
│  ellipse cyan-pink (455px, x=1131, y=3486)│
│  ellipse pink (695px, x=74, y=3669)    │
├─────────────────────────────────────────┤  y=4345
│  FOOTER (gradiente, 269px)              │
│  "visite também" 120px cream            │  ← y=-45 (transborda ACIMA)
│  "Redes sociais" 24px                   │
│  IG @aggy_colon | IN Ágatha Ferreira    │
└─────────────────────────────────────────┘  y=4614
```

---

## 4. Especificação Detalhada por Componente

### 4.1 Header (REESCREVER `components/layout/Header.tsx`)

**Figma node:** nav bar no topo, y=0–102, fundo cream `#F9F3EA`

| Especificação | Valor |
|-------------|-------|
| Altura | **102px** (fixo) |
| Fundo | `#F9F3EA` (cream) — **sem blur, sem sticky** (ou sticky opcional, mas visual deve ser cream sólido) |
| Padding horizontal | **120px** cada lado (x=120 para "about") |
| Fonte | **AM Novecento** (font-display), **32px**, cor `#BACCEB` (azul gelo) |
| Transformação | **lowercase** (texto deve renderizar como "about", "projects") |
| Links | Apenas **2**: "about" (esquerda, x=120) e "projects" (direita, x=1310) |
| LanguageSwitcher | **MANTER** (obrigatório por i18n), posicionado entre os dois links ou à direita de "projects" |

**Estrutura HTML esperada:**
```html
<header class="bg-[#F9F3EA] h-[102px] px-[120px] flex items-center justify-between">
  <a href="/{locale}" class="font-display text-[32px] text-[#BACCEB] lowercase">about</a>
  <LanguageSwitcher />  <!-- manter componente existente -->
  <a href="/{locale}/projetos" class="font-display text-[32px] text-[#BACCEB] lowercase">projects</a>
</header>
```

**Remoções obrigatórias:**
- ❌ Category tabs (Gráfico, Interação, Serviços, 3D)
- ❌ Links "Sobre mim", "Solicitar serviços"
- ❌ Sticky + backdrop-blur (ou manter sticky mas sem blur visual)
- ❌ Múltiplos navs

**Novas chaves de dicionário necessárias:**
```json
{
  "nav": {
    "about": "about",        // ou "sobre" em pt-BR se preferir, mas Figma usa lowercase
    "projects": "projects"   // ou "projetos"
  }
}
```

> **Nota:** O Figma mostra "About" e "Projects" com lowercase styling (text-transform: lowercase). Em pt-BR pode ser "sobre" e "projetos", em en "about" e "projects". O importante é o estilo visual: AM Novecento 32px #BACCEB lowercase.

---

### 4.2 Hero Band (AJUSTAR `components/layout/BrandHero.tsx`)

**Figma node:** hero band, y=102–354

| Especificação | Figma | Atual (errado) | Correto |
|-------------|-------|---------------|---------|
| Altura | **252px** @1728 = **14.58vw** | `clamp(168px,17.5vw,290px)` | `h-[14.58vw]` ou `h-[252px]` fixo em desktop |
| Gradiente ângulo | **-62.1°** | -70.88° | `linear-gradient(-62.1deg, ...)` |
| Título | 209.886px AM Novecento cream, centralizado, top offset 22.33px | SVG getBBox-fit | Manter SVG approach mas ajustar para 209.886px @1728 = **12.14vw** |
| Overflow | `clip` (letras cortadas na borda inferior da banda) | `overflow-hidden` ✓ | Manter |

**Cores do gradiente (do Figma):**
```
linear-gradient(-62.1deg, #BACCEB 3.48%, #6F96CE 49.07%, #08488F 101.62%)
```

> **Nota:** O componente atual usa `.bg-band` que tem o ângulo -70.88°. Para o hero da home, usar um gradiente específico com -62.1°.

---

### 4.3 Texto ":d" (NOVO — posicionado absolutamente)

**Figma node:** `:d` text, x=819, y=499, tamanho da caixa 375×467

| Especificação | Valor |
|-------------|-------|
| Texto | `:d` (dois-pontos + d minúsculo) |
| Fonte | AM Novecento (font-display) |
| Tamanho | **338.2px** @1728 = **19.57vw** |
| Cor | `#BACCEB` (azul gelo) |
| Posição X | **819px** @1728 = **47.4%** from left |
| Posição Y | **499px** (topo do texto) — entre o hero (termina em 354) e a greeting section |
| Posicionamento | **Absolute** relativo a um wrapper `relative` que engloba hero + greeting |

**Implementação:**
```tsx
// Dentro de um wrapper <div className="relative"> que engloba hero + greeting
<div 
  className="absolute font-display text-[#BACCEB] pointer-events-none select-none"
  style={{ 
    fontSize: 'clamp(120px, 19.57vw, 338px)', 
    left: '47.4%',
    top: '499px', // ou top ajustado relativo ao wrapper
    lineHeight: 1,
    zIndex: 0,
  }}
  aria-hidden="true"
>
  :d
</div>
```

> **CRÍTICO:** Este elemento deve estar FORA da GreetingSection, posicionado absolutamente na página. Na v1 estava dentro da section como texto pequeno — **isso está errado**.

---

### 4.4 Greeting Section (REESCREVER `components/home/GreetingSection.tsx`)

**Figma nodes:**
- Greeting illustration (Group 100762): x=260, y=557, **513×477**
- Waving hand overlay (Group 100767): x=121, y=882, **215×248**, rotate **-4.66°**
- "Olá a todos," text: x=1031, y=575, **503×332**, **120px** AM Novecento `#6F96CE`
- Intro text: x=843, y=948, **w=648**, Clother Light **26px**, line-height 1.26, **justificado**, 2 parágrafos
- Decorative ellipse (758:297): pink 695×695 at x=1394, y=436

| Elemento | Especificação |
|----------|--------------|
| **Layout** | Grid 2 colunas: ilustração esquerda (~40%), texto direita (~60%) |
| **Ilustração principal** | `/illustrations/ola.svg`, 513×477, posicionada em x=260 (relativo à página) |
| **Mão acenando** | `/illustrations/ola-mao.svg`, 215×248, **absolute** sobre a ilustração, x=121 y=882 (relativo à página), `rotate-[-4.66deg]` |
| **Título** | "Olá a todos," — AM Novecento, **120px** @1728 = `clamp(3rem, 6.94vw, 7.5rem)`, cor `#6F96CE`, quebra em 2 linhas ("Olá a" / "todos,") |
| **Intro** | 2 parágrafos, Clother Light **26px** = `text-[1.625rem]`, `text-justify`, `leading-[1.26]`, w=648px max |
| **Elipse rosa** | `ellipse-5.svg` (695×695), absolute, x=1394 y=436 (relativo à página), z-index atrás de tudo |

**Estrutura esperada:**
```tsx
<section className="relative">
  {/* Elipse decorativa — absolute na página */}
  <DecorativeBlob 
    variant={5} 
    className="absolute pointer-events-none -z-10"
    style={{ 
      width: '695px', 
      left: '1394px', // ou 80.6% 
      top: '436px',  // relativo ao wrapper da página
    }}
  />

  <div className="container-narrow grid grid-cols-[1fr_1.3fr] items-start gap-8">
    {/* Ilustração + mão */}
    <div className="relative">
      <img src="/illustrations/ola.svg" width={513} height={477} alt={dict.home.greetingAlt} />
      {/* MÃO ACENANDO — obrigatória! */}
      <img 
        src="/illustrations/ola-mao.svg" 
        width={215} 
        height={248}
        alt=""
        aria-hidden
        className="absolute rotate-[-4.66deg]"
        style={{ left: '-139px', top: '325px' }} // relativo ao ola.svg: 121-260=-139, 882-557=325
      />
    </div>

    {/* Texto */}
    <div>
      <h2 className="font-display text-[#6F96CE] text-[clamp(3rem,6.94vw,7.5rem)] leading-[0.9] mb-8">
        {dict.home.greeting}
      </h2>
      <div className="text-[1.625rem] leading-[1.26] text-justify text-[#6F96CE] max-w-[648px] space-y-4">
        <p>{dict.home.introPara1}</p>
        <p>{dict.home.introPara2}</p>
      </div>
    </div>
  </div>
</section>
```

**Novas chaves de dicionário:**
- `home.introPara1` e `home.introPara2` (split do intro atual em 2 parágrafos, ou manter `home.intro` se já forem 2 parágrafos)

---

### 4.5 Philosophy Section (REESCREVER `components/home/PhilosophySection.tsx`)

**Figma nodes:**
- "Filosofia" text: x=222, y=1266, **714×166**, **120px** AM Novecento
- Lead text: x=222, y=1481, **w=705**, Clother Bold **32px**, justificado
- Body1: x=222, y=1590, **w=702**, 26px, bold "experiência humana"
- Body2: x=222, y=1704, **w=702**, 26px, bolds "3D", "design de interfaces", "pesquisa"
- **NÃO IMPLEMENTAR:** nodes 753:1649 (x=222 y=1861) e 753:1653 (x=618 y=1861) — são textos duplicados leftover no Figma

#### Crachá (Group 100805): x=1259, y=1237, **377×506**, rotate **15.24°**

O crachá é um grupo rotacionado com **6 partes internas** posicionadas absolutamente dentro dele:

| Parte | Asset | Offset dentro do grupo | Tamanho | Observações |
|-------|-------|----------------------|---------|-------------|
| 1. Clip (prendedor) | `cracha-clip.png` | x=1249.8-1259=-9.2, y=1293.3-1237=56.3 | 361×448 (renderizado) | Topo do crachá, z-index alto |
| 2. Base (exclude) | `cracha-exclude.svg` | x=1249.8-1259=-9.2, y=1293.3-1237=56.3 | 361×448 | Corpo principal do crachá |
| 3. Hole (furo) | `cracha-buraco.svg` | x=1332-1259=73, y=1338-1237=101 | 102×102 | Furo decorativo |
| 4. Ellipse 378 | *(SVG inline ou extraído)* | x=1391-1259=132, y=1306-1237=69 | 124×115 | Decorativo |
| 5. Union | `cracha-union.svg` | x=1367-1259=108, y=1265-1237=28 | 125×145 | **Elemento decorativo — AUSENTE na v1!** |
| 6. Linha ×4 | `cracha-linha.svg` | x≈1215-1259=-44, y=1481/1522/1563/1604 - 1237 = 244/285/326/367 | 169×44.6 cada | **4 linhas — AUSENTES na v1!**, rotate ~14.8° cada |
| 7. Texto typewriter | *(já dentro do cracha-exclude.svg)* | — | 23px | "Acredito que o design é" — P22 Typewriter, já baked no SVG |

**Estrutura do crachá:**
```tsx
<div 
  className="relative"
  style={{ 
    width: '377px', 
    height: '506px',
    transform: 'rotate(15.24deg)',
  }}
>
  {/* Base */}
  <img src="/images/home/cracha-exclude.svg" className="absolute" style={{ left: '-9px', top: '56px', width: '361px', height: '448px' }} alt={dict.home.crachaAlt} />
  
  {/* Clip no topo */}
  <img src="/images/home/cracha-clip.png" className="absolute z-10" style={{ left: '-9px', top: '56px', width: '361px' }} alt="" aria-hidden />
  
  {/* Furo */}
  <img src="/images/home/cracha-buraco.svg" className="absolute" style={{ left: '73px', top: '101px', width: '102px', height: '102px' }} alt="" aria-hidden />
  
  {/* Ellipse decorativa */}
  {/* (extrair do Figma ou criar SVG simples com as dimensões 124×115) */}
  
  {/* UNION — OBRIGATÓRIO! */}
  <img src="/images/home/cracha-union.svg" className="absolute" style={{ left: '108px', top: '28px', width: '125px', height: '145px' }} alt="" aria-hidden />
  
  {/* 4 LINHAS — OBRIGATÓRIAS! */}
  {[244, 285, 326, 367].map((top, i) => (
    <img 
      key={i}
      src="/images/home/cracha-linha.svg" 
      className="absolute"
      style={{ 
        left: '-44px', 
        top: `${top}px`, 
        width: '169px', 
        height: '44.6px',
        transform: 'rotate(14.8deg)',
      }}
      alt=""
      aria-hidden
    />
  ))}
</div>
```

#### Elipses decorativas da seção Philosophy

| Elipse | Asset | Tamanho | Posição na página | Cor |
|--------|-------|---------|-------------------|-----|
| 758:298 | `ellipse-3.svg` | 455×455 | x=27, y=1125 | cyan |
| 758:112 | `ellipse-1.svg` | 879×879 | x=581, y=1608 | cyan |

**Layout da seção:**
```tsx
<section className="relative">
  {/* Elipses absolutas na página */}
  <DecorativeBlob variant={3} style={{ left: '27px', top: '1125px', width: '455px' }} />
  <DecorativeBlob variant={1} style={{ left: '581px', top: '1608px', width: '879px' }} />

  <div className="container-narrow grid grid-cols-[1.3fr_1fr] items-center gap-8">
    {/* Texto esquerda */}
    <div>
      <h2 className="font-display text-[clamp(3rem,6.94vw,7.5rem)] text-[#6F96CE] leading-none mb-6">
        {dict.home.philosophy}
      </h2>
      <p className="font-bold text-[2rem] leading-snug text-justify text-[#6F96CE] mb-4 max-w-[705px]">
        {dict.home.philosophyLead}
      </p>
      <p className="text-[1.625rem] leading-relaxed text-justify text-[#6F96CE] mb-3 max-w-[702px]">
        {dict.home.philosophyBody1}
        <strong className="font-bold">{dict.home.philosophyBody1Bold}</strong>
        {dict.home.philosophyBody1End}
      </p>
      <p className="text-[1.625rem] leading-relaxed text-justify text-[#6F96CE] max-w-[702px]">
        {dict.home.philosophyBody2}
        <strong className="font-bold">{dict.home.philosophyBody2Bold1}</strong>
        {dict.home.philosophyBody2Mid}
        <strong className="font-bold">{dict.home.philosophyBody2Bold2}</strong>
        {dict.home.philosophyBody2Mid2}
        <strong className="font-bold">{dict.home.philosophyBody2Bold3}</strong>
        {dict.home.philosophyBody2End}
      </p>
    </div>

    {/* Crachá direita */}
    <div className="flex justify-center">
      <Cracha alt={dict.home.crachaAlt} />
    </div>
  </div>
</section>
```

---

### 4.6 Peeking Character (AJUSTAR `components/home/PeekingCharacter.tsx`)

**Figma node:** Group 100804, x=901.7, y=1894, **676×361**

| Especificação | Figma | Atual (errado) | Correto |
|-------------|-------|---------------|---------|
| Posição X | **901.7px** = **52.2%** from left | Centralizado (`justify-center`) | `left: 52.2%` ou `ml-[52.2%]` |
| Posição Y | **1894** (topo) | Entre philosophy e gallery | Manter entre as seções |
| Tamanho | **676×361** | `max-w-[500px]` | `w-[676px]` (ou `max-w-[676px]`) |
| Overlap com galeria | Bottom do char (2255) - top da galeria (2234) = **~21px** | `-mb-[80px]` | `-mb-[21px]` ou ajustar para sobrepor ~21px |

**Implementação:**
```tsx
<div className="relative z-10 hidden md:block">
  <div className="container-narrow">
    <img
n      src="/illustrations/espiando.svg"
      alt={dict.home.peekingAlt}
      width={676}
      height={361}
      className="-mb-[21px]"
      style={{ marginLeft: '52.2%' }} // ou usar translateX
    />
  </div>
</div>
```

---

### 4.7 Studies Gallery (REESCREVER `components/home/StudiesGallery.tsx`)

**Figma nodes (canvas 1728px):**

| Elemento | Node | Posição | Tamanho | Detalhes |
|----------|------|---------|---------|----------|
| Pink cell (top-left) | Frame 8 | x=0, y=2234 | **1152×558** | bg `#F9CEDC`, **2 camadas de imagem** |
| Blue cell (bottom-left) | Frame 10 | x=0, y=2793 | **1152×558** | bg `#6F96CE`, 1 imagem |
| Sidebar (right) | Frame 9 | x=1152, y=2234 | **576×1117** | `doodles-azul.svg` (tem gradiente próprio) |

#### Célula Rosa — DUAS CAMADAS OBRIGATÓRIAS

```
Camada 1 (fundo): estudos-coelhos.png
  - height: 161.56% do container
  - top: -8.61%
  - left: -1.36%
  - width: 117.38%
  - dentro de overflow-hidden

Camada 2 (topo, VISÍVEL): estudos-cover.png
  - 1727×558 (maior que o container 1152×558)
  - posição: x=-95, y=0.18 (relativo ao container)
  - object-fit: cover
  - Esta é a camada que o usuário VÊ
```

#### Célula Azul — UMA CAMADA

```
estudos-baleia.png (carreira-baleia.png)
  - height: 153.99%
  - top: -28.29%
  - left: -4.16%
  - width: 110.24%
```

**Implementação:**
```tsx
<section className="grid grid-cols-1 md:grid-cols-[2fr_1fr]">
  {/* Coluna esquerda (2/3) */}
  <div className="flex flex-col">
    {/* Célula ROSA — 2 CAMADAS */}
    <div className="relative h-[300px] md:h-[558px] overflow-hidden bg-[#F9CEDC]">
      {/* Camada 1: coelhos (fundo) */}
      <img
        src="/images/home/estudos-coelhos.png"
        alt=""
        aria-hidden
        className="absolute"
        style={{
          height: '161.56%',
          top: '-8.61%',
          left: '-1.36%',
          width: '117.38%',
          objectFit: 'cover',
        }}
      />
      {/* Camada 2: cover (VISÍVEL — por cima) */}
      <img
        src="/images/home/estudos-cover.png"
        alt={dict.home.studiesAlt}
        className="absolute"
        style={{
          left: '-95px',
          top: '0.18px',
          width: '1727px',
          height: '558px',
          objectFit: 'cover',
        }}
      />
    </div>

    {/* Célula AZUL — baleia */}
    <div className="relative h-[300px] md:h-[558px] overflow-hidden bg-[#6F96CE]">
      <img
        src="/images/home/carreira-baleia.png"
        alt={dict.home.careerAlt}
        className="absolute"
        style={{
          height: '153.99%',
          top: '-28.29%',
          left: '-4.16%',
          width: '110.24%',
          objectFit: 'cover',
        }}
      />
    </div>
  </div>

  {/* Sidebar direita (1/3) — doodles */}
  <div className="relative min-h-[400px] md:min-h-0">
    <img
      src="/images/home/doodles-azul.svg"
      alt={dict.home.studiesDoodlesAlt}
      className="absolute inset-0 h-full w-full object-cover"
    />
  </div>
</section>
```

> **CRÍTICO:** A célula rosa DEVE ter as 2 camadas. Na v1 só tinha coelhos (object-cover simples). O `estudos-cover.png` é a camada visível principal.

---

### 4.8 Contact Section (REESCREVER `components/home/ContactSection.tsx`)

**Figma nodes:**
- Illustration (Group 100790): x=254, y=3437, **555×676** → `/illustrations/contato.svg`
- Envelope (Group 100785): x=312, y=3814, **208×229**, rotate **0.51°** → `/illustrations/contato-extra.svg`
- Heading: x=891, y=3522, bloco **511×351**
  - "vAMOS" **120px** AM Novecento uppercase `#6F96CE`
  - "TRABALHAR JUNTOS?" **72px** AM Novecento uppercase `#6F96CE`
  - Renderiza como **3 linhas**: "vAMOS" / "TRABALHAR" / "JUNTOS?"
- Subtitle: x=893, y=3908, w=517, Clother Regular **24px** `#6F96CE`
- Form box: x=893, y=3963, **517×129** (Figma mostra só textarea, mas manter ContactForm completo)
- Ellipse 758:110: cyan-pink 455×455 at x=1131, y=3486
- Ellipse 758:111: pink 695×695 at x=74, y=3669

| Especificação | Valor |
|-------------|-------|
| Layout | Grid 2 colunas: ilustração esquerda, texto+form direita |
| Ilustração | `/illustrations/contato.svg`, 555×676 |
| Envelope overlay | `/illustrations/contato-extra.svg`, absolute, rotate-[0.51deg], posicionado relativo à ilustração (x=312-254=58, y=3814-3437=377) |
| Título linha 1 | "vAMOS" — AM Novecento, **120px** @1728 = `text-[clamp(3rem,6.94vw,7.5rem)]`, uppercase |
| Título linha 2 | "TRABALHAR" — AM Novecento, **72px** @1728 = `text-[clamp(1.875rem,4.17vw,4.5rem)]`, uppercase |
| Título linha 3 | "JUNTOS?" — AM Novecento, **72px** (mesmo tamanho da linha 2) |
| Subtítulo | Clother Regular 24px = `text-[1.5rem]`, `#6F96CE` |
| Formulário | **Reutilizar `ContactForm` existente** (nome, email, telefone, mensagem — obrigatório) |
| Elipses | `ellipse-2.svg` (455px, x=1131 y=3486) e `ellipse-4.svg` (695px, x=74 y=3669) — absolutas na página |

**Estrutura do título (3 linhas obrigatórias):**
```tsx
<h2 className="font-display uppercase text-[#6F96CE] leading-none mb-6">
  <span className="block text-[clamp(3rem,6.94vw,7.5rem)]">{dict.home.contactTitleLine1}</span>
  <span className="block text-[clamp(1.875rem,4.17vw,4.5rem)]">{dict.home.contactTitleLine2}</span>
  <span className="block text-[clamp(1.875rem,4.17vw,4.5rem)]">{dict.home.contactTitleLine3}</span>
</h2>
```

**Novas chaves de dicionário:**
```json
{
  "home": {
    "contactTitleLine1": "vAMOS",           // ou "vamos" com uppercase CSS
    "contactTitleLine2": "TRABALHAR",       // ou "trabalhar"
    "contactTitleLine3": "JUNTOS?",         // ou "juntos?"
  }
}
```

> **Mudança da v1 para v2:** A v1 tinha apenas 2 linhas (`contactTitleLine1` = "Vamos", `contactTitleLine2` = "trabalhar juntos?"). A v2 precisa de **3 linhas separadas** para corresponder ao Figma.

---

### 4.9 Footer (REESCREVER `components/layout/Footer.tsx`)

**Figma node:** footer band, y=4345–4614 (**269px**)

| Especificação | Figma | Atual (errado) |
|-------------|-------|---------------|
| Altura | **269px** | automático (py-10) |
| Gradiente | **-63.62°** | -70.88° (bg-band) |
| "visite também" | **120px** AM Novecento cream, x=1, **y=-45** (transborda ACIMA do band) | **AUSENTE** |
| "Redes sociais" | Clother Regular **24px** cream, x=28, y=109 | 16px (text-base) |
| Social rows | IG (16px Regular) + @aggy_colon (16px Light, underline) / IN + Ágatha Ferreira | 16px ✓ (mas estrutura diferente) |
| Gap label↔handle | **16px** | gap-3 (12px) |
| Gap entre rows | **8px** | gap-1 (4px) |

**Implementação:**
```tsx
<footer className="relative mt-20 w-full overflow-visible" style={{ height: '269px' }}>
  {/* Gradiente de fundo com ângulo -63.62° */}
  <div 
    className="absolute inset-0"
    style={{ 
      background: 'linear-gradient(-63.62deg, #BACCEB 3.48%, #6F96CE 49.07%, #08488F 101.62%)',
    }}
  />
  
  {/* "visite também" — transborda ACIMA */}
  <h2 
    className="absolute font-display text-cream"
    style={{ 
      fontSize: 'clamp(3rem, 6.94vw, 7.5rem)', // 120px @1728
      left: '1px',
      top: '-45px', // transborda acima!
      lineHeight: 1,
    }}
  >
    {dict.footer.visitAlso}
  </h2>
  
  {/* Conteúdo */}
  <div className="relative w-full px-[28px] pt-[109px] text-[color:var(--color-cream)]">
    <p className="font-normal text-[1.5rem]">{dict.footer.social}</p>
    <ul className="mt-2 flex flex-col gap-2">
      <li className="flex items-center gap-4">
        <span className="w-5 shrink-0 font-normal text-base">IG</span>
        <a href={site.social.instagram.url} className="font-light text-base underline hover:opacity-80">
          {site.social.instagram.handle}
        </a>
      </li>
      <li className="flex items-center gap-4">
        <span className="w-5 shrink-0 font-normal text-base">IN</span>
        <a href={site.social.linkedin.url} className="font-light text-base underline hover:opacity-80">
          {site.social.linkedin.handle}
        </a>
      </li>
    </ul>
  </div>
</footer>
```

**Nova chave de dicionário:**
```json
{
  "footer": {
    "visitAlso": "visite também"  // pt-BR; "visit too" ou "check also" em en
  }
}
```

---

## 5. Página Principal (REESCREVER `app/[lang]/page.tsx`)

A página deve usar um **wrapper `relative`** para permitir posicionamento absoluto de elementos decorativos que precisam de coordenadas da página inteira (elipses, `:d`).

```tsx
import { notFound } from "next/navigation";
import { BrandHero } from "@/components/layout/BrandHero";
import { GreetingSection } from "@/components/home/GreetingSection";
import { PhilosophySection } from "@/components/home/PhilosophySection";
import { PeekingCharacter } from "@/components/home/PeekingCharacter";
import { StudiesGallery } from "@/components/home/StudiesGallery";
import { ContactSection } from "@/components/home/ContactSection";
import { getDictionary, isLocale } from "@/i18n/dictionaries";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.metadata.home,
    alternates: {
      languages: { "pt-BR": "/pt-BR", en: "/en", "x-default": "/pt-BR" },
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <BrandHero title={dict.site.name} />
      
      {/* Wrapper relativo para elementos absolutos da página */}
      <div className="relative">
        {/* :d gigante — absolute na página */}
        <div
          className="absolute font-display text-[#BACCEB] pointer-events-none select-none -z-10"
          style={{
            fontSize: 'clamp(120px, 19.57vw, 338px)',
            left: '47.4%',
            top: '145px', // 499 - 354 (hero bottom) = 145px relativo ao wrapper
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          :d
        </div>

        {/* Elipses decorativas — absolutas na página */}
        {/* ellipse rosa: 758:297, 695px at x=1394, y=436 */}
        <img
          src="/images/home/ellipse-5.svg"
          alt=""
          aria-hidden
          className="absolute pointer-events-none -z-10 hidden md:block"
          style={{ width: '695px', height: '695px', left: '80.6%', top: '82px' }} // 436-354=82
        />

        {/* Greeting */}
        <div className="container-narrow py-12 md:py-20">
          <GreetingSection dict={dict} />
        </div>

        {/* Philosophy */}
        <div className="container-narrow py-12 md:py-20">
          <PhilosophySection dict={dict} />
        </div>
      </div>

      {/* Peeking character — entre philosophy e gallery */}
      <PeekingCharacter dict={dict} />

      {/* Gallery — full width */}
      <StudiesGallery dict={dict} />

      {/* Contact */}
      <div className="relative">
        {/* Elipses do contato — absolutas */}
        <img
          src="/images/home/ellipse-2.svg"
          alt=""
          aria-hidden
          className="absolute pointer-events-none -z-10 hidden md:block"
          style={{ width: '455px', height: '455px', left: '65.4%', top: '-849px' }} // relativo ao wrapper do contato
        />
        <img
          src="/images/home/ellipse-4.svg"
          alt=""
          aria-hidden
          className="absolute pointer-events-none -z-10 hidden md:block"
          style={{ width: '695px', height: '695px', left: '4.3%', top: '-676px' }}
        />

        <div className="container-narrow py-12 md:py-20">
          <ContactSection dict={dict} />
        </div>
      </div>
    </>
  );
}
```

> **Nota sobre coordenadas absolutas:** O exemplo acima usa coordenadas relativas aos wrappers de cada seção. Uma alternativa mais fiel ao Figma seria usar um único wrapper `relative` para a página inteira e posicionar TUDO com coordenadas absolutas. A escolha fica a critério do implementador, mas o **resultado visual deve corresponder ao Figma**.

---

## 6. Tokens de Design (globals.css)

Adicionar/ajustar em `app/[lang]/globals.css`:

```css
@theme inline {
  /* Cores existentes (manter) */
  --color-cream: #f9f3ea;
  --color-ink: #1a2949;
  --color-blue: #6f96ce;
  --color-blue-soft: #baccEB;
  --color-blue-pale: #e6eefa;
  --color-blue-darkest: #08488f;
  --color-pink: #e4a4c3;
  --color-pink-soft: #f1d2e2;
  --color-pink-light: #f9cedc;
  
  /* Gradientes (ajustar ângulos) */
  --gradient-band: linear-gradient(-70.88deg, #bacceb 3.48%, #6f96ce 49.07%, #08488f 101.62%);      /* outras páginas */
  --gradient-hero: linear-gradient(-62.1deg, #bacceb 3.48%, #6f96ce 49.07%, #08488f 101.62%);       /* home hero — NOVO ângulo */
  --gradient-footer: linear-gradient(-63.62deg, #bacceb 3.48%, #6f96ce 49.07%, #08488f 101.62%);    /* footer — NOVO ângulo */
  --gradient-sidebar: linear-gradient(to bottom, #485699 0%, #5c76b4 39.4%, #6f95ce 73.1%, #6f95ce 100%); /* doodles sidebar */
}
```

---

## 7. Tipografia — Tabela de Conversão Figma → CSS

Base: canvas 1728px. Fórmula: `px_figma / 17.28 = vw`

| Elemento | Figma px | vw | CSS sugerido |
|----------|----------|-----|-------------|
| Nav links | 32px | 1.85vw | `text-[32px]` fixo |
| Hero title | 209.886px | 12.14vw | `clamp(80px, 12.14vw, 210px)` (ou manter SVG getBBox) |
| `:d` | 338.2px | 19.57vw | `clamp(120px, 19.57vw, 338px)` |
| Section headings (Olá, Filosofia) | 120px | 6.94vw | `clamp(3rem, 6.94vw, 7.5rem)` |
| Contact title line 1 (vAMOS) | 120px | 6.94vw | `clamp(3rem, 6.94vw, 7.5rem)` |
| Contact title lines 2-3 | 72px | 4.17vw | `clamp(1.875rem, 4.17vw, 4.5rem)` |
| Philosophy lead | 32px | 1.85vw | `text-[2rem]` |
| Body text | 26px | 1.50vw | `text-[1.625rem]` |
| Contact subtitle | 24px | 1.39vw | `text-[1.5rem]` |
| Footer "visite também" | 120px | 6.94vw | `clamp(3rem, 6.94vw, 7.5rem)` |
| Footer "Redes sociais" | 24px | 1.39vw | `text-[1.5rem]` |
| Footer social rows | 16px | 0.93vw | `text-base` |
| Crachá typewriter | 23px | — | Dentro do SVG (não traduzir) |

---

## 8. Chaves de Dicionário (i18n) — Resumo Completo

Todas as chaves devem existir em **ambos** `dictionaries/pt-BR.json` e `dictionaries/en.json`:

### Chaves existentes (manter)
```json
{
  "home": {
    "greeting": "Olá a todos,",
    "greetingAlt": "Ilustração da Ágatha acenando",
    "intro": "...",  // ou split em introPara1/introPara2
    "philosophy": "Filosofia",
    "philosophyLead": "...",
    "philosophyBody1": "...",
    "philosophyBody1Bold": "experiência humana",
    "philosophyBody1End": "...",
    "philosophyBody2": "...",
    "philosophyBody2Bold1": "3D",
    "philosophyBody2Mid": "...",
    "philosophyBody2Bold2": "design de interfaces",
    "philosophyBody2Mid2": "...",
    "philosophyBody2Bold3": "pesquisa",
    "philosophyBody2End": "...",
    "studiesAlt": "...",
    "studiesDoodlesAlt": "...",
    "careerAlt": "...",
    "contactSubtitle": "...",
    "contactIllustrationAlt": "...",
    "crachaAlt": "...",
    "peekingAlt": "..."
  },
  "nav": {
    "about": "about",       // NOVO (ou "sobre" em pt-BR)
    "projects": "projects"  // NOVO (ou "projetos" em pt-BR)
  },
  "footer": {
    "social": "Redes sociais"
  }
}
```

### Chaves NOVAS (adicionar)
```json
{
  "home": {
    "contactTitleLine1": "vAMOS",      // ou "Vamos" com uppercase CSS
    "contactTitleLine2": "TRABALHAR",  // ou "trabalhar"
    "contactTitleLine3": "JUNTOS?"     // ou "juntos?"
  },
  "footer": {
    "visitAlso": "visite também"       // pt-BR; "visit too" em en
  }
}
```

### Chaves a REMOVER (se existirem da v1)
```json
{
  "home": {
    "contactTitle": "...",        // REMOVER — substituído por 3 linhas
    "contactTitleLine1": "Vamos", // SUBSTITUIR — novo valor é "vAMOS" (linha 1 sozinha)
    "contactTitleLine2": "..."    // SUBSTITUIR — agora é só "TRABALHAR"
    // contactTitleLine3 é NOVA
  }
}
```

---

## 9. Assets (todos já baixados em `public/`)

| Asset | Caminho | Dimensões | Uso |
|-------|---------|-----------|-----|
| Ola ilustração | `/illustrations/ola.svg` | 529×495 (Figma: 513×477) | Greeting |
| Mão acenando | `/illustrations/ola-mao.svg` | 197×233 (Figma: 215×248) | Greeting overlay |
| Contato ilustração | `/illustrations/contato.svg` | 555×681 (Figma: 555×676) | Contact |
| Envelope extra | `/illustrations/contato-extra.svg` | 208×229 | Contact overlay |
| Peeking character | `/illustrations/espiando.svg` | 676×361 | Entre philosophy e gallery |
| Coelhos | `/images/home/estudos-coelhos.png` | 735×490 | Gallery (camada fundo) |
| Cover estudos | `/images/home/estudos-cover.png` | 4096×1323 | Gallery (camada visível) |
| Baleia | `/images/home/carreira-baleia.png` | 869×588 | Gallery (célula azul) |
| Doodles azul | `/images/home/doodles-azul.svg` | 576×1117 | Gallery sidebar |
| Crachá base | `/images/home/cracha-exclude.svg` | 282×408 (Figma: 361×448) | Philosophy crachá |
| Crachá clip | `/images/home/cracha-clip.png` | 228×202 | Philosophy crachá (topo) |
| Crachá furo | `/images/home/cracha-buraco.svg` | 83×83 (Figma: 102×102) | Philosophy crachá |
| Crachá union | `/images/home/cracha-union.svg` | 107×135 (Figma: 125×145) | Philosophy crachá — **USAR!** |
| Crachá linha | `/images/home/cracha-linha.svg` | 175×3.45 (Figma: 169×44.6) | Philosophy crachá ×4 — **USAR!** |
| Ellipse 1 | `/images/home/ellipse-1.svg` | 879×879 | Decorativo (cyan grande) |
| Ellipse 2 | `/images/home/ellipse-2.svg` | 455×455 | Decorativo (cyan-pink) |
| Ellipse 3 | `/images/home/ellipse-3.svg` | 455×455 | Decorativo (cyan) |
| Ellipse 4 | `/images/home/ellipse-4.svg` | 695×695 | Decorativo (rosa contato) |
| Ellipse 5 | `/images/home/ellipse-5.svg` | 695×695 | Decorativo (rosa greeting) |

---

## 10. Checklist de Verificação Visual (contra o Figma)

Após a implementação, comparar lado a lado com o screenshot do Figma (1728×4614):

- [ ] **Header:** 102px cream, apenas "about" + "projects" (32px #BACCEB lowercase), LanguageSwitcher presente
- [ ] **Hero:** 252px altura, gradiente -62.1°, "Ágatha sales" preenchendo a largura
- [ ] **:d:** 338px #BACCEB, posicionado entre hero e greeting (não dentro de nenhuma section)
- [ ] **Greeting:** ola.svg à esquerda, mão acenando (ola-mao.svg) overlay, título 120px 2 linhas, intro 26px justificado
- [ ] **Elipse rosa:** 695px no canto superior direito da greeting
- [ ] **Philosophy:** título 120px, lead 32px bold, body 26px, crachá completo (6 partes) rotacionado 15.24°
- [ ] **Elipses philosophy:** 455px (x=27) e 879px (x=581) nas posições corretas
- [ ] **Peeking:** 676px, 52% from left, sobrepondo galeria em ~21px
- [ ] **Gallery:** célula rosa com 2 camadas (coelhos fundo + cover visível), célula azul com baleia, sidebar doodles
- [ ] **Contact:** ilustração + envelope overlay, título 3 linhas (vAMOS/TRABALHAR/JUNTOS?), subtítulo 24px, ContactForm completo
- [ ] **Elipses contato:** 455px (x=1131) e 695px (x=74)
- [ ] **Footer:** 269px, gradiente -63.62°, "visite também" 120px transbordando acima, redes sociais corretas
- [ ] **SEM elementos do design antigo:** sem category tabs, sem links extras no header, sem imagens antigas

---

## 11. Responsividade

- **Desktop (>768px):** Layout fiel ao Figma (1728px canvas)
- **Mobile (<768px):** 
  - Header: manter apenas "about" + LanguageSwitcher (esconder "projects" ou empilhar)
  - Todas as seções: coluna única
  - `:d`: reduzir tamanho (clamp já faz isso)
  - Elipses decorativas: ocultar (`hidden md:block`)
  - Gallery: empilhar células verticalmente
  - Peeking character: ocultar (`hidden md:block`)
  - Contact form: manter funcional

---

## 12. Análise de Gaps da Implementação Atual (v1 → v2)

Esta seção documenta **por que** a v2 é necessária, listando cada gap encontrado na implementação atual (commits `891305c` a `3c47fe4`):

| # | Componente | Gap | Severidade | Correção na v2 |
|---|-----------|-----|-----------|---------------|
| 1 | Header | 6 links + category tabs (design antigo) vs apenas "about"/"projects" | 🔴 Crítico | Reescrever Header completo |
| 2 | Hero | Altura 17.5vw vs 14.58vw; gradiente -70.88° vs -62.1° | 🟡 Alto | Ajustar BrandHero |
| 3 | `:d` | Pequeno (3.5rem) dentro da section vs gigante (338px) absolute na página | 🔴 Crítico | Mover para absolute na página |
| 4 | Greeting | Mão acenando (ola-mao.svg) ausente | 🔴 Crítico | Adicionar overlay |
| 5 | Greeting | Título 40/64px vs 120px; intro 18/20px vs 26px | 🔴 Crítico | Ajustar tamanhos |
| 6 | Philosophy | Crachá sem union e sem 4 linhas | 🔴 Crítico | Adicionar todas as 6 partes |
| 7 | Peeking | Centralizado vs 52% from left; 500px vs 676px | 🟡 Alto | Ajustar posição e tamanho |
| 8 | Gallery | Célula rosa sem cover (só coelhos); cover não usado | 🔴 Crítico | Implementar 2 camadas |
| 9 | Contact | Título 2 linhas vs 3 linhas; split errado | 🔴 Crítico | 3 dictionary keys separadas |
| 10 | Footer | "visite também" 120px ausente | 🔴 Crítico | Adicionar texto gigante |
| 11 | Elipses | Posicionadas relativa à section vs coordenadas absolutas da página | 🟡 Alto | Reposicionar com coordenadas do Figma |
| 12 | Design antigo | Category tabs, links extras, imagens antigas ainda presentes | 🔴 Crítico | Remover tudo |

---

## 13. Quality Gates

Consultar: `docs/superpowers/quality-gates/2026-10-20-new-home-quality-gates.md`

Verificações obrigatórias antes de cada commit:
- `pnpm build` — deve passar (valida paridade pt-BR ↔ en)
- `pnpm lint` — deve passar
- `pnpm exec tsc --noEmit` — deve passar
- `./scripts/check-quality-gates.sh 3` — componentes
- `./scripts/check-quality-gates.sh 4` — conteúdo/páginas
- `./scripts/check-quality-gates.sh 5` — runtime
- `./scripts/check-quality-gates.sh 6` — pre-merge
- **Verificação visual manual:** comparar com screenshot do Figma lado a lado

---

## 14. Referências

- Spec v1 (superseded): `docs/superpowers/specs/2026-10-20-new-home-design.md`
- Figma: https://www.figma.com/design/gpvzpeRYWxlqqonbHdj88g/Pontossemno?node-id=751-1318&m=dev
- Spec i18n (regras obrigatórias): `docs/superpowers/specs/2026-10-19-i18n-design.md`
- AGENTS.md (regras do projeto): `AGENTS.md`
