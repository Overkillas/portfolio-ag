import type { CSSProperties } from 'react';
import type { Dictionary } from '@/i18n/dictionaries';
import { career } from '@/lib/site';
import { at } from './layout';
import s from './career.module.css';

/**
 * "life gallery" (Figma 226:498: fantasminha 226:501, título 226:500, textos 226:506/507),
 * a colagem (226:508, com a joaninha 226:523) e os textos de baixo (226:495/496/497).
 *
 * A colagem é o export 2x do grupo 226:508 (as 14 fotos se sobrepõem, com recortes,
 * rotações e sombras do Figma). Vem antes dos textos no DOM: o creme do export fica por
 * baixo deles (no Figma nenhuma foto encosta nos textos).
 * "Meu canal de música" leva ao canal do YouTube da anotação do Figma (lib/site.ts).
 */
export function CareerGallery({ dict }: { dict: Dictionary }) {
  const gallery = dict.career.gallery;
  return (
    <section className={s.section} aria-labelledby="career-gallery">
      <div className={`${s.a} ${s.island} ${s.collage}`} style={{ ...at(111, 5518.5, 1500), '--iw': 1500 } as CSSProperties}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/carreira/galeria.webp"
          alt={gallery.collageAlt}
          width={1500}
          height={992}
          loading="lazy"
          decoding="async"
          style={at(0, 0, 1500)}
        />
      </div>
      <div className={s.galleryHead}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/carreira/fantasminha.webp"
          alt=""
          aria-hidden
          width={117}
          height={148}
          loading="lazy"
          decoding="async"
          className={`${s.a} ${s.ghost}`}
          style={at(1275, 5464, 117)}
        />
        <h2 id="career-gallery" className={`${s.a} ${s.title} ${s.h2gallery} ${s.alignRight}`} style={at(1239, 5503, 370)}>
          {gallery.title}
        </h2>
      </div>
      <p className={`${s.a} ${s.text} ${s.preWrap}`} style={at(1255, 5731, 354)}>
        {gallery.text1}
      </p>
      <p className={`${s.a} ${s.text}`} style={at(1255, 5943, 354)}>
        {gallery.text2}
      </p>
      <p className={`${s.a} ${s.text}`} style={at(128, 6443, 289)}>
        {gallery.text3}
      </p>
      <p className={`${s.a} ${s.text} ${s.center}`} style={at(525, 6543, 276)}>
        <a className={s.musicLink} href={career.musicChannel} target="_blank" rel="noopener noreferrer">
          {gallery.music}
        </a>
      </p>
      <p className={`${s.a} ${s.text}`} style={at(946, 6552, 662)}>
        {gallery.text4}
      </p>
    </section>
  );
}
