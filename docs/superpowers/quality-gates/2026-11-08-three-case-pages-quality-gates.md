# QUALITY GATES — 3 telas de case (2026-11-08)

Além dos gates do repo (`./scripts/check-quality-gates.sh 3 4 5 6 7`), cada branch de case deve passar:

## Build/tipo (bloqueantes)
- [ ] `pnpm build` exit 0 (inclui paridade pt-BR ↔ en — chave faltando quebra o build)
- [ ] `pnpm lint` exit 0
- [ ] `pnpm exec tsc --noEmit` exit 0
- [ ] `./scripts/check-quality-gates.sh 3 4 5 6 7` sem FAIL (gate 7: pasta `@modal/(.)<slug>/page.tsx` existe para o slug novo)

## Estrutura (AGENTS.md)
- [ ] slug em `slugToKey` + `projectMeta`; entrada idêntica em estrutura nos 2 dicionários
- [ ] nenhum texto visível hardcoded (tudo via dict / useTranslations)
- [ ] alts de imagens vêm do dicionário
- [ ] imagens em `public/images/projects/<slug>/` com nomes semânticos (não `raw-01.png` no código final)
- [ ] modal por pasta `(.)<slug>`, não `(.)[slug]` dinámico

## Visual vs Figma (conferir com shot-full.png lado a lado, 1728px)
- [ ] hero/capa presente e full-width, mêmes proporções do frame
- [ ] header do case (subtitle/status/tags/date/intro) idêntico ao CaseShell existente
- [ ] secciones na ordem do frame do Figma; espaçamentos proporcionais (--u = 100cqw/1728)
- [ ] "Talvez você goste..." com 3 cards; "Obrigada por ter chegado até aqui!" presente

## Animações (ANIMACOES-projetos.md)
- [ ] heroIn na carga; rvIn no scroll das seções (fallback IO funciona em navegador sem animation-timeline)
- [ ] zoom hover nas imagens (scale 1.035, 1s ease-out)
- [ ] cursor rosa 84px "ampliar +" só em `(hover:hover) and (pointer:fine)`; cursor e lightbox FORA do container-type
- [ ] lightbox: abre em todas as imagens clicáveis, nav circular (←/→/setas/swipe), Esc e clique no fundo fecham, focus trap, foco retorna, `body.lb-open` trava scroll, legenda `cap · i/N`, reanima a cada troca (key/idx)
- [ ] `prefers-reduced-motion: reduce` desliga animações (no Caju, pilha e livro aparecem montados)
- [ ] Cascavel: pan scroll nas imagens grandes; colagem vira coluna no mobile; grade 3×3 vira 2 colunas no mobile
- [ ] Caju: pilha sticky funciona, flipbook vira por clique com contador, trava de leitura solta após 3 gestos e não trava com lightbox aberto

## i18n / runtime
- [ ] página responde em `/pt-BR/projetos/<slug>` e `/en/projetos/<slug>` sem 404
- [ ] modal abre por interceptação a partir do índice e a página completa abre direto pela URL
- [ ] sem overflow horizontal em 390px
- [ ] `metadata.<key>` define o título da aba nos 2 idiomas
