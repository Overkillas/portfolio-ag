'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { useFinePointer, useReducedMotion } from '@/lib/hooks/use-media-query';
import s from './career.module.css';
import o from './olhar.module.css';

/**
 * Rosto do "olhar" (GIF da Ágatha, Figma 201:242 / 201:284) nas faixas azul e rosa.
 *
 * - Toque (sem cursor): o GIF original, olhando de um lado para o outro sozinho.
 * - Mouse: os olhos seguem o cursor na horizontal. O rosto vem sem íris
 *   (olhar-rosto.webp) e cada olho tem uma tira com as íris dos 5 quadros-chave do GIF
 *   (pares 0, 2, 4, 6, 8; o resto do loop repete esses). Para a posição p entre dois
 *   quadros-chave, os dois são deslocados até p e misturados (crossfade aditivo,
 *   plus-lighter), como os quadros intermediários borrados do próprio GIF. Em cada
 *   quadro-chave o desenho é o da Ágatha (recomposição × GIF: MAE ≈ 0.1/255).
 * - Sem cursor (saiu da janela) volta ao quadro 1, que é a pose do Figma; parado ali, a
 *   camada some e fica o quadro já assado no recorte da faixa (o pixel do Figma).
 * - Movimento reduzido: o CSS esconde a camada e fica o 1º quadro já assado na faixa.
 *
 * Geometria em px do GIF a 1316 (2x de 658): caixa de cada olho e a posição horizontal
 * da íris em cada quadro-chave (deslocamento medido contra o quadro 4).
 */
const SIZE = 1316;
const EYES = [
  { name: 'esq', box: { x: 400, y: 728, w: 210, h: 114 }, pos: [55, 29, 0, -14, -26] },
  { name: 'dir', box: { x: 705, y: 710, w: 205, h: 129 }, pos: [40, 26, 0, -20, -33] },
] as const;
const CELLS = 5;
const REST = 0; // quadro-chave da pose do Figma (quadro 1 do GIF)

/** p ∈ [min, max] → as duas células vizinhas, seus deslocamentos (px) e o peso da segunda. */
function blend(pos: readonly number[], p: number) {
  const order = pos.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0]);
  for (let k = 0; k < order.length - 1; k++) {
    const [p0, i0] = order[k];
    const [p1, i1] = order[k + 1];
    if (p >= p0 && p <= p1) {
      const t = p1 === p0 ? 0 : (p - p0) / (p1 - p0);
      return { a: i0, b: i1, t, shiftA: p - p0, shiftB: p - p1 };
    }
  }
  const last = p < order[0][0] ? order[0] : order[order.length - 1];
  return { a: last[1], b: last[1], t: 0, shiftA: p - last[0], shiftB: 0 };
}

function cellStyle(name: string, cell: number): CSSProperties {
  return {
    backgroundImage: `url(/images/carreira/olhar-iris-${name}.webp)`,
    backgroundSize: `${CELLS * 100}% 100%`,
    backgroundPosition: `${(cell / (CELLS - 1)) * 100}% 0`,
  };
}

function FollowingFace() {
  const root = useRef<HTMLDivElement>(null);
  const layers = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    // t ∈ [-1, 1]: cursor à esquerda/direita do rosto. Repouso = pose do Figma.
    let target: number | null = null;
    let current: number | null = null; // null = em repouso exato (quadro 1)
    let raf = 0;

    const apply = (t: number | null) => {
      // repouso exato: some, e fica o quadro 1 já assado no recorte da faixa (pixel do Figma)
      if (t === null) delete el.dataset.active;
      else el.dataset.active = '';
      EYES.forEach((eye, e) => {
        const min = Math.min(...eye.pos);
        const max = Math.max(...eye.pos);
        const p = t === null ? eye.pos[REST] : t >= 0 ? t * max : -t * min;
        const { a, b, t: w, shiftA, shiftB } = blend(eye.pos, p);
        const [la, lb] = [layers.current[e * 2], layers.current[e * 2 + 1]];
        Object.assign(la.style, cellStyle(eye.name, a), { transform: `translateX(${(shiftA / eye.box.w) * 100}%)`, opacity: String(1 - w) });
        Object.assign(lb.style, cellStyle(eye.name, b), { transform: `translateX(${(shiftB / eye.box.w) * 100}%)`, opacity: String(w) });
      });
    };
    // t do repouso, para a transição até ele ser suave
    const restT = () => {
      const eye = EYES[0];
      const p = eye.pos[REST];
      return p >= 0 ? p / Math.max(...eye.pos) : -p / Math.min(...eye.pos);
    };

    const tick = () => {
      raf = 0;
      const goal = target ?? restT();
      const from = current ?? restT();
      const next = from + (goal - from) * 0.2;
      if (Math.abs(goal - next) < 0.003) {
        current = target === null ? null : goal;
        apply(current);
        return;
      }
      current = next;
      apply(next);
      raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      target = Math.max(-1, Math.min(1, (ev.clientX - cx) / (window.innerWidth * 0.45)));
      kick();
    };
    const onLeave = (ev: PointerEvent) => {
      if (ev.relatedTarget === null) { target = null; kick(); }
    };
    const onBlur = () => { target = null; kick(); };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerout', onLeave);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onLeave);
      window.removeEventListener('blur', onBlur);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={root} className={`${s.olhar} ${o.face}`} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/carreira/olhar-rosto.webp" alt="" width={658} height={658} loading="lazy" decoding="async" />
      {EYES.map((eye, e) => (
        <div
          key={eye.name}
          className={o.eye}
          style={{
            left: `${(eye.box.x / SIZE) * 100}%`,
            top: `${(eye.box.y / SIZE) * 100}%`,
            width: `${(eye.box.w / SIZE) * 100}%`,
            height: `${(eye.box.h / SIZE) * 100}%`,
            maskImage: `url(/images/carreira/olhar-olho-${eye.name}.png)`,
            WebkitMaskImage: `url(/images/carreira/olhar-olho-${eye.name}.png)`,
          }}
        >
          {/* repouso: quadro-chave 0 (pose do Figma) inteiro na camada A */}
          <div ref={(n) => { if (n) layers.current[e * 2] = n; }} className={o.iris} style={cellStyle(eye.name, REST)} />
          <div ref={(n) => { if (n) layers.current[e * 2 + 1] = n; }} className={o.iris} style={{ ...cellStyle(eye.name, REST), opacity: 0 }} />
        </div>
      ))}
    </div>
  );
}

export function OlharFace() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  if (fine && !reduced) return <FollowingFace />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/images/carreira/olhar.webp" alt="" width={658} height={658} loading="lazy" decoding="async" className={s.olhar} />
  );
}
