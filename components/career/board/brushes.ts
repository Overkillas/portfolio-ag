import { INK_STAMP } from './geometry';
import type { Tool } from './glyphs';

/**
 * Um pincel por ferramenta (Figma 238:48…238:482, um frame da lousa por ferramenta). Os
 * valores são os `complexStrokeProperties` dos rabiscos de cada frame, lidos pela Plugin
 * API; ver o spec, "Emenda 6".
 *
 * Os pincéis do Figma Draw são de dois tipos:
 *  - **scatter** (carimbo): o mesmo desenho repetido ao longo do traço. O carimbo tem o
 *    lado maior = a espessura; `gap` é o passo em espessuras; `wiggle` desloca o carimbo
 *    (em espessuras); `sizeJitter` varia o tamanho (1 ± j); o ângulo é o da tangente +
 *    `rotation` ± `angularJitter` (graus). Conferido num traço reto de 600 px desenhado com
 *    cada pincel no Figma.
 *  - **stretch** (esticado): uma faixa única (comprimento × espessura) esticada no
 *    comprimento inteiro do traço — o SVG do Figma é o mesmo com 150, 600 ou 1200 px.
 *
 * Nos frames a espessura é 9.046; aqui ela é a dos rabiscos da lousa (INK_STAMP), e o
 * que é medido em px (a textura) vai na mesma proporção.
 */

/** Espessura dos traços nos frames dos pincéis. */
const FIGMA_WEIGHT = 9.046;
/** Espessura de todos os pincéis na lousa, em px de design. */
export const BRUSH_WEIGHT = INK_STAMP;
const K = BRUSH_WEIGHT / FIGMA_WEIGHT;

const DIR = '/images/carreira/lousa';
/** Imagens dos pincéis: brancas sobre transparente, tingidas na hora. */
export const BRUSH_IMAGES = {
  'doo-wop': `${DIR}/pincel.png`,
  shoegaze: `${DIR}/pinceis/shoegaze.png`,
  'witch-house': `${DIR}/pinceis/witch-house.png`,
  noir: `${DIR}/pinceis/noir.png`,
  'new-wave': `${DIR}/pinceis/new-wave.png`,
  propaganda: `${DIR}/pinceis/propaganda.png`,
  'rom-com': `${DIR}/pinceis/rom-com.png`,
} as const;
export type BrushImage = keyof typeof BRUSH_IMAGES;

export type ScatterBrush = {
  kind: 'scatter';
  image: 'doo-wop' | 'shoegaze' | 'witch-house';
  gap: number;
  wiggle: number;
  sizeJitter: number;
  angularJitter: number;
  rotation: number;
  /** efeito "Texture" do Figma (o Animate): deslocamento por ruído, preso à forma */
  texture?: { radius: number; noiseSize: number };
};

export type StretchBrush = {
  kind: 'stretch';
  image: 'noir' | 'new-wave' | 'propaganda' | 'rom-com';
};

export type Brush = ScatterBrush | StretchBrush;

const DOO_WOP: ScatterBrush = {
  kind: 'scatter',
  image: 'doo-wop',
  gap: 0.31,
  wiggle: 0,
  sizeJitter: 0,
  angularJitter: 180,
  rotation: 0,
};

export const TOOL_BRUSH: Record<Tool, Brush> = {
  // Figma (238:48): DOO_WOP, o mesmo carimbo dos rabiscos da lousa
  figma: DOO_WOP,
  // Animate (238:358): DOO_WOP espaçado (gap 1.27) com o efeito Texture nos grupos
  animate: {
    ...DOO_WOP,
    gap: 1.27,
    texture: { radius: 5.006298542022705 * K, noiseSize: 6.777758598327637 * K },
  },
  // Clip Studio Paint (238:172): SHOEGAZE
  clipstudio: {
    kind: 'scatter',
    image: 'shoegaze',
    gap: 0.76,
    wiggle: 0.33,
    sizeJitter: 0.11,
    angularJitter: 180,
    rotation: 0,
  },
  // InDesign (238:482): WITCH_HOUSE
  indesign: {
    kind: 'scatter',
    image: 'witch-house',
    gap: 0.68,
    wiggle: 0.25,
    sizeJitter: 1.67,
    angularJitter: 107,
    rotation: 180,
  },
  // Illustrator (238:234): NOIR
  illustrator: { kind: 'stretch', image: 'noir' },
  // After Effects (238:110): NEW_WAVE
  ae: { kind: 'stretch', image: 'new-wave' },
  // Photoshop (238:296): PROPAGANDA
  photoshop: { kind: 'stretch', image: 'propaganda' },
  // Blender (238:420): ROM_COM
  blender: { kind: 'stretch', image: 'rom-com' },
};

/** Menor tamanho de um carimbo com `sizeJitter` (no WITCH_HOUSE o Figma não passa de ~0.38). */
export const MIN_STAMP_SCALE = 0.35;

/** Um carimbo do scatter: deslocamento (ao longo, para o lado), escala e ângulo (rad). */
export type StampPlacement = { along: number; side: number; scale: number; angle: number };

/**
 * Onde cai um carimbo, a partir da tangente do traço (rad) e de um gerador [0, 1). A ordem
 * das chamadas a `rand` é fixa, para o replay dar os mesmos carimbos.
 */
export function placeStamp(brush: ScatterBrush, tangent: number, rand: () => number): StampPlacement {
  const sym = () => rand() * 2 - 1;
  const w = brush.wiggle * BRUSH_WEIGHT;
  const along = sym() * w * 0.5;
  const side = sym() * w;
  const scale = Math.max(MIN_STAMP_SCALE, 1 + sym() * brush.sizeJitter);
  const angle = tangent + ((brush.rotation + sym() * brush.angularJitter) * Math.PI) / 180;
  return { along, side, scale, angle };
}

/** Passo entre carimbos, em px de design. */
export const stampSpacing = (brush: ScatterBrush): number => brush.gap * BRUSH_WEIGHT;
