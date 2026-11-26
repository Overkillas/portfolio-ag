import type { CSSProperties } from 'react';
import type { Dictionary } from '@/i18n/dictionaries';
import { Loop, Rich, at } from './layout';
import s from './career.module.css';

/**
 * Topo da carreira (Figma 226:92, x 120, y 44): boneca girando (turntable, GIF 226:94),
 * balão de pensamento (GIF 226:96, girado 7.66°) com a maçã (226:101), doodle de nuvem
 * (226:98), "como vim parar aqui?" (226:97) e as três colunas (226:102, gap 177).
 */
export function CareerHero({ dict }: { dict: Dictionary }) {
  const hero = dict.career.hero;
  return (
    <section className={s.section} aria-labelledby="career-title">
      {/* Caixa de 606 × 722 com overflow (226:94); o GIF de 751² passa dela em -12.37% / -1.94%. */}
      <div className={`${s.a} ${s.heroDoll}`} style={at(120, 228, 606)}>
        <div className={s.heroDollGif}>
          <Loop name="boneca-giro" alt={hero.dollAlt} width={751} height={751} priority />
        </div>
      </div>

      {/* Envelope de 863.963 × 645.585 (226:96) com a caixa girada de 798.581 × 544 no
          centro; o GIF (já recortado na faixa visível) tem 847 de largura e é cortado à
          direita pela caixa. A maçã fica no mesmo grupo (226:95), em (462.46, 213). */}
      <div
        className={`${s.a} ${s.island} ${s.heroCloud}`}
        style={{ ...at(734.52, 44, 863.963), '--iw': 863.963 } as CSSProperties}
      >
        <div className={s.heroCloudBox} style={{ ...at(32.691, 50.792, 798.581), rotate: '7.66deg' } as CSSProperties}>
          <div className={s.heroCloudGif}>
            <Loop name="nuvem" alt={hero.thoughtAlt} width={847} height={544} priority />
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/carreira/maca.webp" alt="" aria-hidden width={171.165} height={215} style={at(462.46, 213, 171.165)} />
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/carreira/doodle-nuvem.webp"
        alt=""
        aria-hidden
        width={155}
        height={125}
        className={`${s.a} ${s.doodleCloud}`}
        style={at(1395.51, 599, 155)}
      />

      <h1 id="career-title" className={`${s.a} ${s.title} ${s.h1}`} style={at(749.51, 603.95, 879)}>
        {hero.title}
      </h1>

      <div className={s.cols}>
        {([hero.col1, hero.col2, hero.col3] as Record<string, string>[]).map((parts, i) => (
          <p key={i} className={`${s.a} ${s.text}`} style={at(120 + i * 555, 992, 378)}>
            <Rich parts={parts} />
          </p>
        ))}
      </div>
    </section>
  );
}
