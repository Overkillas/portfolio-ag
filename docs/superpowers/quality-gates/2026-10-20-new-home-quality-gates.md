# Quality Gates: Nova Home Page "Pontossemno" (v2)

**Feature:** Reescrita completa da home page para fidelidade pixel-perfect com o Figma
**Spec:** `docs/superpowers/specs/2026-10-20-new-home-design-v2.md`
**Plans:** `docs/superpowers/plans/2026-10-20-new-home-plan-{1..6}-*.md`
**Branch:** `feature/new-home`
**Data:** 2026-10-20

---

## Quick Start

```bash
# Verificar após cada plan
./scripts/check-quality-gates.sh 3    # Componentes (após Plans 1-5)
./scripts/check-quality-gates.sh 4    # Conteúdo/páginas (após Plans 1-5)
./scripts/check-quality-gates.sh 5    # Runtime (após Plan 6)
./scripts/check-quality-gates.sh 6    # Pre-merge (final, após Plan 6)

# Verificação visual manual obrigatória (não automatizada)
# 1. Abrir Figma: https://www.figma.com/design/gpvzpeRYWxlqqonbHdj88g/Pontossemno?node-id=751-1318
# 2. Abrir http://localhost:3000/pt-BR em 1728px
# 3. Comparar seção por seção (ver checklist abaixo)
```

**Exit codes:** `0` = PASS, `1` = FAIL

---

## Gate de Verificação Visual (OBRIGATÓRIO — não automatizado)

Este gate é **manual** e **obrigatório**. A verificação automatizada (build, lint, tsc) não detecta problemas visuais.

### Como executar

1. Abrir o Figma (node 751:1318) em uma aba
2. Abrir http://localhost:3000/pt-BR em 1728px de largura em outra aba
3. Alternar entre as abas comparando seção por seção
4. Marcar cada item do checklist abaixo

### Checklist Visual — Obrigatório 100% antes de considerar completo

#### 1. Header (y=0–102)
- [ ] Altura exata: 102px
- [ ] Fundo: cream sólido `#F9F3EA` (sem blur, sem transparencia)
- [ ] Link "sobre": x=120, AM Novecento 32px, `#BACCEB`, lowercase
- [ ] Link "projetos": x=1310, mesmo estilo
- [ ] LanguageSwitcher: presente no centro, botões PT/EN funcionando
- [ ] **AUSENTE:** Category tabs (Gráfico, Interação, Serviços, 3D)
- [ ] **AUSENTE:** Links "Sobre mim", "Solicitar serviços"
- [ ] **AUSENTE:** Sticky blur visual

#### 2. Hero Band (y=102–354)
- [ ] Altura: 252px em 1728px (14.58vw)
- [ ] Gradiente: ângulo -62.1° (comparar visualmente com -70.88° — deve ser mais horizontal)
- [ ] Cores: `#BACCEB` → `#6F96CE` → `#08488F`
- [ ] Título "Ágatha sales": AM Novecento, cream, preenchendo largura
- [ ] Letras cortadas na borda inferior (overflow clip)

#### 3. Transição Hero → Greeting (y=354–557)
- [ ] **":d" gigante:** 338px (19.57vw), cor `#BACCEB`, AM Novecento
- [ ] **":d" posição:** x=819 (47.4% from left), entre hero e greeting
- [ ] **":d" NÃO está dentro de nenhuma section** (é absolute no wrapper da página)
- [ ] Elipse rosa: 695×695, x=1394 (80.6%), y=436, atrás de tudo

#### 4. Greeting Section (y=557–1240)
- [ ] Ilustração ola.svg: 513×477, à esquerda
- [ ] **Mão acenando (ola-mao.svg):** 215×248, sobre a ilustração, rotate -4.66°
- [ ] Posição da mão: x=121, y=882 (offset -139, +325 relativo ao ola.svg)
- [ ] Título "Olá a todos,": 120px (6.94vw), AM Novecento, `#6F96CE`, 2 linhas
- [ ] Intro: 26px (1.625rem), Clother Light, **justificado** (`text-justify`), max-w 648px
- [ ] 2 parágrafos visíveis

#### 5. Elipse Cyan Pequena (y=1125)
- [ ] 455×455, x=27 (1.56% from left)
- [ ] Atrás do conteúdo (z-index -10)
- [ ] Cor cyan (do ellipse-3.svg)

#### 6. Philosophy Section (y=1266–1810)
- [ ] Título "Filosofia": 120px, AM Novecento, `#6F96CE`
- [ ] Lead: 32px (2rem), Clother Bold, justificado, max-w 705px
- [ ] Body1: 26px (1.625rem), justificado, max-w 702px
- [ ] Body1 bold: "experiência humana" em negrito
- [ ] Body2: 26px, justificado
- [ ] Body2 bolds: "3D", "design de interfaces", "pesquisa" em negrito
- [ ] **AUSENTE:** Textos duplicados (nodes 753:1649, 753:1653)

#### 6a. Crachá Completo (x=1259, y=1237, 377×506, rotate 15.24°)
- [ ] Grupo inteiro rotacionado **15.24°** (não 15° arredondado)
- [ ] Tamanho do grupo: 377×506
- [ ] **Parte 1 — Base (cracha-exclude.svg):** presente, 361×448, left=-9px, top=56px
- [ ] **Parte 2 — Clip (cracha-clip.png):** presente, no topo, z-index 10
- [ ] **Parte 3 — Buraco (cracha-buraco.svg):** presente, 102×102, left=73px, top=101px
- [ ] **Parte 4 — Ellipse interna:** presente (124×115, left=132px, top=69px)
- [ ] **Parte 5 — Union (cracha-union.svg):** **PRESENTE** (faltava na v1!), 125×145, left=108px, top=28px
- [ ] **Parte 6 — 4 Linhas (cracha-linha.svg ×4):** **PRESENTES** (faltavam na v1!)
  - [ ] Linha 1: top=244px
  - [ ] Linha 2: top=285px
  - [ ] Linha 3: top=326px
  - [ ] Linha 4: top=367px
  - [ ] Cada linha: 169×45, rotate 14.8°, left=-44px
- [ ] Texto typewriter "Acredito que o design é" visível dentro do SVG base

#### 7. Elipse Cyan Grande (y=1608)
- [ ] 879×879, x=581 (33.6% from left)
- [ ] No centro da página, atrás do conteúdo
- [ ] Cor cyan (do ellipse-1.svg)

#### 8. Peeking Character (y=1894–2255)
- [ ] espiando.svg: 676×361
- [ ] **Posição X: 52.2% from left** (NÃO centralizado!)
- [ ] **Largura: 676px** (não 500px)
- [ ] **Overlap com galeria: ~21px** (cabeça "vaza" por cima da borda rosa)
- [ ] Z-index 10 (acima da galeria)
- [ ] Oculto em mobile (`hidden md:block`)

#### 9. Studies Gallery (y=2234–3351, 1117px total)
- [ ] Grid: 2fr 1fr (1152px esquerda + 576px direita)
- [ ] Altura total: 1117px (2×558px esquerda + 1117px direita)

#### 9a. Célula Rosa — 2 CAMADAS OBRIGATÓRIAS (topo, 1152×558)
- [ ] Fundo: `#F9CEDC` (rosa clarinho)
- [ ] **Camada 1 (fundo): estudos-coelhos.png**
  - [ ] height: 161.56%
  - [ ] top: -8.61%
  - [ ] left: -1.36%
  - [ ] width: 117.38%
- [ ] **Camada 2 (topo, VISÍVEL): estudos-cover.png**
  - [ ] width: 1727px
  - [ ] height: 558px
  - [ ] left: -95px
  - [ ] top: 0.18px
  - [ ] **ESTA é a imagem que aparece** (não os coelhos!)
- [ ] Verificar: a imagem visível é o cover (paisagem/colorida), NÃO só coelhos

#### 9b. Célula Azul (base, 1152×558)
- [ ] Fundo: `#6F96CE`
- [ ] Baleia (carreira-baleia.png):
  - [ ] height: 153.99%
  - [ ] top: -28.29%
  - [ ] left: -4.16%
  - [ ] width: 110.24%

#### 9c. Sidebar (direita, 576×1117)
- [ ] doodles-azul.svg preenchendo toda a altura
- [ ] Gradiente próprio do SVG visível (#485699 → #5C76B4 → #6F95CE)
- [ ] Doodles brancos de animais marinhos visíveis

#### 10. Contact Section (y=3437–4345)
- [ ] Layout: grid 1fr 1.2fr (ilustração esquerda, texto+form direita)
- [ ] Ilustração contato.svg: 555×676
- [ ] **Envelope overlay (contato-extra.svg):**
  - [ ] 208×229
  - [ ] Posição relativa: left=58px, top=377px
  - [ ] Rotação: 0.51°
- [ ] **Título em 3 LINHAS:**
  - [ ] Linha 1: "vAMOS" — **120px** (maior)
  - [ ] Linha 2: "TRABALHAR" — **72px**
  - [ ] Linha 3: "JUNTOS?" — **72px**
  - [ ] Todas AM Novecento uppercase `#6F96CE`
- [ ] Subtítulo: 24px (1.5rem), Clother Regular
- [ ] **ContactForm INTACTO:**
  - [ ] Campo "nome" presente
  - [ ] Campo "email" presente
  - [ ] Campo "telefone" presente
  - [ ] Campo "mensagem" presente
  - [ ] Botão enviar presente
  - [ ] Validação Zod funcionando (testar submit vazio)
- [ ] Elipse 758:110: 455×455, cyan-pink, x=1131 (65.4%), y=3486
- [ ] Elipse 758:111: 695×695, pink, x=74 (4.3%), y=3669

#### 11. Footer (y=4345–4614, 269px)
- [ ] Altura: 269px
- [ ] Gradiente: -63.62° (diferente do -70.88° padrão)
- [ ] **"visite também": 120px AM Novecento cream**
- [ ] **"visite também" transborda ACIMA do band** (top: -45px, overflow visible)
- [ ] "Redes sociais": 24px (1.5rem) Clother Regular cream, x=28
- [ ] Gap label↔handle: 16px (gap-4)
- [ ] Gap entre rows: 8px (gap-2)
- [ ] IG: label 16px Regular + @aggy_colon (16px Light, underline)
- [ ] IN: label 16px Regular + Ágatha Ferreira (16px Light, underline)
- [ ] Links abrem Instagram/LinkedIn em nova aba

#### 12. Verificação Geral (página inteira)
- [ ] Fundo cream `#F9F3EA` em toda a página
- [ ] **ZERO elementos do design antigo:**
  - [ ] Sem category tabs (Gráfico, Interação, Serviços, 3D)
  - [ ] Sem links "Sobre mim", "Solicitar serviços"
  - [ ] Sem imagens antigas (experiencia.png, filosofia.png, ola.png, contato.png)
  - [ ] Sem textos antigos ("Experiência", "currículo", etc.)
- [ ] Todas as fontes carregando (AM Novecento, Clother, P22 Typewriter)
- [ ] Sem overflow horizontal (página não "vaza" na lateral)
- [ ] Scroll suave, sem quebras de layout
- [ ] Elementos decorativos não atrapalham cliques (pointer-events-none)

#### 13. Verificação em EN
- [ ] Abrir http://localhost:3000/en em 1728px
- [ ] Repetir checklist visual (itens 1-12) com textos em inglês
- [ ] Título contato: "LET'S / WORK / TOGETHER?" (3 linhas)
- [ ] Footer: "visit too"
- [ ] Todas as traduções presentes (sem chaves tipo `home.greeting` aparecendo)

#### 14. Verificação Mobile (375px)
- [ ] Header: "sobre" + LanguageSwitcher (sem "projetos" ou empilhado)
- [ ] Hero: proporcional (min-h-[168px])
- [ ] ":d": tamanho reduzido (clamp mínimo 120px)
- [ ] Greeting: coluna única, mão acenando **oculta**
- [ ] Philosophy: coluna única, crachá centralizado e rotacionado
- [ ] Elipses decorativas **ocultas** (`hidden md:block`)
- [ ] Peeking character **oculto**
- [ ] Gallery: empilhada verticalmente (rosa → azul → sidebar)
- [ ] Células da gallery: h-[300px] em mobile
- [ ] Contact: coluna única, ilustração centralizada, formulário funcional
- [ ] Footer: "visite também" em tamanho menor, redes sociais legíveis

---

## Gate 3: Componentes (após Plans 1-5)

**Comando:** `./scripts/check-quality-gates.sh 3`

### Verificações automatizadas

| Check | Comando | Expected |
|-------|---------|----------|
| Build passa | `pnpm build` | Exit 0, sem erros de tipo |
| Paridade i18n | (implícito no build) | Zero erros de chave faltando |
| Lint passa | `pnpm lint` | Exit 0, 0 errors |
| TypeScript | `pnpm exec tsc --noEmit` | Exit 0 |
| Componentes novos existem | `ls components/home/*.tsx` | GreetingSection, PhilosophySection, StudiesGallery, ContactSection, PeekingCharacter, DecorativeBlob |
| Componentes novos existem (layout) | `ls components/layout/Home*.tsx` | HomeHeader, HomeFooter (se criados) |

### Verificações de código (grep)

```bash
# Todas as imagens usam eslint-disable para no-img-element
# (ou usam next/image se aplicável)
grep -r "no-img-element" components/home/*.tsx | wc -l
# Expected: >0 (cada <img> tem o disable)

# Não há texto hardcoded user-visible (verificação manual + lint)
grep -r '>[A-ZÁÉÍÓÚ][a-záéíóú]+ [a-z]+<' components/home/*.tsx | grep -v "className\|import\|//"
# Expected: poucas ou nenhuma ocorrência (apenas aria-hidden ou comentários)

# Crachá tem todas as 6 partes
for part in cracha-exclude cracha-clip cracha-buraco cracha-union cracha-linha; do
  echo -n "$part: "
  grep -c "$part" components/home/PhilosophySection.tsx
done
# Expected: cada um retorna >=1 (cracha-linha deve retornar >=4 para as 4 linhas)

# Gallery tem 2 camadas na célula rosa
grep -c "estudos-coelhos" components/home/StudiesGallery.tsx  # Expected: 1

# Gallery usa o cover (não só coelhos)
grep -c "estudos-cover" components/home/StudiesGallery.tsx    # Expected: 1

# Contact title tem 3 linhas
grep -c "contactTitleLine" components/home/ContactSection.tsx  # Expected: 3

# Footer tem "visite também"
grep -c "visitAlso" components/layout/HomeFooter.tsx           # Expected: >=1

# Peeking character não está centralizado
grep "justify-center" components/home/PeekingCharacter.tsx     # Expected: 0 (não deve ter justify-center)
grep "52.2%" components/home/PeekingCharacter.tsx              # Expected: >=1
```

### Pass Criteria

- [ ] Build exit 0
- [ ] Lint exit 0, 0 errors
- [ ] tsc exit 0
- [ ] Todos os componentes novos existem
- [ ] Crachá tem 6 partes (grep retorna valores esperados)
- [ ] Gallery tem estudos-cover.png
- [ ] Contact title tem 3 keys
- [ ] Footer tem visitAlso
- [ ] Peeking character usa 52.2% (não justify-center)

---

## Gate 4: Conteúdo/Páginas (após Plans 1-5)

**Comando:** `./scripts/check-quality-gates.sh 4`

### Verificações

| Check | Método | Expected |
|-------|--------|----------|
| Chaves i18n existem (pt-BR) | `python3 -c "import json; d=json.load(open('dictionaries/pt-BR.json')); ..."` | Todas as chaves novas presentes |
| Chaves i18n existem (en) | mesmo | Paridade com pt-BR |
| Chaves específicas requeridas | grep no JSON | `home.contactTitleLine1/2/3`, `nav.about`, `nav.projects`, `footer.visitAlso` |
| Assets existem | `ls public/images/home/*.svg public/illustrations/*.svg` | Todos os 20+ assets presentes |
| Assets são servidos | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/images/home/estudos-cover.png` | 200 |
| Página home renderiza | `curl -s http://localhost:3000/pt-BR \| grep -c "Olá a todos"` | >=1 |
| Página EN renderiza | `curl -s http://localhost:3000/en \| grep -i "hello\|hi"` | >=1 |
| Sem erros 500 | Verificar logs do dev server | Nenhuma página retorna 500 |
| Metadata correta | `curl -s http://localhost:3000/pt-BR \| grep "<title>"` | Título correto por locale |
| Hreflang correto | `curl -s http://localhost:3000/pt-BR \| grep "hreflang"` | pt-BR, en, x-default presentes |

### Verificação de dicionários (script completo)

```bash
python3 << 'EOF'
import json

ptbr = json.load(open('dictionaries/pt-BR.json'))
en = json.load(open('dictionaries/en.json'))

# Chaves obrigatórias para a nova home
required_home_keys = [
    'greeting', 'greetingAlt', 'intro',
    'philosophy', 'philosophyLead',
    'philosophyBody1', 'philosophyBody1Bold', 'philosophyBody1End',
    'philosophyBody2', 'philosophyBody2Bold1', 'philosophyBody2Mid',
    'philosophyBody2Bold2', 'philosophyBody2Mid2', 'philosophyBody2Bold3', 'philosophyBody2End',
    'studiesAlt', 'studiesDoodlesAlt', 'careerAlt',
    'contactTitleLine1', 'contactTitleLine2', 'contactTitleLine3',
    'contactSubtitle', 'contactIllustrationAlt',
    'crachaAlt', 'peekingAlt'
]

required_nav_keys = ['about', 'projects']
required_footer_keys = ['visitAlso', 'social']

errors = []

for key in required_home_keys:
    if key not in ptbr.get('home', {}):
        errors.append(f'pt-BR: home.{key} FALTA')
    if key not in en.get('home', {}):
        errors.append(f'en: home.{key} FALTA')

for key in required_nav_keys:
    if key not in ptbr.get('nav', {}):
        errors.append(f'pt-BR: nav.{key} FALTA')
    if key not in en.get('nav', {}):
        errors.append(f'en: nav.{key} FALTA')

for key in required_footer_keys:
    if key not in ptbr.get('footer', {}):
        errors.append(f'pt-BR: footer.{key} FALTA')
    if key not in en.get('footer', {}):
        errors.append(f'en: footer.{key} FALTA')

if errors:
    print('❌ ERROS DE DICIONÁRIO:')
    for e in errors:
        print(f'  {e}')
    exit(1)
else:
    print('✅ Todas as chaves de dicionário presentes em pt-BR e en')
EOF
```

### Pass Criteria

- [ ] Todas as chaves de dicionário presentes em pt-BR e en
- [ ] Todos os assets existem em `public/`
- [ ] Assets são servidos (HTTP 200)
- [ ] Página home renderiza em pt-BR e en
- [ ] Sem erros 500
- [ ] Metadata e hreflang corretos

---

## Gate 5: Runtime (após Plan 6)

**Comando:** `./scripts/check-quality-gates.sh 5`

### Verificações

| Check | Método | Expected |
|-------|--------|----------|
| Dev server inicia | `pnpm dev &` + `curl` | HTTP 200 em `/pt-BR` e `/en` |
| Troca de idioma funciona | Clicar PT/EN no LanguageSwitcher | URL muda para `/en` ou `/pt-BR` |
| Links do header funcionam | Clicar "sobre" e "projetos" | Navegação funciona |
| Links sociais funcionam | Clicar IG/IN no footer | Abre Instagram/LinkedIn em nova aba |
| Formulário valida | Submit vazio | Mensagens de erro aparecem |
| Formulário aceita input | Preencher e submeter | Sem erros de JS no console |
| Sem erros no console | DevTools → Console | 0 errors (warnings OK) |
| Sem erros de hydration | DevTools → Console | Nenhuma mensagem de hydration mismatch |
| Imagens carregam | DevTools → Network → Img | Todas 200, nenhuma 404 |
| Fontes carregam | DevTools → Network → Font | AM Novecento, Clother carregando via Typekit |
| Performance básica | Lighthouse (opcional) | Performance > 50 (mobile), > 70 (desktop) |

### Verificação de JavaScript (console)

Abrir DevTools → Console e verificar:

```
Expected: Zero erros vermelhos
Permitido: Warnings sobre React DevTools, Next.js dev mode, etc.
NÃO permitido: Erros de tipo, undefined, null pointer, failed to fetch, etc.
```

### Verificação de Network

Abrir DevTools → Network e verificar:

| Recurso | Expected |
|---------|----------|
| `/images/home/estudos-cover.png` | 200 (pode ser lento — 6.3MB) |
| `/images/home/doodles-azul.svg` | 200 |
| `/illustrations/ola-mao.svg` | 200 |
| `/illustrations/espiando.svg` | 200 |
| Typekit fonts | 200 (fonts.googleapis.com ou use.typekit.net) |
| Nenhuma imagem | 404 |

### Pass Criteria

- [ ] Dev server inicia sem erros
- [ ] Todas as páginas répondent 200
- [ ] Troca de idioma funciona
- [ ] Links funcionam
- [ ] Formulário valida e aceita input
- [ ] Zero erros no console
- [ ] Zero erros de hydration
- [ ] Todas as imagens carregam (200)
- [ ] Fontes carregam

---

## Gate 6: Pre-Merge (FINAL — após Plan 6)

**Comando:** `./scripts/check-quality-gates.sh 6`

### Verificações finais

| Check | Método | Expected |
|-------|--------|----------|
| Build de produção | `pnpm build` | Exit 0, todas as rotas geradas |
| Build sem warnings críticos | Verificar output do build | Apenas warnings aceitáveis |
| Todas as rotas funcionam | Testar cada rota em produção | 200 para todas |
| `/pt-BR` | curl | 200 |
| `/en` | curl | 200 |
| `/pt-BR/contato` | curl | 200 (usa Header/Footer antigos) |
| `/en/contato` | curl | 200 |
| Outras rotas | curl | 200 (não quebradas) |
| Git status limpo | `git status --porcelain` | Empty (tudo commitado) |
| Branch correta | `git branch --show-current` | `feature/new-home` |
| Commits organizados | `git log --oneline -15` | Commits descritivos, com Co-Authored-By |
| Documentação completa | `ls docs/superpowers/specs/2026-10-20-new-home-design-v2.md docs/superpowers/plans/2026-10-20-new-home-plan-*.md docs/superpowers/quality-gates/2026-10-20-new-home-quality-gates.md` | Todos existem |
| Spec v1 marcada como superseded | grep "superseded" spec v1 | Presente (opcional, mas recomendado) |

### Verificação de rotas (script completo)

```bash
#!/bin/bash
# Verificar todas as rotas em produção

pnpm build
pnpm start &
SERVER_PID=$!
sleep 5

ROUTES=(
  "/pt-BR"
  "/en"
  "/pt-BR/contato"
  "/en/contato"
  "/pt-BR/grafico"
  "/en/grafico"
  "/pt-BR/interacao"
  "/pt-BR/servicos"
  "/pt-BR/3d"
)

FAILED=0
for route in "${ROUTES[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$route")
  if [ "$status" == "200" ]; then
    echo "✅ $route → $status"
  else
    echo "❌ $route → $status"
    FAILED=$((FAILED + 1))
  fi
done

kill $SERVER_PID 2>/dev/null

echo ""
if [ $FAILED -eq 0 ]; then
  echo "✅ Todas as rotas funcionam"
  exit 0
else
  echo "❌ $FAILED rotas falharam"
  exit 1
fi
```

### Verificação de que outras páginas não quebraram

| Página | Usa Header antigo? | Usa Footer antigo? | Status |
|--------|-------------------|-------------------|--------|
| `/pt-BR/contato` | Sim (via HeaderRouter) | Sim (via FooterRouter) | ☐ Testado |
| `/pt-BR/grafico` | Sim | Sim | ☐ Testado |
| `/pt-BR/interacao` | Sim | Sim | ☐ Testado |
| `/pt-BR/servicos` | Sim | Sim | ☐ Testado |
| `/pt-BR/3d` | Sim | Sim | ☐ Testado |
| `/pt-BR/projetos/*` | Sim | Sim | ☐ Testado |

### Pass Criteria

- [ ] Build de produção exit 0
- [ ] Todas as rotas 200 (home + outras páginas)
- [ ] Git status limpo
- [ ] Branch `feature/new-home`
- [ ] Documentação completa (spec v2 + 6 plans + quality gates)
- [ ] Outras páginas não quebradas
- [ ] **Verificação visual manual 100% completa** (checklist acima)

---

## Matriz de Verificação Rápida

Para uma checagem rápida antes de cada commit, usar esta matriz:

| Momento | Comando rápido | O que verifica |
|---------|---------------|----------------|
| Antes de qualquer commit | `pnpm exec tsc --noEmit && pnpm lint` | Tipos + lint |
| Após mudar dicionários | `pnpm build` | Paridade pt-BR ↔ en |
| Após mudar componentes | `pnpm dev` + verificar visual | Visual não quebrou |
| Após Plan completo | `./scripts/check-quality-gates.sh 3 && ./scripts/check-quality-gates.sh 4` | Componentes + conteúdo |
| Final (após Plan 6) | `./scripts/check-quality-gates.sh 5 && ./scripts/check-quality-gates.sh 6` | Runtime + pre-merge |
| Sempre | Abrir Figma + implementação lado a lado | Fidelidade visual |

---

## Troubleshooting

### Problema: Build falha com erro de chave i18n faltando

**Causa:** Chave adicionada em pt-BR.json mas não em en.json (ou vice-versa).

**Solução:**
```bash
# Encontrar a chave faltando
pnpm build 2>&1 | grep "Property.*is missing"

# Adicionar em ambos os dicionários
# Verificar paridade
python3 -c "
import json
ptbr = json.load(open('dictionaries/pt-BR.json'))
en = json.load(open('dictionaries/en.json'))
# ... comparar recursivamente
"
```

### Problema: Imagem não aparece (404)

**Causa:** Asset não está em `public/` ou caminho errado.

**Solução:**
```bash
# Verificar se o arquivo existe
ls -la public/images/home/estudos-cover.png

# Verificar se está sendo servido
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/images/home/estudos-cover.png
# Expected: 200

# Se 404: verificar caminho no código vs caminho real
```

### Problema: Fonte não carrega (fallback visível)

**Causa:** Typekit não configurado ou `NEXT_PUBLIC_TYPEKIT_ID` faltando.

**Solução:**
```bash
# Verificar .env.local
cat .env.local 2>/dev/null || echo "Arquivo não existe"

# Verificar se a variável está sendo usada no layout
grep "TYPEKIT" app/[lang]/layout.tsx

# Se não tiver .env.local, copiar do example
cp .env.local.example .env.local
# Editar e adicionar NEXT_PUBLIC_TYPEKIT_ID
```

### Problema: Crachá partes não aparecem

**Causa:** Z-index errado, posição absoluta incorreta, ou asset faltando.

**Solução:**
```bash
# Verificar se todos os assets existem
for f in cracha-exclude.svg cracha-clip.png cracha-buraco.svg cracha-union.svg cracha-linha.svg; do
  echo -n "$f: "
  ls public/images/home/$f 2>/dev/null && echo "OK" || echo "FALTA"
done

# Verificar no DevTools se os <img> estão no DOM
# Inspecionar o grupo do crachá e contar os <img> filhos (deve ter 7+: base, clip, buraco, ellipse, union, 4× linha)
```

### Problema: Elipses não aparecem nas posições corretas

**Causa:** Coordenadas `top` calculadas erradas (relativo ao wrapper errado).

**Solução:**
- Verificar qual é o wrapper `relative` pai de cada elipse
- Calcular `top` como `Y_figma - Y_wrapper_top`
- Ajustar visualmente comparando com o Figma
- Em mobile, elipses devem estar ocultas (`hidden md:block`)

### Problema: Outras páginas quebradas (Header/Footer sumiu)

**Causa:** HeaderRouter/FooterRouter não detecta corretamente a home.

**Solução:**
```bash
# Verificar a lógica de detección de rota
grep -A5 "isHome" components/layout/HeaderRouter.tsx

# A home deve ser: /pt-BR ou /en (exatamente, sem trailing path)
# Outras páginas: /pt-BR/contato, /pt-BR/grafico, etc.

# Testar manualmente:
curl -s http://localhost:3000/pt-BR | grep -c "HomeHeader\|home-header"
curl -s http://localhost:3000/pt-BR/contato | grep -c "categoryTabs\|Gráfico"
```

---

## Registro de Execução

Preencher após executar os quality gates:

### Gate de Verificação Visual
- [ ] **Data:** ___/___/___
- [ ] **Verificador:** _______________
- [ ] **Desktop (1728px):** ☐ PASS / ☐ FAIL
- [ ] **EN (1728px):** ☐ PASS / ☐ FAIL
- [ ] **Mobile (375px):** ☐ PASS / ☐ FAIL
- [ ] **Notas:** _______________

### Gate 3: Componentes
- [ ] **Data:** ___/___/___
- [ ] **Resultado:** ☐ PASS / ☐ FAIL
- [ ] **Build:** ☐ / ☐ Lint: ☐ / ☐ tsc: ☐
- [ ] **Notas:** _______________

### Gate 4: Conteúdo
- [ ] **Data:** ___/___/___
- [ ] **Resultado:** ☐ PASS / ☐ FAIL
- [ ] **Dicionários:** ☐ pt-BR / ☐ en
- [ ] **Assets:** ☐ Todos 200
- [ ] **Notas:** _______________

### Gate 5: Runtime
- [ ] **Data:** ___/___/___
- [ ] **Resultado:** ☐ PASS / ☐ FAIL
- [ ] **Console errors:** 0 ☐
- [ ] **Formulário:** ☐ Valida / ☐ Envia
- [ ] **Notas:** _______________

### Gate 6: Pre-Merge
- [ ] **Data:** ___/___/___
- [ ] **Resultado:** ☐ PASS / ☐ FAIL
- [ ] **Todas as rotas:** ☐ 200
- [ ] **Git limpo:** ☐
- [ ] **Notas:** _______________

---

## Definition of Done

A feature só está **DONE** quando TODOS estes itens estão marcados:

- [ ] Spec v2 completa e revisada
- [ ] 6 plans escritos e revisados
- [ ] Quality gates doc completo (este arquivo)
- [ ] Todas as 6 plans executados
- [ ] Build de produção passa
- [ ] Lint passa (0 errors)
- [ ] TypeScript passa (`tsc --noEmit`)
- [ ] Gate 3 (Componentes) PASS
- [ ] Gate 4 (Conteúdo) PASS
- [ ] Gate 5 (Runtime) PASS
- [ ] Gate 6 (Pre-Merge) PASS
- [ ] **Verificação visual manual 100%** (checklist completo acima)
- [ ] Desktop PT verificado (1728px)
- [ ] Desktop EN verificado (1728px)
- [ ] Mobile verificado (375px)
- [ ] Zero elementos do design antigo
- [ ] ContactForm intacto (não modificado)
- [ ] Outras páginas funcionando
- [ ] Git status limpo (tudo commitado)
- [ ] Branch `feature/new-home` atualizada
