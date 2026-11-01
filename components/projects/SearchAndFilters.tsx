'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/hooks/use-media-query';
import { useTranslations } from '@/lib/i18n/use-translation';
import { filterOrder, type ProjectFilter } from '@/lib/projects-search';
import { CategoryIcon, SearchIcon } from './CategoryIcon';
import s from './projects.module.css';

type Props = {
  query: string;
  onQuery: (v: string) => void;
  filter: ProjectFilter;
  onFilter: (f: ProjectFilter) => void;
  bubble: string;
  mood: 'idle' | 'happy' | 'sad';
};

/** Busca, mascote com balão e pílulas de filtro por área. */
export function SearchAndFilters({ query, onQuery, filter, onFilter, bubble, mood }: Props) {
  const { t } = useTranslations();
  const followRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // O mascote gira até ±10° na direção do mouse (sem re-render).
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rot = Math.max(-10, Math.min(10, (e.clientX - window.innerWidth / 2) / 60));
        if (followRef.current) followRef.current.style.transform = `rotate(${rot.toFixed(1)}deg)`;
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
    };
  }, [reduced]);

  // Alterna popA/popB a cada frase nova para a animação do balão reiniciar. Guardado em state
  // ("informação de renders anteriores"), sem escrever ref durante o render.
  const [shown, setShown] = useState({ text: bubble, flip: false });
  if (shown.text !== bubble) setShown({ text: bubble, flip: !shown.flip });

  return (
    <section aria-label={t('projectsPage.controlsLabel')} className={s.controls}>
      <div className={s.controlsInner}>
        <div className={s.topRow}>
          <label className={s.search}>
            <span className={s.srOnly}>{t('projectsPage.searchLabel')}</span>
            <input
              type="search"
              className={s.searchInput}
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder={t('projectsPage.searchPlaceholder')}
            />
            <SearchIcon />
          </label>

          <div className={s.mascotWrap}>
            {/* A região viva fica estável; só o conteúdo remonta para reiniciar o pop. */}
            <div role="status" aria-live="polite" className={s.bubble}>
              <span key={bubble} className={shown.flip ? s.bubbleA : s.bubbleB}>
                {bubble}
              </span>
            </div>
            <div className={s.float}>
              <div ref={followRef} className={s.mascotFollow}>
                <Image
                  src="/images/projetos/mascote.png"
                  alt=""
                  aria-hidden
                  width={139}
                  height={133}
                  className={`${s.mascot} ${mood === 'happy' ? s.mascotHappy : ''} ${mood === 'sad' ? s.mascotSad : ''}`}
                />
              </div>
            </div>
          </div>
        </div>

        <div role="group" aria-label={t('projectsPage.filtersLabel')} className={s.pills}>
          {filterOrder.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={active}
                className={`${s.pill} ${active ? s.pillActive : ''}`}
                onClick={() => onFilter(active && f !== 'all' ? 'all' : f)}
              >
                {f !== 'all' && <CategoryIcon category={f} />}
                <span>{t(`projectsPage.filters.${f}`)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
