'use client';

import { useEffect } from 'react';

/**
 * Mostra a barra de rolagem só enquanto a página rola (anotação do Figma: "permanecer
 * oculta até que o user comece a scrollar"). Liga `html[data-scrolling]`, que pinta o
 * polegar (globals.css), e desliga depois de HIDE_MS sem rolar. Com o ponteiro encostado
 * na borda direita ela também aparece, para dar para agarrar e arrastar.
 *
 * O listener de scroll é de captura: pega também as áreas que rolam por dentro (a folha
 * do modal do case), já que o evento de scroll não borbulha.
 */

const HIDE_MS = 1000;
/** Faixa da borda direita (px) que revela a barra quando o mouse chega perto. */
const EDGE = 24;

export function ScrollbarReveal() {
  useEffect(() => {
    const root = document.documentElement;
    let timer = 0;
    let atEdge = false;

    const hideLater = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!atEdge) delete root.dataset.scrolling;
      }, HIDE_MS);
    };
    const show = () => {
      root.dataset.scrolling = '';
      hideLater();
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const near = e.clientX >= root.clientWidth - EDGE;
      if (near === atEdge) return;
      atEdge = near;
      if (near) root.dataset.scrolling = '';
      else hideLater();
    };

    document.addEventListener('scroll', show, { capture: true, passive: true });
    document.addEventListener('pointermove', onPointer, { passive: true });
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('scroll', show, { capture: true });
      document.removeEventListener('pointermove', onPointer);
      delete root.dataset.scrolling;
    };
  }, []);

  return null;
}
