'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from '@/lib/i18n/use-translation';

/**
 * Aviso de copyright nas imagens do portfólio (pedido da Ágatha, referência: o
 * portfólio da Beatrice Blue). Um único listener no documento cobre todas as
 * <img>/<video> do site, inclusive as que entram depois (modal, lightbox): o
 * botão direito (ou o toque longo no Android) troca o menu "Salvar imagem" pelo
 * aviso, e arrastar a imagem para fora da página fica bloqueado. No iOS o menu
 * do toque longo some via CSS (-webkit-touch-callout em globals.css).
 *
 * É um desestímulo, não uma proteção: print, DevTools e a aba de rede continuam
 * acessíveis — o direito autoral vale de qualquer forma (Lei 9.610/98).
 *
 * Exceção: o que estiver dentro de `[data-free-image]` (o brinde do ícone voador,
 * GiftCard) pode ser salvo e arrastado à vontade.
 */

const MEDIA = 'img, video, picture';
const FREE = '[data-free-image]';
const AUTO_HIDE_MS = 3500;
const MARGIN = 12;

type Notice = { x: number; y: number };

export function ImageCopyGuard() {
  const { t, dict } = useTranslations();
  const [notice, setNotice] = useState<Notice | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isMedia = (target: EventTarget | null) =>
      target instanceof Element && target.closest(MEDIA) !== null && target.closest(FREE) === null;

    // Muitas imagens ficam sob uma camada vazia (o overlay dos cards em /projetos, o
    // canvas da lousa): vale a imagem embaixo do cursor. Um elemento com texto (um
    // título por cima da tartaruga) mantém o menu normal, para o texto seguir copiável.
    const mediaUnder = (e: MouseEvent) => {
      // dentro do brinde (GiftCard) vale tudo: sem isso, as imagens da página atrás do
      // card (embaixo do fundo do diálogo) disparavam o aviso pelo elementsFromPoint
      if (e.target instanceof Element && e.target.closest(FREE)) return false;
      if (isMedia(e.target)) return true;
      if (!(e.target instanceof Element) || e.target.textContent?.trim()) return false;
      return document
        .elementsFromPoint(e.clientX, e.clientY)
        .some((el) => el.matches(MEDIA) && el.closest(FREE) === null);
    };

    const onContextMenu = (e: MouseEvent) => {
      if (!mediaUnder(e)) return;
      e.preventDefault();
      setNotice({ x: e.clientX, y: e.clientY });
    };
    const onDragStart = (e: DragEvent) => {
      if (isMedia(e.target)) e.preventDefault();
    };

    document.addEventListener('contextmenu', onContextMenu, true);
    document.addEventListener('dragstart', onDragStart, true);
    return () => {
      document.removeEventListener('contextmenu', onContextMenu, true);
      document.removeEventListener('dragstart', onDragStart, true);
    };
  }, []);

  // Enquanto o aviso está aberto: some sozinho, no Esc, num clique fora ou ao rolar.
  useEffect(() => {
    if (!notice) return;
    const close = () => setNotice(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onPointer = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) close();
    };
    const timer = window.setTimeout(close, AUTO_HIDE_MS);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    window.addEventListener('scroll', close, { passive: true, capture: true });
    window.addEventListener('resize', close);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('scroll', close, { capture: true });
      window.removeEventListener('resize', close);
    };
  }, [notice]);

  // Mantém a caixa dentro da tela (clique perto da borda direita/inferior).
  useEffect(() => {
    const el = box.current;
    if (!notice || !el) return;
    const { width, height } = el.getBoundingClientRect();
    const x = Math.max(MARGIN, Math.min(notice.x, window.innerWidth - width - MARGIN));
    const y = Math.max(MARGIN, Math.min(notice.y, window.innerHeight - height - MARGIN));
    el.style.transform = `translate(${x}px, ${y}px)`;
    el.style.visibility = 'visible';
  }, [notice]);

  if (!notice) return null;

  const text = t('site.copyright.notice')
    .replace('{year}', String(new Date().getFullYear()))
    .replace('{name}', dict.site.name);

  return (
    <div
      ref={box}
      role="status"
      aria-live="polite"
      className="image-copy-notice"
      style={{ visibility: 'hidden' }}
    >
      <p>{text}</p>
      <button type="button" onClick={() => setNotice(null)} aria-label={t('site.copyright.close')}>
        ×
      </button>
    </div>
  );
}
