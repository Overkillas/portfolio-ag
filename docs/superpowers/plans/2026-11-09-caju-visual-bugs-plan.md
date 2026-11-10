# PLAN — Correção dos bugs visuais do case Caju

Branch: `feature/case-caju` (worktree /tmp/wt-caju2). Commits atômicos, pt-BR.

1. **Assets novos do Figma** (page-3x.png de imports_figma/cases/caju/, escala 3.0 exata):
   - mascote PNG transparente: nó 17:5492 (x1431 y6485 w139 h132) → `public/images/projects/caju/mascote.png`
   - swatches da paleta: nó 17:5263 (x1133 y1045 w175 h199) → `paleta.png`
   - imagens corretas da seção do livro (nós por volta de 17:5487 e vizinhos y 5676..6485) e da galeria de páginas (17:5475..5480) — recortar pelos retângulos exatos, JPEG q84.
   - atualizar `docs/superpowers/analysis/figma-caju-assets.md`.
2. **Dicionários** (via ~/.hermes/cache/scratch/dictedit.py, NUNCA json.dump no arquivo):
   - pt-BR.json: `sections.readingSim.*` para PT; `sections.book.*` conferido; corrigir grafia ("Cajü"→"Caju", "Jucá (o monstro)"→"Juca"); tag "ilustração digital"→"Ilustração digital".
   - en.json: "Semen"→"seed" e varredura de traduções literais; legendas 100% EN.
   - paridade de chaves pt/en (build quebra sem).
3. **CajuCase.tsx / caju.module.css**:
   - pilha: trocar `.stackGrid` pelas classes do leque (`.stack .sCol0/.sCol1 .sRow0/.sRow1/.sRow2 .sCard`) dentro do `<CajuStack>`, 6 imagens na ordem do Figma.
   - reordenar blocos: brainstorming + painel visual antes de "Prototipagem"; "Projeto final/Ferramentas/Mídia impressa" na posição do Figma (y≈3768..4360).
   - legendas (captions) casadas com as imagens corretas; hero com aspect-ratio 1354/461.
   - card paleta usa `paleta.png`; mascote da trava usa `mascote.png`.
   - mobile: remover vãos (verificar espaçadores do Reveal/gap no mobile), contraste do texto final, padding lateral das imagens.
4. **Verificação**: subir dev na 3106; `node ~/.hermes/cache/scratch/cdp.mjs` com checks-lightbox.js, checks-caju-book2.js, checks-caju-lock4.js (em 1728), audit mobile 390, EN; `python3 sbs.py caju … 6` e comparar as 6 fatias com vision; matar dev; sob `flock /tmp/portfolio-gates.lock`: build + gates 3 4 5 6 7 (todos Failed: 0); tsc + lint.
5. **Commits**: assets+doc; dicionários; componentes/css. `git -c user.name=Jv1ctor -c user.email=jvbarr@local commit`.

Fora de escopo (não tocar): header, chip Concluído, balão de agradecimento, "Talvez você goste…", footer.
