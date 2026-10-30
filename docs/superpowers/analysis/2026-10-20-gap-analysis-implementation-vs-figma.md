# Análise de Gaps: Implementação Atual vs Figma Pontossemno

**Data:** 2026-10-20
**Branch:** `feature/new-home`
**Implementação analisada:** Commits `891305c` a `3c47fe4` (8 commits)
**Figma:** https://www.figma.com/design/gpvzpeRYWxlqqonbHdj88g/Pontossemno?node-id=751-1318 (canvas 1728×4614)
**Método:** Análise do HTML renderizado + comparação com coordenadas exatas do Figma (via `get_metadata`)

---

## Resumo Executivo

A implementação atual (v1) tentou seguir o design Figma mas tem **9 gaps críticos** que precisam ser corrigidos. A spec v2 (`2026-10-20-new-home-design-v2.md`) e os 6 plans detalham como corrigir cada um.

| Métrica | Valor |
|---------|-------|
| Gaps críticos (🔴) | 9 |
| Gaps altos (🟡) | 2 |
| Elementos ausentes | 8 |
| Elementos do design antigo presentes | 4+ |
| Taxa de fidelidade visual estimada | ~40% |

---

## 1. Header — 🔴 CRÍTICO (Mistura design antigo/novo)

### Figma (node nav bar, y=0–102)
| Especificação | Valor |
|-------------|-------|
| Altura | 102px |
| Fundo | Cream `#F9F3EA` sólido |
| Links | **Apenas 2**: "About" (x=120) e "Projects" (x=1310) |
| Fonte | AM Novecento 32px `#BACCEB` lowercase |
| Padding | 120px horizontal |

### Implementação Atual
| Especificação | Valor | Status |
|-------------|-------|--------|
| Altura | Variável (py-4) | ❌ Diferente |
| Fundo | Cream com blur + sticky | ❌ Diferente |
| Links | **6 links**: Sobre mim, Solicitar serviços, Gráfico, Interação, Serviços, 3D | ❌ **ERRADO** — design antigo |
| Category tabs | Gráfico, Interação, Serviços, 3D | ❌ **DESIGN ANTIGO** |
| Fonte | Clother (não AM Novecento) | ❌ Diferente |
| LanguageSwitcher | Presente (PT/EN) | ✅ OK (manter) |

### Gap
O Header atual é **completamente diferente** do Figma. Aindaaz mantém a estrutura do design antigo (category tabs, múltiplos links) misturada com o novo design.

### Correção (Spec v2 §4.1, Plan 1)
- Criar `HomeHeader.tsx` separado
- 102px altura, cream sólido, sem blur
- Apenas "sobre" (esquerda) + "projetos" (direita)
- AM Novecento 32px `#BACCEB` lowercase
- LanguageSwitcher no centro
- Outras páginas continuam com Header antigo (via HeaderRouter)

---

## 2. Hero Band — 🟡 ALTO (Ajustes finos)

### Figma (y=102–354)
| Especificação | Valor |
|-------------|-------|
| Altura | **252px** @1728 = 14.58vw |
| Gradiente | **-62.1°** |
| Cores | `#BACCEB` → `#6F96CE` → `#08488F` |
| Título | 209.886px AM Novecento cream, preenchendo largura |
| Overflow | Clip (letras cortadas na borda inferior) |

### Implementação Atual
| Especificação | Valor | Status |
|-------------|-------|--------|
| Altura | `clamp(168px, 17.5vw, 290px)` | ❌ **17.5vw vs 14.58vw** |
| Gradiente | -70.88° (`.bg-band`) | ❌ **Ângulo errado** |
| Título | SVG getBBox-fit | ✅ OK (abordagem correta) |
| Overflow | `overflow-hidden` | ✅ OK |

### Gap
- Altura: 17.5vw é **20% maior** que o Figma (14.58vw)
- Gradiente: -70.88° é **mais vertical** que o Figma (-62.1°)

### Correção (Spec v2 §4.2, Plan 1 Task 3)
- Mudar altura para `h-[14.58vw]` com `min-h-[168px]`
- Criar `.bg-hero` com gradiente -62.1°

---

## 3. Texto ":d" — 🔴 CRÍTICO (Tamanho e posição errados)

### Figma (node `:d` text)
| Especificação | Valor |
|-------------|-------|
| Posição | **x=819, y=499** (entre hero e greeting) |
| Tamanho | **338.2px** (19.57vw) |
| Fonte | AM Novecento |
| Cor | `#BACCEB` (azul gelo) |
| Posicionamento | **Absolute na página** (não dentro de section) |

### Implementação Atual
| Especificação | Valor | Status |
|-------------|-------|--------|
| Posição | Dentro da GreetingSection, acima do título | ❌ **Dentro da section** |
| Tamanho | `text-[3.5rem]` = **56px** | ❌ **6× menor!** |
| Cor | `var(--color-blue)` (#6F96CE) | ❌ Cor errada |
| Texto | ":D" (maiúsculo) | ⚠️ Figma usa ":d" (minúsculo) |

### Gap
- **Tamanho:** 56px vs 338px — é um emoji pequeno, não um elemento gigante
- **Posição:** Dentro da section vs absolute na página entre hero e greeting
- **Cor:** Azul médio vs azul gelo

### Correção (Spec v2 §4.3, Plan 2 Task 2)
- Mover para `page.tsx` como elemento absolute no wrapper `relative`
- Tamanho: `clamp(120px, 19.57vw, 338px)`
- Cor: `text-[color:var(--color-blue-soft)]` (#BACCEB)
- Posição: `left: 47.4%`, `top: 145px` (relativo ao wrapper após hero)
- `aria-hidden="true"`, `pointer-events-none`

---

## 4. Greeting Section — 🔴 CRÍTICO (Elemento ausente + tamanhos errados)

### Figma
| Elemento | Especificação |
|----------|--------------|
| Ilustração ola.svg | x=260, y=557, **513×477** |
| **Mão acenando ola-mao.svg** | x=121, y=882, **215×248**, rotate **-4.66°** |
| Título "Olá a todos," | x=1031, y=575, **120px**, 2 linhas, `#6F96CE` |
| Intro | x=843, y=948, w=648, **26px** Clother Light, **justificado**, 2 parágrafos |
| Elipse rosa | 695×695 at x=1394, y=436 |

### Implementação Atual
| Elemento | Implementado | Status |
|----------|-------------|--------|
| Ilustração ola.svg | Sim, `max-w-[400px]` | ⚠️ Tamanho menor (400 vs 513) |
| **Mão acenando ola-mao.svg** | **NÃO** | ❌ **AUSENTE** |
| Título | `text-[2.5rem] md:text-[4rem]` (40/64px) | ❌ **2× menor que 120px** |
| Intro | `text-lg md:text-xl` (18/20px) | ❌ **Menor que 26px** |
| Justificado | Não | ❌ Falta `text-justify` |
| Elipse rosa | Posicionada relativa à section | ⚠️ Não segue coordenadas absolutas |

### Gap
- **Mão acenando ausente:** O asset `ola-mao.svg` foi baixado mas **nunca usado**
- **Tamanhos de fonte:** Título 64px vs 120px (quase metade), intro 20px vs 26px
- **Justificado:** Falta `text-justify`
- **Posição da elipse:** Relativa à section vs absolute na página

### Correção (Spec v2 §4.4, Plan 2 Task 1)
- Adicionar `<img src="/illustrations/ola-mao.svg">` como overlay absolute sobre ola.svg
- Título: `text-[clamp(3rem,6.94vw,7.5rem)]` (120px @1728)
- Intro: `text-[1.625rem]` (26px) + `text-justify` + `max-w-[648px]`
- Elipse: absolute no wrapper da página (x=80.6%, y=82px relativo ao wrapper)

---

## 5. Philosophy Section — 🔴 CRÍTICO (Crachá incompleto)

### Figma — Crachá (Group 100805)
| Especificação | Valor |
|-------------|-------|
| Grupo | x=1259, y=1237, **377×506**, rotate **15.24°** |
| Parte 1: Base (exclude) | 361×448 at offset (-9, 56) |
| Parte 2: Clip | 361px wide at offset (-9, 56), z-10 |
| Parte 3: Buraco (hole) | 102×102 at offset (73, 101) |
| Parte 4: Ellipse 378 | 124×115 at offset (132, 69) |
| **Parte 5: Union** | **125×145 at offset (108, 28)** |
| **Parte 6: 4× Linha** | **169×44.6 cada at offsets (244/285/326/367), rotate 14.8°** |
| Texto typewriter | "Acredito que o design é" 23px (dentro do SVG) |

### Implementação Atual — Crachá
| Parte | Implementado | Status |
|-------|-------------|--------|
| Base (exclude) | Sim | ✅ |
| Clip | Sim | ✅ |
| Buraco | Sim | ✅ |
| Ellipse interna | **Não** (div simples ausente) | ❌ **AUSENTE** |
| **Union (cracha-union.svg)** | **NÃO** | ❌ **AUSENTE** |
| **4× Linha (cracha-linha.svg)** | **NÃO** | ❌ **AUSENTE** |
| Rotação | `rotate-[15deg]` | ⚠️ 15° vs 15.24° (próximo, mas não exato) |
| Texto typewriter | Dentro do SVG | ✅ |

### Gap
- **Crachá incompleto:** Faltam 3 partes (ellipse interna, union, 4 linhas)
- **Assets baixados mas não usados:** `cracha-union.svg` e `cracha-linha.svg` estão em `public/images/home/` mas nunca referenciados no código
- **Rotação:** 15° vs 15.24° (diferença pequena mas perceptível)

### Figma — Textos da Philosophy
| Elemento | Figma | Atual |
|----------|-------|-------|
| Título "Filosofia" | 120px | 40/64px ❌ |
| Lead | 32px Bold justificado | 24/32px sem justify ❌ |
| Body1 | 26px justificado | 18/24px sem justify ❌ |
| Body2 | 26px justificado | 18/24px sem justify ❌ |

### Figma — Elipses da Philosophy
| Elipse | Figma | Atual |
|--------|-------|-------|
| 758:298 (cyan 455px) | x=27, y=1125 | Posicionada relativa à section ❌ |
| 758:112 (cyan 879px) | x=581, y=1608 | Posicionada relativa à section ❌ |

### Correção (Spec v2 §4.5, Plan 3 Task 1)
- Reescrever `Cracha` component com TODAS as 6 partes
- Adicionar `cracha-union.svg` (left=108px, top=28px)
- Adicionar 4× `cracha-linha.svg` (tops: 244, 285, 326, 367px, rotate 14.8°)
- Adicionar ellipse interna (div rounded-full, 124×115)
- Rotação: `rotate(15.24deg)` exata
- Textos: 120px título, 32px lead bold justificado, 26px body justificado
- Elipses: absolute no wrapper da página (não na section)

---

## 6. Peeking Character — 🟡 ALTO (Posição errada)

### Figma (Group 100804)
| Especificação | Valor |
|-------------|-------|
| Posição | **x=901.7, y=1894** |
| Porcentagem | **52.2% from left** |
| Tamanho | **676×361** |
| Overlap com galeria | Bottom (2255) - Gallery top (2234) = **~21px** |

### Implementação Atual
| Especificação | Valor | Status |
|-------------|-------|--------|
| Posição | `flex justify-center` (centralizado) | ❌ **Centralizado vs 52.2%** |
| Largura | `max-w-[500px]` | ❌ **500px vs 676px** |
| Overlap | `-mb-[80px]` | ❌ **80px vs 21px** (4× maior) |
| Z-index | `z-10` | ✅ OK |
| Mobile | `hidden md:block` | ✅ OK |

### Gap
- **Posição horizontal:** Centralizado vs 52.2% from left (deveria estar à direita do centro)
- **Tamanho:** 500px vs 676px (26% menor)
- **Overlap:** 80px vs 21px (personagem "afunda" muito na galeria)

### Correção (Spec v2 §4.6, Plan 4 Task 2)
```tsx
<img
  src="/illustrations/espiando.svg"
  className="-mb-[21px]"
  style={{
    marginLeft: "52.2%",
    width: "676px",
    maxWidth: "none",
  }}
/>
```

---

## 7. Studies Gallery — 🔴 CRÍTICO (Layering errado)

### Figma — Célula Rosa (Frame 8, x=0, y=2234, 1152×558, bg #F9CEDC)
**DUAS CAMADAS OBRIGATÓRIAS:**

| Camada | Asset | Especificação |
|--------|-------|--------------|
| 1 (fundo) | `estudos-coelhos.png` | h=161.56%, top=-8.61%, left=-1.36%, w=117.38% |
| 2 (topo, **VISÍVEL**) | `estudos-cover.png` | 1727×558 at x=-95, y=0.18, object-cover |

### Implementação Atual — Célula Rosa
| Camada | Implementado | Status |
|--------|-------------|--------|
| Fundo (coelhos) | Sim, `object-cover` simples | ⚠️ Sem as proporções exatas (161.56% etc.) |
| **Cover (visível)** | **NÃO** | ❌ **AUSENTE — asset não usado!** |

### Figma — Célula Azul (Frame 10, x=0, y=2793, 1152×558, bg #6F96CE)
| Asset | Especificação |
|-------|--------------|
| `carreira-baleia.png` | h=153.99%, top=-28.29%, left=-4.16%, w=110.24% |

### Implementação Atual — Célula Azul
| Especificação | Valor | Status |
|-------------|-------|--------|
| Baleia | `-left-[4%] top-[-28%] h-[154%] w-[110%]` | ✅ **OK** (valores próximos) |

### Figma — Sidebar (Frame 9, x=1152, y=2234, 576×1117)
| Asset | Especificação |
|-------|--------------|
| `doodles-azul.svg` | 576×1117, tem gradiente próprio, object-cover |

### Implementação Atual — Sidebar
| Especificação | Valor | Status |
|-------------|-------|--------|
| Doodles | `absolute inset-0 h-full w-full object-cover` | ✅ OK |

### Gap
- **Célula rosa ERRADA:** Mostra apenas coelhos como `object-cover` simples
- **Cover ausente:** O `estudos-cover.png` (6.3MB, a imagem principal!) **nunca é usado**
- **Resultado visual:** A célula rosa mostra coelhos em vez da capa (paisagem colorida)

### Correção (Spec v2 §4.7, Plan 4 Task 1)
```tsx
{/* Célula Rosa — 2 CAMADAS */}
<div className="relative h-[558px] overflow-hidden bg-[#F9CEDC]">
  {/* Camada 1: coelhos (fundo) */}
  <img
    src="/images/home/estudos-coelhos.png"
    className="absolute"
    style={{ height: "161.56%", top: "-8.61%", left: "-1.36%", width: "117.38%", objectFit: "cover" }}
    alt=""
    aria-hidden
  />
  {/* Camada 2: cover (VISÍVEL — por cima!) */}
  <img
    src="/images/home/estudos-cover.png"
    className="absolute"
    style={{ left: "-95px", top: "0.18px", width: "1727px", height: "558px", objectFit: "cover" }}
    alt={home.studiesAlt}
  />
</div>
```

---

## 8. Contact Section — 🔴 CRÍTICO (Título errado)

### Figma (heading block x=891, y=3522, 511×351)
| Linha | Texto | Tamanho | Fonte |
|-------|-------|---------|-------|
| 1 | "vAMOS" | **120px** | AM Novecento uppercase |
| 2 | "TRABALHAR" | **72px** | AM Novecento uppercase |
| 3 | "JUNTOS?" | **72px** | AM Novecento uppercase |

**Total: 3 LINHAS** (não 2!)

### Implementação Atual
| Especificação | Valor | Status |
|-------------|-------|--------|
| Linhas | **2 spans** | ❌ **Deveria ser 3** |
| Linha 1 | "Vamos" `text-[2.5rem] md:text-[4.5rem]` | ❌ Texto errado + tamanho errado |
| Linha 2 | "trabalhar juntos?" `text-[1.75rem] md:text-[2.75rem]` | ❌ Deveria ser 2 linhas separadas |
| Hierarquia | 72px / 44px | ❌ Deveria ser 120px / 72px / 72px |

### Figma — Outros elementos
| Elemento | Figma | Atual | Status |
|----------|-------|-------|--------|
| Ilustração contato.svg | 555×676 | `max-w-[380px]` | ⚠️ Menor |
| Envelope overlay | x=312-254=58, y=3814-3437=377, rot 0.51° | `right-0 bottom-4 w-[120px]` | ❌ Posição errada |
| Subtítulo | 24px | `text-[1.125rem] md:text-[1.5rem]` | ✅ OK (24px) |
| ContactForm | — | Reutilizado intacto | ✅ OK |
| Elipse 758:110 | 455px at x=1131 (65.4%) | Posicionada relativa à section | ❌ Não absolute |
| Elipse 758:111 | 695px at x=74 (4.3%) | Posicionada relativa à section | ❌ Não absolute |

### Gap
- **Título split errado:** 2 linhas em vez de 3, textos diferentes, hierarquia errada
- **Envelope:** Posição relativa (`right-0 bottom-4`) vs coordenadas exatas (left=58, top=377)
- **Elipses:** Relativas à section vs absolute na página

### Correção (Spec v2 §4.8, Plan 5)
- 3 dictionary keys: `contactTitleLine1` ("vAMOS"), `contactTitleLine2` ("TRABALHAR"), `contactTitleLine3` ("JUNTOS?")
- 3 spans no JSX com tamanhos `clamp(3rem,6.94vw,7.5rem)` / `clamp(1.875rem,4.17vw,4.5rem)` / `clamp(1.875rem,4.17vw,4.5rem)`
- Envelope: `left: 58px, top: 377px, rotate(0.51deg)`
- Elipses: absolute no wrapper da página

---

## 9. Footer — 🔴 CRÍTICO ("visite também" ausente)

### Figma (y=4345–4614, 269px)
| Elemento | Especificação |
|----------|--------------|
| Altura | **269px** |
| Gradiente | **-63.62°** |
| **"visite também"** | **120px AM Novecento cream, x=1, y=-45 (transborda ACIMA)** |
| "Redes sociais" | 24px Clother Regular cream, x=28, y=109 |
| IG row | "IG" (16px Regular) + "@aggy_colon" (16px Light, underline) |
| IN row | "IN" + "Ágatha Ferreira" |
| Gap label↔handle | 16px |
| Gap entre rows | 8px |

### Implementação Atual
| Elemento | Valor | Status |
|----------|-------|--------|
| Altura | Automática (py-10) | ❌ Não 269px fixo |
| Gradiente | -70.88° (`.bg-band`) | ❌ Ângulo errado |
| **"visite também"** | **AUSENTE** | ❌ **CRÍTICO** |
| "Redes sociais" | 16px (text-base) | ❌ Deveria ser 24px |
| IG/IN rows | 16px | ✅ OK (tamanho) |
| Gap label↔handle | gap-3 (12px) | ❌ Deveria ser 16px (gap-4) |
| Gap entre rows | gap-1 (4px) | ❌ Deveria ser 8px (gap-2) |
| Margem top | `mt-20` (80px) | ⚠️ Figma não especifica, mas visual pode diferir |

### Gap
- **"visite também" 120px ausente:** O elemento mais marcante do footer do Figma não foi implementado
- **Transbordamento:** O texto deve sair para cima do band (y=-45), requer `overflow: visible`
- **Tamanhos:** "Redes sociais" deveria ser 24px (não 16px)
- **Espaçamentos:** Gaps menores que o Figma

### Correção (Spec v2 §4.9, Plan 6 Task 2)
- Criar `HomeFooter.tsx`
- Altura fixa 269px
- Gradiente -63.62° (inline style ou nova utility class)
- `<h2>` com `top: -45px`, `left: 1px`, `fontSize: clamp(3rem, 6.94vw, 7.5rem)`
- `overflow-visible` no footer
- "Redes sociais" 24px (text-[1.5rem])
- Gaps: gap-4 (label↔handle), gap-2 (entre rows)
- Outras páginas continuam com Footer antigo (via FooterRouter)

---

## 10. Elementos do Design Antigo — 🔴 CRÍTICO (Ainda presentes)

Estes elementos **não deberían aparecer** na home page (são do design antigo):

| Elemento | Onde aparece | Origem |
|----------|-------------|--------|
| Category tabs (Gráfico, Interação, Serviços, 3D) | Header | `lib/site.ts` `categoryTabs` |
| Links "Sobre mim", "Solicitar serviços" | Header | `lib/site.ts` `navLinks` |
| "Ilustração da Ágatha sentada" | ??? (aparece no HTML) | Verificar código |
| "Ilustração da Ágatha pensando" | ??? (aparece no HTML) | Verificar código |
| "Experiência" | ??? (aparece no HTML) | Verificar código |
| "currículo" | ??? (aparece no HTML) | Verificar código |
| "LinkedIn" | ??? (aparece no HTML) | Verificar código |

### Correção
- **Plan 1:** Reescrever Header (remove category tabs e links antigos)
- **Plan 6 Task 4:** Verificação final — buscar e remover qualquer resquício

---

## 11. Elementos Ausentes — Lista Completa

Presentes no Figma mas **não implementados** na v1:

| # | Elemento | Asset/Origem | Impacto | Correção |
|---|----------|-----------|---------|----------|
| 1 | **Mão acenando** | `/illustrations/ola-mao.svg` | 🔴 Alto — personagem parece "flutuando" sem mão | Plan 2 |
| 2 | **Cover da galeria** | `/images/home/estudos-cover.png` | 🔴 Crítico — imagem errada na célula rosa | Plan 4 |
| 3 | **Union do crachá** | `/images/home/cracha-union.svg` | 🔴 Alto — crachá incompleto | Plan 3 |
| 4 | **4 linhas do crachá** | `/images/home/cracha-linha.svg` ×4 | 🔴 Alto — crachá incompleto | Plan 3 |
| 5 | **Ellipse interna do crachá** | (div ou SVG) | 🟡 Médio — detalhe faltando | Plan 3 |
| 6 | **"visite também" gigante** | Dictionary `footer.visitAlso` | 🔴 Crítico — footer incompleto | Plan 6 |
| 7 | **Navegação Figma-style** | "about"/"projects" apenas | 🔴 Crítico — header errado | Plan 1 |
| 8 | **":d" gigante** | Texto decorativo | 🔴 Crítico — tamanho/posição errados | Plan 2 |

---

## 12. Tabela Resumo de Gaps

| # | Componente | Gap Principal | Severidade | Plan |
|---|-----------|---------------|-----------|------|
| 1 | Header | 6 links + category tabs vs 2 links | 🔴 Crítico | 1 |
| 2 | Hero | Altura 17.5vw vs 14.58vw; gradiente -70.88° vs -62.1° | 🟡 Alto | 1 |
| 3 | `:d` | 56px dentro da section vs 338px absolute | 🔴 Crítico | 2 |
| 4 | Greeting | Mão acenando ausente; título 64px vs 120px; intro 20px vs 26px | 🔴 Crítico | 2 |
| 5 | Philosophy | Crachá sem union e 4 linhas; elipses mal posicionadas | 🔴 Crítico | 3 |
| 6 | Peeking | Centralizado vs 52.2%; 500px vs 676px; overlap 80px vs 21px | 🟡 Alto | 4 |
| 7 | Gallery | Célula rosa sem cover (só coelhos); cover não usado | 🔴 Crítico | 4 |
| 8 | Contact | Título 2 linhas vs 3; envelope posição errada; elipses relativas | 🔴 Crítico | 5 |
| 9 | Footer | "visite também" 120px ausente; gradiente errado; tamanhos errados | 🔴 Crítico | 6 |
| 10 | Geral | Elementos do design antigo presentes (category tabs, links, imagens) | 🔴 Crítico | 6 |
| 11 | Elipses | Todas posicionadas relativas às sections vs coordenadas absolutas da página | 🟡 Alto | 2,3,5 |
| 12 | Tipografia | Tamanhos de fonte consistentemente menores que o Figma (40-64px vs 120px, etc.) | 🔴 Crítico | 2,3,5 |

---

## 13. Métricas de Fidelidade

### Estimativa visual por seção (0-100%)

| Seção | Fidelidade v1 | Meta v2 |
|-------|--------------|---------|
| Header | 10% | 100% |
| Hero | 70% | 100% |
| `:d` | 5% | 100% |
| Greeting | 40% | 100% |
| Philosophy (textos) | 50% | 100% |
| Philosophy (crachá) | 40% | 100% |
| Peeking | 50% | 100% |
| Gallery | 30% | 100% |
| Contact | 50% | 100% |
| Footer | 30% | 100% |
| **Média geral** | **~38%** | **100%** |

### Por que a fidelidade é baixa?

1. **Escala incorreta:** A maioria dos textos está em ~50-60% do tamanho do Figma
2. **Elementos ausentes:** 8 elementos do Figma não foram implementados
3. **Design antigo:** Mistura de componentes antigos (Header, category tabs) com novos
4. **Posicionamento:** Elementos decorativos não seguem coordenadas absolutas do Figma
5. **Assets não usados:** 2 assets importantes baixados mas nunca referenciados (ola-mao.svg, estudos-cover.png, cracha-union.svg, cracha-linha.svg)

---

## 14. Lições Aprendidas (para o próximo implementador)

1. **Sempre usar coordenadas exatas do Figma:** Não "aproximar" — usar os valores exatos (338.2px, 15.24°, etc.)
2. **Verificar TODOS os assets baixados são usados:** 4 assets foram baixados mas esquecidos
3. **Não assumir tamanhos "raciocinados":** O Figma diz 120px, usar 120px (ou vw equivalente), não 64px
4. **Posicionamento absoluto na página:** Elementos decorativos que no Figma têm coordenadas X,Y absolutas devem ser absolute no wrapper da página, não relativo à section
5. **Camadas de imagem:** Quando o Figma mostra múltiplas camadas (como na célula rosa), implementar TODAS as camadas na ordem correta
6. **Verificação visual lado a lado:** Sempre comparar com o Figma em 1728px, seção por seção
7. **Design antigo vs novo:** Ao reescrever, garantir que ZERO elementos do design antigo permanecem

---

## 15. Próximos Passos

1. **Ler a Spec v2 completa:** `docs/superpowers/specs/2026-10-20-new-home-design-v2.md`
2. **Executar os 6 plans em ordem:**
   - Plan 1: Header + Hero
   - Plan 2: Greeting + `:d`
   - Plan 3: Philosophy + Crachá
   - Plan 4: Gallery + Peeking
   - Plan 5: Contact
   - Plan 6: Footer + Verificação Final
3. **Usar os Quality Gates:** `docs/superpowers/quality-gates/2026-10-20-new-home-quality-gates.md`
4. **Verificação visual obrigatória:** Checklist completo no quality gates doc

---

## Referências

- Spec v2: `docs/superpowers/specs/2026-10-20-new-home-design-v2.md`
- Spec v1 (superseded): `docs/superpowers/specs/2026-10-20-new-home-design.md`
- Plans: `docs/superpowers/plans/2026-10-20-new-home-plan-{1..6}-*.md`
- Quality Gates: `docs/superpowers/quality-gates/2026-10-20-new-home-quality-gates.md`
- Figma: https://www.figma.com/design/gpvzpeRYWxlqqonbHdj88g/Pontossemno?node-id=751-1318
