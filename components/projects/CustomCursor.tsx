'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useTranslations } from '@/lib/i18n/use-translation';
import s from './projects.module.css';

/** 0 = parado, 1 = colado no mouse. */
const LERP = 0.22;

/**
 * Círculo que segue o mouse. Só é montado em dispositivos com mouse (ver `ProjectsIndex`
 * e `BatucoMotion`). A posição vai direto no `style.transform` via rAF, sem re-render.
 *
 * - `label`: texto do círculo (padrão: "abrir / projeto →" do índice de projetos).
 * - `lerp`: 0.22 = segue com atraso suave (índice); 1 = colado no mouse (Batuco-tuco).
 * - `pop`: variante da guia do Batuco-tuco — some na hora e "estoura" a cada alvo novo;
 *   mudar `pulse` reinicia esse estouro.
 */
export function CustomCursor({
  active,
  label,
  lerp = LERP,
  pop = false,
  pulse = 0,
}: {
  active: boolean;
  label?: ReactNode;
  lerp?: number;
  pop?: boolean;
  pulse?: number;
}) {
  const { t } = useTranslations();
  const ref = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);

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
      pos.x += (target.x - pos.x) * lerp;
      pos.y += (target.y - pos.y) * lerp;
      if (ref.current) ref.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      const settled = Math.abs(target.x - pos.x) < 0.1 && Math.abs(target.y - pos.y) < 0.1;
      raf = settled ? 0 : requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
    };
  }, [lerp]);

  // Alvo novo → reinicia a animação de "estouro" (só na variante pop).
  useEffect(() => {
    const dot = dotRef.current;
    if (!pop || !dot || pulse === 0) return;
    dot.style.animation = 'none';
    void dot.offsetHeight; // força o reflow para a animação recomeçar
    dot.style.animation = '';
  }, [pop, pulse]);

  return (
    <div
      ref={ref}
      className={`${s.cursor} ${pop ? s.cursorPop : ''} ${active ? s.cursorOn : ''}`}
      aria-hidden
    >
      <span ref={dotRef} className={s.cursorDot}>
        {label ?? (
          <>
            {t('projectsPage.cursorLine1')}
            <br />
            {t('projectsPage.cursorLine2')} <span aria-hidden>→</span>
          </>
        )}
      </span>
    </div>
  );
}
