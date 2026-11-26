'use client';

import { useEffect, useId, useRef } from 'react';
import { DottedButton } from '@/components/case-study/DottedButton';
import { useTranslations } from '@/lib/i18n/use-translation';
import type { StudyItem } from '@/lib/studies';
import s from './gift-card.module.css';

/**
 * O brinde do ícone voador (Figma 281:301, "Modal quando clica no icone"): quem pega o
 * ícone ganha uma arte da página Estudos (sorteada de `giftItems`, lib/studies.ts). No topo,
 * o ícone pego e a frase dele ("Parabéns! O coelhinho lhe alcançou!", dict.treasure.gift.titles);
 * a arte; o "Baixar"; e o texto do brinde.
 *
 * Diferente do resto do site, essa arte pode ser salva: o `data-free-image` tira o aviso de
 * copyright do ImageCopyGuard (e o globals.css devolve o menu do toque longo no iOS), e o
 * "Baixar" é um link `download` para o arquivo original.
 *
 * Diálogo como o CaseLightbox: trava o scroll, foca o fechar, Esc e clique no fundo fecham,
 * Tab fica preso. O foco volta para quem abriu pelo dono (`onClose`).
 */
export function GiftCard({
  icon,
  title,
  item,
  onClose,
}: {
  /** SVG do ícone pego (public/images/voadores) */
  icon: string;
  title: string;
  item: StudyItem;
  onClose: () => void;
}) {
  const { t, dict } = useTranslations();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const file = item.full.split('/').pop() ?? 'arte.webp';

  // Abrir: trava o scroll do body (compensando a barra) e foca o fechar.
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
      } else if (event.key === 'Tab') {
        const focusables = Array.from(ref.current?.querySelectorAll<HTMLElement>('button, a[href]') ?? []);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
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
  }, [onClose]);

  const text = dict.studies.items[item.key];

  return (
    <div
      ref={ref}
      className={s.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-free-image=""
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={s.card}>
        <div className={s.head}>
          <h2 id={titleId} className={s.title}>
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG do Figma, 110 × 110 */}
            <img src={icon} alt="" width={110} height={110} className={s.icon} draggable={false} />
            <span>{title}</span>
          </h2>
          <DottedButton
            ref={closeRef}
            className={s.close}
            glyph="×"
            aria-label={t('treasure.gift.close')}
            onClick={onClose}
          />
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element -- arte inteira, sem recorte */}
        <img src={item.full} alt={text.alt} width={item.fullW} height={item.fullH} className={s.art} />

        <a className={s.download} href={item.full} download={`agatha-ferreira-${file}`}>
          <span className={s.downloadInner}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ícone codex:download do Figma */}
            <img src="/images/voadores/baixar.svg" alt="" width={63.29} height={63.29} className={s.downloadIcon} />
            {t('treasure.gift.download')}
          </span>
        </a>

        <div className={s.copy}>
          <p className={s.heading}>{t('treasure.gift.heading')}</p>
          <p className={s.text}>{t('treasure.gift.text')}</p>
        </div>
      </div>
    </div>
  );
}
