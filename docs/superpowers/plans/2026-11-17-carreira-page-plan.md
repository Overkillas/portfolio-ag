# Plano — página "Minha carreira" (`/carreira`)

## Contexto

A Ágatha desenhou a página "Minha carreira" no Figma `EGDJU9UG5XmLO6zV8Howwo`, frame `201:53`
(1728 × 7166, o mesmo arquivo do Estudos). Hoje o card "Minha carreira no design" da home abre o
LinkedIn. O objetivo é ter uma página **fiel ao Figma**, seguindo as regras de
`Agatha Portfolio — Figma Fidelity Rules`: valores exatos, PNG @2x achatado para arte com grão e
sombra, nenhum texto dentro de imagem, nenhuma sombra ou filtro CSS na arte, e repouso = Figma.
A única exceção pedida é a **boneca tricotando** da seção "vidinha", que ganha animação.

### Decisões do André (não reabrir)

| Tema | Decisão |
|---|---|
| Fio / coisinhas | O fio é o cachecol listrado que sai da caixinha. As coisinhas são os pills Monitoria, Extensão, Estágio, Oficinas e Publicações acadêmicas, e cada um surge quando o fio passa por ele |
| Ciclo | Roda **uma vez**, quando a cena entra na tela. As mãos mexem enquanto o fio sai e param no fim, e o estado final é igual ao Figma |
| Manivela | **Gira junto** com as mãos, então vira uma camada separada |
| Responsivo | Escala proporcional (desktop/tablet) e **layout empilhado no celular**, proposto por mim e revisado por ele |
| Rota | `/pt-BR/carreira` e `/en/carreira`. O card "Minha carreira no design" da home passa a abrir a página |
| Top bar | "<" volta para a home (Sobre mim). "projects" com o sininho vai para `/projetos`. O LanguageSwitcher fica no centro, por regra do AGENTS.md |
| Camadas da boneca | Eu recomponho a partir das exportações por camada do Figma via MCP, **sem editar o arquivo**, e valido no pixel |
| "olhar_loop", "nuvens_loop", "turntable" | **Estáticas**, os PNGs do Figma |

## Mapa do Figma (frame 201:53)

| y (px) | Seção | Nós |
|---|---|---|
| 40 | Top bar: "<" em x=187, "Projects" + sininho em x=1300 (coluna de 1353 centrada) | 201:341, 201:346 (sininho 201:347, girado 57.39°) |
| 44–1082 | Hero: boneca turntable 751², nuvem girada 7.66°, maçã "Object", h1 "como vim parar aqui?" (AM Novecento 111.975px), doodle de nuvem, 3 colunas de 378px com gap de 126 | 201:340, 201:356, 201:528, 201:357, 201:406, 201:394 (395/396/397) |
| 1167 | Faixa 1: silhueta azul (864) + rosto na janela azul `#bacceb` | 201:162 (201:163, 201:202 + olhar_loop 201:242) |
| 1663 | Faixa 2: janelas de trem (máscaras, gradientes, grão) | 201:77 + 201:122 |
| 2184 | 3 pills "Próxima parada" de 400 × 48, gap 164 | 201:361 |
| 2348–3272 | "uma breve história da arte..." (100px), pills 01–05 + parágrafos, água-viva, botões, maçãs | 201:358, 201:386/390/374/378/382, 201:526/527/54/398/525, 201:399, 201:582, 201:575, 201:55, 201:529, 201:530 |
| 3225–3942 | "vidinha" + coelho + parágrafo. **Cena da boneca**: boneca 201:476, caixa com manivela 201:506, cachecol 201:515, pills 201:555/559/563/567/571 | 201:359, 201:409, 201:524, 201:475 |
| 4035 | Faixa 3 (espelhada): rosto na janela rosa `#fadae7` + silhueta rosa | 201:243 |
| 4605–5450 | "hora do desenho", tartaruga, lousa mágica rosa, parágrafo, 8 cubos de ferramentas | 201:360, 201:324, 201:413, 201:531, 201:621 |
| 5543–6837 | "life gallery" (80px), fantasminha, 16 fotos com recorte e rotação, joaninha, 3 textos | 201:592 (fotos 201:601–616), 201:617, 201:532 |
| 6897 | Rodapé "visite também", alinhado à direita | 201:64, que é o `HomeFooter` existente |

**Não implementar:** `201:76`, "Vector 1319", que fica fora do canvas (x=2255). As anotações
"Contato" e "O que acredito" são sobras copiadas da home e não viram código.

## Arquitetura (arquivos)

### Rota e roteamento
- **Novo** `app/[lang]/carreira/page.tsx`, no padrão de `app/[lang]/estudos/page.tsx`:
  - `await params` → `isLocale` → `notFound()` → `getDictionary`
  - `generateMetadata` com `dict.metadata.career` e as três entradas de `alternates.languages`
  - renderiza `<CareerView dict locale top={<CaseTopBar variant="career" …/>} />`
- `components/layout/HeaderRouter.tsx`: adicionar `isCareer = segments.length === 1 && segments[0] === 'carreira'`, que retorna `null` como o Estudos.
- `components/layout/FooterRouter.tsx`: `isCareer` → `<HomeFooter dict={dict} visitAlign="right" />`. O "visite também" fica à direita (x=919 no Figma). A pílula "voltar ao topo" continua, como em todas as páginas novas.
- `components/case-study/CaseTopBar.tsx`: nova variante `career`. Trocar os ternários `about ? … : …` por um mapa por variante `{ backHref, backLabel, href, label, text, bell }`:
  - `career` → back para `/${locale}` com `dict.career.back`
  - label `dict.nav.homeProjects` → `/${locale}/projetos`
  - geometria do texto e do sininho medida em 201:346/201:347 e conferida no render 1:1, como as variantes existentes
  - `projects` e `about` continuam com o mesmo comportamento
- `components/home/StudiesGallery.tsx`: o card `career` deixa de ser `<a href={linkedin} target=_blank>` e vira `<Link href={`/${locale}/carreira`}>`, igual ao card de Estudos. Remover `target` e `rel`.

### Componentes (novo `components/career/`)
- `CareerView.tsx` (server): wrapper `relative` com `overflow-x: clip`. Monta as seções e a `top` bar dentro da coluna de 1352.
- `career.module.css`:
  - o container define `container-type: inline-size`
  - os filhos usam `--u: calc(100cqw / 1728)` e todos os valores são `calc(var(--u) * <px do Figma>)`
  - o `--u` só funciona nos **filhos** do container (gotcha documentado)
  - 1:1 em 1728, e escala para cima e para baixo
- Uma seção por arquivo, com posições absolutas em `--u` dentro de cada seção. Os y são relativos ao topo da seção, derivados do `get_metadata`.
  - `CareerHero.tsx`
  - `CareerBand.tsx`, reutilizado nas faixas 1 e 3 com `variant="blue" | "pink"`, mais a faixa do trem
  - `CareerArtHistory.tsx`
  - `CareerLife.tsx`
  - `CareerDrawing.tsx`
  - `CareerGallery.tsx`
- `CareerPill.tsx`: o pill tracejado do Figma (casca `#bacceb` com `p-1`, miolo `#eaeef4`, borda de 2px tracejada `#527fb0`, Clother Bold 20px `rgba(8,72,143,.36)`) em dois tamanhos, 48/39 e 39/31. Hoje o pill azul só existe inline no `CaseTopBar`, então crio um local da carreira e não refatoro os outros.
- **Texto:**
  - parágrafos em Clother Regular 26px, `text-align: justify`, cor `#6f96ce`
  - negritos em Clother **Black** (900)
  - títulos em AM Novecento 400, `lowercase`, `line-height: normal` (≈1.383)
  - o `globals.css` força h1–h4 em AM Novecento, o que serve para os títulos
  - o espaço antes do texto onde fica o pill numerado (01–05) é feito com `text-indent` medido no render, **não** com os espaços do Figma
- **Negrito no meio do parágrafo** (hero): chaves divididas e JSX intercalado, no padrão de `dict.home.philosophy*` em `app/[lang]/page.tsx`. Nunca `dangerouslySetInnerHTML`.

### Animação: `components/career/KnittingDoll.tsx` (`'use client'`) e `knitting.module.css`
- **Camadas** na ordem do Figma: base da boneca sem as mãos → mão direita (Ellipse 715, 201:500) → mão esquerda (Ellipse 713, 201:505) → caixa sem manivela → manivela → cachecol (201:515) → pills em HTML.
  - Cada mão já é exportada com a própria sombra (conferido no 201:505), então dá para separar sem perder a sombra.
- **Mãos:** keyframe só de `transform`, com um movimento circular pequeno de manivela (raio de poucos px de design, mãos em fase oposta). Começa e termina em `translate(0)`, então o repouso é igual ao Figma.
- **Manivela:** `rotate` em torno do eixo onde ela encosta na caixa. O pivô vem da geometria do grupo 201:506. Ela termina em 0° ou 360°, de novo o pose do Figma.
- **Fio:** revelação da esquerda para a direita, saindo da caixa, só com transform. Um wrapper com `overflow: hidden` anda `translateX(-100% → 0)` e o filho anda ao contrário (`100% → 0`), sem animar `clip-path` nem `width`.
- **Pills:** `opacity` e `scale` com efeito de mola (`--ease-spring`). O atraso de cada um vem da posição x dele no trecho do cachecol (467 → 1519): Monitoria 631, Extensão 833, Estágio 1068, Oficinas 1255, Publicações 1358.
- **Disparo e duração:**
  - um IntersectionObserver dispara uma única vez (threshold ≈ 0.4) e depois desconecta
  - as mãos e a manivela rodam o número de ciclos que cabem na duração do fio (≈3.5 s) e param no pose do Figma
- **Robustez:**
  - o SSR e quem está sem JS veem o **estado final** (igual ao Figma)
  - o estado "escondido" só é ligado depois da hidratação (`data-armed` num effect) e o `data-play` só quando a cena entra na tela
  - `useReducedMotion()` (`lib/hooks/use-media-query.ts`) pula direto para o estado final, e o CSS tem `@media (prefers-reduced-motion: reduce)` como reforço
  - nada de escrever em `ref.current` durante o render (lint do React Compiler)
- Os textos dos pills chegam como props vindas do dict do servidor (padrão do `Header`).

### Responsivo (proposta para revisão)
- **≥ 1024px:** canvas proporcional (`--u`). Em 1024 os 26px viram ≈15.4px. Acima de 1728 continua escalando, como a home e as faixas que vão de ponta a ponta.
- **< 1024px:** layout empilhado, uma coluna dentro do `.container-wide`. A arte e os textos são os mesmos, e o tamanho do texto vira `clamp()`.
  - **Hero:** boneca → nuvem com a maçã → título → as 3 colunas empilhadas.
  - **Faixas:** continuam proporcionais à largura, porque são arte. Os pills "Próxima parada" ficam empilhados.
  - **História da arte:** cada item é pill numerado + parágrafo, com a arte espalhada entre os blocos.
  - **Cena da boneca:**
    - a boneca, a caixa e o fio continuam proporcionais à largura
    - os pills saem do fio e viram uma linha que quebra embaixo da cena, com o mesmo atraso em sequência
    - assim evito pills de ~5px
  - **Hora do desenho:** lousa proporcional e, embaixo, o texto e a grade de cubos 4 × 2.
  - **Gallery:** a colagem fica proporcional, com os textos no fluxo embaixo.
- Nenhum scroll horizontal (`overflow-x: clip`). As colunas de texto só ficam lado a lado a partir do lg (gotcha do pt-BR).

### Assets (`public/images/carreira/`)
- Baixar com `download_assets` do MCP (`defaultScale: 2`) por nó. Nunca deixar URL temporária do Figma no código.
- **Arte com grão, sombra ou máscara:** PNG @2x achatado convertido em **WebP lossless** com o sharp do repo (caminho da memória `wsl-toolchain`):
  - boneca turntable, nuvem, maçã
  - faixas 1, 2 e 3, cada metade e o trem inteiro
  - botões e maçãs
  - lousa 201:413
  - fantasminha, tartaruga, coelho, água-viva, doodle de nuvem, joaninha
- **Fotos da gallery** (16): exportar o render do **nó** @2x, que já traz o recorte, a rotação e as sombras do Figma dos nós 201:613 e 201:614. Converter em **WebP lossy** (q≈85). Sem `box-shadow` CSS, porque a sombra já está no arquivo.
- **Cubos de ferramentas** (8): render do nó @2x. São logos e ícones de marca (Blender, Ae, Id, Figma, Clip Studio, An, Ps, Ai), então ficam como imagem com `alt` = nome da ferramenta, que é dado e não se traduz. O rótulo da lista vai no dict.
- **Boneca recomposta:** um script em `scripts/` (ou scratchpad) faz o `composite` dos PNGs @2x por camada de 201:476, **menos** 201:500 e 201:505, mantendo a ordem do Figma, e gera `boneca-base.webp`. Para a caixa, o mesmo processo gera `caixa.webp` sem a manivela e `manivela.webp` (filhos de 201:506, lidos com `get_metadata` na execução).
- **Validação da recomposição:** compor base + mãos + caixa + manivela + cachecol no pose de repouso e comparar com o render do Figma de 201:475. Precisa de **MAE ≤ 5/255**, senão não serve.

### i18n
- Nova chave de topo `career` em `dictionaries/pt-BR.json` **e** `en.json`, na mesma mudança:
  - `back`
  - `hero.{title, col1a…, col2…, col3…}`, com as partes em negrito como chaves separadas
  - `nextStop`
  - `artHistory.{title, items[01–05]}`
  - `life.{title, text, experiences.{monitoria, extensao, estagio, oficinas, publicacoes}}`
  - `drawing.{title, text, toolsLabel}`
  - `gallery.{title, texts…, photoAlts[16]}`
  - `alts` da arte com significado (o resto fica `alt=""` + `aria-hidden`)
- `metadata.career` nos dois idiomas.
- O inglês é um rascunho meu, para revisão da Ágatha (mesma dívida registrada para as outras páginas).

### Processo do repo (docs e gates)
- Spec em `docs/superpowers/specs/2026-11-17-carreira-page-design.md`, com objetivos, não-objetivos, as decisões da tabela acima e "minhas escolhas" para revisão: o layout mobile, o raio e a duração do movimento.
- Plano em `docs/superpowers/plans/` e gates em `docs/superpowers/quality-gates/`.
- `scripts/check-quality-gates.sh`:
  - colocar `carreira` nas listas de `PAGES` e `METADATA_PAGES` do gate 4 e nos paths do gate 5
  - criar o **gate 9** (carreira) para conferir paridade das chaves `career`, existência de todo asset referenciado em `public/images/carreira/`, ausência de strings fixas nos componentes da carreira, `/pt-BR/carreira` e `/en/carreira` com status 200 e hreflang, e o card da home apontando para `/carreira`
- Branch `feature/carreira` a partir do `develop`, depois de confirmar se `refactor/minimal-adjustments` já foi mergeado.

## Ordem de execução
1. Spec, plano e gates em `docs/superpowers`.
2. Exportar e converter os assets, recompor a boneca e a caixa e validar a MAE.
3. Dicionários `career` e `metadata.career` (pt-BR + en).
4. Rota, HeaderRouter/FooterRouter, variante `career` do CaseTopBar e link do card da home.
5. Seções estáticas em ordem (hero → faixas → história → vidinha estática → faixa 3 → desenho → gallery), medindo cada uma contra o Figma em 1728.
6. `KnittingDoll` com a animação.
7. Layout empilhado abaixo de 1024.
8. Gates e verificação completa.

## Verificação
- Antes de commitar: `pnpm build`, `pnpm lint`, `pnpm exec tsc --noEmit` e os gates `3 4 6 8 9`. Depois, `pnpm build && pnpm start -p 3000` e os gates `5 7`, sempre com o PATH do nvm via WSL.
- O Typekit (`NEXT_PUBLIC_TYPEKIT_ID`) precisa estar carregado. Conferir que o kit tem a **Clother Black (900)**. Se não tiver, parar e avisar.
- Playwright em **1728**: o `getBoundingClientRect` de cada elemento contra o `get_metadata`, com Δ ≤ 1px nas caixas e poucos px nas peças giradas.
- Recortes com pixel diff contra o render 1:1 do Figma (`fig-full.png`, baixar de novo se a URL tiver expirado), em **estado final** da animação, com MAE ≤ 5/255 por região de arte.
- **Animação:**
  - a cena começa escondida e dispara só uma vez ao entrar na tela
  - os pills surgem na ordem do fio
  - mãos e manivela param no pose do Figma (screenshot depois do fim = Figma)
  - com `prefers-reduced-motion` emulado, a cena já aparece no estado final, sem nenhuma animação
  - sem JS, aparece o estado final
- **Larguras** 390, 768, 1024, 1280, 1366, 1440, 1728 e 1920, nos **dois idiomas**: sem scroll horizontal e sem texto vazando.
- **Navegação:**
  - o card da home abre `/carreira`
  - "<" leva para a home e "projects" para `/projetos`
  - o seletor de idioma mantém `/carreira`
  - `/xx/carreira` dá 404
