import type { ReactNode } from 'react';
import type { Dictionary } from '@/i18n/dictionaries';
import { CareerHero } from './CareerHero';
import { CareerArtHistory } from './CareerArtHistory';
import { CareerPaths } from './CareerPaths';
import { CareerBand } from './CareerBand';
import { CareerTrain } from './CareerTrain';
import { CareerPublications } from './CareerPublications';
import { CareerGallery } from './CareerGallery';
import { CareerDrawing } from './CareerDrawing';
import { CareerMoments } from './CareerMoments';
import { CareerAbout } from './CareerAbout';
import s from './career.module.css';

/**
 * Página Minha carreira (Figma 226:56). Server Component: todo o texto vem do `dict`;
 * as cenas que mexem (boneca tricotando, trem, tickets, lousa) são client. A barra do
 * topo chega pronta em `top`. Layout e escala: ver career.module.css.
 */
export function CareerView({ dict, top }: { dict: Dictionary; top: ReactNode }) {
  return (
    <article className={s.page}>
      {/* Figma: barra em y=40 (coluna de 1352 centrada), sobre o canvas no desktop. */}
      <div className={s.top}>
        <div className="container-wide pt-10">
          <div className="mx-auto max-w-[1352px]">{top}</div>
        </div>
      </div>
      <CareerHero dict={dict} />
      <CareerArtHistory dict={dict} />
      <CareerPaths dict={dict} />
      <CareerBand variant="blue" />
      <CareerTrain labels={dict.career.train} />
      <CareerPublications labels={dict.career.publications} />
      <CareerBand variant="rose" />
      <CareerGallery dict={dict} />
      <CareerDrawing dict={dict} />
      <CareerMoments dict={dict} />
      <CareerAbout dict={dict} />
    </article>
  );
}
