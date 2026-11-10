# QUALITY GATES — Pontos sem nó como página completa

1. `pnpm exec tsc --noEmit`, `pnpm lint` e `pnpm build` limpos. Build e gates
   3/4/6 apagam o `.next` de um `next dev` no mesmo diretório: rodar numa cópia
   do repo (com `pnpm install --offline` próprio — **não** symlinkar o
   `node_modules`, o pnpm reinstala por ele) ou com o dev parado.
2. Gates 3, 4, 5, 6 e 7: Failed 0. O gate 5 sobe e mata o próprio `pnpm dev`
   na porta 3000; o gate 7 precisa de um servidor no ar em :3000 (56 checks).
3. 1728 (viewport de 1728 sem barra de rolagem), contra o render 1:1 do Figma:
   - caixas de hero, pôster, construção, apoio, diagrama, thumbs, manual,
     bailarina, jogo, xadrez, colagem, nota e balão a ≤ 1px de `get_metadata`;
   - MAE ≤ 5/255 por região nas imagens, com deslocamento 0;
   - painel das etapas MAE ≤ 5, numerais com a tinta na linha do Figma.
4. Lightbox: 17 gatilhos, índices 0–16, aria-labels únicos; cada um abre a
   imagem, Esc fecha e o foco volta ao gatilho.
5. 390, 768, 1024, 1280, 1366, 1440, 1728 e 1920 em pt-BR e en: sem scroll
   horizontal, sem imagem quebrada, rótulo das etapas nunca sobre os chips.
6. Seletor de idioma na barra do case troca a rota; o card de `/projetos` abre a
   página inteira (sem modal); sem header do site; footer "visite também".
