import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Personagem espiando por cima da galeria — fiel ao Figma (Group 100804):
 *
 * - O PNG (1533×841 @2x) é content-cropped: o canvas do export (766.5×420.5
 *   CSS) inclui o bleed de sombra baked (o crop do Figma removeu um operando
 *   invisível; o alpha restante é sombra real/grão + a arte).
 * - A âncora é o CONTEÚDO opaco, não as bordas do bbox antigo: canvas
 *   top-left em (849, 1912.5) page 1x → corpo (a≈255) ~1913..2248, mão/boca
 *   cruzam o top da galeria (y=2234) como no Figma.
 * - 849 − 364 (container-narrow content) = 485/1000 → marginLeft 48.5%.
 * - O top do wrapper na página real é 1967.578 (a seção da filosofia é ~73px
 *   mais alta que o stub do Figma por métrica de fonte), então marginTop
 *   −55.078 ancora o canvas em y=1912.5; com o canvas mais alto que o box
 *   antigo (676×360.52), o −mb-[99px] reassenta a galeria em y=2234 (Figma).
 * - A sombra baked pode vazar além do corpo (até y 2333): z-10 +
 *   pointer-events-none; esses pixels ficam com opacidade ≤ ~2% (grão) sobre
 *   os cards — invisível.
 *
 * Plan 4: o peek mora no seam do Plan 4 (ver comentários no page.tsx) —
 * snapshot congelado (spec §3.4): ancoragem/overlap/clip como estão aqui.
 *
 * overflow-x: clip no wrapper — a largura é em px fixo (766.5px) somada a
 * marginLeft em %, então em viewports md intermediários (entre ~768 e
 * ~1616px) a imagem sangra pra fora do canvas; o clip mata a scrollbar
 * horizontal sem afetar o overlap vertical (eixo Y) nem o z-order.
 */
export function PeekingCharacter({ dict }: { dict: Dictionary }) {
  return (
    <div
      className="relative z-10 hidden md:block"
      style={{ overflowX: "clip" }}
    >
      <div className="container-narrow">
        {/* Img plana preenchendo o box — sem stretch, sem offsets, sem
            maxWidth:none (o width/height explícitos em px blindam contra o
            clamp de max-width:100% do preflight, que esmaga imgs in-flow
            mais largas que o container — trap do Task 3). */}
        <div
          className="peeking-box pointer-events-none relative -mb-[99px]" // galeria assentada em y=2234 (Figma); snapshot do seam — spec §3.4 (Plan 4)
          style={{
            width: "766.5px", // canvas exato do PNG content-cropped
            height: "420.5px",
            marginTop: "-55.078px", // wrapper real em 1967.578 → canvas em 1912.5
            marginLeft: "48.5%", // (849 − 364 (container content)) / 1000
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/home/espiando.png"
            alt={dict.home.peekingAlt}
            loading="lazy"
            decoding="async"
            width={767}
            height={421}
            style={{
              width: "766.5px",
              height: "420.5px",
            }}
          />
        </div>
      </div>
    </div>
  );
}