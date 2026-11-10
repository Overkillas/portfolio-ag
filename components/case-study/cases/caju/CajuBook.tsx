'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DottedButton } from '@/components/case-study/DottedButton';
import { useSnapIntoView } from '@/lib/hooks/use-snap-into-view';
import s from '../caju.module.css';

export type BookTexts = {
  title: string;
  label: string;
  counter: { cover: string; back: string; pages: string };
  hint: { cover: string; middle: string; end: string };
  nav: { open: string; turn: string; back: string; prev: string; next: string; restart: string };
};

export type BookFace = { src: string; alt: string };

type Flying = Record<number, { dir: 'fwd' | 'back'; seq: number }>;

/** Duração da virada (--flip) + folga. */
const FLIP_MS = 980;
/** Intervalo entre as folhas ao voltar para a capa folheando. */
const RESTART_STEP_MS = 110;

/** Volume das páginas: sombras em camadas proporcionais às folhas de cada lado. */
function pageVolume(n: number, sign: number) {
  const parts: string[] = [];
  const layers = Math.min(7, Math.ceil(n / 2));
  for (let k = 1; k <= layers; k++) {
    parts.push(
      `${(sign * k * 0.7).toFixed(1)}px ${(k * 0.6).toFixed(1)}px 0 ${k % 2 ? '#E4D9CA' : '#F4EEE5'}`,
    );
  }
  parts.push(`${sign * 4}px 24px 40px -14px rgba(28,24,64,.3)`);
  return parts.join(', ');
}

/** Ícone de "voltar para a capa" (o glifo ↺ não existe na AM Novecento). */
const RestartIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={s.fbRestartIcon}
  >
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
  </svg>
);

/**
 * "Simulação de leitura" do Caju, como no canvas do Claude Design (ProjetoCaju):
 * livro de folhas com frente e verso que viram em 3D por clique (cantos do livro
 * ou setas), com volume das páginas, sombra e lombada, contador com barra e dica.
 * Fechado, o livro fica deslocado para mostrar só a capa (ou a contracapa).
 *
 * As setas são o botão pontilhado do lightbox (`DottedButton`). O quadro tem a
 * altura da tela, com título, livro e controles centralizados, e faz snap ao
 * chegar perto (`useSnapIntoView`) — sem trava de rolagem.
 *
 * `faces` = capa, páginas e contracapa, em ordem; cada folha é um par (frente, verso).
 */
export function CajuBook({ faces, texts }: { faces: BookFace[]; texts: BookTexts }) {
  const N = Math.floor(faces.length / 2); // folhas
  const nPages = faces.length - 2; // sem capa e contracapa

  const [cur, setCur] = useState(0);
  const [flying, setFlying] = useState<Flying>({});
  const [touched, setTouched] = useState(false);

  const curRef = useRef(0);
  const seqRef = useRef(0);
  const restartingRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const frameRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  useSnapIntoView(frameRef);

  const later = useCallback((fn: () => void, ms: number) => {
    const timers = timersRef.current;
    const id = window.setTimeout(() => {
      timers.splice(timers.indexOf(id), 1);
      fn();
    }, ms);
    timers.push(id);
  }, []);

  const go = useCallback(
    (target: number) => {
      const from = curRef.current;
      if (target < 0 || target > N || target === from) return;
      const leaf = target > from ? from : target;
      const dir = target > from ? 'fwd' : 'back';
      const mySeq = ++seqRef.current;
      curRef.current = target;
      setFlying((f) => ({ ...f, [leaf]: { dir, seq: mySeq } }));
      setCur(target);
      setTouched(true);
      later(() => {
        setFlying((f) => {
          if (!f[leaf] || f[leaf].seq !== mySeq) return f;
          const rest = { ...f };
          delete rest[leaf];
          return rest;
        });
      }, FLIP_MS);
    },
    [N, later],
  );

  const restart = useCallback(() => {
    if (restartingRef.current) return;
    restartingRef.current = true;
    const step = () => {
      if (curRef.current <= 0) {
        restartingRef.current = false;
        return;
      }
      go(curRef.current - 1);
      later(step, RESTART_STEP_MS);
    };
    step();
  }, [go, later]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  // Tamanho do livro e altura do quadro (conteúdo centralizado na altura da tela).
  useEffect(() => {
    const frame = frameRef.current;
    const area = areaRef.current;
    if (!frame || !area) return;
    const inModal = !!frame.closest('[role="dialog"]');
    const layout = () => {
      const vh = window.innerHeight;
      const cw = frame.offsetWidth;
      const centered = vh <= 1500 && !inModal;
      // Claude Design: min(86% da coluna, (tela − 250) × 2, 1180); sem centralizar, 82%.
      const w = centered ? Math.min(cw * 0.86, (vh - 250) * 2, 1180) : cw * 0.82;
      area.style.width = `${Math.round(Math.max(w, 0))}px`;
      frame.style.minHeight = centered ? `${vh}px` : '';
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(frame);
    window.addEventListener('resize', layout);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', layout);
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(curRef.current + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(curRef.current - 1);
    }
  };

  const busy = Object.keys(flying).length > 0;
  const closed = cur === 0 || cur === N;
  const shift = cur === 0 ? '-25%' : cur === N ? '25%' : '0%';
  const counter =
    cur === 0
      ? texts.counter.cover
      : cur === N
        ? texts.counter.back
        : texts.counter.pages
            .replace('{a}', String(Math.min(2 * cur - 1, nPages)))
            .replace('{b}', String(Math.min(2 * cur, nPages)))
            .replace('{n}', String(nPages));
  const hint = cur === 0 ? texts.hint.cover : cur === N ? texts.hint.end : texts.hint.middle;

  return (
    <section ref={frameRef} className={s.fbFrame} aria-label={texts.label} onKeyDown={onKeyDown}>
      <div className={s.fbInner}>
        <h2 className={s.fbTitle}>{texts.title}</h2>
        <div ref={areaRef} className={s.fbArea}>
          <div
            className={`${s.fbGlow} ${touched ? '' : s.pulse}`}
            style={{ left: closed ? '25%' : '0%', width: closed ? '50%' : '100%' }}
            aria-hidden="true"
          />
          <div className={s.fbBook} style={{ transform: `translateX(${shift})` }}>
            <div
              className={`${s.fbStack} ${s.fbStackL}`}
              style={{ opacity: cur > 0 ? 1 : 0, boxShadow: pageVolume(cur, -1) }}
              aria-hidden="true"
            />
            <div
              className={`${s.fbStack} ${s.fbStackR}`}
              style={{ opacity: cur < N ? 1 : 0, boxShadow: pageVolume(N - cur, 1) }}
              aria-hidden="true"
            />
            {Array.from({ length: N }, (_, i) => {
              const f = flying[i];
              const z = i < cur ? -(i + 1) * 0.4 : (N - i) * 0.4;
              // só as folhas visíveis são desenhadas (sem isso a imagem pisca)
              const visible = !!f || (i >= cur - 2 && i <= cur + 1);
              return (
                <div
                  key={i}
                  className={`${s.fbLeaf} ${f?.dir === 'fwd' ? s.flyFwd : ''} ${f?.dir === 'back' ? s.flyBack : ''}`}
                  style={{
                    transform: `rotateY(${i < cur ? -180 : 0}deg) translateZ(${z.toFixed(1)}px)`,
                    visibility: visible ? 'visible' : 'hidden',
                  }}
                >
                  {[faces[2 * i], faces[2 * i + 1]].map((face, k) => {
                    const shown = k === 0 ? i === cur : i === cur - 1;
                    return (
                      <div
                        key={k}
                        className={`${s.fbFace} ${k === 0 ? s.fbFront : s.fbBack}`}
                        aria-hidden={!shown}
                      >
                        {face && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={face.src}
                            alt={face.alt}
                            width={631}
                            height={631}
                            draggable={false}
                            loading={i < 2 ? 'eager' : 'lazy'}
                            decoding="async"
                          />
                        )}
                        {/* capa e contracapa não têm lombada */}
                        {!(i === 0 && k === 0) && !(i === N - 1 && k === 1) && (
                          <div className={s.fbSpine} />
                        )}
                        <div className={s.fbShade} />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div className={`${s.fbHits} ${busy ? s.busy : ''}`} style={{ transform: `translateX(${shift})` }}>
            <button
              type="button"
              className={`${s.fbHit} ${s.fbHitPrev} ${busy ? '' : s.invite}`}
              aria-label={texts.nav.back}
              hidden={cur === 0}
              onClick={() => go(curRef.current - 1)}
            >
              <span className={s.fbCurl} aria-hidden="true">
                <span className={s.fbUnder} />
                <span className={s.fbFlapWrap}>
                  <span className={s.fbFlap} />
                </span>
              </span>
            </button>
            <button
              type="button"
              className={`${s.fbHit} ${s.fbHitNext} ${busy ? '' : s.invite}`}
              aria-label={cur === 0 ? texts.nav.open : texts.nav.turn}
              hidden={cur === N}
              onClick={() => go(curRef.current + 1)}
            >
              <span className={s.fbCurl} aria-hidden="true">
                <span className={s.fbUnder} />
                <span className={s.fbFlapWrap}>
                  <span className={s.fbFlap} />
                </span>
              </span>
            </button>
          </div>
        </div>

        <div className={s.fbCtrl}>
          <DottedButton
            className={s.fbPrev}
            glyph="<"
            aria-label={texts.nav.prev}
            disabled={cur === 0}
            onClick={() => go(curRef.current - 1)}
          />
          <div className={s.fbMeter}>
            <p className={s.fbLabel} aria-live="polite">
              {counter}
            </p>
            <div className={s.fbTrack} aria-hidden="true">
              <div className={s.fbFill} style={{ width: `${((cur / N) * 100).toFixed(2)}%` }} />
            </div>
          </div>
          {cur === N ? (
            <DottedButton
              className={s.fbRestart}
              glyph={<RestartIcon />}
              aria-label={texts.nav.restart}
              onClick={restart}
            />
          ) : (
            <DottedButton
              className={`${s.fbNext} ${touched ? '' : s.pulse}`}
              glyph=">"
              aria-label={texts.nav.next}
              onClick={() => go(curRef.current + 1)}
            />
          )}
        </div>
        <p className={s.fbHint}>{hint}</p>
      </div>
    </section>
  );
}
