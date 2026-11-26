import { describe, expect, it } from 'vitest';
import { boardReducer, initialBoardState, type BoardEvent, type BoardState } from './machine';
import {
  INK,
  KNOB,
  PEN,
  PEN_HELD_ROT,
  PEN_REST,
  ERASE_HALF,
  STRIP,
  STRIP_TRACK,
  CORD_CANVAS,
  HELD_BOUNDS,
  knobToInkX,
  onHolder,
  penFoot,
  insideInk,
  stripShift,
} from './geometry';
import { TOOLS, glyph, strokeLength } from './glyphs';
import { StampWalker, cumulative, pointAt, rng, tangentAt } from './ink';
import { BRUSH_IMAGES, BRUSH_WEIGHT, MIN_STAMP_SCALE, TOOL_BRUSH, placeStamp, stampSpacing, type ScatterBrush } from './brushes';
import { fractalNoise } from './texture';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const run = (events: BoardEvent[], from: BoardState = initialBoardState) => events.reduce(boardReducer, from);

describe('máquina da lousa', () => {
  it('só desenha uma ferramenta já virada', () => {
    expect(run([{ type: 'pick', tool: 'figma' }]).phase).toBe('idle');
    const s = run([{ type: 'flip', tool: 'figma' }, { type: 'pick', tool: 'figma' }]);
    expect(s.phase).toBe('erasing');
    expect(s.tool).toBe('figma');
  });

  it('percorre apagar → desenhar → voltar e libera bolinha e caneta', () => {
    const s = run([
      { type: 'flip', tool: 'ae' },
      { type: 'pick', tool: 'ae' },
      { type: 'erased' },
      { type: 'drawn' },
    ]);
    expect(s).toMatchObject({ phase: 'returning', drawn: 'ae', tool: null, unlocked: true });
    expect(run([{ type: 'home' }], s).phase).toBe('idle');
  });

  it('ignora outra escolha no meio de um desenho', () => {
    const s = run([
      { type: 'flip', tool: 'ae' },
      { type: 'flip', tool: 'figma' },
      { type: 'pick', tool: 'ae' },
      { type: 'pick', tool: 'figma' },
    ]);
    expect(s.tool).toBe('ae');
  });

  it('não deixa pegar a caneta antes do primeiro desenho', () => {
    expect(run([{ type: 'grab' }]).phase).toBe('idle');
    const unlocked = run([{ type: 'flip', tool: 'ae' }, { type: 'pick', tool: 'ae' }, { type: 'erased' }, { type: 'drawn' }, { type: 'home' }]);
    const held = run([{ type: 'grab' }], unlocked);
    expect(held.phase).toBe('holding');
    expect(run([{ type: 'release' }, { type: 'home' }], held).phase).toBe('idle');
  });

  it('escolher um cubo com a caneta na mão (ou voltando) já desenha', () => {
    const unlocked = run([{ type: 'flip', tool: 'ae' }, { type: 'pick', tool: 'ae' }, { type: 'erased' }, { type: 'drawn' }, { type: 'home' }]);
    const held = run([{ type: 'flip', tool: 'figma' }, { type: 'grab' }], unlocked);
    expect(run([{ type: 'pick', tool: 'figma' }], held)).toMatchObject({ phase: 'erasing', tool: 'figma' });
    // clique fora da lousa guarda a caneta (release) e o clique no cubo escolhe em seguida
    expect(run([{ type: 'release' }, { type: 'pick', tool: 'figma' }], held)).toMatchObject({ phase: 'erasing', tool: 'figma' });
    // ainda ignora enquanto apaga ou desenha
    const erasing = run([{ type: 'pick', tool: 'figma' }], held);
    expect(run([{ type: 'pick', tool: 'ae' }], erasing).tool).toBe('figma');
    expect(run([{ type: 'erased' }, { type: 'pick', tool: 'ae' }], erasing)).toMatchObject({ phase: 'drawing', tool: 'figma' });
  });

  it('virar o mesmo cubo duas vezes não duplica', () => {
    expect(run([{ type: 'flip', tool: 'ae' }, { type: 'flip', tool: 'ae' }]).revealed).toEqual(['ae']);
  });
});

describe('geometria', () => {
  it('a régua da bolinha cobre a tela inteira, de ponta a ponta do trilho', () => {
    // em repouso ela não toca a tinta; no fim do trilho cobre a última coluna
    expect(knobToInkX(KNOB.min) + ERASE_HALF).toBeLessThanOrEqual(0);
    expect(knobToInkX(KNOB.max) + ERASE_HALF).toBeGreaterThanOrEqual(INK.w);
    expect(knobToInkX(KNOB.min - 50)).toBe(knobToInkX(KNOB.min));
    for (let x = KNOB.min; x < KNOB.max; x += 37) expect(knobToInkX(x + 1)).toBeGreaterThan(knobToInkX(x));
  });

  it('a faixa bege anda com a bolinha e apaga exatamente o que fica embaixo dela', () => {
    expect(STRIP.x + STRIP.w).toBe(INK.x); // em repouso encosta na tela, como no Figma
    expect(stripShift(KNOB.min)).toBe(0);
    expect(STRIP.x + stripShift(KNOB.max) + STRIP.w).toBe(STRIP_TRACK.x + STRIP_TRACK.w); // não sai da tela
    expect(2 * ERASE_HALF).toBe(STRIP.w);
    for (let x = KNOB.min; x <= KNOB.max; x += 53) {
      const left = STRIP.x + stripShift(x) - INK.x; // borda esquerda da faixa, em coords da tinta
      expect(knobToInkX(x) - ERASE_HALF).toBeCloseTo(left, 9);
    }
  });

  it('a caneta na mão, em qualquer canto permitido, mantém o cordão dentro do canvas dele', () => {
    for (const x of [HELD_BOUNDS.x0, HELD_BOUNDS.x1])
      for (const y of [HELD_BOUNDS.y0, HELD_BOUNDS.y1]) {
        const foot = penFoot({ x, y, rot: PEN_HELD_ROT });
        expect(foot.x).toBeGreaterThanOrEqual(CORD_CANVAS.x);
        expect(foot.x).toBeLessThanOrEqual(CORD_CANVAS.x + CORD_CANVAS.w);
        expect(foot.y).toBeGreaterThanOrEqual(CORD_CANVAS.y);
        expect(foot.y).toBeLessThanOrEqual(CORD_CANVAS.y + CORD_CANVAS.h);
      }
  });

  it('o suporte da caneta envolve a caneta em repouso', () => {
    expect(onHolder({ x: PEN.x + PEN.w / 2, y: PEN.y + PEN.h / 2 })).toBe(true);
    expect(onHolder(PEN_REST)).toBe(true);
    expect(onHolder({ x: INK.x + INK.w / 2, y: INK.y + INK.h / 2 })).toBe(false);
  });

  it('em repouso o pé da caneta fica embaixo da ponta; na mão, sobe para a direita', () => {
    const rest = penFoot(PEN_REST);
    expect(rest.x).toBeCloseTo(PEN_REST.x, 5);
    expect(rest.y).toBeGreaterThan(PEN_REST.y);
    const held = penFoot({ x: 400, y: 300, rot: PEN_HELD_ROT });
    expect(held.x).toBeGreaterThan(400);
    expect(held.y).toBeLessThan(300);
  });
});

describe('glifos', () => {
  it.each(TOOLS)('%s cabe na tela, com margem para o pincel', (tool) => {
    const strokes = glyph(tool);
    expect(strokes.length).toBeGreaterThan(0);
    for (const s of strokes) {
      expect(s.length).toBeGreaterThan(1);
      for (const pt of s) {
        expect(insideInk({ x: pt.x - 12, y: pt.y - 12 })).toBe(true);
        expect(insideInk({ x: pt.x + 12, y: pt.y + 12 })).toBe(true);
      }
    }
  });

  it.each(TOOLS)('%s é contínuo (pontos a no máximo ~3px)', (tool) => {
    for (const s of glyph(tool)) {
      for (let i = 1; i < s.length; i++) expect(Math.hypot(s[i].x - s[i - 1].x, s[i].y - s[i - 1].y)).toBeLessThan(3.5);
    }
  });

  it('cada ícone tem um comprimento que dá para desenhar em poucos segundos', () => {
    for (const tool of TOOLS) {
      const total = glyph(tool).reduce((a, s) => a + strokeLength(s), 0);
      expect(total).toBeGreaterThan(300);
      expect(total).toBeLessThan(3200);
    }
  });

  it('o tremor é determinístico', () => {
    expect(glyph('figma')).toEqual(glyph('figma'));
    const a = rng(3), b = rng(3);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe('pincéis', () => {
  it('cada ferramenta tem o pincel do seu frame no Figma', () => {
    const name = (t: (typeof TOOLS)[number]) => TOOL_BRUSH[t].image;
    expect(name('figma')).toBe('doo-wop');
    expect(name('animate')).toBe('doo-wop');
    expect(name('illustrator')).toBe('noir');
    expect(name('ae')).toBe('new-wave');
    expect(name('clipstudio')).toBe('shoegaze');
    expect(name('photoshop')).toBe('propaganda');
    expect(name('blender')).toBe('rom-com');
    expect(name('indesign')).toBe('witch-house');
    // o Animate é o doo wop espaçado e com textura; o Figma, o doo wop cheio
    const fig = TOOL_BRUSH.figma as ScatterBrush, ani = TOOL_BRUSH.animate as ScatterBrush;
    expect(fig.texture).toBeUndefined();
    expect(ani.texture).toBeDefined();
    expect(stampSpacing(ani)).toBeGreaterThan(stampSpacing(fig) * 4);
  });

  it('as imagens dos pincéis existem em public/', () => {
    for (const src of Object.values(BRUSH_IMAGES)) expect(existsSync(join(process.cwd(), 'public', src))).toBe(true);
  });

  it('o carimbo cai dentro do deslocamento, do tamanho e do ângulo do pincel', () => {
    for (const tool of ['clipstudio', 'indesign', 'figma'] as const) {
      const b = TOOL_BRUSH[tool] as ScatterBrush;
      const rand = rng(11);
      for (let i = 0; i < 500; i++) {
        const tangent = (i / 500) * Math.PI * 2;
        const pl = placeStamp(b, tangent, rand);
        expect(Math.abs(pl.side)).toBeLessThanOrEqual(b.wiggle * BRUSH_WEIGHT + 1e-9);
        expect(Math.abs(pl.along)).toBeLessThanOrEqual(b.wiggle * BRUSH_WEIGHT * 0.5 + 1e-9);
        expect(pl.scale).toBeGreaterThanOrEqual(MIN_STAMP_SCALE);
        expect(pl.scale).toBeLessThanOrEqual(1 + b.sizeJitter + 1e-9);
        const rel = (((pl.angle - tangent) * 180) / Math.PI - b.rotation) % 360;
        const wrapped = ((rel + 540) % 360) - 180;
        expect(Math.abs(wrapped)).toBeLessThanOrEqual(b.angularJitter + 1e-6);
      }
    }
  });

  it('o carimbo sai a cada passo, com a direção do traço, e o ao vivo bate com o replay', () => {
    const pts = Array.from({ length: 101 }, (_, i) => ({ x: i * 2, y: 0 }));
    const live: [number, number][] = [];
    const w1 = new StampWalker(5);
    for (const p of pts) w1.walk([p], (q, a) => live.push([q.x, a]));
    w1.flush((q, a) => live.push([q.x, a]));
    const replay: [number, number][] = [];
    const w2 = new StampWalker(5);
    w2.walk(pts, (q, a) => replay.push([q.x, a]));
    w2.flush((q, a) => replay.push([q.x, a]));
    expect(live).toEqual(replay);
    expect(live.map(([x]) => x)).toEqual(Array.from({ length: 41 }, (_, i) => i * 5));
    expect(live.every(([, a]) => a === 0)).toBe(true);
    // um toque sem arrastar deixa um carimbo
    const dot: number[] = [];
    const w3 = new StampWalker(5);
    w3.walk([{ x: 3, y: 4 }], () => dot.push(1));
    w3.flush(() => dot.push(1));
    expect(dot).toHaveLength(1);
  });

  it('a faixa esticada segue a polilinha e alisa a direção nas quinas', () => {
    const pts = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }];
    const cum = cumulative(pts);
    expect(cum).toEqual([0, 10, 20]);
    expect(pointAt(pts, cum, 15)).toEqual({ x: 10, y: 5 });
    expect(pointAt(pts, cum, -3)).toEqual(pts[0]);
    expect(pointAt(pts, cum, 99)).toEqual(pts[2]);
    expect(tangentAt(pts, cum, 2, 1)).toBeCloseTo(0, 9);
    expect(tangentAt(pts, cum, 18, 1)).toBeCloseTo(Math.PI / 2, 9);
    expect(tangentAt(pts, cum, 10, 3)).toBeCloseTo(Math.PI / 4, 9); // na quina, a média
  });

  it('o ruído da textura é determinístico e fica em [-1, 1]', () => {
    for (let i = 0; i < 200; i++) {
      const v = fractalNoise(i * 0.37, i * 0.11, 1);
      expect(v).toBeGreaterThanOrEqual(-1);
      expect(v).toBeLessThanOrEqual(1);
      expect(fractalNoise(i * 0.37, i * 0.11, 1)).toBe(v);
    }
    expect(fractalNoise(1.3, 2.7, 1)).not.toBe(fractalNoise(1.3, 2.7, 7));
  });
});

describe('som da lousa', () => {
  it('fica mudo parado e satura na velocidade de referência', async () => {
    const { level } = await import('./sound');
    expect(level(0, 900)).toBe(0);
    expect(level(-5, 900)).toBe(0);
    expect(level(Number.NaN, 900)).toBe(0);
    expect(level(900, 900)).toBe(1);
    expect(level(5000, 900)).toBe(1);
    const slow = level(100, 900), mid = level(450, 900);
    expect(slow).toBeGreaterThan(0);
    expect(mid).toBeGreaterThan(slow);
    expect(mid).toBeGreaterThan(0.5); // curva ^0.6: um traço lento já se ouve
  });
});
