/**
 * O efeito "Texture" do Figma (no Animate): cada pixel busca a cor num ponto deslocado por
 * um ruído fractal (até `radius` px), e o resultado fica preso à silhueta da forma
 * (`clipToShape`). No SVG do Figma é feTurbulence (fractalNoise, 3 oitavas, frequência
 * 1/noiseSize) + feDisplacementMap; aqui é um value noise de 3 oitavas com a mesma escala.
 *
 * O deslocamento depende só da posição na tela, então deslocar cada carimbo sozinho dá o
 * mesmo que deslocar o traço inteiro — e o replay sai idêntico.
 */

function hash(ix: number, iy: number, seed: number): number {
  let h = Math.imul(ix, 0x27d4eb2d) ^ Math.imul(iy, 0x165667b1) ^ Math.imul(seed, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const fade = (t: number) => t * t * (3 - 2 * t);

function valueNoise(x: number, y: number, seed: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = fade(x - ix), fy = fade(y - iy);
  const a = hash(ix, iy, seed), b = hash(ix + 1, iy, seed);
  const c = hash(ix, iy + 1, seed), d = hash(ix + 1, iy + 1, seed);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

/** Ruído fractal em [-1, 1] (3 oitavas, como o feTurbulence do Figma). */
export function fractalNoise(x: number, y: number, seed: number): number {
  let sum = 0, amp = 1, norm = 0, f = 1;
  for (let o = 0; o < 3; o++) {
    sum += amp * valueNoise(x * f, y * f, seed + o * 101);
    norm += amp;
    amp *= 0.5;
    f *= 2;
  }
  return (sum / norm) * 2 - 1;
}

/**
 * Aplica a textura num recorte RGBA (`data`, w × h, tingido de `rgb`) e escreve em `out`.
 * Só o alfa vem de `data`: o RGB lido de pixels quase transparentes não é confiável.
 * `toDesign(i, j)` leva o pixel ao ponto da tela (px de design), onde o ruído é amostrado;
 * `radius` e `noiseSize` em px de design; `k` = px de dispositivo por px de design.
 */
export function applyTexture(
  data: Uint8ClampedArray,
  out: Uint8ClampedArray,
  w: number,
  h: number,
  toDesign: (i: number, j: number) => { x: number; y: number },
  radius: number,
  noiseSize: number,
  k: number,
  rgb: readonly [number, number, number],
): void {
  // silhueta: o alfa um pouco borrado e com gama 0.2 (como no filtro do Figma), para a
  // forma hachurada virar uma mancha cheia
  const mask = new Float32Array(w * h);
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      let s = 0, n = 0;
      for (let dj = -1; dj <= 1; dj++)
        for (let di = -1; di <= 1; di++) {
          const x = i + di, y = j + dj;
          if (x < 0 || y < 0 || x >= w || y >= h) continue;
          s += data[(y * w + x) * 4 + 3];
          n++;
        }
      mask[j * w + i] = Math.pow(s / n / 255, 0.2);
    }
  const [r, g, b] = rgb;
  const disp = radius * k;
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const o = (j * w + i) * 4;
      const m = mask[j * w + i];
      out[o] = r;
      out[o + 1] = g;
      out[o + 2] = b;
      if (m <= 0) {
        out[o + 3] = 0;
        continue;
      }
      const q = toDesign(i, j);
      const sx = Math.round(i + fractalNoise(q.x / noiseSize, q.y / noiseSize, 1) * disp);
      const sy = Math.round(j + fractalNoise(q.x / noiseSize, q.y / noiseSize, 7) * disp);
      // o miolo embaralha; se o ponto buscado cai fora da silhueta, o pixel fica como
      // estava — a forma continua redonda, como no Figma (clipToShape)
      const inside = sx >= 0 && sy >= 0 && sx < w && sy < h && mask[sy * w + sx] > 0.5;
      out[o + 3] = inside ? data[(sy * w + sx) * 4 + 3] : data[o + 3];
    }
}
