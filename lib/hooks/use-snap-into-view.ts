'use client';

import { useEffect, type RefObject } from 'react';

/** Distância (fração da altura da tela) a partir da qual a seção "puxa" a rolagem. */
const PULL = 0.32;

/**
 * Snap de uma seção que ocupa a tela (pilha de páginas e livro do Caju): quando o
 * topo dela chega a menos de 32% da tela, a página rola suave até o topo encostar
 * no topo da tela; chegando por baixo, até o fim dela encostar no fim da tela.
 * Como a seção tem a altura da tela (ou um quadro sticky dessa altura), o
 * conteúdo fica centralizado e inteiro à vista.
 *
 * Só puxa uma vez por passagem: depois de encaixar, só volta a puxar quando a
 * seção sai inteira da tela. Não segura a rolagem (sem trava): o usuário segue
 * rolando normalmente. `scrollIntoView` rola quem estiver rolando (a janela ou a
 * folha do modal de projeto). Desligado com movimento reduzido e em telas com
 * mais de 1500px de altura (lá a seção não fica fixa).
 */
export function useSnapIntoView(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let armed = true;
    let lastTop = el.getBoundingClientRect().top;

    const check = () => {
      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      // Sentido da rolagem: a seção sobe na tela = o usuário está descendo.
      const down = r.top < lastTop;
      const up = r.top > lastTop;
      lastTop = r.top;
      if (reduced.matches || vh > 1500) return;
      if (!armed) {
        if (r.bottom <= 0 || r.top >= vh) armed = true;
        return;
      }
      const pull = vh * PULL;
      if (down && r.top > 1 && r.top < pull) {
        armed = false;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (up && r.bottom < vh - 1 && r.bottom > vh - pull) {
        armed = false;
        el.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };

    // Captura no documento: vale para a janela e para a folha do modal.
    document.addEventListener('scroll', check, { passive: true, capture: true });
    return () => document.removeEventListener('scroll', check, { capture: true });
  }, [ref]);
}
