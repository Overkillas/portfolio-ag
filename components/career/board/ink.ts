import {
  BRUSH_WEIGHT,
  placeStamp,
  stampSpacing,
  type Brush,
  type BrushImage,
  type ScatterBrush,
  type StretchBrush,
} from './brushes';
import { CORD_COLOR, CORD_SPACING, CORD_STAMP, ERASE_FEATHER, ERASE_HALF, INK, INK_COLOR, type Pt } from './geometry';
import { applyTexture } from './texture';

/**
 * Motor da tinta da lousa (canvas 2D).
 *
 * Cada traço sai com o pincel da ferramenta (brushes.ts), na cor #B7CAEA:
 *  - scatter: o carimbo do Figma repetido ao longo do traço (passo, deslocamento, tamanho
 *    e ângulo do pincel); como no Figma (máscara com vários <use>), carimbos sobrepostos
 *    somam cobertura, não cor. O Animate ainda passa cada carimbo pela textura.
 *  - stretch: a faixa do pincel esticada no comprimento inteiro do traço, desenhada em
 *    fatias de 1 px que seguem a tangente (média em ± meia espessura, para as quinas não
 *    abrirem). No desenho automático o comprimento é conhecido e a faixa sai aos poucos;
 *    à mão, o traço é redesenhado a cada quadro esticado no comprimento até ali (como no
 *    Figma, que estica a faixa enquanto se desenha).
 *
 * Tudo é guardado como operações em coordenadas da tela (891.5 × 532): no resize o
 * canvas é refeito nítido no novo tamanho (replay), com os mesmos carimbos (semente).
 */

type StrokeOp = { t: 'stroke'; pts: Pt[]; seed: number; brush: Brush; total?: number };
type Op = { t: 'image'; img: CanvasImageSource } | StrokeOp | { t: 'erase'; x0: number; x1: number };

const INK_RGB = [1, 3, 5].map((i) => parseInt(INK_COLOR.slice(i, i + 2), 16)) as [number, number, number];

/** PRNG pequeno e determinístico (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Imagem tingida (o branco do pincel vira `color`) no tamanho dado, em px de dispositivo. */
function tinted(img: CanvasImageSource, w: number, h: number, color: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.ceil(w));
  c.height = Math.max(2, Math.ceil(h));
  const g = c.getContext('2d')!;
  g.imageSmoothingQuality = 'high';
  g.drawImage(img, 0, 0, c.width, c.height);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = color;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}

/**
 * Caminhante de carimbos: espalha carimbos a cada `spacing` px ao longo dos pontos, levando
 * a sobra de distância entre chamadas — o traço ao vivo e o replay dão o mesmo resultado.
 * O primeiro carimbo espera o segundo ponto, para já sair com a direção do traço.
 */
export class StampWalker {
  private carry = 0;
  private last: Pt | null = null;
  private pending = false;
  constructor(private readonly spacing: number) {}

  walk(pts: Pt[], put: (p: Pt, tangent: number) => void) {
    for (const pt of pts) {
      if (!this.last) {
        this.last = pt;
        this.pending = true;
        continue;
      }
      const dx = pt.x - this.last.x, dy = pt.y - this.last.y;
      const len = Math.hypot(dx, dy);
      if (len === 0) continue;
      const tangent = Math.atan2(dy, dx);
      if (this.pending) {
        put(this.last, tangent);
        this.pending = false;
      }
      let d = this.spacing - this.carry;
      while (d <= len) {
        put({ x: this.last.x + (dx * d) / len, y: this.last.y + (dy * d) / len }, tangent);
        d += this.spacing;
      }
      this.carry = len - (d - this.spacing);
      this.last = pt;
    }
  }

  /** Fim do traço: um toque sem arrastar ainda deixa o seu carimbo. */
  flush(put: (p: Pt, tangent: number) => void) {
    if (this.pending && this.last) put(this.last, 0);
    this.pending = false;
  }
}

/** Comprimentos acumulados de uma polilinha. */
export function cumulative(pts: Pt[]): number[] {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  return cum;
}

/** Ponto a `s` px do início da polilinha (presa às pontas). */
export function pointAt(pts: Pt[], cum: number[], s: number): Pt {
  const n = pts.length;
  if (s <= 0 || n === 1) return pts[0];
  if (s >= cum[n - 1]) return pts[n - 1];
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= s) lo = mid;
    else hi = mid;
  }
  const seg = cum[hi] - cum[lo];
  const t = seg > 0 ? (s - cum[lo]) / seg : 0;
  return { x: pts[lo].x + (pts[hi].x - pts[lo].x) * t, y: pts[lo].y + (pts[hi].y - pts[lo].y) * t };
}

/** Direção do traço em `s`: a corda de s − r a s + r (quinas viram leque, não fenda). */
export function tangentAt(pts: Pt[], cum: number[], s: number, r: number): number {
  const a = pointAt(pts, cum, s - r), b = pointAt(pts, cum, s + r);
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/** Passo das fatias da faixa esticada, em px de design. */
const SLICE = 1;

type Live =
  | { kind: 'scatter'; op: StrokeOp; walker: StampWalker; rand: () => number }
  | { kind: 'stretch'; op: StrokeOp; cum: number[]; done: number; snapshot: HTMLCanvasElement | null; frame: number };

export class Ink {
  private readonly ctx: CanvasRenderingContext2D;
  private ops: Op[] = [];
  private scale = 1; // px de dispositivo por px de design
  private cache = new Map<BrushImage, HTMLCanvasElement>();
  private live: Live | null = null;
  private seed = 1;
  private scratch: HTMLCanvasElement | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly images: Record<BrushImage, HTMLImageElement>,
  ) {
    this.ctx = canvas.getContext('2d')!;
  }

  /** `cssWidth`: largura do canvas na tela, em px CSS. */
  resize(cssWidth: number) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const k = cssWidth / INK.w;
    this.scale = k * dpr;
    this.canvas.width = Math.max(1, Math.round(INK.w * this.scale));
    this.canvas.height = Math.max(1, Math.round(INK.h * this.scale));
    this.cache.clear(); // os carimbos são tingidos no tamanho de tela
    this.replay();
  }

  image(img: CanvasImageSource) {
    const op: Op = { t: 'image', img };
    this.ops.push(op);
    this.apply(op);
  }

  /**
   * Começa um traço com `brush`. `total`: o comprimento final, quando já se sabe (o
   * desenho automático) — a faixa esticada então sai aos poucos, sem redesenhar.
   */
  beginStroke(pt: Pt, brush: Brush, total?: number) {
    this.endStroke();
    const op: StrokeOp = { t: 'stroke', pts: [], seed: this.seed++, brush, total };
    this.ops.push(op);
    this.live =
      brush.kind === 'scatter'
        ? { kind: 'scatter', op, walker: new StampWalker(stampSpacing(brush)), rand: rng(op.seed) }
        : { kind: 'stretch', op, cum: [], done: 0, snapshot: total === undefined ? this.snapshot() : null, frame: 0 };
    this.extend(pt);
  }

  extend(pt: Pt) {
    const live = this.live;
    if (!live) return;
    live.op.pts.push(pt);
    if (live.kind === 'scatter') {
      const b = live.op.brush as ScatterBrush;
      live.walker.walk([pt], (q, a) => this.stamp(b, q, a, live.rand));
      return;
    }
    const { cum, op } = live;
    const n = op.pts.length;
    cum.push(n === 1 ? 0 : cum[n - 2] + Math.hypot(pt.x - op.pts[n - 2].x, pt.y - op.pts[n - 2].y));
    if (op.total !== undefined) {
      // a faixa anda meia espessura atrás da ponta: a tangente precisa do que vem depois
      const upTo = Math.floor((cum[n - 1] - BRUSH_WEIGHT / 2) / SLICE) * SLICE;
      if (upTo > live.done) {
        this.stretch(op, cum, live.done, upTo, op.total);
        live.done = upTo;
      }
    } else if (!live.frame) {
      // à mão: um redesenho por quadro, por mais eventos que cheguem
      live.frame = requestAnimationFrame(() => {
        live.frame = 0;
        if (this.live === live) this.redrawFreehand(live);
      });
    }
  }

  endStroke() {
    const live = this.live;
    if (!live) return;
    this.live = null;
    if (live.kind === 'scatter') {
      const b = live.op.brush as ScatterBrush;
      live.walker.flush((q, a) => this.stamp(b, q, a, live.rand));
      return;
    }
    const length = live.cum[live.cum.length - 1] ?? 0;
    if (live.op.total === undefined) {
      cancelAnimationFrame(live.frame);
      live.op.total = length;
      this.redrawFreehand(live);
    } else {
      // o desenho automático pode parar antes do previsto (é só um arredondamento)
      this.stretch(live.op, live.cum, live.done, Math.max(live.done, length), live.op.total);
    }
  }

  /** Apaga a faixa vertical varrida pela régua entre as colunas x0 e x1 (coords da tela). */
  erase(x0: number, x1: number) {
    const op: Op = { t: 'erase', x0, x1 };
    this.ops.push(op);
    this.apply(op);
  }

  /** Lousa limpa e log vazio (depois de uma varredura completa). */
  clear() {
    if (this.live?.kind === 'stretch') cancelAnimationFrame(this.live.frame);
    this.ops = [];
    this.live = null;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** Há tinta em algum lugar? (para a verificação e para pular a varredura vazia) */
  get isEmpty(): boolean {
    return this.ops.every((o) => o.t === 'erase');
  }

  private replay() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const live = this.live;
    for (const op of this.ops) {
      if (live && op === live.op) {
        // o traço vivo é sempre o último: refaz só o que já tinha saído
        if (live.kind === 'scatter') this.replayScatter(op, false);
        else if (op.total !== undefined) {
          this.stretch(op, live.cum, 0, live.done, op.total);
        } else {
          live.snapshot = this.snapshot();
          this.redrawFreehand(live);
        }
      } else this.apply(op);
    }
  }

  private apply(op: Op) {
    const g = this.ctx, k = this.scale;
    if (op.t === 'image') {
      g.setTransform(k, 0, 0, k, 0, 0);
      g.globalCompositeOperation = 'source-over';
      g.drawImage(op.img, 0, 0, INK.w, INK.h);
    } else if (op.t === 'stroke') {
      if (op.brush.kind === 'scatter') this.replayScatter(op, true);
      else {
        const cum = cumulative(op.pts);
        const length = cum[cum.length - 1];
        this.stretch(op, cum, 0, length, op.total ?? length);
      }
    } else {
      const lo = Math.min(op.x0, op.x1) - ERASE_HALF, hi = Math.max(op.x0, op.x1) + ERASE_HALF;
      g.setTransform(k, 0, 0, k, 0, 0);
      g.globalCompositeOperation = 'destination-out';
      const grad = g.createLinearGradient(lo - ERASE_FEATHER, 0, hi + ERASE_FEATHER, 0);
      const w = hi - lo + 2 * ERASE_FEATHER;
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(ERASE_FEATHER / w, 'rgba(0,0,0,1)');
      grad.addColorStop(1 - ERASE_FEATHER / w, 'rgba(0,0,0,1)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad;
      g.fillRect(lo - ERASE_FEATHER, -2, w, INK.h + 4);
      g.globalCompositeOperation = 'source-over';
    }
  }

  private replayScatter(op: StrokeOp, finished: boolean) {
    const b = op.brush as ScatterBrush;
    const rand = rng(op.seed);
    const walker = new StampWalker(stampSpacing(b));
    const put = (q: Pt, a: number) => this.stamp(b, q, a, rand);
    walker.walk(op.pts, put);
    if (finished) walker.flush(put);
  }

  // ---------- scatter ----------

  /** Carimbo tingido do pincel, grande o bastante para o maior `sizeJitter`. */
  private stampImage(b: ScatterBrush): HTMLCanvasElement {
    let c = this.cache.get(b.image);
    if (!c) {
      const n = BRUSH_WEIGHT * this.scale * (1 + b.sizeJitter);
      c = tinted(this.images[b.image], n, n, INK_COLOR);
      this.cache.set(b.image, c);
    }
    return c;
  }

  private stamp(b: ScatterBrush, p: Pt, tangent: number, rand: () => number) {
    const pl = placeStamp(b, tangent, rand);
    const c = Math.cos(tangent), s = Math.sin(tangent);
    const x = p.x + c * pl.along - s * pl.side;
    const y = p.y + s * pl.along + c * pl.side;
    const img = this.stampImage(b);
    const k = this.scale, d = BRUSH_WEIGHT * pl.scale * k;
    if (b.texture) return this.texturedStamp(b.texture, img, x, y, pl.angle, d);
    const g = this.ctx;
    g.globalCompositeOperation = 'source-over';
    g.setTransform(Math.cos(pl.angle), Math.sin(pl.angle), -Math.sin(pl.angle), Math.cos(pl.angle), x * k, y * k);
    g.drawImage(img, -d / 2, -d / 2, d, d);
  }

  /** O carimbo passa pela textura num recorte à parte e depois vai para a tela. */
  private texturedStamp(tex: { radius: number; noiseSize: number }, img: HTMLCanvasElement, x: number, y: number, angle: number, d: number) {
    const k = this.scale;
    const n = Math.ceil(d + 2 * tex.radius * k + 4);
    const sc = (this.scratch ??= document.createElement('canvas'));
    if (sc.width !== n || sc.height !== n) sc.width = sc.height = n;
    const sg = sc.getContext('2d', { willReadFrequently: true })!;
    sg.setTransform(1, 0, 0, 1, 0, 0);
    sg.clearRect(0, 0, n, n);
    sg.setTransform(Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), n / 2, n / 2);
    sg.drawImage(img, -d / 2, -d / 2, d, d);
    sg.setTransform(1, 0, 0, 1, 0, 0);
    const src = sg.getImageData(0, 0, n, n);
    const out = sg.createImageData(n, n);
    const ox = x - n / 2 / k, oy = y - n / 2 / k;
    applyTexture(src.data, out.data, n, n, (i, j) => ({ x: ox + i / k, y: oy + j / k }), tex.radius, tex.noiseSize, k, INK_RGB);
    sg.putImageData(out, 0, 0);
    const g = this.ctx;
    g.globalCompositeOperation = 'source-over';
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(sc, x * k - n / 2, y * k - n / 2);
  }

  // ---------- stretch ----------

  /** A faixa tingida no tamanho original da imagem (a escala sai no drawImage). */
  private stripImage(b: StretchBrush): HTMLCanvasElement {
    let c = this.cache.get(b.image);
    if (!c) {
      const src = this.images[b.image];
      c = tinted(src, src.naturalWidth, src.naturalHeight, INK_COLOR);
      this.cache.set(b.image, c);
    }
    return c;
  }

  /** Fatias da faixa entre os comprimentos `from` e `to`, com a faixa inteira em `total`. */
  private stretch(op: StrokeOp, cum: number[], from: number, to: number, total: number) {
    if (total <= 0 || to <= from) return;
    const img = this.stripImage(op.brush as StretchBrush);
    const g = this.ctx, k = this.scale, half = BRUSH_WEIGHT / 2;
    const sw = img.width / total;
    const seam = 0.75 / k; // as fatias se sobrepõem ~¾ px de tela, para não abrir fresta
    g.globalCompositeOperation = 'source-over';
    for (let s = from; s < to; s += SLICE) {
      const e = Math.min(to, s + SLICE);
      const p = pointAt(op.pts, cum, s);
      const a = tangentAt(op.pts, cum, s + (e - s) / 2, half);
      const c = Math.cos(a) * k, n = Math.sin(a) * k;
      g.setTransform(c, n, -n, c, p.x * k, p.y * k);
      const sx = Math.min(img.width - 0.01, s * sw);
      g.drawImage(img, sx, 0, Math.max(0.01, Math.min(img.width - sx, (e - s) * sw)), img.height, 0, -half, e - s + seam, BRUSH_WEIGHT);
    }
  }

  private snapshot(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = this.canvas.width;
    c.height = this.canvas.height;
    c.getContext('2d')!.drawImage(this.canvas, 0, 0);
    return c;
  }

  /** À mão: volta a tela de antes do traço e estica a faixa no comprimento até aqui. */
  private redrawFreehand(live: Extract<Live, { kind: 'stretch' }>) {
    const g = this.ctx;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (live.snapshot) g.drawImage(live.snapshot, 0, 0);
    const length = live.cum[live.cum.length - 1] ?? 0;
    this.stretch(live.op, live.cum, 0, length, live.op.total ?? length);
  }
}

/** O cordão da caneta quando ela sai do suporte: carimbos creme numa curva que cede. */
export class CordPainter {
  private readonly ctx: CanvasRenderingContext2D;
  private scale = 1;
  private stamp: HTMLCanvasElement | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly brush: CanvasImageSource,
    /** origem do canvas em coordenadas B, e tamanho em px de design */
    private readonly box: { x: number; y: number; w: number; h: number },
  ) {
    this.ctx = canvas.getContext('2d')!;
  }

  resize(cssWidth: number) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.scale = (cssWidth / this.box.w) * dpr;
    this.canvas.width = Math.max(1, Math.round(this.box.w * this.scale));
    this.canvas.height = Math.max(1, Math.round(this.box.h * this.scale));
    const n = CORD_STAMP * this.scale;
    this.stamp = tinted(this.brush, n, n, CORD_COLOR);
  }

  clear() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** `from` (onde sai da lousa) até `to` (pé da caneta), ambos em B. */
  draw(from: Pt, to: Pt) {
    this.clear();
    const s = this.stamp;
    if (!s) return;
    const d = Math.hypot(to.x - from.x, to.y - from.y);
    const sag = Math.max(24, 150 - d * 0.12);
    const c = { x: (from.x + to.x) / 2 + (to.x - from.x) * 0.1, y: Math.max(from.y, to.y) + sag };
    const n = Math.max(2, Math.ceil(d / CORD_SPACING) + 4);
    const g = this.ctx, k = this.scale, rand = rng(7);
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      const x = u * u * from.x + 2 * u * t * c.x + t * t * to.x - this.box.x;
      const y = u * u * from.y + 2 * u * t * c.y + t * t * to.y - this.box.y;
      const r = rand() * Math.PI * 2, co = Math.cos(r), si = Math.sin(r);
      g.setTransform(co, si, -si, co, x * k, y * k);
      g.drawImage(s, -s.width / 2, -s.height / 2);
    }
  }
}
