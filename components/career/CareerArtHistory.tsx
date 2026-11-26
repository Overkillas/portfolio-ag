import type { CSSProperties } from 'react';
import type { Dictionary } from '@/i18n/dictionaries';
import { CareerPill, at } from './layout';
import s from './career.module.css';

/**
 * "uma breve história da arte..." (Figma 226:106) com os parágrafos numerados 01–07
 * (226:107 e 226:120), a água-viva (226:57, atrás do título) e as maçãs (226:926).
 *
 * O Figma abre espaço para o pill (52 × 52) com espaços no começo do texto; aqui é
 * `text-indent`, medido no render 2x (1º glifo da 1ª linha − 1º glifo da 2ª).
 */
const items = [
  { key: '01', pill: [119, 1638], text: [120, 1655, 355], indent: 58.5 },
  { key: '02', pill: [119, 1838], text: [120, 1855, 354], indent: 71 },
  // medido 52; com 52 o "recesso," não cabe na 1ª linha no Chrome (a Clother fica ~1px
  // mais larga que no Figma), e a quebra do Figma vale mais que 2px de recuo
  { key: '03', pill: [557, 1638], text: [566, 1655, 354], indent: 50 },
  { key: '04', pill: [557, 1892], text: [566, 1917, 354], indent: 54 },
  { key: '05', pill: [1001, 1272], text: [999, 1292, 335], indent: 70.5 },
  { key: '06', pill: [1380, 1272], text: [1380, 1295, 228], indent: 64 },
  { key: '07', pill: [1002, 1892], text: [1002, 1917, 606], indent: 59.5 },
] as const;

export function CareerArtHistory({ dict }: { dict: Dictionary }) {
  const art = dict.career.artHistory;
  return (
    <section className={s.section} aria-labelledby="career-art">
      {/* Água-viva: export 2x do Figma (fundo creme) atrás do título, como no Figma. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/carreira/agua-viva.webp"
        alt=""
        aria-hidden
        width={280.5}
        height={382.5}
        loading="lazy"
        decoding="async"
        className={`${s.a} ${s.jelly}`}
        style={at(696.5, 1245, 280.5)}
      />
      <h2 id="career-art" className={`${s.a} ${s.title} ${s.h2}`} style={at(116, 1206, 730)}>
        {art.title}
      </h2>

      {/* Maçãs de feltro (226:926): antes dos textos, o creme do recorte fica por baixo. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/carreira/macas.webp"
        alt=""
        aria-hidden
        width={370}
        height={362}
        loading="lazy"
        decoding="async"
        className={`${s.a} ${s.cluster}`}
        style={at(999, 1524, 370)}
      />

      {items.map(({ key, pill, text, indent }) => (
        <div
          key={key}
          className={s.numbered}
          style={{ '--px': pill[0], '--py': pill[1], '--indent': indent, '--indent-sm': 46 } as CSSProperties}
        >
          <CareerPill round>{key}</CareerPill>
          <p className={`${s.a} ${s.text}`} style={at(text[0], text[1], text[2])}>
            {art.items[key]}
          </p>
        </div>
      ))}
    </section>
  );
}
