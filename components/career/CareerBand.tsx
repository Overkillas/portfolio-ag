import type { CSSProperties } from 'react';
import { at } from './layout';
import { OlharFace } from './OlharFace';
import s from './career.module.css';

/**
 * Faixas de largura total (arte, aria-hidden). Recortes do render 2x do Figma com o 1º
 * quadro do "olhar" já assado; o GIF do olhar (658², x+103, y-81) roda por cima,
 * recortado pela metade da faixa (o frame do Figma tem overflow-clip).
 * Todos os quadros do GIF cobrem o 1º (conferido), então o assado nunca aparece.
 * Com mouse, no lugar do GIF entra o rosto com os olhos seguindo o cursor (OlharFace).
 *
 * Figma 226:56 (mesma arte do 201:53, MAE 0.07 / 0.94 contra o render novo):
 * - "blue": faixa azul 226:231 (y 3000, 1728 × 496; olhar na metade direita).
 * - "rose": faixa rosa 226:414 (y 4886.13, 1728 × 497; olhar na metade esquerda).
 * O trem, que antes vinha colado na faixa azul, agora é o CareerTrain.
 */
export function CareerBand({ variant }: { variant: 'blue' | 'rose' }) {
  const blue = variant === 'blue';
  return (
    <div
      aria-hidden
      className={`${s.a} ${s.island} ${s.bandBlue} ${blue ? '' : s.bandRose}`}
      style={{ ...at(0, blue ? 3000 : 4886.13, 1728), '--iw': 1728 } as CSSProperties}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/carreira/${blue ? 'faixa-azul' : 'faixa-rosa'}.webp`}
        alt=""
        width={1728}
        height={blue ? 496 : 497}
        loading="lazy"
        decoding="async"
        style={at(0, 0, 1728)}
      />
      <div className={s.olharClip} style={{ ...at(blue ? 864 : 0, 0, 864), '--ih': 497 } as CSSProperties}>
        {/* GIF no toque; com mouse, os olhos seguem o cursor (OlharFace) */}
        <OlharFace />
      </div>
    </div>
  );
}
