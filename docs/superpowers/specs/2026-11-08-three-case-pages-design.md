# SPEC — 3 telas de case (Pontos sem nó · Cascavel · Caju)

**Data:** 2026-11-08 · **Branch base:** `feature/case-base`, derivada de `refactor/general-changes-for-more-similarity-with-figma` (coluna `.container-case` de 1354px e `CaseHeader` já casados com o Figma). Mergear o refactor antes das branches de case.
**Fonte de verdade visual:** Figma `EGDJU9UG5XmLO6zV8Howwo` (nodes 17:899 / 17:4049 / 17:5070, frame 1728px)
**Assets:** imagens ORIGINAIS do Figma (raw-*.png/jpg em alta resolução + `page-3x.png` export 3x + `shot-full.png` referência) ficam em `imports_figma/cases/<slug>/` — pasta **ignorada pelo git** (convenção do repo para exports-fonte do Figma; o export 3x passa de 70 MB). No repo entram só os **recortes finais** com nomes semânticos em `public/images/projects/<slug>/`, cortados pelos nós de imagem do Figma (sem legenda/texto do site dentro da imagem). **Não** usar as imagens antigas dos HTMLs de `~/Downloads/portfolio-projetos-html`.
**Animações/interações:** `ANIMACOES-projetos.md` (anexo) — especialmente §0 base comum (easings, heroIn, rvIn scroll-reveal, zoom hover, cursor personalizado rosa 84px, modal lightbox) e §1 lightbox, §2/§3/§4 por página.
**Regras obrigatórias:** `AGENTS.md` (i18n bilingual pt-BR/en, sem texto hardcoded, `pnpm build`/`lint`/`tsc --noEmit` limpos, gates `./scripts/check-quality-gates.sh 3 4 5 6 7`).

---

## 0. O que já existe (reutilizar, não reinventar)

- Estrutura por projeto (AGENTS.md "New portfolio project"): slug em `slugToKey` + `projectMeta` (`lib/projects.ts`), entrada completa em `dict.projects.<key>` nos 2 dicionários, `metadata.<key>`, página `app/[lang]/projetos/<slug>/page.tsx`, modal `app/[lang]/projetos/@modal/(.)<slug>/page.tsx` (pasta por slug, NÃO dinámico), corpo em `components/case-study/cases/<Nome>Case.tsx` registrado em `caseBodies`.
- `CaseShell` (capa, subtitle+status, tags+date, intro, corpo, thanks) já renderiza a página E o modal (`InterceptedProject`).
- `pontos-sem-no` já existe com esse esqueleto — será **refeito** para casar com o Figma 17:899 + animações.
- Cursor personalizado já existe em `components/projects/CustomCursor.tsx` (padrão do índice). Nas páginas de case o cursor rosa "ampliar +" sobre imagens clicáveis é parte das animações (ANIMACOES §0).

## 1. Registro dos 3 projetos novos

| slug | dict key | Figma node | altura frame | categoria(s) | accent | status |
|---|---|---|---|---|---|---|
| `pontos-sem-no` (existe, refeita) | `pontosSemNo` | 17:899 | 8255 | grafico | blue | concluido |
| `cascavel` | `cascavel` | 17:4049 | 10990 | interacao (VR) | orange | concluido |
| `caju` | `caju` | 17:5070 | 7422 | grafico (livro) — ver categorias em `lib/site.ts` | pink | concluido |

Cada entrada de dicionário precisa de: title, subtitle, cardTitle, description, intro, tags[], sections (creationProcess/prototyping/finalProject com title, paragraphs[], images[] = alts), thanks, + `metadata.<key>` nos 2 idiomas. Textos devem vir do conteúdo dos frames do Figma (extraídos em `docs/superpowers/analysis/figma-<slug>-tree.xml`) — pt-BR literal do Figma, en traduzido.

## 2. Estrutura visual por tela (referência = Figma)

Layout comum (frame 1728px, conteúdo ~1352px centralizado, coluna de texto estreita):

1. **Hero/capa** — imagem full-width do projeto (raw do Figma), animação `heroIn` (clip-path inset + opacity, 1.1s in-out).
2. **Header do case** — subtitle (h1), pill status, tags + date (já no `CaseShell`).
3. **Intro** — parágrafos (já no `CaseShell`).
4. **Seções do corpo** — ver abaixo por projeto. Todas as sezioni: reveal `rvIn` no scroll (`animation-timeline: view()` com fallback IntersectionObserver, ANIMACOES §0).
5. **Imagens clicáveis** — todas abrem o **lightbox** (§1 do ANIMACOES): botão com `data-lb`, modal fixed fora do container-type, fundo `rgba(14,30,66,.94)`, nav circular ←/→ teclado/swipe, Esc/fundo fecham, focus trap, `body.lb-open{overflow:hidden}`, legenda `cap · i/N` com `aria-live`.
6. **Cursor personalizado** rosa 84px "ampliar +" sobre imagens, "ver projeto →" sobre cards (só `hover:hover and pointer:fine`).
7. **Thanks** ("Obrigada por ter chegado até aqui!") + balão pop + mascote com wobble — já no CaseShell/visual do Figma (Frame 100823/100820).
8. **"Talvez você goste..."** — 3 cards de outros projetos com hover (translateY -4px + sombra + img scale 1.05) e cursor "ver projeto →"; links devem ser navegação full-page (AGENTS.md regra 7 do modal).
9. **Footer** — já existente no layout do site (Frame 83 do Figma = footer compartilhado).

### 2a. Pontos sem nó (17:899, h=8255)
- Etapas 01–06 do processo de criação (numeradas, chips com sub-itens: ex. 01 Brainstorming de palavras conceito [Ternura, Escapismo, Peregrino, Serenidade, Lirismo], 02 Análise de painel semântico [Tipografias, Cores, Formas...], 03 Criação de esboços, 04 Testes gráficos, 05 Teste de impressão, 06 Manual de utilização da IDV) — cada etapa entra com `rvIn` em range próprio; hover no numeral: translateY(-3px) rotate(-4deg) bouncy; hover no chip: translateY(-2px).
- Pôster CABE (Frame 100886/100802) + pôster "Hoje não sou mais só" (Frame 94) — imagens clicáveis no lightbox.
- Seção Prototipagem: 3 thumbs (Criação de painéis / Esboços da logo / Testes em vetores) + segunda fileira (Aplicações...) — grid.
- "Elementos de apoio" (2 imagens).
- Projeto final: bloco longo (Frame 100891 h=5117 / 100888 h=4655 — manual completo renderizado) — imagem(s) clicáveis.
- Pôsteres finais: bailarina, jogo do tempo.
- Imagens no lightbox: 14 (lista ANIMACOES §2).

### 2b. Cascavel (17:4049, h=10990)
- Hero + intro sobre VR.
- Processo de criação: fluxo de diálogo do jogo (Falas iniciais 01–07, Respostas, fim.) — imagem grande(s).
- "Primeiras versões e renderizações" — colagem `.cl` de renders posicionados em absoluto, cada um clicável (zoom + lightbox).
- Texturas, Imagem a / Imagem b.
- Grade 3×3 de telas do jogo (t1–t9) com reveal do bloco; no mobile vira 2 colunas.
- **Pan nas imagens**: 6 imagens grandes fazem `scale(1.06) translateX(-1.5% → 1.5%)` ligado ao scroll (`animation-range: cover 0% cover 100%`); fallback sem animation-timeline calcula `t` no scroll e desliga o zoom de hover dessas imagens.
- Projeto final: mapa otimizado + texto; citação de referencial; execução Laboratório Vortex.
- Lightbox: 23 imagens (ANIMACOES §3).

### 2c. Caju (17:5070, h=7422)
- Hero (capa do livro).
- Processo de criação: cards de Ideias/Fontes/Informações técnicas/Roteiro/Paleta/Personagens (grid 3×2, 636px cada) + textos.
- Prototipagem: Brainstorming + Painel visual (2 grandes), Teste de cores e storyboard (6), Design de personagens (2), Rafes das páginas (2), Pintura e diagramação (2).
- **Pilha de páginas no scroll** (ANIMACOES §4.1): wrapper alto (3.6× tela), `.stkframe` sticky, 6 páginas do livro em 2 colunas × 3 linhas; linhas 2 e 3 sobem nos ranges 8–46% e 54–92% do progresso com smoothstep e suavização 0.08; sai de trás da borda inferior (`clip-path: inset(-60px -60px 0 -60px)`); escala para telas baixas; sem fixar se altura > 1500px ou reduced-motion.
- **Flipbook "Simulação de leitura"** (§4.2): 16 folhas (capa + 30 págs + contracapa), vira por clique/setas, `rotateY(0→-180deg)` 900ms página-do-livro, translateZ por profundidade, sombras fbDarken/fbLighten, livro desloca ±25% na capa/contracapa, box-shadow volume proporcional, canto dobrando (3.2s ciclo), pulsação que para na 1ª virada, contador "Capa"→"Páginas 1–2 de 30"→"Contracapa" com barra de progresso, na contracapa a seta vira "voltar para a capa" (110ms entre folhas), antipiscada com `visibility:hidden` nas folhas não visíveis.
- **Trava de leitura** (§4.3): encaixa quando topo da seção < 32% da tela; bloqueia wheel/touchmove (passive:false); 3 gestos (pausa >260ms = novo gesto; 900ms iniciais ignorados) antes de soltar; mascote + balões "Ei, já vai?..." → "Tem certeza?..." → "Tudo bem! Até a próxima :)" com tranco de resistência; não trava com lightbox aberto ni sem rolagem.
- Projeto final: livro impresso (Mídia impressa) + foto do aberto.
- Imagens do livro (30 páginas) vêm dos raws do Figma (verificar quais raw-* correspondem às páginas; o HTML antigo tinha caju-livro-pag-01..30.webp — mapear para os raws baixados).

## 3. Componentes compartilhados a criar (ANS: em `components/case-study/`)

- `Lightbox.tsx` (client) — contrato do ANIMACOES §1: props `images: {src,alt,cap}[]`, render via portal, estado idx, key no img p/ reanimar, focus trap, aria.
- `CaseImageButton.tsx` — wrapper `<button data-lb>` com zoom hover (scale 1.035, 1s ease-out) + cursor "ampliar +".
- `Reveal.tsx` ou hook `useReveal` — aplica `.rv` + fallback IO (padrão ANIMACOES §0).
- `CursorAmpliar.tsx` — cursor rosa 84px (só pointer:fine), fora do container-type.
- Páginas específicas: `CajuStack.tsx`, `CajuFlipbook.tsx`, `CajuReadLock.tsx` (client), `CascavelPan.tsx` (ou só CSS + fallback JS).
- CSS: preferir CSS modules por componente (padrão do repo: `projects.module.css`) com tokens `--u = 100cqw/1728` e `container-type: inline-size` no wrapper da página (cursor e lightbox FORA dele).

## 4. Verificação obrigatória por branch (quality gates)

1. `pnpm build` clean (valida paridade pt-BR↔en — build quebra se faltar chave).
2. `pnpm lint` clean.
3. `pnpm exec tsc --noEmit` clean.
4. `./scripts/check-quality-gates.sh 3 4 5 6 7` — gate 7 exige pasta `@modal/(.)$slug` para cada slug novo e que não haja assets de exemplo antigos.
5. `next dev` + conferer visual contra `public/images/projects/<slug>/figma/shot-full.png` (pt-BR e en, desktop 1728 e mobile).
6. Sem texto hardcoded (gate 4/7 cobre); `prefers-reduced-motion` respeitado.

## 5. Branches (uma implementação por branch, derivadas de `chore/case-assets-figma`)

- `feature/case-pontos-sem-no` → refs: Figma 17:899 + ANIMACOES §2
- `feature/case-cascavel` → Figma 17:4049 + ANIMACOES §3
- `feature/case-caju` → Figma 17:5070 + ANIMACOES §4

Cada branch: registra o slug (lib/projects.ts + 2 dicionários + metadata), cria página + modal folder + case component, copia os assets finais de `figma/raw-*` para nomes semânticos em `public/images/projects/<slug>/`, implementa animações, roda os 4 gates acima, commita atomicamente.

## 6. Fora de escopo

- Não mexer nos outros projetos (batuco-tuco, pontinhas-soltas, identidade-evento-15-anos) nem na home.
- Não trocar fontes/cores globais do site.
- Não adicionar dependências novas (framer-motion já existe, mas o ANIMACOES foi escrito em CSS puro + rAF — seguir o ANIMACOES).
