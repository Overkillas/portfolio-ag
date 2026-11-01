'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from '@/lib/i18n/use-translation';
import s from './projects.module.css';

/** 0 = parado, 1 = colado no mouse. */
const LERP = 0.22;

/**
 * Círculo "abrir projeto →" que segue o mouse com atraso suave. Só é montado em
 * dispositivos com mouse (ver `ProjectsIndex`). A posição vai direto no `style.transform`
 * via rAF, sem re-render.
 */
export function CustomCursor({ active }: { active: boolean }) {
  const { t } = useTranslations();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = { x: -200, y: -200 };
    const pos = { x: -200, y: -200 };
    let raf = 0;

    // O laço só roda enquanto o círculo ainda está alcançando o mouse; parado, não gasta frame.
    const start = () => {
      if (raf === 0) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      start();
    };
    function tick() {
      pos.x += (target.x - pos.x) * LERP;
      pos.y += (target.y - pos.y) * LERP;
      if (ref.current) ref.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      const settled = Math.abs(target.x - pos.x) < 0.1 && Math.abs(target.y - pos.y) < 0.1;
      raf = settled ? 0 : requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div ref={ref} className={`${s.cursor} ${active ? s.cursorOn : ''}`} aria-hidden>
      <span className={s.cursorDot}>
        {t('projectsPage.cursorLine1')}
        <br />
        {t('projectsPage.cursorLine2')} <span aria-hidden>→</span>
      </span>
    </div>
  );
}
