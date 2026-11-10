'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { useTranslations } from '@/lib/i18n/use-translation';
import { BatucoMotion } from '@/components/case-study/batuco/BatucoMotion';
import { ZoomButton } from '@/components/case-study/batuco/Zoom';
import { ThanksBubble } from '@/components/case-study/CaseShell';
import type { LightboxItem } from '@/components/case-study/CaseLightbox';
import { matchesFilter, rowWidth, studyFilterOrder, studyRows, type StudyFilter } from '@/lib/studies';
import motion from '@/components/case-study/cases/batuco.module.css';
import s from './studies.module.css';

const iconClass = { '3d': s.icon3d, grafico: s.iconGrafico } as const;

/**
 * Página de Estudos (Figma 17:2174): balão (dict.studies.bubble) com a bonequinha,
 * pílulas de filtro e a galeria. Client Component por causa do filtro; a barra do
 * topo (Server Component) chega pronta em `top`.
 *
 * Mesmas interações das páginas do Batuco-tuco e do Pontinhas soltas, via
 * BatucoMotion: cursor "ampliar +", zoom no hover, lightbox, reveal ao rolar e
 * bonequinha balançando; o balão estoura ao carregar (está no topo, ver .bubblePop).
 *
 * Filtro por imagem (lib/studies.ts: só o bolo é 3D). Uma linha some quando todas as
 * imagens dela saem; as que ficam mantêm o tamanho do Figma e a linha encolhe para
 * caber só nelas. Linhas e imagens saem com `hidden` em vez de desmontar: o reveal
 * por IntersectionObserver (navegadores sem scroll-driven animations) observa os
 * elementos uma vez, no mount. O lightbox navega só pelas imagens visíveis.
 */
export function StudiesView({ top }: { top: ReactNode }) {
  const { t, dict } = useTranslations();
  const [filter, setFilter] = useState<StudyFilter>('all');
  // null até a primeira troca: a galeria não anima no carregamento.
  const [swap, setSwap] = useState<boolean | null>(null);

  const shown = studyRows.map((row) => row.items.filter((item) => matchesFilter(item, filter)));
  const firstVisible = shown.findIndex((items) => items.length > 0);

  const items: LightboxItem[] = [];
  const indexOf = new Map<string, number>();
  shown.forEach((rowItems) => {
    for (const item of rowItems) {
      const text = dict.studies.items[item.key];
      indexOf.set(item.key, items.length);
      items.push({ src: item.full, alt: text.alt, caption: text.caption, width: item.fullW, height: item.fullH });
    }
  });

  const choose = (next: StudyFilter) => {
    const value = filter === next && next !== 'all' ? 'all' : next;
    if (value === filter) return;
    setFilter(value);
    setSwap((v) => !v);
  };

  return (
    <BatucoMotion items={items}>
      {/* Figma: barra em y=40, conteúdo em y=154; galeria termina 260px acima do
          footer (o HomeFooter já tem 80 de margem). */}
      <article className="container-wide pb-16 pt-10 md:pb-[180px]">
        <div className="mx-auto max-w-[1352px]">
          {top}
          <h1 className="sr-only">{t('studies.title')}</h1>

          {/* Frame 100825 (17:2279): balão + bonequinha centrados, 24 até as pílulas. */}
          <div className="flex flex-col items-center gap-6">
            <ThanksBubble
              text={t('studies.bubble')}
              size="sm"
              bubbleClassName={s.bubblePop}
              faceClassName={motion.face}
            />

            <div role="group" aria-label={t('studies.filtersLabel')} className={s.pills}>
              {studyFilterOrder.map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  className={s.pill}
                  onClick={() => choose(f)}
                >
                  <span className={s.pillInner}>
                    {f !== 'all' && <span className={`${s.icon} ${iconClass[f]}`} aria-hidden />}
                    {t(`projectsPage.filters.${f}`)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Frame 100898 (17:2324): 82 abaixo das pílulas. */}
          <div
            className={`${s.gallery} mt-12 sm:mt-[82px] ${swap === null ? '' : swap ? s.swapA : s.swapB}`}
          >
            {studyRows.map((row, r) => (
              <div
                key={row.items[0].key}
                hidden={shown[r].length === 0}
                data-first={r === firstVisible ? '' : undefined}
                className={`${s.row} ${motion.rv}`}
                style={
                  {
                    '--row': rowWidth(row, shown[r]),
                    '--gap': row.gap,
                    '--before': row.gapBefore,
                  } as CSSProperties
                }
              >
                {row.items.map((item) => {
                  const index = indexOf.get(item.key) ?? 0;
                  const text = dict.studies.items[item.key];
                  return (
                    <div
                      key={item.key}
                      hidden={!matchesFilter(item, filter)}
                      className={s.cell}
                      style={{ '--w': item.w, '--h': item.h } as CSSProperties}
                    >
                      <ZoomButton
                        index={index}
                        label={dict.projectsPage.lightbox.open.replace('{caption}', text.alt)}
                        className={s.fill}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.src}
                          alt={text.alt}
                          width={Math.round(item.w)}
                          height={Math.round(item.h)}
                          loading={r < 2 ? 'eager' : 'lazy'}
                          decoding="async"
                          className={s.img}
                        />
                      </ZoomButton>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </article>
    </BatucoMotion>
  );
}
