import type { Dictionary } from '@/i18n/dictionaries';
import { at } from './layout';
import { KnittingDoll } from './KnittingDoll';
import s from './career.module.css';

/**
 * "caminhos" (Figma 226:202: coelho 226:205, título 226:209, parágrafo 226:210) e a cena
 * da boneca tricotando (226:153). O coelho é o export 2x do Figma (fundo creme).
 */
export function CareerPaths({ dict }: { dict: Dictionary }) {
  const paths = dict.career.paths;
  return (
    <section className={s.section} aria-labelledby="career-paths">
      <div className={s.lifeHead}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/carreira/coelho.webp"
          alt=""
          aria-hidden
          width={200}
          height={213.5}
          loading="lazy"
          decoding="async"
          className={`${s.a} ${s.bunny}`}
          style={at(734, 2214, 200)}
        />
        {/* Alinhado à direita (justify-between no Figma): borda direita em 1506.48. */}
        <h2 id="career-paths" className={`${s.a} ${s.right} ${s.title} ${s.h2paths}`} style={at(1506.48, 2295.45, 555)}>
          {paths.title}
        </h2>
      </div>
      <p className={`${s.a} ${s.text}`} style={at(750.48, 2459.45, 756)}>
        {paths.text}
      </p>
      <KnittingDoll labels={paths.experiences} listLabel={paths.experiencesLabel} sceneAlt={paths.sceneAlt} />
    </section>
  );
}
