'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { CareerPill, at } from './layout';
import s from './career.module.css';
import k from './knitting.module.css';

/**
 * A boneca tricotando dos "caminhos" (Figma 226:153; antes 201:475), a única cena animada fora dos GIFs.
 * Coordenadas da cena (Figma 226:56, grupo 226:153): origem em (90, 2210), 1551 × 731 (até o fim dos pills). A arte é a mesma do 201:475 (só mudou de lugar); os pills mudaram de posição e de cor.
 *
 * Camadas, na ordem do Figma:
 *  1. boneca (201:476) sem as mãos — render do Figma com a sombra do grupo removida;
 *     embaixo das mãos, o SVG do Figma rasterizado (só aparece nas frestas em movimento);
 *  2. mãos (Ellipse 715 / 713): círculos #FADAE7 do SVG do Figma;
 *     1+2 recebem a sombra do grupo (18.93, 12.05, σ 1.01, preto 23%) ao vivo, para a
 *     sombra acompanhar as mãos — é o efeito do próprio Figma, não um efeito novo;
 *  3. caixinha (201:506) em SVG, com a manivela (Vector 1406/1407 + Rectangle 23868/
 *     23869) num grupo que gira em torno do eixo (48, 82); o filtro de sombra é o do Figma;
 *  4. cachecol (201:515), revelado da esquerda para a direita por dois wrappers que
 *     andam em sentidos opostos (só transform);
 *  5. pills (201:555…571) em HTML: cada um surge quando o fio passa pela posição dele.
 *
 * Roda uma vez, quando a cena entra na tela, e termina no pose do Figma. O HTML do
 * servidor já é o estado final: o "escondido" só liga depois da hidratação
 * (data-armed) e só se não houver movimento reduzido.
 */

const SCENE_X = 90;
const SCENE_Y = 2210;
const SCARF_X = 500; // borda esquerda do cachecol no Figma
const SCARF_W = 1073.5;
const DURATION = 3.5; // s, o fio inteiro

const pills = [
  { key: 'monitoria', x: 664, y: 2762, min: 127 },
  { key: 'extensao', x: 866, y: 2856, min: 113 },
  { key: 'estagio', x: 1097, y: 2739, min: 106 },
  { key: 'oficinas', x: 1288, y: 2868, min: 106 },
  { key: 'publicacoes', x: 1394, y: 2670, min: 247 },
] as const;

type PillKey = (typeof pills)[number]['key'];

export function KnittingDoll({
  labels,
  listLabel,
  sceneAlt,
}: {
  labels: Record<PillKey, string>;
  listLabel: string;
  sceneAlt: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.dataset.armed = '';
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.dataset.play = '';
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const local = (x: number, y: number, w: number, extra?: Record<string, number | string>) =>
    at(x - SCENE_X, y - SCENE_Y, w, extra);

  return (
    <div ref={ref} className={`${s.a} ${k.scene}`} style={at(SCENE_X, SCENE_Y, 1551)}>
      <div className={k.art} role="img" aria-label={sceneAlt}>
        <div className={k.doll} style={local(90, 2210, 564.5)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/carreira/boneca-base.webp" alt="" width={564.5} height={638.5} loading="lazy" decoding="async" />
          <svg viewBox="0 0 564.5 638.5" aria-hidden>
            <circle className={k.handR} cx="484.229" cy="488.228" r="58.8957" fill="#FADAE7" />
            <circle className={k.handL} cx="253.106" cy="520.105" r="63.5867" fill="#FADAE7" />
          </svg>
        </div>

        <svg
          className={k.box}
          style={local(397.5, 2671.5, 199.451)}
          viewBox="0 0 199.451 202.07"
          overflow="visible"
          aria-hidden
        >
          <defs>
            <filter id="career-box-shadow" x="0" y="0" width="199.451" height="202.07" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dx="18.93" dy="12.05" />
              <feGaussianBlur stdDeviation="1.01" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.23 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
            </filter>
          </defs>
          <g filter="url(#career-box-shadow)">
            <path d="M87.0008 83.5L23.5008 36L21.0008 128L87.0008 188V83.5Z" fill="#D3BB77" />
            <path d="M176.001 37L86.5008 84.5V188L178.501 134L176.001 37Z" fill="#FFD99C" />
            <path d="M99.5008 0L23.5008 36L86.5008 84.5L176.001 37L99.5008 0Z" fill="#FFF79C" />
            <g className={k.crank}>
              <rect x="44.2586" y="69.0156" width="10.0218" height="58.4721" rx="5.01089" transform="rotate(3.55403 44.2586 69.0156)" fill="#AF7C46" />
              <path d="M43.9755 73.5733C44.1319 71.0562 46.2992 69.1424 48.8163 69.2987V69.2987L45.1916 127.658V127.658C42.6745 127.502 40.7607 125.335 40.917 122.818L43.9755 73.5733Z" fill="#6C4821" />
            </g>
            <rect x="101.2" y="113.646" width="8.23695" height="81.37" rx="4.11848" transform="rotate(-118.317 101.2 113.646)" fill="#AF7C46" />
            <g className={k.crank}>
              <path d="M4.50079 59.5L23.5008 56L33.0008 86L48.0008 82" stroke="#6C4821" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M50.0024 121.5L44.5024 118C40.5024 124.4 42.8357 126.667 44.5024 127C49.3024 127.8 50.169 123.667 50.0024 121.5Z" fill="#6C4821" />
              <path d="M45.0024 118H44.5024M44.5024 118L50.0024 121.5C50.169 123.667 49.3024 127.8 44.5024 127C42.8357 126.667 40.5024 124.4 44.5024 118Z" stroke="#6C4821" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        </svg>

        <div className={k.reveal} style={local(500, 2720.01, SCARF_W)}>
          <div className={k.revealInner}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/carreira/cachecol.webp" alt="" width={SCARF_W} height={221} loading="lazy" decoding="async" />
          </div>
        </div>
      </div>

      <ul className={k.pills} aria-label={listLabel}>
        {pills.map(({ key, x, y, min }) => {
          // o fio passa pelo centro do pill em (centro - borda do cachecol) / largura
          const delay = (((x + min / 2 - SCARF_X) / SCARF_W) * DURATION).toFixed(2);
          return (
            <li key={key} className={k.pillItem} style={{ ...local(x, y, min), '--d': `${delay}s` } as CSSProperties}>
              <CareerPill small strong min={min}>
                {labels[key]}
              </CareerPill>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
