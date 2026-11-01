'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n/use-translation';
import s from './projects.module.css';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Elementos focáveis visíveis dentro de `root`, na ordem do DOM. */
function focusableIn(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0,
  );
}

/**
 * "Próximo" troca de projeto remontando a folha inteira (o Next remonta a página
 * interceptada a cada `(.)<slug>`). O clique deixa aqui um recado com destino; a folha
 * nova que tem esse slug o consome (antes da pintura) e a troca fica contínua: o fundo
 * não aparece de novo e o foco de volta ao fechar continua sendo o do card que abriu o
 * primeiro projeto. Uma folha que sai sem que a nova a tenha consumido (fechou antes,
 * ou a troca falhou) apaga o recado, então uma abertura nova nunca vê sobra.
 */
let pendingHandoff: { opener: HTMLElement | null; toSlug: string } | null = null;
/** Verdadeiro na janela entre a folha nova consumir o recado e a folha antiga sair. */
let handedOver = false;

/**
 * Folha do modal de case (aberta por rota interceptada, por cima do índice).
 * Comportamento: foco no botão voltar ao abrir e devolvido ao elemento que abriu
 * ao fechar (ou ao card do projeto aberto, se quem abriu era o body); scroll do
 * body travado enquanto aberto, sem deslocar a página atrás; Esc e "voltar" fecham
 * com `router.back()`, uma vez só; Tab fica preso dentro da folha; "próximo" troca
 * de projeto com `router.replace` (um único voltar do navegador leva ao índice).
 * O conteúdo (`children`) é renderizado no servidor e só passa por aqui.
 */
export function ProjectModal({
  slug,
  title,
  documentTitle,
  nextHref,
  nextTitle,
  children,
}: {
  slug: string;
  title: string;
  /** Título da aba, no mesmo formato do template do layout (`<página> · <site>`). */
  documentTitle: string;
  nextHref: string;
  nextTitle: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const { t, locale } = useTranslations();
  const sheetRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const closingRef = useRef(false);

  // Veio de um "próximo" (recado para este slug)? Então o fundo já está na tela e não faz
  // fade de novo. Roda antes da pintura e mexe só na classe do nó, sem estado nem render.
  useLayoutEffect(() => {
    const handoff = pendingHandoff;
    if (!handoff || handoff.toSlug !== slug) return;
    pendingHandoff = null;
    handedOver = true;
    openerRef.current = handoff.opener;
    sheetRef.current?.classList.add(s.sheetStatic);
  }, [slug]);

  // Dois Esc ou um clique duplo antes de a folha sair não podem voltar duas vezes.
  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    pendingHandoff = null;
    router.back();
  }, [router]);

  // Abrir: guarda quem tinha o foco, trava o scroll do body (compensando a barra de
  // rolagem que some) e foca o botão voltar. Fechar: restaura tudo; o foco volta ao
  // opener se ele ainda estiver na página e não for o body (Safari/Firefox não focam
  // o link no clique), senão ao card do projeto que estava aberto.
  useEffect(() => {
    if (!openerRef.current) {
      const active = document.activeElement;
      openerRef.current = active instanceof HTMLElement ? active : null;
    }
    const body = document.body;
    const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    const gap = window.innerWidth - document.documentElement.clientWidth;
    if (gap > 0) {
      const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${current + gap}px`;
    }
    body.style.overflow = 'hidden';
    backRef.current?.focus({ preventScroll: true });

    return () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
      if (handedOver) {
        handedOver = false; // trocando de projeto: a folha nova assume o foco
        return;
      }
      pendingHandoff = null; // saiu sem folha nova para receber o recado
      const opener = openerRef.current;
      const target =
        opener && opener !== body && opener.isConnected
          ? opener
          : document.querySelector<HTMLElement>(`a[href="/${locale}/projetos/${slug}"]`);
      target?.focus({ preventScroll: true });
    };
  }, [locale, slug]);

  // A rota interceptada não troca o título da aba (o Next não aplica o `metadata` do slot
  // paralelo na navegação suave): a folha põe o título do case e devolve o anterior ao sair.
  useEffect(() => {
    const previous = document.title;
    document.title = documentTitle;
    return () => {
      document.title = previous;
    };
  }, [documentTitle]);

  // Esc fecha; Tab e Shift+Tab ciclam entre os focáveis da folha. Escuta o documento
  // (e não só a folha) para valer também com o foco no body, por exemplo depois de
  // clicar num trecho não focável.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        // Esc segurado repete o evento: só o primeiro fecha.
        if (!event.repeat) close();
        return;
      }
      if (event.key !== 'Tab') return;

      const sheet = sheetRef.current;
      if (!sheet) return;
      const items = focusableIn(sheet);
      if (items.length === 0) {
        event.preventDefault();
        sheet.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const outside = !active || !sheet.contains(active);
      if (event.shiftKey) {
        if (outside || active === first || active === sheet) {
          event.preventDefault();
          last.focus();
        }
      } else if (outside || active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [close]);

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
      className={s.sheet}
    >
      <div className={`container-narrow ${s.sheetInner}`}>
        <div className={s.sheetCol}>
          <button
            ref={backRef}
            type="button"
            onClick={close}
            className={s.backBtn}
          >
            <span aria-hidden>←</span>
            {t('projectsPage.back')}
          </button>
        </div>
      </div>

      {children}

      <div className={`container-narrow ${s.sheetFoot}`}>
        <div className={s.sheetCol}>
          <button
            type="button"
            onClick={() => {
              if (closingRef.current) return;
              pendingHandoff = {
                opener: openerRef.current,
                toSlug: nextHref.slice(nextHref.lastIndexOf('/') + 1),
              };
              router.replace(nextHref, { scroll: false });
            }}
            className={s.nextLink}
          >
            {t('projectsPage.next').replace('{title}', nextTitle)}
            <span aria-hidden className={s.arrow}>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
