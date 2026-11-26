import type { CSSProperties } from 'react';
import type { Dictionary } from '@/i18n/dictionaries';
import { career } from '@/lib/site';
import { at } from './layout';
import s from './career.module.css';
import a from './about.module.css';

/**
 * "sobre este site" (Figma 226:775, x 114, y 8911): título com a cabecinha piscando
 * (226:780, export 2x do Figma), a citação do Saint-Exupéry, a faixa rosa e os devs.
 *
 * Os nomes e LinkedIns vêm de lib/site.ts (dados, não texto). A anotação do Figma
 * (226:803) pede os LinkedIns: com URL, o nome vira link; sem, fica só o nome.
 * Avatares: recortes do export 2x do 226:802 com 10px de margem (o creme é o da página).
 * Posições: 226:802 em (114, 9554.99) + caixas do get_metadata. A fileira de baixo
 * (226:884) é centralizada: a Raquel (241:579) entrou e Valentim/Gilberto foram para a esquerda.
 */

/** canto do avatar (px do Figma, absoluto) e do nome, na ordem de career.devs */
const SPOTS: Record<string, { avatar: [number, number, number, number]; name: [number, number] }> = {
  kaike: { avatar: [203.86, 9576.08, 94.635, 92.938], name: [324.5, 9603.55] },
  'joao-vitor': { avatar: [560.5, 9570.99, 104.092, 103.109], name: [690.59, 9603.55] },
  andre: { avatar: [876.59, 9574.87, 100.866, 95.348], name: [1003.46, 9603.55] },
  'joao-pedro': { avatar: [1231.46, 9573.43, 100.18, 98.238], name: [1357.64, 9603.55] },
  valentim: { avatar: [286.5, 9694.1, 97.556, 100.798], name: [410.06, 9725.5] },
  gilberto: { avatar: [696.06, 9695.51, 103.45, 97.977], name: [825.51, 9725.5] },
  raquel: { avatar: [1094.51, 9703.12, 97.494, 82.762], name: [1218, 9725.5] },
};
const M = 10; // margem dos recortes dos avatares

export function CareerAbout({ dict }: { dict: Dictionary }) {
  const about = dict.career.about;
  return (
    <section className={`${s.section} ${a.about}`} aria-labelledby="career-about">
      {/* a cabecinha fica antes do título no DOM: o creme do recorte não cobre as letras */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/carreira/sobre-cabeca.webp"
        alt={about.headAlt}
        width={280}
        height={266.5}
        loading="lazy"
        decoding="async"
        className={`${s.a} ${a.head}`}
        style={at(740, 8911, 280)}
      />
      <h2 id="career-about" className={`${s.a} ${s.title} ${a.title}`} style={at(114, 8935.99, 892)}>
        {about.title}
      </h2>
      <p className={`${s.a} ${a.quote}`} style={at(1128, 9142, 480)}>
        <i>{about.quote}</i>
        <span className={a.author}>{about.quoteAuthor}</span>
      </p>

      <p className={`${s.a} ${a.banner}`} style={at(605.75, 9450.99, 513)}>
        <span className={a.bannerInner}>{about.banner}</span>
      </p>

      <ul className={a.devs} aria-label={about.devsLabel}>
        {career.devs.map((dev) => {
          const spot = SPOTS[dev.slug];
          const [ax, ay, aw, ah] = spot.avatar;
          const name = dev.linkedin ? (
            <a href={dev.linkedin} target="_blank" rel="noopener noreferrer" aria-label={about.linkedin.replace('{name}', dev.name)}>
              {dev.name}
            </a>
          ) : (
            dev.name
          );
          return (
            <li key={dev.slug} className={a.dev}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/carreira/devs/${dev.slug}.webp`}
                alt=""
                width={aw + 2 * M}
                height={ah + 2 * M}
                loading="lazy"
                decoding="async"
                className={`${s.a} ${a.avatar}`}
                style={{ ...at(ax - M, ay - M, aw + 2 * M), '--aw': aw + 2 * M } as CSSProperties}
              />
              <span className={`${s.a} ${a.name}`} style={at(spot.name[0], spot.name[1], 260)}>
                {name}
              </span>
            </li>
          );
        })}
      </ul>

      <p className={`${s.a} ${a.thanks}`} style={at(114, 9826.9, 1496.5)}>
        {about.thanks}
      </p>
    </section>
  );
}
