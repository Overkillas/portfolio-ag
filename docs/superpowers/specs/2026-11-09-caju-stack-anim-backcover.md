# SPEC — Animação da pilha do livro + contracapa do flipbook (Caju)

Data: 2026-11-09. Base: branch `feature/case-caju` (/tmp/wt-caju2).
Referências: Figma node 17:5070; ANIMACOES-projetos.md §4.1 (pilha) e §4.2 (flipbook).

## Bug 1 — Pilha do livro não anima (linhas 2 e 3 não sobem)
**Sintoma:** ao rolar, a seção "Páginas do livro" fica sticky mas as 6 páginas não se espalham em leque; permanecem sobrepostas paradas.
**Causa raiz confirmada no código:**
- `CajuStack.tsx` calcula e seta `--e1`/`--e2` no elemento `.stack` (stackRef) a cada frame — OK.
- MAS o CSS consome `var(--e1/--e2)` em `.sRow1`/`.sRow2` (`.sRow1 { --e: var(--e1, 1) }` etc.) e aplica `transform: translateY(calc(var(--o) * (1 - var(--e))))` — as custom properties `--e1/--e2` são setadas no `.stack` (pai), e herdadas pelos filhos `.sRow1/.sRow2`... porém o `transform` em `.stack .sRow1` pode estar sendo sobrescrito por outra regra ou o `paint()` não roda porque `onScroll` retorna cedo (`if (!pinned()) return;` — pinned exige `vh <= 1500`; em telas maiores a pilha fica montada parada, que é o comportamento esperado segundo §4.1, então em viewport de teste alto a animação não aparece). Conferir também se `.stack` tem `container-type` (cqw) e se o `transform: scale()` setado em `stack.style.transform` no `layout()` está conflitando.
- Verificação objetiva: em viewport 1000px de altura, rolar pela seção e amostrar `getComputedStyle(row2).transform` — deve mudar de `translateY(48.68cqw)` para `none` durante o percurso; hoje fica parado.
**Correção esperada (§4.1):** wrapper de 3,6 telas, sticky, linha 2 sobe entre 8–46% e linha 3 entre 54–92% do percurso, smoothstep com suavização 0,08/frame; pausas em 0–8%, 46–54%, 92–100%; escala para caber em telas baixas; reduced-motion ou vh>1500 → pilha montada sem fixar. Mobile continua leque (já há regra).

## Bug 2 — Flipbook termina sem contracapa visível
**Sintoma:** ao virar até o fim, o livro mostra a última página e o rótulo "Contracapa", mas a face da contracapa renderiza como bloco liso (`fbPlain`) porque `faces[31]` não tem `src`.
**Causa raiz:** em `CajuCase.tsx`, `faces` = `[livro-capa.jpg, 30 páginas…, capa-versoes.jpg]` (32 itens), e em `CajuBook.tsx` a última face é `{ alt: texts.backCover }` SEM `src` → `<div className={s.fbPlain}>`. Além disso a contracapa está usando `capa-versoes.jpg` (a colagem do aside), que é a arte errada.
**Correção:** extrair do Figma a arte real da contracapa (procurar nó de imagem na contracapa do livro no frame 17:5070 — região da seção do flipbook y≈5676..6485; se o export 3x não tiver a contracapa, usar o verso da capa `livro-capa.jpg` ou o nó `capa banner2` 17:5147 x1162 y8006 w806 h979 se for a arte correta — decidir olhando a imagem) e passar como `faces[31]` com `src`. Garantir que `CajuBook` renderize `<img>` nessa face e que o contador mostre "Contracapa" e o botão vire "Voltar para a capa".

## Critérios de aceite
- tsc, lint, build limpos; gates 3 4 5 6 7 sob `flock /tmp/portfolio-gates.lock` com Failed: 0.
- CDP em viewport 1000px: `getComputedStyle` de `.sRow1/.sRow2` muda de transform durante o scroll pela pilha (prova a animação); flipbook: virar até o fim mostra imagem na contracapa e rótulo "Contracapa"; "Voltar para a capa" retorna folheando.
- Sem erros de console, sem imagens quebradas, sem overflowX em 1728 e 390.
- Commits atômicos em pt-BR (`git -c user.name=Jv1ctor -c user.email=jvbarr@local commit`).
