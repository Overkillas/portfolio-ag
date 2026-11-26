import type { CSSProperties } from 'react';
import type { Dictionary } from '@/i18n/dictionaries';
import { at } from './layout';
import s from './career.module.css';
import m from './moments.module.css';

/**
 * "momentos memoráveis" (Figma 226:701, y 7691): três fileiras de cards de fotos que
 * passam de um lado para o outro, num carrossel infinito (anotação do Figma em 226:703).
 *
 * Medidas do get_design_context (px do Figma): card 282.896 de alto, padding 12.563 /
 * 15.076, fileira de fotos com 4.02 / 16.081 de respiro, legenda Clother Bold 10.051.
 * Fotos (public/images/carreira/momentos/<card>-<n>.webp) já vêm no recorte do Figma, em
 * 2x da caixa. Fileiras em x = -838 + (0 | 509.29 | 501.54), gap 25.216 entre cards.
 *
 * Carrossel só com CSS: cada fileira tem 3 cópias (a do meio é a do Figma; as outras são
 * aria-hidden) e anda exatamente um período (largura + gap) em loop, então o repouso e o
 * movimento reduzido são o Figma. Não pausa com o mouse; pausa só com o foco do teclado.
 */

type Card = {
  key: keyof Dictionary['career']['moments']['cards'];
  /** larguras das fotos (altura h) */
  photos: number[];
  h: number;
  gap: number;
  /** largura da legenda (Figma); 0 = numa linha só */
  caption: number;
};

const ROWS: { x: number; dir: 1 | -1; width: number; cards: Card[] }[] = [
  {
    x: 0,
    dir: -1,
    width: 3403.848,
    cards: [
      { key: 'hackathon1', photos: [240.416, 210.405, 374.425, 332.66], h: 221.882, gap: 6.304, caption: 549.765 },
      { key: 'extensao', photos: [236.785, 138.371, 120.395], h: 221.394, gap: 11.056, caption: 549.765 },
      { key: 'ilustangram', photos: [177.039, 283.021, 333.202, 316.761], h: 221.299, gap: 7.092, caption: 549.765 },
      { key: 'vortex', photos: [253.164], h: 221.73, gap: 0, caption: 285.26 },
    ],
  },
  {
    x: 509.293,
    dir: 1,
    width: 2385.262,
    cards: [
      { key: 'monitoria', photos: [237.929, 207.19, 166.076], h: 221.435, gap: 9.456, caption: 549.765 },
      { key: 'artigo', photos: [228.635, 264.851], h: 222.219, gap: 7.092, caption: 549.765 },
      { key: 'moema', photos: [125.378, 125.378, 125.378], h: 222.894, gap: 9.456, caption: 0 },
      { key: 'hackathon2', photos: [309.988, 166.858], h: 222.477, gap: 14.184, caption: 549.765 },
    ],
  },
  {
    x: 501.539,
    dir: -1,
    width: 2400.771,
    cards: [
      { key: 'agreste', photos: [395.056, 296.292, 395.248, 296.292, 166.664], h: 222.219, gap: 6.304, caption: 0 },
      { key: 'cascavel', photos: [332.522, 332.604], h: 221.68, gap: 11.032, caption: 549.765 },
    ],
  },
];

const GAP = 25.216;
const ORIGIN_X = -838; // o frame 226:701 começa fora da tela, à esquerda
const SPEED = 32; // px do Figma por segundo

function MomentCard({ card, caption, hidden }: { card: Card; caption: string; hidden?: boolean }) {
  return (
    <figure
      className={m.card}
      style={{ '--h': card.h, '--gap': card.gap, '--cap': card.caption } as CSSProperties}
      aria-hidden={hidden || undefined}
    >
      <div className={m.photos}>
        {card.photos.map((w, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={`/images/carreira/momentos/${card.key}-${i + 1}.webp`}
            alt=""
            width={w}
            height={card.h}
            loading="lazy"
            decoding="async"
            style={{ '--w': w } as CSSProperties}
          />
        ))}
      </div>
      <figcaption className={`${m.caption} ${card.caption ? '' : m.nowrap}`}>{caption}</figcaption>
    </figure>
  );
}

export function CareerMoments({ dict }: { dict: Dictionary }) {
  const moments = dict.career.moments;
  return (
    <section className={`${s.a} ${m.moments}`} style={at(0, 7691.13, 1728)} aria-labelledby="career-moments">
      <h2 id="career-moments" className={`${s.title} ${s.h2} ${m.title}`}>
        {moments.title}
      </h2>
      {/* focável para pausar pelo teclado (o carrossel não tem outros controles) */}
      <div className={m.rows} tabIndex={0} role="group" aria-label={moments.label}>
        {ROWS.map((row, r) => {
          const period = row.width + GAP;
          return (
            <div
              key={r}
              className={m.row}
              style={
                {
                  '--x': ORIGIN_X + row.x - period,
                  '--period': period,
                  '--dir': row.dir,
                  '--dur': `${(period / SPEED).toFixed(1)}s`,
                } as CSSProperties
              }
            >
              <div className={m.track}>
                {[0, 1, 2].map((copy) =>
                  row.cards.map((card) => (
                    <MomentCard
                      key={`${copy}-${card.key}`}
                      card={card}
                      caption={moments.cards[card.key]}
                      hidden={copy !== 1}
                    />
                  )),
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
