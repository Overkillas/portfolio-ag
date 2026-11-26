import type { Pt } from './geometry';

/**
 * Os ícones que a caneta desenha, um por ferramenta, cada um com a sua "grafia".
 * Coordenadas da tela da lousa (891.5 × 532, origem na borda da faixa bege); o desenho
 * fica centrado em torno de (446, 266). Cada traço é uma polilinha densa (~2px) que a
 * caneta percorre na ordem; entre traços a caneta levanta.
 *
 * As grafias são escolha nossa, para a Ágatha revisar (spec, Emenda 3):
 *  - Blender: o círculo com o "olho" e as três hastes;
 *  - Figma: as cinco formas, uma a uma;
 *  - Clip Studio Paint: a espiral num traço só, terminando na pena;
 *  - Adobe (Ae, Id, An, Ps, Ai): o quadradinho do app + as letras, cada um com uma letra:
 *    Ae bolhuda, Id bastão com serifa (e quadrado de canto vivo), An com risquinhos de
 *    movimento, Ps cursiva, Ai pontuda com estrelinha no pingo.
 */

export const TOOLS = ['blender', 'ae', 'indesign', 'figma', 'clipstudio', 'animate', 'photoshop', 'illustrator'] as const;
export type Tool = (typeof TOOLS)[number];

/** Nomes de marca: dado, não texto traduzível (AGENTS.md). */
export const TOOL_NAMES: Record<Tool, string> = {
  blender: 'Blender',
  ae: 'After Effects',
  indesign: 'InDesign',
  figma: 'Figma',
  clipstudio: 'Clip Studio Paint',
  animate: 'Animate',
  photoshop: 'Photoshop',
  illustrator: 'Illustrator',
};

export type Stroke = Pt[];

const STEP = 2;

const p = (x: number, y: number): Pt => ({ x, y });

function line(a: Pt, b: Pt): Pt[] {
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / STEP));
  return Array.from({ length: n + 1 }, (_, i) => p(a.x + ((b.x - a.x) * i) / n, a.y + ((b.y - a.y) * i) / n));
}

function poly(...pts: Pt[]): Pt[] {
  return join(...pts.slice(1).map((b, i) => line(pts[i], b)));
}

/** Arco de elipse; ângulos em graus, no sentido da tela (y para baixo: crescente = horário). */
function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number): Pt[] {
  const len = (Math.abs(a1 - a0) * Math.PI * Math.max(rx, ry)) / 180;
  const n = Math.max(2, Math.ceil(len / STEP));
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return p(cx + rx * Math.cos(a), cy + ry * Math.sin(a));
  });
}

function cubic(a: Pt, b: Pt, c: Pt, d: Pt): Pt[] {
  const est = Math.hypot(b.x - a.x, b.y - a.y) + Math.hypot(c.x - b.x, c.y - b.y) + Math.hypot(d.x - c.x, d.y - c.y);
  const n = Math.max(2, Math.ceil(est / STEP));
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, u = 1 - t;
    return p(
      u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
      u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
    );
  });
}

/** Espiral de (r0) até (r1) em `turns` voltas. */
function spiral(cx: number, cy: number, r0: number, r1: number, a0: number, turns: number): Pt[] {
  const n = Math.ceil((turns * 2 * Math.PI * Math.max(r0, r1)) / STEP);
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const a = ((a0 + 360 * turns * t) * Math.PI) / 180;
    const r = r0 + (r1 - r0) * t;
    return p(cx + r * Math.cos(a), cy + r * Math.sin(a));
  });
}

/** Quadradinho do app, desenhado a partir do canto de cima à esquerda, com sobra no fim. */
function tile(x: number, y: number, w: number, h: number, r: number): Pt[] {
  const k = r;
  return join(
    line(p(x + k, y), p(x + w - k, y)),
    arc(x + w - k, y + k, k, k, -90, 0),
    line(p(x + w, y + k), p(x + w, y + h - k)),
    arc(x + w - k, y + h - k, k, k, 0, 90),
    line(p(x + w - k, y + h), p(x + k, y + h)),
    arc(x + k, y + h - k, k, k, 90, 180),
    line(p(x, y + h - k), p(x, y + k)),
    arc(x + k, y + k, k, k, 180, 270),
    line(p(x + k, y), p(x + k + 18, y)), // passa um pouco do começo, como à mão
  );
}

function star(cx: number, cy: number, ro: number, ri: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= 10; i++) {
    const r = i % 2 ? ri : ro;
    const a = ((-90 + i * 36) * Math.PI) / 180;
    pts.push(p(cx + r * Math.cos(a), cy + r * Math.sin(a)));
  }
  return poly(...pts);
}

function join(...parts: Pt[][]): Pt[] {
  const out: Pt[] = [];
  for (const part of parts) {
    for (let i = 0; i < part.length; i++) {
      const last = out[out.length - 1];
      if (i === 0 && last && Math.hypot(last.x - part[0].x, last.y - part[0].y) < 0.5) continue;
      out.push(part[i]);
    }
  }
  return out;
}

/** Tremor de mão: deslocamento suave na normal do traço (determinístico por semente). */
function wobble(pts: Pt[], seed: number, amp = 1.6): Pt[] {
  let s = 0;
  const f1 = 0.045 + (seed % 7) * 0.004, f2 = 0.011 + (seed % 5) * 0.002;
  return pts.map((pt, i) => {
    const prev = pts[Math.max(0, i - 1)], next = pts[Math.min(pts.length - 1, i + 1)];
    if (i > 0) s += Math.hypot(pt.x - prev.x, pt.y - prev.y);
    const dx = next.x - prev.x, dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const o = amp * (0.6 * Math.sin(s * f1 + seed) + 0.4 * Math.sin(s * f2 + seed * 1.7));
    return p(pt.x - (dy / len) * o, pt.y + (dx / len) * o);
  });
}

const GLYPHS: Record<Tool, () => Stroke[]> = {
  blender: () => [
    arc(486, 282, 80, 80, 200, 200 + 380), // o anel
    arc(498, 276, 34, 34, -90, 285), // o olho
    spiral(498, 276, 13, 2, 0, 2.2), // a pupila
    poly(p(420, 234), p(262, 172), p(256, 190), p(408, 262)), // haste de cima, comprida
    poly(p(406, 290), p(318, 292), p(326, 310), p(410, 318)), // haste do meio
    poly(p(432, 344), p(350, 414), p(372, 424), p(452, 360)), // a perninha
  ],
  ae: () => [
    tile(312, 128, 268, 270, 52),
    cubic(p(350, 356), p(358, 230), p(440, 230), p(448, 356)), // A bolhudo, um arco só
    cubic(p(372, 304), p(390, 296), p(414, 296), p(430, 304)),
    join(line(p(472, 318), p(546, 316)), arc(509, 314, 37, 40, 0, -318)), // e
  ],
  indesign: () => [
    tile(312, 128, 268, 270, 8), // canto vivo
    poly(p(352, 184), p(410, 184)),
    poly(p(381, 186), p(381, 346)),
    poly(p(352, 348), p(410, 348)), // I com serifas
    arc(482, 302, 40, 46, -60, 300), // barriga do d
    poly(p(524, 176), p(524, 350), p(542, 350)), // haste do d com pé
  ],
  figma: () => [
    join(poly(p(446, 161), p(411, 161)), arc(411, 196, 35, 35, -90, -270), poly(p(411, 231), p(446, 231), p(446, 161))),
    join(poly(p(450, 161), p(481, 161)), arc(481, 196, 35, 35, -90, 90), poly(p(481, 231), p(450, 231), p(450, 161))),
    join(poly(p(446, 235), p(411, 235)), arc(411, 270, 35, 35, -90, -270), poly(p(411, 305), p(446, 305), p(446, 235))),
    arc(483, 270, 35, 35, -90, 280),
    // a gota: canto vivo em cima à direita, redonda no resto
    join(poly(p(446, 309), p(446, 344)), arc(411, 344, 35, 35, 0, 270), poly(p(411, 309), p(446, 309))),
  ],
  clipstudio: () => [
    join(
      line(p(380, 386), arc(452, 268, 92, 92, 128, 128)[0]), // o cabo saindo da pena até a volta
      arc(452, 268, 92, 92, 128, 128 + 300), // a volta grande
      spiral(452, 268, 92, 44, 128 + 300, 0.75), // fecha para dentro
    ),
    poly(p(392, 366), p(356, 414), p(404, 382)), // a pena
  ],
  animate: () => [
    tile(312, 128, 268, 270, 70),
    poly(p(350, 352), p(394, 196), p(438, 352)), // A pontudo
    poly(p(368, 298), p(422, 298)),
    join(line(p(468, 354), p(468, 262)), cubic(p(468, 262), p(474, 228), p(532, 226), p(534, 280)), line(p(534, 280), p(534, 354))), // n
    poly(p(246, 202), p(290, 202)), // risquinhos de movimento
    poly(p(232, 264), p(290, 264)),
    poly(p(246, 326), p(290, 326)),
  ],
  photoshop: () => [
    tile(312, 128, 268, 270, 52),
    join(
      cubic(p(360, 360), p(372, 368), p(386, 362), p(388, 340)), // gancho do P
      line(p(388, 340), p(394, 190)),
      cubic(p(394, 190), p(480, 166), p(492, 262), p(398, 264)), // barriga cursiva
      cubic(p(398, 264), p(436, 272), p(470, 262), p(536, 262)), // laço até o s
      cubic(p(536, 262), p(476, 250), p(478, 306), p(514, 312)),
      cubic(p(514, 312), p(552, 320), p(546, 362), p(488, 356)), // s
    ),
  ],
  illustrator: () => [
    tile(312, 128, 268, 270, 52),
    poly(p(348, 358), p(404, 186), p(458, 358)), // A bem pontudo
    poly(p(370, 300), p(436, 300)),
    poly(p(514, 252), p(514, 358)), // i
    star(514, 204, 19, 7.5), // pingo de estrela
  ],
};

/** Traços do ícone, com tremor de mão (determinístico). */
export function glyph(tool: Tool): Stroke[] {
  return GLYPHS[tool]().map((s, i) => wobble(s, i * 13 + tool.length * 7));
}

export function strokeLength(s: Stroke): number {
  let l = 0;
  for (let i = 1; i < s.length; i++) l += Math.hypot(s[i].x - s[i - 1].x, s[i].y - s[i - 1].y);
  return l;
}
