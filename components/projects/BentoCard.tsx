'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { useReducedMotion } from '@/lib/hooks/use-media-query';
import { useTranslations } from '@/lib/i18n/use-translation';
import type { LocalizedProject } from '@/lib/projects';
import s from './projects.module.css';

type Props = {
  project: LocalizedProject;
  index: number;
  tiltDegrees: number;
  hideCursor: boolean;
  onHover: (slug: string | null) => void;
};

export function BentoCard({ project: p, index, tiltDegrees, hideCursor, onHover }: Props) {
  const { t, locale } = useTranslations();
  const ref = useRef<HTMLAnchorElement>(null);
  const raf = useRef(0);
  const reduced = useReducedMotion();

  // Inclinação 3D: posição do mouse no card (-0.5..0.5) vira rotateX/rotateY.
  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduced || !tiltDegrees) return;
    const el = e.currentTarget;
    const { clientX, clientY } = e;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const px = (clientX - r.left) / r.width - 0.5;
      const py = (clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(1000px) rotateX(${(-py * tiltDegrees).toFixed(2)}deg) rotateY(${(px * tiltDegrees).toFixed(2)}deg) translateY(-6px)`;
    });
  };

  const reset = () => {
    cancelAnimationFrame(raf.current);
    if (ref.current) ref.current.style.transform = '';
    onHover(null);
  };

  const linkProps = {
    ref,
    href: `/${locale}/projetos/${p.slug}`,
    'aria-label': t('projectsPage.openProject').replace('{title}', p.title),
    className: `${s.card}${hideCursor ? ` ${s.cardCursorHidden}` : ''}`,
    style: { aspectRatio: p.grid.aspect, animationDelay: `${index * 110}ms` },
    onClick: reset,
    onMouseEnter: () => onHover(p.slug),
    onMouseMove: onMove,
    onMouseLeave: reset,
  };

  const content = (
    <>
      {p.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element -- capas estáticas já otimizadas em /public, como no resto do site
        <img
          src={p.coverImage}
          alt={t('projects.coverAlt').replace('{title}', p.title)}
          className={s.cardImg}
          style={{ objectPosition: p.grid.objectPosition }}
        />
      )}
      <div className={s.overlay} aria-hidden />

      {p.featured && (
        <span className={s.badge}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ícone de 25px, não precisa de otimização */}
          <img src="/images/projetos/icones/coelho.png" alt="" aria-hidden width={25} height={24} />
          {t('projectsPage.featuredBadge')}
        </span>
      )}

      <div className={s.cardText}>
        <span className={`${s.up} ${s.d1} ${s.cardTitle}`}>{p.title}</span>
        <span className={`${s.up} ${s.d2} ${s.cardDesc}`} style={{ WebkitLineClamp: p.grid.descLines }}>
          {p.description}
        </span>
        <span className={`${s.up} ${s.d3} ${s.tags}`}>
          {p.tags.map((tag) => (
            <span key={tag} className={s.tag}>
              {tag}
            </span>
          ))}
        </span>
      </div>
    </>
  );

  // `opensAsPage` (Batuco-tuco): <a> comum = navegação de página inteira, que não passa
  // pela interceptação do modal; os demais abrem no modal via <Link>.
  return p.opensAsPage ? (
    <a {...linkProps}>{content}</a>
  ) : (
    <Link {...linkProps} scroll={false}>
      {content}
    </Link>
  );
}
