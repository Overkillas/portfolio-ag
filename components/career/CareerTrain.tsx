'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Dictionary } from '@/i18n/dictionaries';
import { at } from './layout';
import s from './career.module.css';
import t from './train.module.css';

/**
 * O trem (Figma 226:312, y 3497): a Ágatha anda de janela em janela, a paisagem muda e,
 * em cada parada, ela dá tchau em cima do card da parada, que "acende" com um pop
 * (anotações do Figma em 226:314 e 226:316).
 *
 * A animação são os 6 GIFs da Ágatha (imports_figma/carreira-trem) emendados num vídeo
 * só, com o tempo exato de cada quadro (50 fps): tchau na janela 1 → anda até a 2 →
 * tchau → anda até a 3 → tchau → volta para a 1. O vídeo roda em loop e o card ativo sai
 * do `currentTime` (STOPS abaixo, em ms do vídeo).
 *
 * Repouso = Figma: o pôster é o 1º quadro (a boneca na janela 1) e o 1º card verde. O
 * vídeo só carrega perto da tela e pausa fora dela; com movimento reduzido fica o pôster.
 */

const LOOP_MS = 19480;
/**
 * Janelas de cada parada: da chegada (o giro para a frente, 3 quadros antes do fim de cada
 * trecho de caminhada) até a partida (o começo do trecho seguinte). A parada 1 dá a volta
 * no loop. Trechos: tchau1 0–1720, 1→2 1720–5920, tchau2 5920–7640, 2→3 7640–11440,
 * tchau3 11440–13160, 3→1 13160–19480.
 */
const STOPS: [number, number][][] = [
  [
    [18440, LOOP_MS],
    [0, 1720],
  ],
  [[4480, 7640]],
  [[10400, 13160]],
];

const stopAt = (ms: number) => STOPS.findIndex((ranges) => ranges.some(([a, b]) => ms >= a && ms < b));

const KEYS = ['ilustracao', 'pesquisa', 'design3d'] as const;

export function CareerTrain({ labels }: { labels: Dictionary['career']['train'] }) {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  // -1 = em viagem (nenhum card aceso); o servidor e o repouso mostram o Figma (card 1)
  const [active, setActive] = useState(0);
  // o pop só depois que o vídeo começou (no repouso o card 1 já está aceso, sem pulo)
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = root.current;
    const v = video.current;
    if (!el || !v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const tick = () => {
      setActive(stopAt((v.currentTime * 1000) % LOOP_MS));
      raf = requestAnimationFrame(tick);
    };
    const onPlay = () => {
      setPlaying(true);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    const onPause = () => cancelAnimationFrame(raf);
    v.addEventListener('playing', onPlay);
    v.addEventListener('pause', onPause);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.preload = 'auto';
          v.play().catch(() => {
            /* autoplay bloqueado: fica o pôster (o Figma) */
          });
        } else {
          v.pause();
        }
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      v.removeEventListener('playing', onPlay);
      v.removeEventListener('pause', onPause);
    };
  }, []);

  return (
    <div
      ref={root}
      className={`${s.a} ${t.train}`}
      style={at(0, 3497, 1728)}
      data-playing={playing ? '' : undefined}
    >
      <div className={t.window} role="img" aria-label={labels.alt}>
        <video
          ref={video}
          className={t.video}
          muted
          loop
          playsInline
          preload="none"
          poster="/images/carreira/trem.webp"
          width={1728}
          height={498}
          aria-hidden
          disablePictureInPicture
        >
          <source src="/videos/carreira/trem.mp4" type="video/mp4" />
        </video>
      </div>
      <ul className={t.stops} aria-label={labels.stopsLabel}>
        {KEYS.map((key, i) => (
          <li
            key={key}
            className={`${t.stop} ${active === i ? t.on : ''}`}
            style={{ '--i': i } as CSSProperties}
            aria-current={active === i ? 'step' : undefined}
          >
            <span className={t.stopInner}>{labels.stops[key]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
