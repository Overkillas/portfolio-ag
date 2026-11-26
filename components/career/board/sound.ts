import type { Pt } from './geometry';

/**
 * O som da lousa mágica: a ponta de plástico riscando a tela e a régua (bolinha) correndo
 * por cima dela. Cada som é um loop curto (public/sounds/carreira, recortes CC0 do
 * Freesound — ver o README da pasta) que toca sem parar enquanto há movimento; o volume e
 * o tom seguem a velocidade, e o som some sozinho ~90 ms depois do último movimento
 * (parar a mão sem soltar o botão = silêncio, como na lousa de verdade).
 *
 * O AudioContext só nasce no primeiro pointerdown/keydown da página (política de autoplay)
 * e os arquivos só são baixados aí — antes disso `at`/`up` não fazem nada.
 */

const SOURCES = { pen: '/sounds/carreira/caneta.wav', eraser: '/sounds/carreira/apagador.wav' } as const;
export type BoardVoice = keyof typeof SOURCES;

/** ref: velocidade (px de design/s) em que o som chega ao volume cheio */
const TUNING: Record<BoardVoice, { ref: number; vol: number; rate: readonly [number, number] }> = {
  pen: { ref: 900, vol: 0.55, rate: [0.9, 1.15] },
  eraser: { ref: 1100, vol: 0.6, rate: [0.85, 1.2] },
};

const MASTER = 0.8;
/** depois do último movimento, quanto o som ainda dura antes de sumir */
const HOLD = 0.09;
/** fonte parada depois de tanto tempo em silêncio (poupa CPU) */
const IDLE_MS = 700;

/** 0…1 a partir da velocidade: sobe rápido no começo (curva ^0.6) e satura em `ref`. */
export function level(speed: number, ref: number): number {
  if (!(speed > 0)) return 0;
  return Math.min(1, speed / ref) ** 0.6;
}

class Voice {
  private src: AudioBufferSourceNode | null = null;
  private readonly gain: GainNode;
  private last: (Pt & { t: number }) | null = null;
  private idle = 0;

  constructor(
    private readonly ctx: AudioContext,
    out: AudioNode,
    private readonly buf: AudioBuffer,
    private readonly tune: (typeof TUNING)[BoardVoice],
  ) {
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(out);
  }

  /** A ponta (ou a bolinha) está em `p`: a velocidade sai da distância até a última posição. */
  at(p: Pt) {
    const now = performance.now();
    const last = this.last;
    if (!last) {
      this.last = { ...p, t: now };
      return;
    }
    const dt = (now - last.t) / 1000;
    if (dt < 0.012) return; // eventos coalescidos: acumula até ter um intervalo medível
    this.last = { ...p, t: now };
    this.drive(Math.hypot(p.x - last.x, p.y - last.y) / dt);
  }

  /** Ponta levantada: o som cai logo e o próximo `at` recomeça a medida. */
  up() {
    this.last = null;
    if (!this.src) return;
    const t = this.ctx.currentTime, g = this.gain.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.setTargetAtTime(0, t, 0.03);
  }

  private drive(speed: number) {
    const k = level(speed, this.tune.ref);
    if (k === 0 && !this.src) return;
    if (!this.src) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.buf;
      src.loop = true;
      src.connect(this.gain);
      src.start(0, Math.random() * this.buf.duration); // cada traço começa num ponto do loop
      this.src = src;
    }
    const t = this.ctx.currentTime, g = this.gain.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.setTargetAtTime(this.tune.vol * k, t, 0.025);
    g.setTargetAtTime(0, t + HOLD, 0.05);
    const [lo, hi] = this.tune.rate;
    this.src.playbackRate.setTargetAtTime(lo + (hi - lo) * k, t, 0.05);
    window.clearTimeout(this.idle);
    this.idle = window.setTimeout(() => this.stop(), IDLE_MS);
  }

  stop() {
    window.clearTimeout(this.idle);
    this.src?.stop();
    this.src?.disconnect();
    this.src = null;
  }
}

export class BoardSound {
  private ctx: AudioContext | null = null;
  private voices: Partial<Record<BoardVoice, Voice>> = {};
  private disarm: (() => void) | null = null;
  private disposed = false;

  /** Espera o primeiro gesto na página para criar o áudio; devolve a limpeza. */
  arm(): () => void {
    this.disposed = false;
    const wake = () => this.wake();
    const opts = { capture: true, passive: true } as const;
    window.addEventListener('pointerdown', wake, opts);
    window.addEventListener('keydown', wake, opts);
    this.disarm = () => {
      window.removeEventListener('pointerdown', wake, opts);
      window.removeEventListener('keydown', wake, opts);
    };
    return () => this.dispose();
  }

  at(voice: BoardVoice, p: Pt) {
    this.voices[voice]?.at(p);
  }

  up(voice: BoardVoice) {
    this.voices[voice]?.up();
  }

  private wake() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const AC =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;
    const master = ctx.createGain();
    master.gain.value = MASTER;
    master.connect(ctx.destination);
    for (const name of Object.keys(SOURCES) as BoardVoice[]) {
      fetch(SOURCES[name])
        .then((r) => r.arrayBuffer())
        .then((data) => ctx.decodeAudioData(data))
        .then((buf) => {
          if (!this.disposed) this.voices[name] = new Voice(ctx, master, buf, TUNING[name]);
        })
        .catch(() => {}); // sem som: a lousa continua funcionando igual
    }
  }

  private dispose() {
    this.disposed = true;
    this.disarm?.();
    this.disarm = null;
    for (const v of Object.values(this.voices)) v.stop();
    this.voices = {};
    void this.ctx?.close();
    this.ctx = null;
  }
}
