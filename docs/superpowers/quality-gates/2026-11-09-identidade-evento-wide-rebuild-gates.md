# QUALITY GATES — Identidade de evento: 15 anos como página completa + grade

Resultado em 2026-11-09 entre parênteses.

1. `pnpm exec tsc --noEmit`, `pnpm lint` e `pnpm build` limpos (ok).
2. Gates 3, 4, 5, 6 e 7: Failed 0 (3: 14/0, 4: 20/0, 5: 13/0, 6: 9/0, 7: 70/0).
   O gate 7 precisa de `pnpm build && pnpm start -p 3000`.
3. 1728 (viewport sem barra de rolagem), contra o render 1:1 do Figma
   (`.figma-screenshots/identidade-17-4752-1x.png`):
   - as 30 imagens a ≤ 1px de `get_metadata` (pior desvio 0.14px);
   - títulos, legendas, rótulos e nota de IA na posição do Figma (≤ 0.2px);
   - MAE ≤ 5/255 nas regiões de arte (hero 1.49, miniaturas 3.04, convite 2.75,
     banners 3.11, LED 3.74, menu 2.78, evento 3.50, nota + balão 1.99). Painéis:
     5.48 / 8.01 com deslocamento 0 — o PNG 2x do próprio Figma reduzido já dá
     6.85 no painel 2 (textura fina da colagem).
4. Lightbox: 30 gatilhos, aria-labels únicos; abre no item certo (18/30 = menu),
   seta avança, Esc fecha e o foco volta ao gatilho.
5. 390, 768, 1024, 1280, 1366, 1440, 1728 e 1920 em pt-BR e en: sem scroll
   horizontal; abaixo de 48rem as fileiras viram grade.
6. Seletor de idioma na barra do case troca a rota; o card de `/projetos` é `<a>`
   (página inteira, sem modal); sem header do site; footer "visite também".
7. Grade de `/projetos`: de 901 a 1920px as 3 colunas terminam no mesmo pixel; de
   1180 a 1920 nenhum texto de hover passa do card; ≤ 900px sem corte e sem scroll
   horizontal; 6 cards em todas as larguras.
