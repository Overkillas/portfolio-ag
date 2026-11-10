'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useTranslations } from '@/lib/i18n/use-translation';
import { DottedButton } from './DottedButton';
import s from './cases/batuco.module.css';

export type LightboxItem = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

/**
 * Imagem ampliada (guia §6 do Batuco-tuco): fundo azul com fade, imagem com "pop" (que
 * se repete a cada troca, via `key`), fechar × e setas < > com navegação circular — os três
 * no estilo pontilhado do botão de voltar do CaseTopBar. Esc e
 * ← → no teclado, clique no fundo fecha, Tab fica preso no diálogo e o scroll da
 * página trava por trás (com a mesma compensação da barra de rolagem do ProjectModal).
 * O foco volta para quem abriu: isso é feito pelo dono (`onClose`).
 */
export function CaseLightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: LightboxItem[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const { t } = useTranslations();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const total = items.length;
  const item = items[index];

  const go = useCallback(
    (dir: number) => onIndex((index + dir + total) % total),
    [index, total, onIndex],
  );

  // Abrir: trava o scroll do body e foca o fechar. Fechar: devolve o scroll.
  useEffect(() => {
    const body = document.body;
    const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    const gap = window.innerWidth - document.documentElement.clientWidth;
    if (gap > 0) {
      const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${current + gap}px`;
    }
    body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        go(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        go(1);
      } else if (event.key === 'Tab') {
        const buttons = Array.from(ref.current?.querySelectorAll<HTMLElement>('button') ?? []);
        if (buttons.length === 0) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        const active = document.activeElement;
        const inside = active instanceof HTMLElement && ref.current?.contains(active);
        if (event.shiftKey && (!inside || active === first)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (!inside || active === last)) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [go, onClose]);

  const counter = t('projectsPage.lightbox.counter')
    .replace('{caption}', item.caption)
    .replace('{index}', String(index + 1))
    .replace('{total}', String(total));

  return (
    <div
      ref={ref}
      className={s.lb}
      role="dialog"
      aria-modal="true"
      aria-label={t('projectsPage.lightbox.label')}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <DottedButton
        ref={closeRef}
        className={s.lbClose}
        glyph="×"
        aria-label={t('projectsPage.lightbox.close')}
        onClick={onClose}
      />
      {/* `key`: imagem nova a cada troca → o "pop" roda de novo. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={index}
        src={item.src}
        alt={item.alt}
        width={item.width}
        height={item.height}
        className={s.lbImg}
      />
      <div className={s.lbBar}>
        <DottedButton
          className={s.lbPrev}
          glyph="<"
          aria-label={t('projectsPage.lightbox.prev')}
          onClick={() => go(-1)}
        />
        <span className={s.lbLabel} aria-live="polite">
          {counter}
        </span>
        <DottedButton
          className={s.lbNext}
          glyph=">"
          aria-label={t('projectsPage.lightbox.next')}
          onClick={() => go(1)}
        />
      </div>
    </div>
  );
}
