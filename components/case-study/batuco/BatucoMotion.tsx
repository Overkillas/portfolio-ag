'use client';

import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { useTranslations } from '@/lib/i18n/use-translation';
import { useFinePointer, useReducedMotion } from '@/lib/hooks/use-media-query';
import { CustomCursor } from '@/components/projects/CustomCursor';
import { CaseLightbox, type LightboxItem } from '@/components/case-study/CaseLightbox';
import s from '../cases/batuco.module.css';

/** Alvos do cursor rosa: imagens/blocos ampliáveis e os cards de outros projetos. */
const TARGET = '[data-lightbox], [data-cursor="card"]';

/**
 * Camada de interação da página completa do Batuco-tuco (guia do Claude Design):
 * cursor "ampliar +" / "ver projeto →", lightbox e o fallback do reveal ao rolar.
 * Tudo por delegação de eventos no wrapper, então o corpo do case continua Server
 * Component. O modal sobre /projetos não usa este componente.
 */
export function BatucoMotion({ items, children }: { items: LightboxItem[]; children: ReactNode }) {
  const { t } = useTranslations();
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const cursorEnabled = finePointer && !reducedMotion;

  const rootRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef<Element | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [hover, setHover] = useState<'img' | 'card' | null>(null);
  const [pulse, setPulse] = useState(0);
  const [open, setOpen] = useState<number | null>(null);

  const onMouseOver = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target instanceof Element ? event.target.closest(TARGET) : null;
    if (target === hoverRef.current) return;
    hoverRef.current = target;
    if (!target) {
      setHover(null);
      return;
    }
    setHover(target.hasAttribute('data-lightbox') ? 'img' : 'card');
    setPulse((p) => p + 1);
  };

  const onMouseLeave = () => {
    hoverRef.current = null;
    setHover(null);
  };

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const trigger =
      event.target instanceof Element ? event.target.closest<HTMLElement>('[data-lightbox]') : null;
    if (!trigger || !rootRef.current?.contains(trigger)) return;
    const index = Number(trigger.dataset.lightbox);
    if (!Number.isInteger(index) || !items[index]) return;
    openerRef.current = trigger;
    hoverRef.current = null;
    setHover(null);
    setOpen(index);
  };

  const close = useCallback(() => {
    setOpen(null);
    openerRef.current?.focus({ preventScroll: true });
  }, []);

  // Reveal ao rolar sem scroll-driven animations (Firefox/Safari antigos): marca o
  // wrapper e revela cada elemento uma vez ao entrar na tela. Com reduced motion, nada
  // fica escondido.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion || CSS.supports('animation-timeline: view()')) return;
    root.setAttribute('data-io', '');
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-in', '');
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.15 },
    );
    root.querySelectorAll(`.${s.rv}, .${s.bubble}`).forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      root.removeAttribute('data-io');
    };
  }, [reducedMotion]);

  return (
    <div
      ref={rootRef}
      className={s.motion}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {children}
      {cursorEnabled && (
        <CustomCursor
          active={hover !== null}
          pop
          lerp={1}
          pulse={pulse}
          label={hover === 'card' ? t('projectsPage.projectCursor') : t('projectsPage.zoomCursor')}
        />
      )}
      {open !== null && (
        <CaseLightbox items={items} index={open} onIndex={setOpen} onClose={close} />
      )}
    </div>
  );
}
