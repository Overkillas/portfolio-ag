'use client';

import { useState } from 'react';
import { BrandHero } from '@/components/layout/BrandHero';
import { useFinePointer, useReducedMotion } from '@/lib/hooks/use-media-query';
import { useTranslations } from '@/lib/i18n/use-translation';
import type { LocalizedProject } from '@/lib/projects';
import { bubbleKey, distributeColumns, filterProjects, type ProjectFilter } from '@/lib/projects-search';
import { BentoCard } from './BentoCard';
import { CustomCursor } from './CustomCursor';
import { SearchAndFilters } from './SearchAndFilters';
import s from './projects.module.css';

/** Ative/desative efeitos aqui. */
const SETTINGS = {
  customCursor: true,
  tiltDegrees: 5,
  parallax: true,
};

/**
 * Índice da página de projetos. Client Component: o estado da página (busca,
 * filtro, hover) vive aqui. O clique num card abre o case em modal, por rota interceptada.
 */
export function ProjectsIndex({ projects }: { projects: LocalizedProject[] }) {
  const { t } = useTranslations();
  const [hovered, setHovered] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const cursorEnabled = SETTINGS.customCursor && finePointer && !reducedMotion;

  const categoryLabels = {
    servicos: t('projectsPage.filters.servicos'),
    '3d': t('projectsPage.filters.3d'),
    interacao: t('projectsPage.filters.interacao'),
    grafico: t('projectsPage.filters.grafico'),
  };
  const filtered = filterProjects(projects, query, filter, categoryLabels);
  const columns = distributeColumns(filtered);

  // Um card filtrado para fora desmonta sem disparar mouseleave: só vale o hover de quem está na lista.
  const hoveredProject = filtered.find((project) => project.slug === hovered);
  const key = bubbleKey({ hovered: hoveredProject, query, filter, count: filtered.length });
  const bubble = t(`projectsPage.bubble.${key}`).replace('{count}', String(filtered.length));
  const mood = hoveredProject ? 'happy' : filtered.length === 0 ? 'sad' : 'idle';

  // Um card filtrado para fora desmonta sem mouseleave; o hover velho é descartado aqui, na
  // mudança da busca/filtro, para não reaparecer quando o card voltar.
  const applyFilters = (nextQuery: string, nextFilter: ProjectFilter) => {
    setQuery(nextQuery);
    setFilter(nextFilter);
    const next = filterProjects(projects, nextQuery, nextFilter, categoryLabels);
    if (hovered !== null && !next.some((project) => project.slug === hovered)) setHovered(null);
  };

  return (
    <div id="top" tabIndex={-1} className={s.page}>
      <BrandHero
        variant="home"
        title={t('projectsPage.title')}
        fullWidth
        bleedBottom={0.16}
        parallax={SETTINGS.parallax}
      />

      <SearchAndFilters
        query={query}
        onQuery={(v) => applyFilters(v, filter)}
        filter={filter}
        onFilter={(f) => applyFilters(query, f)}
        bubble={bubble}
        mood={mood}
      />

      <section className={s.main}>
        <h2 className={s.srOnly} style={{ fontFamily: 'var(--font-body)' }}>
          {t('projectsPage.listHeading').replace('{count}', String(filtered.length))}
        </h2>

        <div className={s.cols}>
          {columns.map((col) => (
            <div key={col.key} className={`${s.col} ${col.wide ? s.colWide : s.colNarrow}`}>
              {col.items.map(({ project, index }) => (
                <BentoCard
                  key={project.slug}
                  project={project}
                  index={index}
                  tiltDegrees={SETTINGS.tiltDegrees}
                  hideCursor={cursorEnabled}
                  onHover={setHovered}
                />
              ))}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className={s.empty}>
            <p className={s.emptyText}>{t('projectsPage.emptyText')}</p>
            <button type="button" className={s.emptyBtn} onClick={() => applyFilters('', 'all')}>
              {t('projectsPage.clearFilters')}
            </button>
          </div>
        )}
      </section>

      {cursorEnabled && <CustomCursor active={hoveredProject !== undefined} />}
    </div>
  );
}
