import type { Dictionary } from '@/i18n/dictionaries';
import { at } from './layout';
import { DrawingPlayground } from './board/DrawingPlayground';
import s from './career.module.css';

/**
 * "hora do desenho" (Figma 226:546): tartaruga (226:547, atrás do título — PNG com alfa,
 * a mesma arte do 201:324 em 0.7735 do tamanho), título centrado (226:565), lousa mágica
 * (226:566), "Sua vez de usar as ferramentas!" + parágrafo (226:629) e os cubos das
 * ferramentas (226:632). A lousa e os cubos são a brincadeira do `DrawingPlayground`
 * (spec, Emenda 3); só mudaram de lugar em relação ao 201:53.
 */
export function CareerDrawing({ dict }: { dict: Dictionary }) {
  const drawing = dict.career.drawing;
  return (
    <section className={s.section} aria-labelledby="career-drawing">
      <div className={s.turtleHead}>
        {/* Caixa do SVG do Figma (inset -2.29% / -3.15%) escalada para o nó de 151.49 × 142. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/carreira/tartaruga.webp"
          alt=""
          aria-hidden
          width={156.25}
          height={151.6}
          loading="lazy"
          decoding="async"
          className={`${s.a} ${s.turtle}`}
          style={at(81.87, 6749.66, 156.25)}
        />
        <h2 id="career-drawing" className={`${s.a} ${s.title} ${s.h2} ${s.nowrap} ${s.center}`} style={at(150.66, 6727.13, 1131)}>
          {drawing.title}
        </h2>
      </div>
      <DrawingPlayground labels={drawing}>
        <div className={s.drawingNote}>
          <h3 className={`${s.a} ${s.drawingHeading}`} style={at(1327.66, 6811.31, 315)}>
            {drawing.heading}
          </h3>
          <p className={`${s.a} ${s.text} ${s.textSm}`} style={at(1327.66, 6877.31, 315)}>
            {drawing.text}
          </p>
        </div>
      </DrawingPlayground>
    </section>
  );
}
