/** Interpolação com requestAnimationFrame, cancelável por AbortSignal (o projeto usa CSS + rAF). */

export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const easeOut = (t: number) => 1 - (1 - t) ** 3;
export const linear = (t: number) => t;

/** Resolve `true` ao terminar, `false` se abortado. `onFrame` recebe o progresso já suavizado. */
export function tween(
  ms: number,
  onFrame: (e: number, t: number) => void,
  signal: AbortSignal,
  ease: (t: number) => number = easeInOut,
): Promise<boolean> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve(false);
    if (ms <= 0) {
      onFrame(1, 1);
      return resolve(true);
    }
    const start = performance.now();
    let id = 0;
    const abort = () => {
      cancelAnimationFrame(id);
      resolve(false);
    };
    signal.addEventListener('abort', abort, { once: true });
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      onFrame(ease(t), t);
      if (t < 1) id = requestAnimationFrame(frame);
      else {
        signal.removeEventListener('abort', abort);
        resolve(true);
      }
    };
    id = requestAnimationFrame(frame);
  });
}

/** Chama `onFrame(dt em s)` a cada quadro até `onFrame` devolver false ou o sinal abortar. */
export function loop(onFrame: (dt: number) => boolean, signal: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve(false);
    let prev = performance.now();
    let id = 0;
    const abort = () => {
      cancelAnimationFrame(id);
      resolve(false);
    };
    signal.addEventListener('abort', abort, { once: true });
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      if (onFrame(dt)) id = requestAnimationFrame(frame);
      else {
        signal.removeEventListener('abort', abort);
        resolve(true);
      }
    };
    id = requestAnimationFrame(frame);
  });
}

export const wait = (ms: number, signal: AbortSignal) => tween(ms, () => {}, signal, linear);
